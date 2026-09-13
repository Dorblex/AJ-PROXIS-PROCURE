import { useState } from "react";
import { CheckCircle2, XCircle, Clock, Handshake, CreditCard, Send, ShieldCheck } from "lucide-react";
import { Line } from "recharts";
import { Btn } from "../../atoms/Btn.jsx";
import { Card } from "../../atoms/Card.jsx";
import { SectionTitle } from "../../atoms/SectionTitle.jsx";
import { Badge, statusTone } from "../../atoms/Badge.jsx";
import { Field } from "../../atoms/Field.jsx";
import { TextInput } from "../../atoms/TextInput.jsx";
import { TextArea } from "../../atoms/TextArea.jsx";
import { Modal } from "../../molecules/Modal.jsx";
import { Table } from "../../molecules/Table.jsx";
import { Row } from "../../molecules/Row.jsx";
import { PaymentMethodFields } from "../../molecules/PaymentMethodFields.jsx";
import { C } from "../../shared/tokens.js";
import { GHS, canSubmitPayment, taxBreakdown } from "../../shared/helpers.js";
import { PAYMENT_METHODS } from "../../data/seed.js";
import { useActingUser, useStore } from "../../store/StoreContext.js";
import { ActingUserSwitcher } from "./ActingUserSwitcher.jsx";

