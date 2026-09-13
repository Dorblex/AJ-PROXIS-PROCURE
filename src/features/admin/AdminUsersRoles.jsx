import { useState } from "react";
import { Users, CheckCircle2, AlertTriangle, Plus, Trash2, LayoutDashboard, ShieldCheck, Menu } from "lucide-react";
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
import { ADMIN_NAV } from "./adminNav.js";
import { useStaff, useStore } from "../../store/StoreContext.js";

export function AdminUsersRoles() {
  const { state, dispatch } = useStore();
  const me = useStaff();

  const [showAddStaff, setShowAddStaff] = useState(false);
  const [addStaffError, setAddStaffError] = useState("");
  const [staffForm, setStaffForm] = useState({ name: "", email: "", role: state.internalRoles[1]?.role || "", password: "", isSuperAdmin: false });
  const [editingStaff, setEditingStaff] = useState(null);
  const [editStaffForm, setEditStaffForm] = useState(null);
  const [deleteStaffTarget, setDeleteStaffTarget] = useState(null);
  const [staffFeaturesTarget, setStaffFeaturesTarget] = useState(null);
  const [staffFeaturesForm, setStaffFeaturesForm] = useState([]);
  const TOGGLEABLE_ADMIN_NAV = ADMIN_NAV.filter(([key]) => key !== "dashboard" && key !== "users" && key !== "staff-access" && key !== "password-resets");

  const [showAddRole, setShowAddRole] = useState(false);
  const [roleForm, setRoleForm] = useState({ role: "", scope: "" });
  const [editingRole, setEditingRole] = useState(null);
  const [editRoleForm, setEditRoleForm] = useState(null);
  const [deleteRoleTarget, setDeleteRoleTarget] = useState(null);

  function submitAddStaff() {
    if (!staffForm.name.trim() || !staffForm.email.trim() || !staffForm.password.trim()) {
      setAddStaffError("Name, email and password are all required.");
      return;
    }
    if (state.staff.some((s) => s.email.trim().toLowerCase() === staffForm.email.trim().toLowerCase())) {
      setAddStaffError("A staff account with this email already exists.");
      return;
    }
    setAddStaffError("");
    dispatch({ type: "ADD_STAFF_DIRECT", payload: staffForm });
    setStaffForm({ name: "", email: "", role: state.internalRoles[1]?.role || "", password: "", isSuperAdmin: false });
    setShowAddStaff(false);
  }
  function submitEditStaff() {
    if (!editingStaff || !editStaffForm.name.trim()) return;
    dispatch({ type: "UPDATE_STAFF", id: editingStaff.id, patch: editStaffForm });
    setEditingStaff(null); setEditStaffForm(null);
  }
  function confirmDeleteStaff() {
    if (!deleteStaffTarget) return;
    dispatch({ type: "DELETE_STAFF", id: deleteStaffTarget.id });
    setDeleteStaffTarget(null);
  }
  function openStaffFeatures(s) {
    setStaffFeaturesForm(s.features ? [...s.features] : TOGGLEABLE_ADMIN_NAV.map(([key]) => key));
    setStaffFeaturesTarget(s);
  }
  function toggleStaffFeature(key) {
    setStaffFeaturesForm((f) => (f.includes(key) ? f.filter((k) => k !== key) : [...f, key]));
  }
  function selectAllStaffFeatures() {
    setStaffFeaturesForm(TOGGLEABLE_ADMIN_NAV.map(([key]) => key));
  }
  function selectNoneStaffFeatures() {
    setStaffFeaturesForm([]);
  }
  function submitStaffFeatures() {
    if (!staffFeaturesTarget) return;
    dispatch({ type: "UPDATE_STAFF_FEATURES", id: staffFeaturesTarget.id, features: staffFeaturesForm });
    setStaffFeaturesTarget(null);
  }
  function resetStaffFeaturesToAll() {
    if (!staffFeaturesTarget) return;
    dispatch({ type: "UPDATE_STAFF_FEATURES", id: staffFeaturesTarget.id, features: null });
    setStaffFeaturesTarget(null);
  }
  function submitAddRole() {
    if (!roleForm.role.trim()) return;
    dispatch({ type: "ADD_INTERNAL_ROLE", role: roleForm.role, scope: roleForm.scope });
    setRoleForm({ role: "", scope: "" });
    setShowAddRole(false);
  }
  function submitEditRole() {
    if (!editingRole || !editRoleForm.role.trim()) return;
    dispatch({ type: "UPDATE_INTERNAL_ROLE", originalRole: editingRole.role, role: editRoleForm.role, scope: editRoleForm.scope });
    setEditingRole(null); setEditRoleForm(null);
  }
  function confirmDeleteRole() {
    if (!deleteRoleTarget) return;
    dispatch({ type: "DELETE_INTERNAL_ROLE", role: deleteRoleTarget.role });
    setDeleteRoleTarget(null);
  }

  return (
    <div>
      <SectionTitle sub="Manage AJ-PROXIS Control Centre staff accounts and platform-level roles. Only the Super Administrator can add, edit, or remove staff and roles.">Users & Roles</SectionTitle>
      {!me.isSuperAdmin && (
        <Card className="mb-4 flex items-center gap-2" style={{ backgroundColor: C.amberTint }}>
          <ShieldCheck size={15} color={C.brandDark} />
          <span className="text-sm">You're signed in as {me.name} ({me.role}). Only the Super Administrator can manage staff and roles here.</span>
        </Card>
      )}

      <Card pad={false} className="mb-6">
        <div className="p-4 pb-0 flex items-center justify-between flex-wrap gap-2">
          <div className="text-sm font-medium">Control Centre Staff</div>
          {me.isSuperAdmin && <Btn size="sm" icon={Plus} onClick={() => { setAddStaffError(""); setShowAddStaff(true); }}>Add Staff User</Btn>}
        </div>
        <Table columns={[
          { key: "name", label: "Name", render: (r) => <span>{r.name}{r.id === me.id && <Badge tone="brand"> You</Badge>}{r.isSuperAdmin && <Badge tone="brand"> Super Admin</Badge>}</span> },
          { key: "email", label: "Email" },
          { key: "role", label: "Role" },
          { key: "status", label: "Status", render: (r) => <Badge tone={statusTone(r.status)}>{r.status}</Badge> },
          { key: "portalMenu", label: "Portal Menu", render: (r) => r.isSuperAdmin ? <Badge tone="green">Full access</Badge> : r.features ? <Badge tone="amber">{r.features.length} of {TOGGLEABLE_ADMIN_NAV.length} features</Badge> : <Badge tone="green">Full access</Badge> },
          ...(me.isSuperAdmin ? [{
            key: "a", label: "", render: (r) => (
              <div className="flex flex-wrap gap-2">
                <Btn size="sm" variant="ghost" onClick={() => { setEditStaffForm({ ...r }); setEditingStaff(r); }}>Edit</Btn>
                <Btn size="sm" variant="subtle" icon={LayoutDashboard} disabled={r.isSuperAdmin} onClick={() => openStaffFeatures(r)}>Portal Menu</Btn>
                <Btn size="sm" variant="danger" disabled={r.id === me.id} onClick={() => setDeleteStaffTarget(r)}>Delete</Btn>
              </div>
            ),
          }] : []),
        ]} rows={state.staff} />
      </Card>

      <Card pad={false}>
        <div className="p-4 pb-0 flex items-center justify-between flex-wrap gap-2">
          <div className="text-sm font-medium">Platform Roles</div>
          {me.isSuperAdmin && <Btn size="sm" icon={Plus} onClick={() => setShowAddRole(true)}>Add Role</Btn>}
        </div>
        <Table columns={[
          { key: "role", label: "Role" }, { key: "scope", label: "Scope" },
          ...(me.isSuperAdmin ? [{
            key: "a", label: "", render: (r) => (
              <div className="flex flex-wrap gap-2">
                <Btn size="sm" variant="ghost" onClick={() => { setEditRoleForm({ ...r }); setEditingRole(r); }}>Edit</Btn>
                <Btn size="sm" variant="danger" disabled={r.role === "Super Administrator"} onClick={() => setDeleteRoleTarget(r)}>Delete</Btn>
              </div>
            ),
          }] : []),
        ]} rows={state.internalRoles} />
      </Card>

      {showAddStaff && (
        <Modal title="Add Control Centre Staff User" onClose={() => { setShowAddStaff(false); setAddStaffError(""); }}>
          <div className="space-y-3">
            {addStaffError && (
              <Card className="flex items-start gap-2" style={{ borderColor: C.red }}>
                <AlertTriangle size={15} color={C.red} className="mt-0.5 shrink-0" />
                <span className="text-sm">{addStaffError}</span>
              </Card>
            )}
            <Field label="Full name"><TextInput value={staffForm.name} onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })} /></Field>
            <Field label="Work email"><TextInput type="email" value={staffForm.email} onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })} /></Field>
            <Field label="Role">
              <Select value={staffForm.role} onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}>
                {state.internalRoles.map((r) => <option key={r.role}>{r.role}</option>)}
              </Select>
            </Field>
            <Field label="Password"><TextInput type="password" value={staffForm.password} onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })} /></Field>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={staffForm.isSuperAdmin} onChange={(e) => setStaffForm({ ...staffForm, isSuperAdmin: e.target.checked })} /> Grant Super Administrator access
            </label>
            <Btn icon={Plus} onClick={submitAddStaff}>Add Staff User</Btn>
            <p className="text-[11px]" style={{ color: C.slate }}>Created as an Active account immediately — no approval step needed. They can sign in right away at the AJ-PROXIS Control Centre "Log In / Sign Up" page using this exact email and password.</p>
          </div>
        </Modal>
      )}

      {editingStaff && editStaffForm && (
        <Modal title={`Edit ${editingStaff.name}`} onClose={() => { setEditingStaff(null); setEditStaffForm(null); }}>
          <div className="space-y-3">
            <Field label="Full name"><TextInput value={editStaffForm.name} onChange={(e) => setEditStaffForm({ ...editStaffForm, name: e.target.value })} /></Field>
            <Field label="Work email"><TextInput type="email" value={editStaffForm.email} onChange={(e) => setEditStaffForm({ ...editStaffForm, email: e.target.value })} /></Field>
            <Field label="Role">
              <Select value={editStaffForm.role} onChange={(e) => setEditStaffForm({ ...editStaffForm, role: e.target.value })}>
                {state.internalRoles.map((r) => <option key={r.role}>{r.role}</option>)}
              </Select>
            </Field>
            <Field label="Status">
              <Select value={editStaffForm.status} onChange={(e) => setEditStaffForm({ ...editStaffForm, status: e.target.value })}>
                {["Active", "Pending", "Rejected"].map((s) => <option key={s}>{s}</option>)}
              </Select>
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={editStaffForm.isSuperAdmin} onChange={(e) => setEditStaffForm({ ...editStaffForm, isSuperAdmin: e.target.checked })} /> Grant Super Administrator access
            </label>
            <Btn icon={CheckCircle2} onClick={submitEditStaff}>Save Changes</Btn>
          </div>
        </Modal>
      )}

      {deleteStaffTarget && (
        <Modal title={`Remove ${deleteStaffTarget.name}?`} onClose={() => setDeleteStaffTarget(null)}>
          <p className="text-sm mb-4" style={{ color: C.inkSoft }}>This removes {deleteStaffTarget.name} ({deleteStaffTarget.role}) from AJ-PROXIS Control Centre. They will no longer be able to sign in.</p>
          <div className="flex gap-2">
            <Btn variant="danger" icon={Trash2} onClick={confirmDeleteStaff}>Remove Staff</Btn>
            <Btn variant="ghost" onClick={() => setDeleteStaffTarget(null)}>Cancel</Btn>
          </div>
        </Modal>
      )}

      {staffFeaturesTarget && (
        <Modal title={`Portal Menu — ${staffFeaturesTarget.name}`} onClose={() => setStaffFeaturesTarget(null)}>
          <p className="text-sm mb-3" style={{ color: C.slate }}>Choose which pages {staffFeaturesTarget.name} ({staffFeaturesTarget.role}) can see in the AJ-PROXIS Control Centre. Dashboard is always available.</p>
          <label className="flex items-center gap-2 text-sm font-medium pb-2 mb-1.5 border-b" style={{ borderColor: C.border }}>
            <input type="checkbox" checked={staffFeaturesForm.length === TOGGLEABLE_ADMIN_NAV.length} ref={(el) => { if (el) el.indeterminate = staffFeaturesForm.length > 0 && staffFeaturesForm.length < TOGGLEABLE_ADMIN_NAV.length; }} onChange={() => (staffFeaturesForm.length === TOGGLEABLE_ADMIN_NAV.length ? selectNoneStaffFeatures() : selectAllStaffFeatures())} />
            Select All
          </label>
          <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
            {TOGGLEABLE_ADMIN_NAV.map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={staffFeaturesForm.includes(key)} onChange={() => toggleStaffFeature(key)} /> {label}
              </label>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <Btn icon={CheckCircle2} onClick={submitStaffFeatures}>Save Portal Menu</Btn>
            <Btn variant="ghost" onClick={selectAllStaffFeatures}>Select All</Btn>
            <Btn variant="ghost" onClick={selectNoneStaffFeatures}>Select None</Btn>
            <Btn variant="ghost" onClick={resetStaffFeaturesToAll}>Reset to Full Access</Btn>
          </div>
        </Modal>
      )}

      {showAddRole && (
        <Modal title="Add Platform Role" onClose={() => setShowAddRole(false)}>
          <div className="space-y-3">
            <Field label="Role name"><TextInput value={roleForm.role} onChange={(e) => setRoleForm({ ...roleForm, role: e.target.value })} /></Field>
            <Field label="Scope / description"><TextArea rows={2} value={roleForm.scope} onChange={(e) => setRoleForm({ ...roleForm, scope: e.target.value })} /></Field>
            <Btn icon={Plus} onClick={submitAddRole}>Add Role</Btn>
          </div>
        </Modal>
      )}
      {editingRole && editRoleForm && (
        <Modal title={`Edit Role — ${editingRole.role}`} onClose={() => { setEditingRole(null); setEditRoleForm(null); }}>
          <div className="space-y-3">
            <Field label="Role name"><TextInput value={editRoleForm.role} onChange={(e) => setEditRoleForm({ ...editRoleForm, role: e.target.value })} /></Field>
            <Field label="Scope / description"><TextArea rows={2} value={editRoleForm.scope} onChange={(e) => setEditRoleForm({ ...editRoleForm, scope: e.target.value })} /></Field>
            <Btn icon={CheckCircle2} onClick={submitEditRole}>Save Changes</Btn>
          </div>
        </Modal>
      )}
      {deleteRoleTarget && (
        <Modal title={`Remove role "${deleteRoleTarget.role}"?`} onClose={() => setDeleteRoleTarget(null)}>
          <p className="text-sm mb-4" style={{ color: C.inkSoft }}>Staff currently holding this role will keep the role label, but it won't appear as an option for new staff going forward.</p>
          <div className="flex gap-2">
            <Btn variant="danger" icon={Trash2} onClick={confirmDeleteRole}>Remove Role</Btn>
            <Btn variant="ghost" onClick={() => setDeleteRoleTarget(null)}>Cancel</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

