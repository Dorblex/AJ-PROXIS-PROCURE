import { useState } from "react";
import { AlertTriangle, Warehouse, PackageCheck, ClipboardCheck } from "lucide-react";
import { Btn } from "../../atoms/Btn.jsx";
import { Card } from "../../atoms/Card.jsx";
import { SectionTitle } from "../../atoms/SectionTitle.jsx";
import { Badge, statusTone } from "../../atoms/Badge.jsx";
import { Field } from "../../atoms/Field.jsx";
import { TextInput } from "../../atoms/TextInput.jsx";
import { Select } from "../../atoms/Select.jsx";
import { Modal } from "../../molecules/Modal.jsx";
import { C } from "../../shared/tokens.js";
import { GHS } from "../../shared/helpers.js";
import { useStore } from "../../store/StoreContext.js";
import { PODForm } from "./PODForm.jsx";

export function AdminOrdersDelivery() {
  const { state, dispatch } = useStore();
  const [podFor, setPodFor] = useState(null);
  const [receiver, setReceiver] = useState("");
  const statuses = ["Paid — Awaiting Control Centre", "Processing", "Sourcing", "Warehouse Received", "Quality Checked", "Dispatched", "Out for Delivery", "Delivered", "Cancelled"];
  const sortedOrders = [...state.orders].sort((a, b) => (a.deliveryStatus === "Paid — Awaiting Control Centre" ? -1 : 0) - (b.deliveryStatus === "Paid — Awaiting Control Centre" ? -1 : 0));
  const newCount = state.orders.filter((o) => o.deliveryStatus === "Paid — Awaiting Control Centre").length;
  return (
    <div>
      <SectionTitle sub="Move orders through fulfilment, assign drivers, and capture proof of delivery.">Orders & Delivery</SectionTitle>
      {newCount > 0 && (
        <Card className="mb-4 flex items-center gap-2" style={{ backgroundColor: C.amberTint }}>
          <AlertTriangle size={15} color={C.brandDark} />
          <span className="text-sm">{newCount} paid order{newCount > 1 ? "s" : ""} just arrived from the Accountant and {newCount > 1 ? "are" : "is"} awaiting Control Centre to begin processing.</span>
        </Card>
      )}
      <div className="space-y-3">
        {sortedOrders.map((o) => (
          <Card key={o.id} style={o.deliveryStatus === "Paid — Awaiting Control Centre" ? { borderColor: C.amber } : undefined}>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="font-medium">{o.id} <span className="text-xs" style={{ color: C.slate }}>· {o.org} · {GHS(o.total)}</span></div>
              <Badge tone={statusTone(o.deliveryStatus)}>{o.deliveryStatus}</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {o.deliveryStatus === "Paid — Awaiting Control Centre" ? (
                <Btn size="sm" icon={ClipboardCheck} onClick={() => dispatch({ type: "UPDATE_DELIVERY_STATUS", id: o.id, status: "Processing" })}>Begin Processing</Btn>
              ) : (
                <Select value={o.deliveryStatus} onChange={(e) => dispatch({ type: "UPDATE_DELIVERY_STATUS", id: o.id, status: e.target.value })} className="w-52">
                  {statuses.map((s) => <option key={s}>{s}</option>)}
                </Select>
              )}
              <TextInput placeholder="Assign driver" className="w-40" defaultValue={o.driver || ""} onBlur={(e) => dispatch({ type: "UPDATE_DELIVERY_STATUS", id: o.id, status: o.deliveryStatus, driver: e.target.value })} />
              {o.deliveryStatus !== "Delivered" && o.deliveryStatus !== "Paid — Awaiting Control Centre" && <Btn size="sm" variant="amber" icon={PackageCheck} onClick={() => setPodFor(o)}>Capture Proof of Delivery</Btn>}
              {(o.returns || []).length > 0 && <Badge tone="amber">{o.returns.length} return(s)</Badge>}
            </div>
          </Card>
        ))}
        {!state.orders.length && <Card className="text-center py-10 text-sm" style={{ color: C.slate }}>No orders yet.</Card>}
      </div>
      {podFor && (
        <Modal title={`Proof of Delivery — ${podFor.id}`} onClose={() => setPodFor(null)} wide>
          <Field label="Received by"><TextInput value={receiver} onChange={(e) => setReceiver(e.target.value)} /></Field>
          <div className="mt-3">
            <PODForm order={podFor} onSubmit={(deliveries) => { dispatch({ type: "MARK_DELIVERED", id: podFor.id, receiver: receiver || "Storekeeper", deliveries }); setPodFor(null); setReceiver(""); }} />
          </div>
        </Modal>
      )}
    </div>
  );
}
