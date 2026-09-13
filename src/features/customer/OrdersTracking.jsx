import React, { useState } from "react";
import { Warehouse } from "lucide-react";
import { Btn } from "../../atoms/Btn.jsx";
import { Card } from "../../atoms/Card.jsx";
import { SectionTitle } from "../../atoms/SectionTitle.jsx";
import { Badge, statusTone } from "../../atoms/Badge.jsx";
import { Field } from "../../atoms/Field.jsx";
import { Select } from "../../atoms/Select.jsx";
import { Modal } from "../../molecules/Modal.jsx";
import { Table } from "../../molecules/Table.jsx";
import { Row } from "../../molecules/Row.jsx";
import { C } from "../../shared/tokens.js";
import { GHS, deliveredLabel } from "../../shared/helpers.js";
import { useStore } from "../../store/StoreContext.js";

export function OrdersTracking() {
  const { state, dispatch } = useStore();
  const steps = ["Paid — Awaiting Control Centre", "Processing", "Sourcing", "Warehouse Received", "Quality Checked", "Dispatched", "Out for Delivery", "Delivered"];
  const [returnFor, setReturnFor] = useState(null);
  const [reason, setReason] = useState("Wrong item");
  return (
    <div>
      <SectionTitle sub="Track fulfilment end-to-end and manage returns.">My Orders & Delivery Tracking</SectionTitle>
      <div className="space-y-4">
        {state.orders.map((o) => {
          const idx = o.deliveryStatus === "Partially Delivered" ? steps.indexOf("Dispatched") : Math.max(steps.indexOf(o.deliveryStatus), 0);
          return (
            <Card key={o.id}>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div>
                  <div className="font-medium">{o.id} <span className="text-xs" style={{ color: C.slate }}>· {o.createdAt} · {o.source}</span></div>
                  <div className="text-xs" style={{ color: C.slate }}>PO {o.poId} · Invoice {o.invId}</div>
                </div>
                <Badge tone={statusTone(o.deliveryStatus)}>{o.deliveryStatus}</Badge>
              </div>
              <div className="flex items-center flex-wrap gap-1 mb-3">
                {steps.map((s, i) => (
                  <React.Fragment key={s}>
                    <div className="text-[10px] px-2 py-1 rounded" style={{ backgroundColor: i <= idx ? C.brand : "#EEF0EC", color: i <= idx ? "#fff" : C.slate }}>{s}</div>
                    {i < steps.length - 1 && <div className="w-2 h-px" style={{ backgroundColor: C.border }} />}
                  </React.Fragment>
                ))}
              </div>
              <Table columns={[
                { key: "name", label: "Item" }, { key: "qty", label: "Ordered" },
                { key: "delivered", label: "Delivered", render: (r) => deliveredLabel(o.deliveredItems[r.name] || 0, r.qty) },
              ]} rows={o.items} />
              <Row l="Total Paid" v={GHS(o.total)} bold />
              {o.pod && (
                <Card className="mt-2 text-xs" style={{ color: C.slate }}>
                  Proof of delivery: received by <b>{o.pod.receiver}</b> on {o.pod.date} at {o.pod.gps}.
                </Card>
              )}
              {o.deliveryStatus === "Delivered" && (
                <Btn size="sm" variant="ghost" className="mt-3" onClick={() => setReturnFor(o.id)}>Request Return / Replacement</Btn>
              )}
              {(o.returns || []).map((r) => (
                <div key={r.id} className="text-xs mt-2 flex items-center gap-2"><Badge tone="amber">{r.status}</Badge> {r.id} — {r.reason}</div>
              ))}
            </Card>
          );
        })}
        {!state.orders.length && <Card className="text-center py-10 text-sm" style={{ color: C.slate }}>No orders yet.</Card>}
      </div>
      {returnFor && (
        <Modal title="Request Return / Replacement" onClose={() => setReturnFor(null)}>
          <Field label="Reason">
            <Select value={reason} onChange={(e) => setReason(e.target.value)}>
              {["Wrong item", "Damaged", "Incorrect quantity", "Defective", "Doesn't match specification", "Late delivery"].map((r) => <option key={r}>{r}</option>)}
            </Select>
          </Field>
          <Btn className="mt-3" onClick={() => { dispatch({ type: "REQUEST_RETURN", orderId: returnFor, reason }); setReturnFor(null); }}>Submit Return Request</Btn>
        </Modal>
      )}
    </div>
  );
}

