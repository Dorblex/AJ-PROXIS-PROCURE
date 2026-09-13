import { C } from "../shared/tokens.js";

export function Card({ children, className = "", pad: p = true, style }) {
  return (
    <div className={`rounded border ${p ? "p-4" : ""} ${className}`} style={{ borderColor: C.border, backgroundColor: C.panel, ...style }}>
      {children}
    </div>
  );
}
