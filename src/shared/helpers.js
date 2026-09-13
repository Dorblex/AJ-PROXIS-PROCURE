/* General-purpose, portal-agnostic helper functions: currency formatting, tax math,
   delivery estimation, registration-certificate date math, and payment-form validation. */

export const GHS = (n) =>
  "GHS " + Number(n || 0).toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const pad = (n, len = 6) => String(n).padStart(len, "0");

export function taxBreakdown(subtotal, discount = 0, delivery = 0) {
  const base = Math.max(subtotal - discount, 0);
  const nhil = base * 0.025;
  const getfund = base * 0.025;
  const vatBase = base + nhil + getfund;
  const vat = vatBase * 0.125;
  const grand = vatBase + vat + delivery;
  return { base, nhil, getfund, vat, delivery, grand };
}

/* Delivery fee is auto-estimated from the destination address text — matched against known
   Ghanaian city/region zones and priced by approximate road distance from the Accra hub. */
const DELIVERY_ZONES = [
  { match: ["accra", "tema", "spintex", "airport", "east legon", "achimota", "madina", "adenta", "ashaiman", "kasoa", "dansoman", "labadi", "osu", "cantonments"], km: 12, lat: 5.6037, lon: -0.1870 },
  { match: ["koforidua", "eastern region", "akosombo", "nkawkaw"], km: 90, lat: 6.0941, lon: -0.2591 },
  { match: ["cape coast", "central region", "elmina", "winneba"], km: 150, lat: 5.1054, lon: -1.2466 },
  { match: ["ho", "volta", "hohoe"], km: 170, lat: 6.6108, lon: 0.4708 },
  { match: ["kumasi", "ashanti"], km: 250, lat: 6.6885, lon: -1.6244 },
  { match: ["takoradi", "sekondi", "western region"], km: 230, lat: 4.8845, lon: -1.7554 },
  { match: ["sunyani", "bono", "techiman"], km: 380, lat: 7.3399, lon: -2.3268 },
  { match: ["tamale", "northern region", "yendi"], km: 600, lat: 9.4034, lon: -0.8424 },
  { match: ["wa", "upper west"], km: 700, lat: 10.0601, lon: -2.5099 },
  { match: ["bolgatanga", "upper east", "bawku"], km: 750, lat: 10.7856, lon: -0.8514 },
];
const ACCRA_HQ = { lat: 5.6037, lon: -0.1870 };
export function estimateDeliveryFee(address) {
  const a = (address || "").toLowerCase();
  let km = 100; // default assumption when the address doesn't match a known zone
  for (const zone of DELIVERY_ZONES) {
    if (zone.match.some((m) => a.includes(m))) { km = zone.km; break; }
  }
  const fee = Math.max(30, Math.min(650, Math.round(25 + km * 0.55)));
  return { km, fee };
}
/* Estimated delivery turnaround, scaled by distance from the Accra hub. */
export function estimateDeliveryDays(km) {
  let minDays, maxDays;
  if (km <= 50) { minDays = 1; maxDays = 2; }
  else if (km <= 150) { minDays = 2; maxDays = 3; }
  else if (km <= 300) { minDays = 3; maxDays = 5; }
  else if (km <= 500) { minDays = 5; maxDays = 7; }
  else { minDays = 7; maxDays = 10; }
  const label = minDays === maxDays ? `${minDays} business day${minDays > 1 ? "s" : ""}` : `${minDays}–${maxDays} business days`;
  return { minDays, maxDays, label };
}
/* Best-guess coordinates for a typed address, used to center the delivery map when no GPS pin is set. */
export function guessCoords(address) {
  const a = (address || "").toLowerCase();
  for (const zone of DELIVERY_ZONES) {
    if (zone.match.some((m) => a.includes(m))) return { lat: zone.lat, lon: zone.lon };
  }
  return ACCRA_HQ;
}

export function daysUntil(dateStr) {
  if (!dateStr) return null;
  const ms = new Date(dateStr + "T00:00:00").getTime() - new Date(new Date().toDateString()).getTime();
  return Math.round(ms / 86400000);
}
export function isCertExpired(customer) {
  const d = daysUntil(customer.certificateExpiresAt);
  return d !== null && d < 0;
}
export function isCertExpiringSoon(customer) {
  const d = daysUntil(customer.certificateExpiresAt);
  return d !== null && d >= 0 && d <= 30;
}
export function addOneYear(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
}
/* Full date + time stamp (e.g. "2026-09-11 14:32") — used for anything a customer submits,
   so every request carries exactly when it was made, not just the day. */
export function nowStamp() {
  const d = new Date();
  const pad2 = (n) => String(n).padStart(2, "0");
  const date = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  const time = `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  return `${date} ${time}`;
}

export function priceFor(product, qty, org) {
  if (org?.tier === "contract" && product.contractPrice) return product.contractPrice;
  if (qty >= product.bulkQty) return product.bulkPrice;
  if (org?.tier === "corporate") return product.corpPrice;
  return product.price;
}
export function deliveredLabel(done, ordered) {
  if (done >= ordered) return "Yes";
  if (done > 0) return `Partial (${done}/${ordered})`;
  return "No";
}

export function canSubmitPayment(method, values, walletBalance, amount) {
  if (method === "mobile") return (values.momoNumber || "").trim().length >= 9;
  if (method === "card") return (values.cardNumber || "").replace(/\s/g, "").length >= 12 && (values.cardExpiry || "").trim().length >= 4 && (values.cardCvv || "").trim().length >= 3;
  if (method === "bank") return true;
  if (method === "wallet") return (walletBalance || 0) >= amount;
  if (method === "credit") return !!values.creditAgree;
  return false;
}

export function seededRandom(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) { h = (h * 31 + seed.charCodeAt(i)) >>> 0; }
  return function () {
    h = (h * 1664525 + 1013904223) >>> 0;
    return h / 4294967296;
  };
}

export function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

/* Builds the exact text a real QR scanner will show when it decodes this ticket's
   code. Since there's no live backend to look this ticket up by ID, the attendee's
   details are embedded directly in the QR data — any standard QR reader app, with
   zero backend or internet connection required, will display them immediately. */
export function buildTicketQrPayload(ticket) {
  const trunc = (s, n) => (s && s.length > n ? s.slice(0, n - 1) + "…" : s || "");
  const lines = [
    `ID: ${ticket.id}`,
    `Event: ${trunc(ticket.event.title, 20)}`,
    `Date: ${ticket.event.date}`,
    `Name: ${trunc(ticket.name, 16)}`,
    `Cat: ${trunc(ticket.priceCategory, 14)}`,
    `Paid: GHS${ticket.amountPaid} ${trunc(ticket.paymentMethod, 10)}`,
  ];
  let payload = lines.join("\n");
  // Hard safety net: guarantee this always fits within the QR encoder's version-6
  // byte-mode capacity (132 bytes), even in edge cases with unusually long, multi-byte input.
  while (new TextEncoder().encode(payload).length > 130 && payload.includes("\n")) {
    payload = payload.slice(0, payload.lastIndexOf("\n"));
  }
  return payload;
}
