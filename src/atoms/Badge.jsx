import { C } from "../shared/tokens.js";

export function Badge({ children, tone = "slate" }) {
  const tones = {
    slate: { bg: "#EEF0EC", fg: C.slate },
    green: { bg: C.greenTint, fg: C.green },
    amber: { bg: C.amberTint, fg: C.amber },
    red: { bg: C.redTint, fg: C.red },
    brand: { bg: C.brandTint, fg: C.brandDark },
  };
  const t = tones[tone];
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium" style={{ backgroundColor: t.bg, color: t.fg }}>
      {children}
    </span>
  );
}

/* Maps a free-text status string (e.g. "Pending Review", "Delivered") to the Badge tone
   that best conveys it — used all over the app anywhere a status column is rendered. */
export function statusTone(status = "") {
  const s = status.toLowerCase();
  if (s.includes("awaiting") || s.includes("pending") || s.includes("review") || s.includes("processing") || s.includes("sourcing")) return "amber";
  if (s.includes("delivered") || s.includes("approved") || s.includes("paid") || s.includes("active")) return "green";
  if (s.includes("reject") || s.includes("cancel") || s.includes("low stock")) return "red";
  return "slate";
}
