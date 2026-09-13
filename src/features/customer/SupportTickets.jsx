import { useState } from "react";
import { Plus, Send } from "lucide-react";
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
import { C } from "../../shared/tokens.js";
import { pad } from "../../shared/helpers.js";
import { useCustomer, useStore } from "../../store/StoreContext.js";
import { Catalogue } from "./Catalogue.jsx";

export function SupportTickets() {
  const { state, dispatch } = useStore();
  const customer = useCustomer();
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ subject: "", category: "Order Issue", priority: "Medium", message: "" });
  const [openTicket, setOpenTicket] = useState(null);
  const [reply, setReply] = useState("");

  const myTickets = state.supportTickets.filter((t) => t.customerId === customer.id);
  const activeTicket = state.supportTickets.find((t) => t.id === openTicket?.id);

  function submitTicket() {
    if (!form.subject.trim() || !form.message.trim()) return;
    dispatch({ type: "CREATE_TICKET", customerId: customer.id, subject: form.subject, category: form.category, priority: form.priority, message: form.message });
    setForm({ subject: "", category: "Order Issue", priority: "Medium", message: "" });
    setShowNew(false);
  }

  function sendReply() {
    if (!reply.trim() || !activeTicket) return;
    dispatch({ type: "REPLY_TICKET", id: activeTicket.id, from: "customer", text: reply.trim() });
    setReply("");
  }

  return (
    <div>
      <SectionTitle sub="Raise a ticket and hear back directly from AJ-PROXIS Control Centre — every message is logged both sides.">Help & Support</SectionTitle>
      <div className="flex justify-end mb-3">
        <Btn size="sm" icon={Plus} onClick={() => setShowNew(true)}>New Ticket</Btn>
      </div>
      <Card pad={false}>
        <Table columns={[
          { key: "id", label: "Ticket" }, { key: "subject", label: "Subject" }, { key: "category", label: "Category" },
          { key: "priority", label: "Priority" }, { key: "status", label: "Status", render: (r) => <Badge tone={statusTone(r.status)}>{r.status}</Badge> },
          { key: "a", label: "", render: (r) => <Btn size="sm" variant="ghost" onClick={() => setOpenTicket(r)}>Open</Btn> },
        ]} rows={myTickets} empty="No support tickets yet — raise one above if you need help." />
      </Card>

      {showNew && (
        <Modal title="New Support Ticket" onClose={() => setShowNew(false)}>
          <div className="space-y-3">
            <Field label="Subject"><TextInput value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Category">
                <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {["Order Issue", "Billing", "Delivery", "Account", "Catalogue", "Other"].map((c) => <option key={c}>{c}</option>)}
                </Select>
              </Field>
              <Field label="Priority">
                <Select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                  {["Low", "Medium", "High"].map((p) => <option key={p}>{p}</option>)}
                </Select>
              </Field>
            </div>
            <Field label="Message"><TextArea rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></Field>
            <Btn icon={Send} onClick={submitTicket}>Submit Ticket</Btn>
          </div>
        </Modal>
      )}

      {activeTicket && (
        <Modal title={`${activeTicket.id} — ${activeTicket.subject}`} onClose={() => setOpenTicket(null)} wide>
          <div className="flex items-center gap-2 mb-3">
            <Badge tone={statusTone(activeTicket.status)}>{activeTicket.status}</Badge>
            <span className="text-xs" style={{ color: C.slate }}>{activeTicket.category} · {activeTicket.priority} priority</span>
          </div>
          <div className="space-y-2 max-h-72 overflow-y-auto mb-3 pr-1">
            {activeTicket.messages.map((m, i) => (
              <div key={i} className={`max-w-[85%] rounded px-3 py-2 text-sm ${m.from === "customer" ? "ml-auto" : ""}`} style={{ backgroundColor: m.from === "customer" ? C.brandTint : "#EEF0EC" }}>
                <div className="text-[10px] mb-0.5" style={{ color: C.slate }}>{m.from === "customer" ? customer.name : "AJ-PROXIS Support"}</div>
                {m.text}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <TextInput placeholder="Type a reply..." value={reply} onChange={(e) => setReply(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendReply()} />
            <Btn icon={Send} onClick={sendReply}>Send</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

