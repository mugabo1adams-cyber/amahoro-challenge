 // api/org/checkout.js
//
// POST /api/org/checkout
// Body: { userId, email, orgName, billingCycle: "monthly" | "annual" }
//
// Called by the "Subscribe" button in ProScreen (App.jsx). Starts a real
// Paystack subscription and returns the checkout URL to redirect to.
//
// Setup required in Paystack Dashboard (Products > Plans) BEFORE this works:
//   1. Create plan "Amahoro Organizations — Monthly": $150, interval = monthly
//   2. Create plan "Amahoro Organizations — Annual": $1500, interval = annually
//   Copy each plan's code into the env vars below.
//
// Env vars required (Vercel Project Settings > Environment Variables):
//   PAYSTACK_SECRET_KEY, PAYSTACK_PLAN_MONTHLY, PAYSTACK_PLAN_ANNUAL, APP_URL

export const config = { runtime: 'edge' };

import { sbInsert } from '../../lib/supabase.js';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export default async function handler(req) {
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405);

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'invalid JSON' }, 400);
  }

  const { userId, email, orgName, billingCycle } = body || {};

  if (!userId || !email || !orgName || !['monthly', 'annual'].includes(billingCycle)) {
    return json({ error: 'missing or invalid fields' }, 400);
  }

  const planCode =
    billingCycle === 'monthly'
      ? process.env.PAYSTACK_PLAN_MONTHLY
      : process.env.PAYSTACK_PLAN_ANNUAL;

  if (!planCode) {
    console.error('[org checkout] missing plan code env var for', billingCycle);
    return json({ error: 'billing not configured yet' }, 500);
  }

  let org;
  try {
    org = await sbInsert('organizations', {
      name: orgName,
      owner_id: userId,
      billing_cycle: billingCycle,
      status: 'pending',
      paystack_plan_code: planCode,
    });
  } catch (err) {
    console.error('[org checkout] failed to create pending org:', err);
    return json({ error: 'could not start checkout' }, 500);
  }

  try {
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        plan: planCode,
        currency: 'KES',
        callback_url: process.env.APP_URL,
        metadata: {
          organization_id: org.id,
          user_id: userId,
          org_name: orgName,
          billing_cycle: billingCycle,
        },
      }),
    });

    const result = await response.json();

    if (!result.status) {
      console.error('[org checkout] paystack init failed:', result);
      return json({ error: 'paystack init failed' }, 502);
    }

    return json({
      authorizationUrl: result.data.authorization_url,
      reference: result.data.reference,
      organizationId: org.id,
    });
  } catch (err) {
    console.error('[org checkout] error calling paystack:', err);
    return json({ error: 'checkout failed' }, 500);
  }
}
