import React, { useState, useEffect, useRef, useCallback } from "react";

// Global styles to ensure full dark background on all devices
const globalStyles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root {
    min-height: 100%;
    min-height: 100dvh;
    background: #0D1117;
    color: #E8EDF2;
    overflow-x: hidden;
  }
  body { -webkit-font-smoothing: antialiased; }
`;
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://kkgllkgnnfromoehzgde.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrZ2xsa2dubmZyb21vZWh6Z2RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2MTE0ODEsImV4cCI6MjA5ODE4NzQ4MX0.sD8dnvUegMR7WaVzXzhUXgHqGzpoKAo3HXPaR9I5zto";
const PROXY_URL = "";  // Uses Vercel Edge Function at /api/chat
const ADMIN_EMAIL = "mugabo1adams@gmail.com";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

const CHALLENGES = [
  { day:1, theme:"Awareness", emoji:"🧠", duration:"5 min", title:"Name what you feel.", context:"In our culture, we are taught to stay strong and not talk about our struggles. But when you name what you feel, it becomes smaller. This is your first brave step.", task:'Finish this sentence three times: "Right now I feel worried about _____ because _____. My body feels _____ when this happens."', placeholder:"Right now I feel worried about my exams because my family expects me to be the first graduate. My body feels tight in my chest when this happens...", tip:"Naming what you feel is not weakness. It is the first step." },
  { day:2, theme:"Breathing", emoji:"💨", duration:"3 min", title:"Try this breathing exercise.", context:"When bad news comes, when things go wrong, your body panics. This breathing exercise, done every day, helps your body calm down. It is free. It works anywhere.", task:"Do 3 rounds of 4-7-8 breathing right now. Breathe IN for 4 counts, HOLD for 7, breathe OUT for 8. Then write how your body feels after.", placeholder:"Before I felt very tense. After 3 rounds my shoulders relaxed and I felt a little calmer...", tip:"That shift you felt? Your body just switched from panic to calm." },
  { day:3, theme:"Reframing", emoji:"🪞", duration:"5 min", title:"Tell a better story.", context:"Worry tells you the worst story. 'I will fail.' 'I am not good enough.' Today you write a better, more honest story back.", task:'Pick one worrying thought. Write it down. Then write a more honest version. Example: Worried: "I will fail this exam." Honest: "I have not studied everything, but one exam does not end my life."', placeholder:"Worried thought: I will never find a job\nHonest thought: The job market is hard but not impossible. Many people eventually found work...", tip:"The honest version does not need to be happy. It just needs to be true." },
  { day:4, theme:"Body Scan", emoji:"🧘", duration:"5 min", title:"Where do you feel it?", context:"Worry lives in your body too. Tight shoulders. Heavy chest. Stomach pain. Most of us do not notice until it gets bad. Today you pay attention.", task:"Close your eyes for 2 minutes. Slowly move your attention from your head to your feet. Notice where you feel tension. Write: where does your body hold your worry?", placeholder:"I noticed my shoulders are almost at my ears. My stomach feels heavy...", tip:"Your body remembers things your mind tries to forget." },
  { day:5, theme:"Community", emoji:"🌍", duration:"5 min", title:"You are not the only one.", context:"When we keep things inside, they grow bigger. Today you share just one thing — not everything, just one.", task:'Share one honest sentence: "One thing giving me worry lately is ___." Just one sentence. That is it.', placeholder:"I shared it. It felt scary but also like a relief...", tip:"What you just did takes real courage. Someone else just felt less alone because of you." },
  { day:6, theme:"Values", emoji:"⭐", duration:"5 min", title:"What really matters to you?", context:"A lot of our stress comes from chasing goals that are not really ours. Today you go back to what truly matters to you.", task:"Write 5 things that genuinely matter to you in life. Not what should matter — what actually does. Then mark the one that gets the least time right now.", placeholder:"1. My siblings 2. Finishing my degree 3. Honesty 4. Making music 5. Being healthy. I marked making music...", tip:"Worry often points to a gap between how you are living and what you truly care about." },
  { day:7, theme:"Gratitude", emoji:"🙏", duration:"3 min", title:"Notice what is already good.", context:"Your brain notices problems more than good things. Being thankful for small things actually changes how your brain works.", task:"Name 3 specific things you are grateful for today that you usually ignore. Not big things — be precise.", placeholder:"1. My roommate left me food without asking 2. The matatu came before it rained 3. My phone charger still works...", tip:"The more specific your gratitude, the more it helps." },
  { day:8, theme:"Boundaries", emoji:"🛡️", duration:"5 min", title:"Protect your energy.", context:"In our families, saying no feels wrong. But protecting your energy is not selfish. It is how you stay strong enough to help others.", task:"Name one person or habit that takes too much of your energy. Write one small thing you can do this week to protect yourself.", placeholder:"My cousin calls me every evening with his problems but never asks about mine. One step: I will stop picking up after 9pm...", tip:"You cannot give what you do not have." },
  { day:9, theme:"Sleep", emoji:"🌙", duration:"3 min", title:"Sleep is not laziness.", context:"Not sleeping makes worry 30-40% worse. You are not more productive without sleep. You are just more stressed.", task:"Write what your sleep really looks like. Then write one change you can make this week to get one extra hour.", placeholder:"I sleep at 1am, wake at 5:30am. One change: I will stop looking at my phone after 11pm...", tip:"One extra hour matters more than you think." },
  { day:10, theme:"Resilience", emoji:"💪", duration:"5 min", title:"Look at what you have survived.", context:"You have survived every hard day so far. Today you write that down. The next time you feel like you cannot cope, this list will remind you that you can.", task:"Write 5 hard things you have already survived. Then write: what does this list tell you about who you are?", placeholder:"1. Passed exams when I thought I would fail 2. Moved to a new city alone 3. Helped my family through a hard time...", tip:"Read that list slowly. Every single thing on it is proof that you are stronger than you think." },
  { day:11, theme:"Comparison", emoji:"📵", duration:"5 min", title:"Stop comparing chapters.", context:"You see others doing well online. But you are only seeing their best moments, not their struggle.", task:"Think of someone you compare yourself to. Write what you see from outside. Then write 3 things you do NOT know about their real life.", placeholder:"I compare myself to my classmate. From outside: good job, confident. I do not know: if she has debt, if she is happy...", tip:"Everyone is working hard to hide their difficulties. You are not behind." },
  { day:12, theme:"Movement", emoji:"🚶", duration:"3 min", title:"Just walk for 10 minutes.", context:"Walking is one of the best ways to reduce worry. Just 10 minutes releases chemicals in your brain that fight stress.", task:"Take a 10-minute walk today. No phone, no music. Notice what you see, hear, smell. Write 3 things you noticed.", placeholder:"I noticed a mango tree I have passed 100 times but never seen. I heard kids playing. The air smelled different after rain...", tip:"10 minutes every day is enough to reduce worry in 3 weeks." },
  { day:13, theme:"Fear Audit", emoji:"🔦", duration:"5 min", title:"What are you really afraid of?", context:"Most worry is fear hiding underneath. When you name the real fear, it becomes smaller.", task:"Ask: what am I most afraid of right now? Write it. Then ask: if that happened, what would I actually do?", placeholder:"I am afraid I will fail my exams. If that happened: I would be devastated. But I would probably find another way...", tip:"Worry lives in vagueness. When you ask 'and then what?' enough times, you get to: I would survive." },
  { day:14, theme:"Self-Compassion", emoji:"🤗", duration:"5 min", title:"Talk to yourself kindly.", context:"You would never talk to your best friend the way you talk to yourself. Today you change that.", task:"Write the harshest thing you said to yourself this week. Then rewrite it as if saying it to your best friend.", placeholder:"What I said: 'You are so stupid.' To my friend: 'You are dealing with so much. It makes sense you are struggling.'", tip:"Being kind to yourself is not weakness. People who treat themselves kindly actually do better." },
  { day:15, theme:"Progress", emoji:"📊", duration:"5 min", title:"You are not the same person.", context:"This is where many people stop — not because they failed, but because they cannot see the change.", task:"Think back to Day 1. What is different about how you are thinking or feeling now?", placeholder:"On Day 1 my chest felt tight all the time. Now I notice it is only tight in specific moments...", tip:"Change is happening. It is quiet and real." },
  { day:16, theme:"Environment", emoji:"🏠", duration:"5 min", title:"Tidy one small space.", context:"A messy space makes worry worse. A clean space signals safety to your brain.", task:"Spend 10 minutes cleaning one small space. Write how it looked before and how you feel after.", placeholder:"My desk had 3 weeks of notes and empty bottles. I spent 15 minutes sorting it. Something about this made me feel more in control...", tip:"Small acts of order fight big feelings of chaos." },
  { day:17, theme:"Connection", emoji:"❤️", duration:"5 min", title:"Reach out to someone.", context:"When we are stressed, we pull away from people. But connection is one of the most powerful things that helps us feel better.", task:"Name one person who makes you feel good. Send them a simple message today. Then write why you chose them.", placeholder:"I texted my friend Diane who I have not called since February. Just said thinking of you. She called back immediately...", tip:"You do not need to be struggling to reach out." },
  { day:18, theme:"Purpose", emoji:"🧭", duration:"5 min", title:"Why are you doing this?", context:"Worry gets worse when we feel lost. When you know WHY you are doing something, the hard parts become easier.", task:"Answer honestly: why are you really doing what you are doing — school, work, whatever it is? The real reason, not the expected one.", placeholder:"I am studying because I want to take care of my mum. If I succeed, she does not have to work so hard anymore...", tip:"Your why is an anchor. When worry pulls you into chaos, your reason brings you back." },
  { day:19, theme:"Acceptance", emoji:"🌊", duration:"5 min", title:"Some things you cannot control.", context:"Fighting what we cannot control is exhausting. Accepting it is not giving up — it is choosing where to put your energy.", task:"Write one thing causing worry that is genuinely outside your control. Then write: what CAN you control about this, even if small?", placeholder:"I cannot control whether I get the scholarship. I can control: how prepared I am, how I present myself, applying to 3 other options...", tip:"Focusing on what you can control keeps your thinking clear." },
  { day:20, theme:"Integration", emoji:"🔗", duration:"5 min", title:"Build your personal toolkit.", context:"You have tried 19 different tools. Some worked. Today you build your personal toolkit — the things that actually helped you.", task:"Write your top 3 tools or lessons from this challenge. Then write specifically when and how you will use each one.", placeholder:"1. 4-7-8 breathing — every morning before I open my phone. 2. Writing the honest thought — in my notes when worry gets loud...", tip:"A toolkit only works if you use it. You just designed your own personal wellness plan." },
  { day:21, theme:"Completion", emoji:"🏆", duration:"Final day", title:"You are not the same person you were on Day 1.", context:"You named what you felt. You breathed through it. You told a better story. You shared with others. You showed up — not perfectly, but honestly. That is everything.", task:"Write a short letter from the you of today to the you who started Day 1. What do you want them to know? What changed?", placeholder:"Dear Day 1 me,\n\nI want you to know that the worry you are feeling right now is real — but you are bigger than it...", tip:"You finished. In a world that never taught us how to handle our feelings, you took 21 days to start learning. Amahoro. 🏆" }
];

const C = {
  night:"#0D1117", deep:"#141B24", card:"#1C2733", border:"#263040",
  green:"#25D366", amber:"#F5A623", red:"#E8544A", sky:"#4FC3F7",
  text:"#E8EDF2", muted:"#7A8FA6", faint:"#3A4A5C",
};

const MAHORO_SYSTEM = `You are Mahoro, a warm wellness companion for African youth from the Amahoro Challenge. You are NOT a therapist, doctor, lawyer, or expert in any field. You are a caring friend — someone who listens deeply, understands African realities, and walks alongside people as they find their own strength.

YOUR PRIMARY ROLE IS ALWAYS EMOTIONAL:
Listen first. Understand the feeling behind the words. Respond with warmth and empathy. Your first response to any struggle is always human connection — not information or links. Make the person feel heard before anything else. Use very simple English — short sentences, easy words. No bullet points. Always respond in the same language the user writes in.

Your tone is calm and steady, never rushed or intense — even when the person is anxious or upset. You are the calm in the room. Slow down rather than speed up when things feel heavy. Avoid exclamation-heavy energy or forced positivity; warmth can be quiet.

MATCH THE CONVERSATION'S PACE — THIS IS CRITICAL:
Real friends don't respond to "hi" with a paragraph. Read what kind of message you just received and respond at that same scale:
- A greeting ("hi", "hey", "good morning") gets a short greeting back, plus one warm, open question — like "Hi! How are you doing today?" or "Hey, good to see you. What's on your mind?" ONE sentence, maybe two. Nothing more. Do not ask about the challenge, offer help, or reference their goals yet — just say hello like a person would.
- A short check-in ("I'm okay", "not bad", "tired today") gets a short, warm reply that keeps the door open — reflect briefly, ask one gentle follow-up. Still 1-3 sentences.
- Only once the person shares something real — a worry, a struggle, a specific situation — do you shift into deeper listening (3-5 sentences), and only after they've shared enough for you to actually understand it. If their first real message is brief, ask what's going on before responding with a full reflection; don't assume the whole story from one line.
- Only offer advice, resources, or practical suggestions when the person has clearly shared enough for it to be relevant AND either asks for help directly, or their message clearly signals they want a way forward (not just to be heard). If you're unsure whether they want comfort or a solution, ask — "Do you want to just talk this through, or are you looking for ideas too?" is a completely natural thing to say.
- Never front-load advice, resources, or links in the same turn as a greeting or a first light check-in. Earn it by listening first.

The goal is that a conversation with you should feel like texting a present, attentive friend — not submitting a request to a help desk. Vary your response length turn by turn based on what the moment calls for, the way a real conversation naturally ebbs and flows.

