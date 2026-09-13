import { useState } from "react";
import { AlertTriangle, Clock, BadgeCheck } from "lucide-react";
import { Btn } from "../../atoms/Btn.jsx";
import { Card } from "../../atoms/Card.jsx";
import { SectionTitle } from "../../atoms/SectionTitle.jsx";
import { Badge } from "../../atoms/Badge.jsx";
import { Row } from "../../molecules/Row.jsx";
import { C } from "../../shared/tokens.js";
import { GHS, daysUntil, isCertExpired, isCertExpiringSoon } from "../../shared/helpers.js";
import { useCustomer, useStore } from "../../store/StoreContext.js";
import { CertificateModal } from "./CertificateModal.jsx";

export function RegistrationCertificatePage() {
  const { state } = useStore();
  const customer = useCustomer();
  const [showCert, setShowCert] = useState(false);
  const expired = isCertExpired(customer);
  const expiringSoon = isCertExpiringSoon(customer);
  const days = daysUntil(customer.certificateExpiresAt);

  return (
    <div>
      <SectionTitle sub="Your organization's official AJ-PROXIS registration certificate, subject to yearly renewal.">Registration Certificate</SectionTitle>

      {expired && (
        <Card className="mb-4" style={{ backgroundColor: C.redTint }}>
          <div className="flex items-start gap-2">
            <AlertTriangle size={16} color={C.red} className="mt-0.5 shrink-0" />
            <div>
              <div className="text-sm font-medium">Your certificate expired {Math.abs(days)} day(s) ago — your account is on hold.</div>
              <p className="text-xs mt-1" style={{ color: C.inkSoft }}>Renew now to restore full access, or wait for AJ-PROXIS Control Centre to grant access manually.</p>
            </div>
          </div>
        </Card>
      )}
      {!expired && expiringSoon && (
        <Card className="mb-4" style={{ backgroundColor: C.amberTint }}>
          <div className="flex items-start gap-2">
            <Clock size={16} color={C.amber} className="mt-0.5 shrink-0" />
            <div>
              <div className="text-sm font-medium">Your certificate expires in {days} day(s), on {customer.certificateExpiresAt}.</div>
              <p className="text-xs mt-1" style={{ color: C.inkSoft }}>Renew before it expires to avoid your account being put on hold automatically.</p>
            </div>
          </div>
        </Card>
      )}

      <Card className="max-w-lg">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="font-medium">{customer.certificateId}</div>
            <div className="text-xs" style={{ color: C.slate }}>Issued {customer.certificateIssuedAt}</div>
          </div>
          <Badge tone={expired ? "red" : expiringSoon ? "amber" : "green"}>{expired ? "Expired" : expiringSoon ? "Expiring Soon" : "Active"}</Badge>
        </div>
        <Row l="Valid Until" v={customer.certificateExpiresAt} bold />
        <Row l="Annual Renewal Fee" v={GHS(state.registrationFee)} />
        <Btn className="mt-4" icon={BadgeCheck} onClick={() => setShowCert(true)}>View Certificate</Btn>
      </Card>

      {showCert && <CertificateModal customer={customer} onClose={() => setShowCert(false)} />}
    </div>
  );
}

