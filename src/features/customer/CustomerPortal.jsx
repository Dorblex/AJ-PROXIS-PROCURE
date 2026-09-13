import { useState, useEffect } from "react";
import { isCertExpired } from "../../shared/helpers.js";
import { useActingUser, useCustomer, useStore } from "../../store/StoreContext.js";
import { Shell } from "../../templates/Shell.jsx";
import { CUSTOMER_NAV } from "./customerNav.js";
import { CustomerDashboard } from "./CustomerDashboard.jsx";
import { Catalogue } from "./Catalogue.jsx";
import { CartCheckout } from "./CartCheckout.jsx";
import { RegistrationCertificatePage } from "./RegistrationCertificatePage.jsx";
import { RewardsPage } from "./RewardsPage.jsx";
import { AnnouncementsPage } from "./AnnouncementsPage.jsx";
import { CreditBudgetRequestsPage } from "./CreditBudgetRequestsPage.jsx";
import { SavedLocationsPage } from "./SavedLocationsPage.jsx";
import { RequestProcurement } from "./RequestProcurement.jsx";
import { Quotations } from "./Quotations.jsx";
import { OrdersTracking } from "./OrdersTracking.jsx";
import { WalletView } from "./WalletView.jsx";
import { DocumentsView } from "./DocumentsView.jsx";
import { BudgetAnalytics } from "./BudgetAnalytics.jsx";
import { ContractsView } from "./ContractsView.jsx";
import { OrgUsersApprovals } from "./OrgUsersApprovals.jsx";
import { SupportTickets } from "./SupportTickets.jsx";
import { ReviewsFeedback } from "./ReviewsFeedback.jsx";
import { ComplianceDocuments } from "./ComplianceDocuments.jsx";
import { AskAJ } from "./AskAJ.jsx";
import { StaffSignIn } from "./StaffSignIn.jsx";
import { AccountOnHold } from "./AccountOnHold.jsx";

export function CustomerPortal({ setRole }) {
  const [view, setView] = useState("dashboard");
  const { state, dispatch } = useStore();
  const customer = useCustomer();
  const actingUser = useActingUser();
  const cartCount = state.cart.reduce((s, c) => s + c.qty, 0);

  const allowedNav = CUSTOMER_NAV.filter(([key]) => key === "dashboard" || key === "certificate" || (actingUser.isAdmin && key === "org") || !actingUser.features || actingUser.features.includes(key));

  useEffect(() => {
    const allowedKeys = allowedNav.map(([key]) => key);
    if (!allowedKeys.includes(view)) setView("dashboard");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actingUser.id, actingUser.features, view]);

  if (!state.session.staffVerified) {
    return <StaffSignIn setRole={setRole} />;
  }

  if (isCertExpired(customer) && !state.session.adminReturn) {
    return <AccountOnHold setRole={setRole} />;
  }

  return (
    <Shell nav={allowedNav} view={view} setView={setView} setRole={setRole} roleLabel="Customer Portal" portal="customer" roleOrg={`${customer.name} · ${actingUser.name} (${actingUser.role})`} badgeCount={cartCount} badgeKey="cart" onSwitchUser={() => dispatch({ type: "STAFF_SIGN_OUT" })}>
      {view === "dashboard" && <CustomerDashboard go={setView} />}
      {view === "catalogue" && <Catalogue />}
      {view === "cart" && <CartCheckout />}
      {view === "request" && <RequestProcurement />}
      {view === "quotations" && <Quotations />}
      {view === "orders" && <OrdersTracking />}
      {view === "wallet" && <WalletView />}
      {view === "documents" && <DocumentsView />}
      {view === "certificate" && <RegistrationCertificatePage />}
      {view === "budget" && <BudgetAnalytics />}
      {view === "contracts" && <ContractsView />}
      {view === "org" && <OrgUsersApprovals />}
      {view === "chat" && <AskAJ />}
      {view === "support" && <SupportTickets />}
      {view === "reviews" && <ReviewsFeedback />}
      {view === "compliance" && <ComplianceDocuments />}
      {view === "rewards" && <RewardsPage />}
      {view === "announcements" && <AnnouncementsPage />}
      {view === "credit" && <CreditBudgetRequestsPage />}
      {view === "locations" && <SavedLocationsPage />}
    </Shell>
  );
}

/* ================================ ADMIN APP ================================ */

