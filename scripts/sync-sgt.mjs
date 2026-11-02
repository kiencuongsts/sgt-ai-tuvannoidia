// Lấy dữ liệu Tour và Services từ SGT Channel API, ghi vào data/sgt-tours.json và data/sgt-services.json.
// Chỉ đọc (tour:read, service:read). Không gọi Booking.
// Biến môi trường: SGT_CLIENT_ID, SGT_CLIENT_SECRET (lưu trong GitHub Secrets), SGT_API_BASE (mặc định https://api.saigontourist.me)
import { writeFileSync } from "node:fs";

const BASE = (process.env.SGT_API_BASE || "https://api.saigontourist.me").replace(/\/$/, "");
const ID = process.env.SGT_CLIENT_ID, SECRET = process.env.SGT_CLIENT_SECRET;
if (!ID || !SECRET) { console.error("Thiếu SGT_CLIENT_ID / SGT_CLIENT_SECRET"); process.exit(1); }
const sleep = ms => new Promise(r => setTimeout(r, ms));
let token = null, tokenAt = 0, calls = 0;

async function auth() {
  const r = await fetch(BASE + "/channel/v1/auth/token", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ client_id: ID, client_secret: SECRET }) });
  const j = await r.json();
  if (!j.access_token) throw new Error("Không lấy được token: " + JSON.stringify(j).slice(0, 200));
  token = j.access_token; tokenAt = Date.now();
}
async function get(path, params = {}) {
  for (let k = 0; k < 8; k++) {
    if (!token || Date.now() - tokenAt > 50 * 60 * 1000) await auth();
    const u = new URL(BASE + path); Object.entries(params).forEach(([a, b]) => u.searchParams.set(a, b));
    const r = await fetch(u, { headers: { Accept: "application/json", Authorization: "Bearer " + token } });
    calls++;
    const j = await r.json().catch(() => ({ error: { code: "bad_json", status: r.status } }));
    if (j?.error?.code === "rate_limited" || r.status === 429) { await sleep(20000); continue; }
    if (r.status === 401) { token = null; continue; }
    await sleep(1100);
    return j;
  }
  throw new Error("Bị giới hạn request quá lâu: " + path);
}
const decode = s => s.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const txt = h => h ? decode(h.replace(/<\/(p|li|h\d|div)>/gi, "\n").replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "")).replace(/[ \t]+\n/g, "\n").replace(/\n{2,}/g, "\n").trim() : "";
function days(h) {
  if (!h) return [];
  const parts = h.split(/(?=<h[1-4][^>]*>)/i).filter(p => /^<h[1-4]/i.test(p));
  return parts.map(p => {
    const m = p.match(/^<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>([\s\S]*)$/i);
    const title = txt(m ? m[1] : ""), body = m ? m[2] : "";
    const bold = [...new Set([...body.matchAll(/<(strong|b)>([\s\S]*?)<\/\1>/gi)].map(x => txt(x[2])).filter(Boolean))];
    return { title, text: txt(body), bold };
  });
}
async function pages(path, params) {
  const out = [];
  for (let p = 1; p <= 50; p++) { const r = await get(path, { ...params, per_page: 100, page: p }); out.push(...(r.data || [])); if (!r.meta || p >= r.meta.last_page) break; }
  return out;
}

const tours = await pages("/channel/v1/tours", { tour_codes_limit: 50 });
const details = [];
for (const t of tours) {
  const needDetail = t.tour_type === "domestic", needCodes = t.tour_codes_count > (t.tour_codes || []).length;
  if (!needDetail && !needCodes) continue;
  const d = (await get("/channel/v1/tours/" + t.id)).data || {};
  if (needCodes && (d.tour_codes || []).length > t.tour_codes.length) t.tour_codes = d.tour_codes;
  if (needDetail) { const c = d.content || {}; details.push({ id: t.id, overview: txt(c.overview), itinerary: days(c.itinerary), services_included: txt(c.services_included).slice(0, 4000), addon_services: d.addon_services || [] }); }
}
const tourFilters = (await get("/channel/v1/tours/filters")).data;
const services = await pages("/channel/v1/services", {});
const sdet = [];
for (const s of services) {
  const d = (await get("/channel/v1/services/" + s.id)).data || {}; const c = d.content || {};
  sdet.push({ id: s.id, combo_content: txt(c.combo_content).slice(0, 1500), service_details: txt(c.service_details).slice(0, 2500), cancellation_policy: txt(c.cancellation_policy).slice(0, 800), ticket_types: d.ticket_types || [] });
}
const serviceFilters = (await get("/channel/v1/services/filters")).data;
const now = new Date().toISOString(), src = "SGT Channel API (" + BASE + ")";
writeFileSync("data/sgt-tours.json", JSON.stringify({ syncedAt: now, source: src, tours, details, filters: tourFilters }));
writeFileSync("data/sgt-services.json", JSON.stringify({ syncedAt: now, source: src, services, details: sdet, filters: serviceFilters }));
console.log(`Tours ${tours.length} (chi tiết ${details.length}) · Services ${services.length} · ${calls} request`);
