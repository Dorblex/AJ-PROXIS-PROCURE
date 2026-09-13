import { useState } from "react";
import { TrendingUp, BarChart3, CreditCard } from "lucide-react";
import { Btn } from "../../atoms/Btn.jsx";
import { Card } from "../../atoms/Card.jsx";
import { SectionTitle } from "../../atoms/SectionTitle.jsx";
import { Stat } from "../../atoms/Stat.jsx";
import { Badge, statusTone } from "../../atoms/Badge.jsx";
import { Field } from "../../atoms/Field.jsx";
import { TextInput } from "../../atoms/TextInput.jsx";
import { TextArea } from "../../atoms/TextArea.jsx";
import { Table } from "../../molecules/Table.jsx";
import { C } from "../../shared/tokens.js";
import { GHS, pad } from "../../shared/helpers.js";
import { useActingUser, useCustomer, useStore } from "../../store/StoreContext.js";

export function CreditBudgetRequestsPage() {
  const { state, dispatch } = useStore();
  const customer = useCustomer();
  const actingUser = useActingUser();
  const canRequest = actingUser.isTopApprover || actingUser.isAdmin || actingUser.role === "Procurement Officer";
  const [requestedLimit, setRequestedLimit] = useState(customer.creditLimit + 10000);
  const [requestedBudget, setRequestedBudget] = useState(customer.budgetAnnual);
  const [reason, setReason] = useState("");
  const myRequests = state.creditRequests.filter((r) => r.customerId === customer.id);

  function submit() {
    if (!reason.trim()) return;
    dispatch({ type: "REQUEST_CREDIT_INCREASE", customerId: customer.id, requestedLimit, requestedBudget, reason });
    setReason("");
  }

  return (
    <div>
      <SectionTitle sub="Request a higher credit limit or annual procurement budget — reviewed by AJ-PROXIS Control Centre.">Credit & Budget Requests</SectionTitle>
      <div className="grid sm:grid-cols-2 gap-3 mb-6">
        <Stat label="Current Credit Limit" value={GHS(customer.creditLimit)} icon={CreditCard} />
        <Stat label="Current Annual Budget" value={GHS(customer.budgetAnnual)} icon={BarChart3} />
      </div>
      {canRequest ? (
        <Card className="max-w-lg mb-6">
          <div className="text-sm font-medium mb-3">New Request</div>
          <Field label="Requested Credit Limit (GHS)"><TextInput type="number" value={requestedLimit} onChange={(e) => setRequestedLimit(Number(e.target.value))} /></Field>
          <Field label="Requested Annual Budget (GHS)"><TextInput type="number" value={requestedBudget} onChange={(e) => setRequestedBudget(Number(e.target.value))} /></Field>
          <Field label="Reason"><TextArea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why does your organization need a higher limit?" /></Field>
          <Btn className="mt-2" icon={TrendingUp} disabled={!reason.trim()} onClick={submit}>Submit Request</Btn>
        </Card>
      ) : (
        <Card className="max-w-lg mb-6" style={{ backgroundColor: C.amberTint }}>
          <div className="text-sm">Only the Procurement Officer, an Administrator, or the CEO / Principal can submit a credit request. Signed in as {actingUser.name} ({actingUser.role}).</div>
        </Card>
      )}
      <div className="text-sm font-medium mb-2">Your Requests</div>
      <Card pad={false}>
        <Table columns={[
          { key: "id", label: "Request" },
          { key: "requestedLimit", label: "Requested Limit", render: (r) => GHS(r.requestedLimit) },
          { key: "requestedAt", label: "Submitted" },
          { key: "status", label: "Status", render: (r) => <Badge tone={statusTone(r.status)}>{r.status}</Badge> },
        ]} rows={myRequests} empty="No credit or budget requests yet." />
      </Card>
    </div>
  );
}

