import { useState } from "react";
import { Upload } from "lucide-react";
import { Btn } from "../../atoms/Btn.jsx";
import { Card } from "../../atoms/Card.jsx";
import { SectionTitle } from "../../atoms/SectionTitle.jsx";
import { Badge, statusTone } from "../../atoms/Badge.jsx";
import { Field } from "../../atoms/Field.jsx";
import { TextInput } from "../../atoms/TextInput.jsx";
import { Select } from "../../atoms/Select.jsx";
import { Table } from "../../molecules/Table.jsx";
import { C } from "../../shared/tokens.js";
import { pad } from "../../shared/helpers.js";
import { useCustomer, useStore } from "../../store/StoreContext.js";

export function ComplianceDocuments() {
  const { state, dispatch } = useStore();
  const customer = useCustomer();
  const [form, setForm] = useState({ docType: "Business Registration Certificate", fileName: "", expiryDate: "" });
  const docTypes = ["Business Registration Certificate", "Tax Clearance Certificate", "VAT Certificate", "Certificate of Incorporation", "Ghana Card / ID", "Other"];

  const myDocs = state.complianceDocs.filter((d) => d.customerId === customer.id);

  function submit() {
    if (!form.fileName.trim()) return;
    dispatch({ type: "UPLOAD_COMPLIANCE_DOC", customerId: customer.id, docType: form.docType, fileName: form.fileName, expiryDate: form.expiryDate });
    setForm({ docType: "Business Registration Certificate", fileName: "", expiryDate: "" });
  }

  return (
    <div>
      <SectionTitle sub="Upload compliance documents for AJ-PROXIS Control Centre to verify — used for institutional procurement approval and higher credit limits.">Compliance Documents</SectionTitle>
      <div className="grid lg:grid-cols-3 gap-4">
        <Card pad={false} className="lg:col-span-2">
          <Table columns={[
            { key: "docType", label: "Document" }, { key: "fileName", label: "File" }, { key: "expiryDate", label: "Expiry" },
            { key: "status", label: "Status", render: (r) => <Badge tone={statusTone(r.status)}>{r.status}</Badge> },
            { key: "note", label: "Control Centre Note", render: (r) => r.note || "—" },
          ]} rows={myDocs} empty="No compliance documents uploaded yet." />
        </Card>
        <Card>
          <div className="text-sm font-medium mb-2">Upload New Document</div>
          <div className="space-y-3">
            <Field label="Document type">
              <Select value={form.docType} onChange={(e) => setForm({ ...form, docType: e.target.value })}>
                {docTypes.map((t) => <option key={t}>{t}</option>)}
              </Select>
            </Field>
            <Field label="File name"><TextInput placeholder="e.g. business-cert-2026.pdf" value={form.fileName} onChange={(e) => setForm({ ...form, fileName: e.target.value })} /></Field>
            <Field label="Expiry date (if applicable)"><TextInput type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} /></Field>
            <Btn icon={Upload} onClick={submit}>Submit for Review</Btn>
            <p className="text-[11px]" style={{ color: C.slate }}>File upload is simulated in this prototype — enter a file name as a reference.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

