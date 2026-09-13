import { useState } from "react";
import { CheckCircle2, Plus, Trash2, RefreshCcw, ShieldCheck, Menu, Target, Pencil } from "lucide-react";
import { Btn } from "../../atoms/Btn.jsx";
import { Card } from "../../atoms/Card.jsx";
import { SectionTitle } from "../../atoms/SectionTitle.jsx";
import { Badge } from "../../atoms/Badge.jsx";
import { Field } from "../../atoms/Field.jsx";
import { TextInput } from "../../atoms/TextInput.jsx";
import { Modal } from "../../molecules/Modal.jsx";
import { Table } from "../../molecules/Table.jsx";
import { C } from "../../shared/tokens.js";
import { pad } from "../../shared/helpers.js";
import { useStaff, useStore } from "../../store/StoreContext.js";

export function AdminCompanyMenu() {
  const { state, dispatch } = useStore();
  const me = useStaff();
  const [editing, setEditing] = useState(null); // item being edited, or "new-link", or null
  const [form, setForm] = useState(null);

  if (!me.isSuperAdmin) {
    return (
      <div>
        <SectionTitle sub="Manage the items shown in the Company dropdown on the front page.">Company Menu</SectionTitle>
        <Card className="flex items-center gap-2" style={{ backgroundColor: C.amberTint }}>
          <ShieldCheck size={15} color={C.brandDark} /> <span className="text-sm">Only the Super Administrator can manage the Company menu.</span>
        </Card>
      </div>
    );
  }

  function openEdit(item) {
    setForm({ ...item });
    setEditing(item.id);
  }
  function openAddLink() {
    setForm({ label: "", type: "link", url: "", visible: true });
    setEditing("new-link");
  }
  function save() {
    if (!form.label.trim()) return;
    if (editing === "new-link") {
      if (!form.url.trim()) return;
      dispatch({ type: "ADD_COMPANY_MENU_ITEM", payload: form });
    } else {
      dispatch({ type: "UPDATE_COMPANY_MENU_ITEM", id: editing, patch: form });
    }
    setEditing(null);
    setForm(null);
  }

  return (
    <div>
      <SectionTitle sub="Manage the items shown in the Company dropdown on the front page — rename, show/hide, delete, or add new external links.">Company Menu</SectionTitle>
      <div className="flex flex-wrap gap-2 mb-4">
        <Btn icon={Plus} onClick={openAddLink}>Add External Link</Btn>
        <Btn variant="ghost" icon={RefreshCcw} onClick={() => dispatch({ type: "RESTORE_DEFAULT_COMPANY_MENU" })}>Restore Defaults</Btn>
      </div>
      <Card pad={false}>
        <Table columns={[
          { key: "label", label: "Label" },
          { key: "type", label: "Type", render: (r) => <Badge tone={r.type === "page" ? "brand" : "slate"}>{r.type === "page" ? "Page" : "External Link"}</Badge> },
          { key: "target", label: "Target", render: (r) => r.type === "page" ? r.pageKey : r.url },
          { key: "visible", label: "Visible", render: (r) => (
            <label className="inline-flex items-center gap-1.5 text-sm cursor-pointer">
              <input type="checkbox" checked={r.visible} onChange={() => dispatch({ type: "UPDATE_COMPANY_MENU_ITEM", id: r.id, patch: { visible: !r.visible } })} />
              {r.visible ? "Shown" : "Hidden"}
            </label>
          ) },
          { key: "a", label: "", render: (r) => (
            <div className="flex gap-1.5">
              <Btn size="sm" variant="ghost" icon={Pencil} onClick={() => openEdit(r)}>Edit</Btn>
              <Btn size="sm" variant="danger" icon={Trash2} onClick={() => dispatch({ type: "DELETE_COMPANY_MENU_ITEM", id: r.id })}>Delete</Btn>
            </div>
          ) },
        ]} rows={state.companyMenuItems} empty="No company menu items." />
      </Card>

      {editing && (
        <Modal title={editing === "new-link" ? "Add External Link" : "Edit Menu Item"} onClose={() => { setEditing(null); setForm(null); }}>
          <Field label="Label"><TextInput value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} /></Field>
          {form.type === "link" && (
            <Field label="URL"><TextInput value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://…" /></Field>
          )}
          {form.type === "page" && (
            <p className="text-xs mb-3" style={{ color: C.slate }}>This item links to the built-in "{form.pageKey}" page. You can rename its label or hide it, but its destination can't be changed.</p>
          )}
          <label className="flex items-center gap-2 text-sm mb-3">
            <input type="checkbox" checked={form.visible} onChange={(e) => setForm({ ...form, visible: e.target.checked })} /> Visible in menu
          </label>
          <Btn icon={CheckCircle2} onClick={save}>Save</Btn>
        </Modal>
      )}
    </div>
  );
}

