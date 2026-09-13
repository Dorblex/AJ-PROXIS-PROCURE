import { useState } from "react";
import { CheckCircle2, XCircle, Plus, Minus, Trash2, MapPin, Clock, CreditCard, Send, ShieldCheck } from "lucide-react";
import { Line } from "recharts";
import { Btn } from "../../atoms/Btn.jsx";
import { Card } from "../../atoms/Card.jsx";
import { SectionTitle } from "../../atoms/SectionTitle.jsx";
import { Badge, statusTone } from "../../atoms/Badge.jsx";
import { Table } from "../../molecules/Table.jsx";
import { Row } from "../../molecules/Row.jsx";
import { PaymentMethodFields } from "../../molecules/PaymentMethodFields.jsx";
import { C } from "../../shared/tokens.js";
import { GHS, canSubmitPayment, estimateDeliveryDays, estimateDeliveryFee, pad, priceFor, taxBreakdown } from "../../shared/helpers.js";
import { PAYMENT_METHODS } from "../../data/seed.js";
import { useActingUser, useCustomer, useStore } from "../../store/StoreContext.js";
import { Catalogue } from "./Catalogue.jsx";
import { DeliveryLocationPicker } from "./DeliveryLocationPicker.jsx";

export function CartCheckout() {
  const { state, dispatch } = useStore();
  const customer = useCustomer();
  const actingUser = useActingUser();
  const canRequest = actingUser.isTopApprover || actingUser.isAdmin || actingUser.role === "Procurement Officer";
  const [payment, setPayment] = useState("mobile");
  const [payValues, setPayValues] = useState({});
  const [deliveryAddress, setDeliveryAddress] = useState(customer.deliveryAddress || "");

  const pendingCart = state.quotations.find((q) => q.customerId === customer.id && q.kind === "Cart" && q.status !== "Paid" && q.status !== "Rejected");

  const items = state.cart.map((c) => ({ name: c.product.name, qty: c.qty, unitPrice: priceFor(c.product, c.qty, customer), category: c.product.category }));
  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.qty, 0);
  const discount = subtotal > 5000 ? subtotal * 0.03 : 0;
  const { km: deliveryKm, fee: deliveryFee } = estimateDeliveryFee(deliveryAddress);
  const deliveryPeriod = estimateDeliveryDays(deliveryKm).label;
  const delivery = items.length ? deliveryFee : 0;
  const tax = taxBreakdown(subtotal, discount, delivery);

  function submitCart() {
    if (!items.length || !canRequest) return;
    dispatch({ type: "SUBMIT_CART_FOR_APPROVAL", items, discount, delivery, deliveryAddress, customerId: customer.id, subtotal });
  }

  // --- an active cart submission exists: show its approval / payment status here instead of the builder ---
  if (pendingCart) {
    const ptax = taxBreakdown(pendingCart.subtotal, pendingCart.discount || 0, pendingCart.delivery || 0);
    const paymentReady = canSubmitPayment(payment, payValues, state.wallet.balance, ptax.grand);
    return (
      <div>
        <SectionTitle sub="All catalogue purchases route through the CEO / Principal for approval, then the Accountant for payment.">Cart & Checkout</SectionTitle>
        <Card className="max-w-2xl">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="font-medium">{pendingCart.id} <span className="text-xs" style={{ color: C.slate }}>· Catalogue Cart · {pendingCart.createdAt}</span></div>
            <Badge tone={statusTone(pendingCart.status)}>{pendingCart.status}</Badge>
          </div>
          <Table columns={[{ key: "name", label: "Item" }, { key: "qty", label: "Qty" }, { key: "unitPrice", label: "Unit Price", render: (r) => GHS(r.unitPrice) }, { key: "t", label: "Line Total", render: (r) => GHS(r.unitPrice * r.qty) }]} rows={pendingCart.items} />
          <div className="mt-3">
            <Row l="Subtotal" v={GHS(pendingCart.subtotal)} />
            <Row l="Delivery" v={GHS(pendingCart.delivery || 0)} />
            <Row l="Taxes (NHIL/GETFund/VAT)" v={GHS(ptax.nhil + ptax.getfund + ptax.vat)} />
            <Row l="Grand Total" v={GHS(ptax.grand)} bold />
          </div>

          {pendingCart.status === "Awaiting Customer" ? (
            actingUser.isTopApprover ? (
              <div className="flex flex-wrap gap-2 mt-4">
                <Btn size="sm" icon={CheckCircle2} onClick={() => dispatch({ type: "APPROVE_QUOTATION", id: pendingCart.id })}>Approve</Btn>
                <Btn size="sm" variant="danger" icon={XCircle} onClick={() => dispatch({ type: "REJECT_QUOTATION", id: pendingCart.id })}>Reject</Btn>
              </div>
            ) : (
              <Card className="mt-4" style={{ backgroundColor: C.amberTint }}>
                <div className="text-sm flex items-center gap-1.5" style={{ color: C.brandDark }}>
                  <Clock size={14} color={C.amber} /> Awaiting the CEO / Principal's approval. You're signed in as {actingUser.name} ({actingUser.role}).
                </div>
              </Card>
            )
          ) : pendingCart.status === "Approved" ? (
            actingUser.isPayer ? (
              <div className="mt-4">
                <div className="text-xs mb-2 flex items-center gap-1.5" style={{ color: C.green }}><CheckCircle2 size={13} /> Approved by the CEO / Principal — ready for payment.</div>
                <div className="space-y-1 mb-2">
                  {PAYMENT_METHODS.map((m) => (
                    <label key={m.key} className="flex items-center gap-2 text-sm">
                      <input type="radio" name="pm" checked={payment === m.key} onChange={() => { setPayment(m.key); setPayValues({}); }} /> {m.label}
                    </label>
                  ))}
                </div>
                <PaymentMethodFields method={payment} values={payValues} setValues={setPayValues} walletBalance={state.wallet.balance} />
                <Btn size="sm" className="mt-3" icon={CreditCard} disabled={!paymentReady} onClick={() => dispatch({ type: "PAY_QUOTATION", id: pendingCart.id, paymentMethod: payment })}>Confirm & Pay</Btn>
              </div>
            ) : (
              <Card className="mt-4" style={{ backgroundColor: C.amberTint }}>
                <div className="text-sm flex items-center gap-1.5" style={{ color: C.brandDark }}>
                  <ShieldCheck size={13} color={C.brandDark} /> Approved — only the Accountant can process payment. You're signed in as {actingUser.name} ({actingUser.role}).
                </div>
              </Card>
            )
          ) : null}
        </Card>
      </div>
    );
  }

  if (!canRequest) {
    return (
      <div>
        <SectionTitle sub="Only the Procurement Officer, an Administrator, or the CEO / Principal can submit a cart for approval.">Cart & Checkout</SectionTitle>
        <Card className="max-w-lg" style={{ backgroundColor: C.amberTint }}>
          <div className="flex items-start gap-3">
            <ShieldCheck size={18} color={C.brandDark} className="mt-0.5 shrink-0" />
            <div>
              <div className="font-medium text-sm mb-1">You don't have permission to submit a cart</div>
              <p className="text-sm" style={{ color: C.inkSoft }}>You're signed in as {actingUser.name} ({actingUser.role}). Only the Procurement Officer, an Administrator, or the CEO / Principal can submit a cart for approval. Ask one of them to sign in, or use "Switch user" from the sidebar.</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <SectionTitle sub="Every cart is routed to the CEO / Principal for approval, then the Accountant for payment, before AJ-PROXIS Control Centre processes it.">Cart & Checkout</SectionTitle>
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <Card pad={false}>
            <Table
              empty="Your cart is empty — visit the Catalogue to add items."
              columns={[
                { key: "name", label: "Item", render: (r) => <div><div className="font-medium">{r.product.name}</div><div className="text-xs" style={{ color: C.slate }}>{GHS(priceFor(r.product, r.qty, customer))} / {r.product.unit}</div></div> },
                { key: "qty", label: "Qty", render: (r) => (
                  <div className="flex items-center border rounded w-fit" style={{ borderColor: C.border }}>
                    <button className="px-2 py-1" onClick={() => dispatch({ type: "SET_QTY", id: r.id, qty: r.qty - 1 })}><Minus size={12} /></button>
                    <span className="px-2 text-sm">{r.qty}</span>
                    <button className="px-2 py-1" onClick={() => dispatch({ type: "SET_QTY", id: r.id, qty: r.qty + 1 })}><Plus size={12} /></button>
                  </div>) },
                { key: "total", label: "Total", render: (r) => GHS(priceFor(r.product, r.qty, customer) * r.qty) },
                { key: "x", label: "", render: (r) => <button onClick={() => dispatch({ type: "REMOVE_FROM_CART", id: r.id })}><Trash2 size={15} color={C.red} /></button> },
              ]}
              rows={state.cart}
            />
          </Card>
          <Card className="mt-4">
            <DeliveryLocationPicker address={deliveryAddress} onAddressChange={setDeliveryAddress} />
            <p className="text-xs mt-2 flex items-center gap-1.5" style={{ color: C.slate }}>
              <MapPin size={13} /> Estimated distance ~{deliveryKm}km from AJ-PROXIS Accra hub — delivery fee auto-calculated at {GHS(deliveryFee)}.
            </p>
            <p className="text-xs mt-1 flex items-center gap-1.5" style={{ color: C.slate }}>
              <Clock size={13} /> Estimated delivery period: <b style={{ color: C.ink }}>{deliveryPeriod}</b> after payment is confirmed.
            </p>
          </Card>
        </div>
        <Card>
          <div className="font-medium mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Order Summary</div>
          <Row l="Products" v={GHS(subtotal)} />
          <Row l="Discount" v={"-" + GHS(discount)} />
          <Row l="Delivery" v={GHS(delivery)} />
          <Row l="NHIL (2.5%)" v={GHS(tax.nhil)} />
          <Row l="GETFund (2.5%)" v={GHS(tax.getfund)} />
          <Row l="VAT (12.5%)" v={GHS(tax.vat)} />
          <div className="border-t my-2" style={{ borderColor: C.border }} />
          <Row l="Total" v={GHS(tax.grand)} bold />
          <p className="text-xs mt-3" style={{ color: C.slate }}>Submitting sends this cart to the CEO / Principal for approval. Once approved, the Accountant will process payment.</p>
          <Btn full className="mt-3" disabled={!items.length} icon={Send} onClick={submitCart}>Submit for CEO / Principal Approval</Btn>
        </Card>
      </div>
    </div>
  );
}
