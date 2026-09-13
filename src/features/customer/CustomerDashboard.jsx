import { ShoppingCart, Truck, FileText, Wallet as WalletIcon, ClipboardList, Clock, CreditCard, PackageCheck, MessageCircle, Gift, Megaphone, Navigation } from "lucide-react";
import { Btn } from "../../atoms/Btn.jsx";
import { Card } from "../../atoms/Card.jsx";
import { SectionTitle } from "../../atoms/SectionTitle.jsx";
import { Stat } from "../../atoms/Stat.jsx";
import { C } from "../../shared/tokens.js";
import { GHS, daysUntil, isCertExpiringSoon } from "../../shared/helpers.js";
import { useCustomer, useStore } from "../../store/StoreContext.js";
import { Catalogue } from "./Catalogue.jsx";
import { Quotations } from "./Quotations.jsx";

export function CustomerDashboard({ go }) {
  const { state } = useStore();
  const customer = useCustomer();
  const pendingReq = state.requests.filter((r) => r.status !== "Quoted").length;
  const pendingQtn = state.quotations.filter((q) => q.status.includes("Awaiting")).length;
  const active = state.orders.filter((o) => o.deliveryStatus !== "Delivered").length;
  const delivered = state.orders.filter((o) => o.deliveryStatus === "Delivered").length;
  const certExpiringSoon = isCertExpiringSoon(customer);
  const certDays = daysUntil(customer.certificateExpiresAt);
  return (
    <div>
      <SectionTitle sub={`Welcome, ${customer.name}`}>Dashboard</SectionTitle>
      {certExpiringSoon && (
        <Card className="mb-4" style={{ backgroundColor: C.amberTint }}>
          <div className="flex items-start gap-2">
            <Clock size={16} color={C.amber} className="mt-0.5 shrink-0" />
            <div className="flex-1">
              <div className="text-sm font-medium">Your AJ-PROXIS registration certificate expires in {certDays} day(s), on {customer.certificateExpiresAt}.</div>
              <p className="text-xs mt-1" style={{ color: C.inkSoft }}>Renew before it expires — accounts with an expired certificate are automatically put on hold until renewed.</p>
            </div>
            <Btn size="sm" onClick={() => go("certificate")}>Renew Now</Btn>
          </div>
        </Card>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Stat label="Available Credit" value={GHS(customer.creditLimit)} icon={CreditCard} />
        <Stat label="Pending Requests" value={pendingReq} icon={ClipboardList} tint={C.amberTint} fg={C.amber} />
        <Stat label="Pending Quotations" value={pendingQtn} icon={FileText} tint={C.amberTint} fg={C.amber} />
        <Stat label="Active Orders" value={active} icon={Truck} />
        <Stat label="Delivered Orders" value={delivered} icon={PackageCheck} tint={C.greenTint} fg={C.green} />
        <Stat label="Wallet Balance" value={GHS(state.wallet.balance)} icon={WalletIcon} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          ["Shop Catalogue", "catalogue", ShoppingCart],
          ["Request Procurement", "request", ClipboardList],
          ["My Quotations", "quotations", FileText],
          ["My Orders", "orders", Truck],
          ["Rewards & Loyalty", "rewards", Gift],
          ["Announcements", "announcements", Megaphone],
          ["Delivery Locations", "locations", Navigation],
          ["Ask AJ", "chat", MessageCircle],
        ].map(([label, key, Icon]) => (
          <button key={key} onClick={() => go(key)} className="rounded border p-4 text-left hover:border-current transition-colors" style={{ borderColor: C.border, backgroundColor: C.panel }}>
            <Icon size={18} color={C.brand} />
            <div className="mt-2 text-sm font-medium">{label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

