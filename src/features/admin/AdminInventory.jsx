import { useState } from "react";
import { Search } from "lucide-react";
import { Card } from "../../atoms/Card.jsx";
import { SectionTitle } from "../../atoms/SectionTitle.jsx";
import { TextInput } from "../../atoms/TextInput.jsx";
import { Table } from "../../molecules/Table.jsx";
import { C } from "../../shared/tokens.js";
import { pad } from "../../shared/helpers.js";
import { WAREHOUSES } from "../../data/seed.js";
import { useStore } from "../../store/StoreContext.js";
import { Catalogue } from "../customer/Catalogue.jsx";

export function AdminInventory() {
  const { state } = useStore();
  const [q, setQ] = useState("");
  const rows = state.products.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <SectionTitle sub="Stock across every warehouse, with low-stock alerts. To add items or change prices, use Catalogue Management.">Inventory & Warehouses</SectionTitle>
      <TextInput className="max-w-xs mb-3" placeholder="Search SKU or product" value={q} onChange={(e) => setQ(e.target.value)} />
      <Card pad={false}>
        <Table columns={[
          { key: "sku", label: "SKU" }, { key: "name", label: "Product" },
          ...WAREHOUSES.map((w) => ({ key: w, label: w, render: (r) => {
            const low = r.stock[w] < r.reorderLevel;
            return <span style={{ color: low ? C.red : C.ink, fontWeight: low ? 600 : 400 }}>{r.stock[w]}{low && " ⚠"}</span>;
          }})),
        ]} rows={rows.slice(0, 30)} />
      </Card>
    </div>
  );
}

