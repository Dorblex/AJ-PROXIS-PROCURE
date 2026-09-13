import { C } from "../shared/tokens.js";

export function SectionTitle({ children, sub }) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: C.ink }}>{children}</h2>
      {sub && <p className="text-sm mt-0.5" style={{ color: C.slate }}>{sub}</p>}
    </div>
  );
}
