import { C } from "../shared/tokens.js";
import { Card } from "./Card.jsx";

export function Stat({ label, value, icon: Icon, tint = C.brandTint, fg = C.brandDark }) {
  return (
    <Card className="flex items-center gap-3">
      <div className="h-9 w-9 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: tint }}>
        <Icon size={17} color={fg} />
      </div>
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-wide" style={{ color: C.slate }}>{label}</div>
        <div className="text-lg font-semibold truncate" style={{ fontFamily: "'Space Grotesk', sans-serif", color: C.ink }}>{value}</div>
      </div>
    </Card>
  );
}
