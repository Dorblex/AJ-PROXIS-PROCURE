import { useState } from "react";
import { CheckCircle2, Download, Printer, Mail } from "lucide-react";
import { Btn } from "../../atoms/Btn.jsx";
import { Card } from "../../atoms/Card.jsx";
import { Field } from "../../atoms/Field.jsx";
import { TextInput } from "../../atoms/TextInput.jsx";
import { Modal } from "../../molecules/Modal.jsx";
import { C } from "../../shared/tokens.js";
import { LOGO_FULL } from "../../shared/brandAssets.js";
import { buildSupplyAgreementClauses, buildSupplyAgreementHtml } from "../../shared/documents.js";
import { useCustomer, useStore } from "../../store/StoreContext.js";

export function SupplyAgreementModal({ contract, onClose }) {
  const { dispatch } = useStore();
  const customer = useCustomer();
  const clauses = buildSupplyAgreementClauses(contract, customer);
  const [agree, setAgree] = useState(false);
  const [signName, setSignName] = useState(customer.contact || "");
  const [emailTo, setEmailTo] = useState(customer.email || "");
  const [sent, setSent] = useState(false);
  const signed = contract.status === "Active";

  function handleSign() {
    if (!agree || !signName.trim()) return;
    dispatch({ type: "SIGN_CONTRACT", id: contract.id, signedBy: signName.trim() });
  }
  function handleDownload() {
    const html = buildSupplyAgreementHtml(contract, customer);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `AJ-PROXIS-Supply-Agreement-${contract.id}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    dispatch({ type: "LOG_DOCUMENT_DOWNLOAD", docId: contract.id, kind: "Supply Agreement" });
  }
  function handleEmail() {
    if (!emailTo.trim()) return;
    dispatch({ type: "EMAIL_DOCUMENT", docId: contract.id, kind: "Supply Agreement", to: emailTo.trim() });
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  }

  return (
    <Modal title={`Supply Agreement — ${contract.id}`} onClose={onClose} wide>
      <div className="printable-doc bg-white rounded border p-6 max-h-[55vh] overflow-y-auto" style={{ borderColor: C.border }}>
        <div className="flex items-start justify-between pb-4 mb-4 border-b" style={{ borderColor: C.border }}>
          <img src={LOGO_FULL} alt="AJ-PROXIS Solutions" className="h-12 w-auto" />
          <div className="text-right">
            <div className="font-semibold uppercase text-sm" style={{ color: C.brand }}>Supply Agreement</div>
            <div className="text-xs" style={{ color: C.slate }}>{contract.id}</div>
          </div>
        </div>
        <h2 className="text-base font-semibold mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>SUPPLY OF PRODUCTS AND SERVICES AGREEMENT</h2>
        <p className="text-xs mb-5" style={{ color: C.slate }}>Between AJ-PROXIS SOLUTIONS ("Supplier") and {customer.name} ("Customer") — covering {contract.product}, {contract.start} to {contract.end}.</p>
        <div className="space-y-4">
          {clauses.map((c) => (
            <div key={c.title}>
              <div className="text-sm font-semibold mb-1">{c.title}</div>
              <div className="text-xs leading-relaxed" style={{ color: "#333" }}>{c.body}</div>
            </div>
          ))}
        </div>
        <div className="grid sm:grid-cols-2 gap-4 mt-6 pt-4 border-t text-xs" style={{ borderColor: C.border }}>
          <div>
            <div className="font-semibold mb-2">For the Customer</div>
            <div>Name: {contract.signedBy || "—"}</div>
            <div>Organization: {customer.name}</div>
            <div>Date: {contract.signedAt || "—"}</div>
          </div>
          <div>
            <div className="font-semibold mb-2">For AJ-PROXIS SOLUTIONS</div>
            <div>Name: Kwaku Ansah</div>
            <div>Title: Super Administrator</div>
            <div>Date: {contract.signedAt || "—"}</div>
          </div>
        </div>
      </div>

      {signed ? (
        <Card className="mt-4 flex items-center gap-2" style={{ backgroundColor: C.greenTint }}>
          <CheckCircle2 size={16} color={C.green} />
          <span className="text-sm">Signed by {contract.signedBy} on {contract.signedAt}. This Agreement is active.</span>
        </Card>
      ) : (
        <Card className="mt-4" style={{ backgroundColor: C.amberTint }}>
          <div className="flex items-start gap-2 mb-3">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1" />
            <span className="text-sm">I have read and agree to the terms of this Supply Agreement on behalf of {customer.name}.</span>
          </div>
          <Field label="Full name (digital signature)"><TextInput value={signName} onChange={(e) => setSignName(e.target.value)} /></Field>
          <Btn className="mt-3" icon={CheckCircle2} disabled={!agree || !signName.trim()} onClick={handleSign}>I Agree & Sign</Btn>
        </Card>
      )}

      <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t" style={{ borderColor: C.border }}>
        <Btn size="sm" icon={Printer} onClick={() => window.print()}>Print</Btn>
        <Btn size="sm" variant="subtle" icon={Download} onClick={handleDownload}>Download</Btn>
        <TextInput className="w-56" placeholder="Recipient email" value={emailTo} onChange={(e) => setEmailTo(e.target.value)} />
        <Btn size="sm" variant="ghost" icon={Mail} onClick={handleEmail}>Email Document</Btn>
        {sent && <span className="text-xs flex items-center gap-1" style={{ color: C.green }}><CheckCircle2 size={13} /> Sent to {emailTo}</span>}
      </div>
    </Modal>
  );
}

