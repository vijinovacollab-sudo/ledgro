// POST /api/subscribe  { shop, plan, billing, phone }  ->  { subscription_id }
// Creates a Razorpay subscription tagged with the shop's random device id.
const PLAN_IDS = {
  "starter-monthly": process.env.RZP_PLAN_STARTER_MONTHLY,
  "starter-yearly": process.env.RZP_PLAN_STARTER_YEARLY,
  "growth-monthly": process.env.RZP_PLAN_GROWTH_MONTHLY,
  "growth-yearly": process.env.RZP_PLAN_GROWTH_YEARLY,
  "pro-monthly": process.env.RZP_PLAN_PRO_MONTHLY,
  "pro-yearly": process.env.RZP_PLAN_PRO_YEARLY,
};
module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const { shop, plan, billing, phone } = req.body || {};
  if (!/^[a-f0-9-]{32,36}$/i.test(String(shop || ""))) return res.status(400).json({ error: "bad shop id" });
  const planId = PLAN_IDS[`${plan}-${billing}`];
  if (!planId) return res.status(400).json({ error: "unknown plan" });
  const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");
  const r = await fetch("https://api.razorpay.com/v1/subscriptions", {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      plan_id: planId,
      total_count: billing === "yearly" ? 10 : 120,
      customer_notify: 1,
      notes: { shop, plan, billing, phone: String(phone || "").replace(/\D/g, "").slice(-10) },
    }),
  });
  const j = await r.json();
  if (!r.ok) return res.status(502).json({ error: (j.error && j.error.description) || "Razorpay error" });
  res.status(200).json({ subscription_id: j.id });
};
