// POST /api/admin-activate  { shop, plan, months }  with header  Authorization: Bearer <ADMIN_TOKEN>
// Lets the Ledgro team activate a shop that paid by cash/UPI, until Razorpay subscriptions are live.
const crypto = require("crypto");
const store = require("./_store");
module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const expected = process.env.ADMIN_TOKEN || "";
  const got = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!expected || got.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(got), Buffer.from(expected)))
    return res.status(401).json({ error: "Wrong admin key" });
  const { shop, plan, months } = req.body || {};
  if (!/^[a-f0-9-]{32,36}$/i.test(String(shop || ""))) return res.status(400).json({ error: "Shop ID looks wrong. Copy it from the shop's Ledgro app: More → Plans." });
  if (!["starter", "growth", "pro"].includes(plan)) return res.status(400).json({ error: "Unknown plan" });
  const m = Math.max(1, Math.min(24, parseInt(months, 10) || 1));
  const prev = await store.get(`lic:${shop}`).catch(() => null);
  const base = prev && prev.current_end && prev.current_end * 1000 > Date.now() ? prev.current_end * 1000 : Date.now();
  const end = new Date(base); end.setMonth(end.getMonth() + m);
  const lic = { plan, billing: m >= 12 ? "yearly" : "monthly", status: "active", source: "manual", current_end: Math.floor(end.getTime() / 1000), updated: Date.now() };
  await store.set(`lic:${shop}`, lic);
  res.status(200).json({ ok: true, plan, until: end.toISOString().slice(0, 10) });
};
