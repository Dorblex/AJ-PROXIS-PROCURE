import { C } from "../shared/tokens.js";

/* Simple label/value line — used for order summaries, totals, and read-only detail views
   throughout the customer, admin, and company pages. */
export function Row({ l, v, bold }) {
  return (
    <div className="flex justify-between text-sm py-0.5" style={{ fontWeight: bold ? 700 : 400 }}>
      <span style={{ color: bold ? C.ink : C.slate }}>{l}</span><span>{v}</span>
    </div>
  );
}
