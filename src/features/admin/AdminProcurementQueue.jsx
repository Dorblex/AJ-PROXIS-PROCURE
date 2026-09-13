import { useState } from "react";
import { FileText, CheckCircle2, XCircle, MapPin, Factory, Send, Printer } from "lucide-react";
import { Line } from "recharts";
import { Btn } from "../../atoms/Btn.jsx";
import { Card } from "../../atoms/Card.jsx";
import { SectionTitle } from "../../atoms/SectionTitle.jsx";
import { Badge, statusTone } from "../../atoms/Badge.jsx";
import { Field } from "../../atoms/Field.jsx";
import { TextInput } from "../../atoms/TextInput.jsx";
import { TextArea } from "../../atoms/TextArea.jsx";
import { Select } from "../../atoms/Select.jsx";
import { Modal } from "../../molecules/Modal.jsx";
import { Table } from "../../molecules/Table.jsx";
import { Row } from "../../molecules/Row.jsx";
import { C } from "../../shared/tokens.js";
import { GHS, pad, taxBreakdown } from "../../shared/helpers.js";
import { CATEGORIES } from "../../data/seed.js";
import { useStore } from "../../store/StoreContext.js";
import { Quotations } from "../customer/Quotations.jsx";
import { Info } from "./Info.jsx";

