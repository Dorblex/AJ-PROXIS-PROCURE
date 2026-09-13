import { useState } from "react";
import { LogIn } from "lucide-react";
import { Btn } from "../../atoms/Btn.jsx";
import { Card } from "../../atoms/Card.jsx";
import { SectionTitle } from "../../atoms/SectionTitle.jsx";
import { Badge, statusTone } from "../../atoms/Badge.jsx";
import { Modal } from "../../molecules/Modal.jsx";
import { Table } from "../../molecules/Table.jsx";
import { C } from "../../shared/tokens.js";
import { GHS, pad } from "../../shared/helpers.js";
import { useStore } from "../../store/StoreContext.js";
import { Quotations } from "../customer/Quotations.jsx";
import { Info } from "./Info.jsx";
import { MiniList } from "./MiniList.jsx";

export function AdminCRM({ setRole }) {
  const { state, dispatch } = useStore();
  const [sel, setSel] = useState(null);
  const selected = state.customers.find((c) => c.id === sel);

  function accessPortal(customerId) {
    dispatch({ type: "VIEW_AS", portal: "customer", accountId: customerId });
    setRole("customer");
  }

  return (
    <div>
      <SectionTitle sub="Every registered organization, with full relationship history — and direct access into their portal.">Customers (CRM)</SectionTitle>
      <Card pad={false}>
        <Table
          columns={[
            { key: "name", label: "Organization" }, { key: "type", label: "Type" }, { key: "email", label: "Email" },
            { key: "status", label: "Status", render: (r) => <Badge tone={statusTone(r.status)}>{r.status}</Badge> },
            { key: "a", label: "", render: (r) => (
              <div className="flex gap-2">
                <Btn size="sm" variant="ghost" onClick={() => setSel(r.id)}>View Profile</Btn>
                {r.status === "Active" && <Btn size="sm" variant="subtle" icon={LogIn} onClick={() => accessPortal(r.id)}>Access Portal</Btn>}
              </div>
            ) },
          ]}
          rows={state.customers}
        />
      </Card>
      {selected && (
        <Modal title={selected.name} onClose={() => setSel(null)} wide>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full flex items-center justify-center font-semibold" style={{ backgroundColor: C.brandTint, color: C.brandDark }}>{selected.name[0]}</div>
            <div>
              <div className="font-medium">{selected.name}</div>
              <div className="text-xs" style={{ color: C.slate }}>{selected.type} · {selected.email} · {selected.phone}</div>
            </div>
            <Badge tone={statusTone(selected.status)}>{selected.status}</Badge>
            {selected.status === "Active" && (
              <Btn size="sm" className="ml-auto" icon={LogIn} onClick={() => accessPortal(selected.id)}>Access Customer Portal</Btn>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-4">
            <Info l="Credit Limit" v={GHS(selected.creditLimit)} />
            <Info l="VAT No." v={selected.vat} />
            <Info l="Delivery Address" v={selected.deliveryAddress} />
            <Info l="Contact Person" v={selected.contact} />
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            <MiniList title="Orders" rows={state.orders.filter((o) => o.customerId === selected.id).map((o) => `${o.id} — ${GHS(o.total)}`)} />
            <MiniList title="Quotations" rows={state.quotations.filter((q) => q.customerId === selected.id).map((q) => `${q.id} — ${q.status}`)} />
            <MiniList title="Returns / Complaints" rows={state.orders.filter((o) => o.customerId === selected.id).flatMap((o) => (o.returns || []).map((r) => `${r.id} — ${r.reason}`))} />
            <MiniList title="Support Tickets" rows={state.supportTickets.filter((t) => t.customerId === selected.id).map((t) => `${t.id} — ${t.subject} (${t.status})`)} />
            <MiniList title="Reviews" rows={state.reviews.filter((r) => r.customerId === selected.id).map((r) => `${r.orderId} — ${r.rating}★${r.response ? " (responded)" : ""}`)} />
            <MiniList title="Compliance Documents" rows={state.complianceDocs.filter((d) => d.customerId === selected.id).map((d) => `${d.docType} — ${d.status}`)} />
            <MiniList title="Contracts & Supply Agreements" rows={state.contracts.filter((c) => c.customerId === selected.id).map((c) => `${c.id} — ${c.product} (${c.status || "Pending Signature"})`)} />
            <MiniList title="Saved Delivery Locations" rows={(selected.savedLocations || []).map((l) => `${l.label} — ${l.address}`)} />
            <MiniList title="Credit / Budget Requests" rows={state.creditRequests.filter((r) => r.customerId === selected.id).map((r) => `${r.id} — ${GHS(r.requestedLimit)} (${r.status})`)} />
          </div>
        </Modal>
      )}
    </div>
  );
}
