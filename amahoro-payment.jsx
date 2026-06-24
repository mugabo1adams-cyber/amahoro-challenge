import { useState } from "react";

const C = {
  night: "#0D1117", deep: "#141B24", card: "#1C2733", border: "#263040",
  green: "#25D366", amber: "#F5A623", red: "#E8544A", sky: "#4FC3F7",
  text: "#E8EDF2", muted: "#7A8FA6", faint: "#3A4A5C",
};

function Badge({ color = "green", children }) {
  const map = {
    green: [C.green, "rgba(37,211,102,0.12)", "rgba(37,211,102,0.25)"],
    amber: [C.amber, "rgba(245,166,35,0.15)", "rgba(245,166,35,0.25)"],
    sky: [C.sky, "rgba(79,195,247,0.12)", "rgba(79,195,247,0.2)"],
    red: [C.red, "rgba(232,84,74,0.15)", "rgba(232,84,74,0.25)"],
  };
  const [col, bg, b] = map[color] || map.green;
  return (
    <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "Sora,sans-serif", letterSpacing: "0.06em", textTransform: "uppercase", padding: "3px 10px", borderRadius: 100, background: bg, border: `1px solid ${b}`, color: col }}>
      {children}
    </span>
  );
}

// Revenue projection data
const MONTHS = ["M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8", "M9", "M10", "M11", "M12"];
const SCENARIOS = {
  conservative: {
    label: "Conservative", color: C.amber,
    users: [80, 200, 380, 600, 850, 1100, 1400, 1700, 2000, 2350, 2700, 3100],
    revenue: [0, 32, 96, 192, 380, 560, 760, 1020, 1280, 1560, 1840, 2240],
    desc: "Organic only, no paid ads, word of mouth"
  },
  moderate: {
    label: "Moderate", color: C.sky,
    users: [200, 500, 900, 1400, 2000, 2700, 3500, 4400, 5400, 6500, 7800, 9200],
    revenue: [0, 80, 240, 560, 1000, 1620, 2520, 3520, 4720, 6240, 7800, 9800],
    desc: "Light social media + WhatsApp community sharing"
  },
  optimistic: {
    label: "Optimistic", color: C.green,
    users: [500, 1200, 2500, 4500, 7000, 10000, 14000, 18500, 23500, 29000, 35000, 42000],
    revenue: [0, 192, 800, 2240, 4480, 8000, 13440, 19760, 28000, 37120, 47600, 59360],
    desc: "NGO partnerships + university deals + viral WhatsApp"
  }
};

const INCOME_STREAMS = [
  { icon: "📱", name: "Pro Subscriptions ($4/mo)", monthly: "~$800–$9,800", year1: "$15,000–$120,000", how: "8–12% of free users upgrade. Scales with user growth. Automated billing via Flutterwave/Stripe.", automated: true },
  { icon: "🏫", name: "Org Licenses ($29–$99/mo)", monthly: "~$290–$2,970", year1: "$3,500–$36,000", how: "Universities, NGOs, corporate HR. One sales email → recurring monthly income. High retention.", automated: true },
  { icon: "📘", name: "Digital Workbooks ($5–$7)", monthly: "~$200–$1,400", year1: "$2,400–$17,000", how: "PDF workbooks sold on Gumroad or your site. Zero marginal cost. Sell once, deliver forever.", automated: true },
  { icon: "🎓", name: "Facilitator Certification ($49)", monthly: "~$0–$980", year1: "$0–$12,000", how: "Train teachers, counselors, coaches to run Amahoro groups. High-value, one-time per person.", automated: false },
  { icon: "🤝", name: "NGO/Grant Funding", monthly: "Lump sum", year1: "$5,000–$50,000", how: "UNICEF, WHO, local govt youth desks, mental health foundations. Apply once, receive funding.", automated: false },
  { icon: "📣", name: "B2B White-Label ($299/mo)", monthly: "~$299–$2,990", year1: "$3,600–$36,000", how: "Sell branded versions to hospitals, insurance companies, telecom (MTN, Airtel) as employee wellness.", automated: true },
];

const COSTS = [
  { item: "Claude API (Anthropic)", monthly: "$20–$150", note: "Scales with usage. ~$0.003 per conversation." },
  { item: "WhatsApp Business API (Twilio)", monthly: "$15–$80", note: "~$0.005 per message. 1000 users ≈ $50/mo." },
  { item: "Hosting (Vercel/Railway)", monthly: "$0–$20", note: "Free tier covers first ~5,000 users." },
  { item: "Database (Supabase)", monthly: "$0–$25", note: "Free tier up to 500MB. Paid at scale." },
  { item: "Payment Processing", monthly: "1.4% + fees", note: "Flutterwave 1.4% Africa / Stripe 2.9% international." },
  { item: "Domain + Email", monthly: "$2", note: "amahoro.app + hello@amahoro.app" },
];

