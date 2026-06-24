import { useState, useEffect, useRef, useCallback } from "react";

// ─── DATA ────────────────────────────────────────────────────
const CHALLENGES = [
  {
    day: 1, theme: "Awareness", emoji: "🧠", duration: "5 min",
    title: "Name the beast.",
    context: "In Rwanda, Uganda, Kenya, and beyond — we grow up taught not to name our struggles. Anxiety shrinks when you can describe it precisely. This is your first act of courage.",
    task: 'Finish this sentence three times: "Right now I feel anxious about _____ because _____. My body feels _____ when this happens."',
    placeholder: "Right now I feel anxious about my exams because my family expects me to be the first graduate. My body feels tight in my chest when this happens...",
    tip: "Naming anxiety is not weakness — it's the first move. In many of our cultures, silence about struggle is mistaken for strength. But silence feeds anxiety; naming it starves it. You just did something most people never do. 🌿"
  },
  {
    day: 2, theme: "Breathing", emoji: "💨", duration: "3 min",
    title: "The 4-7-8 breath. Right now.",
    context: "When exam results are out, when the interview goes wrong, when Mum asks about rent — your body goes into panic mode. This breathing technique, done daily for 21 days, physically rewires your stress response.",
    task: "Do 3 rounds of 4-7-8 breathing right now. Breathe IN for 4 counts, HOLD for 7, breathe OUT for 8. Then describe how your body feels after.",
    placeholder: "Before breathing I felt very tense. After 3 rounds my shoulders dropped and I felt a little calmer...",
    tip: "That shift you felt? That's your nervous system switching from fight-or-flight to rest-and-digest. Your ancestors didn't have the science words, but they knew — slow breath, calm mind. This tool is free and invisible. Use it everywhere: church, taxi, exam hall. 💨"
  },
  {
    day: 3, theme: "Reframing", emoji: "🪞", duration: "5 min",
    title: "Your story vs. the story anxiety tells.",
    context: "Anxiety is a storyteller — and it always writes the worst version. 'I'll fail.' 'They think I'm stupid.' 'I'll never be enough.' Today you write back.",
    task: 'Pick one anxious thought you\'ve had this week. Write it down. Then write a more accurate, realistic version. Example — Anxious: "I will fail this exam." Realistic: "I haven\'t studied everything, but I\'ve prepared what I can. One exam doesn\'t end my life."',
    placeholder: "Anxious thought: I'll never find a job and I'll disappoint my whole family\nRealistic: The job market is hard but not impossible. Many people I know eventually found work. I just need to keep trying...",
    tip: "You just did cognitive behavioral therapy on yourself — the same technique that costs $150/hour at a Western clinic. The reframe doesn't need to be positive, just more accurate. Anxiety lies with confidence; truth is quieter and kinder. 🪞"
  },
  {
    day: 4, theme: "Body Scan", emoji: "🧘", duration: "5 min",
    title: "Where does your body hold it?",
    context: "Anxiety isn't just in your head — it lives in your body. Tight shoulders, clenched jaw, heavy chest, stomach knots. Most of us walk around not noticing until the body forces us to.",
    task: "Close your eyes for 2 minutes. Slowly scan from your head to your feet. Notice where tension lives without trying to fix it. Then write: which body part holds your anxiety, and what does it feel like?",
    placeholder: "I noticed my shoulders are almost at my ears. My stomach feels like it has rocks in it. I didn't realize I was holding my jaw so tight...",
    tip: "The body keeps the score. By noticing where tension lives, you create distance between you and it. You are not the tension — you're the one who notices the tension. That's the beginning of real freedom. 🧘"
  },
  {
    day: 5, theme: "Community", emoji: "🌍", duration: "5 min",
    title: "You are not the only one.",
    context: "Shame grows in silence. Today you share — not your deepest secret, just one thing you've been carrying quietly. In a community of African youth just like you, someone is carrying something very similar.",
    task: 'Share one honest sentence in your Amahoro cohort group: "One thing giving me anxiety lately is ___." Just one sentence. That\'s it. Then come back and write what it felt like to share.',
    placeholder: "I shared it. It felt scary but also relieving. Someone else replied and said they feel the same way about their parents' expectations...",
    tip: "Vulnerability is not weakness — in a community that responds with care, it is the fastest healer. Ubuntu: I am because we are. Your honesty just gave someone else permission to be honest too. 🌍"
  },
  {
    day: 6, theme: "Values", emoji: "⭐", duration: "5 min",
    title: "What actually matters to you?",
    context: "Much of our anxiety comes from chasing goals that aren't truly ours — our parents' dreams, society's expectations, comparison with others. Today you go back to your own core.",
    task: "List 5 things you genuinely value in life — not what you should value, but what actually matters to YOU. Then circle the one that gets the least time in your current life.",
    placeholder: "1. My younger siblings 2. Finishing my degree 3. Honesty 4. Making music 5. Being healthy. I circled making music — I haven't touched my guitar in 4 months...",
    tip: "Anxiety often signals a gap between how you're living and what you actually value. This isn't guilt — it's data. That gap is information. 🌿"
  },
  {
    day: 7, theme: "Gratitude", emoji: "🙏", duration: "3 min",
    title: "What you're ignoring that's already good.",
    context: "Your brain is wired to focus on threats — it kept your ancestors alive. But in 2024, this same wiring makes anxiety worse. Gratitude literally rewires the neural pathways. Not positive thinking — brain chemistry.",
    task: "Name 3 specific things you're grateful for today that you usually ignore or take for granted. Not general things — be precise. Not 'my health' but 'the fact that I woke up without pain today.'",
    placeholder: "1. My roommate left me food without asking 2. The matatu arrived before it rained 3. My phone charger still works even though it's 3 years old...",
    tip: "The science is clear: specific gratitude (concrete details) activates your brain's reward system more than general gratitude. You just chose to notice goodness. Do this every day and in 2 weeks, your brain's baseline mood will shift. 🙏"
  },
  {
    day: 8, theme: "Boundaries", emoji: "🛡️", duration: "5 min",
    title: "Who or what drains you?",
    context: "In African family structures, saying no feels impossible — especially as a firstborn, a 'bright child,' or someone others depend on. But boundaries aren't walls. They're the thing that keeps you alive long enough to actually help people.",
    task: "Identify one relationship, habit, or commitment that consistently drains your energy. Write it down. Then write one tiny, specific boundary you could set this week — not a dramatic confrontation, just a small protection.",
    placeholder: "My cousin calls me every evening with his problems but never asks about mine. One small boundary: I'll stop picking up after 9pm on weekdays...",
    tip: "You cannot pour from an empty cup. Boundaries protect your capacity to love, serve, and show up. They are an act of sustainability, not selfishness. 🛡️"
  },
  {
    day: 9, theme: "Sleep", emoji: "🌙", duration: "3 min",
    title: "Sleep is not laziness.",
    context: "Many African youth wear exhaustion as a badge of honour. 'I only slept 4 hours.' 'I stayed up all night studying.' But sleep deprivation worsens anxiety by 30–40%. You are not more productive without sleep — you are just more anxious.",
    task: "Write your current sleep reality: what time you actually sleep, wake, and how rested you feel. Then write one change — just one — you could make this week to protect one extra hour of sleep.",
    placeholder: "I sleep at 1am, wake at 5:30am for class. I feel exhausted by 10am. One change: I'll stop looking at my phone after 11pm this week...",
    tip: "Sleep is when your brain processes emotion, consolidates learning, and repairs itself. Cutting sleep to study more is literally making your brain less effective. One extra hour matters more than you think. 🌙"
  },
  {
    day: 10, theme: "Resilience", emoji: "💪", duration: "5 min",
    title: "Evidence of your strength.",
    context: "You've survived 100% of your worst days so far. Today you build your 'resilience bank' — a personal record of hard things you've already overcome. The goal? Next time anxiety says 'you can't handle this,' you'll have proof that says otherwise.",
    task: "List 5 hard things you've already survived or overcome in your life. Big or small — both count. Then write: what does that list tell you about the person you actually are?",
    placeholder: "1. Passed KCSE when I thought I'd fail 2. Moved cities alone at 19 3. Helped my family through my dad's illness 4. Learned to code by myself 5. Survived the year I almost dropped out. This tells me: I've done hard things before...",
    tip: "Read that list back slowly. Every single item is proof of capacity you haven't given yourself credit for. This is post-traumatic growth — not just surviving, but evidence that you adapt. Save this list. Come back to it on your hardest future days. 💪"
  },
  {
    day: 11, theme: "Comparison", emoji: "📵", duration: "5 min",
    title: "You're comparing your chapter 1 to their chapter 20.",
    context: "Lagos influencers. Nairobi entrepreneurs. Kigali success stories. Social media shows you everyone's highlight reel and none of their behind-the-scenes. Comparison anxiety is the fastest-growing mental health issue among African youth.",
    task: "Identify one person you've been comparing yourself to (you don't have to name them). Write what you see from the outside. Then honestly write 3 things you DON'T know about their real struggle.",
    placeholder: "I compare myself to my classmate who always looks like she has it together. From outside: job, nice clothes, confident. But I don't know: if she has debt, if her relationship is okay, if she's actually happy at home...",
    tip: "Every person performing success is working hard not to show you the cost. You are not behind — you are on your own timeline, writing your own story. Nobody else's chapter is yours to live. 📵"
  },
  {
    day: 12, theme: "Movement", emoji: "🚶", duration: "3 min",
    title: "10 minutes of walking is not a joke.",
    context: "Exercise is the most underused anxiety medication. A 10-minute walk releases more anxiety-reducing chemicals than some prescription medications — and it's free. Not a gym. Not running. Just moving.",
    task: "Take a 10-minute walk today — outside if possible. No phone, no music, just walking. Notice what you see, hear, smell. Then come back and write 3 things you noticed that you'd normally miss.",
    placeholder: "I noticed a mango tree I've walked past 100 times but never really seen. I heard kids playing two streets over. The air smelt different after yesterday's rain...",
    tip: "That walk changed your brain chemistry. Moving your body moves your mental state — it's not a metaphor, it's biology. 10 minutes a day, consistently, is enough to measurably reduce anxiety in 3 weeks. 🚶"
  },
  {
    day: 13, theme: "Fear Audit", emoji: "🔦", duration: "5 min",
    title: "What are you actually afraid of?",
    context: "Most anxiety is fear in disguise. Fear of failure. Fear of disappointing people. Fear of being seen as incompetent. When you name the actual fear behind the anxiety, it becomes smaller and more workable.",
    task: "Ask yourself: 'What am I most afraid of right now?' Write it down without softening it. Then ask: 'And if that happened, what would I do?' Write your honest answer.",
    placeholder: "I'm afraid I'll fail my final exams and lose my scholarship. If that happened: I'd be devastated. But I'd probably find another way — maybe retake, maybe find work and study part-time. It wouldn't be the end...",
    tip: "Anxiety thrives in vagueness. When you force yourself to answer 'and then what?' enough times, you usually reach: 'I would survive.' That's the truth anxiety hides from you. 🔦"
  },
  {
    day: 14, theme: "Self-Compassion", emoji: "🤗", duration: "5 min",
    title: "Talk to yourself like you'd talk to a friend.",
    context: "Most of us are our own harshest critics. You would never speak to your best friend the way you speak to yourself in your own head. Today you correct that.",
    task: "Write down the harshest thing you've said to yourself this week (internally). Then rewrite it as if you were saying it to your best friend going through the same situation.",
    placeholder: "What I said to myself: 'You're so stupid, why can't you just focus?' To my friend: 'You're dealing with so much pressure right now. It makes sense that concentration is hard. You're not stupid — you're overwhelmed.'",
    tip: "Self-compassion is not self-pity — it is the recognition that struggling is a shared human experience. Research shows self-compassion increases motivation and resilience more than self-criticism ever does. Treat yourself like someone worth caring for. 🤗"
  },
  {
    day: 15, theme: "Progress", emoji: "📊", duration: "5 min",
    title: "You are not who you were on Day 1.",
    context: "Halfway through. This is where many people quit — not because they've failed, but because they can't see the change happening inside them. Today you measure it.",
    task: "Go back to your Day 1 reflection. Read what you wrote. Then write: what is different about how you're thinking or feeling now compared to when you started?",
    placeholder: "On Day 1 I wrote that my body felt tight in my chest constantly. Now I notice it's only tight in specific moments. I also breathe more before reacting. I didn't notice this until I re-read Day 1...",
    tip: "Change is happening. It's quiet, and it's real. You are not the same person who opened this challenge two weeks ago. Keep going — the last 6 days are where the deepest work happens. 📊"
  },
  {
    day: 16, theme: "Environment", emoji: "🏠", duration: "5 min",
    title: "Your space affects your mind.",
    context: "A cluttered, chaotic space amplifies anxiety. A calm, organised space signals safety to your nervous system. You may not control many things in your life, but you can control your immediate environment.",
    task: "Spend 10 minutes cleaning or organising one small space — your desk, your bag, your phone home screen. Then write: how did the space look before, and how do you feel after?",
    placeholder: "My desk had 3 weeks of notes, empty bottles and charging cables everywhere. I spent 15 minutes sorting it. Now I can see the surface. Something about this made me feel slightly more in control...",
    tip: "Your environment is a mirror. When you create order in a small space, your brain interprets it as evidence that you have agency over your life. Small acts of order are anxiety's kryptonite. 🏠"
  },
  {
    day: 17, theme: "Connection", emoji: "❤️", duration: "5 min",
    title: "Who pours into you?",
    context: "We've talked about boundaries with draining people. Today we flip it — who energises you? Who makes you feel like yourself? In times of anxiety, we often isolate from exactly the people we need.",
    task: "Name one person who genuinely energises you and that you haven't reached out to in too long. Send them a simple message today — not to vent, just to connect. Then write why you chose them.",
    placeholder: "I texted my friend Diane who I haven't called since February. Just said 'thinking of you, hope you're well.' She called me back immediately and we talked for an hour. I forgot how much better she makes me feel...",
    tip: "Human connection is the most powerful anxiety buffer we have. Not digital connection — real, reciprocal contact. You don't have to be struggling to reach out. You can reach out because you care. ❤️"
  },
  {
    day: 18, theme: "Purpose", emoji: "🧭", duration: "5 min",
    title: "Why does any of this matter?",
    context: "Anxiety often spikes when we feel disconnected from purpose. When you know WHY you're doing something, the HOW becomes bearable. Today you reconnect with your why.",
    task: "Answer honestly: Why are you in school, or working, or doing what you're doing? Not the expected answer — the real one. Then write: how does that 'why' connect to something bigger than just you?",
    placeholder: "I'm studying because I want to be able to take care of my mum the way she's taken care of me. If I succeed, she doesn't have to work herself into the ground anymore. That's bigger than my anxiety about exams...",
    tip: "Purpose is a cognitive anchor. When anxiety pulls you into chaos, your 'why' is a rope back to solid ground. It doesn't have to be grand — the most powerful purposes are personal, specific, and deeply felt. 🧭"
  },
  {
    day: 19, theme: "Acceptance", emoji: "🌊", duration: "5 min",
    title: "Some things you cannot control.",
    context: "Anxiety spikes hardest around things we cannot control — exam marking, other people's opinions, the economy, family health. Fighting the uncontrollable is exhausting. Acceptance is not giving up. It's redirecting your energy.",
    task: "Write one thing causing you anxiety that is genuinely outside your control. Then write honestly: what CAN you control about this situation, even if it's small?",
    placeholder: "I can't control whether I get the scholarship. I can control: how prepared I am for the interview, how I present myself, and making sure I apply to 3 other options as backup...",
    tip: "The Serenity Prayer isn't religious advice — it's neuroscience. Focusing on what you can control keeps your prefrontal cortex (rational brain) in charge. Focusing on what you can't control activates your amygdala (panic brain). Choose your focus. 🌊"
  },
  {
    day: 20, theme: "Integration", emoji: "🔗", duration: "5 min",
    title: "Build your personal toolkit.",
    context: "You've tried 19 different tools over the past three weeks. Some resonated deeply. Some didn't. Today you build YOUR personal toolkit — the specific practices that actually worked for your life.",
    task: "Look back at your journey. Name your top 3 tools or insights from this challenge. Write how and when you'll use each one going forward — specifically, not generally.",
    placeholder: "1. 4-7-8 breathing — I'll do this every morning before I open my phone. 2. Thought reframing — I'll write down anxious thoughts in my notes app and write the realistic version next to it. 3. The resilience list — I saved it and I'll re-read it whenever I feel like giving up...",
    tip: "A toolkit only works if it's used. Specificity is the difference between intention and action. You've just designed your own personalised mental health protocol — one that fits your life, your culture, your reality. That is extraordinary. 🔗"
  },
  {
    day: 21, theme: "Completion", emoji: "🏆", duration: "Final day",
    title: "You are not the same person you were on Day 1.",
    context: "You named your anxiety. You breathed through it. You reframed your thoughts. You shared with community. You built resilience. You showed up — imperfectly, humanly, consistently. That is everything.",
    task: "Write a letter from the you of today to the you who started Day 1. What do you want them to know? What changed? What will you carry forward?",
    placeholder: "Dear Day 1 me,\n\nI want you to know that the anxiety you're feeling right now is real — but you are bigger than it. Over the next 21 days you're going to learn things about yourself that no school ever taught you...",
    tip: "You finished. Not perfectly — but you showed up. In a world that didn't teach us how to handle our inner world, you took 21 days to begin learning. This is not the end of the journey — it's the beginning of a life where you face yourself with a little more courage. Amahoro. 🏆"
  }
];

