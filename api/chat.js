// Optional AI backend for the ExoToura chatbot.
// Set ANTHROPIC_API_KEY in Vercel > Project > Settings > Environment Variables.
// Without the key this returns 503 and the chatbot automatically uses its built-in knowledge base.
const hits = new Map();

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(503).json({ error: "AI not configured" });

  // basic per-IP rate limit (best effort): 20 requests / minute
  const ip = String(req.headers["x-forwarded-for"] || "anon").split(",")[0].trim();
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 60000);
  if (recent.length >= 20) return res.status(429).json({ error: "Too many requests" });
  recent.push(now);
  hits.set(ip, recent);

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  body = body || {};

  const messages = (Array.isArray(body.messages) ? body.messages : [])
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .slice(-10)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 1500) }));
  while (messages.length && messages[0].role !== "user") messages.shift();
  if (!messages.length || messages[messages.length - 1].role !== "user") return res.status(400).json({ error: "No user message" });

  const context = String(body.context || "").slice(0, 6000);
  const system = [
    "You are ExoToura Guide, the friendly assistant of the ExoToura Egypt tourism website.",
    "Help visitors understand the website (its pages and features) and learn about tourism, archaeological sites, governorates and travel in Egypt.",
    "Reply in the same language as the user's last message. If it is Arabic, use clear, warm Egyptian-flavoured Arabic.",
    "Be concise (under about 150 words), use short bullet points when listing, and use **bold** for key names.",
    "Use the SITE KNOWLEDGE below as your primary source for anything about the website, its prices and packages. Never invent prices, opening hours or policies; if unsure, say so and suggest the Contact page.",
    "Politely steer unrelated questions back to Egypt travel or the website.",
    "Current page the user is on: " + String(body.page || "unknown").slice(0, 60),
    "",
    "SITE KNOWLEDGE:",
    context,
  ].join("\n");

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: process.env.CLAUDE_MODEL || "claude-haiku-5-5",
        max_tokens: 600,
        system,
        messages,
      }),
    });
    if (!r.ok) return res.status(502).json({ error: "Upstream error " + r.status });
    const data = await r.json();
    const reply = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
    if (!reply) return res.status(502).json({ error: "Empty reply" });
    return res.status(200).json({ reply });
  } catch (e) {
    return res.status(500).json({ error: "Server error" });
  }
};