// Payment modal
function PayModal({ plan, onClose }) {
  const [method, setMethod] = useState("flutterwave");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [paid, setPaid] = useState(false);

  const initFlutterwave = () => {
    if (!email || !name) { alert("Please fill in your name and email first."); return; }
    // In production: call your backend to create a Flutterwave payment link
    // then redirect to it. This is the integration pattern:
    alert(`🚀 INTEGRATION POINT:\n\nIn your backend, call:\nPOST https://api.flutterwave.com/v3/payments\n{\n  amount: ${plan.price},\n  currency: "USD",\n  customer: { email: "${email}", name: "${name}" },\n  tx_ref: "amahoro-${Date.now()}",\n  redirect_url: "https://amahoro.app/success"\n}\n\nFlutterwave returns a payment link → redirect user there.\nThey pay by card, Mobile Money (MTN, Airtel), bank.\nYou get webhook → activate their account.`);
    setPaid(true);
  };

  const initStripe = () => {
    if (!email || !name) { alert("Please fill in your name and email first."); return; }
    alert(`🚀 INTEGRATION POINT:\n\nIn your backend:\n1. Create Stripe Checkout Session:\n   stripe.checkout.sessions.create({\n     price: "${plan.stripeId}",\n     mode: "subscription",\n     customer_email: "${email}",\n     success_url: "https://amahoro.app/success",\n   })\n\n2. Redirect user to session.url\n3. Stripe handles card globally\n4. Webhook → activate account`);
    setPaid(true);
  };

  if (paid) return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "2.5rem 2rem", maxWidth: 420, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: "3.5rem", marginBottom: 16 }}>🎉</div>
        <h3 style={{ fontFamily: "Sora,sans-serif", fontWeight: 800, fontSize: "1.4rem", marginBottom: 8 }}>Payment Initiated!</h3>
        <p style={{ color: C.muted, fontSize: "0.9rem", lineHeight: 1.7, marginBottom: 24 }}>In production, the user would be redirected to Flutterwave or Stripe to complete payment. Your backend webhook would then activate their account automatically.</p>
        <button onClick={onClose} style={{ background: C.green, border: "none", color: "#000", fontFamily: "Sora,sans-serif", fontWeight: 700, padding: "11px 28px", borderRadius: 8, cursor: "pointer" }}>Close</button>
      </div>
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", overflowY: "auto" }}>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "2rem", maxWidth: 460, width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h3 style={{ fontFamily: "Sora,sans-serif", fontWeight: 800, fontSize: "1.2rem" }}>{plan.name}</h3>
            <div style={{ color: C.green, fontFamily: "Sora,sans-serif", fontWeight: 800, fontSize: "1.5rem" }}>{plan.price} <span style={{ fontSize: "0.9rem", color: C.muted, fontWeight: 400 }}>{plan.period}</span></div>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer", fontSize: "1.3rem" }}>✕</button>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: "0.78rem", fontFamily: "Sora,sans-serif", fontWeight: 600, color: C.muted, letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Full Name</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Amara Uwimana" style={{ width: "100%", background: C.deep, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", color: C.text, fontSize: "0.95rem", fontFamily: "DM Sans,sans-serif", outline: "none", marginBottom: 12 }} />
          <label style={{ fontSize: "0.78rem", fontFamily: "Sora,sans-serif", fontWeight: 600, color: C.muted, letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" style={{ width: "100%", background: C.deep, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", color: C.text, fontSize: "0.95rem", fontFamily: "DM Sans,sans-serif", outline: "none", marginBottom: 12 }} />
          <label style={{ fontSize: "0.78rem", fontFamily: "Sora,sans-serif", fontWeight: 600, color: C.muted, letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Phone (for Mobile Money)</label>
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+250 780 000 000" style={{ width: "100%", background: C.deep, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", color: C.text, fontSize: "0.95rem", fontFamily: "DM Sans,sans-serif", outline: "none" }} />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: "0.78rem", fontFamily: "Sora,sans-serif", fontWeight: 600, color: C.muted, letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginBottom: 10 }}>Payment Method</label>
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { id: "flutterwave", label: "🌍 Flutterwave", sub: "Mobile Money, Cards, Bank" },
              { id: "stripe", label: "💳 Stripe", sub: "International Cards" },
            ].map(m => (
              <button key={m.id} onClick={() => setMethod(m.id)} style={{ flex: 1, padding: "12px", border: `1px solid ${method === m.id ? C.green : C.border}`, background: method === m.id ? "rgba(37,211,102,0.08)" : C.deep, borderRadius: 10, cursor: "pointer", color: method === m.id ? C.green : C.text }}>
                <div style={{ fontFamily: "Sora,sans-serif", fontWeight: 700, fontSize: "0.88rem" }}>{m.label}</div>
                <div style={{ fontSize: "0.72rem", color: C.muted, marginTop: 3 }}>{m.sub}</div>
              </button>
            ))}
          </div>
          {method === "flutterwave" && (
            <div style={{ marginTop: 8, background: "rgba(37,211,102,0.05)", border: "1px solid rgba(37,211,102,0.15)", borderRadius: 8, padding: "10px 14px", fontSize: "0.8rem", color: C.muted, lineHeight: 1.6 }}>
              ✅ Supports: MTN Mobile Money, Airtel Money, M-Pesa, Visa, Mastercard, Bank Transfer — across 34 African countries
            </div>
          )}
          {method === "stripe" && (
            <div style={{ marginTop: 8, background: "rgba(79,195,247,0.05)", border: "1px solid rgba(79,195,247,0.15)", borderRadius: 8, padding: "10px 14px", fontSize: "0.8rem", color: C.muted, lineHeight: 1.6 }}>
              ✅ Best for international payments. Visa, Mastercard, Apple Pay, Google Pay. Requires Stripe account (available in Rwanda via Stripe Atlas).
            </div>
          )}
        </div>

        <button onClick={method === "flutterwave" ? initFlutterwave : initStripe}
          style={{ width: "100%", background: C.green, border: "none", color: "#000", fontFamily: "Sora,sans-serif", fontWeight: 700, fontSize: "1rem", padding: "13px", borderRadius: 10, cursor: "pointer" }}>
          {method === "flutterwave" ? `Pay ${plan.price} via Flutterwave →` : `Pay ${plan.price} via Stripe →`}
        </button>
        <p style={{ textAlign: "center", color: C.faint, fontSize: "0.75rem", marginTop: 10 }}>Secure payment · Cancel anytime · Receipt by email</p>
      </div>
    </div>
  );
}