const COACH_PROMPTS = [
  "What's weighing on you today? You can type anything.",
  "Tell me what's going on. I'm listening.",
  "What brought you here today?",
  "What's the one thing on your mind right now?",
];

const COLORS = {
  night: "#0D1117", deep: "#141B24", card: "#1C2733", border: "#263040",
  green: "#25D366", amber: "#F5A623", red: "#E8544A", sky: "#4FC3F7",
  text: "#E8EDF2", muted: "#7A8FA6", faint: "#3A4A5C",
};

// ─── COMPONENTS ──────────────────────────────────────────────

function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center", padding: "4px 0" }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: "50%", background: COLORS.green,
          animation: `typing 1.2s infinite ${i * 0.2}s`,
        }} />
      ))}
    </div>
  );
}

function Badge({ color = "green", children }) {
  const map = { green: [COLORS.green, "rgba(37,211,102,0.15)", "rgba(37,211,102,0.25)"], amber: [COLORS.amber, "rgba(245,166,35,0.15)", "rgba(245,166,35,0.25)"], sky: [COLORS.sky, "rgba(79,195,247,0.12)", "rgba(79,195,247,0.2)"], red: [COLORS.red, "rgba(232,84,74,0.15)", "rgba(232,84,74,0.25)"] };
  const [c, bg, b] = map[color] || map.green;
  return <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "Sora,sans-serif", letterSpacing: "0.06em", textTransform: "uppercase", padding: "3px 10px", borderRadius: 100, background: bg, border: `1px solid ${b}`, color: c }}>{children}</span>;
}

