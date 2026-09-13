import {
  LayoutDashboard, ShoppingCart, CreditCard, ClipboardList, FileText, Truck,
  Wallet as WalletIcon, ScrollText, BadgeCheck, BarChart3, Repeat, Users, MessageCircle,
  LifeBuoy, Star, ShieldCheck, Gift, Megaphone, TrendingUp, Navigation,
} from "lucide-react";

/* Customer Portal sidebar nav — kept in its own module (rather than inside
   CustomerPortal.jsx) so other features (e.g. Admin's per-org menu toggles)
   can import it without pulling in the whole customer page tree. */
export const CUSTOMER_NAV = [
  ["dashboard", "Dashboard", LayoutDashboard],
  ["catalogue", "Catalogue", ShoppingCart],
  ["cart", "Cart & Checkout", CreditCard],
  ["request", "Request Procurement", ClipboardList],
  ["quotations", "My Quotations", FileText],
  ["orders", "Orders & Tracking", Truck],
  ["wallet", "Wallet", WalletIcon],
  ["documents", "Documents", ScrollText],
  ["certificate", "Registration Certificate", BadgeCheck],
  ["budget", "Budget & Analytics", BarChart3],
  ["contracts", "Contracts & Recurring", Repeat],
  ["org", "Users & Approvals", Users],
  ["chat", "Ask AJ", MessageCircle],
  ["support", "Help & Support", LifeBuoy],
  ["reviews", "Ratings & Reviews", Star],
  ["compliance", "Compliance Documents", ShieldCheck],
  ["rewards", "Rewards & Loyalty", Gift],
  ["announcements", "Announcements", Megaphone],
  ["credit", "Credit & Budget Requests", TrendingUp],
  ["locations", "Delivery Locations", Navigation],
];
