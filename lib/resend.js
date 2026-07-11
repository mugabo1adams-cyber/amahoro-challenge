 // lib/resend.js
//
// Sends email via Resend's REST API directly (no SDK), matching the
// dependency-free, fetch-only style of chat.js — and guaranteed to work
// on Edge Runtime since it's just an HTTP call.
//
// Env var required: RESEND_API_KEY

const FROM_ADDRESS = 'Amahoro Challenge <hello@amahoro.app>';

async function sendEmail({ to, subject, html }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM_ADDRESS, to, subject, html }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('[resend] send failed:', res.status, text);
    throw new Error(`Resend send failed: ${res.status}`);
  }
  return res.json();
}

export function sendIndividualWelcomeEmail({ toEmail, firstName }) {
  return sendEmail({
    to: toEmail,
    subject: 'Welcome to Amahoro Challenge 🎉',
    html: baseWrapper(`
      <h1 style="font-size:22px;">Welcome${firstName ? `, ${firstName}` : ''} 👋</h1>
      <p>You're in. Amahoro Challenge is here to support your wellness journey — in English, French, Swahili, or Kinyarwanda, whichever feels right for you.</p>
      <p>Open the app and take your first check-in whenever you're ready.</p>
      <a href="https://amahoro.app" style="display:inline-block;margin-top:16px;padding:12px 20px;background:#25D366;color:#000;text-decoration:none;border-radius:6px;font-weight:700;">Open Amahoro</a>
    `),
  });
}

export function sendOrgOwnerWelcomeEmail({ toEmail, firstName, orgName, plan, seatLimit }) {
  return sendEmail({
    to: toEmail,
    subject: `${orgName} is set up on Amahoro Challenge`,
    html: baseWrapper(`
      <h1 style="font-size:22px;">Welcome${firstName ? `, ${firstName}` : ''} 🎉</h1>
      <p><strong>${orgName}</strong> is now active on the <strong>${plan}</strong> plan, with room for up to <strong>${seatLimit} members</strong>.</p>
      <p>Next step: invite your team from the organization dashboard.</p>
      <a href="https://amahoro.app" style="display:inline-block;margin-top:16px;padding:12px 20px;background:#4FC3F7;color:#000;text-decoration:none;border-radius:6px;font-weight:700;">Open Amahoro</a>
    `),
  });
}

export function sendOrgMemberWelcomeEmail({ toEmail, firstName, orgName }) {
  return sendEmail({
    to: toEmail,
    subject: `You've been added to ${orgName} on Amahoro Challenge`,
    html: baseWrapper(`
      <h1 style="font-size:22px;">Welcome${firstName ? `, ${firstName}` : ''} 👋</h1>
      <p>You've been added to <strong>${orgName}</strong>'s workspace on Amahoro Challenge.</p>
      <a href="https://amahoro.app" style="display:inline-block;margin-top:16px;padding:12px 20px;background:#25D366;color:#000;text-decoration:none;border-radius:6px;font-weight:700;">Open Amahoro</a>
    `),
  });
}

export function sendProActivatedEmail({ toEmail, firstName }) {
  return sendEmail({
    to: toEmail,
    subject: 'Amahoro Pro is active 🎉',
    html: baseWrapper(`
      <h1 style="font-size:22px;">You're on Pro now${firstName ? `, ${firstName}` : ''} 🎉</h1>
      <p>Unlimited coaching, your workbook, guided meditation, progress reports, and new challenges are all unlocked.</p>
      <a href="https://amahoro.app" style="display:inline-block;margin-top:16px;padding:12px 20px;background:#25D366;color:#000;text-decoration:none;border-radius:6px;font-weight:700;">Open Amahoro</a>
    `),
  });
}

function baseWrapper(bodyHtml) {
  return `
  <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#1a1a1a;">
    ${bodyHtml}
    <p style="margin-top:40px;font-size:13px;color:#888;">Amahoro Challenge · amahoro.app</p>
  </div>`;
}
