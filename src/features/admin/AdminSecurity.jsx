import { useState } from "react";
import { Shield } from "lucide-react";
import { Card } from "../../atoms/Card.jsx";
import { SectionTitle } from "../../atoms/SectionTitle.jsx";
import { Badge } from "../../atoms/Badge.jsx";
import { Table } from "../../molecules/Table.jsx";
import { C } from "../../shared/tokens.js";
import { pad } from "../../shared/helpers.js";
import { useStore } from "../../store/StoreContext.js";

export function AdminSecurity() {
  const { state } = useStore();
  const [twoFA, setTwoFA] = useState(true);
  const items = [
    "Secure authentication with hashed credentials",
    "Two-factor authentication for admin and finance roles",
    "Role-based access control across every module",
    "Encryption of data in transit and at rest",
    "Payment-card data handled by the payment provider, never stored by AJ-PROXIS",
    "Session management with automatic timeout",
    "Automated backups and disaster recovery",
    "Fraud monitoring and IP/device tracking",
    "Admin approval controls on sensitive actions",
  ];
  return (
    <div>
      <SectionTitle sub="Security posture and a live audit trail of platform activity.">Security & Audit Log</SectionTitle>
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium">Two-Factor Authentication</div>
            <button onClick={() => setTwoFA(!twoFA)}><Badge tone={twoFA ? "green" : "slate"}>{twoFA ? "Enabled" : "Disabled"}</Badge></button>
          </div>
          <ul className="text-sm space-y-1.5">
            {items.map((it) => <li key={it} className="flex gap-2"><Shield size={14} color={C.brand} className="mt-0.5 shrink-0" /> {it}</li>)}
          </ul>
        </Card>
        <Card pad={false}>
          <div className="p-4 pb-0 text-sm font-medium">Audit Log</div>
          <Table columns={[{ key: "time", label: "When", render: (r) => new Date(r.time).toLocaleTimeString() }, { key: "text", label: "Event" }]} rows={state.auditLog} empty="No events recorded yet." />
        </Card>
      </div>
    </div>
  );
}

