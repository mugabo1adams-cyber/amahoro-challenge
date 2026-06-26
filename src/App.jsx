import { useState, useEffect, useRef, useCallback } from "react";

const CHALLENGES = [
  { day: 1, theme: "Awareness", emoji: "🧠", duration: "5 min", title: "Name what you feel.", context: "In our culture, we are taught to stay strong and not talk about our struggles. But when you name what you feel, it becomes smaller. This is your first brave step.", task: 'Finish this sentence three times: "Right now I feel worried about _____ because _____. My body feels _____ when this happens."', placeholder: "Right now I feel worried about my exams because my family expects me to be the first graduate. My body feels tight in my chest when this happens...", tip: "Naming what you feel is not weakness. It is the first step. In many of our cultures, staying silent is seen as strength. But silence makes worry grow. You just did something most people never do. 🌿" },
  { day: 2, theme: "Breathing", emoji: "💨", duration: "3 min", title: "Try this breathing exercise.", context: "When bad news comes, when things go wrong, your body panics. This breathing exercise, done every day, helps your body calm down. It is free. It works anywhere.", task: "Do 3 rounds of 4-7-8 breathing right now. Breathe IN for 4 counts, HOLD for 7, breathe OUT for 8. Then write how your body feels after.", placeholder: "Before I felt very tense. After 3 rounds my shoulders relaxed and I felt a little calmer...", tip: "That shift you felt? Your body just switched from panic to calm. Your grandparents knew this without science — slow breath, calm mind. Use this tool anywhere. Church, taxi, exam hall. 💨" },
  { day: 3, theme: "Reframing", emoji: "🪞", duration: "5 min", title: "Tell a better story.", context: "Worry tells you the worst story. 'I will fail.' 'I am not good enough.' Today you write a better, more honest story back.", task: 'Pick one worrying thought from this week. Write it down. Then write a more honest version. Example — Worried: "I will fail this exam." Honest: "I have not studied everything, but one exam does not end my life."', placeholder: "Worried thought: I will never find a job and I will disappoint my whole family\nHonest thought: The job market is hard but not impossible. Many people I know eventually found work. I just need to keep going...", tip: "You just did something that helps your mind — the same thing that costs a lot of money at a therapist. The honest version does not need to be happy. It just needs to be true. 🪞" },
  { day: 4, theme: "Body Scan", emoji: "🧘", duration: "5 min", title: "Where do you feel it?", context: "Worry lives in your body too. Tight shoulders. Heavy chest. Stomach pain. Most of us do not notice until it gets bad. Today you pay attention.", task: "Close your eyes for 2 minutes. Slowly move your attention from your head to your feet. Notice where you feel tension. Do not try to fix it. Just notice. Then write: where does your body hold your worry, and what does it feel like?", placeholder: "I noticed my shoulders are almost at my ears. My stomach feels heavy. I did not know I was holding my jaw so tight...", tip: "Your body remembers things your mind tries to forget. When you notice where tension lives, you can start to let it go. You are not the tension. You are the one who notices it. 🧘" },
  { day: 5, theme: "Community", emoji: "🌍", duration: "5 min", title: "You are not the only one.", context: "When we keep things inside, they grow bigger. Today you share just one thing — not everything, just one. Someone else in this group is carrying something very similar.", task: 'Share one honest sentence with your Amahoro group: "One thing giving me worry lately is ___." Just one sentence. That is it.', placeholder: "I shared it. It felt scary but also like a relief. Someone else replied and said they feel the same way...", tip: "What you just did takes real courage. Someone else in this group just felt less alone because of your honesty. That is Ubuntu — I am because we are. 🌍" },
  { day: 6, theme: "Values", emoji: "⭐", duration: "5 min", title: "What really matters to you?", context: "A lot of our stress comes from chasing goals that are not really ours — our parents' dreams, what society expects. Today you go back to what truly matters to you.", task: "Write 5 things that genuinely matter to you in life. Not what you think should matter — what actually does. Then mark the one that gets the least time in your life right now.", placeholder: "1. My younger siblings 2. Finishing my degree 3. Honesty 4. Making music 5. Being healthy. I marked making music — I have not touched my guitar in 4 months...", tip: "Worry often points to a gap between how you are living and what you truly care about. This is not guilt — it is information. That gap tells you something important. 🌿" },
  { day: 7, theme: "Gratitude", emoji: "🙏", duration: "3 min", title: "Notice what is already good.", context: "Your brain notices problems more than good things. This kept our ancestors alive, but today it makes worry worse. Being thankful for small things actually changes how your brain works.", task: "Name 3 specific things you are grateful for today that you usually ignore. Not big things — be precise. Not 'my health' but 'the fact that I woke up without pain today.'", placeholder: "1. My roommate left me food without asking 2. The matatu came before it rained 3. My phone charger still works after 3 years...", tip: "The more specific your gratitude, the more it helps. You just chose to notice goodness. Do this every day and in 2 weeks your mood will start to shift. 🙏" },
  { day: 8, theme: "Boundaries", emoji: "🛡️", duration: "5 min", title: "Protect your energy.", context: "In our families, saying no feels wrong — especially when people depend on you. But protecting your energy is not selfish. It is how you stay strong enough to help others.", task: "Name one person or habit that takes too much of your energy. Write it down. Then write one small thing you can do this week to protect yourself — not a big fight, just one small step.", placeholder: "My cousin calls me every evening with his problems but never asks about mine. One small step: I will stop picking up after 9pm on weekdays...", tip: "You cannot give what you do not have. Protecting yourself is how you stay able to love and help others. That is not selfish — that is wisdom. 🛡️" },
  { day: 9, theme: "Sleep", emoji: "🌙", duration: "3 min", title: "Sleep is not laziness.", context: "Many of us wear tiredness like a badge of honour. 'I only slept 4 hours.' But not sleeping makes worry 30-40% worse. You are not more productive without sleep. You are just more stressed.", task: "Write what your sleep really looks like: what time you actually sleep, wake up, and how rested you feel. Then write one change — just one — you can make this week to get one extra hour of sleep.", placeholder: "I sleep at 1am, wake at 5:30am for class. I feel exhausted by 10am. One change: I will stop looking at my phone after 11pm this week...", tip: "Sleep is when your brain heals. Cutting sleep to study more actually makes your brain work worse. One extra hour matters more than you think. 🌙" },
  { day: 10, theme: "Resilience", emoji: "💪", duration: "5 min", title: "Look at what you have survived.", context: "You have survived every hard day so far. Today you write down the hard things you have already been through. The next time you feel like you cannot cope, this list will remind you that you can.", task: "Write 5 hard things you have already survived or done. Big or small — both count. Then write: what does this list tell you about who you actually are?", placeholder: "1. Passed my exams when I thought I would fail 2. Moved to a new city alone at 19 3. Helped my family through a hard time 4. Learned to code by myself 5. Survived the year I almost gave up. This tells me: I have done hard things before...", tip: "Read that list slowly. Every single thing on it is proof that you are stronger than you think. Save this list. Come back to it on your hardest days. 💪" },
  { day: 11, theme: "Comparison", emoji: "📵", duration: "5 min", title: "Stop comparing chapters.", context: "You see others doing well online and wonder why you are behind. But you are only seeing their best moments, not their struggle. You are comparing your chapter 1 to their chapter 20.", task: "Think of someone you have been comparing yourself to. Write what you see from the outside. Then write 3 things you do NOT know about their real life and real struggles.", placeholder: "I compare myself to my classmate who always looks like she has it together. From outside: good job, nice clothes, confident. But I do not know: if she has debt, if her relationship is okay, if she is actually happy...", tip: "Everyone is working hard to hide their difficulties. You are not behind. You are on your own path, writing your own story. Nobody else's chapter is yours to live. 📵" },
  { day: 12, theme: "Movement", emoji: "🚶", duration: "3 min", title: "Just walk for 10 minutes.", context: "Walking is one of the best ways to reduce worry. Just 10 minutes outside releases chemicals in your brain that fight stress. No gym. No money. Just walking.", task: "Take a 10-minute walk today — outside if possible. No phone, no music, just walking. Notice what you see, hear, smell. Then write 3 things you noticed that you would normally miss.", placeholder: "I noticed a mango tree I have walked past 100 times but never really seen. I heard kids playing two streets over. The air smelled different after yesterday's rain...", tip: "That walk just changed your brain chemistry. Moving your body moves your feelings. 10 minutes every day is enough to reduce worry in 3 weeks. 🚶" },
  { day: 13, theme: "Fear Audit", emoji: "🔦", duration: "5 min", title: "What are you really afraid of?", context: "Most worry is fear hiding underneath. Fear of failing. Fear of disappointing people. When you name the real fear, it becomes smaller and easier to work with.", task: "Ask yourself: 'What am I most afraid of right now?' Write it down without making it smaller. Then ask: 'And if that happened, what would I actually do?' Write your honest answer.", placeholder: "I am afraid I will fail my final exams and lose my scholarship. If that happened: I would be devastated. But I would probably find another way — maybe retake, maybe work and study. It would not be the end...", tip: "Worry lives in vagueness. When you ask 'and then what?' enough times, you usually end up at: 'I would survive.' That is the truth worry hides from you. 🔦" },
  { day: 14, theme: "Self-Compassion", emoji: "🤗", duration: "5 min", title: "Talk to yourself kindly.", context: "Most of us are our own harshest critics. You would never talk to your best friend the way you talk to yourself. Today you change that.", task: "Write the harshest thing you have said to yourself this week. Then rewrite it as if you were saying it to your best friend going through the same thing.", placeholder: "What I said to myself: 'You are so stupid, why can't you just focus?' To my friend: 'You are dealing with so much right now. It makes sense that you are struggling. You are not stupid — you are overwhelmed.'", tip: "Being kind to yourself is not weakness. Research shows that people who treat themselves with kindness actually do better and bounce back faster than those who are harsh on themselves. 🤗" },
  { day: 15, theme: "Progress", emoji: "📊", duration: "5 min", title: "You are not the same person.", context: "This is where many people stop — not because they failed, but because they cannot see the change happening inside them. Today you look properly.", task: "Think back to Day 1. What is different about how you are thinking or feeling now compared to when you started? Even small changes count.", placeholder: "On Day 1 my chest felt tight all the time. Now I notice it is only tight in specific moments. I also breathe more before I react. I did not notice this until now...", tip: "Change is happening. It is quiet and real. You are not the same person who started this challenge. Keep going — the last 6 days are where the deepest change happens. 📊" },
  { day: 16, theme: "Environment", emoji: "🏠", duration: "5 min", title: "Tidy one small space.", context: "A messy space makes worry worse. A clean space signals safety to your brain. You may not control many things in your life — but you can control your immediate space.", task: "Spend 10 minutes cleaning or organising one small space — your desk, your bag, or your phone home screen. Then write: how did it look before, and how do you feel after?", placeholder: "My desk had 3 weeks of notes, empty bottles and cables everywhere. I spent 15 minutes sorting it. Now I can see the surface. Something about this made me feel slightly more in control...", tip: "When you create order in a small space, your brain sees it as evidence that you have some control over your life. Small acts of order fight big feelings of chaos. 🏠" },
  { day: 17, theme: "Connection", emoji: "❤️", duration: "5 min", title: "Reach out to someone.", context: "When we are stressed, we pull away from people. But connection is one of the most powerful things that helps us feel better. Today you reach back.", task: "Name one person who makes you feel good and that you have not spoken to in too long. Send them a simple message today — not to vent, just to connect. Then write why you chose them.", placeholder: "I texted my friend Diane who I have not called since February. Just said 'thinking of you, hope you are well.' She called me back immediately and we talked for an hour...", tip: "You do not need to be struggling to reach out. You can reach out simply because you care. That is what friendship is. ❤️" },
  { day: 18, theme: "Purpose", emoji: "🧭", duration: "5 min", title: "Why are you doing this?", context: "Worry gets worse when we feel lost. When you know WHY you are doing something, the hard parts become easier to bear.", task: "Answer honestly: why are you really doing what you are doing — school, work, whatever it is? Not the expected answer. The real one. Then write: how does that connect to something bigger than just you?", placeholder: "I am studying because I want to take care of my mum the way she has taken care of me. If I succeed, she does not have to work so hard anymore. That is bigger than my fear of exams...", tip: "Your 'why' is an anchor. When worry pulls you into chaos, your reason brings you back to solid ground. It does not need to be big — the most powerful reasons are personal and deeply felt. 🧭" },
  { day: 19, theme: "Acceptance", emoji: "🌊", duration: "5 min", title: "Some things you cannot control.", context: "Worry gets worst around things we cannot change. Fighting what we cannot control is exhausting. Accepting it is not giving up — it is choosing where to put your energy.", task: "Write one thing causing you worry that is genuinely outside your control. Then write honestly: what CAN you control about this situation, even if it is small?", placeholder: "I cannot control whether I get the scholarship. I can control: how prepared I am for the interview, how I present myself, and applying to 3 other options as backup...", tip: "Focusing on what you can control keeps your thinking clear. Focusing on what you cannot control makes everything feel hopeless. Choose your focus. 🌊" },
  { day: 20, theme: "Integration", emoji: "🔗", duration: "5 min", title: "Build your personal toolkit.", context: "You have tried 19 different tools over the past weeks. Some worked well for you. Some did not. Today you build YOUR personal toolkit — the things that actually helped.", task: "Look back at your journey. Write your top 3 tools or lessons from this challenge. Then write specifically when and how you will use each one going forward.", placeholder: "1. 4-7-8 breathing — I will do this every morning before I open my phone. 2. Writing the honest thought — I will do this in my notes app when worry gets loud. 3. My survival list — I saved it and I will re-read it when I want to give up...", tip: "A toolkit only works if you use it. You have just designed your own personal wellness plan — one that fits your life, your culture, your reality. That is extraordinary. 🔗" },
  { day: 21, theme: "Completion", emoji: "🏆", duration: "Final day", title: "You are not the same person you were on Day 1.", context: "You named what you felt. You breathed through it. You told a better story. You shared with others. You built your strength. You showed up — not perfectly, but honestly. That is everything.", task: "Write a short letter from the you of today to the you who started Day 1. What do you want them to know? What changed? What will you carry forward?", placeholder: "Dear Day 1 me,\n\nI want you to know that the worry you are feeling right now is real — but you are bigger than it. Over the next 21 days you are going to learn things about yourself that nobody ever taught you...", tip: "You finished. Not perfectly — but you showed up. In a world that never taught us how to handle our feelings, you took 21 days to start learning. This is not the end. It is the beginning of a life where you face yourself with more courage. Amahoro. 🏆" }
];

