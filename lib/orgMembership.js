// lib/orgMembership.js
//
// Shared logic used by api/webhooks/user-created.js — links an invited
// org member to their new account once they finish signing up.

import { sbSelect, sbUpdate } from './supabase.js';

export async function finalizeMemberJoin({ userId, email }) {
  const matches = await sbSelect(
    `organization_members?email=eq.${encodeURIComponent(email)}&status=eq.invited&select=*`
  );
  const member = matches[0];
  if (!member) return null;

  await sbUpdate('organization_members', `id=eq.${member.id}`, {
    user_id: userId,
    status: 'joined',
    joined_at: new Date().toISOString(),
  });

  await sbUpdate('users', `id=eq.${userId}`, { is_pro: true, is_org: true });

  return member;
}
