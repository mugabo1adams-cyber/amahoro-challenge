// api/org/invite.js
//
// POST /api/org/invite
// Body: { organizationId, requesterId, inviteeEmail }
//
// Enforces the 30-seat cap (also backed by the DB trigger in schema.sql
// as a second line of defense) and sends the invited member a welcome email.

export const config = { runtime: 'edge' };

import { sbSelect, sbInsert, sbCount } from '../../lib/supabase.js';
import { sendOrgMemberWelcomeEmail } from '../../lib/resend.js';

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

  const { organizationId, requesterId, inviteeEmail } = body || {};
  if (!organizationId || !requesterId || !inviteeEmail) {
    return json({ error: 'missing fields' }, 400);
  }

  const orgs = await sbSelect(`organizations?id=eq.${organizationId}&select=*`);
  const org = orgs[0];
  if (!org) return json({ error: 'organization not found' }, 404);

  if (org.owner_id !== requesterId) {
    return json({ error: 'only the org owner can invite members' }, 403);
  }
  if (org.status !== 'active') {
    return json({ error: 'organization subscription is not active' }, 402);
  }

  const currentCount = await sbCount('organization_members', `organization_id=eq.${organizationId}`);
  if (currentCount >= org.seat_limit) {
    return json({ error: `Seat limit of ${org.seat_limit} reached` }, 409);
  }

  let member;
  try {
    member = await sbInsert('organization_members', {
      organization_id: organizationId,
      email: inviteeEmail,
      role: 'member',
      status: 'invited',
    });
  } catch (err) {
    if (err.body?.includes('Seat limit')) {
      return json({ error: 'Seat limit reached' }, 409);
    }
    if (err.status === 409 || err.body?.includes('duplicate')) {
      return json({ error: 'that email has already been invited' }, 409);
    }
    console.error('[invite member] insert failed:', err);
    return json({ error: 'could not create invite' }, 500);
  }

  try {
    await sendOrgMemberWelcomeEmail({ toEmail: inviteeEmail, firstName: '', orgName: org.name });
  } catch (err) {
    console.error('[invite member] welcome email failed:', err);
    // Invite still stands even if the email hiccups.
  }

  return json({ invited: true, member });
}
