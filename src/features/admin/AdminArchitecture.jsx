import { Search } from "lucide-react";
import { Card } from "../../atoms/Card.jsx";
import { SectionTitle } from "../../atoms/SectionTitle.jsx";
import { C } from "../../shared/tokens.js";
import { Catalogue } from "../customer/Catalogue.jsx";
import { Quotations } from "../customer/Quotations.jsx";

export function AdminArchitecture() {
  const tables = ["users", "organizations", "employees", "roles", "permissions", "products", "categories", "brands", "product_variants", "product_prices", "inventory", "suppliers", "supplier_quotes", "procurement_requests", "rfqs", "rfq_items", "quotations", "quotation_items", "carts", "orders", "order_items", "purchase_orders", "payments", "wallets", "transactions", "invoices", "receipts", "warehouses", "deliveries", "drivers", "proof_of_delivery", "contracts", "budgets", "approvals", "returns", "audit_logs"];
  const stack = [
    ["Frontend", "Next.js / React"], ["Mobile", "Flutter (Android & iOS)"], ["Backend", "Node.js/NestJS or Laravel"],
    ["Database", "PostgreSQL"], ["Cache", "Redis"], ["Search", "Elasticsearch / OpenSearch"],
    ["Auth", "OAuth / JWT + 2FA"], ["Payments", "Paystack, Hubtel, Flutterwave, direct bank APIs"], ["Notifications", "Email + SMS + WhatsApp API"],
  ];
  const phases = [
    ["Phase 1 — MVP", "Registration, catalogue, cart, procurement requests, quotations, orders, payments, invoices, admin dashboard, delivery tracking."],
    ["Phase 2 — Corporate Procurement", "Multi-user organizations, approval workflows, purchase orders, budgets, corporate credit, contracts, recurring orders, bulk uploads."],
    ["Phase 3 — Marketplace", "Supplier portal, multi-vendor catalogue, supplier RFQs, scoring, competitive bidding, inventory sync."],
    ["Phase 4 — Intelligent Procurement", "AI procurement assistant, automated matching, demand forecasting, automated supplier selection."],
    ["Phase 5 — National Expansion", "Multiple warehouses, regional delivery network, institutional procurement, import/export sourcing."],
  ];
  const revenue = [
    ["Product margin", "Difference between procurement cost and selling price."],
    ["Procurement service fee", "3–15% fee on custom sourcing, depending on category and complexity."],
    ["Delivery fees", "Charged per order based on distance and volume."],
    ["Corporate subscription", "Monthly or yearly fee for premium organizations."],
    ["Supplier commission", "Approved suppliers pay a commission on transactions generated through the platform."],
    ["Contract procurement", "Long-term institutional supply agreements."],
    ["Importation service", "Sourcing, import management, freight handling, clearing coordination, local delivery fees."],
  ];
  return (
    <div className="space-y-8">
      <div>
        <SectionTitle sub="Recommended technology for a serious commercial deployment.">Technology Stack</SectionTitle>
        <div className="grid sm:grid-cols-3 gap-3">{stack.map(([l, v]) => <Card key={l}><div className="text-xs uppercase" style={{ color: C.slate }}>{l}</div><div className="font-medium mt-0.5">{v}</div></Card>)}</div>
      </div>
      <div>
        <SectionTitle sub="A scalable schema covering every module in the platform.">Database Structure</SectionTitle>
        <Card><div className="flex flex-wrap gap-1.5">{tables.map((t) => <span key={t} className="text-[11px] px-2 py-1 rounded" style={{ backgroundColor: C.brandTint, color: C.brandDark }}>{t}</span>)}</div></Card>
      </div>
      <div>
        <SectionTitle sub="How AJ-PROXIS Procure grows from MVP to a national procurement ecosystem.">Development Roadmap</SectionTitle>
        <div className="space-y-2">
          {phases.map(([t, d]) => (
            <Card key={t} className="flex gap-3">
              <div className="w-1 rounded" style={{ backgroundColor: C.brand }} />
              <div><div className="font-medium text-sm">{t}</div><div className="text-sm mt-0.5" style={{ color: C.slate }}>{d}</div></div>
            </Card>
          ))}
        </div>
      </div>
      <div>
        <SectionTitle sub="Multiple revenue channels beyond simple product margin.">Business Model</SectionTitle>
        <div className="grid sm:grid-cols-2 gap-3">{revenue.map(([t, d]) => <Card key={t}><div className="font-medium text-sm">{t}</div><div className="text-xs mt-1" style={{ color: C.slate }}>{d}</div></Card>)}</div>
      </div>
      <div>
        <SectionTitle sub="Platform, mobile and future marketplace structure.">Ecosystem & Access Points</SectionTitle>
        <div className="grid sm:grid-cols-2 gap-3">
          <Card>
            <div className="font-medium text-sm mb-1">Web Platform</div>
            <div className="text-xs" style={{ color: C.slate }}>www.ajproxis.com/procure — Catalogue, Login, Register, Request Procurement, My Orders, Quotations, Payments, Track Delivery.</div>
          </Card>
          <Card>
            <div className="font-medium text-sm mb-1">Mobile Apps</div>
            <div className="text-xs" style={{ color: C.slate }}>Android and iOS apps (roadmap) for browsing, requesting, approving, paying, tracking and chatting with procurement officers on the go.</div>
          </Card>
          <Card>
            <div className="font-medium text-sm mb-1">AJ-PROXIS Ecosystem</div>
            <div className="text-xs" style={{ color: C.slate }}>Procure (procurement) + Logistics (delivery) + Pay (payments), serving schools, companies and institutions from one account.</div>
          </Card>
          <Card>
            <div className="font-medium text-sm mb-1">Future Marketplace Model</div>
            <div className="text-xs" style={{ color: C.slate }}>AJ-PROXIS, local suppliers and importers list to one catalogue; AJ-PROXIS earns commission while still fulfilling directly.</div>
          </Card>
        </div>
      </div>
    </div>
  );
}

