// api/cron/send-nudges.js
//
// GET /api/cron/send-nudges
//
// Runs once a day via Vercel Cron (see vercel.json). Finds users whose last
// message to Mahoro was 3-6 days ago — they had a real conversation once,
// then didn't come back — and sends one warm, no-pressure email. Anyone
// nudged in the last 14 days is skipped, so nobody gets spammed.
//
// Protected by CRON_SECRET so only Vercel's own scheduler can trigger it —
// Vercel automatically sends this as a Bearer token on scheduled runs.
//
// Env vars required: CRON_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY

export const config = { runtime: 'edge' };

import { sbRpc, sbUpdate } from '../../lib/supabase.js';
import { sendReturnNudgeEmail } from '../../lib/resend.js';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export default async function handler(req) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return json({ error: 'unauthorized' }, 401);
  }

  let candidates;
  try {
    candidates = await sbRpc('get_users_needing_nudge');
  } catch (err) {
    console.error('[send-nudges] failed to fetch candidates:', err);
    return json({ error: 'query failed' }, 500);
  }

  let sent = 0;
  let failed = 0;

  for (const u of candidates) {
    try {
      await sendReturnNudgeEmail({ toEmail: u.email, firstName: u.name });
      await sbUpdate('users', `id=eq.${u.user_id}`, { last_nudge_sent_at: new Date().toISOString() });
      sent++;
    } catch (err) {
      console.error('[send-nudges] failed for', u.email, err);
      failed++;
    }
  }

  return json({ candidates: candidates.length, sent, failed });
}
