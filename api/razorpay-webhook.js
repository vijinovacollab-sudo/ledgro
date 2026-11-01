// POST /api/razorpay-webhook  — Razorpay calls this on subscription events.
// Verifies the signature, then records the shop's plan status.
const crypto = require("crypto");
const store = require("./_store");
const STATUS = {
  "subscription.activated": "active", "subscription.charged": "active", "subscription.resumed": "active",
  "subscription.pending": "grace", "subscription.halted": "halted", "subscription.paused": "halted",
  "subscription.cancelled": "cancelled", "subscription.completed": "cancelled",
};
module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).end();
  const chunks = [];
  for await (const c of req) chunks.push(typeof c === "string" ? Buffer.from(c) : c);
  const raw = Buffer.concat(chunks);
  const sig = String(req.headers["x-razorpay-signature"] || "");
  const expected = crypto.createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET).update(raw).digest("hex");
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return res.status(400).end("bad signature");
  const ev = JSON.parse(raw.toString("utf8"));
  const sub = ev.payload && ev.payload.subscription && ev.payload.subscription.entity;
  const status = STATUS[ev.event];
  if (!sub || !status || !sub.notes || !sub.notes.shop) return res.status(200).end("ignored");
  await store.set(`lic:${sub.notes.shop}`, {
    plan: sub.notes.plan, billing: sub.notes.billing, status,
    subscription: sub.id, current_end: sub.current_end || null, updated: Date.now(),
  });
  res.status(200).end("ok");
};
module.exports.config = { api: { bodyParser: false } };
