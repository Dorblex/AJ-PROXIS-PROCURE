import { Truck, Building2, ClipboardList, AlertTriangle, TrendingUp, DollarSign, MapPin, Star, Handshake, Factory, BadgeCheck, ClipboardCheck, LifeBuoy, ShieldCheck, Heart, KeyRound } from "lucide-react";
import { Card } from "../../atoms/Card.jsx";
import { SectionTitle } from "../../atoms/SectionTitle.jsx";
import { Stat } from "../../atoms/Stat.jsx";
import { Table } from "../../molecules/Table.jsx";
import { C } from "../../shared/tokens.js";
import { GHS, isCertExpired, pad, taxBreakdown } from "../../shared/helpers.js";
import { useStore } from "../../store/StoreContext.js";

export function AdminDashboard() {
  const { state } = useStore();
  const totalSales = state.orders.reduce((s, o) => s + o.total, 0);
  const pendingOrders = state.orders.filter((o) => o.deliveryStatus !== "Delivered").length;
  const pendingAccounts = state.customers.filter((c) => c.status === "Pending").length + state.suppliers.filter((s) => s.status === "Pending").length + state.staff.filter((s) => s.status === "Pending").length;
  const openTickets = state.supportTickets.filter((t) => t.status === "Open" || t.status === "In Progress").length;
  const avgRating = state.reviews.length ? (state.reviews.reduce((s, r) => s + r.rating, 0) / state.reviews.length).toFixed(1) : "—";
  const pendingCompliance = state.complianceDocs.filter((d) => d.status === "Pending Review").length;
  const pendingNegotiations = state.quotations.filter((q) => q.status === "Negotiation Requested").length;
  const foundationRaised = state.foundation.contributions.reduce((s, c) => s + c.amount, 0);
  const newPaidOrders = state.orders.filter((o) => o.deliveryStatus === "Paid — Awaiting Control Centre").length;
  const pendingResets = state.passwordResets.filter((r) => r.status === "Pending").length;
  const expiredCerts = state.customers.filter((c) => isCertExpired(c)).length;
  const pendingCredit = state.creditRequests.filter((r) => r.status === "Pending").length;
  return (
    <div>
      <SectionTitle sub="Complete business overview across procurement, finance and logistics.">Control Centre — Dashboard</SectionTitle>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Stat label="Total Sales" value={GHS(totalSales)} icon={DollarSign} />
        <Stat label="Paid Orders Awaiting Processing" value={newPaidOrders} icon={ClipboardCheck} tint={C.redTint} fg={C.red} />
        <Stat label="Pending Orders" value={pendingOrders} icon={Truck} tint={C.amberTint} fg={C.amber} />
        <Stat label="Procurement Requests" value={state.requests.length + state.rfqs.length} icon={ClipboardList} />
        <Stat label="Active Customers" value={state.customers.filter((c) => c.status === "Active").length} icon={Building2} />
        <Stat label="Active Suppliers" value={state.suppliers.filter((s) => s.status === "Approved").length} icon={Factory} />
        <Stat label="Today's Deliveries" value={state.orders.filter((o) => o.deliveryStatus === "Out for Delivery").length} icon={MapPin} />
        <Stat label="Outstanding Payments (Approved, Awaiting Accountant)" value={GHS(state.quotations.filter((q) => q.status === "Approved").reduce((s, q) => s + taxBreakdown(q.subtotal, q.discount || 0, q.delivery || 0).grand, 0))} icon={AlertTriangle} tint={C.redTint} fg={C.red} />
        <Stat label="Accounts Awaiting Approval" value={pendingAccounts} icon={ClipboardCheck} tint={C.amberTint} fg={C.amber} />
        <Stat label="Price Negotiations Pending" value={pendingNegotiations} icon={Handshake} tint={C.amberTint} fg={C.amber} />
        <Stat label="Open Support Tickets" value={openTickets} icon={LifeBuoy} tint={C.amberTint} fg={C.amber} />
        <Stat label="Average Customer Rating" value={`${avgRating} / 5`} icon={Star} tint={C.amberTint} fg={C.amber} />
        <Stat label="Compliance Docs Pending" value={pendingCompliance} icon={ShieldCheck} tint={C.amberTint} fg={C.amber} />
        <Stat label="AJ-PROXIS Foundation Raised" value={GHS(foundationRaised)} icon={Heart} tint={C.redTint} fg={C.red} />
        <Stat label="Password Reset Requests" value={pendingResets} icon={KeyRound} tint={C.amberTint} fg={C.amber} />
        <Stat label="Expired Certificates (Accounts On Hold)" value={expiredCerts} icon={BadgeCheck} tint={C.redTint} fg={C.red} />
        <Stat label="Credit & Budget Requests Pending" value={pendingCredit} icon={TrendingUp} tint={C.amberTint} fg={C.amber} />
      </div>
      <div className="text-sm font-medium mb-2">Recent Activity</div>
      <Card pad={false}>
        <Table columns={[{ key: "time", label: "When", render: (r) => new Date(r.time).toLocaleString() }, { key: "text", label: "Event" }]} rows={state.auditLog.slice(0, 10)} empty="No activity recorded yet." />
      </Card>
    </div>
  );
}

