// Tiny key-value store on Upstash Redis (REST). Holds ONLY: shop id -> plan status.
// No shop names, customers, bills or amounts are ever sent here.
const URL_ = process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
async function cmd(args) {
  const r = await fetch(URL_, { method: "POST", headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" }, body: JSON.stringify(args) });
  if (!r.ok) throw new Error("store " + r.status);
  return (await r.json()).result;
}
module.exports = {
  get: async (k) => { const v = await cmd(["GET", k]); return v ? JSON.parse(v) : null; },
  set: (k, v) => cmd(["SET", k, JSON.stringify(v)]),
};
