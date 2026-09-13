import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Btn } from "../../atoms/Btn.jsx";
import { SectionTitle } from "../../atoms/SectionTitle.jsx";
import { TextInput } from "../../atoms/TextInput.jsx";
import { Select } from "../../atoms/Select.jsx";
import { C } from "../../shared/tokens.js";
import { CATEGORIES } from "../../data/seed.js";
import { useStore } from "../../store/StoreContext.js";
import { ProductCard } from "./ProductCard.jsx";

export function Catalogue() {
  const { state, dispatch } = useStore();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [visible, setVisible] = useState(40);
  const filtered = state.products.filter((p) =>
    (cat === "all" || p.category === cat) && (p.name.toLowerCase().includes(q.toLowerCase()) || p.brand.toLowerCase().includes(q.toLowerCase()))
  );
  useEffect(() => { setVisible(40); }, [q, cat]);
  const shown = filtered.slice(0, visible);
  return (
    <div>
      <SectionTitle sub={`Search ${state.products.length}+ approved items across every category — one account, everything you need.`}>Catalogue</SectionTitle>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2" color={C.slate} />
          <TextInput className="pl-8" placeholder='Try "office chair" or "A4 paper"' value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={cat} onChange={(e) => setCat(e.target.value)} className="sm:w-56">
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
        </Select>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-5">
        {CATEGORIES.map((c) => (
          <button key={c.key} onClick={() => setCat(c.key === cat ? "all" : c.key)}
            className="text-xs px-2.5 py-1 rounded border"
            style={{ borderColor: cat === c.key ? C.brand : C.border, color: cat === c.key ? C.brand : C.inkSoft, backgroundColor: cat === c.key ? C.brandTint : "transparent" }}>
            {c.label}
          </button>
        ))}
      </div>
      <div className="text-xs mb-3" style={{ color: C.slate }}>Showing {shown.length} of {filtered.length} items</div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {shown.map((p) => <ProductCard key={p.id} p={p} onAdd={(prod, qty) => dispatch({ type: "ADD_TO_CART", product: prod, qty })} />)}
      </div>
      {visible < filtered.length && (
        <div className="text-center mt-5">
          <Btn variant="ghost" onClick={() => setVisible((v) => v + 40)}>Load More ({filtered.length - visible} remaining)</Btn>
        </div>
      )}
      {filtered.length === 0 && <div className="text-center py-14 text-sm" style={{ color: C.slate }}>No items match — try Request a Quote or Source For Me instead.</div>}
    </div>
  );
}

