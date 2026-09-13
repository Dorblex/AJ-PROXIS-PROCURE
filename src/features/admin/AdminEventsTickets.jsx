import { useState } from "react";
import { Users, CheckCircle2, Plus, Trash2, DollarSign, Clock, CreditCard, ScrollText, Pencil } from "lucide-react";
import { Btn } from "../../atoms/Btn.jsx";
import { Card } from "../../atoms/Card.jsx";
import { SectionTitle } from "../../atoms/SectionTitle.jsx";
import { Stat } from "../../atoms/Stat.jsx";
import { Badge } from "../../atoms/Badge.jsx";
import { Field } from "../../atoms/Field.jsx";
import { TextInput } from "../../atoms/TextInput.jsx";
import { TextArea } from "../../atoms/TextArea.jsx";
import { Modal } from "../../molecules/Modal.jsx";
import { Table } from "../../molecules/Table.jsx";
import { C } from "../../shared/tokens.js";
import { GHS, pad } from "../../shared/helpers.js";
import { useStaff, useStore } from "../../store/StoreContext.js";

export function AdminEventsTickets() {
  const { state, dispatch } = useStore();
  const me = useStaff();
  const [editing, setEditing] = useState(null); // event being added/edited, or null
  const [form, setForm] = useState(null);

  const totalRevenue = state.eventTickets.reduce((s, t) => s + t.amountPaid, 0);
  const paidTickets = state.eventTickets.filter((t) => t.amountPaid > 0);

  function openAdd() {
    setForm({ title: "", date: "", time: "", venue: "", description: "", cap: 100, priceCategories: [{ key: "standard", label: "Standard", price: 0, perks: "" }] });
    setEditing("new");
  }
  function openEdit(ev) {
    setForm({ ...ev, priceCategories: ev.priceCategories.map((c) => ({ ...c })) });
    setEditing(ev.id);
  }
  function updateCategory(i, field, val) {
    const cats = form.priceCategories.slice();
    cats[i] = { ...cats[i], [field]: field === "price" ? Number(val) : val };
    setForm({ ...form, priceCategories: cats });
  }
  function addCategory() {
    setForm({ ...form, priceCategories: [...form.priceCategories, { key: "tier" + (form.priceCategories.length + 1), label: "", price: 0, perks: "" }] });
  }
  function removeCategory(i) {
    setForm({ ...form, priceCategories: form.priceCategories.filter((_, idx) => idx !== i) });
  }
  function saveEvent() {
    if (!form.title.trim() || !form.date) return;
    if (editing === "new") {
      dispatch({ type: "ADD_EVENT", payload: form });
    } else {
      dispatch({ type: "UPDATE_EVENT", id: editing, payload: form });
    }
    setEditing(null);
    setForm(null);
  }

  return (
    <div>
      <SectionTitle sub="Manage Up-coming Events and view every ticket sold through the Company menu's Event Ticket page.">Events & Tickets</SectionTitle>

      <div className="grid sm:grid-cols-4 gap-3 mb-6">
        <Stat label="Upcoming Events" value={state.events.length} icon={Clock} />
        <Stat label="Tickets Issued" value={state.eventTickets.length} icon={ScrollText} />
        <Stat label="Paid Tickets" value={paidTickets.length} icon={CreditCard} />
        <Stat label="Ticket Revenue" value={GHS(totalRevenue)} icon={DollarSign} />
      </div>

      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium">Manage Up-coming Events</div>
        {me.isSuperAdmin && <Btn size="sm" icon={Plus} onClick={openAdd}>Add Event</Btn>}
      </div>
      <div className="space-y-3 mb-6">
        {state.events.map((e) => {
          const issued = state.eventTickets.filter((t) => t.eventId === e.id).length;
          return (
            <Card key={e.id}>
              <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                <div>
                  <div className="font-medium">{e.title}</div>
                  <div className="text-xs" style={{ color: C.slate }}>{e.date} · {e.time} · {e.venue}</div>
                </div>
                {me.isSuperAdmin && (
                  <div className="flex gap-1.5">
                    <Btn size="sm" variant="ghost" icon={Pencil} onClick={() => openEdit(e)}>Edit</Btn>
                    <Btn size="sm" variant="danger" icon={Trash2} onClick={() => dispatch({ type: "DELETE_EVENT", id: e.id })}>Delete</Btn>
                  </div>
                )}
              </div>
              <p className="text-sm mt-1" style={{ color: C.inkSoft }}>{e.description}</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {e.priceCategories.map((c) => <Badge key={c.key} tone="slate">{c.label} — {c.price > 0 ? GHS(c.price) : "Free"}</Badge>)}
              </div>
              <div className="text-xs mt-2 flex items-center gap-1.5" style={{ color: C.slate }}><Users size={12} /> {issued} of {e.cap} tickets issued</div>
            </Card>
          );
        })}
        {!state.events.length && <Card className="text-center py-10 text-sm" style={{ color: C.slate }}>No events yet.</Card>}
      </div>

      <div className="text-sm font-medium mb-2">All Tickets Bought</div>
      <Card pad={false}>
        <Table columns={[
          { key: "id", label: "Ticket" }, { key: "eventTitle", label: "Event" }, { key: "name", label: "Attendee" }, { key: "email", label: "Email" },
          { key: "priceCategory", label: "Category" },
          { key: "amountPaid", label: "Amount", render: (r) => r.amountPaid > 0 ? GHS(r.amountPaid) : "Free" },
          { key: "paymentMethod", label: "Payment" }, { key: "issuedAt", label: "Issued" },
        ]} rows={state.eventTickets} empty="No tickets bought yet." />
      </Card>

      {editing && (
        <Modal title={editing === "new" ? "Add Event" : "Edit Event"} onClose={() => { setEditing(null); setForm(null); }} wide>
          <Field label="Title"><TextInput value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Date"><TextInput type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
            <Field label="Time"><TextInput value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} placeholder="9:00 AM – 4:00 PM" /></Field>
          </div>
          <Field label="Venue"><TextInput value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} /></Field>
          <Field label="Description"><TextArea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
          <Field label="Ticket Cap"><TextInput type="number" value={form.cap} onChange={(e) => setForm({ ...form, cap: Number(e.target.value) })} /></Field>

          <div className="mt-3">
            <div className="text-sm font-medium mb-2">Price Categories</div>
            {form.priceCategories.map((c, i) => (
              <div key={i} className="grid sm:grid-cols-4 gap-2 mb-2 items-end">
                <Field label="Label"><TextInput value={c.label} onChange={(e) => updateCategory(i, "label", e.target.value)} /></Field>
                <Field label="Price (GHS, 0 = free)"><TextInput type="number" value={c.price} onChange={(e) => updateCategory(i, "price", e.target.value)} /></Field>
                <Field label="Perks"><TextInput value={c.perks} onChange={(e) => updateCategory(i, "perks", e.target.value)} /></Field>
                <Btn variant="ghost" icon={Trash2} onClick={() => removeCategory(i)} disabled={form.priceCategories.length <= 1}>Remove</Btn>
              </div>
            ))}
            <Btn size="sm" variant="subtle" icon={Plus} onClick={addCategory}>Add Price Category</Btn>
          </div>

          <Btn className="mt-4" icon={CheckCircle2} disabled={!form.title.trim() || !form.date} onClick={saveEvent}>Save Event</Btn>
        </Modal>
      )}
    </div>
  );
}

