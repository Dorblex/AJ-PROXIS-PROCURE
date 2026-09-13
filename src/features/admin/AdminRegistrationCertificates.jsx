import { useState } from "react";
import { CheckCircle2, BadgeCheck, ShieldCheck } from "lucide-react";
import { Btn } from "../../atoms/Btn.jsx";
import { Card } from "../../atoms/Card.jsx";
import { SectionTitle } from "../../atoms/SectionTitle.jsx";
import { Badge } from "../../atoms/Badge.jsx";
import { TextInput } from "../../atoms/TextInput.jsx";
import { Modal } from "../../molecules/Modal.jsx";
import { Table } from "../../molecules/Table.jsx";
import { C } from "../../shared/tokens.js";
import { GHS, isCertExpired, isCertExpiringSoon, pad } from "../../shared/helpers.js";
import { useStaff, useStore } from "../../store/StoreContext.js";
import { CertificateModal } from "../customer/CertificateModal.jsx";

export function AdminRegistrationCertificates() {
  const { state, dispatch } = useStore();
  const me = useStaff();
  const [feeInput, setFeeInput] = useState(state.registrationFee);
  const [viewCert, setViewCert] = useState(null);
  const [grantTarget, setGrantTarget] = useState(null);

  function saveFee() {
    dispatch({ type: "SET_REGISTRATION_FEE", fee: Number(feeInput) });
  }
  function confirmGrant() {
    if (!grantTarget) return;
    dispatch({ type: "GRANT_ACCESS_MANUAL", customerId: grantTarget.id, grantedBy: me.name });
    setGrantTarget(null);
  }

  const rows = state.customers.filter((c) => c.certificateId);
  const expiredCount = rows.filter((c) => isCertExpired(c)).length;

  return (
    <div>
      <SectionTitle sub="Every customer's registration certificate is subject to yearly renewal. Set the renewal fee, monitor expiry, and manually grant access when needed.">Registration Certificates</SectionTitle>

      {me.isSuperAdmin ? (
        <Card className="mb-6 max-w-sm">
          <div className="text-sm font-medium mb-2">Annual Renewal Fee</div>
          <div className="flex gap-2">
            <TextInput type="number" value={feeInput} onChange={(e) => setFeeInput(e.target.value)} />
            <Btn onClick={saveFee}>Save</Btn>
          </div>
          <p className="text-xs mt-2" style={{ color: C.slate }}>Currently {GHS(state.registrationFee)} per year, charged to customers on renewal.</p>
        </Card>
      ) : (
        <Card className="mb-4 flex items-center gap-2" style={{ backgroundColor: C.amberTint }}>
          <ShieldCheck size={15} color={C.brandDark} />
          <span className="text-sm">You're signed in as {me.name} ({me.role}). Only the Super Administrator can change the renewal fee or grant access manually.</span>
        </Card>
      )}

      <div className="text-sm font-medium mb-2">Customer Certificates {expiredCount > 0 && <Badge tone="red">{expiredCount} expired</Badge>}</div>
      <Card pad={false}>
        <Table columns={[
          { key: "name", label: "Organization" },
          { key: "certificateId", label: "Certificate No." },
          { key: "certificateExpiresAt", label: "Valid Until" },
          { key: "status", label: "Status", render: (c) => {
            const expired = isCertExpired(c);
            const soon = isCertExpiringSoon(c);
            return <Badge tone={expired ? "red" : soon ? "amber" : "green"}>{expired ? "Expired — On Hold" : soon ? "Expiring Soon" : "Active"}</Badge>;
          } },
          { key: "a", label: "", render: (c) => (
            <div className="flex flex-wrap gap-2">
              <Btn size="sm" variant="ghost" icon={BadgeCheck} onClick={() => setViewCert(c)}>View Certificate</Btn>
              {isCertExpired(c) && me.isSuperAdmin && <Btn size="sm" icon={CheckCircle2} onClick={() => setGrantTarget(c)}>Grant Access</Btn>}
            </div>
          ) },
        ]} rows={rows} empty="No customer certificates issued yet." />
      </Card>

      {viewCert && <CertificateModal customer={viewCert} onClose={() => setViewCert(null)} />}

      {grantTarget && (
        <Modal title={`Grant Access — ${grantTarget.name}`} onClose={() => setGrantTarget(null)}>
          <p className="text-sm mb-4" style={{ color: C.inkSoft }}>This restores {grantTarget.name}'s access immediately without charging the renewal fee, and extends their certificate by one year from today. Use this for exceptions or goodwill access.</p>
          <Btn icon={CheckCircle2} onClick={confirmGrant}>Confirm — Grant Access</Btn>
        </Modal>
      )}
    </div>
  );
}

