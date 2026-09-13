import { useState } from "react";
import { Package, Plus, Minus } from "lucide-react";
import { Btn } from "../../atoms/Btn.jsx";
import { Card } from "../../atoms/Card.jsx";
import { C } from "../../shared/tokens.js";
import { GHS, priceFor } from "../../shared/helpers.js";
import { CATEGORIES } from "../../data/seed.js";
import { useCustomer } from "../../store/StoreContext.js";

export function ProductCard({ p, onAdd }) {
  const [qty, setQty] = useState(1);
  const customer = useCustomer();
  const Icon = CATEGORIES.find((c) => c.key === p.category)?.icon || Package;
  return (
    <Card className="flex flex-col">
      <div className="h-20 rounded flex items-center justify-center mb-3" style={{ backgroundColor: C.brandTint }}>
        <Icon size={26} color={C.brand} />
      </div>
      <div className="text-[11px]" style={{ color: C.slate }}>{p.sku} · {p.brand}</div>
      <div className="text-sm font-medium mt-0.5 leading-snug">{p.name}</div>
      <div className="text-xs mt-1" style={{ color: C.slate }}>Unit: {p.unit} · Bulk {p.bulkQty}+ @ {GHS(p.bulkPrice)}</div>
      <div className="mt-2 font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: C.ink }}>{GHS(priceFor(p, qty, customer))}</div>
      <div className="mt-3 flex items-center gap-2">
        <div className="flex items-center border rounded" style={{ borderColor: C.border }}>
          <button className="px-2 py-1" onClick={() => setQty((q) => Math.max(1, q - 1))}><Minus size={13} /></button>
          <span className="px-2 text-sm w-8 text-center">{qty}</span>
          <button className="px-2 py-1" onClick={() => setQty((q) => q + 1)}><Plus size={13} /></button>
        </div>
        <Btn size="sm" full onClick={() => onAdd(p, qty)}>Add to Cart</Btn>
      </div>
    </Card>
  );
}

