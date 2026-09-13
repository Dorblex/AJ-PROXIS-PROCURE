import { C } from "../shared/tokens.js";

export function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium mb-1" style={{ color: C.inkSoft }}>{label}</span>
      {children}
    </label>
  );
}
