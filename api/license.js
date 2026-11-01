// GET /api/license?shop=<id>  ->  { status, plan, billing, current_end }
const store = require("./_store");
module.exports = async (req, res) => {
  const shop = String((req.query && req.query.shop) || "");
  if (!/^[a-f0-9-]{32,36}$/i.test(shop)) return res.status(400).json({ error: "bad shop id" });
  res.setHeader("Cache-Control", "no-store");
  const lic = await store.get(`lic:${shop}`).catch(() => null);
  if (!lic) return res.status(200).json({ status: "none" });
  res.status(200).json({ status: lic.status, plan: lic.plan, billing: lic.billing, current_end: lic.current_end });
};
