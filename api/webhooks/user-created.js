// api/webhooks/user-created.js
//
// POST /api/webhooks/user-created
//
// Fires on INSERT into public.users (populated by OnboardingScreen.complete()
// in App.jsx). Set this up in Supabase Dashboard > Database > Webhooks:
//   Table: public.users
//   Events: INSERT
//   URL: https://amahoro.app/api/webhooks/user-created
//   Set a signing secret there and put the same value in SUPABASE_WEBHOOK_SECRET
//
// Env vars required: SUPABASE_WEBHOOK_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

export const config = { runtime: 'edge' };

import { verifyHmac } from '../../lib/hmac.js';
import { sbSelect, sbUpdate } from '../../lib/supabase.js';
import { sendIndividualWelcomeEmail } from '../../lib/resend.js';
import { finalizeMemberJoin } from '../../lib/orgMembership.js';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export default async function handler(req) {
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405);

  const rawBody = await req.text();
  const signature = req.headers.get('x-supabase-signature');

  const valid = await verifyHmac(rawBody, process.env.SUPABASE_WEBHOOK_SECRET, signature, 'SHA-256');
  if (!valid) return json({ error: 'invalid signature' }, 401);

  const body = JSON.parse(rawBody);
  const record = body.record;
  const userId = record.id;
  const email = record.email;
  const firstName = record.name || email?.split('@')[0] || '';

  const existingRows = await sbSelect(`users?id=eq.${userId}&select=welcome_email_sent_at`);
  if (existingRows[0]?.welcome_email_sent_at) {
    return json({ skipped: 'already sent' });
  }

  // If this email was already invited into an org, link them now instead
  // of treating this as a plain individual signup.
  const membership = await finalizeMemberJoin({ userId, email });

  try {
    if (!membership) {
      await sendIndividualWelcomeEmail({ toEmail: email, firstName });
    }

    await sbUpdate('users', `id=eq.${userId}`, { welcome_email_sent_at: new Date().toISOString() });

    return json({ sent: !membership, joinedOrg: !!membership });
  } catch (err) {
    console.error('[user-created webhook] welcome email send failed for', email, err);
    return json({ error: 'send failed' }, 500); // Supabase retries on 500
  }
}
