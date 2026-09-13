import { X, Check } from "lucide-react";
import { Btn } from "../../atoms/Btn.jsx";
import { Card } from "../../atoms/Card.jsx";
import { SectionTitle } from "../../atoms/SectionTitle.jsx";
import { Badge, statusTone } from "../../atoms/Badge.jsx";
import { Table } from "../../molecules/Table.jsx";
import { pad } from "../../shared/helpers.js";
import { log } from "../../store/reducer.js";
import { useStore } from "../../store/StoreContext.js";

export function AdminAccountApprovals() {
  const { state, dispatch } = useStore();
  const pendingCustomers = state.customers.filter((c) => c.status === "Pending");
  const pendingSuppliers = state.suppliers.filter((s) => s.status === "Pending");
  const pendingStaff = state.staff.filter((s) => s.status === "Pending");
  const decideCols = (portal) => [
    { key: "a", label: "", render: (r) => (
      <div className="flex gap-2">
        <Btn size="sm" icon={Check} onClick={() => dispatch({ type: "APPROVE_ACCOUNT", portal, id: r.id })}>Approve</Btn>
        <Btn size="sm" variant="danger" icon={X} onClick={() => dispatch({ type: "REJECT_ACCOUNT", portal, id: r.id })}>Reject</Btn>
      </div>
    ) },
  ];
  const allAccounts = [
    ...state.customers.map((c) => ({ id: c.id, name: c.name, portal: "Customer", email: c.email, status: c.status })),
    ...state.suppliers.map((s) => ({ id: s.id, name: s.name, portal: "Supplier", email: s.email, status: s.status })),
    ...state.staff.map((s) => ({ id: s.id, name: s.name, portal: "Staff", email: s.email, status: s.status })),
  ];
  return (
    <div>
      <SectionTitle sub="Every customer, supplier and internal staff signup is reviewed here before they can log in — this is what links registration to the Control Centre.">Account Approvals</SectionTitle>
      <div className="space-y-6">
        <div>
          <div className="text-sm font-medium mb-2">Customer Signups Awaiting Approval</div>
          <Card pad={false}>
            <Table columns={[{ key: "name", label: "Organization" }, { key: "type", label: "Type" }, { key: "email", label: "Email" }, ...decideCols("customer")]} rows={pendingCustomers} empty="No pending customer signups." />
          </Card>
        </div>
        <div>
          <div className="text-sm font-medium mb-2">Supplier Signups Awaiting Approval</div>
          <Card pad={false}>
            <Table columns={[{ key: "name", label: "Company" }, { key: "location", label: "Location" }, { key: "email", label: "Email" }, ...decideCols("supplier")]} rows={pendingSuppliers} empty="No pending supplier signups." />
          </Card>
        </div>
        <div>
          <div className="text-sm font-medium mb-2">Staff Signups Awaiting Approval</div>
          <Card pad={false}>
            <Table columns={[{ key: "name", label: "Name" }, { key: "role", label: "Role" }, { key: "email", label: "Email" }, ...decideCols("staff")]} rows={pendingStaff} empty="No pending staff signups." />
          </Card>
        </div>
        <div>
          <div className="text-sm font-medium mb-2">All Accounts</div>
          <Card pad={false}>
            <Table columns={[
              { key: "id", label: "ID" }, { key: "name", label: "Name" }, { key: "portal", label: "Portal" }, { key: "email", label: "Email" },
              { key: "status", label: "Status", render: (r) => <Badge tone={statusTone(r.status)}>{r.status}</Badge> },
            ]} rows={allAccounts} />
          </Card>
        </div>
      </div>
    </div>
  );
}

