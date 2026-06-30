export const config = { runtime: "edge" };

// Simple in-memory rate limiter (resets on cold start, good enough for protection)
const rateLimitMap = new Map();
const MAX_REQUESTS = 20;       // max messages
const WINDOW_MS = 10 * 60 * 1000; // per 10 minutes

function isRateLimited(id) {
  const now = Date.now();
  const entry = rateLimitMap.get(id);
  if (!entry || now - entry.start > WINDOW_MS) {
    rateLimitMap.set(id, { count: 1, start: now });
    return false;
  }
  entry.count++;
  if (entry.count > MAX_REQUESTS) return true;
  return false;
}

export default async function handler(req) {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      }
    });
  }

  try {
    const { system, messages, userId } = await req.json();

    // Rate limit by userId if provided, otherwise by IP
    const ip = req.headers.get("x-forwarded-for") || "anonymous";
    const limitKey = userId || ip;

    if (isRateLimited(limitKey)) {
      return new Response(JSON.stringify({
        error: { message: "You have sent many messages quickly. Please wait a few minutes and try again. 🌿" }
      }), {
        status: 429,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        system: system || "You are Mahoro, a warm wellness companion.",
        messages: messages || []
      })
    });

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: { message: err.message } }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
}
