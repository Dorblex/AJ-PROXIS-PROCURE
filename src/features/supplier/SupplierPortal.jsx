import { useState } from "react";
import { Truck, CheckCircle2, AlertTriangle, TrendingUp, Upload, Boxes, Send, Check, BadgeCheck, Loader2, Target } from "lucide-react";
import { Btn } from "../../atoms/Btn.jsx";
import { Card } from "../../atoms/Card.jsx";
import { SectionTitle } from "../../atoms/SectionTitle.jsx";
import { Badge, statusTone } from "../../atoms/Badge.jsx";
import { Field } from "../../atoms/Field.jsx";
import { TextInput } from "../../atoms/TextInput.jsx";
import { TextArea } from "../../atoms/TextArea.jsx";
import { Select } from "../../atoms/Select.jsx";
import { Table } from "../../molecules/Table.jsx";
import { VendorCertificateModal } from "../../molecules/VendorCertificateModal.jsx";
import { C } from "../../shared/tokens.js";
import { GHS, pad } from "../../shared/helpers.js";
import { fetchAiMarketPrice } from "../../shared/ai.js";
import { CATEGORIES } from "../../data/seed.js";
import { useStore, useSupplierAccount } from "../../store/StoreContext.js";
import { Shell } from "../../templates/Shell.jsx";
import { Catalogue } from "../customer/Catalogue.jsx";

