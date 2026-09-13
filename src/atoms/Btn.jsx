import { C } from "../shared/tokens.js";

export function Btn({ children, onClick, variant = "primary", size = "md", icon: Icon, disabled, type = "button", full }) {
  const base = "inline-flex items-center justify-center gap-2 rounded font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed";
  const sizes = { sm: "text-xs px-2.5 py-1.5", md: "text-sm px-3.5 py-2", lg: "text-sm px-5 py-2.5" };
  const styles = {
    primary: { backgroundColor: C.brand, color: "#fff" },
    amber: { backgroundColor: C.amber, color: "#fff" },
    ghost: { backgroundColor: "transparent", color: C.ink, border: `1px solid ${C.border}` },
    danger: { backgroundColor: C.red, color: "#fff" },
    subtle: { backgroundColor: C.brandTint, color: C.brandDark },
  };
  return (
    <button type={type} disabled={disabled} onClick={onClick} className={`${base} ${sizes[size]} ${full ? "w-full" : ""}`} style={styles[variant]}>
      {Icon && <Icon size={15} />}
      {children}
    </button>
  );
}
