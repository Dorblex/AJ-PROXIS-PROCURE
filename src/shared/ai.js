/* Calls to the Anthropic API for the app's two AI-assisted features.
   NOTE: fetch()es api.anthropic.com directly from the browser — this only works
   inside Claude.ai's artifact sandbox (which proxies it). Outside that sandbox,
   point these at your own backend endpoint instead. See README.md. */

/* Calls Claude to estimate a plausible current Ghanaian market price range for an item,
   given what a supplier has quoted. Used by both the Control Centre and Supplier portals'
   AI Market Price Intelligence tools. Throws on failure — callers should catch it. */
export async function fetchAiMarketPrice(itemName, category, supplierPrice) {
  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 500,
      messages: [{
        role: "user",
        content: `You are a market pricing analyst for the Ghanaian retail/wholesale B2B supply market. A supplier has quoted a price of GHS ${supplierPrice} for "${itemName}" (category: ${category}). Based on your general knowledge of typical current Ghanaian market prices for this kind of item, respond ONLY with a JSON object (no markdown, no preamble) in this exact shape: {"marketLow": number, "marketHigh": number, "suggestedPrice": number, "rationale": "one short sentence explaining the suggested price"}. All values in Ghana Cedis (GHS). "suggestedPrice" should be a fair, competitive catalogue price for AJ-PROXIS Procure, informed by both the supplier's quote and the estimated market range.`,
      }],
    }),
  });
  const data = await resp.json();
  const text = (data.content || []).map((b) => b.text || "").join("");
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

/* Groups catalogue products that share the exact same normalized name — the pattern that shows
   up when two different supplier submissions for the same real-world item both get approved as
   "new" catalogue entries. Deliberately exact-match only (not fuzzy), so genuinely distinct
   variants/grades that happen to share a base name (e.g. "...— Standard Grade" vs "...— Premium
   Grade") are never mistakenly flagged. */
export function findDuplicateGroups(products) {
  const byName = {};
  products.forEach((p) => {
    const key = p.name.trim().toLowerCase().replace(/\s+/g, " ");
    (byName[key] = byName[key] || []).push(p);
  });
  return Object.values(byName).filter((group) => group.length > 1);
}

/* Asks Claude to compare a group of duplicate catalogue entries and recommend which one to keep.
   Purely advisory — the Super Administrator still makes the final Delete/Edit decision. */
export async function fetchAiDuplicateAdvice(items) {
  const listing = items.map((p, i) => `${i + 1}. SKU ${p.sku} — price GHS ${p.price}, corporate GHS ${p.corpPrice}, bulk GHS ${p.bulkPrice}, brand ${p.brand || "n/a"}`).join("\n");
  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 400,
      messages: [{
        role: "user",
        content: `You are helping a Ghanaian B2B procurement platform clean up duplicate catalogue entries. These ${items.length} catalogue items all have the exact same name ("${items[0].name}") and are very likely duplicates of one entry:\n${listing}\nRespond ONLY with a JSON object (no markdown, no preamble) in this exact shape: {"keepSku": "the SKU you recommend keeping", "rationale": "one short sentence explaining why, e.g. based on more competitive pricing or completeness"}.`,
      }],
    }),
  });
  const data = await resp.json();
  const text = (data.content || []).map((b) => b.text || "").join("");
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}
