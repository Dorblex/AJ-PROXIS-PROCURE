import { useState, useEffect } from "react";
import { isCertExpired } from "../../shared/helpers.js";
import { useStaff, useStore } from "../../store/StoreContext.js";
import { Shell } from "../../templates/Shell.jsx";
import { ADMIN_NAV } from "./adminNav.js";
import { Catalogue } from "../customer/Catalogue.jsx";
import { AdminDashboard } from "./AdminDashboard.jsx";
import { AdminAccountApprovals } from "./AdminAccountApprovals.jsx";
import { AdminProcurementQueue } from "./AdminProcurementQueue.jsx";
import { AdminRegistrationCertificates } from "./AdminRegistrationCertificates.jsx";
import { AdminCRM } from "./AdminCRM.jsx";
import { AdminCompanyContent } from "./AdminCompanyContent.jsx";
import { AdminCompanyMenu } from "./AdminCompanyMenu.jsx";
import { AdminEventsTickets } from "./AdminEventsTickets.jsx";
import { AdminDuplicateCleaner } from "./AdminDuplicateCleaner.jsx";
import { AdminAiPriceIntelligence } from "./AdminAiPriceIntelligence.jsx";
import { AdminSuppliers } from "./AdminSuppliers.jsx";
import { AdminCatalogue } from "./AdminCatalogue.jsx";
import { AdminInventory } from "./AdminInventory.jsx";
import { AdminFinance } from "./AdminFinance.jsx";
import { AdminOrdersDelivery } from "./AdminOrdersDelivery.jsx";
import { AdminDocuments } from "./AdminDocuments.jsx";
import { AdminReports } from "./AdminReports.jsx";
import { AdminLoyaltyProgram } from "./AdminLoyaltyProgram.jsx";
import { AdminAnnouncements } from "./AdminAnnouncements.jsx";
import { AdminCreditRequests } from "./AdminCreditRequests.jsx";
import { AdminIGF } from "./AdminIGF.jsx";
import { AdminFoundation } from "./AdminFoundation.jsx";
import { AdminCompanyUserAccess } from "./AdminCompanyUserAccess.jsx";
import { AdminStaffPortalAccess } from "./AdminStaffPortalAccess.jsx";
import { AdminPasswordResets } from "./AdminPasswordResets.jsx";
import { AdminUsersRoles } from "./AdminUsersRoles.jsx";
import { AdminSecurity } from "./AdminSecurity.jsx";
import { AdminArchitecture } from "./AdminArchitecture.jsx";
import { AdminSupportTickets } from "./AdminSupportTickets.jsx";
import { AdminReviews } from "./AdminReviews.jsx";
import { AdminCompliance } from "./AdminCompliance.jsx";

export function AdminPortal({ setRole }) {
  const [view, setView] = useState("dashboard");
  const staff = useStaff();
  const { state } = useStore();
  const pendingCount = state.customers.filter((c) => c.status === "Pending").length
    + state.suppliers.filter((s) => s.status === "Pending").length
    + state.staff.filter((s) => s.status === "Pending").length;
  const openTickets = state.supportTickets.filter((t) => t.status === "Open" || t.status === "In Progress").length;
  const pendingCompliance = state.complianceDocs.filter((d) => d.status === "Pending Review").length;
  const pendingNegotiations = state.quotations.filter((q) => q.status === "Negotiation Requested").length;
  const newPaidOrders = state.orders.filter((o) => o.deliveryStatus === "Paid — Awaiting Control Centre").length;
  const pendingResets = state.passwordResets.filter((r) => r.status === "Pending").length;
  const expiredCerts = state.customers.filter((c) => isCertExpired(c)).length;
  const pendingCredit = state.creditRequests.filter((r) => r.status === "Pending").length;

  const allowedNav = ADMIN_NAV.filter(([key]) => key === "dashboard" || (staff.isSuperAdmin && (key === "users" || key === "staff-access" || key === "password-resets")) || !staff.features || staff.features.includes(key));

  useEffect(() => {
    const allowedKeys = allowedNav.map(([key]) => key);
    if (!allowedKeys.includes(view)) setView("dashboard");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staff.id, staff.features, view]);

  return (
    <Shell nav={allowedNav} view={view} setView={setView} setRole={setRole} roleLabel="AJ-PROXIS Control Centre" portal="admin" roleOrg={`${staff.name} · ${staff.role}`} badges={{ approvals: pendingCount, support: openTickets, compliance: pendingCompliance, queue: pendingNegotiations, orders: newPaidOrders, "password-resets": pendingResets, certificates: expiredCerts, "credit-requests": pendingCredit }}>
      {view === "dashboard" && <AdminDashboard />}
      {view === "approvals" && <AdminAccountApprovals />}
      {view === "queue" && <AdminProcurementQueue />}
      {view === "crm" && <AdminCRM setRole={setRole} />}
      {view === "certificates" && <AdminRegistrationCertificates />}
      {view === "company-users" && <AdminCompanyUserAccess />}
      {view === "suppliers" && <AdminSuppliers />}
      {view === "ai-prices" && <AdminAiPriceIntelligence />}
      {view === "ai-duplicates" && <AdminDuplicateCleaner />}
      {view === "events-tickets" && <AdminEventsTickets />}
      {view === "company-menu" && <AdminCompanyMenu />}
      {view === "company-content" && <AdminCompanyContent />}
      {view === "catalogue" && <AdminCatalogue />}
      {view === "inventory" && <AdminInventory />}
      {view === "finance" && <AdminFinance />}
      {view === "igf" && <AdminIGF />}
      {view === "foundation" && <AdminFoundation />}
      {view === "loyalty" && <AdminLoyaltyProgram />}
      {view === "announcements" && <AdminAnnouncements />}
      {view === "credit-requests" && <AdminCreditRequests />}
      {view === "orders" && <AdminOrdersDelivery />}
      {view === "support" && <AdminSupportTickets />}
      {view === "reviews" && <AdminReviews />}
      {view === "compliance" && <AdminCompliance />}
      {view === "documents" && <AdminDocuments />}
      {view === "reports" && <AdminReports />}
      {view === "users" && <AdminUsersRoles />}
      {view === "staff-access" && <AdminStaffPortalAccess />}
      {view === "password-resets" && <AdminPasswordResets />}
      {view === "security" && <AdminSecurity />}
      {view === "architecture" && <AdminArchitecture />}
    </Shell>
  );
}
