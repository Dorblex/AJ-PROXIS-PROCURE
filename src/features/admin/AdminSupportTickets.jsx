import { useState } from "react";
import { Send } from "lucide-react";
import { Btn } from "../../atoms/Btn.jsx";
import { Card } from "../../atoms/Card.jsx";
import { SectionTitle } from "../../atoms/SectionTitle.jsx";
import { Badge, statusTone } from "../../atoms/Badge.jsx";
import { TextInput } from "../../atoms/TextInput.jsx";
import { Select } from "../../atoms/Select.jsx";
import { Modal } from "../../molecules/Modal.jsx";
import { Table } from "../../molecules/Table.jsx";
import { C } from "../../shared/tokens.js";
import { pad } from "../../shared/helpers.js";
import { useStore } from "../../store/StoreContext.js";

export function AdminSupportTickets() {
  const { state, dispatch } = useStore();
  const [openTicket, setOpenTicket] = useState(null);
  const [reply, setReply] = useState("");
  const [filter, setFilter] = useState("All");

  const activeTicket = state.supportTickets.find((t) => t.id === openTicket?.id);
  const statuses = ["All", "Open", "In Progress", "Resolved"];
  const rows = state.supportTickets.filter((t) => filter === "All" || t.status === filter);

  function sendReply() {
    if (!reply.trim() || !activeTicket) return;
    dispatch({ type: "REPLY_TICKET", id: activeTicket.id, from: "support", text: reply.trim() });
    setReply("");
  }

  return (
    <div>
      <SectionTitle sub="Every customer support ticket lands here — reply and manage status directly.">Support Tickets</SectionTitle>
      <div className="flex gap-1.5 mb-3">
        {statuses.map((s) => (
          <button key={s} onClick={() => setFilter(s)} className="text-xs px-2.5 py-1 rounded border" style={{ borderColor: filter === s ? C.brand : C.border, backgroundColor: filter === s ? C.brandTint : "transparent" }}>{s}</button>
        ))}
      </div>
      <Card pad={false}>
        <Table columns={[
          { key: "orgName", label: "Customer" }, { key: "subject", label: "Subject" }, { key: "category", label: "Category" },
          { key: "priority", label: "Priority" }, { key: "createdAt", label: "Opened" },
          { key: "status", label: "Status", render: (r) => <Badge tone={statusTone(r.status)}>{r.status}</Badge> },
          { key: "a", label: "", render: (r) => <Btn size="sm" variant="ghost" onClick={() => setOpenTicket(r)}>Open</Btn> },
        ]} rows={rows} empty="No support tickets." />
      </Card>

      {activeTicket && (
        <Modal title={`${activeTicket.id} — ${activeTicket.subject}`} onClose={() => setOpenTicket(null)} wide>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge tone={statusTone(activeTicket.status)}>{activeTicket.status}</Badge>
            <span className="text-xs" style={{ color: C.slate }}>{activeTicket.orgName} · {activeTicket.category} · {activeTicket.priority} priority</span>
            <Select className="ml-auto w-40" value={activeTicket.status} onChange={(e) => dispatch({ type: "UPDATE_TICKET_STATUS", id: activeTicket.id, status: e.target.value })}>
              {["Open", "In Progress", "Resolved", "Closed"].map((s) => <option key={s}>{s}</option>)}
            </Select>
          </div>
          <div className="space-y-2 max-h-72 overflow-y-auto mb-3 pr-1">
            {activeTicket.messages.map((m, i) => (
              <div key={i} className={`max-w-[85%] rounded px-3 py-2 text-sm ${m.from === "support" ? "ml-auto" : ""}`} style={{ backgroundColor: m.from === "support" ? C.brandTint : "#EEF0EC" }}>
                <div className="text-[10px] mb-0.5" style={{ color: C.slate }}>{m.from === "support" ? "AJ-PROXIS Support" : activeTicket.orgName}</div>
                {m.text}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <TextInput placeholder="Reply as AJ-PROXIS Support..." value={reply} onChange={(e) => setReply(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendReply()} />
            <Btn icon={Send} onClick={sendReply}>Send</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

