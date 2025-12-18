// Chatbot controller: LLM via OpenRouter (if configured) with FAQ fallback
const fetch = global.fetch || require("node-fetch");
const faqs = [
  {
    q: ["enroll", "enrollment", "course access"],
    a: "To enroll, open a course and click 'Enroll' or complete payment via PayPal. After success, the course appears in 'My Courses'.",
  },
  {
    q: ["refund", "cancel", "money back"],
    a: "Refunds depend on course progress. If you haven't consumed significant content, contact support via the course page to request a refund.",
  },
  {
    q: ["reset password", "forgot password", "password"],
    a: "Use 'Forgot password?' on the sign-in page. You'll receive an email with a reset link (valid for 1 hour).",
  },
  {
    q: ["instructor", "publish", "approve course"],
    a: "Courses must be approved by an admin before publishing. Ensure content is complete, then submit for review from the instructor dashboard.",
  },
  {
    q: ["group", "study group", "chat"],
    a: "Join or create groups from the Groups section. Use the join code to invite classmates and collaborate in real-time chat.",
  },
];

const defaultResponse =
  "I didn't quite catch that. Try rephrasing or ask about enrollments, refunds, password reset, instructor publishing, or groups. You can also contact support from your dashboard.";

function scoreMessage(msg, keywords) {
  const text = msg.toLowerCase();
  return keywords.reduce((acc, k) => (text.includes(k) ? acc + 1 : acc), 0);
}

async function askChatbot(req, res) {
  try {
    const { message = "" } = req.body || {};
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    // If OpenRouter is configured, use it
    const apiKey = process.env.OPENROUTER_API_KEY;
    const model = process.env.OPENROUTER_MODEL || "openrouter/auto";
    if (apiKey && typeof fetch === "function") {
      try {
        const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
            // Optional but recommended headers
            "HTTP-Referer": process.env.CLIENT_URL || "http://localhost:5173",
            "X-Title": "StudySync",
          },
          body: JSON.stringify({
            model,
            messages: [
              {
                role: "system",
                content:
                  "You are StudySync Assistant, a concise support bot for an online study portal. Reply in this format: 1) One brief summary sentence. 2) 2-4 bullet points with actionable steps or key info. Keep responses under 120 words. If unsure, state you’re unsure and suggest contacting support. Topics: enrollments, refunds, password resets, instructor publishing, groups, platform usage.",
              },
              { role: "user", content: message },
            ],
            temperature: 0.3,
          }),
        });
        if (resp.ok) {
          const data = await resp.json();
          const reply = data?.choices?.[0]?.message?.content?.trim();
          if (reply) return res.status(200).json({ success: true, reply });
          console.warn("OpenRouter empty reply");
        } else {
          const bodyText = await resp.text();
          console.warn("OpenRouter error status:", resp.status, bodyText);
        }
      } catch (err) {
        console.error("OpenRouter request failed:", err?.message || err);
      }
      // If LLM failed, fall back to FAQ
    }

    let best = { score: 0, a: defaultResponse };
    for (const item of faqs) {
      const s = scoreMessage(message, item.q);
      if (s > best.score) best = { score: s, a: item.a };
    }
    return res.status(200).json({ success: true, reply: best.a });
  } catch (error) {
    console.error("askChatbot error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

module.exports = { askChatbot };