// Revenue chart (pure CSS/SVG — no external lib)
function RevenueChart({ scenario }) {
  const s = SCENARIOS[scenario];
  const maxRev = Math.max(...s.revenue);
  const W = 100, H = 60;

  const points = s.revenue.map((v, i) => ({
    x: (i / (s.revenue.length - 1)) * W,
    y: H - (v / maxRev) * (H - 5)
  }));
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const area = `${path} L ${points[points.length - 1].x} ${H} L 0 ${H} Z`;

  return (
    <div style={{ position: "relative" }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 140, overflow: "visible" }}>
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={s.color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={s.color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#chartGrad)" />
        <path d={path} fill="none" stroke={s.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="1.5" fill={s.color} />
        ))}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        {MONTHS.map(m => <span key={m} style={{ fontSize: 9, color: C.faint, fontFamily: "Sora,sans-serif" }}>{m}</span>)}
      </div>
    </div>
  );
}

export default function PaymentApp() {
  const [tab, setTab] = useState("pricing");
  const [modal, setModal] = useState(null);
  const [scenario, setScenario] = useState("moderate");

  const plans = [
    {
      name: "Free", price: "$0", period: "forever", featured: false,
      desc: "The full 21-day challenge. No card. No tricks.",
      features: ["21-day core challenge", "Daily WhatsApp delivery", "AI coach (5/day)", "Peer cohort group", "Completion certificate"],
      missing: ["Unlimited AI coach", "Workbook library", "Audio meditations"],
      btn: "Start Free", btnStyle: "outline", action: "free"
    },
    {
      name: "Amahoro Pro", price: "$4", period: "/ month", featured: true,
      desc: "Full toolkit. Less than a cup of coffee.",
      stripeId: "price_XXXX", flutterwaveId: "plan_XXXX",
      features: ["Everything in Free", "Unlimited AI coach", "Workbook library (PDF)", "Monthly anxiety tracking", "Offline audio meditations", "Repeat challenge themes"],
      missing: [],
      btn: "Get Pro →", btnStyle: "green", action: "pay"
    },
    {
      name: "Organizations", price: "$29", period: "/ month", featured: false,
      desc: "Universities, NGOs, employers. Up to 50 people.",
      stripeId: "price_YYYY", flutterwaveId: "plan_YYYY",
      features: ["50 participant accounts", "Admin dashboard", "Cohort analytics", "Custom branding", "Monthly group workshop", "2× human coach sessions"],
      missing: [],
      btn: "Get for My Org →", btnStyle: "sky", action: "pay"
    },
  ];

  const s = SCENARIOS[scenario];

  return (
    <div style={{ minHeight: "100vh", background: C.night, color: C.text, fontFamily: "DM Sans,sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .fade { animation: fadeIn 0.4s ease; }
        .card-h:hover { transform: translateY(-3px) !important; }
        ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-thumb { background: #263040; border-radius: 3px; }
      `}</style>

      {modal && <PayModal plan={modal} onClose={() => setModal(null)} />}

      {/* Nav */}
      <div style={{ background: C.deep, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 5%", height: 60 }}>
        <div style={{ fontFamily: "Sora,sans-serif", fontWeight: 800, fontSize: "1.1rem", color: C.green }}>🌿 Amahoro</div>
        <div style={{ display: "flex", gap: 6 }}>
          {["pricing", "revenue", "costs", "integrations"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ background: tab === t ? "rgba(37,211,102,0.1)" : "transparent", border: `1px solid ${tab === t ? C.green : C.border}`, color: tab === t ? C.green : C.muted, borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontSize: "0.78rem", fontFamily: "Sora,sans-serif", fontWeight: 600, textTransform: "capitalize" }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "3rem 4% 5rem" }}>

        {/* PRICING TAB */}
        {tab === "pricing" && (
          <div className="fade">
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <Badge color="green">Payment Ready</Badge>
              <h1 style={{ fontFamily: "Sora,sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem,4vw,2.8rem)", letterSpacing: "-0.03em", margin: "16px 0 10px", lineHeight: 1.15 }}>
                Accessible pricing.<br />Built for Africa.
              </h1>
              <p style={{ color: C.muted, fontSize: "1rem", maxWidth: 480, margin: "0 auto", lineHeight: 1.7 }}>
                Flutterwave handles Mobile Money (MTN, Airtel, M-Pesa) across 34 African countries. Stripe handles international cards. Both wired up below.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 16, marginBottom: 48 }}>
              {plans.map(p => (
                <div key={p.name} className="card-h" style={{ background: C.card, border: `2px solid ${p.featured ? C.green : C.border}`, borderRadius: 16, padding: "26px 22px", position: "relative", transition: "transform 0.25s", boxShadow: p.featured ? `0 0 0 1px rgba(37,211,102,0.2), 0 20px 40px rgba(37,211,102,0.07)` : "none" }}>
                  {p.featured && <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: C.green, color: "#000", fontFamily: "Sora,sans-serif", fontWeight: 800, fontSize: 11, letterSpacing: "0.07em", textTransform: "uppercase", padding: "4px 14px", borderRadius: 100 }}>Most Popular</div>}
                  <div style={{ fontSize: 11, color: C.muted, fontFamily: "Sora,sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>{p.name}</div>
                  <div style={{ fontFamily: "Sora,sans-serif", fontWeight: 800, fontSize: "2.2rem", color: "#fff", marginBottom: 4 }}>{p.price} <span style={{ fontSize: "0.9rem", color: C.muted, fontWeight: 400 }}>{p.period}</span></div>
                  <div style={{ fontSize: "0.85rem", color: C.muted, marginBottom: 20, lineHeight: 1.5 }}>{p.desc}</div>
                  <ul style={{ listStyle: "none", marginBottom: 24 }}>
                    {p.features.map(f => <li key={f} style={{ fontSize: "0.87rem", padding: "5px 0", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 8 }}><span style={{ color: C.green }}>✓</span>{f}</li>)}
                    {p.missing.map(f => <li key={f} style={{ fontSize: "0.87rem", padding: "5px 0", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 8, opacity: 0.35 }}><span>–</span>{f}</li>)}
                  </ul>
                  <button
                    onClick={() => p.action === "pay" ? setModal(p) : alert("Free plan — no payment needed. Just start the challenge!")}
                    style={{ display: "block", width: "100%", padding: "12px", borderRadius: 8, fontFamily: "Sora,sans-serif", fontWeight: 700, fontSize: "0.92rem", cursor: "pointer", border: "none", background: p.btnStyle === "green" ? C.green : p.btnStyle === "sky" ? C.sky : C.deep, color: p.btnStyle === "outline" ? C.text : "#000", border: p.btnStyle === "outline" ? `1px solid ${C.border}` : "none", transition: "opacity 0.2s" }}>
                    {p.btn}
                  </button>
                  {p.action === "pay" && (
                    <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                      <span style={{ fontSize: "0.72rem", color: C.faint }}>🔒 Flutterwave · Stripe · MTN MoMo · M-Pesa</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Payment methods banner */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "24px", marginBottom: 24 }}>
              <h3 style={{ fontFamily: "Sora,sans-serif", fontWeight: 700, fontSize: "1rem", marginBottom: 16 }}>Accepted Payment Methods Across Africa</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 10 }}>
                {[
                  { icon: "📱", name: "MTN Mobile Money", countries: "Rwanda, Uganda, Ghana, Cameroon" },
                  { icon: "📱", name: "Airtel Money", countries: "Kenya, Tanzania, Uganda, Zambia" },
                  { icon: "📱", name: "M-Pesa", countries: "Kenya, Tanzania, Mozambique" },
                  { icon: "💳", name: "Visa / Mastercard", countries: "All countries" },
                  { icon: "🏦", name: "Bank Transfer", countries: "Nigeria, Ghana, South Africa" },
                  { icon: "🌍", name: "Orange Money", countries: "Senegal, Côte d'Ivoire, Mali" },
                ].map(m => (
                  <div key={m.name} style={{ background: C.deep, borderRadius: 8, padding: "12px 14px" }}>
                    <div style={{ fontSize: "1.2rem", marginBottom: 4 }}>{m.icon}</div>
                    <div style={{ fontFamily: "Sora,sans-serif", fontWeight: 700, fontSize: "0.82rem", marginBottom: 2 }}>{m.name}</div>
                    <div style={{ fontSize: "0.72rem", color: C.muted }}>{m.countries}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: "rgba(37,211,102,0.04)", border: "1px solid rgba(37,211,102,0.2)", borderRadius: 12, padding: "18px 20px", fontSize: "0.88rem", color: C.muted, lineHeight: 1.7 }}>
              <strong style={{ color: C.green }}>Deployment Note:</strong> To go live, replace <code style={{ background: C.deep, padding: "1px 6px", borderRadius: 4, color: C.text }}>price_XXXX</code> with your real Stripe Price ID and Flutterwave Plan ID. Add your secret keys to your backend environment variables — never in frontend code. See the <strong>Integrations</strong> tab for the exact setup steps.
            </div>
          </div>
        )}

        {/* REVENUE TAB */}
        {tab === "revenue" && (
          <div className="fade">
            <div style={{ marginBottom: 32 }}>
              <Badge color="amber">Revenue Projections</Badge>
              <h1 style={{ fontFamily: "Sora,sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem,4vw,2.5rem)", letterSpacing: "-0.03em", margin: "14px 0 8px", lineHeight: 1.15 }}>What can Amahoro make?</h1>
              <p style={{ color: C.muted, fontSize: "0.95rem", lineHeight: 1.7 }}>Honest projections based on comparable African digital health products. No hype — just math.</p>
            </div>

            {/* Scenario selector */}
            <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
              {Object.entries(SCENARIOS).map(([key, val]) => (
                <button key={key} onClick={() => setScenario(key)} style={{ padding: "8px 18px", borderRadius: 100, border: `1px solid ${scenario === key ? val.color : C.border}`, background: scenario === key ? `rgba(${key === "moderate" ? "79,195,247" : key === "optimistic" ? "37,211,102" : "245,166,35"},0.1)` : C.deep, color: scenario === key ? val.color : C.muted, fontFamily: "Sora,sans-serif", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}>
                  {val.label}
                </button>
              ))}
            </div>

            {/* Big numbers */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, marginBottom: 28 }}>
              {[
                { label: "Month 6 Revenue", value: `$${s.revenue[5].toLocaleString()}`, sub: "monthly recurring" },
                { label: "Month 12 Revenue", value: `$${s.revenue[11].toLocaleString()}`, sub: "monthly recurring" },
                { label: "Year 1 Total", value: `$${s.revenue.reduce((a, b) => a + b, 0).toLocaleString()}`, sub: "cumulative" },
                { label: "Users by Month 12", value: s.users[11].toLocaleString(), sub: "total registered" },
              ].map(stat => (
                <div key={stat.label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px 18px" }}>
                  <div style={{ fontFamily: "Sora,sans-serif", fontWeight: 800, fontSize: "1.8rem", color: s.color }}>{stat.value}</div>
                  <div style={{ fontFamily: "Sora,sans-serif", fontWeight: 600, fontSize: "0.82rem", color: C.text, marginTop: 4 }}>{stat.label}</div>
                  <div style={{ fontSize: "0.72rem", color: C.muted }}>{stat.sub}</div>
                </div>
              ))}
            </div>

            {/* Chart */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "24px", marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ fontFamily: "Sora,sans-serif", fontWeight: 700, fontSize: "1rem" }}>Monthly Revenue — {s.label} Scenario</h3>
                <span style={{ fontSize: "0.78rem", color: C.muted }}>{s.desc}</span>
              </div>
              <RevenueChart scenario={scenario} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, flexWrap: "wrap", gap: 8 }}>
                {s.revenue.map((v, i) => (
                  <div key={i} style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "Sora,sans-serif", fontWeight: 700, fontSize: "0.78rem", color: s.color }}>${v >= 1000 ? (v / 1000).toFixed(1) + "k" : v}</div>
                    <div style={{ fontSize: "0.65rem", color: C.faint }}>M{i + 1}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Assumptions */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px", marginBottom: 24 }}>
              <h3 style={{ fontFamily: "Sora,sans-serif", fontWeight: 700, fontSize: "1rem", marginBottom: 14 }}>Assumptions (be honest with yourself)</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 10 }}>
                {[
                  { label: "Free → Pro conversion", value: "8–12%", note: "Industry avg for mental health apps" },
                  { label: "Monthly churn", value: "5–8%", note: "Users who cancel per month" },
                  { label: "Org deal close rate", value: "1 per 10 contacted", note: "Cold outreach to universities/NGOs" },
                  { label: "WhatsApp growth", value: "Viral coefficient 1.3", note: "Each user refers 1.3 people avg" },
                  { label: "CAC (organic)", value: "$0", note: "WhatsApp + community = free growth" },
                  { label: "LTV (Pro user)", value: "$48 avg", note: "1 year at $4/mo before churn" },
                ].map(a => (
                  <div key={a.label} style={{ background: C.deep, borderRadius: 8, padding: "12px 14px" }}>
                    <div style={{ fontFamily: "Sora,sans-serif", fontWeight: 800, fontSize: "1.1rem", color: C.green }}>{a.value}</div>
                    <div style={{ fontFamily: "Sora,sans-serif", fontWeight: 600, fontSize: "0.8rem", marginTop: 2 }}>{a.label}</div>
                    <div style={{ fontSize: "0.72rem", color: C.muted, marginTop: 2 }}>{a.note}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Income streams */}
            <h3 style={{ fontFamily: "Sora,sans-serif", fontWeight: 700, fontSize: "1.1rem", marginBottom: 14 }}>All Income Streams</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {INCOME_STREAMS.map(s => (
                <div key={s.name} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "18px 20px", display: "grid", gridTemplateColumns: "auto 1fr auto auto", gap: 14, alignItems: "center" }}>
                  <div style={{ fontSize: "1.6rem" }}>{s.icon}</div>
                  <div>
                    <div style={{ fontFamily: "Sora,sans-serif", fontWeight: 700, fontSize: "0.9rem", marginBottom: 3 }}>{s.name}</div>
                    <div style={{ fontSize: "0.8rem", color: C.muted, lineHeight: 1.5 }}>{s.how}</div>
                  </div>
                  <div style={{ textAlign: "right", minWidth: 110 }}>
                    <div style={{ fontSize: "0.72rem", color: C.muted, marginBottom: 2 }}>Monthly</div>
                    <div style={{ fontFamily: "Sora,sans-serif", fontWeight: 700, fontSize: "0.88rem", color: C.green }}>{s.monthly}</div>
                  </div>
                  <div style={{ textAlign: "right", minWidth: 110 }}>
                    <div style={{ fontSize: "0.72rem", color: C.muted, marginBottom: 2 }}>Year 1</div>
                    <div style={{ fontFamily: "Sora,sans-serif", fontWeight: 700, fontSize: "0.88rem", color: C.amber }}>{s.year1}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* COSTS TAB */}
        {tab === "costs" && (
          <div className="fade">
            <Badge color="sky">Cost Structure</Badge>
            <h1 style={{ fontFamily: "Sora,sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem,4vw,2.5rem)", letterSpacing: "-0.03em", margin: "14px 0 8px" }}>What does it cost to run?</h1>
            <p style={{ color: C.muted, fontSize: "0.95rem", marginBottom: 32, lineHeight: 1.7 }}>Almost nothing to start. Costs scale with revenue — you only pay more when you're earning more.</p>

            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden", marginBottom: 24 }}>
              <div style={{ background: C.deep, padding: "14px 20px", borderBottom: `1px solid ${C.border}`, display: "grid", gridTemplateColumns: "2fr 1fr 2fr", gap: 12 }}>
                <div style={{ fontFamily: "Sora,sans-serif", fontWeight: 700, fontSize: "0.78rem", color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Service</div>
                <div style={{ fontFamily: "Sora,sans-serif", fontWeight: 700, fontSize: "0.78rem", color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Monthly Cost</div>
                <div style={{ fontFamily: "Sora,sans-serif", fontWeight: 700, fontSize: "0.78rem", color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Notes</div>
              </div>
              {COSTS.map((c, i) => (
                <div key={c.item} style={{ padding: "16px 20px", borderBottom: i < COSTS.length - 1 ? `1px solid ${C.border}` : "none", display: "grid", gridTemplateColumns: "2fr 1fr 2fr", gap: 12, alignItems: "center" }}>
                  <div style={{ fontFamily: "Sora,sans-serif", fontWeight: 600, fontSize: "0.9rem" }}>{c.item}</div>
                  <div style={{ fontFamily: "Sora,sans-serif", fontWeight: 800, fontSize: "0.9rem", color: C.green }}>{c.monthly}</div>
                  <div style={{ fontSize: "0.82rem", color: C.muted }}>{c.note}</div>
                </div>
              ))}
              <div style={{ background: C.deep, padding: "16px 20px", borderTop: `1px solid ${C.border}`, display: "grid", gridTemplateColumns: "2fr 1fr 2fr", gap: 12 }}>
                <div style={{ fontFamily: "Sora,sans-serif", fontWeight: 800, fontSize: "0.95rem" }}>Total (early stage)</div>
                <div style={{ fontFamily: "Sora,sans-serif", fontWeight: 800, fontSize: "1.1rem", color: C.amber }}>$37–$277</div>
                <div style={{ fontSize: "0.82rem", color: C.muted }}>Per month. Scales gradually with users.</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12, marginBottom: 24 }}>
              {[
                { stage: "0–500 users", cost: "~$37/mo", note: "Mostly free tiers. Almost nothing." },
                { stage: "500–2,000 users", cost: "~$80/mo", note: "WhatsApp API + Claude API scale up." },
                { stage: "2,000–10,000 users", cost: "~$200/mo", note: "Still tiny vs. revenue at this scale." },
                { stage: "10,000+ users", cost: "~$500/mo", note: "$9,800+ revenue at this point. 95% margin." },
              ].map(s => (
                <div key={s.stage} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "18px" }}>
                  <div style={{ fontSize: "0.72rem", fontFamily: "Sora,sans-serif", fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{s.stage}</div>
                  <div style={{ fontFamily: "Sora,sans-serif", fontWeight: 800, fontSize: "1.4rem", color: C.green, marginBottom: 4 }}>{s.cost}</div>
                  <div style={{ fontSize: "0.82rem", color: C.muted }}>{s.note}</div>
                </div>
              ))}
            </div>

            <div style={{ background: "rgba(37,211,102,0.04)", border: "1px solid rgba(37,211,102,0.2)", borderRadius: 12, padding: "20px", fontSize: "0.9rem", lineHeight: 1.7 }}>
              <strong style={{ color: C.green }}>The key insight:</strong> You can launch with $0–$37/month in costs (all free tiers), start earning from day one when users upgrade, and your costs only meaningfully rise after you're already profitable. This is what makes a SaaS product powerful — the margin improves as you scale.
            </div>
          </div>
        )}

        {/* INTEGRATIONS TAB */}
        {tab === "integrations" && (
          <div className="fade">
            <Badge color="sky">Deploy Guide</Badge>
            <h1 style={{ fontFamily: "Sora,sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem,4vw,2.5rem)", letterSpacing: "-0.03em", margin: "14px 0 8px" }}>From prototype to live product.</h1>
            <p style={{ color: C.muted, fontSize: "0.95rem", marginBottom: 32, lineHeight: 1.7 }}>Exact steps to deploy, connect payments, and wire up WhatsApp. Can be done in one day.</p>

            {[
              {
                step: "01", title: "Deploy the App (30 min)", color: C.green,
                items: [
                  "Create a GitHub account at github.com and upload your amahoro-challenge.jsx file",
                  "Go to vercel.com → Connect GitHub → Import your repo → Deploy. You get a free URL instantly.",
                  "Buy domain: amahoro.app (~$12/yr on Namecheap or Cloudflare) → Connect to Vercel (one click)",
                  "Your app is now live at amahoro.app"
                ]
              },
              {
                step: "02", title: "Connect Flutterwave (1–2 days)", color: C.amber,
                items: [
                  "Sign up at flutterwave.com/africa → Complete KYC (ID + business registration if available)",
                  "Get API keys from dashboard → Add to your backend as FLUTTERWAVE_SECRET_KEY env variable",
                  "In your backend, POST to api.flutterwave.com/v3/payments with amount, customer, redirect_url",
                  "Flutterwave returns a payment_link → redirect user there → they pay by Mobile Money or card",
                  "Set up a webhook at /webhook/flutterwave → when payment confirmed, activate user's Pro account in your database",
                  "Supported in Rwanda without a company registration (individual developer account works)"
                ]
              },
              {
                step: "03", title: "Connect Stripe (optional, for international)", color: C.sky,
                items: [
                  "Sign up at stripe.com → For Rwanda: use Stripe Atlas ($500 one-time) to register a US LLC and get a US Stripe account",
                  "Alternatively: use Stripe via a payment service provider like Paystack (available in Rwanda) as a reseller",
                  "Create a Product + Price in Stripe dashboard → get the price_XXXX ID",
                  "In backend: stripe.checkout.sessions.create() → redirect user to session.url",
                  "Webhook at /webhook/stripe → listen for checkout.session.completed → activate account"
                ]
              },
              {
                step: "04", title: "Wire Up WhatsApp (2–3 days)", color: "#B39DDB",
                items: [
                  "Go to twilio.com → Create account → Get a WhatsApp-enabled number ($5/mo)",
                  "Set webhook URL to: https://amahoro.app/api/whatsapp",
                  "Your backend receives incoming messages → calls Claude API → sends reply back via Twilio",
                  "Schedule daily challenge messages using a cron job (e.g. node-cron or Railway scheduled tasks)",
                  "At 7am East Africa Time, your backend loops through all active users and sends their day's challenge",
                  "When users reply, the webhook fires → Claude generates a personalised response → sent back instantly"
                ]
              },
              {
                step: "05", title: "Database (1 hour)", color: C.green,
                items: [
                  "Go to supabase.com → Create a free project → You get a PostgreSQL database instantly",
                  "Tables you need: users (id, name, country, trigger, goal, plan, created_at), completions (user_id, day, reflection, ai_response), payments (user_id, amount, method, status)",
                  "Supabase gives you an auto-generated REST API — no backend code needed for basic CRUD",
                  "Free tier: 500MB storage, 2GB bandwidth. Handles ~10,000 users easily"
                ]
              },
            ].map(s => (
              <div key={s.step} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: `rgba(${s.color === C.green ? "37,211,102" : s.color === C.amber ? "245,166,35" : s.color === C.sky ? "79,195,247" : "179,157,219"},0.15)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Sora,sans-serif", fontWeight: 800, fontSize: "0.85rem", color: s.color }}>{s.step}</div>
                  <h3 style={{ fontFamily: "Sora,sans-serif", fontWeight: 700, fontSize: "1rem" }}>{s.title}</h3>
                </div>
                <ol style={{ paddingLeft: 20 }}>
                  {s.items.map((item, i) => (
                    <li key={i} style={{ fontSize: "0.87rem", color: C.muted, lineHeight: 1.7, marginBottom: 6 }}>{item}</li>
                  ))}
                </ol>
              </div>
            ))}

            <div style={{ background: "rgba(37,211,102,0.04)", border: "1px solid rgba(37,211,102,0.2)", borderRadius: 12, padding: "20px", marginTop: 8 }}>
              <h4 style={{ fontFamily: "Sora,sans-serif", fontWeight: 700, marginBottom: 8, color: C.green }}>Total deployment timeline</h4>
              <p style={{ fontSize: "0.88rem", color: C.muted, lineHeight: 1.7 }}>
                <strong style={{ color: C.text }}>Day 1:</strong> App live on Vercel. Domain connected. People can use it.<br />
                <strong style={{ color: C.text }}>Day 2:</strong> Flutterwave connected. First paid user can subscribe.<br />
                <strong style={{ color: C.text }}>Day 3:</strong> WhatsApp connected. Daily messages start going out automatically.<br />
                <strong style={{ color: C.text }}>Day 4:</strong> Database tracking all users, completions, payments.<br />
                <strong style={{ color: C.text }}>Day 5:</strong> You share the link on social media. The product runs itself.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