function ProgressBar({ value, max = 21 }) {
  return (
    <div style={{ height: 4, background: COLORS.border, borderRadius: 2, marginTop: 12 }}>
      <div style={{ height: "100%", width: `${(value / max) * 100}%`, background: COLORS.green, borderRadius: 2, transition: "width 0.6s ease" }} />
    </div>
  );
}

// ─── SCREENS ─────────────────────────────────────────────────

function LandingScreen({ onStart, onCoach }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);

  return (
    <div style={{ minHeight: "100vh", background: COLORS.night, color: COLORS.text, fontFamily: "DM Sans,sans-serif", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { overflow-x: hidden; }
        @keyframes typing { 0%,60%,100%{opacity:0.3;transform:translateY(0)} 30%{opacity:1;transform:translateY(-4px)} }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.7)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes glow { 0%,100%{box-shadow:0 0 20px rgba(37,211,102,0.2)} 50%{box-shadow:0 0 40px rgba(37,211,102,0.5)} }
        .hero-in { animation: fadeUp 0.7s ease forwards; }
        .hero-in-2 { animation: fadeUp 0.7s 0.15s ease both; }
        .hero-in-3 { animation: fadeUp 0.7s 0.3s ease both; }
        .btn-pulse { animation: glow 2.5s ease-in-out infinite; }
        .float-wa { animation: float 3s ease-in-out infinite; }
        .card-hover:hover { transform: translateY(-4px) !important; border-color: #3A4A5C !important; }
        .link-hover:hover { color: #25D366 !important; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #0D1117; } ::-webkit-scrollbar-thumb { background: #263040; border-radius: 3px; }
      `}</style>

      {/* Nav */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(13,17,23,0.92)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 5%", height: 64 }}>
        <div style={{ fontFamily: "Sora,sans-serif", fontWeight: 800, fontSize: "1.15rem", color: COLORS.green }}>Amahoro<span style={{ color: COLORS.text }}> Challenge</span></div>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={onCoach} style={{ background: "transparent", border: `1px solid ${COLORS.border}`, color: COLORS.muted, borderRadius: 6, padding: "7px 16px", cursor: "pointer", fontSize: 13, fontFamily: "Sora,sans-serif", fontWeight: 600 }}>Talk to Amara</button>
          <button onClick={onStart} style={{ background: COLORS.green, border: "none", color: "#000", borderRadius: 6, padding: "7px 18px", cursor: "pointer", fontSize: 13, fontFamily: "Sora,sans-serif", fontWeight: 700 }}>Start Free →</button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "7rem 5% 4rem", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(37,211,102,0.07) 0%, transparent 70%), radial-gradient(ellipse 40% 40% at 85% 70%, rgba(79,195,247,0.04) 0%, transparent 60%)", pointerEvents: "none" }} />

        <div className="hero-in" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(37,211,102,0.1)", border: "1px solid rgba(37,211,102,0.25)", color: COLORS.green, fontSize: 11, fontWeight: 700, fontFamily: "Sora,sans-serif", letterSpacing: "0.08em", textTransform: "uppercase", padding: "5px 14px", borderRadius: 100, marginBottom: 24 }}>
          <span style={{ width: 6, height: 6, background: COLORS.green, borderRadius: "50%", animation: "pulse 2s infinite" }} />
          12,400+ African youth enrolled · Free to start
        </div>

        <h1 className="hero-in-2" style={{ fontFamily: "Sora,sans-serif", fontSize: "clamp(2.2rem,6vw,4.2rem)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.03em", marginBottom: 20, maxWidth: 820 }}>
          Tame your anxiety.<br />
          <span style={{ color: COLORS.green }}>21 days.</span> Real results.<br />
          <span style={{ color: COLORS.amber }}>Made for Africa.</span>
        </h1>

        <p className="hero-in-3" style={{ fontSize: "1.1rem", color: COLORS.muted, maxWidth: 560, marginBottom: 36, fontWeight: 300, lineHeight: 1.75 }}>
          From exam pressure in Kigali to job stress in Lagos — anxiety is real, but so is peace. A daily micro-challenge, an AI coach, and a community that gets your world.
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginBottom: 48 }}>
          <button onClick={onStart} className="btn-pulse" style={{ display: "flex", alignItems: "center", gap: 8, background: COLORS.green, border: "none", color: "#000", fontFamily: "Sora,sans-serif", fontWeight: 700, fontSize: "1rem", padding: "14px 32px", borderRadius: 10, cursor: "pointer", transition: "transform 0.2s" }}
            onMouseOver={e => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseOut={e => e.currentTarget.style.transform = "translateY(0)"}>
            🌿 Start Free Challenge
          </button>
          <button onClick={onCoach} style={{ display: "flex", alignItems: "center", gap: 8, background: "transparent", border: `1px solid ${COLORS.border}`, color: COLORS.text, fontFamily: "Sora,sans-serif", fontWeight: 600, fontSize: "1rem", padding: "14px 28px", borderRadius: 10, cursor: "pointer", transition: "border-color 0.2s" }}>
            💬 Talk to AI Coach
          </button>
        </div>

        <div style={{ display: "flex", gap: 48, justifyContent: "center", flexWrap: "wrap", borderTop: `1px solid ${COLORS.border}`, paddingTop: 28 }}>
          {[["21", "Day Challenge"], ["78%", "Less anxiety"], ["5 min", "Per day"], ["Free", "To start"]].map(([n, l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "Sora,sans-serif", fontSize: "1.8rem", fontWeight: 800, color: "#fff" }}>{n}</div>
              <div style={{ fontSize: 11, color: COLORS.muted, textTransform: "uppercase", letterSpacing: "0.07em" }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Problem Section */}
      <div style={{ padding: "5rem 5%", background: COLORS.deep }}>
        <div style={{ fontSize: 11, color: COLORS.green, fontFamily: "Sora,sans-serif", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Why This Matters</div>
        <h2 style={{ fontFamily: "Sora,sans-serif", fontSize: "clamp(1.8rem,4vw,2.6rem)", fontWeight: 800, letterSpacing: "-0.025em", marginBottom: 12, maxWidth: 640, lineHeight: 1.15 }}>Anxiety in Africa is real — and mostly invisible.</h2>
        <p style={{ color: COLORS.muted, fontSize: "1rem", maxWidth: 580, marginBottom: 40, lineHeight: 1.7 }}>"Pray about it." "You're thinking too much." Meanwhile, the pressure is crushing youth silently across the continent.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 14 }}>
          {[
            { icon: "📚", title: "Academic Pressure", desc: "National exams, family expectations of being the 'first graduate,' scholarship anxiety — the weight is enormous and discussed nowhere.", tag: "Very Common", tc: "red" },
            { icon: "💼", title: "Job Market Stress", desc: "Unemployment above 30% in many African countries. Every rejection feels existential when your family depends on you.", tag: "Widespread", tc: "amber" },
            { icon: "🏠", title: "Family Obligations", desc: "Being firstborn means carrying siblings' fees, parents' bills, relatives' expectations — before you're 25.", tag: "Very Common", tc: "red" },
            { icon: "📱", title: "Social Media Comparison", desc: "Lagos influencers, Nairobi entrepreneurs — constantly comparing your chapter 1 to someone else's chapter 20.", tag: "Growing Fast", tc: "amber" },
            { icon: "🏥", title: "No Access to Therapy", desc: "One therapy session costs more than a week's food budget for most youth. Professional help is a luxury, not a right.", tag: "Critical Gap", tc: "red" },
            { icon: "🗣️", title: "Cultural Silence", desc: "'Strong people don't cry.' There's no language for anxiety that doesn't sound dramatic or ungrateful.", tag: "Being Broken", tc: "sky" },
          ].map(c => (
            <div key={c.title} className="card-hover" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "20px 20px 18px", transition: "transform 0.25s, border-color 0.25s" }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{c.icon}</div>
              <h4 style={{ fontFamily: "Sora,sans-serif", fontWeight: 700, fontSize: "0.95rem", marginBottom: 6 }}>{c.title}</h4>
              <p style={{ fontSize: "0.85rem", color: COLORS.muted, lineHeight: 1.65, marginBottom: 10 }}>{c.desc}</p>
              <Badge color={c.tc}>{c.tag}</Badge>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div style={{ padding: "5rem 5%" }}>
        <div style={{ fontSize: 11, color: COLORS.green, fontFamily: "Sora,sans-serif", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>The Amahoro Method</div>
        <h2 style={{ fontFamily: "Sora,sans-serif", fontSize: "clamp(1.8rem,4vw,2.6rem)", fontWeight: 800, letterSpacing: "-0.025em", marginBottom: 12, lineHeight: 1.15 }}>A challenge built around your reality.</h2>
        <p style={{ color: COLORS.muted, fontSize: "1rem", maxWidth: 560, marginBottom: 40, lineHeight: 1.7 }}>No jargon. No Western assumptions. Just practical tools that fit your life — even without reliable internet or money.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14 }}>
          {[
            { icon: "🌅", time: "Morning · 2 min", title: "Daily Challenge Drop", desc: "Each morning: one micro-challenge tied to a real African youth scenario. Relatable, specific, actionable." },
            { icon: "✍️", time: "Anytime · 3 min", title: "Reflection Prompt", desc: "Answer one focused question about your day, your fear, or your small win. Short. Honest. Yours." },
            { icon: "🤖", time: "Instant", title: "AI Coach Feedback", desc: "Amara replies with culturally-grounded encouragement and a science-backed tip — in seconds." },
            { icon: "👥", time: "Daily", title: "Peer Accountability", desc: "Share wins (or struggles) with your cohort on WhatsApp. Support from others living the same realities." },
            { icon: "🏆", time: "Day 21", title: "Certificate + Toolkit", desc: "See your anxiety score improve. Get a shareable certificate. Unlock your personal toolkit for life." },
          ].map(s => (
            <div key={s.title} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "20px 18px" }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{s.icon}</div>
              <div style={{ fontSize: 10, color: COLORS.green, fontFamily: "Sora,sans-serif", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 6 }}>{s.time}</div>
              <h4 style={{ fontFamily: "Sora,sans-serif", fontWeight: 700, fontSize: "0.95rem", marginBottom: 6 }}>{s.title}</h4>
              <p style={{ fontSize: "0.83rem", color: COLORS.muted, lineHeight: 1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* WhatsApp Section */}
      <div style={{ padding: "5rem 5%", background: COLORS.deep }}>
        <div style={{ fontSize: 11, color: COLORS.green, fontFamily: "Sora,sans-serif", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>WhatsApp Integration</div>
        <h2 style={{ fontFamily: "Sora,sans-serif", fontSize: "clamp(1.8rem,4vw,2.6rem)", fontWeight: 800, letterSpacing: "-0.025em", marginBottom: 12, lineHeight: 1.15 }}>No app download. Just WhatsApp.</h2>
        <p style={{ color: COLORS.muted, fontSize: "1rem", maxWidth: 560, marginBottom: 40, lineHeight: 1.7 }}>WhatsApp is the default communication layer across Africa. We meet you where you already are.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 14 }}>
          {[
            { icon: "🌅", title: "Daily 7am Challenge", desc: "Receive your daily challenge as a WhatsApp message — no login, no app, no wasted data." },
            { icon: "🤖", title: "AI Coach Replies", desc: "Reply with your reflection. Amara responds within seconds with personalised, culturally-aware guidance." },
            { icon: "👥", title: "Peer Cohort Groups", desc: "Join 20 youth from your country. Real accountability, real community, zero judgment." },
            { icon: "📊", title: "Weekly Progress", desc: "Every Sunday: your anxiety score improvement, completed challenges, and a personal insight from Amara." },
          ].map(f => (
            <div key={f.title} className="card-hover" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "20px", transition: "transform 0.25s, border-color 0.25s" }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{f.icon}</div>
              <h4 style={{ fontFamily: "Sora,sans-serif", fontWeight: 700, fontSize: "0.95rem", marginBottom: 6 }}>{f.title}</h4>
              <p style={{ fontSize: "0.85rem", color: COLORS.muted, lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 32, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a href="https://wa.me/254113445647?text=JOIN%20Amahoro%20Challenge" target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: COLORS.green, border: "none", color: "#000", fontFamily: "Sora,sans-serif", fontWeight: 700, fontSize: "0.95rem", padding: "12px 24px", borderRadius: 8, textDecoration: "none" }}>
            💬 Join via WhatsApp
          </a>
          <button onClick={onStart} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "transparent", border: `1px solid ${COLORS.border}`, color: COLORS.text, fontFamily: "Sora,sans-serif", fontWeight: 600, fontSize: "0.95rem", padding: "12px 24px", borderRadius: 8, cursor: "pointer" }}>
            Start on Web →
          </button>
        </div>
      </div>

      {/* Pricing */}
      <div style={{ padding: "5rem 5%" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 11, color: COLORS.green, fontFamily: "Sora,sans-serif", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Pricing</div>
          <h2 style={{ fontFamily: "Sora,sans-serif", fontSize: "clamp(1.8rem,4vw,2.6rem)", fontWeight: 800, letterSpacing: "-0.025em", marginBottom: 12 }}>Accessible by design.</h2>
          <p style={{ color: COLORS.muted, fontSize: "1rem", maxWidth: 500, margin: "0 auto", lineHeight: 1.7 }}>Priced for real African youth budgets — not Silicon Valley assumptions.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 16, maxWidth: 860, margin: "0 auto" }}>
          {[
            { name: "Free", price: "$0", sub: "/ forever", desc: "The full 21-day challenge. No card needed.", featured: false, features: ["21-day core challenge", "Daily WhatsApp messages", "AI coach (5 replies/day)", "Peer cohort group access", "Completion certificate"], missing: ["Advanced workbooks", "Unlimited AI coach"], btnLabel: "Start Free Challenge", btnStyle: "outline" },
            { name: "Amahoro Pro", price: "$4", sub: "/ month", desc: "Full tools, unlimited AI, and exclusive resources.", featured: true, features: ["Everything in Free", "Unlimited AI coach", "Full workbook library (PDF)", "Monthly anxiety tracking", "Offline audio meditations", "Repeat challenge themes"], missing: [], btnLabel: "Get Amahoro Pro", btnStyle: "green" },
            { name: "Organizations", price: "$29", sub: "/ month", desc: "For universities, NGOs, and youth programs.", featured: false, features: ["50 participant accounts", "Admin dashboard", "Cohort analytics", "Custom branding", "Monthly group workshop", "2× human coach sessions"], missing: [], btnLabel: "Get for My Organization", btnStyle: "sky" },
          ].map(p => (
            <div key={p.name} style={{ background: COLORS.card, border: `2px solid ${p.featured ? COLORS.green : COLORS.border}`, borderRadius: 16, padding: "28px 24px", position: "relative", boxShadow: p.featured ? `0 0 0 1px rgba(37,211,102,0.2), 0 20px 40px rgba(37,211,102,0.07)` : "none" }}>
              {p.featured && <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: COLORS.green, color: "#000", fontFamily: "Sora,sans-serif", fontWeight: 800, fontSize: 11, letterSpacing: "0.07em", textTransform: "uppercase", padding: "4px 14px", borderRadius: 100 }}>Most Popular</div>}
              <div style={{ fontSize: 11, color: COLORS.muted, fontFamily: "Sora,sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>{p.name}</div>
              <div style={{ fontFamily: "Sora,sans-serif", fontWeight: 800, fontSize: "2.2rem", color: "#fff", marginBottom: 4 }}>{p.price} <span style={{ fontSize: "0.95rem", color: COLORS.muted, fontWeight: 400 }}>{p.sub}</span></div>
              <div style={{ fontSize: "0.85rem", color: COLORS.muted, marginBottom: 20, lineHeight: 1.5 }}>{p.desc}</div>
              <ul style={{ listStyle: "none", marginBottom: 24 }}>
                {p.features.map(f => <li key={f} style={{ fontSize: "0.88rem", padding: "6px 0", borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", gap: 8 }}><span style={{ color: COLORS.green }}>✓</span>{f}</li>)}
                {p.missing.map(f => <li key={f} style={{ fontSize: "0.88rem", padding: "6px 0", borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", gap: 8, opacity: 0.4 }}><span>–</span>{f}</li>)}
              </ul>
              <button onClick={onStart} style={{ display: "block", width: "100%", padding: "12px", borderRadius: 8, fontFamily: "Sora,sans-serif", fontWeight: 700, fontSize: "0.92rem", cursor: "pointer", border: "none", background: p.btnStyle === "green" ? COLORS.green : p.btnStyle === "sky" ? COLORS.sky : COLORS.deep, color: p.btnStyle === "outline" ? COLORS.text : "#000", border: p.btnStyle === "outline" ? `1px solid ${COLORS.border}` : "none" }}>
                {p.btnLabel}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div style={{ padding: "5rem 5%", background: COLORS.deep }}>
        <div style={{ fontSize: 11, color: COLORS.green, fontFamily: "Sora,sans-serif", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Community Voices</div>
        <h2 style={{ fontFamily: "Sora,sans-serif", fontSize: "clamp(1.8rem,4vw,2.6rem)", fontWeight: 800, letterSpacing: "-0.025em", marginBottom: 40, lineHeight: 1.15 }}>Real stories. Real change.</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(270px,1fr))", gap: 14 }}>
          {[
            { flag: "🇷🇼", name: "Clarisse M.", loc: "Kigali, Rwanda · University student", quote: "I've been carrying exam anxiety since S3. By Day 14, I started sleeping again. Amara said something on Day 3 that I've kept as my phone wallpaper since." },
            { flag: "🇳🇬", name: "Emeka O.", loc: "Lagos, Nigeria · Job seeker", quote: "As a firstborn son, the pressure crushed me silently for years. No one I know talks about mental health. This challenge gave me language I didn't have." },
            { flag: "🇰🇪", name: "Aisha W.", loc: "Nairobi, Kenya · Form 4 student", quote: "I shared it with 12 girls in my class after finishing. Three texted me crying saying they needed this. We started a group to hold each other accountable." },
          ].map(t => (
            <div key={t.name} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "22px 20px" }}>
              <div style={{ color: COLORS.amber, fontSize: "0.85rem", letterSpacing: 2, marginBottom: 12 }}>★★★★★</div>
              <p style={{ fontSize: "0.9rem", color: COLORS.text, lineHeight: 1.7, marginBottom: 16, fontStyle: "italic" }}>"{t.quote}"</p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(37,211,102,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem" }}>{t.flag}</div>
                <div>
                  <div style={{ fontFamily: "Sora,sans-serif", fontWeight: 700, fontSize: "0.88rem" }}>{t.name}</div>
                  <div style={{ fontSize: "0.75rem", color: COLORS.muted }}>{t.loc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: "5rem 5%", textAlign: "center" }}>
        <h2 style={{ fontFamily: "Sora,sans-serif", fontSize: "clamp(2rem,5vw,3rem)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 16 }}>Your peace starts with<br />one decision.</h2>
        <p style={{ color: COLORS.muted, fontSize: "1rem", maxWidth: 420, margin: "0 auto 32px", lineHeight: 1.7 }}>21 days. 5 minutes a day. An AI coach in your corner. A community that gets it. Free to start.</p>
        <button onClick={onStart} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: COLORS.green, border: "none", color: "#000", fontFamily: "Sora,sans-serif", fontWeight: 700, fontSize: "1.05rem", padding: "16px 40px", borderRadius: 10, cursor: "pointer" }}>
          🌿 Begin the Amahoro Challenge
        </button>
      </div>

      {/* Footer */}
      <div style={{ background: COLORS.deep, borderTop: `1px solid ${COLORS.border}`, padding: "2.5rem 5%", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ fontFamily: "Sora,sans-serif", fontWeight: 800, fontSize: "1.1rem", color: COLORS.green, marginBottom: 6 }}>Amahoro Challenge</div>
          <div style={{ fontSize: "0.82rem", color: COLORS.muted }}>Peace in 21 days. Built for African youth. 🇷🇼</div>
        </div>
        <div style={{ fontSize: "0.8rem", color: COLORS.muted }}>© 2025 Amahoro · <a href="mailto:hello@amahoro.app" style={{ color: COLORS.green, textDecoration: "none" }}>hello@amahoro.app</a></div>
      </div>

      {/* WhatsApp Float */}
      <a href="https://wa.me/254113445647?text=JOIN" target="_blank" rel="noreferrer" className="float-wa" style={{ position: "fixed", bottom: 24, right: 24, zIndex: 99, background: COLORS.green, color: "#000", width: 56, height: 56, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", textDecoration: "none", boxShadow: "0 8px 24px rgba(37,211,102,0.4)" }}>
        💬
      </a>
    </div>
  );
}

function OnboardingScreen({ onComplete }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [trigger, setTrigger] = useState("");
  const [goal, setGoal] = useState("");

  const countries = ["Rwanda", "Kenya", "Nigeria", "Uganda", "Tanzania", "Ghana", "Ethiopia", "South Africa", "Cameroon", "Côte d'Ivoire", "Other"];
  const triggers = ["Exam / academic pressure", "Job search & unemployment", "Family obligations & expectations", "Social media comparison", "Financial stress", "Relationship issues", "General overwhelm", "Other"];
  const goals = ["Sleep better and feel calmer", "Perform better at school/work", "Stop overthinking everything", "Build my confidence", "Learn tools to manage anxiety long-term"];

  const steps = [
    {
      title: "Welcome to Amahoro.", sub: "Let's personalise your challenge. This takes 60 seconds.",
      content: (
        <div>
          <label style={{ fontSize: "0.82rem", fontFamily: "Sora,sans-serif", fontWeight: 600, color: COLORS.muted, letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>Your first name</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Amara, Kofi, Thandiwe..." style={{ width: "100%", background: COLORS.deep, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "12px 14px", color: COLORS.text, fontSize: "1rem", fontFamily: "DM Sans,sans-serif", outline: "none" }}
            onFocus={e => e.target.style.borderColor = COLORS.green}
            onBlur={e => e.target.style.borderColor = COLORS.border} />
        </div>
      ),
      canNext: name.trim().length > 0
    },
    {
      title: `Good to meet you, ${name || "warrior"}.`, sub: "Where are you in Africa?",
      content: (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 8 }}>
          {countries.map(c => (
            <button key={c} onClick={() => setCountry(c)} style={{ padding: "10px 14px", borderRadius: 8, border: `1px solid ${country === c ? COLORS.green : COLORS.border}`, background: country === c ? "rgba(37,211,102,0.1)" : COLORS.deep, color: country === c ? COLORS.green : COLORS.text, fontFamily: "Sora,sans-serif", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", transition: "all 0.15s" }}>
              {c}
            </button>
          ))}
        </div>
      ),
      canNext: country !== ""
    },
    {
      title: "What's your biggest anxiety trigger?", sub: "Be honest. This shapes your challenge.",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {triggers.map(t => (
            <button key={t} onClick={() => setTrigger(t)} style={{ padding: "12px 16px", borderRadius: 8, border: `1px solid ${trigger === t ? COLORS.green : COLORS.border}`, background: trigger === t ? "rgba(37,211,102,0.08)" : COLORS.deep, color: trigger === t ? COLORS.green : COLORS.text, fontFamily: "DM Sans,sans-serif", fontSize: "0.92rem", cursor: "pointer", textAlign: "left", transition: "all 0.15s", display: "flex", alignItems: "center", gap: 10 }}>
              {trigger === t ? "✓" : "○"} {t}
            </button>
          ))}
        </div>
      ),
      canNext: trigger !== ""
    },
    {
      title: "One last thing.", sub: "What's your main goal from this challenge?",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {goals.map(g => (
            <button key={g} onClick={() => setGoal(g)} style={{ padding: "12px 16px", borderRadius: 8, border: `1px solid ${goal === g ? COLORS.green : COLORS.border}`, background: goal === g ? "rgba(37,211,102,0.08)" : COLORS.deep, color: goal === g ? COLORS.green : COLORS.text, fontFamily: "DM Sans,sans-serif", fontSize: "0.92rem", cursor: "pointer", textAlign: "left", transition: "all 0.15s", display: "flex", alignItems: "center", gap: 10 }}>
              {goal === g ? "✓" : "○"} {g}
            </button>
          ))}
        </div>
      ),
      canNext: goal !== ""
    }
  ];

  const cur = steps[step];

  return (
    <div style={{ minHeight: "100vh", background: COLORS.night, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", fontFamily: "DM Sans,sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 520 }}>
        <div style={{ fontFamily: "Sora,sans-serif", fontWeight: 800, fontSize: "1.1rem", color: COLORS.green, marginBottom: 40, textAlign: "center" }}>🌿 Amahoro Challenge</div>
        <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: "2.5rem 2rem" }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 32 }}>
            {steps.map((_, i) => <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= step ? COLORS.green : COLORS.border, transition: "background 0.3s" }} />)}
          </div>
          <h2 style={{ fontFamily: "Sora,sans-serif", fontWeight: 800, fontSize: "1.5rem", letterSpacing: "-0.02em", marginBottom: 6, lineHeight: 1.2 }}>{cur.title}</h2>
          <p style={{ color: COLORS.muted, fontSize: "0.9rem", marginBottom: 24, lineHeight: 1.6 }}>{cur.sub}</p>
          {cur.content}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 28 }}>
            {step > 0
              ? <button onClick={() => setStep(s => s - 1)} style={{ background: "transparent", border: "none", color: COLORS.muted, cursor: "pointer", fontFamily: "Sora,sans-serif", fontSize: "0.9rem" }}>← Back</button>
              : <div />}
            <button
              onClick={() => { if (step < steps.length - 1) setStep(s => s + 1); else onComplete({ name, country, trigger, goal }); }}
              disabled={!cur.canNext}
              style={{ background: cur.canNext ? COLORS.green : COLORS.faint, border: "none", color: cur.canNext ? "#000" : COLORS.muted, fontFamily: "Sora,sans-serif", fontWeight: 700, fontSize: "0.95rem", padding: "10px 28px", borderRadius: 8, cursor: cur.canNext ? "pointer" : "not-allowed", transition: "all 0.2s" }}>
              {step === steps.length - 1 ? "Start Day 1 →" : "Continue →"}
            </button>
          </div>
        </div>
        <p style={{ textAlign: "center", color: COLORS.faint, fontSize: "0.78rem", marginTop: 16 }}>No credit card. No email required. Just show up.</p>
      </div>
    </div>
  );
}

function ChallengeScreen({ user, onCoach, onHome }) {
  const [currentDay, setCurrentDay] = useState(0);
  const [completedDays, setCompletedDays] = useState([]);
  const [reflection, setReflection] = useState("");
  const [tipVisible, setTipVisible] = useState(false);
  const [tipTyping, setTipTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiTip, setAiTip] = useState("");
  const [view, setView] = useState("challenge"); // challenge | progress | whatsapp

  const ch = CHALLENGES[currentDay];
  const isCompleted = completedDays.includes(currentDay);

  const completeDay = useCallback(async () => {
    if (!reflection.trim()) return;
    setLoading(true);
    setTipVisible(true);
    setTipTyping(true);
    setAiTip("");

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: `You are Amara, an AI anxiety coach built for African youth from sub-Saharan Africa. You are warm, direct, and culturally grounded. You deeply understand: firstborn responsibilities, academic pressure in African school systems (national exams, KCSE, WAEC, national competitions), job scarcity, family expectations, stigma around mental health, and limited access to professional help. You use simple accessible English (someone whose first language may not be English should understand you). Reference African realities naturally when relevant. Provide practical, science-backed encouragement grounded in CBT and mindfulness. Never use clinical jargon without explanation. Never be dismissive. Keep responses to 3–5 sentences — concise, warm, specific to what they shared. Do not use bullet points. Address the person by name if provided.`,
          messages: [{
            role: "user",
            content: `My name is ${user.name}, from ${user.country}. My biggest anxiety trigger is: ${user.trigger}. Today is Day ${ch.day} of the Amahoro 21-day challenge. The challenge theme was "${ch.title}" and the task was: ${ch.task}. My reflection: "${reflection}". Please give me your coaching response to what I shared.`
          }]
        })
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || ch.tip;
      setAiTip(text);
    } catch {
      setAiTip(ch.tip);
    }
    setTipTyping(false);
    setLoading(false);
    if (!isCompleted) setCompletedDays(d => [...d, currentDay]);
  }, [reflection, user, ch, currentDay, isCompleted]);

  const nextDay = () => {
    if (currentDay < CHALLENGES.length - 1) {
      setCurrentDay(d => d + 1);
      setReflection("");
      setTipVisible(false);
      setAiTip("");
    }
  };

  const waMessage = encodeURIComponent(`Hi Amahoro! 🌿 I just completed Day ${ch.day}: "${ch.title}". My reflection: ${reflection.slice(0, 200)}...`);

  return (
    <div style={{ minHeight: "100vh", background: COLORS.night, fontFamily: "DM Sans,sans-serif", color: COLORS.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes typing { 0%,60%,100%{opacity:0.3;transform:translateY(0)} 30%{opacity:1;transform:translateY(-4px)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .fade-in { animation: fadeIn 0.4s ease; }
        textarea:focus { border-color: #25D366 !important; outline: none; }
        ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-track { background: #0D1117; } ::-webkit-scrollbar-thumb { background: #263040; border-radius: 3px; }
      `}</style>

      {/* Header */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(13,17,23,0.95)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 4%", height: 60 }}>
        <button onClick={onHome} style={{ background: "transparent", border: "none", color: COLORS.green, fontFamily: "Sora,sans-serif", fontWeight: 800, fontSize: "1rem", cursor: "pointer" }}>🌿 Amahoro</button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: "0.82rem", color: COLORS.muted, fontFamily: "Sora,sans-serif" }}>{user.name} · {user.country}</span>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.green, animation: "pulse 2s infinite" }} />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["challenge", "progress", "whatsapp"].map(v => (
            <button key={v} onClick={() => setView(v)} style={{ background: view === v ? "rgba(37,211,102,0.1)" : "transparent", border: `1px solid ${view === v ? COLORS.green : COLORS.border}`, color: view === v ? COLORS.green : COLORS.muted, borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontSize: "0.78rem", fontFamily: "Sora,sans-serif", fontWeight: 600, textTransform: "capitalize" }}>
              {v}
            </button>
          ))}
        </div>
      </div>

      <div style={{ paddingTop: 80, maxWidth: 780, margin: "0 auto", padding: "80px 4% 4rem" }}>

        {view === "challenge" && (
          <div className="fade-in">
            {/* Day selector */}
            <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 12, marginBottom: 28 }}>
              {CHALLENGES.map((c, i) => (
                <button key={i} onClick={() => { setCurrentDay(i); setReflection(""); setTipVisible(false); setAiTip(""); }}
                  style={{ flexShrink: 0, width: 44, height: 44, borderRadius: 10, border: `1px solid ${currentDay === i ? COLORS.green : completedDays.includes(i) ? "rgba(37,211,102,0.4)" : COLORS.border}`, background: currentDay === i ? "rgba(37,211,102,0.15)" : completedDays.includes(i) ? "rgba(37,211,102,0.06)" : COLORS.deep, color: currentDay === i ? COLORS.green : completedDays.includes(i) ? COLORS.green : COLORS.muted, fontFamily: "Sora,sans-serif", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer" }}>
                  {completedDays.includes(i) ? "✓" : i + 1}
                </button>
              ))}
            </div>

            {/* Challenge Card */}
            <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, overflow: "hidden" }}>
              {/* Card header */}
              <div style={{ background: COLORS.deep, padding: "20px 24px", borderBottom: `1px solid ${COLORS.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
                  <Badge color="green">Day {ch.day} of 21</Badge>
                  <Badge color="amber">{ch.emoji} {ch.theme}</Badge>
                  <Badge color="sky">⏱ {ch.duration}</Badge>
                  {isCompleted && <Badge color="green">✓ Completed</Badge>}
                </div>
                <h2 style={{ fontFamily: "Sora,sans-serif", fontWeight: 800, fontSize: "clamp(1.4rem,3vw,1.9rem)", letterSpacing: "-0.025em", lineHeight: 1.2 }}>{ch.title}</h2>
              </div>

              <div style={{ padding: "24px" }}>
                {/* Context */}
                <div style={{ background: COLORS.deep, borderRadius: 10, padding: "16px 18px", marginBottom: 20, borderLeft: `3px solid ${COLORS.green}` }}>
                  <p style={{ fontSize: "0.9rem", color: COLORS.muted, lineHeight: 1.7 }}>{ch.context}</p>
                </div>

                {/* Task */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: "0.78rem", fontFamily: "Sora,sans-serif", fontWeight: 700, color: COLORS.green, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 8 }}>Your Challenge</div>
                  <p style={{ fontSize: "0.92rem", lineHeight: 1.7, color: COLORS.text }}>{ch.task}</p>
                </div>

                {/* Reflection */}
                <div style={{ background: COLORS.deep, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "16px", marginBottom: 20 }}>
                  <div style={{ fontSize: "0.75rem", fontFamily: "Sora,sans-serif", fontWeight: 700, color: COLORS.muted, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>Your Reflection</div>
                  <textarea
                    value={reflection}
                    onChange={e => setReflection(e.target.value)}
                    placeholder={ch.placeholder}
                    rows={5}
                    style={{ width: "100%", background: "transparent", border: "none", color: COLORS.text, fontFamily: "DM Sans,sans-serif", fontSize: "0.93rem", resize: "none", lineHeight: 1.65, outline: "none" }}
                  />
                </div>

                <ProgressBar value={ch.day} />
                <p style={{ fontSize: "0.75rem", color: COLORS.muted, marginTop: 6, marginBottom: 20 }}>Day {ch.day} of 21 · {completedDays.length} days completed</p>

                {/* Actions */}
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button onClick={completeDay} disabled={!reflection.trim() || loading}
                    style={{ display: "flex", alignItems: "center", gap: 6, background: reflection.trim() ? COLORS.green : COLORS.faint, border: "none", color: reflection.trim() ? "#000" : COLORS.muted, fontFamily: "Sora,sans-serif", fontWeight: 700, fontSize: "0.9rem", padding: "11px 22px", borderRadius: 8, cursor: reflection.trim() ? "pointer" : "not-allowed", transition: "opacity 0.2s" }}>
                    {loading ? "Amara is reading..." : "✉️ Get Amara's Feedback"}
                  </button>
                  {reflection.trim() && (
                    <a href={`https://wa.me/254113445647?text=${waMessage}`} target="_blank" rel="noreferrer"
                      style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: `1px solid ${COLORS.green}`, color: COLORS.green, fontFamily: "Sora,sans-serif", fontWeight: 700, fontSize: "0.9rem", padding: "11px 20px", borderRadius: 8, textDecoration: "none" }}>
                      💬 Share on WhatsApp
                    </a>
                  )}
                  {isCompleted && currentDay < 20 && (
                    <button onClick={nextDay} style={{ background: COLORS.deep, border: `1px solid ${COLORS.border}`, color: COLORS.text, fontFamily: "Sora,sans-serif", fontWeight: 600, fontSize: "0.9rem", padding: "11px 20px", borderRadius: 8, cursor: "pointer" }}>
                      Day {currentDay + 2} →
                    </button>
                  )}
                  <button onClick={onCoach} style={{ background: "transparent", border: `1px solid ${COLORS.border}`, color: COLORS.muted, fontFamily: "Sora,sans-serif", fontWeight: 600, fontSize: "0.9rem", padding: "11px 18px", borderRadius: 8, cursor: "pointer" }}>
                    🤖 Open Coach
                  </button>
                </div>

                {/* AI Tip */}
                {tipVisible && (
                  <div className="fade-in" style={{ background: "rgba(37,211,102,0.05)", border: "1px solid rgba(37,211,102,0.2)", borderRadius: 12, padding: "18px 18px", marginTop: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#25D366,#4FC3F7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.95rem" }}>🌿</div>
                      <div>
                        <div style={{ fontFamily: "Sora,sans-serif", fontWeight: 700, fontSize: "0.88rem", color: COLORS.green }}>Amara</div>
                        <div style={{ fontSize: "0.72rem", color: COLORS.muted }}>Your AI Coach</div>
                      </div>
                    </div>
                    {tipTyping ? <TypingDots /> : <p style={{ fontSize: "0.9rem", lineHeight: 1.7, color: COLORS.text }}>{aiTip}</p>}
                  </div>
                )}

                {/* Day 21 completion */}
                {currentDay === 20 && isCompleted && (
                  <div className="fade-in" style={{ marginTop: 24, background: "rgba(37,211,102,0.06)", border: "1px solid rgba(37,211,102,0.25)", borderRadius: 12, padding: "24px", textAlign: "center" }}>
                    <div style={{ fontSize: "3rem", marginBottom: 12 }}>🏆</div>
                    <h3 style={{ fontFamily: "Sora,sans-serif", fontWeight: 800, fontSize: "1.4rem", marginBottom: 8 }}>Challenge Complete!</h3>
                    <p style={{ color: COLORS.muted, fontSize: "0.9rem", lineHeight: 1.7, marginBottom: 20 }}>You showed up for 21 days. You are not the same person who started Day 1. Amahoro — peace be with you.</p>
                    <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                      <a href={`https://wa.me/254113445647?text=I%20just%20completed%20the%20Amahoro%2021-Day%20Challenge%21%20%F0%9F%8F%86%20My%20name%20is%20${user.name}%20from%20${user.country}.`} target="_blank" rel="noreferrer"
                        style={{ display: "flex", alignItems: "center", gap: 6, background: COLORS.green, border: "none", color: "#000", fontFamily: "Sora,sans-serif", fontWeight: 700, fontSize: "0.9rem", padding: "11px 20px", borderRadius: 8, textDecoration: "none" }}>
                        🏆 Share Your Win
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {view === "progress" && (
          <div className="fade-in">
            <h2 style={{ fontFamily: "Sora,sans-serif", fontWeight: 800, fontSize: "1.7rem", letterSpacing: "-0.025em", marginBottom: 8 }}>Your Progress</h2>
            <p style={{ color: COLORS.muted, marginBottom: 28 }}>{completedDays.length} of 21 days completed · Keep going, {user.name}.</p>
            <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: "24px", marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontFamily: "Sora,sans-serif", fontWeight: 700, fontSize: "0.9rem" }}>Overall Progress</span>
                <span style={{ fontFamily: "Sora,sans-serif", fontWeight: 800, color: COLORS.green }}>{Math.round((completedDays.length / 21) * 100)}%</span>
              </div>
              <div style={{ height: 8, background: COLORS.deep, borderRadius: 4 }}>
                <div style={{ height: "100%", width: `${(completedDays.length / 21) * 100}%`, background: `linear-gradient(90deg,${COLORS.green},#4FC3F7)`, borderRadius: 4, transition: "width 0.6s ease" }} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))", gap: 10 }}>
              {CHALLENGES.map((c, i) => (
                <div key={i} onClick={() => { setCurrentDay(i); setView("challenge"); }} style={{ background: COLORS.card, border: `1px solid ${completedDays.includes(i) ? "rgba(37,211,102,0.4)" : COLORS.border}`, borderRadius: 12, padding: "16px 14px", cursor: "pointer", transition: "transform 0.2s", textAlign: "center" }}
                  onMouseOver={e => e.currentTarget.style.transform = "translateY(-2px)"}
                  onMouseOut={e => e.currentTarget.style.transform = "translateY(0)"}>
                  <div style={{ fontSize: "1.4rem", marginBottom: 6 }}>{completedDays.includes(i) ? "✅" : c.emoji}</div>
                  <div style={{ fontSize: "0.72rem", fontFamily: "Sora,sans-serif", fontWeight: 700, color: completedDays.includes(i) ? COLORS.green : COLORS.muted }}>Day {c.day}</div>
                  <div style={{ fontSize: "0.78rem", color: COLORS.muted, marginTop: 2 }}>{c.theme}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 28, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14 }}>
              {[
                { icon: "📅", label: "Days Completed", value: completedDays.length },
                { icon: "🧠", label: "Anxiety Score", value: `↓ ${completedDays.length * 3}%` },
                { icon: "🔥", label: "Current Streak", value: `${completedDays.length} days` },
                { icon: "🏆", label: "Days Remaining", value: 21 - completedDays.length },
              ].map(s => (
                <div key={s.label} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "20px", display: "flex", gap: 14, alignItems: "center" }}>
                  <div style={{ fontSize: "1.8rem" }}>{s.icon}</div>
                  <div>
                    <div style={{ fontFamily: "Sora,sans-serif", fontWeight: 800, fontSize: "1.5rem", color: COLORS.green }}>{s.value}</div>
                    <div style={{ fontSize: "0.8rem", color: COLORS.muted }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === "whatsapp" && (
          <div className="fade-in">
            <h2 style={{ fontFamily: "Sora,sans-serif", fontWeight: 800, fontSize: "1.7rem", letterSpacing: "-0.025em", marginBottom: 8 }}>WhatsApp Integration</h2>
            <p style={{ color: COLORS.muted, marginBottom: 28 }}>Do the challenge directly on WhatsApp. No apps. No logins. Just messages.</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 }}>
              {[
                { icon: "🌅", title: "Daily Challenge on WhatsApp", desc: "Get your daily challenge at 7am every morning as a WhatsApp message from Amara.", link: `https://wa.me/254113445647?text=START%20${encodeURIComponent(user.name)}`, label: "Subscribe to Daily Messages" },
                { icon: "💬", title: "Share Today's Reflection", desc: "Send your Day " + (currentDay + 1) + " reflection directly to Amara on WhatsApp for personalised feedback.", link: `https://wa.me/254113445647?text=Day%20${ch.day}%20reflection:%20`, label: "Send Reflection to Amara" },
                { icon: "👥", title: "Join Your Cohort Group", desc: "Join 20 other African youth going through the challenge together. Accountability. Community. Support.", link: `https://wa.me/254113445647?text=JOIN%20COHORT%20${encodeURIComponent(user.country)}`, label: "Join Cohort Group" },
                { icon: "📊", title: "Get Your Weekly Report", desc: "Ask Amara for your weekly anxiety score update and personalised insight.", link: `https://wa.me/254113445647?text=REPORT%20${encodeURIComponent(user.name)}`, label: "Request Weekly Report" },
              ].map(item => (
                <div key={item.title} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "22px" }}>
                  <div style={{ fontSize: "2rem", marginBottom: 10 }}>{item.icon}</div>
                  <h4 style={{ fontFamily: "Sora,sans-serif", fontWeight: 700, fontSize: "0.95rem", marginBottom: 6 }}>{item.title}</h4>
                  <p style={{ fontSize: "0.85rem", color: COLORS.muted, lineHeight: 1.65, marginBottom: 16 }}>{item.desc}</p>
                  <a href={item.link} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 6, background: COLORS.green, border: "none", color: "#000", fontFamily: "Sora,sans-serif", fontWeight: 700, fontSize: "0.85rem", padding: "10px 16px", borderRadius: 8, textDecoration: "none", width: "fit-content" }}>
                    💬 {item.label}
                  </a>
                </div>
              ))}
            </div>

            {/* WhatsApp Phone Preview */}
            <div style={{ marginTop: 32, background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: "24px" }}>
              <h4 style={{ fontFamily: "Sora,sans-serif", fontWeight: 700, marginBottom: 16 }}>How it looks in WhatsApp</h4>
              <div style={{ background: "#0B141A", borderRadius: 12, overflow: "hidden", maxWidth: 400 }}>
                <div style={{ background: "#1F2C34", padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: COLORS.green, display: "flex", alignItems: "center", justifyContent: "center" }}>🌿</div>
                  <div>
                    <div style={{ fontFamily: "Sora,sans-serif", fontWeight: 700, fontSize: "0.9rem" }}>Amara · Amahoro Coach</div>
                    <div style={{ fontSize: "0.72rem", color: "#8696A0" }}>Online · your daily peace guide</div>
                  </div>
                </div>
                <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { from: "bot", msg: `🌅 Good morning ${user.name}! Day ${ch.day} challenge is live.\n\n*Today:* ${ch.title}\n\nReply with your reflection when ready. 🌿` },
                    { from: "user", msg: reflection || "I'll write my reflection now!" },
                    { from: "bot", msg: `Beautiful 🌿 ${ch.tip.slice(0, 120)}...` },
                  ].map((m, i) => (
                    <div key={i} style={{ maxWidth: "80%", padding: "8px 12px", borderRadius: m.from === "bot" ? "10px 10px 10px 2px" : "10px 10px 2px 10px", background: m.from === "bot" ? "#1F2C34" : "#005C4B", alignSelf: m.from === "bot" ? "flex-start" : "flex-end", fontSize: "0.8rem", lineHeight: 1.5, color: COLORS.text, whiteSpace: "pre-wrap" }}>
                      {m.msg}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating coach button */}
      <button onClick={onCoach} style={{ position: "fixed", bottom: 24, right: 24, zIndex: 99, background: COLORS.green, border: "none", color: "#000", width: 52, height: 52, borderRadius: "50%", fontSize: "1.3rem", cursor: "pointer", boxShadow: "0 8px 24px rgba(37,211,102,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        🌿
      </button>
    </div>
  );
}

function CoachScreen({ user, onBack }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: `Habari${user?.name ? ` ${user.name}` : ""}! I'm Amara, your AI anxiety coach. I understand the specific pressures of being a young person in Africa — the family expectations, the academic weight, the job market stress. What's on your mind today? You can type anything. 🌿` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => { chatRef.current?.scrollTo(0, chatRef.current.scrollHeight); }, [messages]);

  const send = useCallback(async () => {
    const msg = input.trim();
    if (!msg || loading) return;
    const next = [...messages, { role: "user", content: msg }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: `You are Amara, an AI anxiety coach built specifically for African youth from sub-Saharan Africa. You are warm, direct, deeply empathetic, and culturally grounded. You understand: firstborn responsibilities, academic pressure in African school systems (national exams, KCSE, WAEC, A-levels, university entrance exams), youth unemployment, family expectations of success, stigma around mental health ("just pray about it," "you're thinking too much"), and limited access to professional help. You speak plainly and warmly — accessible to someone whose first language may not be English. You reference African realities naturally when relevant (matatu, maize, ugali, jollof, extended family dynamics, etc.). You provide practical, science-backed techniques from CBT and mindfulness. You never use clinical jargon without explaining it. You never minimise someone's struggle. You keep responses to 3–5 sentences — concise, warm, and specific to what the person shared. You do not use bullet points. You are not a replacement for professional care, and you gently remind people of this when appropriate.${user ? ` The user's name is ${user.name} from ${user.country}. Their main anxiety trigger is: ${user.trigger}. Their goal: ${user.goal}.` : ""}`,
          messages: next.slice(-10)
        })
      });
      const data = await res.json();
      setMessages(m => [...m, { role: "assistant", content: data.content?.[0]?.text || "Tell me more — I'm here." }]);
    } catch {
      setMessages(m => [...m, { role: "assistant", content: "Something disconnected on my end — but I'm still here. Tell me what you were sharing. 🌿" }]);
    }
    setLoading(false);
  }, [input, messages, loading, user]);

  return (
    <div style={{ minHeight: "100vh", background: COLORS.night, display: "flex", flexDirection: "column", fontFamily: "DM Sans,sans-serif", color: COLORS.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes typing { 0%,60%,100%{opacity:0.3;transform:translateY(0)} 30%{opacity:1;transform:translateY(-4px)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .msg-in { animation: fadeIn 0.3s ease; }
        input:focus { border-color: #25D366 !important; outline: none; }
        ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-track { background: #0D1117; } ::-webkit-scrollbar-thumb { background: #263040; border-radius: 3px; }
      `}</style>

      {/* Header */}
      <div style={{ background: COLORS.deep, borderBottom: `1px solid ${COLORS.border}`, padding: "0 4%", height: 66, display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
        <button onClick={onBack} style={{ background: "transparent", border: "none", color: COLORS.muted, cursor: "pointer", fontSize: "0.9rem", fontFamily: "Sora,sans-serif" }}>← Back</button>
        <div style={{ width: 42, height: 42, borderRadius: "50%", background: "linear-gradient(135deg,#25D366,#4FC3F7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem" }}>🌿</div>
        <div>
          <div style={{ fontFamily: "Sora,sans-serif", fontWeight: 800, fontSize: "1rem" }}>Amara</div>
          <div style={{ fontSize: "0.75rem", color: COLORS.green, display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: COLORS.green, display: "inline-block" }} /> Always here for you
          </div>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <a href={`https://wa.me/254113445647?text=Hi%20Amara!`} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 6, background: COLORS.green, border: "none", color: "#000", fontFamily: "Sora,sans-serif", fontWeight: 700, fontSize: "0.8rem", padding: "7px 14px", borderRadius: 8, textDecoration: "none" }}>
            💬 Continue on WhatsApp
          </a>
        </div>
      </div>

      {/* Chat */}
      <div ref={chatRef} style={{ flex: 1, overflowY: "auto", padding: "24px 4%", display: "flex", flexDirection: "column", gap: 16, maxWidth: 680, width: "100%", margin: "0 auto" }}>
        {messages.map((m, i) => (
          <div key={i} className="msg-in" style={{ display: "flex", gap: 10, alignItems: "flex-start", flexDirection: m.role === "user" ? "row-reverse" : "row" }}>
            {m.role === "assistant" && (
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#25D366,#4FC3F7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", flexShrink: 0 }}>🌿</div>
            )}
            <div style={{ maxWidth: "78%", padding: "12px 16px", borderRadius: m.role === "user" ? "12px 4px 12px 12px" : "4px 12px 12px 12px", background: m.role === "user" ? "rgba(37,211,102,0.12)" : COLORS.card, border: m.role === "user" ? "1px solid rgba(37,211,102,0.2)" : `1px solid ${COLORS.border}`, fontSize: "0.92rem", lineHeight: 1.7, color: COLORS.text, whiteSpace: "pre-wrap" }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="msg-in" style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#25D366,#4FC3F7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem" }}>🌿</div>
            <div style={{ padding: "12px 16px", borderRadius: "4px 12px 12px 12px", background: COLORS.card, border: `1px solid ${COLORS.border}` }}>
              <TypingDots />
            </div>
          </div>
        )}
      </div>

      {/* Suggested prompts */}
      {messages.length === 1 && (
        <div style={{ padding: "0 4%", maxWidth: 680, width: "100%", margin: "0 auto", display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          {["I'm overwhelmed by family expectations", "I can't stop overthinking at night", "I'm scared of failing my exams", "I feel anxious but I don't know why"].map(p => (
            <button key={p} onClick={() => { setInput(p); }} style={{ background: COLORS.deep, border: `1px solid ${COLORS.border}`, color: COLORS.muted, borderRadius: 100, padding: "6px 14px", cursor: "pointer", fontSize: "0.8rem", fontFamily: "Sora,sans-serif", transition: "border-color 0.2s, color 0.2s" }}
              onMouseOver={e => { e.currentTarget.style.borderColor = COLORS.green; e.currentTarget.style.color = COLORS.green; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.color = COLORS.muted; }}>
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ background: COLORS.deep, borderTop: `1px solid ${COLORS.border}`, padding: "14px 4%", display: "flex", gap: 10, alignItems: "center" }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Talk to Amara — she's listening..." style={{ flex: 1, background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "12px 16px", color: COLORS.text, fontFamily: "DM Sans,sans-serif", fontSize: "0.92rem", transition: "border-color 0.2s" }} />
        <button onClick={send} disabled={!input.trim() || loading} style={{ background: input.trim() ? COLORS.green : COLORS.faint, border: "none", color: input.trim() ? "#000" : COLORS.muted, fontFamily: "Sora,sans-serif", fontWeight: 700, fontSize: "0.88rem", padding: "12px 20px", borderRadius: 10, cursor: input.trim() ? "pointer" : "not-allowed", transition: "background 0.2s", whiteSpace: "nowrap" }}>
          Send →
        </button>
      </div>
    </div>
  );
}

// ─── APP ROOT ────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("landing"); // landing | onboard | challenge | coach
  const [user, setUser] = useState(null);

  const handleOnboardingComplete = (data) => { setUser(data); setScreen("challenge"); };

  return (
    <>
      {screen === "landing" && <LandingScreen onStart={() => setScreen("onboard")} onCoach={() => setScreen("coach")} />}
      {screen === "onboard" && <OnboardingScreen onComplete={handleOnboardingComplete} />}
      {screen === "challenge" && <ChallengeScreen user={user || { name: "Friend", country: "Africa", trigger: "general stress", goal: "feel calmer" }} onCoach={() => setScreen("coach")} onHome={() => setScreen("landing")} />}
      {screen === "coach" && <CoachScreen user={user} onBack={() => setScreen(user ? "challenge" : "landing")} />}
    </>
  );
}
