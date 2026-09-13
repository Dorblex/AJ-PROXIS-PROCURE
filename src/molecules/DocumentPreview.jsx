import { useState } from "react";
import { CheckCircle2, Printer, Download, Mail } from "lucide-react";
import { C } from "../shared/tokens.js";
import { GHS, deliveredLabel } from "../shared/helpers.js";
import { downloadDocument } from "../shared/documents.js";
import { LOGO_FULL } from "../shared/brandAssets.js";
import { useStore } from "../store/StoreContext.js";
import { Btn } from "../atoms/Btn.jsx";
import { TextInput } from "../atoms/TextInput.jsx";
import { Modal } from "./Modal.jsx";
import { Row } from "./Row.jsx";

export function DocumentPreview({ doc, onClose }) {
  const { state, dispatch } = useStore();
  const order = state.orders.find((o) => o.id === doc.orderId);
  const cust = order ? state.customers.find((c) => c.id === order.customerId) : null;
  const [emailTo, setEmailTo] = useState(cust?.email || "");
  const [sent, setSent] = useState(false);

  if (!order) {
    return (
      <Modal title={`${doc.kind} — ${doc.id}`} onClose={onClose}>
        <p className="text-sm" style={{ color: C.slate }}>The underlying order for this document could not be found.</p>
      </Modal>
    );
  }

  function handleSend() {
    if (!emailTo.trim()) return;
    dispatch({ type: "EMAIL_DOCUMENT", docId: doc.id, kind: doc.kind, to: emailTo.trim() });
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  }

  function handleDownload() {
    downloadDocument(doc, order, cust);
    dispatch({ type: "LOG_DOCUMENT_DOWNLOAD", docId: doc.id, kind: doc.kind });
  }

  const dueDate = new Date(new Date(order.createdAt).getTime() + 7 * 86400000).toISOString().slice(0, 10);
  const isDelivery = doc.kind === "Delivery Note";

  return (
    <Modal title={`${doc.kind} Preview`} onClose={onClose} wide>
      <div className="printable-doc bg-white rounded border p-6" style={{ borderColor: C.border }}>
        <div className="flex items-start justify-between pb-4 mb-4 border-b" style={{ borderColor: C.border }}>
          <img src={LOGO_FULL} alt="AJ-PROXIS Solutions" className="h-12 w-auto" />
          <div className="text-right">
            <div className="font-semibold uppercase text-sm" style={{ color: C.brand }}>{doc.kind}</div>
            <div className="text-xs" style={{ color: C.slate }}>{doc.id}</div>
            <div className="text-xs" style={{ color: C.slate }}>{order.createdAt}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
          <div>
            <div className="uppercase text-[10px] mb-1" style={{ color: C.slate }}>{isDelivery ? "Deliver To" : "Bill To"}</div>
            <div className="font-medium">{cust?.name || order.org}</div>
            <div>{isDelivery ? cust?.deliveryAddress : cust?.billingAddress}</div>
            {cust?.vat && <div>VAT: {cust.vat}</div>}
          </div>
          <div className="text-right">
            <div className="uppercase text-[10px] mb-1" style={{ color: C.slate }}>Reference</div>
            <div>Order: {order.id}</div>
            <div>PO: {order.poId}</div>
            {(doc.kind === "Invoice" || doc.kind === "Purchase Order") && <div>Payment Terms: Net 30 / on approval</div>}
            {doc.kind === "Purchase Order" && <div>Delivery Deadline: {dueDate}</div>}
            {doc.kind === "Purchase Order" && <div>Authorized By: {cust?.contact}</div>}
          </div>
        </div>

        <table className="w-full text-xs mb-4">
          <thead>
            <tr className="border-b" style={{ borderColor: C.border }}>
              <th className="text-left py-1.5">Item</th>
              <th className="text-right py-1.5">Qty</th>
              {isDelivery && <th className="text-right py-1.5">Delivered</th>}
              {!isDelivery && <th className="text-right py-1.5">Unit Price</th>}
              {!isDelivery && <th className="text-right py-1.5">Line Total</th>}
            </tr>
          </thead>
          <tbody>
            {order.items.map((it, i) => (
              <tr key={i} className="border-b last:border-0" style={{ borderColor: C.border }}>
                <td className="py-1.5">{it.name}</td>
                <td className="py-1.5 text-right">{it.qty}</td>
                {isDelivery && <td className="py-1.5 text-right">{deliveredLabel(order.deliveredItems[it.name] || 0, it.qty)}</td>}
                {!isDelivery && <td className="py-1.5 text-right">{GHS(it.unitPrice)}</td>}
                {!isDelivery && <td className="py-1.5 text-right">{GHS(it.unitPrice * it.qty)}</td>}
              </tr>
            ))}
          </tbody>
        </table>

        {!isDelivery && (
          <div className="flex justify-end mb-4">
            <div className="w-56 text-xs">
              <Row l="Subtotal" v={GHS(order.subtotal)} />
              <Row l="NHIL (2.5%)" v={GHS(order.tax.nhil)} />
              <Row l="GETFund (2.5%)" v={GHS(order.tax.getfund)} />
              <Row l="VAT (12.5%)" v={GHS(order.tax.vat)} />
              <Row l="Delivery" v={GHS(order.tax.delivery)} />
              <div className="border-t my-1" style={{ borderColor: C.border }} />
              <Row l="Total" v={GHS(order.total)} bold />
            </div>
          </div>
        )}

        {doc.kind === "Receipt" && (
          <div className="flex items-center gap-2 text-sm font-medium mb-4" style={{ color: C.green }}><CheckCircle2 size={16} /> PAID via {order.paymentMethod} on {order.createdAt}</div>
        )}
        {isDelivery && (
          <div className="text-xs mb-4" style={{ color: C.slate }}>Status: {order.deliveryStatus}{order.pod ? ` · Received by ${order.pod.receiver} on ${order.pod.date}` : ""}</div>
        )}

        <div className="text-[10px] pt-3 border-t" style={{ borderColor: C.border, color: C.slate }}>
          AJ-PROXIS SOLUTIONS · This is a system-generated document from AJ-PROXIS Procure.
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t" style={{ borderColor: C.border }}>
        <Btn size="sm" icon={Printer} onClick={() => window.print()}>Print</Btn>
        <Btn size="sm" variant="subtle" icon={Download} onClick={handleDownload}>Download</Btn>
        <TextInput className="w-56" placeholder="Recipient email" value={emailTo} onChange={(e) => setEmailTo(e.target.value)} />
        <Btn size="sm" variant="ghost" icon={Mail} onClick={handleSend}>Email Document</Btn>
        {sent && <span className="text-xs flex items-center gap-1" style={{ color: C.green }}><CheckCircle2 size={13} /> Sent to {emailTo}</span>}
      </div>
    </Modal>
  );
}
