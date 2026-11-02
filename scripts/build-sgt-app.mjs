// Rút gọn dữ liệu SGT API cho app: chỉ tour trong nước, các trường app cần để gợi ý tour đang bán.
import { readFileSync, writeFileSync } from "node:fs";
const T = JSON.parse(readFileSync("data/sgt-tours.json", "utf8"));
const S = JSON.parse(readFileSync("data/sgt-services.json", "utf8"));
const det = new Map(T.details.map(d => [d.id, d]));
const tours = T.tours.filter(t => t.tour_type === "domestic").map(t => {
  const d = det.get(t.id) || {};
  return {
    id: t.id, title: t.title, slug: t.slug, days: t.duration_days, nights: t.duration_nights, transport: t.transport,
    start: t.start_place, dest: t.destinations, cats: (t.categories || []).map(c => c.name), label: t.highlight_label, min: t.min_price,
    codes: (t.tour_codes || []).map(c => ({ code: c.code, from: c.start_date, to: c.end_date, adult: c.prices?.adult ?? null, child: c.prices?.child ?? null, seats: c.remaining_seats, cap: c.capacity, ok: c.is_bookable, disc: c.has_discount ? c.discount_amount : 0 })),
    itin: (d.itinerary || []).map(x => ({ t: x.title, b: x.bold, x: x.text.slice(0, 400) })),
    addons: (d.addon_services || []).map(a => ({ name: a.name, price: a.price })),
    updated: t.updated_at
  };
});
const services = S.services.map(s => {
  const d = (S.details || []).find(x => x.id === s.id) || {};
  const dates = [...new Set((d.ticket_types || []).flatMap(tt => tt.available_dates || []))].sort();
  return { id: s.id, title: s.title, slug: s.slug, addr: s.address, dest: s.destinations, cats: (s.categories || []).map(c => c.name), price: s.price, rating: s.rating, label: s.highlight_label,
    desc: (d.combo_content || "").slice(0, 400), types: (d.ticket_types || []).map(tt => ({ name: tt.name, note: tt.short_description, days: tt.duration_days, lead: tt.booking_lead_time, prices: (tt.prices || []).slice(0, 4).map(p => ({ name: p.name, note: p.short_description, price: p.price })) })),
    nextDates: dates.slice(0, 10), updated: s.updated_at };
});
writeFileSync("data/sgt-app.json", JSON.stringify({ syncedAt: T.syncedAt, source: T.source, tours, services }));
console.log("sgt-app.json: tour trong nước", tours.length, "· dịch vụ", services.length);