export function Quotations() {
  const { state, dispatch } = useStore();
  const [pay, setPay] = useState({});
  const [payValues, setPayValues] = useState({});
  const [negotiateFor, setNegotiateFor] = useState(null);
  const [reqPrice, setReqPrice] = useState("");
  const [reqReason, setReqReason] = useState("");
  const actingUser = useActingUser();

  function submitNegotiation() {
    if (!negotiateFor || !reqPrice || Number(reqPrice) <= 0) return;
    dispatch({ type: "REQUEST_NEGOTIATION", id: negotiateFor.id, requestedPrice: Number(reqPrice), reason: reqReason });
    setNegotiateFor(null); setReqPrice(""); setReqReason("");
  }

  return (
    <div>
      <SectionTitle sub="The approval chain: a Procurement Officer places the request, the CEO / Principal approves it for payment, and the Accountant processes payment.">My Quotations</SectionTitle>
      <Card className="mb-4">
        <ActingUserSwitcher compact />
      </Card>
      <div className="space-y-3">
        {state.quotations.map((q) => {
          const tax = taxBreakdown(q.subtotal, q.discount || 0, q.delivery || 0);
          const method = pay[q.id] || "mobile";
          const values = payValues[q.id] || {};
          const paymentReady = canSubmitPayment(method, values, state.wallet.balance, tax.grand);
          return (
            <Card key={q.id}>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div>
                  <div className="font-medium">{q.id} <span className="text-xs" style={{ color: C.slate }}>· {q.kind} · from {q.origin}</span></div>
                  <div className="text-xs" style={{ color: C.slate }}>{q.createdAt}{q.supplierName && ` · Sourced from ${q.supplierName}`}</div>
                </div>
                <Badge tone={statusTone(q.status)}>{q.status}</Badge>
              </div>
              <Table
                columns={[{ key: "name", label: "Item" }, { key: "qty", label: "Qty" }, { key: "unitPrice", label: "Unit Price", render: (r) => GHS(r.unitPrice) }, { key: "t", label: "Line Total", render: (r) => GHS(r.unitPrice * r.qty) }]}
                rows={q.items}
              />
              <div className="grid sm:grid-cols-2 gap-4 mt-3">
                <div>
                  <Row l="Subtotal" v={GHS(q.subtotal)} />
                  <Row l="Delivery" v={GHS(q.delivery || 0)} />
                  <Row l="Taxes (NHIL/GETFund/VAT)" v={GHS(tax.nhil + tax.getfund + tax.vat)} />
                  <Row l="Grand Total" v={GHS(tax.grand)} bold />
                </div>
                <div className="text-xs" style={{ color: C.slate }}>
                  <div>Payment terms: Net 30 on approved credit, or pay on approval.</div>
                  <div>Quotation valid for 7 days.</div>
                  {q.estimatedDeliveryPeriod && <div>Estimated delivery: <b style={{ color: C.ink }}>{q.estimatedDeliveryPeriod}</b> after payment.</div>}
                  {q.history.length > 1 && <div className="mt-1">Price history: {q.history.map((h) => GHS(h.price)).join(" → ")}</div>}
                </div>
              </div>
              {q.status === "Negotiation Requested" ? (
                <Card className="mt-3" style={{ backgroundColor: C.amberTint }}>
                  <div className="text-sm flex items-center gap-2" style={{ color: C.brandDark }}>
                    <Clock size={14} color={C.amber} /> You requested {GHS(q.negotiation.requestedPrice)}{q.negotiation.reason ? ` — "${q.negotiation.reason}"` : ""}. Awaiting AJ-PROXIS Control Centre's decision.
                  </div>
                </Card>
              ) : q.status === "Awaiting Customer" || q.status.startsWith("Revised") ? (
                <div>
                  {q.negotiation?.decision === "Rejected" && (
                    <div className="text-xs mb-2 flex items-center gap-1.5" style={{ color: C.red }}><XCircle size={13} /> Your last price request was declined by AJ-PROXIS Control Centre{q.negotiation.note ? `: ${q.negotiation.note}` : "."} Original price stands.</div>
                  )}
                  {q.negotiation?.decision === "Accepted" && (
                    <div className="text-xs mb-2 flex items-center gap-1.5" style={{ color: C.green }}><CheckCircle2 size={13} /> AJ-PROXIS Control Centre accepted your requested price{q.negotiation.note ? `: ${q.negotiation.note}` : "."}</div>
                  )}
                  {!actingUser.isTopApprover && (
                    <Card className="mb-2" style={{ backgroundColor: C.amberTint }}>
                      <div className="text-xs flex items-center gap-1.5" style={{ color: C.brandDark }}>
                        <ShieldCheck size={13} /> Only the CEO / Principal can approve this quotation for payment. You can still negotiate or reject as {actingUser.name} ({actingUser.role}).
                      </div>
                    </Card>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <Btn size="sm" icon={CheckCircle2} disabled={!actingUser.isTopApprover} onClick={() => dispatch({ type: "APPROVE_QUOTATION", id: q.id })}>Approve</Btn>
                    <Btn size="sm" variant="ghost" icon={Handshake} onClick={() => { setNegotiateFor(q); setReqPrice(Math.round(q.subtotal * 0.94)); setReqReason(""); }}>Negotiate Price</Btn>
                    <Btn size="sm" variant="danger" icon={XCircle} onClick={() => dispatch({ type: "REJECT_QUOTATION", id: q.id })}>Reject</Btn>
                  </div>
                </div>
              ) : q.status === "Approved" ? (
                <div className="mt-3">
                  <div className="text-xs mb-2 flex items-center gap-1.5" style={{ color: C.green }}>
                    <CheckCircle2 size={13} /> Approved by the CEO / Principal — routed to the Accountant for payment.
                  </div>
                  {!actingUser.isPayer ? (
                    <Card style={{ backgroundColor: C.amberTint }}>
                      <div className="text-xs flex items-center gap-1.5" style={{ color: C.brandDark }}>
                        <ShieldCheck size={13} /> Only the Accountant can process payment for this quotation. You're currently signed in as {actingUser.name} ({actingUser.role}).
                      </div>
                    </Card>
                  ) : (
                    <>
                      <div className="space-y-1 mb-2">
                        {PAYMENT_METHODS.map((m) => (
                          <label key={m.key} className="flex items-center gap-2 text-sm">
                            <input type="radio" name={`pm-${q.id}`} checked={method === m.key} onChange={() => { setPay({ ...pay, [q.id]: m.key }); setPayValues({ ...payValues, [q.id]: {} }); }} /> {m.label}
                          </label>
                        ))}
                      </div>
                      <PaymentMethodFields method={method} values={values} setValues={(v) => setPayValues({ ...payValues, [q.id]: v })} walletBalance={state.wallet.balance} />
                      <Btn size="sm" className="mt-3" icon={CreditCard} disabled={!paymentReady} onClick={() => dispatch({ type: "PAY_QUOTATION", id: q.id, paymentMethod: method })}>Confirm & Pay</Btn>
                    </>
                  )}
                </div>
              ) : null}
            </Card>
          );
        })}
        {!state.quotations.length && <Card className="text-center py-10 text-sm" style={{ color: C.slate }}>No quotations yet — submit a procurement request or RFQ.</Card>}
      </div>

      {negotiateFor && (
        <Modal title={`Negotiate Price — ${negotiateFor.id}`} onClose={() => setNegotiateFor(null)}>
          <p className="text-sm mb-3" style={{ color: C.slate }}>Current price: {GHS(negotiateFor.subtotal)}. Propose your price — AJ-PROXIS Control Centre will accept or reject it.</p>
          <Field label="Your proposed price (GHS)"><TextInput type="number" value={reqPrice} onChange={(e) => setReqPrice(e.target.value)} /></Field>
          <Field label="Reason (optional)"><TextArea rows={3} className="mt-2" value={reqReason} onChange={(e) => setReqReason(e.target.value)} placeholder="e.g. bulk order, long-term relationship, competitor pricing" /></Field>
          <Btn className="mt-3" icon={Send} onClick={submitNegotiation}>Send to Control Centre</Btn>
        </Modal>
      )}
    </div>
  );
}

