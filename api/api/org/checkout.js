// lib/supabase.js
//
// Zero-dependency Supabase REST client — talks directly to Supabase's
// PostgREST API via fetch, same style as chat.js (no SDK import needed,
// which matters because this runs on Vercel's Edge Runtime).
//
// Uses the service role key, which bypasses Row Level Security — same
// trust level as an admin client. Only ever call this from /api routes.
//
// Env vars required:
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY   (Supabase Dashboard > Settings > API — NOT the anon key)

const BASE = process.env.SUPABASE_URL + '/rest/v1';
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function headers(extra = {}) {
  return {
    apikey: KEY,
    Authorization: `Bearer ${KEY}`,
    'Content-Type': 'application/json',
    ...extra,
  };
}

/**
 * SELECT rows. `query` is a raw PostgREST query string, e.g.
 * "organizations?owner_id=eq.abc&status=eq.active&select=*"
 */
export async function sbSelect(query) {
  const res = await fetch(`${BASE}/${query}`, { headers: headers() });
  if (!res.ok) throw new Error(`Supabase select failed: ${res.status} ${await res.text()}`);
  return res.json();
}

/** INSERT a row, returns the inserted row. */
export async function sbInsert(table, row) {
  const res = await fetch(`${BASE}/${table}`, {
    method: 'POST',
    headers: headers({ Prefer: 'return=representation' }),
    body: JSON.stringify(row),
  });
  const text = await res.text();
  if (!res.ok) {
    const err = new Error(`Supabase insert failed: ${res.status} ${text}`);
    err.status = res.status;
    err.body = text;
    throw err;
  }
  const rows = JSON.parse(text);
  return rows[0];
}

/** UPDATE rows matching a filter, e.g. sbUpdate('organizations', 'id=eq.abc', { status: 'active' }) */
export async function sbUpdate(table, filter, patch) {
  const res = await fetch(`${BASE}/${table}?${filter}`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error(`Supabase update failed: ${res.status} ${await res.text()}`);
}

/** COUNT rows matching a filter, without downloading them. */
export async function sbCount(table, filter) {
  const res = await fetch(`${BASE}/${table}?${filter}&select=id`, {
    headers: headers({ Prefer: 'count=exact', Range: '0-0' }),
  });
  if (!res.ok) throw new Error(`Supabase count failed: ${res.status} ${await res.text()}`);
  const range = res.headers.get('content-range'); // e.g. "0-0/12"
  return range ? parseInt(range.split('/')[1], 10) : 0;
}