const COLORS = {
  night: "#0D1117", deep: "#141B24", card: "#1C2733", border: "#263040",
  green: "#25D366", amber: "#F5A623", red: "#E8544A", sky: "#4FC3F7",
  text: "#E8EDF2", muted: "#7A8FA6", faint: "#3A4A5C",
};
const C = COLORS;

function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center", padding: "4px 0" }}>
      {[0,1,2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: C.green, animation: `typing 1.2s infinite ${i*0.2}s` }} />)}
    </div>
  );
}

function Badge({ color="green", children }) {
  const map = { green:[C.green,"rgba(37,211,102,0.12)","rgba(37,211,102,0.25)"], amber:[C.amber,"rgba(245,166,35,0.15)","rgba(245,166,35,0.25)"], sky:[C.sky,"rgba(79,195,247,0.12)","rgba(79,195,247,0.2)"], red:[C.red,"rgba(232,84,74,0.15)","rgba(232,84,74,0.25)"] };
  const [col,bg,b] = map[color]||map.green;
  return <span style={{ fontSize:11, fontWeight:700, fontFamily:"Sora,sans-serif", letterSpacing:"0.06em", textTransform:"uppercase", padding:"3px 10px", borderRadius:100, background:bg, border:`1px solid ${b}`, color:col }}>{children}</span>;
}

