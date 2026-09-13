import { useState } from "react";
import { Search, Users, CheckCircle2, XCircle, BadgeCheck, Loader2, Target } from "lucide-react";
import { Btn } from "../../atoms/Btn.jsx";
import { Card } from "../../atoms/Card.jsx";
import { SectionTitle } from "../../atoms/SectionTitle.jsx";
import { Badge, statusTone } from "../../atoms/Badge.jsx";
import { Field } from "../../atoms/Field.jsx";
import { TextInput } from "../../atoms/TextInput.jsx";
import { Select } from "../../atoms/Select.jsx";
import { Table } from "../../molecules/Table.jsx";
import { VendorCertificateModal } from "../../molecules/VendorCertificateModal.jsx";
import { C } from "../../shared/tokens.js";
import { GHS, pad } from "../../shared/helpers.js";
import { fetchAiMarketPrice } from "../../shared/ai.js";
import { CATEGORIES } from "../../data/seed.js";
import { useStaff, useStore } from "../../store/StoreContext.js";
import { Catalogue } from "../customer/Catalogue.jsx";
import { AddProductModal } from "./AddProductModal.jsx";
import { EditProductModal } from "./EditProductModal.jsx";

export function AdminSuppliers() {
  const { state, dispatch } = useStore();
  const me = useStaff();
  const [form, setForm] = useState({ name: "", categories: "office", location: "Accra", contact: "" });
  const [applyTarget, setApplyTarget] = useState(null);
  const [certFor, setCertFor] = useState(null);
  const [aiLoadingId, setAiLoadingId] = useState(null);
  const [aiErrorId, setAiErrorId] = useState(null);
  const [subSearch, setSubSearch] = useState("");
  const [subStatusFilter, setSubStatusFilter] = useState("Pending Review");
  const [subVisible, setSubVisible] = useState(50);
  const [bulkGenerating, setBulkGenerating] = useState(false);
  const [bulkDone, setBulkDone] = useState(null);

  function generateBulkNow() {
    setBulkGenerating(true);
    // Slight delay so the button's loading state is visible for this larger-than-usual operation.
    setTimeout(() => {
      dispatch({ type: "GENERATE_BULK_SUPPLIERS", count: 50, perSupplier: 200, generatedBy: me.name });
      setBulkGenerating(false);
      setBulkDone(`Generated 50 new suppliers with 10,000 pending price submissions.`);
      setTimeout(() => setBulkDone(null), 6000);
    }, 50);
  }

  function handleApply(sub) {
    const analysis = analysisFor(sub.id);
    const useAiPrice = analysis && analysis.status === "Approved";
    const finalPrice = useAiPrice ? analysis.aiSuggestedPrice : sub.price;
    const existing = state.products.find((p) => sub.sku && p.sku === sub.sku);
    if (existing) {
      setApplyTarget({ mode: "edit", product: { ...existing, price: finalPrice, unit: sub.unit || existing.unit }, subId: sub.id, usedAiPrice: useAiPrice });
    } else {
      setApplyTarget({ mode: "add", initial: { sku: sub.sku, name: sub.name, category: sub.category, unit: sub.unit, price: finalPrice }, subId: sub.id, usedAiPrice: useAiPrice });
    }
  }
  function handleDismiss(sub) {
    dispatch({ type: "REVIEW_SUPPLIER_SUBMISSION", id: sub.id, status: "Dismissed" });
  }
  function markApplied() {
    if (applyTarget) dispatch({ type: "REVIEW_SUPPLIER_SUBMISSION", id: applyTarget.subId, status: "Applied" });
  }
  function analysisFor(submissionId) {
    return state.priceAnalyses.find((p) => p.submissionId === submissionId);
  }
  async function runAiAnalysis(sub) {
    setAiLoadingId(sub.id);
    setAiErrorId(null);
    try {
      const result = await fetchAiMarketPrice(sub.name, sub.category, sub.price);
      dispatch({
        type: "SAVE_AI_PRICE_ANALYSIS",
        supplierId: sub.supplierId, supplierName: sub.supplierName, submissionId: sub.id,
        itemName: sub.name, category: sub.category, supplierPrice: sub.price,
        aiMarketLow: result.marketLow, aiMarketHigh: result.marketHigh,
        aiSuggestedPrice: result.suggestedPrice, aiRationale: result.rationale,
      });
    } catch (err) {
      setAiErrorId(sub.id);
    }
    setAiLoadingId(null);
  }

  return (
    <div>
      <SectionTitle sub="Supplier database, onboarding and performance scoring.">Suppliers</SectionTitle>
      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <Card pad={false} className="lg:col-span-2">
          <Table columns={[
            { key: "name", label: "Supplier" }, { key: "location", label: "Location" }, { key: "leadTime", label: "Lead Time", render: (r) => `${r.leadTime}d` },
            { key: "reliability", label: "Reliability", render: (r) => `${r.reliability}%` }, { key: "quality", label: "Quality", render: (r) => `${r.quality}%` }, { key: "delivery", label: "Delivery", render: (r) => `${r.delivery}%` },
            { key: "status", label: "Status", render: (r) => <Badge tone={statusTone(r.status || "Approved")}>{r.status || "Approved"}</Badge> },
            { key: "a", label: "", render: (r) => r.vendorCertificateId && <Btn size="sm" variant="ghost" icon={BadgeCheck} onClick={() => setCertFor(r)}>Certificate</Btn> },
          ]} rows={state.suppliers} />
        </Card>
        <Card>
          <div className="text-sm font-medium mb-2">Onboard Supplier</div>
          <div className="space-y-2">
            <Field label="Company name"><TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="Category"><Select value={form.categories} onChange={(e) => setForm({ ...form, categories: e.target.value })}>{CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}</Select></Field>
            <Field label="Location"><TextInput value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></Field>
            <Field label="Contact email"><TextInput value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} /></Field>
            <Btn onClick={() => { dispatch({ type: "ADD_SUPPLIER", payload: { ...form, categories: [form.categories] } }); setForm({ name: "", categories: "office", location: "Accra", contact: "" }); }}>Add Supplier</Btn>
          </div>
        </Card>
      </div>

      {me.isSuperAdmin && (
        <Card className="mb-6 flex flex-wrap items-center justify-between gap-3" style={{ backgroundColor: C.brandTint }}>
          <div>
            <div className="text-sm font-medium">Bulk-generate demo suppliers</div>
            <div className="text-xs" style={{ color: C.slate }}>Adds 50 new approved suppliers, each with 200 pending price submissions (10,000 total), to your current data.</div>
          </div>
          <div className="flex items-center gap-2">
            {bulkDone && <span className="text-xs flex items-center gap-1" style={{ color: C.green }}><CheckCircle2 size={13} /> {bulkDone}</span>}
            <Btn icon={bulkGenerating ? Loader2 : Users} disabled={bulkGenerating} onClick={generateBulkNow}>{bulkGenerating ? "Generating…" : "Generate 50 Suppliers"}</Btn>
          </div>
        </Card>
      )}
      {certFor && <VendorCertificateModal supplier={certFor} onClose={() => setCertFor(null)} />}

      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="text-sm font-medium">
          Supplier Price Submissions <span className="text-xs font-normal" style={{ color: C.slate }}>— visible only here in AJ-PROXIS Control Centre, never published automatically ({state.supplierSubmissions.length.toLocaleString()} total)</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mb-3">
        <TextInput className="w-64" placeholder="Search supplier or item name…" value={subSearch} onChange={(e) => { setSubSearch(e.target.value); setSubVisible(50); }} />
        <Select className="w-48" value={subStatusFilter} onChange={(e) => { setSubStatusFilter(e.target.value); setSubVisible(50); }}>
          <option value="">All Statuses</option>
          <option value="Pending Review">Pending Review</option>
          <option value="Applied">Applied</option>
          <option value="Dismissed">Dismissed</option>
        </Select>
      </div>
      {(() => {
        const q = subSearch.trim().toLowerCase();
        const filtered = state.supplierSubmissions.filter((r) =>
          (!subStatusFilter || r.status === subStatusFilter) &&
          (!q || r.supplierName.toLowerCase().includes(q) || r.name.toLowerCase().includes(q))
        );
        const shown = filtered.slice(0, subVisible);
        return (
          <>
            <Card pad={false}>
              <Table columns={[
                { key: "supplierName", label: "Supplier" }, { key: "name", label: "Item" },
                { key: "category", label: "Category", render: (r) => CATEGORIES.find((c) => c.key === r.category)?.label || r.category },
                { key: "price", label: "Submitted Price", render: (r) => GHS(r.price) },
                { key: "submittedAt", label: "Date" },
                { key: "status", label: "Status", render: (r) => <Badge tone={statusTone(r.status)}>{r.status}</Badge> },
                {
                  key: "ai", label: "AI Market Price Suggestion", render: (r) => {
                    const analysis = analysisFor(r.id);
                    if (aiErrorId === r.id) return <span className="text-xs" style={{ color: C.red }}>AI service unreachable — try again.</span>;
                    if (!analysis) {
                      return (
                        <Btn size="sm" variant="ghost" icon={aiLoadingId === r.id ? Loader2 : Target} disabled={aiLoadingId === r.id} onClick={() => runAiAnalysis(r)}>
                          {aiLoadingId === r.id ? "Analyzing…" : "Get AI Suggestion"}
                        </Btn>
                      );
                    }
                    return (
                      <div className="text-xs" style={{ minWidth: 180 }}>
                        <div>Market: {GHS(analysis.aiMarketLow)}–{GHS(analysis.aiMarketHigh)}</div>
                        <div className="font-semibold" style={{ color: C.brand }}>Suggested: {GHS(analysis.aiSuggestedPrice)}</div>
                        {analysis.status === "Pending Review" ? (
                          me.isSuperAdmin ? (
                            <div className="flex gap-1.5 mt-1">
                              <Btn size="sm" icon={CheckCircle2} onClick={() => dispatch({ type: "APPROVE_AI_PRICE_ANALYSIS", id: analysis.id, decidedBy: me.name })}>Approve</Btn>
                              <Btn size="sm" variant="ghost" icon={XCircle} onClick={() => dispatch({ type: "DISMISS_AI_PRICE_ANALYSIS", id: analysis.id })}>Dismiss</Btn>
                            </div>
                          ) : (
                            <div className="mt-1" style={{ color: C.slate }}>Awaiting Super Administrator approval</div>
                          )
                        ) : (
                          <Badge tone={statusTone(analysis.status)}>{analysis.status}</Badge>
                        )}
                      </div>
                    );
                  },
                },
                { key: "a", label: "", render: (r) => {
                  const analysis = analysisFor(r.id);
                  const aiApproved = analysis && analysis.status === "Approved";
                  return r.status === "Pending Review" && (
                    <div className="flex flex-col items-start gap-1">
                      {aiApproved && <span className="text-[10px]" style={{ color: C.brand }}>Will use approved AI price {GHS(analysis.aiSuggestedPrice)}</span>}
                      <div className="flex gap-2">
                        <Btn size="sm" icon={aiApproved ? Target : undefined} onClick={() => handleApply(r)}>Apply to Catalogue</Btn>
                        <Btn size="sm" variant="ghost" onClick={() => handleDismiss(r)}>Dismiss</Btn>
                      </div>
                    </div>
                  );
                } },
              ]} rows={shown} empty="No supplier price submissions match your filters." />
            </Card>
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs" style={{ color: C.slate }}>Showing {shown.length.toLocaleString()} of {filtered.length.toLocaleString()} submissions</span>
              {subVisible < filtered.length && (
                <Btn size="sm" variant="subtle" onClick={() => setSubVisible((v) => v + 50)}>Load 50 More</Btn>
              )}
            </div>
          </>
        );
      })()}

      {applyTarget?.mode === "edit" && (
        <EditProductModal product={applyTarget.product} onClose={() => setApplyTarget(null)} onSaved={markApplied} aiPriceApplied={applyTarget.usedAiPrice} />
      )}
      {applyTarget?.mode === "add" && (
        <AddProductModal initial={applyTarget.initial} onClose={() => setApplyTarget(null)} onSaved={markApplied} aiPriceApplied={applyTarget.usedAiPrice} />
      )}
    </div>
  );
}

