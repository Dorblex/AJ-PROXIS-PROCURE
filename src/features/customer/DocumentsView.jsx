import { useState } from "react";
import { FileText, Download, Receipt } from "lucide-react";
import { Card } from "../../atoms/Card.jsx";
import { SectionTitle } from "../../atoms/SectionTitle.jsx";
import { Table } from "../../molecules/Table.jsx";
import { DocumentPreview } from "../../molecules/DocumentPreview.jsx";
import { C } from "../../shared/tokens.js";
import { pad } from "../../shared/helpers.js";
import { useStore } from "../../store/StoreContext.js";

export function DocumentsView() {
  const { state } = useStore();
  const kinds = ["All", "Purchase Order", "Invoice", "Receipt", "Delivery Note"];
  const [f, setF] = useState("All");
  const [preview, setPreview] = useState(null);
  const rows = state.documents.filter((d) => f === "All" || d.kind === f);
  return (
    <div>
      <SectionTitle sub="Every quotation, PO, invoice, receipt and delivery note is generated automatically — preview, print, download, or email any of them.">Documents</SectionTitle>
      <div className="flex gap-1.5 mb-3">
        {kinds.map((k) => (
          <button key={k} onClick={() => setF(k)} className="text-xs px-2.5 py-1 rounded border" style={{ borderColor: f === k ? C.brand : C.border, backgroundColor: f === k ? C.brandTint : "transparent" }}>{k}</button>
        ))}
      </div>
      <Card pad={false}>
        <Table columns={[
          { key: "id", label: "Document No." }, { key: "kind", label: "Type" }, { key: "orderId", label: "Order" },
          { key: "dl", label: "", render: (r) => <button onClick={() => setPreview(r)} className="text-xs flex items-center gap-1" style={{ color: C.brand }}><FileText size={13} /> Preview / Print / Download / Email</button> },
        ]} rows={rows} />
      </Card>
      {preview && <DocumentPreview doc={preview} onClose={() => setPreview(null)} />}
    </div>
  );
}

