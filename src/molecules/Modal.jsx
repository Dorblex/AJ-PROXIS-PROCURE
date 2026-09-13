import { X } from "lucide-react";
import { C } from "../shared/tokens.js";

export function Modal({ title, onClose, children, wide }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(19,34,38,0.5)" }}>
      <div className={`w-full ${wide ? "max-w-2xl" : "max-w-md"} max-h-[85vh] overflow-y-auto rounded-lg`} style={{ backgroundColor: C.panel }}>
        <div className="flex items-center justify-between px-5 py-4 border-b sticky top-0" style={{ borderColor: C.border, backgroundColor: C.panel }}>
          <h3 className="font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{title}</h3>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
