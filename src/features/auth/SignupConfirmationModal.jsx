import { CheckCircle2, Download, Printer } from "lucide-react";
import { Btn } from "../../atoms/Btn.jsx";
import { Card } from "../../atoms/Card.jsx";
import { Modal } from "../../molecules/Modal.jsx";
import { C } from "../../shared/tokens.js";
import { LOGO_FULL } from "../../shared/brandAssets.js";
import { buildSignupConfirmationEmailHtml } from "../../shared/documents.js";
import { log } from "../../store/reducer.js";
import { useStore } from "../../store/StoreContext.js";

export function SignupConfirmationModal({ form, orgId, onClose }) {
  const { dispatch } = useStore();
  function handleDownload() {
    const html = buildSignupConfirmationEmailHtml(form, orgId);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `AJ-PROXIS-Registration-Confirmation-${orgId}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    dispatch({ type: "LOG_DOCUMENT_DOWNLOAD", docId: orgId, kind: "Registration Confirmation Email" });
  }
  const today = new Date().toISOString().slice(0, 10);
  return (
    <Modal title="Confirmation Email Sent" onClose={onClose} wide>
      <Card className="mb-3 flex items-center gap-2" style={{ backgroundColor: C.greenTint }}>
        <CheckCircle2 size={16} color={C.green} />
        <span className="text-sm">An instant confirmation email was sent to <b>{form.email}</b> from AJ-PROXIS SOLUTIONS.</span>
      </Card>
      <div className="printable-doc bg-white rounded border p-6" style={{ borderColor: C.border }}>
        <img src={LOGO_FULL} alt="AJ-PROXIS Solutions" className="h-11 w-auto mb-4" />
        <div className="text-[10px] uppercase tracking-wide mb-1" style={{ color: C.slate }}>Registration Received</div>
        <h2 className="text-base font-semibold mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Welcome to AJ-PROXIS Procure, {form.orgName}!</h2>
        <p className="text-sm mb-2">Dear {form.contact || "Sir/Madam"},</p>
        <p className="text-sm mb-3">Thank you for registering <b>{form.orgName}</b> with AJ-PROXIS SOLUTIONS. We've received your organization's details and your registration reference is:</p>
        <div className="text-lg font-bold mb-3" style={{ color: C.brand, fontFamily: "'Space Grotesk', sans-serif" }}>{orgId}</div>
        <table className="w-full text-xs mb-4">
          <tbody>
            <tr><td className="py-1 pr-4" style={{ color: C.slate }}>Organization Type</td><td className="py-1">{form.orgType}</td></tr>
            <tr><td className="py-1 pr-4" style={{ color: C.slate }}>Contact Person</td><td className="py-1">{form.contact}</td></tr>
            <tr><td className="py-1 pr-4" style={{ color: C.slate }}>Email</td><td className="py-1">{form.email}</td></tr>
            <tr><td className="py-1 pr-4" style={{ color: C.slate }}>Phone</td><td className="py-1">{form.phone}</td></tr>
            <tr><td className="py-1 pr-4" style={{ color: C.slate }}>Delivery Address</td><td className="py-1">{form.deliveryAddress || "—"}</td></tr>
            <tr><td className="py-1 pr-4" style={{ color: C.slate }}>Date Submitted</td><td className="py-1">{today}</td></tr>
          </tbody>
        </table>
        <Card style={{ backgroundColor: C.amberTint }}>
          <span className="text-xs"><b>What happens next:</b> AJ-PROXIS Control Centre will review your registration. Once approved, you'll be able to log in and your account will be activated with a starter credit limit and procurement budget.</span>
        </Card>
        <div className="text-[10px] pt-3 mt-4 border-t" style={{ borderColor: C.border, color: C.slate }}>
          AJ-PROXIS SOLUTIONS · Office Essentials, Simplified · This is an automated message from AJ-PROXIS Procure.
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t" style={{ borderColor: C.border }}>
        <Btn size="sm" icon={Printer} onClick={() => window.print()}>Print</Btn>
        <Btn size="sm" variant="subtle" icon={Download} onClick={handleDownload}>Download</Btn>
        <Btn size="sm" variant="ghost" onClick={onClose}>Continue to Sign In</Btn>
      </div>
    </Modal>
  );
}

