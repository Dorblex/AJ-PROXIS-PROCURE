import { useState } from "react";
import { CheckCircle2, XCircle, History } from "lucide-react";
import { Btn } from "../../atoms/Btn.jsx";
import { Card } from "../../atoms/Card.jsx";
import { SectionTitle } from "../../atoms/SectionTitle.jsx";
import { Badge, statusTone } from "../../atoms/Badge.jsx";
import { Modal } from "../../molecules/Modal.jsx";
import { Table } from "../../molecules/Table.jsx";
import { Row } from "../../molecules/Row.jsx";
import { C } from "../../shared/tokens.js";
import { GHS, pad } from "../../shared/helpers.js";
import { useStaff, useStore } from "../../store/StoreContext.js";

export function AdminCreditRequests() {
  const { state, dispatch } = useStore();
  const me = useStaff();
  const [decideFor, setDecideFor] = useState(null);
  const pending = state.creditRequests.filter((r) => r.status === "Pending");
  const decided = state.creditRequests.filter((r) => r.status !== "Pending");

  function decide(decision) {
    dispatch({ type: "DECIDE_CREDIT_REQUEST", id: decideFor.id, decision, decidedBy: me.name });
    setDecideFor(null);
  }

  return (
    <div>
      <SectionTitle sub="Review customer requests for higher credit limits or annual procurement budgets.">Credit & Budget Requests</SectionTitle>
      <div className="text-sm font-medium mb-2">Pending Requests {pending.length > 0 && <Badge tone="amber">{pending.length}</Badge>}</div>
      <Card pad={false} className="mb-6">
        <Table columns={[
          { key: "orgName", label: "Customer" },
          { key: "currentLimit", label: "Current Limit", render: (r) => GHS(r.currentLimit) },
          { key: "requestedLimit", label: "Requested Limit", render: (r) => GHS(r.requestedLimit) },
          { key: "reason", label: "Reason" },
          { key: "requestedAt", label: "Submitted" },
          { key: "a", label: "", render: (r) => <Btn size="sm" onClick={() => setDecideFor(r)}>Review</Btn> },
        ]} rows={pending} empty="No pending credit or budget requests." />
      </Card>
      <div className="text-sm font-medium mb-2">Decision History</div>
      <Card pad={false}>
        <Table columns={[
          { key: "orgName", label: "Customer" },
          { key: "requestedLimit", label: "Requested Limit", render: (r) => GHS(r.requestedLimit) },
          { key: "status", label: "Status", render: (r) => <Badge tone={statusTone(r.status)}>{r.status}</Badge> },
          { key: "decidedBy", label: "Decided By" }, { key: "decidedAt", label: "Date" },
        ]} rows={decided} empty="No decisions made yet." />
      </Card>

      {decideFor && (
        <Modal title={`Review Request — ${decideFor.orgName}`} onClose={() => setDecideFor(null)}>
          <Row l="Current Credit Limit" v={GHS(decideFor.currentLimit)} />
          <Row l="Requested Credit Limit" v={GHS(decideFor.requestedLimit)} bold />
          <Row l="Current Annual Budget" v={GHS(decideFor.currentBudget)} />
          <Row l="Requested Annual Budget" v={GHS(decideFor.requestedBudget)} bold />
          <p className="text-sm mt-3 mb-4" style={{ color: C.inkSoft }}>Reason: {decideFor.reason}</p>
          <div className="flex gap-2">
            <Btn icon={CheckCircle2} onClick={() => decide("Approved")}>Approve</Btn>
            <Btn variant="danger" icon={XCircle} onClick={() => decide("Rejected")}>Reject</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