export function AdminProcurementQueue() {
  const { state, dispatch } = useStore();
  const [quoteFor, setQuoteFor] = useState(null);
  const [unitPrice, setUnitPrice] = useState(100);
  const [decideFor, setDecideFor] = useState(null);
  const [note, setNote] = useState("");
  const [assignFor, setAssignFor] = useState(null);
  const [supplierPick, setSupplierPick] = useState("");
  const [rfqQuoteFor, setRfqQuoteFor] = useState(null);
  const [rfqSupplierPick, setRfqSupplierPick] = useState("");
  const [rfqPrices, setRfqPrices] = useState({});
  const [viewPaidQuotation, setViewPaidQuotation] = useState(null);

  function decide(decision) {
    if (!decideFor) return;
    dispatch({ type: "DECIDE_NEGOTIATION", id: decideFor.id, decision, note });
    setDecideFor(null); setNote("");
  }

  function openAssign(req) {
    const approved = state.suppliers.filter((s) => s.status !== "Pending" && s.status !== "Rejected");
    const relevant = approved.filter((s) => s.categories.includes(req.category));
    const pool = relevant.length ? relevant : approved;
    setSupplierPick(req.assignedSupplierId || pool[0]?.id || "");
    setAssignFor({ ...req, pool });
  }

  function confirmAssign() {
    if (!assignFor || !supplierPick) return;
    dispatch({ type: "ASSIGN_SUPPLIER_TO_REQUEST", id: assignFor.id, supplierId: supplierPick });
    setAssignFor(null); setSupplierPick("");
  }

  function openRfqQuote(rfq) {
    const approved = state.suppliers.filter((s) => s.status !== "Pending" && s.status !== "Rejected");
    const relevant = approved.filter((s) => rfq.items.some((it) => s.categories.includes(it.category)));
    const pool = relevant.length ? relevant : approved;
    setRfqSupplierPick(rfq.selectedSupplier || pool[0]?.id || "");
    const initialPrices = {};
    rfq.items.forEach((it) => { initialPrices[it.name] = it.unitPrice || 0; });
    setRfqPrices(initialPrices);
    setRfqQuoteFor({ ...rfq, pool });
  }

  function confirmRfqQuote() {
    if (!rfqQuoteFor) return;
    dispatch({ type: "ADMIN_QUOTE_RFQ", id: rfqQuoteFor.id, supplierId: rfqSupplierPick, itemPrices: rfqPrices });
    setRfqQuoteFor(null);
  }

  const negotiations = state.quotations.filter((q) => q.status === "Negotiation Requested");

  return (
    <div>
      <SectionTitle sub="Custom requests, RFQs and quotation negotiations awaiting Control Centre action.">Procurement Requests & RFQs</SectionTitle>

      <div className="text-sm font-medium mb-2">
        Quotations Awaiting Negotiation Decision {negotiations.length > 0 && <Badge tone="amber">{negotiations.length}</Badge>}
      </div>
      <Card pad={false} className="mb-6">
        <Table
          columns={[
            { key: "orgName", label: "Customer" }, { key: "id", label: "Quotation" },
            { key: "current", label: "Current Price", render: (r) => GHS(r.history.length > 1 ? r.history[r.history.length - 2].price : r.subtotal) },
            { key: "requested", label: "Requested Price", render: (r) => GHS(r.negotiation.requestedPrice) },
            { key: "reason", label: "Reason", render: (r) => r.negotiation.reason || "—" },
            { key: "a", label: "", render: (r) => <Btn size="sm" onClick={() => setDecideFor(r)}>Review</Btn> },
          ]}
          rows={negotiations}
          empty="No price negotiations awaiting a decision."
        />
      </Card>

      <div className="text-sm font-medium mb-2">
        Paid Quotations <span className="text-xs font-normal" style={{ color: C.slate }}>— every quotation customers have completed payment on. Click a row to view items and print.</span>
      </div>
      <Card pad={false} className="mb-6">
        <Table
          columns={[
            { key: "id", label: "Quotation" }, { key: "orgName", label: "Customer" },
            { key: "kind", label: "Source" },
            { key: "supplierName", label: "Supplier", render: (r) => r.supplierName || "—" },
            { key: "amount", label: "Amount Paid", render: (r) => GHS(taxBreakdown(r.subtotal, r.discount || 0, r.delivery || 0).grand) },
            { key: "createdAt", label: "Quoted On" },
            { key: "a", label: "", render: (r) => <Btn size="sm" variant="ghost" icon={FileText} onClick={() => setViewPaidQuotation(r)}>View & Print</Btn> },
          ]}
          rows={state.quotations.filter((q) => q.status === "Paid")}
          empty="No paid quotations yet."
          onRowClick={(r) => setViewPaidQuotation(r)}
        />
      </Card>

      <div className="text-sm font-medium mb-2">Custom Procurement Requests</div>
      <Card pad={false} className="mb-6">
        <Table
          columns={[
            { key: "id", label: "Request" }, { key: "item", label: "Item" },
            { key: "category", label: "Category", render: (r) => CATEGORIES.find((c) => c.key === r.category)?.label || r.category },
            { key: "qty", label: "Qty" }, { key: "requiredDate", label: "Needed By" },
            { key: "requestedAt", label: "Requested At", render: (r) => r.createdAt },
            { key: "eta", label: "Est. Delivery", render: (r) => r.estimatedDeliveryPeriod || "—" },
            { key: "supplier", label: "Allocated Supplier", render: (r) => r.assignedSupplierName ? <Badge tone="brand">{r.assignedSupplierName}</Badge> : <span className="text-xs" style={{ color: C.slate }}>Not assigned</span> },
            { key: "status", label: "Status", render: (r) => <Badge tone={statusTone(r.status)}>{r.status}</Badge> },
            { key: "a", label: "", render: (r) => r.status !== "Quoted" && (
              <div className="flex gap-2">
                <Btn size="sm" variant="ghost" icon={Factory} onClick={() => openAssign(r)}>{r.assignedSupplierName ? "Reassign" : "Allocate Supplier"}</Btn>
                <Btn size="sm" onClick={() => { setQuoteFor(r); setUnitPrice(100); }}>Prepare Quotation</Btn>
              </div>
            ) },
          ]}
          rows={state.requests}
        />
      </Card>
      <div className="text-sm font-medium mb-2">RFQs</div>
      <div className="space-y-3">
        {state.rfqs.map((r) => (
          <Card key={r.id}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="font-medium">{r.id} {r.institutional && <Badge tone="brand">Institutional / Tender</Badge>}</div>
                <div className="text-xs" style={{ color: C.slate }}>{r.orgName} · Requested {r.createdAt}{r.estimatedDeliveryPeriod && ` · Est. delivery ${r.estimatedDeliveryPeriod}`}</div>
              </div>
              <Badge tone={statusTone(r.status)}>{r.status}</Badge>
            </div>
            <Table columns={[{ key: "name", label: "Item" }, { key: "qty", label: "Qty" }, { key: "category", label: "Category" }]} rows={r.items} />
            {r.status !== "Supplier Selected" && (
              <div className="flex flex-wrap gap-2 mt-2">
                <Btn size="sm" icon={Send} onClick={() => dispatch({ type: "GENERATE_SUPPLIER_QUOTES", id: r.id })}>Send RFQ to Suppliers</Btn>
                <Btn size="sm" variant="subtle" icon={Factory} onClick={() => openRfqQuote(r)}>Allocate Supplier & Set Exact Price</Btn>
              </div>
            )}
            {r.selectedSupplier && r.status === "Supplier Selected" && (
              <div className="text-xs mt-2 flex items-center gap-1" style={{ color: C.brand }}>
                <Factory size={13} /> Allocated to {state.suppliers.find((s) => s.id === r.selectedSupplier)?.name || "supplier"}
              </div>
            )}
            {r.supplierQuotes.length > 0 && (
              <div className="mt-3">
                <div className="text-xs font-medium mb-1" style={{ color: C.slate }}>Supplier Competitive Quotations</div>
                <Table columns={[
                  { key: "supplierName", label: "Supplier" }, { key: "price", label: "Price", render: (x) => GHS(x.price) },
                  { key: "deliveryDays", label: "Delivery", render: (x) => `${x.deliveryDays} days` }, { key: "score", label: "Score", render: (x) => `${x.score}%` },
                  { key: "a", label: "", render: (x) => r.status !== "Supplier Selected" && <Btn size="sm" variant="subtle" onClick={() => dispatch({ type: "SELECT_SUPPLIER_QUOTE", id: r.id, supplierId: x.supplierId })}>Select</Btn> },
                ]} rows={r.supplierQuotes} />
              </div>
            )}
          </Card>
        ))}
        {!state.rfqs.length && <Card className="text-center py-8 text-sm" style={{ color: C.slate }}>No RFQs yet.</Card>}
      </div>
      {assignFor && (
        <Modal title={`Allocate Supplier — ${assignFor.id}`} onClose={() => setAssignFor(null)}>
          <p className="text-sm mb-3" style={{ color: C.slate }}>{assignFor.qty} × {assignFor.item} ({CATEGORIES.find((c) => c.key === assignFor.category)?.label})</p>
          <Field label="Supplier">
            <Select value={supplierPick} onChange={(e) => setSupplierPick(e.target.value)}>
              {assignFor.pool.length === 0 && <option value="">No approved suppliers available</option>}
              {assignFor.pool.map((s) => <option key={s.id} value={s.id}>{s.name} — {s.location}</option>)}
            </Select>
          </Field>
          <Btn className="mt-3" icon={Factory} disabled={!supplierPick} onClick={confirmAssign}>Allocate Supplier</Btn>
        </Modal>
      )}
      {rfqQuoteFor && (
        <Modal title={`Allocate Supplier & Set Exact Price — ${rfqQuoteFor.id}`} onClose={() => setRfqQuoteFor(null)} wide>
          <p className="text-sm mb-2" style={{ color: C.slate }}>{rfqQuoteFor.orgName}</p>
          <Field label="Supplier">
            <Select value={rfqSupplierPick} onChange={(e) => setRfqSupplierPick(e.target.value)}>
              <option value="">No supplier (Control Centre direct)</option>
              {rfqQuoteFor.pool.map((s) => <option key={s.id} value={s.id}>{s.name} — {s.location}</option>)}
            </Select>
          </Field>
          <div className="mt-3 space-y-2">
            <div className="text-xs font-medium" style={{ color: C.slate }}>Exact price per item</div>
            {rfqQuoteFor.items.map((it) => (
              <div key={it.name} className="grid grid-cols-3 gap-2 items-center">
                <span className="text-sm col-span-1">{it.name} <span className="text-xs" style={{ color: C.slate }}>× {it.qty}</span></span>
                <TextInput type="number" className="col-span-1" value={rfqPrices[it.name] ?? 0} onChange={(e) => setRfqPrices({ ...rfqPrices, [it.name]: e.target.value })} />
                <span className="text-xs col-span-1" style={{ color: C.slate }}>Line total: {GHS((Number(rfqPrices[it.name]) || 0) * it.qty)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 text-sm font-medium">
            Estimated subtotal: {GHS(rfqQuoteFor.items.reduce((s, it) => s + (Number(rfqPrices[it.name]) || 0) * it.qty, 0))}
          </div>
          <Btn className="mt-3" icon={Send} onClick={confirmRfqQuote}>Send Quotation to Customer</Btn>
        </Modal>
      )}
      {quoteFor && (
        <Modal title={`Prepare Quotation — ${quoteFor.id}`} onClose={() => setQuoteFor(null)}>
          <p className="text-sm mb-1">{quoteFor.qty} × {quoteFor.item}</p>
          {quoteFor.assignedSupplierName ? (
            <p className="text-xs mb-2 flex items-center gap-1" style={{ color: C.brand }}><Factory size={13} /> Sourcing from {quoteFor.assignedSupplierName}</p>
          ) : (
            <p className="text-xs mb-2" style={{ color: C.slate }}>No supplier allocated yet — you can still quote directly, or close this and use "Allocate Supplier" first.</p>
          )}
          {quoteFor.estimatedDeliveryFee != null && (
            <p className="text-xs mb-3 flex items-center gap-1" style={{ color: C.slate }}><MapPin size={13} /> Delivery to "{quoteFor.deliveryAddress}" auto-estimated at {GHS(quoteFor.estimatedDeliveryFee)} (~{quoteFor.deliveryKm}km).</p>
          )}
          <Field label="Unit price (GHS)"><TextInput type="number" value={unitPrice} onChange={(e) => setUnitPrice(Number(e.target.value))} /></Field>
          <Btn className="mt-3" onClick={() => { dispatch({ type: "ADMIN_QUOTE_CUSTOM_REQUEST", id: quoteFor.id, unitPrice }); setQuoteFor(null); }}>Send Quotation to Customer</Btn>
        </Modal>
      )}
      {decideFor && (
        <Modal title={`Negotiation — ${decideFor.id}`} onClose={() => setDecideFor(null)} wide>
          <div className="text-sm mb-1"><b>{decideFor.orgName}</b></div>
          <Table columns={[{ key: "name", label: "Item" }, { key: "qty", label: "Qty" }, { key: "unitPrice", label: "Unit Price", render: (r) => GHS(r.unitPrice) }]} rows={decideFor.items} />
          <div className="grid sm:grid-cols-2 gap-3 my-3 text-sm">
            <Info l="Current Price" v={GHS(decideFor.history.length > 1 ? decideFor.history[decideFor.history.length - 2].price : decideFor.subtotal)} />
            <Info l="Customer's Requested Price" v={GHS(decideFor.negotiation.requestedPrice)} />
          </div>
          {decideFor.negotiation.reason && <p className="text-sm mb-3" style={{ color: C.inkSoft }}>Reason given: "{decideFor.negotiation.reason}"</p>}
          <Field label="Note to customer (optional)"><TextArea rows={2} value={note} onChange={(e) => setNote(e.target.value)} /></Field>
          <div className="flex gap-2 mt-3">
            <Btn icon={CheckCircle2} onClick={() => decide("Accepted")}>Accept New Price</Btn>
            <Btn variant="danger" icon={XCircle} onClick={() => decide("Rejected")}>Reject — Keep Original Price</Btn>
          </div>
        </Modal>
      )}

      {viewPaidQuotation && (() => {
        const tax = taxBreakdown(viewPaidQuotation.subtotal, viewPaidQuotation.discount || 0, viewPaidQuotation.delivery || 0);
        return (
          <Modal title={`Paid Quotation — ${viewPaidQuotation.id}`} onClose={() => setViewPaidQuotation(null)} wide>
            <div className="printable-doc">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div>
                  <div className="font-medium">{viewPaidQuotation.id} <span className="text-xs" style={{ color: C.slate }}>· {viewPaidQuotation.kind} · from {viewPaidQuotation.origin}</span></div>
                  <div className="text-xs" style={{ color: C.slate }}>{viewPaidQuotation.orgName} · Quoted {viewPaidQuotation.createdAt}{viewPaidQuotation.supplierName && ` · Sourced from ${viewPaidQuotation.supplierName}`}</div>
                </div>
                <Badge tone="green">Paid</Badge>
              </div>
              <Table
                columns={[{ key: "name", label: "Item" }, { key: "qty", label: "Qty" }, { key: "unitPrice", label: "Unit Price", render: (r) => GHS(r.unitPrice) }, { key: "t", label: "Line Total", render: (r) => GHS(r.unitPrice * r.qty) }]}
                rows={viewPaidQuotation.items}
              />
              <div className="grid sm:grid-cols-2 gap-4 mt-3">
                <div>
                  <Row l="Subtotal" v={GHS(viewPaidQuotation.subtotal)} />
                  <Row l="Discount" v={"-" + GHS(viewPaidQuotation.discount || 0)} />
                  <Row l="Delivery" v={GHS(viewPaidQuotation.delivery || 0)} />
                  <Row l="Taxes (NHIL/GETFund/VAT)" v={GHS(tax.nhil + tax.getfund + tax.vat)} />
                  <Row l="Grand Total Paid" v={GHS(tax.grand)} bold />
                </div>
                <div className="text-xs" style={{ color: C.slate }}>
                  {viewPaidQuotation.deliveryAddress && <div>Delivery address: {viewPaidQuotation.deliveryAddress}</div>}
                  {viewPaidQuotation.history?.length > 1 && <div className="mt-1">Price history: {viewPaidQuotation.history.map((h) => GHS(h.price)).join(" → ")}</div>}
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-4 pt-4 border-t" style={{ borderColor: C.border }}>
              <Btn size="sm" icon={Printer} onClick={() => window.print()}>Print</Btn>
              <Btn size="sm" variant="ghost" onClick={() => setViewPaidQuotation(null)}>Close</Btn>
            </div>
          </Modal>
        );
      })()}
    </div>
  );
}

