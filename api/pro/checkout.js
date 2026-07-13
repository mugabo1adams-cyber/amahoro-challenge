 // api/pro/checkout.js
//
// POST /api/pro/checkout
// Body: { userId, email }
//
// Called by the "Subscribe" button on the individual Pro card in ProScreen
// (App.jsx). Starts a real Paystack subscription for the $4/month plan.
// Brings individual Pro onto the same real-verification system as
// Organizations — no more honor-system checkbox.
//
// Setup required in Paystack Dashboard (Products > Plans) BEFORE this works:
//   Create plan "Amahoro Pro — Monthly": $4, interval = monthly
//   Copy the plan code into PAYSTACK_PLAN_PRO below.
//
// Env vars required: PAYSTACK_SECRET_KEY, PAYSTACK_PLAN_PRO, APP_URL

export const config = { runtime: 'edge' };

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

  const { userId, email } = body || {};
  if (!userId || !email) return json({ error: 'missing fields' }, 400);

  const planCode = process.env.PAYSTACK_PLAN_PRO;
  if (!planCode) {
    console.error('[pro checkout] missing PAYSTACK_PLAN_PRO env var');
    return json({ error: 'billing not configured yet' }, 500);
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
          user_id: userId,
          plan_type: 'pro',
        },
      }),
    });

    const result = await response.json();

    if (!result.status) {
      console.error('[pro checkout] paystack init failed:', result);
      return json({ error: 'paystack init failed' }, 502);
    }

    return json({
      authorizationUrl: result.data.authorization_url,
      reference: result.data.reference,
    });
  } catch (err) {
    console.error('[pro checkout] error calling paystack:', err);
    return json({ error: 'checkout failed' }, 500);
  }
}
