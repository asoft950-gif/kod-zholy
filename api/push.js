/* Bitlings: Web Push жіберуші (Vercel функциясы).
   Supabase триггері (pg_net) жаңа хат/достық сұрауы келгенде осыны шақырады.
   Қорғаныс: құпия кілт (x-push-secret). Хабарлама мәтіні жіберілмейді: тек «кімнен» және түрі. */
const crypto = require("crypto");
const webpush = require("web-push");

const same = (a, b) => {
  const x = Buffer.from(String(a || ""));
  const y = Buffer.from(String(b || ""));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "method" });
  const { PUSH_SECRET, VAPID_PRIVATE, VAPID_SUBJECT } = process.env;
  const VAPID_PUBLIC = process.env.VAPID_PUBLIC || "BL_ZJCWmWaEGfefj85QA6tC4nKKndqvbEKb6orW77INel9kgxj1Iem6IrsxPChoPbPMQk1LIkBYD16puVaFY1Y0"; // ашық кілт жасырын емес
  if (!PUSH_SECRET || !VAPID_PUBLIC || !VAPID_PRIVATE) return res.status(500).json({ error: "not_configured" });
  if (!same(req.headers["x-push-secret"], PUSH_SECRET)) return res.status(401).json({ error: "unauthorized" });

  let b = req.body;
  if (typeof b === "string") {
    try {
      b = JSON.parse(b);
    } catch (e) {
      return res.status(400).json({ error: "bad_json" });
    }
  }
  b = b || {};
  const subs = (Array.isArray(b.subs) ? b.subs : []).slice(0, 10).filter((s) => s && typeof s.endpoint === "string" && s.endpoint.startsWith("https://") && s.keys && s.keys.p256dh && s.keys.auth);
  if (!subs.length) return res.status(200).json({ sent: 0 });

  webpush.setVapidDetails(VAPID_SUBJECT || "https://bitlings-kz.vercel.app", VAPID_PUBLIC, VAPID_PRIVATE);
  const payload = JSON.stringify({
    title: String(b.title || "Bitlings").slice(0, 80),
    body: String(b.body || "").slice(0, 140),
    url: typeof b.url === "string" && b.url.startsWith("#/") ? b.url : "#/account/msg",
    tag: String(b.tag || "bitlings").slice(0, 40),
  });
  const out = await Promise.allSettled(subs.map((s) => webpush.sendNotification(s, payload, { TTL: 3600, urgency: "normal" })));
  const gone = out.filter((r) => r.status === "rejected" && r.reason && [404, 410].includes(r.reason.statusCode)).length;
  res.status(200).json({ sent: out.filter((r) => r.status === "fulfilled").length, gone });
};