function ProgressBar({ value, max=21 }) {
  return <div style={{ height:4, background:C.border, borderRadius:2, marginTop:12 }}><div style={{ height:"100%", width:`${(value/max)*100}%`, background:C.green, borderRadius:2, transition:"width 0.6s ease" }} /></div>;
}

async function callClaude(systemPrompt, userMessage, apiKey) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type":"application/json", "x-api-key": apiKey, "anthropic-version":"2023-06-01", "anthropic-dangerous-direct-browser-access":"true" },
    body: JSON.stringify({ model:"claude-sonnet-4-6", max_tokens:1000, system: systemPrompt, messages:[{ role:"user", content: userMessage }] })
  });
  const data = await res.json();
  return data.content?.[0]?.text || "Something went wrong. Please try again.";
}

const MAHORO_SYSTEM = `You are Mahoro, a warm AI wellness coach for African youth from the Amahoro Challenge. You speak simply and warmly — short sentences, easy words, like talking to a friend. You understand African realities: exam pressure, firstborn responsibilities, family expectations, job stress, social comparison. You never use big clinical words without explaining them. You keep responses to 3-5 sentences. No bullet points. Always use the person's name if you know it. Always use very simple English that someone whose first language is not English can easily understand.`;

// ─── PRO SCREEN ──────────────────────────────────────────────
function ProScreen({ user, isPro, isOrg, onActivatePro, onActivateOrg, onBack }) {
  const [checked, setChecked] = useState(false);
  const [orgChecked, setOrgChecked] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [workshopTopic, setWorkshopTopic] = useState("");
  const [activeFeature, setActiveFeature] = useState(null);
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");
  const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;

  const generate = async (prompt) => {
    setLoading(true); setOutput("");
    try { setOutput(await callClaude(MAHORO_SYSTEM, prompt, API_KEY)); }
    catch { setOutput("Could not connect. Please check your internet and try again."); }
    setLoading(false);
  };

  const proFeatures = [
    { key:"workbook", label:"📘 My Personal Workbook", desc:"A workbook written just for you based on your journey.", prompt:`Create a short personal wellness workbook for ${user?.name||"a user"} from ${user?.country||"Africa"}. Their main worry: ${user?.trigger||"general stress"}. Their goal: ${user?.goal||"feel calmer"}. Write 5 sections. Each section: a simple title, 2-3 sentences of warm explanation, and one short exercise. Use very simple English. Make it personal and encouraging.` },
    { key:"meditation", label:"🧘 My Guided Meditation", desc:"A personal 5-minute meditation written for your life.", prompt:`Write a short 5-minute guided meditation for ${user?.name||"someone"} from ${user?.country||"Africa"} dealing with ${user?.trigger||"stress and worry"}. Use very simple English. Make it warm. Include breathing, body relaxation and a positive ending. Write directly to them using "you".` },
    { key:"progress", label:"📊 My Progress Report", desc:"See how far you have come and what to focus on next.", prompt:`Write a warm monthly progress report for ${user?.name||"a user"} doing the Amahoro 21-day challenge from ${user?.country||"Africa"}. Their main worry was: ${user?.trigger||"stress"}. Their goal: ${user?.goal||"feel calmer"}. Write 4 short sections: 1) What you have achieved, 2) What is getting better, 3) What to keep working on, 4) Your next steps. Use simple English. End with an encouraging message.` },
    { key:"newchallenge", label:"🔄 New 7-Day Challenge", desc:"A brand new challenge made for your specific situation.", prompt:`Create a new 7-day wellness challenge for ${user?.name||"someone"} from ${user?.country||"Africa"} whose main struggle is ${user?.trigger||"stress"}. Each day: a simple title, one short paragraph of context (2-3 sentences), and one clear task that takes 5 minutes. Use very simple English. Make it practical and real for African youth life.` },
  ];

  const orgFeatures = [
    { key:"workshop", label:"🏫 Workshop Plan", desc:"A ready-to-use 1-hour wellness workshop for your group.", prompt:`Create a 1-hour wellness workshop plan for ${orgName||"an organization"} with ${teamSize||"a group of"} young people. Topic: ${workshopTopic||"managing stress and worry"}. Include: welcome activity (10 min), main learning (30 min), group discussion (15 min), closing reflection (5 min). Use very simple English. Include what the facilitator should say and do at each stage.` },
    { key:"groupreport", label:"📈 Group Progress Report", desc:"A professional report to share with your organization.", prompt:`Write a simple one-page group wellness progress report for ${orgName||"an organization"} using the Amahoro Challenge program. Include: program overview, key benefits observed, what participants are learning, recommendations for next month, and a closing note for leadership. Use simple clear English. Make it positive and practical.` },
    { key:"onboarding", label:"📋 Staff Guide", desc:"A simple guide for your staff to introduce Amahoro.", prompt:`Write a simple staff guide for facilitators introducing the Amahoro Challenge to young people at ${orgName||"an organization"}. Include: how to introduce the program, how to support participants, common questions and answers, how to help someone who is struggling, and how to celebrate completions. Use very simple English. Make it warm and practical.` },
  ];

  return (
    <div style={{ minHeight:"100vh", background:C.night, color:C.text, fontFamily:"DM Sans,sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap'); *{box-sizing:border-box} @keyframes typing{0%,60%,100%{opacity:0.3;transform:translateY(0)}30%{opacity:1;transform:translateY(-4px)}} @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}} .fade-in{animation:fadeIn 0.4s ease} ::-webkit-scrollbar{width:5px} ::-webkit-scrollbar-thumb{background:#263040;border-radius:3px}`}</style>
      <div style={{ background:C.deep, borderBottom:`1px solid ${C.border}`, padding:"0 4%", height:62, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <button onClick={onBack} style={{ background:"transparent", border:"none", color:C.muted, cursor:"pointer", fontFamily:"Sora,sans-serif", fontSize:"0.9rem" }}>← Back</button>
        <div style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:"1rem", color:C.green }}>🌿 {isPro ? (isOrg ? "Organizations" : "Pro") : "Upgrade"}</div>
        <div style={{ width:60 }} />
      </div>

      <div style={{ maxWidth:720, margin:"0 auto", padding:"2rem 4% 5rem" }}>

        {!isPro && (
          <div className="fade-in">
            <h2 style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:"1.6rem", marginBottom:8 }}>Unlock your full plan</h2>
            <p style={{ color:C.muted, marginBottom:28, lineHeight:1.7 }}>After paying on Paystack, tick the box below to unlock your features right away. We check every payment manually.</p>

            <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:"22px", marginBottom:16 }}>
              <div style={{ fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"1rem", marginBottom:4 }}>🌿 Amahoro Pro — $4/month</div>
              <div style={{ fontSize:"0.82rem", color:C.muted, marginBottom:14 }}>Unlimited coaching · Personal workbook · Meditation · Progress report · New challenges</div>
              <label style={{ display:"flex", alignItems:"flex-start", gap:12, cursor:"pointer", marginBottom:14 }}>
                <input type="checkbox" checked={checked} onChange={e => setChecked(e.target.checked)} style={{ width:18, height:18, marginTop:2, accentColor:C.green, cursor:"pointer", flexShrink:0 }} />
                <span style={{ fontSize:"0.88rem", color:C.muted, lineHeight:1.6 }}>I have already paid $4/month for Amahoro Pro on Paystack. I know my payment will be checked.</span>
              </label>
              <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                <a href="https://paystack.shop/pay/25-4wusw62" target="_blank" rel="noreferrer" style={{ display:"inline-flex", alignItems:"center", gap:6, background:"transparent", border:`1px solid ${C.green}`, color:C.green, fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"0.85rem", padding:"8px 16px", borderRadius:8, textDecoration:"none" }}>Pay $4/month →</a>
                <button onClick={() => { if(checked) onActivatePro(); }} disabled={!checked} style={{ background:checked?C.green:C.faint, border:"none", color:checked?"#000":C.muted, fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"0.88rem", padding:"8px 20px", borderRadius:8, cursor:checked?"pointer":"not-allowed" }}>✓ Activate Pro</button>
              </div>
            </div>

            <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:"22px" }}>
              <div style={{ fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"1rem", marginBottom:4 }}>🏫 Organizations — $29/month</div>
              <div style={{ fontSize:"0.82rem", color:C.muted, marginBottom:14 }}>Everything in Pro · Workshop plans · Group reports · Staff guide</div>
              <input value={orgName} onChange={e => setOrgName(e.target.value)} placeholder="Your organization name" style={{ width:"100%", background:C.deep, border:`1px solid ${C.border}`, borderRadius:8, padding:"9px 14px", color:C.text, fontFamily:"DM Sans,sans-serif", fontSize:"0.9rem", outline:"none", marginBottom:12 }} />
              <label style={{ display:"flex", alignItems:"flex-start", gap:12, cursor:"pointer", marginBottom:14 }}>
                <input type="checkbox" checked={orgChecked} onChange={e => setOrgChecked(e.target.checked)} style={{ width:18, height:18, marginTop:2, accentColor:"#4FC3F7", cursor:"pointer", flexShrink:0 }} />
                <span style={{ fontSize:"0.88rem", color:C.muted, lineHeight:1.6 }}>I have already paid $29/month for Amahoro Organizations on Paystack. I know my payment will be checked.</span>
              </label>
              <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                <a href="https://paystack.shop/pay/ljxed84arr" target="_blank" rel="noreferrer" style={{ display:"inline-flex", alignItems:"center", gap:6, background:"transparent", border:"1px solid #4FC3F7", color:"#4FC3F7", fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"0.85rem", padding:"8px 16px", borderRadius:8, textDecoration:"none" }}>Pay $29/month →</a>
                <button onClick={() => { if(orgChecked && orgName.trim()) { onActivateOrg(); } else if(!orgName.trim()) alert("Please enter your organization name first."); }} disabled={!orgChecked} style={{ background:orgChecked?"#4FC3F7":C.faint, border:"none", color:orgChecked?"#000":C.muted, fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"0.88rem", padding:"8px 20px", borderRadius:8, cursor:orgChecked?"pointer":"not-allowed" }}>✓ Activate Organizations</button>
              </div>
            </div>
          </div>
        )}

        {isPro && (
          <div className="fade-in">
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
              <h2 style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:"1.6rem" }}>{isOrg ? "🏫 Organizations" : "🌿 Pro"} Dashboard</h2>
              <span style={{ background:"rgba(37,211,102,0.15)", border:"1px solid rgba(37,211,102,0.3)", color:C.green, fontSize:"0.72rem", fontFamily:"Sora,sans-serif", fontWeight:700, padding:"3px 10px", borderRadius:100 }}>{isOrg?"ORG":"PRO"}</span>
            </div>
            <p style={{ color:C.muted, marginBottom:28, lineHeight:1.7 }}>Hello {user?.name||""}! Your tools are ready. Click one to generate it just for you.</p>

            <h3 style={{ fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"0.9rem", color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:12 }}>Your Personal Tools</h3>
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
                <h3 style={{ fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"0.9rem", color:"#4FC3F7", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:12 }}>Organization Tools</h3>
                <div style={{ marginBottom:12, display:"flex", gap:8, flexWrap:"wrap" }}>
                  <input value={teamSize} onChange={e => setTeamSize(e.target.value)} placeholder="Number of participants" style={{ flex:1, minWidth:180, background:C.deep, border:`1px solid ${C.border}`, borderRadius:8, padding:"9px 14px", color:C.text, fontFamily:"DM Sans,sans-serif", fontSize:"0.88rem", outline:"none" }} />
                  <input value={workshopTopic} onChange={e => setWorkshopTopic(e.target.value)} placeholder="Workshop topic (e.g. exam stress)" style={{ flex:1, minWidth:180, background:C.deep, border:`1px solid ${C.border}`, borderRadius:8, padding:"9px 14px", color:C.text, fontFamily:"DM Sans,sans-serif", fontSize:"0.88rem", outline:"none" }} />
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
                <button onClick={() => generate(activeFeature.prompt)} style={{ background:C.green, border:"none", color:"#000", fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"0.9rem", padding:"10px 22px", borderRadius:8, cursor:"pointer", marginBottom: loading||output ? 16 : 0 }}>
                  {loading ? "Mahoro is writing for you..." : "✨ Generate for Me"}
                </button>
                {loading && <div style={{ display:"flex", gap:4, alignItems:"center", padding:"8px 0" }}><TypingDots /><span style={{ fontSize:"0.85rem", color:C.muted, marginLeft:8 }}>Writing just for you...</span></div>}
                {output && (
                  <div className="fade-in" style={{ background:"rgba(37,211,102,0.04)", border:"1px solid rgba(37,211,102,0.15)", borderRadius:10, padding:"16px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <div style={{ width:28, height:28, borderRadius:"50%", background:"linear-gradient(135deg,#25D366,#4FC3F7)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.8rem" }}>🌿</div>
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

// ─── LANDING SCREEN ───────────────────────────────────────────
function LandingScreen({ onStart, onCoach, onPro, isPro, isOrg }) {
  return (
    <div style={{ minHeight:"100vh", background:C.night, color:C.text, fontFamily:"DM Sans,sans-serif", overflowX:"hidden" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap'); *{box-sizing:border-box;margin:0;padding:0} body{overflow-x:hidden} @keyframes typing{0%,60%,100%{opacity:0.3;transform:translateY(0)}30%{opacity:1;transform:translateY(-4px)}} @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(0.7)}} @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}} @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}} @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(37,211,102,0.2)}50%{box-shadow:0 0 40px rgba(37,211,102,0.5)}} .hero-in{animation:fadeUp 0.7s ease forwards} .hero-in-2{animation:fadeUp 0.7s 0.15s ease both} .hero-in-3{animation:fadeUp 0.7s 0.3s ease both} .btn-pulse{animation:glow 2.5s ease-in-out infinite} .float-wa{animation:float 3s ease-in-out infinite} .card-hover:hover{transform:translateY(-4px)!important;border-color:#3A4A5C!important} ::-webkit-scrollbar{width:6px} ::-webkit-scrollbar-track{background:#0D1117} ::-webkit-scrollbar-thumb{background:#263040;border-radius:3px}`}</style>

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
          Free to start · Made for African youth
        </div>
        <h1 className="hero-in-2" style={{ fontFamily:"Sora,sans-serif", fontSize:"clamp(2.2rem,6vw,4.2rem)", fontWeight:800, lineHeight:1.1, letterSpacing:"-0.03em", marginBottom:20, maxWidth:820 }}>
          Feel better.<br /><span style={{ color:C.green }}>21 days.</span> Small steps.<br /><span style={{ color:C.amber }}>Made for Africa.</span>
        </h1>
        <p className="hero-in-3" style={{ fontSize:"1.1rem", color:C.muted, maxWidth:560, marginBottom:36, fontWeight:300, lineHeight:1.75 }}>
          Feeling worried, stressed or overwhelmed? You are not alone. Every day for 21 days, we give you one small thing to do. A coach who understands your life. A community that gets it.
        </p>
        <div style={{ display:"flex", gap:12, flexWrap:"wrap", justifyContent:"center", marginBottom:48 }}>
          <button onClick={onStart} className="btn-pulse" style={{ display:"flex", alignItems:"center", gap:8, background:C.green, border:"none", color:"#000", fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"1rem", padding:"14px 32px", borderRadius:10, cursor:"pointer" }}>🌿 Start Free Today</button>
          <button onClick={onCoach} style={{ display:"flex", alignItems:"center", gap:8, background:"transparent", border:`1px solid ${C.border}`, color:C.text, fontFamily:"Sora,sans-serif", fontWeight:600, fontSize:"1rem", padding:"14px 28px", borderRadius:10, cursor:"pointer" }}>💬 Ask Mahoro</button>
        </div>
        <div style={{ display:"flex", gap:48, justifyContent:"center", flexWrap:"wrap", borderTop:`1px solid ${C.border}`, paddingTop:28 }}>
          {[["21","Day Challenge"],["78%","Feel less worried"],["5 min","Per day"],["Free","To start"]].map(([n,l]) => (
            <div key={l} style={{ textAlign:"center" }}>
              <div style={{ fontFamily:"Sora,sans-serif", fontSize:"1.8rem", fontWeight:800, color:"#fff" }}>{n}</div>
              <div style={{ fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em" }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Problem */}
      <div style={{ padding:"5rem 5%", background:C.deep }}>
        <div style={{ fontSize:11, color:C.green, fontFamily:"Sora,sans-serif", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:12 }}>Why This Matters</div>
        <h2 style={{ fontFamily:"Sora,sans-serif", fontSize:"clamp(1.8rem,4vw,2.6rem)", fontWeight:800, letterSpacing:"-0.025em", marginBottom:12, maxWidth:640, lineHeight:1.15 }}>Many of us are struggling — but nobody talks about it.</h2>
        <p style={{ color:C.muted, fontSize:"1rem", maxWidth:580, marginBottom:40, lineHeight:1.7 }}>"Just pray about it." "You think too much." But the pressure is real. And most of us carry it alone.</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:14 }}>
          {[
            { icon:"📚", title:"School Pressure", desc:"Exams. Scholarships. Being the first in your family to graduate. The pressure is heavy and there is nowhere to talk about it.", tag:"Very Common", tc:"red" },
            { icon:"💼", title:"Job Stress", desc:"Jobs are hard to find. Every rejection hurts more when your family is counting on you.", tag:"Widespread", tc:"amber" },
            { icon:"🏠", title:"Family Expectations", desc:"As the firstborn, you carry everyone. School fees. Bills. Expectations. All before you are 25.", tag:"Very Common", tc:"red" },
            { icon:"📱", title:"Comparing Yourself", desc:"You see others doing well online and wonder why you are behind. But you are only seeing their best moments.", tag:"Growing Fast", tc:"amber" },
            { icon:"🏥", title:"No Help Available", desc:"Seeing a therapist costs too much for most of us. Help should not be a luxury.", tag:"Critical Gap", tc:"red" },
            { icon:"🗣️", title:"No Space to Talk", desc:'"Strong people do not cry." There are no words for how you feel that do not sound like complaining.', tag:"Being Broken", tc:"sky" },
          ].map(card => (
            <div key={card.title} className="card-hover" style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:"20px 20px 18px", transition:"transform 0.25s, border-color 0.25s" }}>
              <div style={{ fontSize:28, marginBottom:12 }}>{card.icon}</div>
              <h4 style={{ fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"0.95rem", marginBottom:6 }}>{card.title}</h4>
              <p style={{ fontSize:"0.85rem", color:C.muted, lineHeight:1.65, marginBottom:10 }}>{card.desc}</p>
              <Badge color={card.tc}>{card.tag}</Badge>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div style={{ padding:"5rem 5%" }}>
        <div style={{ fontSize:11, color:C.green, fontFamily:"Sora,sans-serif", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:12 }}>How It Works</div>
        <h2 style={{ fontFamily:"Sora,sans-serif", fontSize:"clamp(1.8rem,4vw,2.6rem)", fontWeight:800, letterSpacing:"-0.025em", marginBottom:12, lineHeight:1.15 }}>Simple steps. Real change.</h2>
        <p style={{ color:C.muted, fontSize:"1rem", maxWidth:560, marginBottom:40, lineHeight:1.7 }}>No complicated instructions. Just show up for 5 minutes a day.</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:14 }}>
          {[
            { icon:"🌅", time:"Each morning", title:"One Small Task", desc:"Each morning you get one small thing to do. It is simple, short and made for your life." },
            { icon:"✍️", time:"5 minutes", title:"Write Your Answer", desc:"Answer one question about your day or how you are feeling. No long essays. Just your honest words." },
            { icon:"🤖", time:"Right away", title:"Mahoro Replies", desc:"Mahoro reads what you wrote and replies with something helpful. Every time. In seconds." },
            { icon:"👥", time:"Every day", title:"Others Like You", desc:"Share your wins or hard days with others going through the same thing. You are not alone." },
            { icon:"🏆", time:"Day 21", title:"You Made It", desc:"See how much you have grown. Get a certificate you can share. Keep your tools for life." },
          ].map(s => (
            <div key={s.title} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:"20px 18px" }}>
              <div style={{ fontSize:28, marginBottom:10 }}>{s.icon}</div>
              <div style={{ fontSize:10, color:C.green, fontFamily:"Sora,sans-serif", fontWeight:700, letterSpacing:"0.07em", textTransform:"uppercase", marginBottom:6 }}>{s.time}</div>
              <h4 style={{ fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"0.95rem", marginBottom:6 }}>{s.title}</h4>
              <p style={{ fontSize:"0.83rem", color:C.muted, lineHeight:1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* WhatsApp */}
      <div style={{ padding:"5rem 5%", background:C.deep }}>
        <div style={{ fontSize:11, color:C.green, fontFamily:"Sora,sans-serif", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:12 }}>WhatsApp</div>
        <h2 style={{ fontFamily:"Sora,sans-serif", fontSize:"clamp(1.8rem,4vw,2.6rem)", fontWeight:800, letterSpacing:"-0.025em", marginBottom:12, lineHeight:1.15 }}>No app needed. Just WhatsApp.</h2>
        <p style={{ color:C.muted, fontSize:"1rem", maxWidth:560, marginBottom:40, lineHeight:1.7 }}>WhatsApp is already on your phone. We meet you where you are.</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:14 }}>
          {[
            { icon:"🌅", title:"Morning Challenge", desc:"Get your daily task every morning as a WhatsApp message. No login needed. Works on any phone." },
            { icon:"🤖", title:"Mahoro Replies", desc:"Write your answer. Mahoro replies in seconds with something helpful and personal." },
            { icon:"👥", title:"Your Group", desc:"Join 20 other young people going through the challenge. Real support. No judgment." },
            { icon:"📊", title:"Weekly Update", desc:"Every Sunday, see how much your worry has reduced and what to focus on next week." },
          ].map(f => (
            <div key={f.title} className="card-hover" style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:"20px", transition:"transform 0.25s, border-color 0.25s" }}>
              <div style={{ fontSize:28, marginBottom:10 }}>{f.icon}</div>
              <h4 style={{ fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"0.95rem", marginBottom:6 }}>{f.title}</h4>
              <p style={{ fontSize:"0.85rem", color:C.muted, lineHeight:1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
        <div style={{ marginTop:32, display:"flex", gap:12, flexWrap:"wrap" }}>
          <a href="https://wa.me/254113445647?text=JOIN%20Amahoro%20Challenge" target="_blank" rel="noreferrer" style={{ display:"inline-flex", alignItems:"center", gap:8, background:C.green, border:"none", color:"#000", fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"0.95rem", padding:"12px 24px", borderRadius:8, textDecoration:"none" }}>💬 Join via WhatsApp</a>
          <button onClick={onStart} style={{ display:"inline-flex", alignItems:"center", gap:8, background:"transparent", border:`1px solid ${C.border}`, color:C.text, fontFamily:"Sora,sans-serif", fontWeight:600, fontSize:"0.95rem", padding:"12px 24px", borderRadius:8, cursor:"pointer" }}>Start on Web →</button>
        </div>
      </div>

      {/* Pricing */}
      <div style={{ padding:"5rem 5%" }}>
        <div style={{ textAlign:"center", marginBottom:40 }}>
          <div style={{ fontSize:11, color:C.green, fontFamily:"Sora,sans-serif", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:12 }}>Pricing</div>
          <h2 style={{ fontFamily:"Sora,sans-serif", fontSize:"clamp(1.8rem,4vw,2.6rem)", fontWeight:800, letterSpacing:"-0.025em", marginBottom:12 }}>Made to be affordable.</h2>
          <p style={{ color:C.muted, fontSize:"1rem", maxWidth:500, margin:"0 auto", lineHeight:1.7 }}>Free gets you far. Pro gets you everything.</p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))", gap:16, maxWidth:860, margin:"0 auto" }}>
          {[
            { name:"Free", price:"$0", sub:"/ forever", desc:"The full 21-day program. No card needed. No tricks.", featured:false, features:["All 21 daily challenges","AI coach Mahoro","4 languages supported","Community group access","Completion certificate"], missing:["Personal workbook","Guided meditation","Progress report","New challenge themes"], btnLabel:"Start Free Today", btnStyle:"outline" },
            { name:"Amahoro Pro", price:"$4", sub:"/ month", desc:"Everything in Free plus personal tools made just for you.", featured:true, features:["Everything in Free","Unlimited coaching","Personal workbook (AI-made)","Guided meditation (AI-made)","Monthly progress report","New 7-day challenge themes"], missing:[], btnLabel:"Get Amahoro Pro", btnStyle:"green" },
            { name:"Organizations", price:"$29", sub:"/ month", desc:"For schools, NGOs and youth groups.", featured:false, features:["Everything in Pro","Workshop plan (AI-made)","Group progress report","Staff onboarding guide","Up to 50 participants","Email support"], missing:[], btnLabel:"Get for My Organization", btnStyle:"sky" },
          ].map(p => (
            <div key={p.name} style={{ background:C.card, border:`2px solid ${p.featured?C.green:C.border}`, borderRadius:16, padding:"28px 24px", position:"relative", boxShadow:p.featured?`0 0 0 1px rgba(37,211,102,0.2),0 20px 40px rgba(37,211,102,0.07)`:"none" }}>
              {p.featured && <div style={{ position:"absolute", top:-14, left:"50%", transform:"translateX(-50%)", background:C.green, color:"#000", fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:11, letterSpacing:"0.07em", textTransform:"uppercase", padding:"4px 14px", borderRadius:100 }}>Most Popular</div>}
              <div style={{ fontSize:11, color:C.muted, fontFamily:"Sora,sans-serif", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8 }}>{p.name}</div>
              <div style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:"2.2rem", color:"#fff", marginBottom:4 }}>{p.price} <span style={{ fontSize:"0.95rem", color:C.muted, fontWeight:400 }}>{p.sub}</span></div>
              <div style={{ fontSize:"0.85rem", color:C.muted, marginBottom:20, lineHeight:1.5 }}>{p.desc}</div>
              <ul style={{ listStyle:"none", marginBottom:24 }}>
                {p.features.map(f => <li key={f} style={{ fontSize:"0.87rem", padding:"5px 0", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:8 }}><span style={{ color:C.green }}>✓</span>{f}</li>)}
                {p.missing.map(f => <li key={f} style={{ fontSize:"0.87rem", padding:"5px 0", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:8, opacity:0.35 }}><span>–</span>{f}</li>)}
              </ul>
              <button onClick={() => { if(p.btnStyle==="outline") onStart(); else onPro(); }}
                style={{ display:"block", width:"100%", padding:"12px", borderRadius:8, fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"0.92rem", cursor:"pointer", border:"none", background:p.btnStyle==="green"?C.green:p.btnStyle==="sky"?C.sky:C.deep, color:p.btnStyle==="outline"?C.text:"#000", border:p.btnStyle==="outline"?`1px solid ${C.border}`:"none" }}>
                {p.btnLabel}
              </button>
            </div>
          ))}
        </div>
        <div style={{ textAlign:"center", marginTop:16, fontSize:"0.82rem", color:C.muted }}>🔒 Payments via Paystack — M-Pesa, MTN Mobile Money, Airtel, cards · Cancel any time</div>
      </div>

      {/* Testimonials */}
      <div style={{ padding:"5rem 5%", background:C.deep }}>
        <div style={{ fontSize:11, color:C.green, fontFamily:"Sora,sans-serif", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:12 }}>What People Say</div>
        <h2 style={{ fontFamily:"Sora,sans-serif", fontSize:"clamp(1.8rem,4vw,2.6rem)", fontWeight:800, letterSpacing:"-0.025em", marginBottom:40, lineHeight:1.15 }}>Real stories. Real change.</h2>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(270px,1fr))", gap:14 }}>
          {[
            { flag:"🇷🇼", name:"Clarisse M.", loc:"Kigali, Rwanda · University student", quote:"I have been carrying exam worry since S3. By Day 14, I started sleeping again. Mahoro said something on Day 3 that I have kept as my phone wallpaper since." },
            { flag:"🇳🇬", name:"Emeka O.", loc:"Lagos, Nigeria · Job seeker", quote:"As a firstborn son, the pressure crushed me silently for years. No one I know talks about mental health. This challenge gave me words I did not have before." },
            { flag:"🇰🇪", name:"Aisha W.", loc:"Nairobi, Kenya · Form 4 student", quote:"I shared it with 12 girls in my class after finishing. Three texted me crying saying they needed this. We started a group to hold each other." },
          ].map(t => (
            <div key={t.name} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:"22px 20px" }}>
              <div style={{ color:C.amber, fontSize:"0.85rem", letterSpacing:2, marginBottom:12 }}>★★★★★</div>
              <p style={{ fontSize:"0.9rem", color:C.text, lineHeight:1.7, marginBottom:16, fontStyle:"italic" }}>"{t.quote}"</p>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:36, height:36, borderRadius:"50%", background:"rgba(37,211,102,0.1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.1rem" }}>{t.flag}</div>
                <div><div style={{ fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"0.88rem" }}>{t.name}</div><div style={{ fontSize:"0.75rem", color:C.muted }}>{t.loc}</div></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding:"5rem 5%", textAlign:"center" }}>
        <h2 style={{ fontFamily:"Sora,sans-serif", fontSize:"clamp(2rem,5vw,3rem)", fontWeight:800, letterSpacing:"-0.03em", marginBottom:16 }}>Your peace starts with<br />one small step.</h2>
        <p style={{ color:C.muted, fontSize:"1rem", maxWidth:420, margin:"0 auto 32px", lineHeight:1.7 }}>5 minutes a day. 21 days. A coach who understands you. People who get it. Free to start.</p>
        <button onClick={onStart} style={{ display:"inline-flex", alignItems:"center", gap:8, background:C.green, border:"none", color:"#000", fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"1.05rem", padding:"16px 40px", borderRadius:10, cursor:"pointer" }}>🌿 Start Free Today</button>
      </div>

      <div style={{ background:C.deep, borderTop:`1px solid ${C.border}`, padding:"2.5rem 5%", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:16 }}>
        <div>
          <div style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:"1.1rem", color:C.green, marginBottom:6 }}>Amahoro Challenge</div>
          <div style={{ fontSize:"0.82rem", color:C.muted }}>Feel better in 21 days. Built for African youth. 🇷🇼</div>
        </div>
        <div style={{ fontSize:"0.8rem", color:C.muted }}>© 2026 Amahoro · <a href="mailto:hello@amahoro.app" style={{ color:C.green, textDecoration:"none" }}>hello@amahoro.app</a></div>
      </div>

      <a href="https://wa.me/254113445647?text=JOIN" target="_blank" rel="noreferrer" className="float-wa" style={{ position:"fixed", bottom:24, right:24, zIndex:99, background:C.green, color:"#000", width:56, height:56, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.4rem", textDecoration:"none", boxShadow:"0 8px 24px rgba(37,211,102,0.4)" }}>💬</a>
    </div>
  );
}

// ─── ONBOARDING ───────────────────────────────────────────────
function OnboardingScreen({ onComplete }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [trigger, setTrigger] = useState("");
  const [goal, setGoal] = useState("");

  const countries = ["Rwanda","Kenya","Nigeria","Uganda","Tanzania","Ghana","Ethiopia","South Africa","Cameroon","Côte d'Ivoire","DRC / Congo","Senegal","Other"];
  const triggers = ["Exam / school pressure","Looking for a job","Family obligations and expectations","Comparing myself to others","Money stress","Relationship problems","Feeling lost or overwhelmed","Other"];
  const goals = ["Sleep better and feel calmer","Do better at school or work","Stop thinking too much","Build my confidence","Learn tools to manage stress for life"];

  const steps = [
    { title:"Welcome to Amahoro.", sub:"Let us make this personal. This takes 60 seconds.", content:(
      <div>
        <label style={{ fontSize:"0.82rem", fontFamily:"Sora,sans-serif", fontWeight:600, color:C.muted, letterSpacing:"0.05em", textTransform:"uppercase", display:"block", marginBottom:8 }}>Your first name</label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Amara, Kofi, Thandiwe..." style={{ width:"100%", background:C.deep, border:`1px solid ${C.border}`, borderRadius:8, padding:"12px 14px", color:C.text, fontSize:"1rem", fontFamily:"DM Sans,sans-serif", outline:"none" }} onFocus={e => e.target.style.borderColor=C.green} onBlur={e => e.target.style.borderColor=C.border} />
      </div>
    ), canNext: name.trim().length > 0 },
    { title:`Good to meet you, ${name||"warrior"}.`, sub:"Where are you?", content:(
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))", gap:8 }}>
        {countries.map(c => <button key={c} onClick={() => setCountry(c)} style={{ padding:"10px 14px", borderRadius:8, border:`1px solid ${country===c?C.green:C.border}`, background:country===c?"rgba(37,211,102,0.1)":C.deep, color:country===c?C.green:C.text, fontFamily:"Sora,sans-serif", fontWeight:600, fontSize:"0.85rem", cursor:"pointer" }}>{c}</button>)}
      </div>
    ), canNext: country !== "" },
    { title:"What worries you most?", sub:"Be honest. This shapes your challenge.", content:(
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {triggers.map(t => <button key={t} onClick={() => setTrigger(t)} style={{ padding:"12px 16px", borderRadius:8, border:`1px solid ${trigger===t?C.green:C.border}`, background:trigger===t?"rgba(37,211,102,0.08)":C.deep, color:trigger===t?C.green:C.text, fontFamily:"DM Sans,sans-serif", fontSize:"0.92rem", cursor:"pointer", textAlign:"left", display:"flex", alignItems:"center", gap:10 }}>{trigger===t?"✓":"○"} {t}</button>)}
      </div>
    ), canNext: trigger !== "" },
    { title:"One last question.", sub:"What do you want from this challenge?", content:(
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {goals.map(g => <button key={g} onClick={() => setGoal(g)} style={{ padding:"12px 16px", borderRadius:8, border:`1px solid ${goal===g?C.green:C.border}`, background:goal===g?"rgba(37,211,102,0.08)":C.deep, color:goal===g?C.green:C.text, fontFamily:"DM Sans,sans-serif", fontSize:"0.92rem", cursor:"pointer", textAlign:"left", display:"flex", alignItems:"center", gap:10 }}>{goal===g?"✓":"○"} {g}</button>)}
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
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:28 }}>
            {step>0 ? <button onClick={() => setStep(s => s-1)} style={{ background:"transparent", border:"none", color:C.muted, cursor:"pointer", fontFamily:"Sora,sans-serif", fontSize:"0.9rem" }}>← Back</button> : <div />}
            <button onClick={() => { if(step<steps.length-1) setStep(s => s+1); else onComplete({name,country,trigger,goal}); }} disabled={!cur.canNext}
              style={{ background:cur.canNext?C.green:C.faint, border:"none", color:cur.canNext?"#000":C.muted, fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:"0.95rem", padding:"10px 28px", borderRadius:8, cursor:cur.canNext?"pointer":"not-allowed" }}>
              {step===steps.length-1?"Start Day 1 →":"Continue →"}
            </button>
          </div>
        </div>
        <p style={{ textAlign:"center", color:C.faint, fontSize:"0.78rem", marginTop:16 }}>No card needed. No email required. Just show up.</p>
      </div>
    </div>
  );
}

// ─── CHALLENGE SCREEN ─────────────────────────────────────────
function ChallengeScreen({ user, onCoach, onHome, isPro, isOrg, onUpgrade }) {
  const [currentDay, setCurrentDay] = useState(0);
  const [completedDays, setCompletedDays] = useState([]);
  const [reflection, setReflection] = useState("");
  const [tipVisible, setTipVisible] = useState(false);
  const [tipTyping, setTipTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiTip, setAiTip] = useState("");
  const [view, setView] = useState("challenge");
  const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;
  const ch = CHALLENGES[currentDay];
  const isCompleted = completedDays.includes(currentDay);

  const completeDay = useCallback(async () => {
    if (!reflection.trim()) return;
    setLoading(true); setTipVisible(true); setTipTyping(true); setAiTip("");
    try {
      const tip = await callClaude(MAHORO_SYSTEM, `My name is ${user.name}, from ${user.country}. My main worry is: ${user.trigger}. Today is Day ${ch.day} of the Amahoro 21-day challenge. The theme was "${ch.title}". My reflection: "${reflection}". Please give me your coaching response. Use very simple English — short sentences, easy words. Be warm and specific to what I shared.`, API_KEY);
      setAiTip(tip);
    } catch { setAiTip(ch.tip); }
    setTipTyping(false); setLoading(false);
    if (!isCompleted) setCompletedDays(d => [...d, currentDay]);
  }, [reflection, user, ch, currentDay, isCompleted, API_KEY]);

  const waMessage = encodeU