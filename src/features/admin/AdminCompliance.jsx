import { useState } from "react";
import { Search, Package, Truck, FileText, Users, Building2, ClipboardList, CheckCircle2, XCircle, TrendingUp, Warehouse, Settings, DollarSign, Star, LayoutDashboard, Landmark, Globe, Lock, Factory, BadgeCheck, ScrollText, ClipboardCheck, PieChart as PieIcon, LifeBuoy, ShieldCheck, Heart, KeyRound, Gift, Megaphone, Menu, Target } from "lucide-react";
import { Btn } from "../../atoms/Btn.jsx";
import { Card } from "../../atoms/Card.jsx";
import { SectionTitle } from "../../atoms/SectionTitle.jsx";
import { Badge, statusTone } from "../../atoms/Badge.jsx";
import { Field } from "../../atoms/Field.jsx";
import { TextArea } from "../../atoms/TextArea.jsx";
import { Modal } from "../../molecules/Modal.jsx";
import { Table } from "../../molecules/Table.jsx";
import { C } from "../../shared/tokens.js";
import { pad } from "../../shared/helpers.js";
import { useStore } from "../../store/StoreContext.js";
import { Catalogue } from "../customer/Catalogue.jsx";

export function AdminCompliance() {
  const { state, dispatch } = useStore();
  const [reviewing, setReviewing] = useState(null);
  const [note, setNote] = useState("");

  function decide(status) {
    if (!reviewing) return;
    dispatch({ type: "REVIEW_COMPLIANCE_DOC", id: reviewing.id, status, note });
    setReviewing(null); setNote("");
  }

  const pending = state.complianceDocs.filter((d) => d.status === "Pending Review");
  const reviewed = state.complianceDocs.filter((d) => d.status !== "Pending Review");

  return (
    <div>
      <SectionTitle sub="Verify customer compliance documents before clearing them for institutional procurement or higher credit limits.">Compliance Review</SectionTitle>
      <div className="text-sm font-medium mb-2">Pending Review</div>
      <Card pad={false} className="mb-5">
        <Table columns={[
          { key: "orgName", label: "Customer" }, { key: "docType", label: "Document" }, { key: "fileName", label: "File" },
          { key: "expiryDate", label: "Expiry" }, { key: "uploadedAt", label: "Uploaded" },
          { key: "a", label: "", render: (r) => <Btn size="sm" onClick={() => setReviewing(r)}>Review</Btn> },
        ]} rows={pending} empty="No compliance documents awaiting review." />
      </Card>
      <div className="text-sm font-medium mb-2">Reviewed</div>
      <Card pad={false}>
        <Table columns={[
          { key: "orgName", label: "Customer" }, { key: "docType", label: "Document" },
          { key: "status", label: "Status", render: (r) => <Badge tone={statusTone(r.status)}>{r.status}</Badge> },
          { key: "note", label: "Note", render: (r) => r.note || "—" },
        ]} rows={reviewed} empty="Nothing reviewed yet." />
      </Card>

      {reviewing && (
        <Modal title={`Review ${reviewing.docType}`} onClose={() => setReviewing(null)}>
          <div className="text-sm mb-1"><b>{reviewing.orgName}</b></div>
          <div className="text-xs mb-3" style={{ color: C.slate }}>File: {reviewing.fileName} {reviewing.expiryDate && `· Expires ${reviewing.expiryDate}`}</div>
          <Field label="Note (optional)"><TextArea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Reason for approval/rejection, or conditions." /></Field>
          <div className="flex gap-2 mt-3">
            <Btn icon={CheckCircle2} onClick={() => decide("Approved")}>Approve</Btn>
            <Btn variant="danger" icon={XCircle} onClick={() => decide("Rejected")}>Reject</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

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

