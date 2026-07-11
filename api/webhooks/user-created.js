 // api/webhooks/user-created.js
//
// POST /api/webhooks/user-created
//
// Fires on INSERT into public.users, via the SQL-based trigger
// (notify_user_created) since Supabase's dashboard webhook UI has a
// known provisioning bug for this project. The trigger sends a static
// x-supabase-signature header value — this is a direct string comparison
// against that value, not an HMAC signature check.
//
// Env vars required: SUPABASE_WEBHOOK_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

export const config = { runtime: 'edge' };

import { sbSelect, sbUpdate } from '../../lib/supabase.js';
import { sendIndividualWelcomeEmail } from '../../lib/resend.js';
import { finalizeMemberJoin } from '../../lib/orgMembership.js';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function timingSafeEqual(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export default async function handler(req) {
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405);

  const receivedSecret = req.headers.get('x-supabase-signature');
  const valid = timingSafeEqual(receivedSecret, process.env.SUPABASE_WEBHOOK_SECRET);
  if (!valid) return json({ error: 'invalid signature' }, 401);

  const body = await req.json();
  const record = body.record;
  const userId = record.id;
  const email = record.email;
  const firstName = record.name || email?.split('@')[0] || '';

  const existingRows = await sbSelect(`users?id=eq.${userId}&select=welcome_email_sent_at`);
  if (existingRows[0]?.welcome_email_sent_at) {
    return json({ skipped: 'already sent' });
  }

  const membership = await finalizeMemberJoin({ userId, email });

  try {
    if (!membership) {
      await sendIndividualWelcomeEmail({ toEmail: email, firstName });
    }

    await sbUpdate('users', `id=eq.${userId}`, { welcome_email_sent_at: new Date().toISOString() });

    return json({ sent: !membership, joinedOrg: !!membership });
  } catch (err) {
    console.error('[user-created webhook] welcome email send failed for', email, err);
    return json({ error: 'send failed' }, 500);
  }
}