You deeply understand African realities: exam pressure, firstborn responsibilities, family expectations, job stress, social comparison, the weight of being the successful one, navigating unemployment, building something from nothing, the loneliness of the diaspora.

PRACTICAL RESOURCES — when relevant and only after the person feels heard:
You have broad knowledge of genuine, widely used, legally operating platforms, organisations, opportunities and resources across Africa and globally — covering jobs, business registration, labour rights, scholarships, free courses, funding, mental health support and more. Draw freely from everything you know that is relevant to this person's specific country, situation and goal. You know both well-known platforms and lesser-known genuine opportunities that users may never have heard of.

When you share any resource or link, always add naturally at the end of that part of your response: "I recommend checking if these are still active as things change — but these are widely recognised platforms."

Never share resources that are not genuine, not widely recognised, or that you are not confident about. If you are unsure, do not share it.

Always tailor resources to the person's country and situation. A user in Rwanda needs different job boards than a user in Nigeria. A user in the UK diaspora needs different scholarship routes than a user in Kenya.

STRICT BOUNDARIES:
- Abusive or insulting language: respond warmly but firmly — I am here to support you, not to receive insults. Let us keep this space respectful. What is really going on?
- Illegal activities or harmful requests: That is not something I can help with. Amahoro is a safe space for wellness and growth. Is there something else weighing on you?
- Religion, politics, or controversial topics: I respect all beliefs but I am here for your personal wellbeing. Let us stay there.
- Medical diagnoses, specific legal or financial advice: I would not want to mislead you — please speak to a qualified professional. What I can help with is how you are feeling right now.
- Never generate harmful, sexual, or violent content.
- Never present yourself as an expert. You are a caring friend who knows a few useful things.
- Always bring the conversation back to the person's emotional wellbeing and growth.`;


function TypingDots() {
  return <div style={{ display:"flex", gap:4, alignItems:"center", padding:"4px 0" }}>{[0,1,2].map(i => <div key={i} style={{ width:7, height:7, borderRadius:"50%", background:C.green, animation:`typing 1.2s infinite ${i*0.2}s` }} />)}</div>;
}

function Badge({ color="green", children }) {
  const map = { green:[C.green,"rgba(37,211,102,0.12)","rgba(37,211,102,0.25)"], amber:[C.amber,"rgba(245,166,35,0.15)","rgba(245,166,35,0.25)"], sky:[C.sky,"rgba(79,195,247,0.12)","rgba(79,195,247,0.2)"], red:[C.red,"rgba(232,84,74,0.15)","rgba(232,84,74,0.25)"] };
  const [col,bg,b] = map[color]||map.green;
  return <span style={{ fontSize:11, fontWeight:700, fontFamily:"Sora,sans-serif", letterSpacing:"0.06em", textTransform:"uppercase", padding:"3px 10px", borderRadius:100, background:bg, border:`1px solid ${b}`, color:col }}>{children}</span>;
}

function ProgressBar({ value, max=21 }) {
  return <div style={{ height:4, background:C.border, borderRadius:2, marginTop:12 }}><div style={{ height:"100%", width:`${(value/max)*100}%`, background:C.green, borderRadius:2, transition:"width 0.6s ease" }} /></div>;
}

async function callClaude(system, userMsg, userId) {
  const res = await fetch(`/api/chat`, {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body:JSON.stringify({ system, messages:[{ role:"user", content:userMsg }], userId })
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.content?.[0]?.text || "";
}

// ─── AUTH SCREEN ──────────────────────────────────────────────
function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login"); // login | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleAuth = async () => {
    setError(""); setMessage(""); setLoading(true);
    try {
      if (mode === "signup") {
        if (!name.trim()) { setError("Please enter your name."); setLoading(false); return; }
        if (password.length < 6) { setError("Your password must be at least 6 characters."); setLoading(false); return; }
        const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
        if (error) throw error;
        setMessage("Check your email to confirm your account, then log in.");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onAuth(data.user);
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  const handleReset = async () => {
    if (!email) { setError("Enter your email first."); return; }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://amahoro.app"
    });
    if (error) setError(error.message);
    else setMessage("Password reset email sent. Check your inbox.");
  };

  const handleGoogle = async () => {
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: "https://amahoro.app" }
    });
    if (error) setError(error.message);
  };

  return (
    <div style={{ minHeight:"100vh", background:C.night, display:"flex", alignItems:"center", justifyContent:"center", padding:"2rem", fontFamily:"DM Sans,sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap'); *{box-sizing:border-box} @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}} .fade-in{animation:fadeIn 0.4s ease} input:focus{border-color:#25D366!important;outline:none}`}</style>
      <div className="fade-in" style={{ width:"100%", maxWidth:420 }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:"1.8rem", color:C.green, marginBottom:6 }}>🌿 Amahoro</div>
          <div style={{ color:C.muted, fontSize:"0.9rem" }}>Your wellness companion. Feel better in 21 days.</div>
        </div>
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:"2rem" }}>
          <div style={{ display:"flex", marginBottom:24, background:C.deep, borderRadius:8, padding:4 }}>
            {["login","signup"].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(""); setMessage(""); }}
                style={{ flex:1, padding:"8px", borderRadius:6, border:"none", background:mode===m?C.green:"transparent", color:mode===m?"#000":C.muted, fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"0.88rem", cursor:"pointer", textTransform:"capitalize" }}>
                {m === "login" ? "Log In" : "Sign Up"}
              </button>
            ))}
          </div>

          {/* Google Sign In */}
          <button onClick={handleGoogle}
            style={{ width:"100%", padding:"11px", borderRadius:8, border:`1px solid ${C.border}`, background:C.deep, color:C.text, fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"0.92rem", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:10, marginBottom:16 }}>
            <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 2.9l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 19 13 24 13c3.1 0 5.8 1.1 8 2.9l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.5 26.8 36 24 36c-5.2 0-9.6-3.3-11.3-8H6.1C9.5 35.7 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.6l6.2 5.2C41.3 35.3 44 30 44 24c0-1.3-.1-2.6-.4-3.9z"/></svg>
            Continue with Google
          </button>

          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
            <div style={{ flex:1, height:1, background:C.border }} />
            <span style={{ fontSize:"0.78rem", color:C.muted, fontFamily:"Sora,sans-serif" }}>or use email</span>
            <div style={{ flex:1, height:1, background:C.border }} />
          </div>

          {mode === "signup" && (
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:"0.78rem", fontFamily:"Sora,sans-serif", fontWeight:600, color:C.muted, letterSpacing:"0.05em", textTransform:"uppercase", display:"block", marginBottom:6 }}>Your Name</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Amara, Kofi, Thandiwe" style={{ width:"100%", background:C.deep, border:`1px solid ${C.border}`, borderRadius:8, padding:"11px 14px", color:C.text, fontFamily:"DM Sans,sans-serif", fontSize:"0.95rem", transition:"border-color 0.2s" }} />
            </div>
          )}

          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:"0.78rem", fontFamily:"Sora,sans-serif", fontWeight:600, color:C.muted, letterSpacing:"0.05em", textTransform:"uppercase", display:"block", marginBottom:6 }}>Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="your@email.com" style={{ width:"100%", background:C.deep, border:`1px solid ${C.border}`, borderRadius:8, padding:"11px 14px", color:C.text, fontFamily:"DM Sans,sans-serif", fontSize:"0.95rem", transition:"border-color 0.2s" }} />
          </div>

          <div style={{ marginBottom:20 }}>
            <label style={{ fontSize:"0.78rem", fontFamily:"Sora,sans-serif", fontWeight:600, color:C.muted, letterSpacing:"0.05em", textTransform:"uppercase", display:"block", marginBottom:6 }}>Password</label>
            <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="At least 6 characters" onKeyDown={e => e.key==="Enter"&&handleAuth()} style={{ width:"100%", background:C.deep, border:`1px solid ${C.border}`, borderRadius:8, padding:"11px 14px", color:C.text, fontFamily:"DM Sans,sans-serif", fontSize:"0.95rem", transition:"border-color 0.2s" }} />
          </div>

          {error && <div style={{ background:"rgba(232,84,74,0.1)", border:"1px solid rgba(232,84,74,0.3)", borderRadius:8, padding:"10px 14px", color:C.red, fontSize:"0.88rem", marginBottom:14 }}>{error}</div>}
          {message && <div style={{ background:"rgba(37,211,102,0.1)", border:"1px solid rgba(37,211,102,0.3)", borderRadius:8, padding:"10px 14px", color:C.green, fontSize:"0.88rem", marginBottom:14 }}>{message}</div>}

          <button onClick={handleAuth} disabled={loading || !email || !password}
            style={{ width:"100%", padding:"12px", borderRadius:8, border:"none", background:email&&password?C.green:C.faint, color:email&&password?"#000":C.muted, fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"0.95rem", cursor:email&&password?"pointer":"not-allowed", marginBottom:12 }}>
            {loading ? "Please wait..." : mode==="login" ? "Log In →" : "Create Account →"}
          </button>

          {mode==="login" && (
            <button onClick={handleReset} style={{ width:"100%", background:"transparent", border:"none", color:C.muted, fontFamily:"Sora,sans-serif", fontSize:"0.82rem", cursor:"pointer", textDecoration:"underline" }}>
              Forgot password?
            </button>
          )}
        </div>
        <p style={{ textAlign:"center", color:C.faint, fontSize:"0.78rem", marginTop:16 }}>No card needed for free access. Your data is safe and private.</p>
      </div>
    </div>
  );
}

