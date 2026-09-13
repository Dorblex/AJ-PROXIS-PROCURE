import { useState } from "react";
import { FileText } from "lucide-react";
import { Btn } from "../../atoms/Btn.jsx";
import { Card } from "../../atoms/Card.jsx";
import { SectionTitle } from "../../atoms/SectionTitle.jsx";
import { Badge, statusTone } from "../../atoms/Badge.jsx";
import { Field } from "../../atoms/Field.jsx";
import { TextInput } from "../../atoms/TextInput.jsx";
import { Table } from "../../molecules/Table.jsx";
import { C } from "../../shared/tokens.js";
import { GHS, pad } from "../../shared/helpers.js";
import { useCustomer, useStore } from "../../store/StoreContext.js";
import { SupplyAgreementModal } from "./SupplyAgreementModal.jsx";

export function ContractsView() {
  const { state, dispatch } = useStore();
  const customer = useCustomer();
  const [form, setForm] = useState({ product: "", start: "", end: "", terms: "Net 30", value: "" });
  const [agreementFor, setAgreementFor] = useState(null);
  const myContracts = state.contracts.filter((c) => c.customerId === customer.id);
  return (
    <div>
      <SectionTitle sub="Standing supply agreements — every contract auto-generates a full Supply Agreement document for you to review and sign.">Contracts & Subscriptions</SectionTitle>
      <div className="grid lg:grid-cols-2 gap-4">
        <Card pad={false}>
          <Table columns={[
            { key: "id", label: "Contract" }, { key: "product", label: "Plan / Product" }, { key: "start", label: "Start" }, { key: "end", label: "End" },
            { key: "terms", label: "Terms" }, { key: "value", label: "Value", render: (r) => GHS(r.value) },
            { key: "status", label: "Agreement", render: (r) => <Badge tone={statusTone(r.status || "Pending Signature")}>{r.status || "Pending Signature"}</Badge> },
            { key: "a", label: "", render: (r) => <Btn size="sm" variant="ghost" icon={FileText} onClick={() => setAgreementFor(r)}>View Agreement</Btn> },
          ]} rows={myContracts} empty="No contracts yet — create one to generate a Supply Agreement." />
        </Card>
        <Card>
          <div className="text-sm font-medium mb-2">New Contract</div>
          <div className="space-y-2">
            <Field label="Plan / product"><TextInput value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Start"><TextInput type="date" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} /></Field>
              <Field label="End"><TextInput type="date" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} /></Field>
            </div>
            <Field label="Payment terms"><TextInput value={form.terms} onChange={(e) => setForm({ ...form, terms: e.target.value })} /></Field>
            <Field label="Contract value (GHS)"><TextInput type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} /></Field>
            <Btn onClick={() => { dispatch({ type: "ADD_CONTRACT", payload: { ...form, value: Number(form.value) || 0, customerId: customer.id } }); setForm({ product: "", start: "", end: "", terms: "Net 30", value: "" }); }}>Save Contract & Generate Agreement</Btn>
            <p className="text-[11px]" style={{ color: C.slate }}>A full Supply Agreement is generated automatically — open it from the table to review and sign.</p>
          </div>
        </Card>
      </div>
      <div className="mt-5">
        <div className="text-sm font-medium mb-2">Recurring Procurement Schedules</div>
        <Card pad={false}>
          <Table columns={[
            { key: "name", label: "Schedule" }, { key: "items", label: "Items" }, { key: "frequency", label: "Frequency" }, { key: "nextRun", label: "Next Run" },
            { key: "active", label: "Status", render: (r) => <button onClick={() => dispatch({ type: "TOGGLE_RECURRING", id: r.id })}><Badge tone={r.active ? "green" : "slate"}>{r.active ? "Active" : "Paused"}</Badge></button> },
          ]} rows={state.recurring} />
        </Card>
      </div>
      {agreementFor && <SupplyAgreementModal contract={agreementFor} onClose={() => setAgreementFor(null)} />}
    </div>
  );
}

