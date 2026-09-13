import { useState } from "react";
import { CheckCircle2, Printer, Download, Mail } from "lucide-react";
import { C } from "../shared/tokens.js";
import { buildVendorCertificateHtml } from "../shared/documents.js";
import { LOGO_FULL, LOGO_ICON } from "../shared/brandAssets.js";
import { useStore } from "../store/StoreContext.js";
import { Btn } from "../atoms/Btn.jsx";
import { TextInput } from "../atoms/TextInput.jsx";
import { Modal } from "./Modal.jsx";

export function VendorCertificateModal({ supplier, onClose }) {
  const { state, dispatch } = useStore();
  const ceo = state.staff.find((s) => s.isSuperAdmin) || state.staff[0];
  const [emailTo, setEmailTo] = useState(supplier.email || "");
  const [sent, setSent] = useState(false);

  function handleDownload() {
    const html = buildVendorCertificateHtml(supplier, ceo.name);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `AJ-PROXIS-Vendor-Certificate-${supplier.vendorCertificateId}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    dispatch({ type: "LOG_DOCUMENT_DOWNLOAD", docId: supplier.vendorCertificateId, kind: "Vendor Certificate" });
  }
  function handleEmail() {
    if (!emailTo.trim()) return;
    dispatch({ type: "EMAIL_DOCUMENT", docId: supplier.vendorCertificateId, kind: "Vendor Certificate", to: emailTo.trim() });
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  }

  const TRI_STRIPE = `linear-gradient(90deg, ${C.amber} 0%, ${C.amber} 33%, ${C.brand} 33%, ${C.brand} 66%, ${C.red} 66%, ${C.red} 100%)`;

  return (
    <Modal title="Vendor Certificate" onClose={onClose} wide>
      <div className="printable-doc rounded overflow-hidden" style={{ backgroundColor: C.brandDark, padding: "8px" }}>
        <div style={{ height: "8px", background: TRI_STRIPE, borderRadius: "3px 3px 0 0" }} />
        <div
          className="text-center p-8 relative overflow-hidden"
          style={{
            fontFamily: "Georgia, serif",
            border: `2px solid ${C.brand}`,
            borderTop: "none",
            borderBottom: "none",
            background: `radial-gradient(circle at 50% 0%, ${C.amberTint} 0%, ${C.brandTint} 45%, ${C.redTint} 100%)`,
          }}
        >
          <img src={LOGO_ICON} alt="" className="absolute pointer-events-none" style={{ top: "50%", left: "50%", transform: "translate(-50%,-50%)", height: "260px", opacity: 0.07 }} />
          <div className="relative">
            <img src={LOGO_FULL} alt="AJ-PROXIS Solutions" className="h-10 mx-auto mb-3 rounded" style={{ backgroundColor: "#fff", padding: "8px 14px" }} />
            <div className="text-[10px] tracking-widest uppercase mb-1" style={{ color: C.slate }}>AJ-PROXIS Procure</div>
            <h2 className="text-xl mb-1 tracking-wide" style={{ color: C.brandDark }}>VENDOR CERTIFICATE</h2>
            <div className="w-28 mx-auto my-3" style={{ height: "4px", background: TRI_STRIPE }} />
            <p className="text-sm">This is to certify that</p>
            <div className="text-lg font-semibold my-2" style={{ color: C.brand }}>{supplier.name}</div>
            <p className="text-xs max-w-md mx-auto mb-4" style={{ color: C.inkSoft }}>is a duly registered and approved vendor of <b>AJ-PROXIS SOLUTIONS</b>, authorized to supply goods and services through the AJ-PROXIS Procure platform.</p>
            <table className="mx-auto text-xs mb-4 text-left rounded" style={{ backgroundColor: "rgba(255,255,255,0.65)", padding: "10px 16px" }}>
              <tbody>
                <tr><td className="pr-4 py-0.5" style={{ color: C.slate }}>Certificate No.</td><td className="py-0.5 font-semibold">{supplier.vendorCertificateId}</td></tr>
                <tr><td className="pr-4 py-0.5" style={{ color: C.slate }}>Supply Categories</td><td className="py-0.5">{(supplier.categories || []).join(", ")}</td></tr>
                <tr><td className="pr-4 py-0.5" style={{ color: C.slate }}>Location</td><td className="py-0.5">{supplier.location}</td></tr>
                <tr><td className="pr-4 py-0.5" style={{ color: C.slate }}>Date Issued</td><td className="py-0.5 font-semibold">{supplier.vendorCertificateIssuedAt}</td></tr>
                <tr><td className="pr-4 py-0.5" style={{ color: C.slate }}>Status</td><td className="py-0.5 font-semibold" style={{ color: C.green }}>APPROVED VENDOR</td></tr>
              </tbody>
            </table>
            <div className="flex justify-center mt-6">
              <div className="text-center">
                <div className="text-2xl" style={{ fontFamily: "'Brush Script MT', cursive", color: C.brandDark }}>{ceo.name}</div>
                <div className="w-40 border-t mx-auto my-1" style={{ borderColor: C.ink }} />
                <div className="text-xs font-semibold">{ceo.name}</div>
                <div className="text-[10px]" style={{ color: C.slate }}>Chief Executive Officer, AJ-PROXIS SOLUTIONS</div>
              </div>
            </div>
            <p className="text-[9px] mt-5" style={{ color: C.slate }}>This certificate confirms this vendor's approved status on the AJ-PROXIS Procure platform as of the date of issue.</p>
          </div>
        </div>
        <div style={{ height: "8px", background: TRI_STRIPE, borderRadius: "0 0 3px 3px" }} />
      </div>

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