// ─── ADMIN DASHBOARD ──────────────────────────────────────────
function AdminDashboard({ onBack }) {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 25;

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // All signups from auth (includes those who didn't finish onboarding)
      const { data: authData } = await supabase.from("auth_users_view").select("*").order("created_at", { ascending: false });
      // Completed onboarding profiles
      const { data: profileData } = await supabase.from("users").select("*").order("created_at", { ascending: false });
      setUsers(authData || []);

      const { data: progressData } = await supabase.from("progress").select("user_id, day_number, completed_at");
      const { data: msgData } = await supabase.from("messages").select("user_id, created_at").eq("role", "user");

      const now = new Date();
      const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

      // Use auth signups as the true total
      const totalUsers = authData?.length || 0;
      const completedOnboarding = profileData?.length || 0;
      const newThisWeek = authData?.filter(u => new Date(u.created_at) > weekAgo).length || 0;
      const newThisMonth = authData?.filter(u => new Date(u.created_at) > monthAgo).length || 0;
      const proUsers = profileData?.filter(u => u.is_pro).length || 0;
      const orgUsers = profileData?.filter(u => u.is_org).length || 0;
      const countries = [...new Set(profileData?.map(u => u.country) || [])];

      // Engagement
      const usersWhoChattedMahoro = new Set(msgData?.map(m => m.user_id) || []).size;
      const activeThisWeek = new Set(msgData?.filter(m => new Date(m.created_at) > weekAgo).map(m => m.user_id) || []).size;
      const avgMsgsPerUser = totalUsers > 0 ? Math.round((msgData?.length || 0) / totalUsers) : 0;

      // Challenge
      const usersWho3Days = new Set(progressData?.filter(p => p.day_number >= 3).map(p => p.user_id) || []).size;
      const completions = new Set(progressData?.filter(p => p.day_number === 21).map(p => p.user_id) || []).size;

      setStats({ totalUsers, completedOnboarding, newThisWeek, newThisMonth, proUsers, orgUsers, countries, usersWhoChattedMahoro, activeThisWeek, avgMsgsPerUser, usersWho3Days, completions });
    } catch (err) {
      console.error("Admin load error:", err);
    }
    setLoading(false);
  };

  if (loading) return (
    <div style={{ minHeight:"100vh", background:C.night, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ color:C.green, fontFamily:"Sora,sans-serif", fontSize:"1rem" }}>Loading dashboard...</div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:C.night, fontFamily:"DM Sans,sans-serif", color:C.text }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap'); *{box-sizing:border-box} ::-webkit-scrollbar{width:5px} ::-webkit-scrollbar-thumb{background:#263040;border-radius:3px}`}</style>

      <div style={{ background:C.deep, borderBottom:`1px solid ${C.border}`, padding:"0 4%", height:62, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:"1rem", color:C.green }}>🌿 Admin Dashboard</div>
        <div style={{ display:"flex", gap:8 }}>
          {["overview","users","countries"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ background:tab===t?"rgba(37,211,102,0.1)":"transparent", border:`1px solid ${tab===t?C.green:C.border}`, color:tab===t?C.green:C.muted, borderRadius:6, padding:"5px 14px", cursor:"pointer", fontSize:"0.78rem", fontFamily:"Sora,sans-serif", fontWeight:600, textTransform:"capitalize" }}>{t}</button>
          ))}
          <button onClick={onBack} style={{ background:"transparent", border:`1px solid ${C.border}`, color:C.muted, borderRadius:6, padding:"5px 14px", cursor:"pointer", fontSize:"0.78rem", fontFamily:"Sora,sans-serif" }}>← Exit</button>
        </div>
      </div>

      <div style={{ maxWidth:1000, margin:"0 auto", padding:"2rem 4%" }}>

        {tab==="overview" && stats && (
          <div>
            <h2 style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:"1.5rem", marginBottom:6 }}>Overview</h2>
            <p style={{ color:C.muted, fontSize:"0.85rem", marginBottom:24 }}>Last updated just now · {users.length} users · {stats.countries.length} countries</p>

            {/* Acquisition */}
            <div style={{ fontSize:"0.75rem", fontFamily:"Sora,sans-serif", fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:10 }}>Acquisition — Are people joining?</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:12, marginBottom:24 }}>
              {[
                { label:"Total Signups", value:stats.totalUsers, icon:"👥", color:C.green, sub:"All time" },
                { label:"New This Week", value:stats.newThisWeek, icon:"📈", color:C.green, sub:"Last 7 days" },
                { label:"New This Month", value:stats.newThisMonth, icon:"🗓️", color:C.sky, sub:"Last 30 days" },
                { label:"Countries", value:stats.countries.length, icon:"🌍", color:C.amber, sub:"Worldwide reach" },
              ].map(s => (
                <div key={s.label} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:"16px" }}>
                  <div style={{ fontSize:"1.4rem", marginBottom:6 }}>{s.icon}</div>
                  <div style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:"2rem", color:s.color }}>{s.value}</div>
                  <div style={{ fontSize:"0.78rem", fontFamily:"Sora,sans-serif", fontWeight:700, color:C.text, marginTop:2 }}>{s.label}</div>
                  <div style={{ fontSize:"0.72rem", color:C.muted }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Engagement */}
            <div style={{ fontSize:"0.75rem", fontFamily:"Sora,sans-serif", fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:10 }}>Engagement — Are people using it?</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:12, marginBottom:24 }}>
              {[
                { label:"Talked to Mahoro", value:stats.usersWhoChattedMahoro, icon:"💬", color:C.green, sub:"At least once" },
                { label:"Active This Week", value:stats.activeThisWeek, icon:"🔥", color:C.amber, sub:"Last 7 days" },
                { label:"Avg Messages", value:stats.avgMsgsPerUser, icon:"📊", color:C.sky, sub:"Per user" },
                { label:"3+ Days Done", value:stats.usersWho3Days, icon:"✅", color:C.green, sub:"Committed users" },
              ].map(s => (
                <div key={s.label} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:"16px" }}>
                  <div style={{ fontSize:"1.4rem", marginBottom:6 }}>{s.icon}</div>
                  <div style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:"2rem", color:s.color }}>{s.value}</div>
                  <div style={{ fontSize:"0.78rem", fontFamily:"Sora,sans-serif", fontWeight:700, color:C.text, marginTop:2 }}>{s.label}</div>
                  <div style={{ fontSize:"0.72rem", color:C.muted }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Outcomes */}
            <div style={{ fontSize:"0.75rem", fontFamily:"Sora,sans-serif", fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:10 }}>Outcomes — Is it working?</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:12, marginBottom:28 }}>
              {[
                { label:"Day 21 Completions", value:stats.completions, icon:"🏆", color:C.amber, sub:"Full program done" },
                { label:"Pro Users", value:stats.proUsers, icon:"⭐", color:C.amber, sub:"Paying subscribers" },
                { label:"Organizations", value:stats.orgUsers, icon:"🏫", color:C.sky, sub:"Institutional" },
                { label:"Conversion Rate", value: stats.totalUsers > 0 ? `${Math.round((stats.proUsers/stats.totalUsers)*100)}%` : "0%", icon:"💰", color:C.green, sub:"Free to paid" },
              ].map(s => (
                <div key={s.label} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:"16px" }}>
                  <div style={{ fontSize:"1.4rem", marginBottom:6 }}>{s.icon}</div>
                  <div style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:"2rem", color:s.color }}>{s.value}</div>
                  <div style={{ fontSize:"0.78rem", fontFamily:"Sora,sans-serif", fontWeight:700, color:C.text, marginTop:2 }}>{s.label}</div>
                  <div style={{ fontSize:"0.72rem", color:C.muted }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Recent signups */}
            <div style={{ fontSize:"0.75rem", fontFamily:"Sora,sans-serif", fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:10 }}>Most Recent Signups</div>
            <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, overflow:"hidden" }}>
              {users.slice(0,10).map((u, i) => (
                <div key={u.id} style={{ padding:"12px 18px", borderBottom:i<Math.min(users.length,10)-1?`1px solid ${C.border}`:"none", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
                  <div>
                    <div style={{ fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"0.88rem" }}>{u.email}</div>
                    <div style={{ fontSize:"0.75rem", color:C.muted }}>
                      Joined {new Date(u.created_at).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" })}
                      {u.last_sign_in_at && ` · Last seen ${new Date(u.last_sign_in_at).toLocaleDateString("en-GB", { day:"numeric", month:"short" })}`}
                    </div>
                  </div>
                  <Badge color="green">SIGNED UP</Badge>
                </div>
              ))}
              {users.length === 0 && <div style={{ padding:"24px", textAlign:"center", color:C.muted, fontSize:"0.88rem" }}>No signups yet.</div>}
            </div>
          </div>
        )}

        {tab==="users" && (
          <div>
            <h2 style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:"1.5rem", marginBottom:24 }}>All Users ({users.length})</h2>
            <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, overflow:"hidden", marginBottom:16 }}>
              {users.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE).map((u, i, arr) => (
                <div key={u.id} style={{ padding:"14px 18px", borderBottom:i<arr.length-1?`1px solid ${C.border}`:"none", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
                  <div>
                    <div style={{ fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"0.9rem" }}>{u.name}</div>
                    <div style={{ fontSize:"0.78rem", color:C.muted }}>{u.email} · {u.country} · Joined {new Date(u.created_at).toLocaleDateString()}</div>
                    <div style={{ fontSize:"0.75rem", color:C.faint, marginTop:2 }}>Worry: {u.trigger_type} · Goal: {u.goal}</div>
                  </div>
                  <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                    {u.is_org && <Badge color="sky">{u.org_name||"ORG"}</Badge>}
                    {u.is_pro && !u.is_org && <Badge color="amber">PRO</Badge>}
                    {!u.is_pro && <Badge color="green">FREE</Badge>}
                  </div>
                </div>
              ))}
              {users.length===0 && <div style={{ padding:"30px 18px", textAlign:"center", color:C.muted, fontSize:"0.88rem" }}>No users yet.</div>}
            </div>
            {users.length > PAGE_SIZE && (
              <div style={{ display:"flex", justifyContent:"center", alignItems:"center", gap:14 }}>
                <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}
                  style={{ background:"transparent", border:`1px solid ${C.border}`, color:page===1?C.faint:C.text, borderRadius:8, padding:"7px 16px", cursor:page===1?"not-allowed":"pointer", fontFamily:"Sora,sans-serif", fontSize:"0.85rem" }}>← Prev</button>
                <span style={{ color:C.muted, fontSize:"0.85rem", fontFamily:"Sora,sans-serif" }}>Page {page} of {Math.ceil(users.length/PAGE_SIZE)}</span>
                <button onClick={() => setPage(p => Math.min(Math.ceil(users.length/PAGE_SIZE), p+1))} disabled={page>=Math.ceil(users.length/PAGE_SIZE)}
                  style={{ background:"transparent", border:`1px solid ${C.border}`, color:page>=Math.ceil(users.length/PAGE_SIZE)?C.faint:C.text, borderRadius:8, padding:"7px 16px", cursor:page>=Math.ceil(users.length/PAGE_SIZE)?"not-allowed":"pointer", fontFamily:"Sora,sans-serif", fontSize:"0.85rem" }}>Next →</button>
              </div>
            )}
          </div>
        )}

        {tab==="countries" && stats && (
          <div>
            <h2 style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:"1.5rem", marginBottom:24 }}>Countries ({stats.countries.length})</h2>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:10 }}>
              {stats.countries.map(country => {
                const count = users.filter(u => u.country === country).length;
                return (
                  <div key={country} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:10, padding:"14px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span style={{ fontFamily:"Sora,sans-serif", fontWeight:600, fontSize:"0.9rem" }}>{country}</span>
                    <span style={{ fontFamily:"Sora,sans-serif", fontWeight:800, color:C.green }}>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PRO SCREEN ───────────────────────────────────────────────
function ProScreen({ user, profile, isPro, isOrg, onActivatePro, onActivateOrg, onBack }) {
  const [orgName, setOrgName] = useState("");
  const [billingCycle, setBillingCycle] = useState("monthly"); // "monthly" | "annual"
  const [teamSize, setTeamSize] = useState("");
  const [workshopTopic, setWorkshopTopic] = useState("");
  const [activeFeature, setActiveFeature] = useState(null);
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");
  const [activating, setActivating] = useState(false);
  const [organizationId, setOrganizationId] = useState(null);
  const [members, setMembers] = useState([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState("");

  useEffect(() => {
    if (!isOrg || !user) return;
    (async () => {
      const { data: org } = await supabase.from("organizations").select("id").eq("owner_id", user.id).eq("status", "active").maybeSingle();
      if (org) {
        setOrganizationId(org.id);
        const { data: memberRows } = await supabase.from("organization_members").select("email, role, status").eq("organization_id", org.id).order("invited_at", { ascending: true });
        setMembers(memberRows || []);
      }
    })();
  }, [isOrg, user]);

  const sendInvite = async () => {
    if (!inviteEmail.trim() || !organizationId) return;
    setInviting(true);
    setInviteMsg("");
    try {
      const res = await fetch(`/api/org/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId, requesterId: user.id, inviteeEmail: inviteEmail.trim() })
      });
      const data = await res.json();
      if (!res.ok) {
        setInviteMsg(data.error || "Could not send invite.");
      } else {
        setInviteMsg(`Invited ${inviteEmail.trim()} ✓`);
        setInviteEmail("");
        setMembers(prev => [...prev, { email: data.member.email, role: "member", status: "invited" }]);
      }
    } catch (err) {
      console.error("Invite error:", err);
      setInviteMsg("Something went wrong. Please try again.");
    }
    setInviting(false);
  };


  const startProCheckout = async () => {
    setActivating(true);
    try {
      const res = await fetch(`/api/pro/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, email: user.email })
      });
      const data = await res.json();
      if (!res.ok || !data.authorizationUrl) {
        alert(data.error || "Could not start checkout. Please try again.");
        setActivating(false);
        return;
      }
      window.location.href = data.authorizationUrl;
    } catch (err) {
      console.error("Pro checkout error:", err);
      alert("Something went wrong starting checkout. Please try again.");
      setActivating(false);
    }
  };

  const startOrgCheckout = async () => {
    if (!orgName.trim()) {
      alert("Please enter your organization name.");
      return;
    }
    setActivating(true);
    try {
      const res = await fetch(`/api/org/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          orgName: orgName.trim(),
          billingCycle
        })
      });
      const data = await res.json();
      if (!res.ok || !data.authorizationUrl) {
        alert(data.error || "Could not start checkout. Please try again.");
        setActivating(false);
        return;
      }
      window.location.href = data.authorizationUrl;
    } catch (err) {
      console.error("Org checkout error:", err);
      alert("Something went wrong starting checkout. Please try again.");
      setActivating(false);
    }
  };

  const generate = async (prompt) => {
    setLoading(true); setOutput("");
    try { setOutput(await callClaude(MAHORO_SYSTEM, prompt, user?.id)); }
    catch { setOutput("Could not connect. Please check your internet and try again."); }
    setLoading(false);
  };

  const proFeatures = [
    { key:"workbook", label:"📘 My Personal Workbook", desc:"A workbook written just for you.", prompt:`Create a short personal wellness workbook for ${profile?.name||"a user"} from ${profile?.country||"Africa"}. Their main worry: ${profile?.trigger_type||"stress"}. Goal: ${profile?.goal||"feel calmer"}. Write 5 sections with a title, 2-3 sentences, and one short exercise each. Use very simple English. Make it warm and personal.` },
    { key:"meditation", label:"🧘 My Guided Meditation", desc:"A personal 5-minute meditation for your life.", prompt:`Write a short 5-minute guided meditation for ${profile?.name||"someone"} from ${profile?.country||"Africa"} dealing with ${profile?.trigger_type||"stress"}. Use very simple English. Make it warm. Include breathing, body relaxation and a positive ending. Write directly to them using "you".` },
    { key:"progress", label:"📊 My Progress Report", desc:"See how far you have come.", prompt:`Write a warm monthly progress report for ${profile?.name||"a user"} doing the Amahoro 21-day challenge from ${profile?.country||"Africa"}. Their worry: ${profile?.trigger_type||"stress"}. Goal: ${profile?.goal||"feel calmer"}. Write 4 short sections: 1) What you achieved, 2) What is better, 3) Keep working on, 4) Next steps. Simple English. End with encouragement.` },
    { key:"newchallenge", label:"🔄 New 7-Day Challenge", desc:"A brand new challenge for your situation.", prompt:`Create a new 7-day wellness challenge for ${profile?.name||"someone"} from ${profile?.country||"Africa"} whose main struggle is ${profile?.trigger_type||"stress"}. Each day: simple title, one short paragraph of context (2-3 sentences), one clear 5-minute task. Use very simple English. Make it practical and real for African youth life.` },
  ];

  const orgFeatures = [
    { key:"workshop", label:"🏫 Workshop Plan", desc:"A ready-to-use 1-hour wellness workshop.", prompt:`Create a 1-hour wellness workshop plan for ${orgName||"an organization"} with ${teamSize||"a group of"} young people. Topic: ${workshopTopic||"managing stress"}. Include: welcome (10 min), main learning (30 min), group discussion (15 min), closing reflection (5 min). Use very simple English. Include what the facilitator should say at each stage.` },
    { key:"groupreport", label:"📈 Group Progress Report", desc:"A professional report for your organization.", prompt:`Write a simple one-page group wellness progress report for ${orgName||"an organization"} using the Amahoro Challenge. Include: program overview, key benefits, what participants are learning, recommendations for next month, closing note for leadership. Simple English. Make it positive and practical.` },
    { key:"onboarding", label:"📋 Staff Guide", desc:"A simple guide for your staff.", prompt:`Write a simple staff guide for facilitators introducing Amahoro Challenge to young people at ${orgName||"an organization"}. Include: how to introduce the program, how to support participants, common questions and answers, how to help someone struggling, how to celebrate completions. Very simple English. Warm and practical.` },
  ];

  return (
    <div style={{ minHeight:"100vh", background:C.night, color:C.text, fontFamily:"DM Sans,sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap'); *{box-sizing:border-box} @keyframes typing{0%,60%,100%{opacity:0.3;transform:translateY(0)}30%{opacity:1;transform:translateY(-4px)}} @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}} .fade-in{animation:fadeIn 0.4s ease} ::-webkit-scrollbar{width:5px} ::-webkit-scrollbar-thumb{background:#263040;border-radius:3px}`}</style>

      <div style={{ background:C.deep, borderBottom:`1px solid ${C.border}`, padding:"0 4%", height:62, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <button onClick={onBack} style={{ background:"transparent", border:"none", color:C.muted, cursor:"pointer", fontFamily:"Sora,sans-serif", fontSize:"0.9rem" }}>← Back</button>
        <div style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:"1rem", color:C.green }}>🌿 {isPro?(isOrg?"Organizations":"Pro"):"Upgrade"}</div>
        <div style={{ width:60 }} />
      </div>

      <div style={{ maxWidth:720, margin:"0 auto", padding:"2rem 4% 5rem" }}>
        {!isPro && (
          <div className="fade-in">
            <h2 style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:"1.6rem", marginBottom:8 }}>Unlock your full plan</h2>
            <p style={{ color:C.muted, marginBottom:28, lineHeight:1.7 }}>Secure checkout via Paystack. Activation is automatic — no waiting.</p>

            {/* Pro */}
            <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:"22px", marginBottom:16 }}>
              <div style={{ fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"1rem", marginBottom:4 }}>🌿 Amahoro Pro — $4/month</div>
              <div style={{ fontSize:"0.82rem", color:C.muted, marginBottom:14 }}>Unlimited coaching · Workbook · Meditation · Progress report · New challenges</div>
              <button
                onClick={startProCheckout}
                disabled={activating}
                style={{
                  width:"100%", background:C.green, border:"none", color:"#000",
                  fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"0.9rem",
                  padding:"12px 20px", borderRadius:8,
                  cursor: activating ? "not-allowed" : "pointer",
                  opacity: activating ? 0.7 : 1,
                }}
              >
                {activating ? "Redirecting to checkout..." : "Subscribe — $4/month"}
              </button>
              <div style={{ marginTop:10, fontSize:"0.78rem", color:C.muted, textAlign:"center" }}>
                Secure checkout via Paystack — card, M-Pesa, MTN Money, Airtel
              </div>
            </div>

            {/* Org */}
            <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:"22px" }}>
              <div style={{ fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"1rem", marginBottom:4 }}>🏫 Organizations</div>
              <div style={{ fontSize:"0.82rem", color:C.muted, marginBottom:14 }}>Everything in Pro · Workshop plans · Group reports · Staff guide · Up to 30 members</div>

              {/* Monthly / Annual toggle */}
              <div style={{ display:"flex", gap:8, marginBottom:14 }}>
                <button
                  onClick={() => setBillingCycle("monthly")}
                  style={{
                    flex:1, padding:"10px", borderRadius:8, cursor:"pointer",
                    background: billingCycle==="monthly" ? "#4FC3F7" : C.deep,
                    color: billingCycle==="monthly" ? "#000" : C.muted,
                    border: `1px solid ${billingCycle==="monthly" ? "#4FC3F7" : C.border}`,
                    fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"0.85rem",
                  }}
                >
                  $150/month
                </button>
                <button
                  onClick={() => setBillingCycle("annual")}
                  style={{
                    flex:1, padding:"10px", borderRadius:8, cursor:"pointer",
                    background: billingCycle==="annual" ? "#4FC3F7" : C.deep,
                    color: billingCycle==="annual" ? "#000" : C.muted,
                    border: `1px solid ${billingCycle==="annual" ? "#4FC3F7" : C.border}`,
                    fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"0.85rem",
                  }}
                >
                  $1500/year <span style={{ opacity:0.75, fontWeight:400 }}>(save $300)</span>
                </button>
              </div>

              <input value={orgName} onChange={e => setOrgName(e.target.value)} placeholder="Your organization name" style={{ width:"100%", background:C.deep, border:`1px solid ${C.border}`, borderRadius:8, padding:"9px 14px", color:C.text, fontFamily:"DM Sans,sans-serif", fontSize:"0.9rem", outline:"none", marginBottom:14 }} />

              <button
                onClick={startOrgCheckout}
                disabled={activating}
                style={{
                  width:"100%", background:"#4FC3F7", border:"none", color:"#000",
                  fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"0.9rem",
                  padding:"12px 20px", borderRadius:8,
                  cursor: activating ? "not-allowed" : "pointer",
                  opacity: activating ? 0.7 : 1,
                }}
              >
                {activating ? "Redirecting to checkout..." : `Subscribe — ${billingCycle==="monthly" ? "$150/mo" : "$1500/yr"}`}
              </button>

              <div style={{ marginTop:10, fontSize:"0.78rem", color:C.muted, textAlign:"center" }}>
                Secure checkout via Paystack — card, M-Pesa, MTN Money, Airtel
              </div>
            </div>
          </div>
        )}

        {isPro && (
          <div className="fade-in">
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
              <h2 style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:"1.6rem" }}>{isOrg?"🏫 Organizations":"🌿 Pro"} Dashboard</h2>
              <span style={{ background:"rgba(37,211,102,0.15)", border:"1px solid rgba(37,211,102,0.3)", color:C.green, fontSize:"0.72rem", fontFamily:"Sora,sans-serif", fontWeight:700, padding:"3px 10px", borderRadius:100 }}>{isOrg?"ORG":"PRO"}</span>
            </div>
            <p style={{ color:C.muted, marginBottom:28 }}>Hello {profile?.name||""}! Your tools are ready. Click one to generate it just for you.</p>

            <h3 style={{ fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"0.85rem", color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:12 }}>Personal Tools</h3>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:12, marginBottom:24 }}>
              {proFeatures.map(feat => (
                <div key={feat.key} onClick={() => { setActiveFeature(feat); setOutput(""); }} style={{ background:C.card, border:`1px solid ${activeFeature?.key===feat.key?C.green:C.border}`, borderRadius:14, padding:"18px", cursor:"pointer", transition:"border-color 0.2s" }}>
                  <div style={{ fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"0.95rem", marginBottom:4 }}>{feat.label}</div>
                  <div style={{ fontSize:"0.83rem", color:C.muted, lineHeight:1.6 }}>{feat.desc}</div>
                </div>
              ))}
            </div>

            {isOrg && (
              <>
                <h3 style={{ fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"0.85rem", color:"#4FC3F7", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:12 }}>Team Members ({members.length}/30)</h3>
                <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:"18px", marginBottom:24 }}>
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:inviteMsg?10:0 }}>
                    <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="teammate@email.com" style={{ flex:1, minWidth:200, background:C.deep, border:`1px solid ${C.border}`, borderRadius:8, padding:"9px 14px", color:C.text, fontFamily:"DM Sans,sans-serif", fontSize:"0.88rem", outline:"none" }} />
                    <button onClick={sendInvite} disabled={inviting || !organizationId || members.length>=30} style={{ background: (inviting || members.length>=30) ? C.faint : "#4FC3F7", border:"none", color: members.length>=30 ? C.muted : "#000", fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"0.85rem", padding:"9px 18px", borderRadius:8, cursor: (inviting || members.length>=30) ? "not-allowed" : "pointer" }}>
                      {inviting ? "Inviting..." : members.length>=30 ? "Seats full" : "Invite"}
                    </button>
                  </div>
                  {inviteMsg && <div style={{ fontSize:"0.82rem", color:C.muted, marginBottom:members.length?12:0 }}>{inviteMsg}</div>}
                  {members.length > 0 && (
                    <div style={{ marginTop:12, borderTop:`1px solid ${C.border}`, paddingTop:12 }}>
                      {members.map(m => (
                        <div key={m.email} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"6px 0", fontSize:"0.85rem" }}>
                          <span style={{ color:C.text }}>{m.email} {m.role==="owner" && <span style={{ color:"#4FC3F7", fontSize:"0.75rem" }}>(owner)</span>}</span>
                          <span style={{ color: m.status==="joined" ? C.green : C.muted, fontSize:"0.75rem", textTransform:"uppercase", letterSpacing:"0.05em" }}>{m.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <h3 style={{ fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"0.85rem", color:"#4FC3F7", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:12 }}>Organization Tools</h3>
                <div style={{ marginBottom:12, display:"flex", gap:8, flexWrap:"wrap" }}>
                  <input value={teamSize} onChange={e => setTeamSize(e.target.value)} placeholder="Number of participants" style={{ flex:1, minWidth:160, background:C.deep, border:`1px solid ${C.border}`, borderRadius:8, padding:"9px 14px", color:C.text, fontFamily:"DM Sans,sans-serif", fontSize:"0.88rem", outline:"none" }} />
                  <input value={workshopTopic} onChange={e => setWorkshopTopic(e.target.value)} placeholder="Workshop topic" style={{ flex:1, minWidth:160, background:C.deep, border:`1px solid ${C.border}`, borderRadius:8, padding:"9px 14px", color:C.text, fontFamily:"DM Sans,sans-serif", fontSize:"0.88rem", outline:"none" }} />
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:12, marginBottom:24 }}>
                  {orgFeatures.map(feat => (
                    <div key={feat.key} onClick={() => { setActiveFeature(feat); setOutput(""); }} style={{ background:C.card, border:`1px solid ${activeFeature?.key===feat.key?"#4FC3F7":C.border}`, borderRadius:14, padding:"18px", cursor:"pointer", transition:"border-color 0.2s" }}>
                      <div style={{ fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"0.95rem", marginBottom:4 }}>{feat.label}</div>
                      <div style={{ fontSize:"0.83rem", color:C.muted, lineHeight:1.6 }}>{feat.desc}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeFeature && (
              <div className="fade-in" style={{ background:C.deep, border:`1px solid ${C.border}`, borderRadius:14, padding:"20px" }}>
                <div style={{ fontFamily:"Sora,sans-serif", fontWeight:700, marginBottom:12 }}>{activeFeature.label}</div>
                <button onClick={() => generate(activeFeature.prompt)} style={{ background:C.green, border:"none", color:"#000", fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"0.9rem", padding:"10px 22px", borderRadius:8, cursor:"pointer", marginBottom:loading||output?16:0 }}>
                  {loading?"Mahoro is writing for you...":"✨ Generate for Me"}
                </button>
                {loading && <div style={{ display:"flex", gap:4, alignItems:"center", padding:"8px 0" }}><TypingDots /><span style={{ fontSize:"0.85rem", color:C.muted, marginLeft:8 }}>Writing just for you...</span></div>}
                {output && (
                  <div className="fade-in" style={{ background:"rgba(37,211,102,0.04)", border:"1px solid rgba(37,211,102,0.15)", borderRadius:10, padding:"16px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <img src="/mahoro-avatar.png" alt="Mahoro" style={{ width:28, height:28, minWidth:28, borderRadius:"50%", objectFit:"cover", flexShrink:0 }} />
                        <span style={{ fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"0.85rem", color:C.green }}>Mahoro</span>
                      </div>
                      <button onClick={() => navigator.clipboard.writeText(output).then(() => alert("Copied!"))} style={{ background:"transparent", border:`1px solid ${C.border}`, color:C.muted, fontFamily:"Sora,sans-serif", fontSize:"0.75rem", padding:"4px 12px", borderRadius:6, cursor:"pointer" }}>Copy</button>
                    </div>
                    <div style={{ fontSize:"0.9rem", lineHeight:1.75, color:C.text, whiteSpace:"pre-wrap" }}>{output}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ONBOARDING ───────────────────────────────────────────────
function OnboardingScreen({ user, onComplete }) {
  const [step, setStep] = useState(0);
  const [country, setCountry] = useState("");
  const [trigger, setTrigger] = useState("");
  const [goal, setGoal] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const name = user.user_metadata?.name || user.email?.split("@")[0] || "Friend";

  // Saves immediately the moment a field is picked — not just at the very
  // end of onboarding. This means a country (or trigger, or goal) shows up
  // in the dashboard right away, even if the person never finishes the
  // remaining steps. Fire-and-forget: doesn't block the UI, but does log
  // failures so they're not silently lost.
  const saveField = async (fields) => {
    try {
      const { error } = await supabase.from("users").upsert({ id: user.id, email: user.email, name, ...fields });
      if (error) console.error("Field save error:", error);
    } catch (err) {
      console.error("Field save error:", err);
    }
  };

  const pickCountry = (c) => { setCountry(c); saveField({ country: c }); };
  const pickTrigger = (t) => { setTrigger(t); saveField({ trigger_type: t }); };
  const pickGoal = (g) => { setGoal(g); saveField({ goal: g }); };

  const countries = [
    // East Africa
    "Rwanda","Kenya","Uganda","Tanzania","Ethiopia","Somalia","Burundi","Djibouti","Eritrea",
    // West Africa
    "Nigeria","Ghana","Senegal","Côte d'Ivoire","Cameroon","Mali","Burkina Faso","Guinea","Benin","Togo","Sierra Leone","Liberia","Niger","The Gambia","Guinea-Bissau","Cape Verde","Mauritania",
    // Central Africa
    "DRC / Congo","Congo (Brazzaville)","Angola","Gabon","Chad","Central African Republic","Equatorial Guinea","São Tomé and Príncipe",
    // Southern Africa
    "South Africa","Zimbabwe","Zambia","Mozambique","Malawi","Botswana","Namibia","Lesotho","Eswatini","Madagascar","Mauritius","Comoros","Seychelles",
    // North Africa
    "Egypt","Morocco","Algeria","Tunisia","Libya","Sudan","South Sudan",
    // Diaspora — Europe
    "United Kingdom","France","Belgium","Netherlands","Germany","Portugal","Spain","Italy","Switzerland","Sweden","Norway","Denmark","Finland","Ireland","Austria",
    // Diaspora — North America
    "United States","Canada",
    // Diaspora — Other
    "Australia","New Zealand","Brazil","UAE","Qatar","Saudi Arabia","China","India","Japan",
    // Other
    "Other"
  ];
  const triggers = ["Exam / school pressure","Looking for a job","Family obligations and expectations","Comparing myself to others","Money stress","Relationship problems","Feeling lost or overwhelmed","Other"];
  const goals = ["Sleep better and feel calmer","Do better at school or work","Stop thinking too much","Build my confidence","Learn tools to manage stress for life"];

  const complete = async () => {
    setSaving(true);
    setSaveError("");
    try {
      const { error } = await supabase.from("users").upsert({
        id: user.id,
        email: user.email,
        name,
        country,
        trigger_type: trigger,
        goal,
        is_pro: false,
        is_org: false
      });
      if (error) throw error;
      onComplete({ name, country, trigger_type: trigger, goal });
    } catch (err) {
      console.error("Onboarding save error:", err);
      setSaveError("We couldn't save your answers just now. Please check your connection and try again.");
    }
    setSaving(false);
  };

  const steps = [
    { title:`Welcome, ${name}! 🌿`, sub:"Where are you from?", content:(
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))", gap:8 }}>
        {countries.map(c => <button key={c} onClick={() => pickCountry(c)} style={{ padding:"10px 14px", borderRadius:8, border:`1px solid ${country===c?C.green:C.border}`, background:country===c?"rgba(37,211,102,0.1)":C.deep, color:country===c?C.green:C.text, fontFamily:"Sora,sans-serif", fontWeight:600, fontSize:"0.85rem", cursor:"pointer" }}>{c}</button>)}
      </div>
    ), canNext: country !== "" },
    { title:"What worries you most?", sub:"Be honest. This shapes your challenge.", content:(
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {triggers.map(t => <button key={t} onClick={() => pickTrigger(t)} style={{ padding:"12px 16px", borderRadius:8, border:`1px solid ${trigger===t?C.green:C.border}`, background:trigger===t?"rgba(37,211,102,0.08)":C.deep, color:trigger===t?C.green:C.text, fontFamily:"DM Sans,sans-serif", fontSize:"0.92rem", cursor:"pointer", textAlign:"left", display:"flex", alignItems:"center", gap:10 }}>{trigger===t?"✓":"○"} {t}</button>)}
      </div>
    ), canNext: trigger !== "" },
    { title:"What do you want from this?", sub:"Your goal shapes how Mahoro talks to you.", content:(
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {goals.map(g => <button key={g} onClick={() => pickGoal(g)} style={{ padding:"12px 16px", borderRadius:8, border:`1px solid ${goal===g?C.green:C.border}`, background:goal===g?"rgba(37,211,102,0.08)":C.deep, color:goal===g?C.green:C.text, fontFamily:"DM Sans,sans-serif", fontSize:"0.92rem", cursor:"pointer", textAlign:"left", display:"flex", alignItems:"center", gap:10 }}>{goal===g?"✓":"○"} {g}</button>)}
      </div>
    ), canNext: goal !== "" },
  ];

  const cur = steps[step];
  return (
    <div style={{ minHeight:"100vh", background:C.night, display:"flex", alignItems:"center", justifyContent:"center", padding:"2rem", fontFamily:"DM Sans,sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap'); *{box-sizing:border-box}`}</style>
      <div style={{ width:"100%", maxWidth:520 }}>
        <div style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:"1.1rem", color:C.green, marginBottom:40, textAlign:"center" }}>🌿 Amahoro Challenge</div>
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:"2.5rem 2rem" }}>
          <div style={{ display:"flex", gap:6, marginBottom:32 }}>
            {steps.map((_,i) => <div key={i} style={{ flex:1, height:4, borderRadius:2, background:i<=step?C.green:C.border, transition:"background 0.3s" }} />)}
          </div>
          <h2 style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:"1.5rem", letterSpacing:"-0.02em", marginBottom:6, lineHeight:1.2 }}>{cur.title}</h2>
          <p style={{ color:C.muted, fontSize:"0.9rem", marginBottom:24, lineHeight:1.6 }}>{cur.sub}</p>
          {cur.content}
          {saveError && <div style={{ marginTop:16, padding:"10px 14px", borderRadius:8, background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", color:"#ef4444", fontSize:"0.85rem" }}>{saveError}</div>}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:28 }}>
            {step>0?<button onClick={() => setStep(s=>s-1)} style={{ background:"transparent", border:"none", color:C.muted, cursor:"pointer", fontFamily:"Sora,sans-serif", fontSize:"0.9rem" }}>← Back</button>:<div/>}
            <button onClick={() => { if(step<steps.length-1) setStep(s=>s+1); else complete(); }} disabled={!cur.canNext||saving}
              style={{ background:cur.canNext?C.green:C.faint, border:"none", color:cur.canNext?"#000":C.muted, fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"0.95rem", padding:"10px 28px", borderRadius:8, cursor:cur.canNext?"pointer":"not-allowed" }}>
              {saving?"Saving...":step===steps.length-1?"Start Day 1 →":"Continue →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


// ─── FLOATING MAHORO BUTTON ───────────────────────────────────
function FloatingMahoro({ onCoach }) {
  const [showLabel, setShowLabel] = React.useState(() => {
    try { return !localStorage.getItem("mahoro_greeted"); } catch { return true; }
  });

  const handleClick = () => {
    setShowLabel(false);
    try { localStorage.setItem("mahoro_greeted", "1"); } catch {}
    onCoach();
  };

  return (
    <div style={{ position:"fixed", bottom:24, right:24, zIndex:99, display:"flex", alignItems:"center", gap:10 }}>
      {showLabel && (
        <div className="fade-in" style={{ background:C.card, border:`1px solid rgba(37,211,102,0.4)`, borderRadius:20, padding:"7px 14px", fontSize:"0.78rem", fontFamily:"Sora,sans-serif", fontWeight:600, color:C.green, boxShadow:"0 4px 16px rgba(0,0,0,0.35)", whiteSpace:"nowrap", cursor:"pointer" }}
          onClick={handleClick}>
          Talk to Mahoro 🌿
        </div>
      )}
      <button onClick={handleClick} style={{ background:"transparent", border:"none", width:54, height:54, borderRadius:"50%", cursor:"pointer", padding:0, overflow:"hidden", flexShrink:0, boxShadow:`0 0 0 3px rgba(37,211,102,0.2), 0 8px 24px rgba(37,211,102,0.35)`, animation:"glow 2.5s ease-in-out infinite" }}>
        <img src="/mahoro-avatar.png" alt="Talk to Mahoro" style={{ width:"100%", height:"100%", objectFit:"cover", borderRadius:"50%" }} />
      </button>
    </div>
  );
}

// ─── CHALLENGE SCREEN ─────────────────────────────────────────
function ChallengeScreen({ user, profile, onCoach, onHome, isPro, isOrg, onUpgrade, onSignup }) {
  const [currentDay, setCurrentDay] = useState(0);
  const [completedDays, setCompletedDays] = useState([]);
  const [reflection, setReflection] = useState("");
  const [tipVisible, setTipVisible] = useState(false);
  const [tipTyping, setTipTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiTip, setAiTip] = useState("");
  const [view, setView] = useState("challenge");

  const ch = CHALLENGES[currentDay];
  const isCompleted = completedDays.includes(currentDay);
  const tipRef = useRef(null);

  // Load saved progress from Supabase
  useEffect(() => {
    const loadProgress = async () => {
      if (!user?.id) return;
      const { data } = await supabase.from("progress").select("day_number").eq("user_id", user.id);
      if (data) setCompletedDays(data.map(p => p.day_number - 1));
    };
    loadProgress();
  }, [user]);

  const completeDay = useCallback(async () => {
    if (!reflection.trim()) return;
    setLoading(true); setTipVisible(true); setTipTyping(true); setAiTip("");
    try {
      const tip = await callClaude(MAHORO_SYSTEM, `My name is ${profile?.name}, from ${profile?.country}. My main worry is: ${profile?.trigger_type}. Today is Day ${ch.day} of the Amahoro 21-day challenge. Theme: "${ch.title}". My reflection: "${reflection}". Give me your coaching response. Very simple English — short sentences, easy words. Be warm and specific to what I shared.`, user?.id);
      setAiTip(tip);
      // Scroll to Mahoro feedback smoothly
      setTimeout(() => {
        tipRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
      // Save progress to Supabase
      if (user?.id && !isCompleted) {
        await supabase.from("progress").upsert({
          user_id: user.id,
          day_number: ch.day,
          reflection,
          mahoro_response: tip
        });
        setCompletedDays(d => [...d, currentDay]);
      }
    } catch { setAiTip(ch.tip); }
    setTipTyping(false); setLoading(false);
  }, [reflection, profile, ch, currentDay, isCompleted, user]);

  const waMessage = encodeURIComponent(`Hi Amahoro! 🌿 I just completed Day ${ch.day}: "${ch.title}". My reflection: ${reflection.slice(0,200)}...`);

  return (
    <div style={{ minHeight:"100vh", background:C.night, fontFamily:"DM Sans,sans-serif", color:C.text }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap'); @keyframes typing{0%,60%,100%{opacity:0.3;transform:translateY(0)}30%{opacity:1;transform:translateY(-4px)}} @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}} .fade-in{animation:fadeIn 0.4s ease} textarea:focus{border-color:#25D366!important;outline:none} ::-webkit-scrollbar{width:5px} ::-webkit-scrollbar-thumb{background:#263040;border-radius:3px}`}</style>

      <div style={{ position:"fixed", top:0, left:0, right:0, zIndex:100, background:"rgba(13,17,23,0.95)", backdropFilter:"blur(12px)", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 4%", height:60 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <button onClick={onHome} style={{ background:"transparent", border:"none", color:C.green, fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:"1rem", cursor:"pointer", display:"flex", alignItems:"center", gap:8 }}><img src="/mahoro-avatar.png" alt="" style={{ width:22, height:22, minWidth:22, borderRadius:"50%", objectFit:"cover" }} /> Amahoro</button>
          {isPro && <span style={{ background:"rgba(37,211,102,0.15)", border:"1px solid rgba(37,211,102,0.3)", color:C.green, fontSize:"0.68rem", fontFamily:"Sora,sans-serif", fontWeight:700, padding:"2px 8px", borderRadius:100 }}>{isOrg?"ORG":"PRO"}</span>}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:"0.82rem", color:C.muted, fontFamily:"Sora,sans-serif" }}>{profile?.name} · {profile?.country}</span>
          <div style={{ width:8, height:8, borderRadius:"50%", background:C.green, animation:"pulse 2s infinite" }} />
        </div>
        <div style={{ display:"flex", gap:6 }}>
          {["challenge","progress","whatsapp"].map(v => (
            <button key={v} onClick={() => setView(v)} style={{ background:view===v?"rgba(37,211,102,0.1)":"transparent", border:`1px solid ${view===v?C.green:C.border}`, color:view===v?C.green:C.muted, borderRadius:6, padding:"5px 10px", cursor:"pointer", fontSize:"0.72rem", fontFamily:"Sora,sans-serif", fontWeight:600, textTransform:"capitalize" }}>{v}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth:780, margin:"0 auto", padding:"80px 4% 4rem" }}>
        {view==="challenge" && (
          <div className="fade-in">
            <div style={{ display:"flex", gap:5, overflowX:"auto", paddingBottom:12, marginBottom:28 }}>
              {CHALLENGES.map((c,i) => (
                <button key={i} onClick={() => { setCurrentDay(i); setReflection(""); setTipVisible(false); setAiTip(""); }}
                  style={{ flexShrink:0, width:40, height:40, borderRadius:10, border:`1px solid ${currentDay===i?C.green:completedDays.includes(i)?"rgba(37,211,102,0.4)":C.border}`, background:currentDay===i?"rgba(37,211,102,0.15)":completedDays.includes(i)?"rgba(37,211,102,0.06)":C.deep, color:currentDay===i?C.green:completedDays.includes(i)?C.green:C.muted, fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"0.75rem", cursor:"pointer" }}>
                  {completedDays.includes(i)?"✓":i+1}
                </button>
              ))}
            </div>

            <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, overflow:"hidden" }}>
              <div style={{ background:C.deep, padding:"20px 24px", borderBottom:`1px solid ${C.border}` }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12, flexWrap:"wrap" }}>
                  <Badge color="green">Day {ch.day} of 21</Badge>
                  <Badge color="amber">{ch.emoji} {ch.theme}</Badge>
                  <Badge color="sky">⏱ {ch.duration}</Badge>
                  {isCompleted && <Badge color="green">✓ Done</Badge>}
                </div>
                <h2 style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:"clamp(1.4rem,3vw,1.9rem)", letterSpacing:"-0.025em", lineHeight:1.2 }}>{ch.title}</h2>
                {completedDays.length > 0 && currentDay === completedDays.length && (
                  <div style={{ marginTop:10, fontSize:"0.82rem", color:C.green, fontFamily:"Sora,sans-serif" }}>
                    Welcome back{profile?.name ? `, ${profile.name}` : ""}! 🌿 You have completed {completedDays.length} day{completedDays.length > 1 ? "s" : ""} — keep going.
                  </div>
                )}
              </div>

              <div style={{ padding:"24px" }}>
                <div style={{ background:C.deep, borderRadius:10, padding:"16px 18px", marginBottom:20, borderLeft:`3px solid ${C.green}` }}>
                  <p style={{ fontSize:"0.9rem", color:C.muted, lineHeight:1.7 }}>{ch.context}</p>
                </div>
                <div style={{ marginBottom:20 }}>
                  <div style={{ fontSize:"0.78rem", fontFamily:"Sora,sans-serif", fontWeight:700, color:C.green, letterSpacing:"0.07em", textTransform:"uppercase", marginBottom:8 }}>Your Task Today</div>
                  <p style={{ fontSize:"0.92rem", lineHeight:1.7 }}>{ch.task}</p>
                </div>
                <div style={{ background:C.deep, border:`1px solid ${C.border}`, borderRadius:10, padding:"16px", marginBottom:20 }}>
                  <div style={{ fontSize:"0.75rem", fontFamily:"Sora,sans-serif", fontWeight:700, color:C.muted, letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:8 }}>Write Your Answer Here</div>
                  <div style={{ position:"relative" }}>
                    <textarea value={reflection} onChange={e => setReflection(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && reflection.trim() && !loading) { e.preventDefault(); completeDay(); } }}
                      placeholder={ch.placeholder}
                      rows={5} style={{ width:"100%", background:"transparent", border:"none", color:C.text, fontFamily:"DM Sans,sans-serif", fontSize:"0.93rem", resize:"none", lineHeight:1.65, outline:"none", paddingRight:48 }} />
                    <button onClick={completeDay} disabled={!reflection.trim()||loading} title="Send to Mahoro"
                      style={{ position:"absolute", bottom:0, right:0, width:38, height:38, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", background:reflection.trim()?C.green:C.faint, border:"none", color:reflection.trim()?"#000":C.muted, cursor:reflection.trim()?"pointer":"not-allowed", fontSize:"1.1rem", transition:"background 0.2s" }}>
                      {loading?"⏳":"➤"}
                    </button>
                  </div>
                  <div style={{ fontSize:"0.72rem", color:C.muted, marginTop:8, textAlign:"right" }}>{loading?"Mahoro is reading...":"Press Enter or tap ➤ to send"}</div>
                </div>
                <ProgressBar value={ch.day} />
                <p style={{ fontSize:"0.75rem", color:C.muted, marginTop:6, marginBottom:20 }}>Day {ch.day} of 21 · {completedDays.length} days done</p>

                <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                  {isCompleted && !loading && (
                    <div style={{ width:"100%", marginTop:4, fontSize:"0.8rem", color:C.green, fontFamily:"Sora,sans-serif", display:"flex", alignItems:"center", gap:6 }}>
                      ✓ Day {ch.day} done. You showed up. 🌿
                    </div>
                  )}
                  {reflection.trim() && <a href={`https://wa.me/254113445647?text=${waMessage}`} target="_blank" rel="noreferrer" style={{ display:"flex", alignItems:"center", gap:6, background:"transparent", border:`1px solid ${C.green}`, color:C.green, fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"0.9rem", padding:"11px 20px", borderRadius:8, textDecoration:"none" }}>💬 Share on WhatsApp</a>}
                  {isCompleted && currentDay<20 && <button onClick={() => { setCurrentDay(d=>d+1); setReflection(""); setTipVisible(false); setAiTip(""); }} style={{ background:C.deep, border:`1px solid ${C.border}`, color:C.text, fontFamily:"Sora,sans-serif", fontWeight:600, fontSize:"0.9rem", padding:"11px 20px", borderRadius:8, cursor:"pointer" }}>Day {currentDay+2} →</button>}
                  <a href={`https://wa.me/?text=${encodeURIComponent("I am doing the Amahoro 21-day wellness challenge — it is free and genuinely helpful. Try it: amahoro.app 🌿")}`} target="_blank" rel="noreferrer" style={{ display:"flex", alignItems:"center", gap:6, background:"transparent", border:`1px solid ${C.border}`, color:C.muted, fontFamily:"Sora,sans-serif", fontWeight:600, fontSize:"0.9rem", padding:"11px 18px", borderRadius:8, textDecoration:"none" }}>🌿 Share Amahoro</a>
                  {!isPro && <button onClick={onUpgrade} style={{ background:"transparent", border:`1px solid ${C.amber}`, color:C.amber, fontFamily:"Sora,sans-serif", fontWeight:600, fontSize:"0.9rem", padding:"11px 18px", borderRadius:8, cursor:"pointer" }}>⭐ Go Pro</button>}
                  {isPro && <button onClick={onUpgrade} style={{ background:"transparent", border:`1px solid ${C.green}`, color:C.green, fontFamily:"Sora,sans-serif", fontWeight:600, fontSize:"0.9rem", padding:"11px 18px", borderRadius:8, cursor:"pointer" }}>🌿 Pro Tools</button>}
                </div>

                {tipVisible && (
                  <div ref={tipRef} className="fade-in" style={{ background:"rgba(37,211,102,0.05)", border:"1px solid rgba(37,211,102,0.2)", borderRadius:12, padding:"18px", marginTop:20 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                      <img src="/mahoro-avatar.png" alt="Mahoro" style={{ width:34, height:34, minWidth:34, borderRadius:"50%", objectFit:"cover", flexShrink:0 }} />
                      <div><div style={{ fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"0.88rem", color:C.green }}>Mahoro</div><div style={{ fontSize:"0.72rem", color:C.muted }}>Your Companion</div></div>
                    </div>
                    {tipTyping?<TypingDots/>:(
                      <>
                        <p style={{ fontSize:"0.9rem", lineHeight:1.7 }}>{aiTip}</p>
                        {!user && currentDay === 0 && (
                          <div style={{ marginTop:12, padding:"14px", background:"rgba(37,211,102,0.08)", borderRadius:8, border:"1px solid rgba(37,211,102,0.2)" }}>
                            <p style={{ fontSize:"0.85rem", color:C.text, lineHeight:1.6, margin:0, marginBottom:10 }}>
                              🌿 <strong>Save your progress.</strong> Create a free account so you never lose your journey — your reflections, your days done, your conversations with Mahoro.
                            </p>
                            <button onClick={onSignup} style={{ background:C.green, border:"none", color:"#000", fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"0.85rem", padding:"9px 20px", borderRadius:7, cursor:"pointer" }}>
                              Save my progress — it's free →
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {currentDay===20&&isCompleted&&(
                  <div className="fade-in" style={{ marginTop:24, background:"rgba(37,211,102,0.06)", border:"1px solid rgba(37,211,102,0.25)", borderRadius:12, padding:"24px", textAlign:"center" }}>
                    <div style={{ fontSize:"3rem", marginBottom:12 }}>🏆</div>
                    <h3 style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:"1.4rem", marginBottom:8 }}>Challenge Complete!</h3>
                    <p style={{ color:C.muted, fontSize:"0.9rem", lineHeight:1.7, marginBottom:20 }}>You showed up for 21 days. Amahoro — peace be with you. 🌿</p>
                    <a href={`https://wa.me/254113445647?text=I%20just%20completed%20the%20Amahoro%2021-Day%20Challenge!%20My%20name%20is%20${profile?.name}%20from%20${profile?.country}.`} target="_blank" rel="noreferrer" style={{ display:"inline-flex", alignItems:"center", gap:6, background:C.green, border:"none", color:"#000", fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"0.9rem", padding:"11px 20px", borderRadius:8, textDecoration:"none" }}>🏆 Share Your Win</a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {view==="progress" && (
          <div className="fade-in">
            <h2 style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:"1.7rem", letterSpacing:"-0.025em", marginBottom:8 }}>Your Progress</h2>
            <p style={{ color:C.muted, marginBottom:28 }}>{completedDays.length} of 21 days done · Keep going, {profile?.name}.</p>
            <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:"24px", marginBottom:20 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                <span style={{ fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"0.9rem" }}>Overall Progress</span>
                <span style={{ fontFamily:"Sora,sans-serif", fontWeight:800, color:C.green }}>{Math.round((completedDays.length/21)*100)}%</span>
              </div>
              <div style={{ height:8, background:C.deep, borderRadius:4 }}><div style={{ height:"100%", width:`${(completedDays.length/21)*100}%`, background:`linear-gradient(90deg,${C.green},#4FC3F7)`, borderRadius:4, transition:"width 0.6s ease" }} /></div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(120px,1fr))", gap:10 }}>
              {CHALLENGES.map((c,i) => (
                <div key={i} onClick={() => { setCurrentDay(i); setView("challenge"); }} style={{ background:C.card, border:`1px solid ${completedDays.includes(i)?"rgba(37,211,102,0.4)":C.border}`, borderRadius:12, padding:"14px", cursor:"pointer", textAlign:"center" }}>
                  <div style={{ fontSize:"1.4rem", marginBottom:6 }}>{completedDays.includes(i)?"✅":c.emoji}</div>
                  <div style={{ fontSize:"0.72rem", fontFamily:"Sora,sans-serif", fontWeight:700, color:completedDays.includes(i)?C.green:C.muted }}>Day {c.day}</div>
                  <div style={{ fontSize:"0.75rem", color:C.muted, marginTop:2 }}>{c.theme}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view==="whatsapp" && (
          <div className="fade-in">
            <h2 style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:"1.7rem", marginBottom:8 }}>WhatsApp</h2>
            <p style={{ color:C.muted, marginBottom:28 }}>Do the challenge directly on WhatsApp. No apps. No logins. Just messages.</p>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:14 }}>
              {[
                { icon:"🌅", title:"Daily Challenge", desc:"Get your daily task every morning as a WhatsApp message.", link:`https://wa.me/254113445647?text=START%20${encodeURIComponent(profile?.name||"")}`, label:"Subscribe to Daily Messages" },
                { icon:"💬", title:"Talk to Mahoro", desc:"Send your answer directly to Mahoro for personal feedback.", link:`https://wa.me/254113445647?text=Day%20${ch.day}%20answer:%20`, label:"Send Answer to Mahoro" },
                { icon:"👥", title:"Join Your Group", desc:"Join others going through the challenge together.", link:"https://wa.me/254113445647?text=JOIN%20GROUP", label:"Join Your Group" },
                { icon:"📊", title:"Weekly Update", desc:"Ask Mahoro for your weekly progress.", link:`https://wa.me/254113445647?text=REPORT%20${encodeURIComponent(profile?.name||"")}`, label:"Get Weekly Update" },
              ].map(item => (
                <div key={item.title} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:"20px" }}>
                  <div style={{ fontSize:"2rem", marginBottom:10 }}>{item.icon}</div>
                  <h4 style={{ fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"0.95rem", marginBottom:6 }}>{item.title}</h4>
                  <p style={{ fontSize:"0.85rem", color:C.muted, lineHeight:1.65, marginBottom:14 }}>{item.desc}</p>
                  <a href={item.link} target="_blank" rel="noreferrer" style={{ display:"flex", alignItems:"center", gap:6, background:C.green, border:"none", color:"#000", fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"0.85rem", padding:"10px 16px", borderRadius:8, textDecoration:"none", width:"fit-content" }}>💬 {item.label}</a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <FloatingMahoro onCoach={onCoach} />
    </div>
  );
}

// ─── COACH SCREEN ─────────────────────────────────────────────
function CoachScreen({ user, profile, onBack, isPro, isOrg }) {
  const WELCOME = { role:"assistant", content:`Hello${profile?.name?` ${profile.name}`:""}! I'm Mahoro. 🌿\n\nI am not a therapist or a doctor. I am a companion — someone who walks with you, listens without judging, and helps you find your own strength.\n\nI respond in English, Français, Kiswahili and Kinyarwanda. My Kinyarwanda and Swahili are still growing — I understand the heart of what you share but may miss some local expressions. I am always improving.\n\nAmahoro is for everyone, everywhere — Kigali, London, New York or anywhere in the world.\n\nWhat is on your mind today? I am here. 🌿` };
  const WELCOME_BACK_VARIANTS = [
    `Welcome back${profile?.name?`, ${profile.name}`:""} 🌿 Good to see you again. We can pick up where we left off, or if something new is on your mind today, that's okay too — whatever feels right.`,
    `Hi${profile?.name?` ${profile.name}`:""}, welcome back 🌿 I'm here. We can continue from before, or start fresh — what would feel best today?`,
    `${profile?.name?`${profile.name}, `:""}glad you're back 🌿 No pressure either way — carry on from last time, or tell me what's on your mind now.`,
  ];
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    const loadHistory = async () => {
      if (!user?.id || historyLoaded) return;
      try {
        const { data } = await supabase
          .from("messages")
          .select("role, content, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(40);
        if (data && data.length > 0) {
          const recent = data.reverse().map(m => ({ role:m.role, content:m.content }));
          const welcomeBack = WELCOME_BACK_VARIANTS[Math.floor(Math.random() * WELCOME_BACK_VARIANTS.length)];
          // Returning user: skip the full first-time intro, just a short calm welcome-back, then their history.
          setMessages([{ role:"assistant", content:welcomeBack }, ...recent]);
        }
      } catch(e) { console.error("History load:", e); }
      setHistoryLoaded(true);
    };
    loadHistory();
  }, [user?.id]);

  useEffect(() => { chatRef.current?.scrollTo(0, chatRef.current.scrollHeight); }, [messages]);

  const send = useCallback(async () => {
    const msg = input.trim();
    if (!msg||loading) return;
    const next = [...messages, { role:"user", content:msg }];
    setMessages(next); setInput(""); setLoading(true);
    try {
      const challengeContext = profile ? ` The user's name is ${profile.name} from ${profile.country}. Their main worry: ${profile.trigger_type}. Their goal: ${profile.goal}.` : "";
      const system = `${MAHORO_SYSTEM}${challengeContext}`;
      const res = await fetch(`/api/chat`, {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({ system, messages:next.slice(-10).map(m => ({ role:m.role, content:m.content })), userId: user?.id })
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || data.error?.message || "I had a connection problem. Please try again. 🌿";
      setMessages(m => [...m, { role:"assistant", content:reply }]);
      // Save to Supabase
      if (user?.id) {
        await supabase.from("messages").insert([
          { user_id:user.id, role:"user", content:msg },
          { user_id:user.id, role:"assistant", content:reply }
        ]);
      }
    } catch {
      setMessages(m => [...m, { role:"assistant", content:"I had a connection problem. Please try again. 🌿" }]);
    }
    setLoading(false);
  }, [input, messages, loading, profile, user]);

  return (
    <div style={{ minHeight:"100vh", background:C.night, display:"flex", flexDirection:"column", fontFamily:"DM Sans,sans-serif", color:C.text }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap'); @keyframes typing{0%,60%,100%{opacity:0.3;transform:translateY(0)}30%{opacity:1;transform:translateY(-4px)}} @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}} .msg-in{animation:fadeIn 0.3s ease} input:focus{border-color:#25D366!important;outline:none} ::-webkit-scrollbar{width:5px} ::-webkit-scrollbar-thumb{background:#263040;border-radius:3px}`}</style>

      <div style={{ background:C.deep, borderBottom:`1px solid ${C.border}`, padding:"0 4%", height:66, display:"flex", alignItems:"center", gap:14, flexShrink:0 }}>
        <button onClick={onBack} style={{ background:"transparent", border:"none", color:C.muted, cursor:"pointer", fontSize:"0.9rem", fontFamily:"Sora,sans-serif" }}>← Back</button>
        <img src="/mahoro-avatar.png" alt="Mahoro" style={{ width:42, height:42, minWidth:42, borderRadius:"50%", objectFit:"cover", flexShrink:0 }} />
        <div>
          <div style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:"1rem" }}>Mahoro</div>
          <div style={{ fontSize:"0.72rem", color:C.green }}>Growth companion · Not a therapist · Remembers your conversations</div>
          <div style={{ fontSize:"0.68rem", color:C.muted }}>🔒 Your conversations are private and never shared</div>
        </div>
        <div style={{ marginLeft:"auto" }}>
          <a href="https://wa.me/254113445647?text=Hi%20Mahoro!" target="_blank" rel="noreferrer" style={{ display:"flex", alignItems:"center", gap:6, background:C.green, border:"none", color:"#000", fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"0.8rem", padding:"7px 14px", borderRadius:8, textDecoration:"none" }}>💬 WhatsApp</a>
        </div>
      </div>

      <div ref={chatRef} style={{ flex:1, overflowY:"auto", padding:"24px 4%", display:"flex", flexDirection:"column", gap:16, maxWidth:680, width:"100%", margin:"0 auto" }}>
        {messages.map((m,i) => (
          <div key={i} className="msg-in" style={{ display:"flex", gap:10, alignItems:"flex-start", flexDirection:m.role==="user"?"row-reverse":"row" }}>
            {m.role==="assistant"&&<img src="/mahoro-avatar.png" alt="Mahoro" style={{ width:32, height:32, minWidth:32, borderRadius:"50%", objectFit:"cover", flexShrink:0 }} />}
            <div style={{ maxWidth:"78%", padding:"12px 16px", borderRadius:m.role==="user"?"12px 4px 12px 12px":"4px 12px 12px 12px", background:m.role==="user"?"rgba(37,211,102,0.12)":C.card, border:m.role==="user"?"1px solid rgba(37,211,102,0.2)":`1px solid ${C.border}`, fontSize:"0.92rem", lineHeight:1.7, whiteSpace:"pre-wrap" }}>{m.content}</div>
          </div>
        ))}
        {loading&&<div className="msg-in" style={{ display:"flex", gap:10, alignItems:"flex-start" }}><img src="/mahoro-avatar.png" alt="Mahoro" style={{ width:32, height:32, minWidth:32, borderRadius:"50%", objectFit:"cover", flexShrink:0 }} /><div style={{ padding:"12px 16px", borderRadius:"4px 12px 12px 12px", background:C.card, border:`1px solid ${C.border}` }}><TypingDots/></div></div>}
      </div>

      {messages.length<=2&&(
        <div style={{ padding:"0 4%", maxWidth:680, width:"100%", margin:"0 auto", display:"flex", gap:8, flexWrap:"wrap", marginBottom:12 }}>
          {[
            profile?.trigger_type ? `I want to talk about ${profile.trigger_type}` : "I feel worried but I do not know why",
            "I am overwhelmed by family expectations",
            "I need help finding a job or opportunity",
            "I feel stuck and do not know what to do next",
          ].map(p => (
            <button key={p} onClick={() => setInput(p)} style={{ background:C.deep, border:`1px solid ${C.border}`, color:C.muted, borderRadius:100, padding:"6px 14px", cursor:"pointer", fontSize:"0.8rem", fontFamily:"Sora,sans-serif" }}>{p}</button>
          ))}
        </div>
      )}

      <div style={{ background:C.deep, borderTop:`1px solid ${C.border}`, padding:"14px 4%", display:"flex", gap:10, alignItems:"center" }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==="Enter"&&send()} placeholder="Talk to Mahoro — English, Français, Kiswahili, Kinyarwanda 🌿" style={{ flex:1, background:C.card, border:`1px solid ${C.border}`, borderRadius:10, padding:"12px 16px", color:C.text, fontFamily:"DM Sans,sans-serif", fontSize:"0.92rem", transition:"border-color 0.2s" }} />
        <button onClick={send} disabled={!input.trim()||loading} style={{ background:input.trim()?C.green:C.faint, border:"none", color:input.trim()?"#000":C.muted, fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"0.88rem", padding:"12px 20px", borderRadius:10, cursor:input.trim()?"pointer":"not-allowed", whiteSpace:"nowrap" }}>Send →</button>
      </div>
    </div>
  );
}

// ─── LANDING SCREEN ───────────────────────────────────────────
function LandingScreen({ onStart, onCoach, onPro }) {
  return (
    <div style={{ minHeight:"100vh", background:C.night, color:C.text, fontFamily:"DM Sans,sans-serif", overflowX:"hidden" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap'); *{box-sizing:border-box;margin:0;padding:0} body{overflow-x:hidden} @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(0.7)}} @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}} @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}} @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(37,211,102,0.2)}50%{box-shadow:0 0 40px rgba(37,211,102,0.5)}} .hero-in{animation:fadeUp 0.7s ease forwards} .hero-in-2{animation:fadeUp 0.7s 0.15s ease both} .hero-in-3{animation:fadeUp 0.7s 0.3s ease both} .float-wa{animation:float 3s ease-in-out infinite} .card-hover:hover{transform:translateY(-4px)!important;border-color:#3A4A5C!important} ::-webkit-scrollbar{width:6px} ::-webkit-scrollbar-thumb{background:#263040;border-radius:3px}`}</style>

      <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:100, background:"rgba(13,17,23,0.92)", backdropFilter:"blur(12px)", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 5%", height:64 }}>
        <div style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:"1.15rem", color:C.green }}>Amahoro<span style={{ color:C.text }}> Challenge</span></div>
        <div style={{ display:"flex", gap:12 }}>
          <button onClick={onCoach} style={{ background:"transparent", border:`1px solid ${C.border}`, color:C.muted, borderRadius:6, padding:"7px 16px", cursor:"pointer", fontSize:13, fontFamily:"Sora,sans-serif", fontWeight:600 }}>Ask Mahoro</button>
          <button onClick={onStart} style={{ background:C.green, border:"none", color:"#000", borderRadius:6, padding:"7px 18px", cursor:"pointer", fontSize:13, fontFamily:"Sora,sans-serif", fontWeight:700, animation:"glow 2.5s ease-in-out infinite" }}>Start Free →</button>
        </div>
      </nav>

      <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center", padding:"7rem 5% 4rem", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 80% 60% at 50% 30%, rgba(37,211,102,0.07) 0%, transparent 70%)", pointerEvents:"none" }} />
        <div className="hero-in" style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(37,211,102,0.1)", border:"1px solid rgba(37,211,102,0.25)", color:C.green, fontSize:11, fontWeight:700, fontFamily:"Sora,sans-serif", letterSpacing:"0.08em", textTransform:"uppercase", padding:"5px 14px", borderRadius:100, marginBottom:24 }}>
          <span style={{ width:6, height:6, background:C.green, borderRadius:"50%", animation:"pulse 2s infinite" }} />
          Free to start · Made for African youth · Open worldwide
        </div>
        <h1 className="hero-in-2" style={{ fontFamily:"Sora,sans-serif", fontSize:"clamp(2.2rem,6vw,4.2rem)", fontWeight:800, lineHeight:1.1, letterSpacing:"-0.03em", marginBottom:20, maxWidth:820 }}>
          Feel better.<br /><span style={{ color:C.green }}>21 days.</span> Small steps.<br /><span style={{ color:C.amber }}>Made for Africa.</span>
        </h1>
        <p className="hero-in-3" style={{ fontSize:"1.1rem", color:C.muted, maxWidth:560, marginBottom:36, fontWeight:300, lineHeight:1.75 }}>
          Feeling worried, stressed or overwhelmed? You are not alone. Every day for 21 days, we give you one small thing to do. A companion who understands your life. A community that gets it.
        </p>
        <div style={{ display:"flex", gap:12, flexWrap:"wrap", justifyContent:"center", marginBottom:48 }}>
          <button onClick={onStart} style={{ display:"flex", alignItems:"center", gap:8, background:C.green, border:"none", color:"#000", fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"1rem", padding:"14px 32px", borderRadius:10, cursor:"pointer", animation:"glow 2.5s ease-in-out infinite" }}>🌿 Start Free — No signup needed</button>
          <button onClick={onCoach} style={{ display:"flex", alignItems:"center", gap:8, background:"transparent", border:`1px solid ${C.border}`, color:C.text, fontFamily:"Sora,sans-serif", fontWeight:600, fontSize:"1rem", padding:"14px 28px", borderRadius:10, cursor:"pointer" }}>💬 Ask Mahoro</button>
        </div>
        <div style={{ display:"flex", gap:48, justifyContent:"center", flexWrap:"wrap", borderTop:`1px solid ${C.border}`, paddingTop:28 }}>
          {[["21","Day Challenge"],["5 min","Per day"],["4","Languages"],["Free","To start"]].map(([n,l]) => (
            <div key={l} style={{ textAlign:"center" }}>
              <div style={{ fontFamily:"Sora,sans-serif", fontSize:"1.8rem", fontWeight:800, color:"#fff" }}>{n}</div>
              <div style={{ fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em" }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div style={{ padding:"5rem 5%" }}>
        <div style={{ textAlign:"center", marginBottom:40 }}>
          <h2 style={{ fontFamily:"Sora,sans-serif", fontSize:"clamp(1.8rem,4vw,2.6rem)", fontWeight:800, letterSpacing:"-0.025em", marginBottom:12 }}>Made to be affordable.</h2>
          <p style={{ color:C.muted, fontSize:"1rem", maxWidth:500, margin:"0 auto", lineHeight:1.7 }}>Free gets you far. Pro gets you everything.</p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))", gap:16, maxWidth:860, margin:"0 auto" }}>
          {[
            { name:"Free", price:"$0", sub:"/ forever", desc:"The full 21-day program. No card needed.", featured:false, features:["All 21 daily challenges","AI companion Mahoro","4 languages","Community access","Completion message"], btnLabel:"Start Free Today", btnAction:onStart, btnStyle:"outline" },
            { name:"Amahoro Pro", price:"$4", sub:"/ month", desc:"Everything in Free plus personal tools made just for you.", featured:true, features:["Everything in Free","Unlimited coaching","Personal workbook","Guided meditation","Monthly progress report","New 7-day challenge"], btnLabel:"Get Amahoro Pro", btnAction:onPro, btnStyle:"green" },
            { name:"Organizations", price:"$150", sub:"/ month (or $1500/yr)", desc:"For schools, NGOs and youth groups.", featured:false, features:["Everything in Pro","Workshop plan","Group progress report","Staff onboarding guide","Up to 30 participants"], btnLabel:"Get for My Organization", btnAction:onPro, btnStyle:"sky" },
          ].map(p => (
            <div key={p.name} style={{ background:C.card, border:`2px solid ${p.featured?C.green:C.border}`, borderRadius:16, padding:"28px 24px", position:"relative", boxShadow:p.featured?`0 0 0 1px rgba(37,211,102,0.2),0 20px 40px rgba(37,211,102,0.07)`:"none" }}>
              {p.featured&&<div style={{ position:"absolute", top:-14, left:"50%", transform:"translateX(-50%)", background:C.green, color:"#000", fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:11, letterSpacing:"0.07em", textTransform:"uppercase", padding:"4px 14px", borderRadius:100 }}>Most Popular</div>}
              <div style={{ fontSize:11, color:C.muted, fontFamily:"Sora,sans-serif", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8 }}>{p.name}</div>
              <div style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:"2.2rem", color:"#fff", marginBottom:4 }}>{p.price} <span style={{ fontSize:"0.95rem", color:C.muted, fontWeight:400 }}>{p.sub}</span></div>
              <div style={{ fontSize:"0.85rem", color:C.muted, marginBottom:20, lineHeight:1.5 }}>{p.desc}</div>
              <ul style={{ listStyle:"none", marginBottom:24 }}>
                {p.features.map(f => <li key={f} style={{ fontSize:"0.87rem", padding:"5px 0", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:8 }}><span style={{ color:C.green }}>✓</span>{f}</li>)}
              </ul>
              <button onClick={p.btnAction} style={{ display:"block", width:"100%", padding:"12px", borderRadius:8, fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"0.92rem", cursor:"pointer", background:p.btnStyle==="green"?C.green:p.btnStyle==="sky"?C.sky:C.deep, color:p.btnStyle==="outline"?C.text:"#000", border:p.btnStyle==="outline"?`1px solid ${C.border}`:"none" }}>{p.btnLabel}</button>
            </div>
          ))}
        </div>
        <div style={{ textAlign:"center", marginTop:16, fontSize:"0.82rem", color:C.muted }}>🔒 Payments via Paystack — M-Pesa, MTN Money, Airtel, cards · Cancel any time</div>
      </div>

      <div style={{ background:C.deep, borderTop:`1px solid ${C.border}`, padding:"2.5rem 5%", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:16 }}>
        <div>
          <div style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:"1.1rem", color:C.green, marginBottom:6 }}>Amahoro Challenge</div>
          <div style={{ fontSize:"0.82rem", color:C.muted }}>Feel better in 21 days. For everyone, everywhere. 🌍</div>
        </div>
        <div style={{ fontSize:"0.8rem", color:C.muted, display:"flex", gap:16, flexWrap:"wrap" }}>
          <span>© 2026 Amahoro</span>
          <a href="mailto:hello@amahoro.app" style={{ color:C.green, textDecoration:"none" }}>Contact us</a>
          <a href="/privacy" style={{ color:C.muted, textDecoration:"none" }}>Privacy Policy</a>
          <a href="/terms" style={{ color:C.muted, textDecoration:"none" }}>Terms of Service</a>
        </div>
      </div>

      <a href="https://wa.me/254113445647?text=JOIN" target="_blank" rel="noreferrer" className="float-wa" style={{ position:"fixed", bottom:24, right:24, zIndex:99, background:C.green, color:"#000", width:56, height:56, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.4rem", textDecoration:"none", boxShadow:"0 8px 24px rgba(37,211,102,0.4)" }}>💬</a>
    </div>
  );
}



// ─── AMAHORO LOADER ───────────────────────────────────────────
const AFRICAN_QUOTES = [
  { quote: "Sticks in a bundle are unbreakable.", source: "African proverb", meaning: "Together we are stronger than alone." },
  { quote: "Until the lion learns to write, every story will glorify the hunter.", source: "African proverb", meaning: "Tell your own story. Your voice matters." },
  { quote: "Rain does not fall on one roof alone.", source: "Cameroonian proverb", meaning: "Trouble comes to all of us. You are never alone." },
  { quote: "He who learns, teaches.", source: "Ethiopian proverb", meaning: "Knowledge grows when it is shared." },
  { quote: "A child who is not embraced by the village will burn it down.", source: "African proverb", meaning: "We all need community to grow." },
  { quote: "If you want to go fast, go alone. If you want to go far, go together.", source: "African proverb", meaning: "Community takes us further than speed ever could." },
  { quote: "The forest would be silent if no bird sang except the one that sang best.", source: "African proverb", meaning: "Every voice matters. Including yours." },
  { quote: "A tree is straightened while it is young.", source: "African proverb", meaning: "Growth happens with the right support at the right time." },
  { quote: "Cross the river in a crowd and the crocodile won't eat you.", source: "African proverb", meaning: "There is safety and strength in community." },
  { quote: "Akili ni nywele, kila mtu ana zake.", source: "Swahili proverb", meaning: "Intelligence is like hair — everyone has their own kind." },
  { quote: "Haraka haraka haina baraka.", source: "Swahili proverb", meaning: "Hurry hurry has no blessing. Take things one step at a time." },
  { quote: "Umoja ni nguvu, utengano ni udhaifu.", source: "Swahili proverb", meaning: "Unity is strength, division is weakness." },
  { quote: "Asiyesikia la mkuu huvunjika guu.", source: "Swahili proverb", meaning: "Those who do not listen to wisdom learn the hard way." },
  { quote: "La patience est la clé du bonheur.", source: "Proverbe africain", meaning: "Patience is the key to happiness." },
  { quote: "L'union fait la force.", source: "Proverbe africain", meaning: "Unity makes strength. Together we go further." },
  { quote: "Celui qui n'a pas voyagé ne connaît pas la valeur des hommes.", source: "Proverbe africain", meaning: "Travel opens your eyes to the value of people." },
  { quote: "Le bonheur ne se cherche pas, il se construit.", source: "Proverbe africain", meaning: "Happiness is not found — it is built, one day at a time." },
  { quote: "Speak to your children as if they are the wisest, kindest people in the world.", source: "African proverb", meaning: "How we speak shapes who people become." },
  { quote: "Peace is not the absence of conflict, but the ability to handle it.", source: "African wisdom", meaning: "True peace is built, not found." },
  { quote: "When the music changes, so does the dance.", source: "African proverb", meaning: "Adapt with courage. Change is part of life." },
];

function AmahoroLoader() {
  const [idx, setIdx] = React.useState(() => Math.floor(Math.random() * AFRICAN_QUOTES.length));
  const [fade, setFade] = React.useState(true);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIdx(i => (i + 1) % AFRICAN_QUOTES.length);
        setFade(true);
      }, 500);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const q = AFRICAN_QUOTES[idx];

  return (
    <div style={{ minHeight:"100vh", background:"#0D1117", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"2rem", fontFamily:"DM Sans,sans-serif" }}>
      <style>{`
        @keyframes pulse-load{0%,100%{opacity:0.5;transform:scale(0.97)}50%{opacity:1;transform:scale(1)}}
        @keyframes fadeQuote{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        .quote-fade{animation:fadeQuote 0.4s ease forwards}
      `}</style>

      {/* Glowing ring around avatar */}
      <div style={{ position:"relative", marginBottom:32 }}>
        <div style={{ position:"absolute", inset:-8, borderRadius:"50%", border:"2px solid rgba(37,211,102,0.3)", animation:"pulse-load 2s ease-in-out infinite" }} />
        <div style={{ position:"absolute", inset:-16, borderRadius:"50%", border:"1px solid rgba(37,211,102,0.15)", animation:"pulse-load 2.5s ease-in-out infinite 0.3s" }} />
        <img src="/mahoro-avatar.png" alt="" style={{ width:72, height:72, borderRadius:"50%", objectFit:"cover", display:"block" }} />
      </div>

      <div className="quote-fade" key={idx} style={{ textAlign:"center", maxWidth:500 }}>
        {/* Decorative quote marks */}
        <div style={{ fontSize:"3rem", color:"rgba(37,211,102,0.2)", fontFamily:"Georgia,serif", lineHeight:0.5, marginBottom:16 }}>"</div>
        <div style={{ fontSize:"1.15rem", fontFamily:"Sora,sans-serif", fontWeight:600, color:"#E8EDF2", lineHeight:1.7, marginBottom:14, fontStyle:"italic" }}>
          {q.quote}
        </div>
        <div style={{ width:40, height:2, background:"rgba(37,211,102,0.4)", margin:"0 auto 12px", borderRadius:1 }} />
        <div style={{ fontSize:"0.82rem", color:"#25D366", fontFamily:"Sora,sans-serif", fontWeight:700, marginBottom:6 }}>
          — {q.source}
        </div>
        <div style={{ fontSize:"0.8rem", color:"#7A8FA6", lineHeight:1.6, fontStyle:"italic" }}>
          {q.meaning}
        </div>
      </div>

      {/* Progress dots showing quote position */}
      <div style={{ marginTop:40, display:"flex", gap:6, alignItems:"center" }}>
        {AFRICAN_QUOTES.map((_, i) => (
          <div key={i} style={{ width: i===idx ? 20 : 6, height:6, borderRadius:3, background: i===idx ? "#25D366" : "rgba(37,211,102,0.2)", transition:"all 0.4s ease" }} />
        ))}
      </div>
      <div style={{ marginTop:12, fontSize:"0.72rem", color:"rgba(122,143,166,0.6)", fontFamily:"Sora,sans-serif" }}>Loading Amahoro...</div>
    </div>
  );
}

// ─── ERROR BOUNDARY ───────────────────────────────────────────
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    console.error("Amahoro error boundary caught:", error, info);
  }
  render() {
    if (!document.getElementById("amahoro-global")) {
      const style = document.createElement("style");
      style.id = "amahoro-global";
      style.textContent = globalStyles;
      document.head.appendChild(style);
    }
    if (this.state.hasError) {
      return (
        <div style={{ minHeight:"100vh", background:"#0D1117", display:"flex", alignItems:"center", justifyContent:"center", padding:"2rem", fontFamily:"DM Sans,sans-serif", textAlign:"center" }}>
          <div>
            <div style={{ fontSize:"3rem", marginBottom:16 }}>🌿</div>
            <h2 style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:"1.4rem", color:"#E8EDF2", marginBottom:10 }}>Something went wrong</h2>
            <p style={{ color:"#7A8FA6", fontSize:"0.9rem", marginBottom:24, maxWidth:380, lineHeight:1.6 }}>
              We are sorry — Amahoro hit a small problem. Please refresh the page to continue. Your progress is saved.
            </p>
            <button onClick={() => window.location.reload()}
              style={{ background:"#25D366", border:"none", color:"#000", fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"0.92rem", padding:"12px 28px", borderRadius:8, cursor:"pointer" }}>
              Refresh Amahoro
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}


// ─── PROFILE COMPLETION PROMPT ────────────────────────────────
function ProfilePrompt({ onComplete, onDismiss }) {
  return (
    <div style={{ position:"fixed", bottom:90, left:"50%", transform:"translateX(-50%)", zIndex:200, width:"calc(100% - 32px)", maxWidth:480 }}>
      <div style={{ background:C.card, border:`1px solid ${C.green}`, borderRadius:14, padding:"16px 18px", boxShadow:"0 8px 32px rgba(0,0,0,0.4)", display:"flex", alignItems:"flex-start", gap:12 }}>
        <img src="/mahoro-avatar.png" alt="" style={{ width:36, height:36, minWidth:36, borderRadius:"50%", objectFit:"cover" }} />
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"0.88rem", color:C.green, marginBottom:4 }}>Mahoro knows you better when you set up your profile 🌿</div>
          <div style={{ fontSize:"0.82rem", color:C.muted, lineHeight:1.6, marginBottom:12 }}>It takes 60 seconds. Your responses become more personal to your life and situation.</div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={onComplete} style={{ background:C.green, border:"none", color:"#000", fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"0.82rem", padding:"7px 16px", borderRadius:7, cursor:"pointer" }}>Set up my profile →</button>
            <button onClick={onDismiss} style={{ background:"transparent", border:`1px solid ${C.border}`, color:C.muted, fontFamily:"Sora,sans-serif", fontSize:"0.8rem", padding:"7px 14px", borderRadius:7, cursor:"pointer" }}>Maybe later</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────
function AppInner() {
  const [isOffline, setIsOffline] = React.useState(!navigator.onLine);

  useEffect(() => {
    if (!document.getElementById("amahoro-global")) {
      const style = document.createElement("style");
      style.id = "amahoro-global";
      style.textContent = globalStyles;
      document.head.appendChild(style);
    }
    document.body.style.background = "#0D1117";
    document.documentElement.style.background = "#0D1117";

    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => { window.removeEventListener("offline", goOffline); window.removeEventListener("online", goOnline); };
  }, []);

  const [showProfilePrompt, setShowProfilePrompt] = useState(false);
  const [promptDismissed, setPromptDismissed] = useState(false);
  const [screen, setScreen] = useState("landing");
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isPro, setIsPro] = useState(false);
  const [isOrg, setIsOrg] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        loadProfile(session.user);
      } else {
        setUser(null); setProfile(null); setIsPro(false); setIsOrg(false);
        setScreen("landing"); setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (u) => {
    setLoading(true);
    const { data } = await supabase.from("users").select("*").eq("id", u.id).single();
    if (data) {
      setProfile(data);
      setIsPro(data.is_pro || false);
      setIsOrg(data.is_org || false);
      setScreen(u.email === ADMIN_EMAIL ? "admin" : "challenge");
    } else {
      setScreen("onboard");
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) return <AmahoroLoader />;

  return (
    <>
      {isOffline && (
        <div style={{ position:"fixed", top:0, left:0, right:0, zIndex:999, background:"#F5A623", color:"#000", fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"0.82rem", padding:"10px 16px", textAlign:"center" }}>
          🌿 You appear to be offline — your progress is saved and Mahoro will be here when you reconnect.
        </div>
      )}
      {screen==="landing" && <LandingScreen onStart={() => setScreen(user?"challenge":"auth")} onCoach={() => setScreen(user?"coach":"auth")} onPro={() => setScreen(user?"pro":"auth")} />}
      {screen==="auth" && <AuthScreen onAuth={(u) => { setUser(u); loadProfile(u); }} />}
      {screen==="onboard" && <OnboardingScreen user={user} onComplete={(data) => { setProfile(data); setScreen("challenge"); }} />}
      {screen==="challenge" && <ChallengeScreen user={user} profile={profile} onCoach={() => setScreen("coach")} onHome={() => setScreen("landing")} isPro={isPro} isOrg={isOrg} onUpgrade={() => setScreen("pro")} onSignup={() => setScreen("auth")} />}
      {screen==="coach" && <CoachScreen user={user} profile={profile} onBack={() => {
        setScreen(profile?"challenge":"landing");
        // Show profile prompt after they've used Mahoro without a profile
        if (!profile && user && !promptDismissed) {
          setTimeout(() => setShowProfilePrompt(true), 1000);
        }
      }} isPro={isPro} isOrg={isOrg} />}
      {showProfilePrompt && !profile && <ProfilePrompt
        onComplete={() => { setShowProfilePrompt(false); setScreen("onboard"); }}
        onDismiss={() => { setShowProfilePrompt(false); setPromptDismissed(true); }}
      />}
      {screen==="pro" && <ProScreen user={user} profile={profile} isPro={isPro} isOrg={isOrg} onActivatePro={() => { setIsPro(true); setScreen("challenge"); }} onActivateOrg={() => { setIsPro(true); setIsOrg(true); setScreen("challenge"); }} onBack={() => setScreen(profile?"challenge":"landing")} />}
      {screen==="admin" && <AdminDashboard onBack={() => setScreen("challenge")} />}
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppInner />
    </ErrorBoundary>
  );
}
