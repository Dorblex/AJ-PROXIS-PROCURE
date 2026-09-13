import { useState } from "react";
import { FileText, Download } from "lucide-react";
import { Card } from "../../atoms/Card.jsx";
import { SectionTitle } from "../../atoms/SectionTitle.jsx";
import { Table } from "../../molecules/Table.jsx";
import { DocumentPreview } from "../../molecules/DocumentPreview.jsx";
import { C } from "../../shared/tokens.js";
import { pad } from "../../shared/helpers.js";
import { useStore } from "../../store/StoreContext.js";

export function AdminDocuments() {
  const { state } = useStore();
  const [preview, setPreview] = useState(null);
  return (
    <div>
      <SectionTitle sub="Auto-generated documents across the whole platform — preview, print, download, or email any of them.">Documents</SectionTitle>
      <Card pad={false}>
        <Table columns={[
          { key: "id", label: "Document No." }, { key: "kind", label: "Type" }, { key: "orderId", label: "Order" },
          { key: "a", label: "", render: (r) => <button onClick={() => setPreview(r)} className="text-xs flex items-center gap-1" style={{ color: C.brand }}><FileText size={13} /> Preview / Print / Download / Email</button> },
        ]} rows={state.documents} />
      </Card>
      {preview && <DocumentPreview doc={preview} onClose={() => setPreview(null)} />}
    </div>
  );
}

