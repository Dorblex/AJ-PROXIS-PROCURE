import {
  LayoutDashboard, ClipboardCheck, ClipboardList, Building2, BadgeCheck, Users, Factory,
  Target, Search, ScrollText, Menu, FileText, Package, Warehouse, Landmark, DollarSign,
  Heart, Gift, Megaphone, TrendingUp, Truck, LifeBuoy, Star, ShieldCheck, PieChart as PieIcon,
  Settings, KeyRound, Lock, Globe,
} from "lucide-react";

/* Control Centre sidebar nav — kept in its own module (rather than inside AdminPortal.jsx)
   so other features (e.g. per-staff feature toggles) can import it without pulling in the
   whole admin page tree, and without a circular import back into AdminPortal.jsx. */
export const ADMIN_NAV = [
  ["dashboard", "Dashboard", LayoutDashboard],
  ["approvals", "Account Approvals", ClipboardCheck],
  ["queue", "Procurement & RFQs", ClipboardList],
  ["crm", "Customers (CRM)", Building2],
  ["certificates", "Registration Certificates", BadgeCheck],
  ["company-users", "Company User Access", Users],
  ["suppliers", "Suppliers", Factory],
  ["ai-prices", "AI Market Price Intelligence", Target],
  ["ai-duplicates", "AI Duplicate Catalogue Cleaner", Search],
  ["events-tickets", "Events & Tickets", ScrollText],
  ["company-menu", "Company Menu", Menu],
  ["company-content", "Company Content", FileText],
  ["catalogue", "Catalogue Management", Package],
  ["inventory", "Inventory & Warehouses", Warehouse],
  ["finance", "Finance", Landmark],
  ["igf", "IGF — Revenue Sources", DollarSign],
  ["foundation", "AJ-PROXIS Foundation", Heart],
  ["loyalty", "Rewards Program", Gift],
  ["announcements", "Announcements", Megaphone],
  ["credit-requests", "Credit & Budget Requests", TrendingUp],
  ["orders", "Orders & Delivery", Truck],
  ["support", "Support Tickets", LifeBuoy],
  ["reviews", "Reviews & Feedback", Star],
  ["compliance", "Compliance Review", ShieldCheck],
  ["documents", "Documents", ScrollText],
  ["reports", "Reports & Analytics", PieIcon],
  ["users", "Users & Roles", Users],
  ["staff-access", "Staff Portal Access", Settings],
  ["password-resets", "Password Resets", KeyRound],
  ["security", "Security & Audit", Lock],
  ["architecture", "Platform Blueprint", Globe],
];
