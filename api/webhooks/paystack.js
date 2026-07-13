 // api/webhooks/paystack.js
//
// POST /api/webhooks/paystack
//
// Replaces the "we verify every payment manually within 24 hours" honor
// system. Paystack calls this the moment a payment succeeds or a
// subscription renews/fails. Set this exact URL in Paystack Dashboard
// under Settings > API Keys & Webhooks:
//
//   https://amahoro.app/api/webhooks/paystack
//
// Env vars required: PAYSTACK_SECRET_KEY

export const config = { runtime: 'edge' };

import { verifyHmac } from '../../lib/hmac.js';
import { sbUpdate, sbSelect, sbInsert } from '../../lib/supabase.js';
import { sendOrgOwnerWelcomeEmail, sendProActivatedEmail } from '../../lib/resend.js';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export default async function handler(req) {
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405);

  const rawBody = await req.text();
  const signature = req.headers.get('x-paystack-signature');

  const valid = await verifyHmac(rawBody, process.env.PAYSTACK_SECRET_KEY, signature, 'SHA-512');
  if (!valid) return json({ error: 'invalid signature' }, 401);

  const event = JSON.parse(rawBody);

  try {
    switch (event.event) {
      case 'charge.success':
        await handleChargeSuccess(event.data);
        break;
      case 'subscription.disable':
      case 'invoice.payment_failed':
        await handleSubscriptionProblem(event.data);
        break;
      default:
        break;
    }
  } catch (err) {
    console.error('[paystack webhook] handler error:', err);
  }

  return json({ received: true });
}

async function handleChargeSuccess(data) {
  const { organization_id, user_id, org_name, billing_cycle, plan_type } = data.metadata || {};

  if (organization_id) {
    await handleOrgChargeSuccess(data, { organization_id, user_id, org_name, billing_cycle });
    return;
  }

  if (plan_type === 'pro' && user_id) {
    await handleProChargeSuccess(data, user_id);
    return;
  }

  console.warn('[paystack webhook] charge.success with no matching metadata, ignored:', data.reference);
}

async function handleOrgChargeSuccess(data, { organization_id, user_id, org_name, billing_cycle }) {
  const periodDays = billing_cycle === 'annual' ? 365 : 30;
  const currentPeriodEnd = new Date(Date.now() + periodDays * 24 * 60 * 60 * 1000).toISOString();
  const subscriptionCode = data.subscription_code || data.plan_object?.subscription_code || null;

  await sbUpdate('organizations', `id=eq.${organization_id}`, {
    status: 'active',
    paystack_customer_code: data.customer?.customer_code,
    paystack_subscription_code: subscriptionCode,
    current_period_end: currentPeriodEnd,
  });

  await sbUpdate('users', `id=eq.${user_id}`, {
    is_pro: true,
    is_org: true,
    org_name,
    org_billing_cycle: billing_cycle,
  });

  const existing = await sbSelect(
    `organization_members?organization_id=eq.${organization_id}&user_id=eq.${user_id}&select=id`
  );
  if (!existing.length) {
    await sbInsert('organization_members', {
      organization_id,
      user_id,
      email: data.customer?.email,
      role: 'owner',
      status: 'joined',
      joined_at: new Date().toISOString(),
    });
  }

  await sbInsert('payments', {
    user_id,
    organization_id,
    plan: 'org',
    amount: billing_cycle === 'annual' ? 1500 : 150,
    billing_cycle,
    status: 'success',
    paystack_reference: data.reference,
  });

  const users = await sbSelect(`users?id=eq.${user_id}&select=welcome_email_sent_at,name,email`);
  const userRow = users[0];

  if (userRow && !userRow.welcome_email_sent_at) {
    try {
      await sendOrgOwnerWelcomeEmail({
        toEmail: userRow.email,
        firstName: userRow.name,
        orgName: org_name,
        plan: billing_cycle === 'annual' ? 'Organizations — Annual' : 'Organizations — Monthly',
        seatLimit: 30,
      });
      await sbUpdate('users', `id=eq.${user_id}`, { welcome_email_sent_at: new Date().toISOString() });
    } catch (err) {
      console.error('[paystack webhook] org owner welcome email failed:', err);
    }
  }
}

async function handleProChargeSuccess(data, user_id) {
  const subscriptionCode = data.subscription_code || data.plan_object?.subscription_code || null;

  await sbUpdate('users', `id=eq.${user_id}`, {
    is_pro: true,
    paystack_subscription_code: subscriptionCode,
  });

  await sbInsert('payments', {
    user_id,
    plan: 'pro',
    amount: 4,
    status: 'success',
    paystack_reference: data.reference,
  });

  const users = await sbSelect(`users?id=eq.${user_id}&select=pro_activated_email_sent_at,name,email`);
  const userRow = users[0];

  if (userRow && !userRow.pro_activated_email_sent_at) {
    try {
      await sendProActivatedEmail({ toEmail: userRow.email, firstName: userRow.name });
      await sbUpdate('users', `id=eq.${user_id}`, { pro_activated_email_sent_at: new Date().toISOString() });
    } catch (err) {
      console.error('[paystack webhook] pro activated email failed:', err);
    }
  }
}

async function handleSubscriptionProblem(data) {
  const subscriptionCode = data.subscription_code || data.subscription?.subscription_code;
  if (!subscriptionCode) return;

  const orgs = await sbSelect(
    `organizations?paystack_subscription_code=eq.${subscriptionCode}&select=id,owner_id`
  );
  if (orgs.length) {
    await sbUpdate('organizations', `id=eq.${orgs[0].id}`, { status: 'past_due' });
    await sbUpdate('users', `id=eq.${orgs[0].owner_id}`, { is_org: false });
    return;
  }

  const users = await sbSelect(`users?paystack_subscription_code=eq.${subscriptionCode}&select=id`);
  if (users.length) {
    await sbUpdate('users', `id=eq.${users[0].id}`, { is_pro: false });
  }
}
