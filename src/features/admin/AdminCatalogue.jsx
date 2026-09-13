import { useState } from "react";
import { Search, Plus, Upload } from "lucide-react";
import { Btn } from "../../atoms/Btn.jsx";
import { Card } from "../../atoms/Card.jsx";
import { SectionTitle } from "../../atoms/SectionTitle.jsx";
import { TextInput } from "../../atoms/TextInput.jsx";
import { TextArea } from "../../atoms/TextArea.jsx";
import { Modal } from "../../molecules/Modal.jsx";
import { Table } from "../../molecules/Table.jsx";
import { C } from "../../shared/tokens.js";
import { GHS, pad } from "../../shared/helpers.js";
import { CATEGORIES } from "../../data/seed.js";
import { useStore } from "../../store/StoreContext.js";
import { Catalogue } from "../customer/Catalogue.jsx";
import { AddProductModal } from "./AddProductModal.jsx";
import { EditProductModal } from "./EditProductModal.jsx";

export function AdminCatalogue() {
  const { state, dispatch } = useStore();
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [bulkText, setBulkText] = useState("SKU,Name,Category,Brand,Unit,Price,CorpPrice,BulkQty,BulkPrice\n,Laminating Pouches A4 (pack),office,Generic,pack,45,40,20,36");

  const rows = state.products.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()) || p.sku.toLowerCase().includes(q.toLowerCase()));

  function submitBulk() {
    const lines = bulkText.trim().split("\n").slice(1);
    const items = lines.map((l) => {
      const [sku, name, category, brand, unit, price, corpPrice, bulkQty, bulkPrice] = l.split(",").map((s) => (s || "").trim());
      return { sku, name, category: category || "office", brand, unit, price: Number(price) || 0, corpPrice: Number(corpPrice) || 0, bulkQty: Number(bulkQty) || 10, bulkPrice: Number(bulkPrice) || 0 };
    }).filter((i) => i.name);
    if (!items.length) return;
    dispatch({ type: "BULK_ADD_PRODUCTS", items });
    setShowBulk(false);
  }

  return (
    <div>
      <SectionTitle sub="Only AJ-PROXIS Control Centre can add items, upload catalogues, or change prices. Customers and suppliers see this catalogue read-only.">Catalogue Management</SectionTitle>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <TextInput className="max-w-xs" placeholder="Search SKU or product" value={q} onChange={(e) => setQ(e.target.value)} />
        <Btn size="sm" icon={Plus} onClick={() => setShowAdd(true)}>Add New Item</Btn>
        <Btn size="sm" variant="ghost" icon={Upload} onClick={() => setShowBulk(true)}>Bulk Upload</Btn>
        <span className="text-xs ml-auto" style={{ color: C.slate }}>{state.products.length} items in catalogue</span>
      </div>
      <Card pad={false}>
        <Table columns={[
          { key: "sku", label: "SKU" },
          { key: "name", label: "Product" },
          { key: "category", label: "Category", render: (r) => CATEGORIES.find((c) => c.key === r.category)?.label || r.category },
          { key: "price", label: "Standard", render: (r) => GHS(r.price) },
          { key: "corpPrice", label: "Corporate", render: (r) => GHS(r.corpPrice) },
          { key: "bulk", label: "Bulk", render: (r) => `${GHS(r.bulkPrice)} @ ${r.bulkQty}+` },
          { key: "a", label: "", render: (r) => <Btn size="sm" variant="ghost" onClick={() => setEditing(r)}>Edit Price / Details</Btn> },
        ]} rows={rows.slice(0, 60)} />
      </Card>
      {rows.length > 60 && <div className="text-xs mt-2" style={{ color: C.slate }}>Showing 60 of {rows.length} matching items — refine your search to narrow the list.</div>}
      {editing && <EditProductModal product={editing} onClose={() => setEditing(null)} />}
      {showAdd && <AddProductModal onClose={() => setShowAdd(false)} />}
      {showBulk && (
        <Modal title="Bulk Upload Catalogue Items" onClose={() => setShowBulk(false)}>
          <p className="text-sm mb-2" style={{ color: C.slate }}>Paste CSV: SKU, Name, Category, Brand, Unit, Price, CorpPrice, BulkQty, BulkPrice — leave SKU blank to auto-generate.</p>
          <TextArea rows={6} value={bulkText} onChange={(e) => setBulkText(e.target.value)} />
          <Btn className="mt-3" icon={Upload} onClick={submitBulk}>Upload Items</Btn>
        </Modal>
      )}
    </div>
  );
}