export function SupplierPortal({ setRole }) {
  const { state, dispatch } = useStore();
  const [view, setView] = useState("rfqs");
  const me = useSupplierAccount();
  const openRfqs = state.rfqs.filter((r) => r.status === "Sourcing" || r.status === "Quotes Received");
  const nav = [["rfqs", "RFQs Received", Send], ["orders", "Confirmed Orders", Truck], ["inventory", "Catalogue Pricing", Boxes], ["submit-pricing", "Submit My Prices", Upload], ["market-prices", "AI Market Price Insights", TrendingUp], ["certificate", "Vendor Certificate", BadgeCheck]];

  const [form, setForm] = useState({ sku: "", name: "", category: CATEGORIES[0].key, unit: "unit", price: "", note: "" });
  const [bulkText, setBulkText] = useState("SKU,Name,Category,Unit,Price,Note\n,Reflective Safety Vest,safety,piece,55,Bulk discount available above 100 units");
  const [confirmMsg, setConfirmMsg] = useState("");
  const [checkForm, setCheckForm] = useState({ name: "", category: CATEGORIES[0].key, price: "" });
  const [checkLoading, setCheckLoading] = useState(false);
  const [checkResult, setCheckResult] = useState(null);
  const [checkError, setCheckError] = useState(false);
  const [showVendorCert, setShowVendorCert] = useState(false);

  async function runQuickCheck() {
    if (!checkForm.name.trim() || !checkForm.price) return;
    setCheckLoading(true);
    setCheckError(false);
    setCheckResult(null);
    try {
      const result = await fetchAiMarketPrice(checkForm.name, checkForm.category, Number(checkForm.price));
      setCheckResult(result);
    } catch (err) {
      setCheckError(true);
    }
    setCheckLoading(false);
  }

  function submitOne() {
    if (!form.name.trim() || !form.price) return;
    dispatch({ type: "SUBMIT_SUPPLIER_PRICE", supplierId: me.id, payload: form });
    setConfirmMsg("Price submitted to AJ-PROXIS Control Centre for review.");
    setForm({ sku: "", name: "", category: CATEGORIES[0].key, unit: "unit", price: "", note: "" });
  }

  function submitBulk() {
    const lines = bulkText.trim().split("\n").slice(1);
    const items = lines.map((l) => {
      const [sku, name, category, unit, price, note] = l.split(",").map((s) => (s || "").trim());
      return { sku, name, category: category || "office", unit: unit || "unit", price: Number(price) || 0, note };
    }).filter((i) => i.name);
    if (!items.length) return;
    dispatch({ type: "BULK_SUBMIT_SUPPLIER_PRICES", supplierId: me.id, items });
    setConfirmMsg(`${items.length} price(s) submitted to AJ-PROXIS Control Centre for review.`);
  }

  const mySubmissions = state.supplierSubmissions.filter((s) => s.supplierId === me.id);

  return (
    <Shell nav={nav} view={view} setView={setView} setRole={setRole} roleLabel="Supplier Portal" portal="supplier" roleOrg={`${me.name} · ${me.status}`}>
      {view === "rfqs" && (
        <div>
          <SectionTitle sub="Respond to AJ-PROXIS sourcing requests with your best price and lead time.">RFQs Received</SectionTitle>
          <div className="space-y-3">
            {openRfqs.map((r) => (
              <Card key={r.id}>
                <div className="font-medium mb-2">{r.id}</div>
                <Table columns={[{ key: "name", label: "Item" }, { key: "qty", label: "Qty" }]} rows={r.items} />
                {r.supplierQuotes.find((q) => q.supplierId === me.id) ? (
                  <Badge tone="green">Quote submitted</Badge>
                ) : (
                  <Btn size="sm" className="mt-2" onClick={() => dispatch({ type: "GENERATE_SUPPLIER_QUOTES", id: r.id })}>Submit Competitive Quote</Btn>
                )}
              </Card>
            ))}
            {!openRfqs.length && <Card className="text-center py-8 text-sm" style={{ color: C.slate }}>No open RFQs right now.</Card>}
          </div>
        </div>
      )}
      {view === "orders" && (
        <div>
          <SectionTitle sub="Orders AJ-PROXIS has confirmed with you.">Confirmed Orders</SectionTitle>
          <Card pad={false}>
            <Table columns={[{ key: "id", label: "RFQ" }, { key: "selectedSupplier", label: "Status", render: (r) => (r.selectedSupplier === me.id ? <Badge tone="green">Awarded to you</Badge> : <Badge tone="slate">Not awarded</Badge>) }]} rows={state.rfqs.filter((r) => r.selectedSupplier)} empty="No confirmed orders yet." />
          </Card>
        </div>
      )}
      {view === "inventory" && (
        <div>
          <SectionTitle sub="Reference pricing for your categories on the AJ-PROXIS catalogue — view only. Prices and new items are managed exclusively by AJ-PROXIS Control Centre.">Catalogue Reference Pricing</SectionTitle>
          <Card pad={false}>
            <Table columns={[{ key: "sku", label: "SKU" }, { key: "name", label: "Product" }, { key: "price", label: "AJ-PROXIS List Price", render: (r) => GHS(r.price) }]} rows={state.products.filter((p) => me.categories.includes(p.category)).slice(0, 12)} />
          </Card>
        </div>
      )}
      {view === "submit-pricing" && (
        <div>
          <SectionTitle sub="Send AJ-PROXIS Control Centre your pricing for new or updated items. Submissions go straight to Control Centre for review — they are never published to the customer catalogue or shown to other suppliers automatically.">Submit My Prices</SectionTitle>
          {confirmMsg && <Card className="mb-4 flex items-center gap-2"><CheckCircle2 size={15} color={C.green} /><span className="text-sm">{confirmMsg}</span></Card>}
          <div className="grid lg:grid-cols-2 gap-4">
            <Card>
              <div className="text-sm font-medium mb-2">Submit a single price</div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="SKU (optional)"><TextInput value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></Field>
                  <Field label="Category">
                    <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                      {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
                    </Select>
                  </Field>
                </div>
                <Field label="Item name"><TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Unit"><TextInput value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></Field>
                  <Field label="Your price (GHS)"><TextInput type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></Field>
                </div>
                <Field label="Note (optional)"><TextArea rows={2} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="MOQ, lead time, bulk terms, etc." /></Field>
                <Btn icon={Send} onClick={submitOne}>Submit to Control Centre</Btn>
              </div>
            </Card>
            <Card>
              <div className="text-sm font-medium mb-2">Bulk upload (CSV)</div>
              <p className="text-xs mb-2" style={{ color: C.slate }}>SKU, Name, Category, Unit, Price, Note — leave SKU blank if new.</p>
              <TextArea rows={6} value={bulkText} onChange={(e) => setBulkText(e.target.value)} />
              <Btn className="mt-3" icon={Upload} onClick={submitBulk}>Upload Prices</Btn>
            </Card>
          </div>
          <div className="mt-5">
            <div className="text-sm font-medium mb-2">My Submissions</div>
            <Card pad={false}>
              <Table columns={[
                { key: "name", label: "Item" }, { key: "category", label: "Category", render: (r) => CATEGORIES.find((c) => c.key === r.category)?.label || r.category },
                { key: "price", label: "Submitted Price", render: (r) => GHS(r.price) }, { key: "submittedAt", label: "Date" },
                { key: "status", label: "Status", render: (r) => <Badge tone={statusTone(r.status)}>{r.status}</Badge> },
              ]} rows={mySubmissions} empty="You haven't submitted any prices yet." />
            </Card>
          </div>
        </div>
      )}
      {view === "market-prices" && (
        <div>
          <SectionTitle sub="See how AJ-PROXIS Control Centre's AI price analysis compares your submitted prices to estimated Ghanaian market prices, or run your own quick check before submitting.">AI Market Price Insights</SectionTitle>
          <Card className="mb-4 flex items-start gap-2" style={{ backgroundColor: C.amberTint }}>
            <AlertTriangle size={15} color={C.brandDark} className="mt-0.5 shrink-0" />
            <span className="text-sm">Market prices are AI-generated estimates based on general knowledge, not live market data feeds — use them as a guide.</span>
          </Card>

          <Card className="mb-6 max-w-lg">
            <div className="text-sm font-medium mb-2">Quick Price Check</div>
            <Field label="Item name"><TextInput value={checkForm.name} onChange={(e) => setCheckForm({ ...checkForm, name: e.target.value })} /></Field>
            <Field label="Category">
              <Select value={checkForm.category} onChange={(e) => setCheckForm({ ...checkForm, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
              </Select>
            </Field>
            <Field label="Price you're considering (GHS)"><TextInput type="number" value={checkForm.price} onChange={(e) => setCheckForm({ ...checkForm, price: e.target.value })} /></Field>
            <Btn className="mt-2" icon={checkLoading ? Loader2 : Target} disabled={checkLoading || !checkForm.name.trim() || !checkForm.price} onClick={runQuickCheck}>{checkLoading ? "Checking…" : "Check Against Market"}</Btn>
            {checkError && <p className="text-xs mt-2" style={{ color: C.red }}>Couldn't reach the AI service — try again.</p>}
            {checkResult && (
              <Card className="mt-3" style={{ backgroundColor: C.brandTint }}>
                <div className="grid grid-cols-2 gap-3 mb-2">
                  <div><div className="text-xs" style={{ color: C.slate }}>AI Market Range</div><div className="font-semibold">{GHS(checkResult.marketLow)} – {GHS(checkResult.marketHigh)}</div></div>
                  <div><div className="text-xs" style={{ color: C.slate }}>AI Suggested Price</div><div className="font-semibold" style={{ color: C.brand }}>{GHS(checkResult.suggestedPrice)}</div></div>
                </div>
                <p className="text-xs" style={{ color: C.inkSoft }}>{checkResult.rationale}</p>
              </Card>
            )}
          </Card>

          <div className="text-sm font-medium mb-2">Analysis on My Submissions</div>
          <Card pad={false}>
            <Table columns={[
              { key: "itemName", label: "Item" },
              { key: "supplierPrice", label: "Your Price", render: (r) => GHS(r.supplierPrice) },
              { key: "aiMarketLow", label: "AI Market Range", render: (r) => `${GHS(r.aiMarketLow)} – ${GHS(r.aiMarketHigh)}` },
              { key: "aiSuggestedPrice", label: "AI Suggested", render: (r) => GHS(r.aiSuggestedPrice) },
              { key: "status", label: "Status", render: (r) => <Badge tone={statusTone(r.status)}>{r.status}</Badge> },
            ]} rows={state.priceAnalyses.filter((p) => p.supplierId === me.id)} empty="AJ-PROXIS Control Centre hasn't run an AI analysis on your submissions yet." />
          </Card>
        </div>
      )}
      {view === "certificate" && (
        <div>
          <SectionTitle sub="Your official AJ-PROXIS vendor certificate.">Vendor Certificate</SectionTitle>
          {me.vendorCertificateId ? (
            <Card className="max-w-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-medium">{me.vendorCertificateId}</div>
                  <div className="text-xs" style={{ color: C.slate }}>Issued {me.vendorCertificateIssuedAt}</div>
                </div>
                <Badge tone="green">Approved Vendor</Badge>
              </div>
              <Btn icon={BadgeCheck} onClick={() => setShowVendorCert(true)}>View Certificate</Btn>
            </Card>
          ) : (
            <Card className="max-w-lg text-center py-10 text-sm" style={{ color: C.slate }}>Your vendor certificate will be issued once your account is fully approved.</Card>
          )}
          {showVendorCert && <VendorCertificateModal supplier={me} onClose={() => setShowVendorCert(false)} />}
        </div>
      )}
    </Shell>
  );
}

