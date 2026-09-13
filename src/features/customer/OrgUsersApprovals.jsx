import React, { useState } from "react";
import { Users, ClipboardList, CheckCircle2, Plus, Trash2, ArrowRight, LayoutDashboard, CreditCard, ShieldCheck, Menu } from "lucide-react";
import { Btn } from "../../atoms/Btn.jsx";
import { Card } from "../../atoms/Card.jsx";
import { SectionTitle } from "../../atoms/SectionTitle.jsx";
import { Badge, statusTone } from "../../atoms/Badge.jsx";
import { Select } from "../../atoms/Select.jsx";
import { Modal } from "../../molecules/Modal.jsx";
import { Table } from "../../molecules/Table.jsx";
import { C } from "../../shared/tokens.js";
import { GHS, pad } from "../../shared/helpers.js";
import { useActingUser, useCustomer, useStore } from "../../store/StoreContext.js";
import { Quotations } from "./Quotations.jsx";
import { ActingUserSwitcher } from "./ActingUserSwitcher.jsx";
import { OrgUserFormFields, COMMON_ORG_ROLES } from "./OrgUserFormFields.jsx";
import { CUSTOMER_NAV } from "./customerNav.js";

export function OrgUsersApprovals() {
  const { state, dispatch } = useStore();
  const customer = useCustomer();
  const actingUser = useActingUser();
  const myQuotations = state.quotations.filter((q) => q.customerId === customer.id);
  const awaitingApproval = myQuotations.filter((q) => q.status === "Awaiting Customer" || q.status.startsWith("Revised") || q.status === "Negotiation Requested");
  const awaitingPayment = myQuotations.filter((q) => q.status === "Approved");
  const ceo = state.orgUsers.find((u) => u.isTopApprover);
  const accountant = state.orgUsers.find((u) => u.isPayer);
  const officer = state.orgUsers.find((u) => u.role === "Procurement Officer");

  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", role: COMMON_ORG_ROLES[0], password: "", isTopApprover: false, isPayer: false, isAdmin: false });
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [featuresTarget, setFeaturesTarget] = useState(null);
  const [featuresForm, setFeaturesForm] = useState([]);

  const TOGGLEABLE_NAV = CUSTOMER_NAV.filter(([key]) => key !== "dashboard");

  function submitAdd() {
    if (!addForm.name.trim() || !addForm.password.trim()) return;
    dispatch({ type: "ADD_ORG_USER", payload: addForm });
    setAddForm({ name: "", role: COMMON_ORG_ROLES[0], password: "", isTopApprover: false, isPayer: false, isAdmin: false });
    setShowAdd(false);
  }
  function openEdit(u) {
    setEditForm({ ...u });
    setEditing(u);
  }
  function submitEdit() {
    if (!editing || !editForm.name.trim()) return;
    dispatch({ type: "UPDATE_ORG_USER", id: editing.id, patch: editForm });
    setEditing(null); setEditForm(null);
  }
  function confirmDelete() {
    if (!deleteTarget) return;
    dispatch({ type: "DELETE_ORG_USER", id: deleteTarget.id });
    setDeleteTarget(null);
  }
  function openFeatures(u) {
    setFeaturesForm(u.features ? [...u.features] : TOGGLEABLE_NAV.map(([key]) => key));
    setFeaturesTarget(u);
  }
  function toggleFeature(key) {
    setFeaturesForm((f) => (f.includes(key) ? f.filter((k) => k !== key) : [...f, key]));
  }
  function selectAllFeatures() {
    setFeaturesForm(TOGGLEABLE_NAV.map(([key]) => key));
  }
  function selectNoneFeatures() {
    setFeaturesForm([]);
  }
  function submitFeatures() {
    if (!featuresTarget) return;
    dispatch({ type: "UPDATE_USER_FEATURES", id: featuresTarget.id, features: featuresForm });
    setFeaturesTarget(null);
  }
  function resetFeaturesToAll() {
    if (!featuresTarget) return;
    dispatch({ type: "UPDATE_USER_FEATURES", id: featuresTarget.id, features: null });
    setFeaturesTarget(null);
  }

  return (
    <div>
      <SectionTitle sub="Every procurement request follows the same chain: the Procurement Officer places it, the CEO / Principal approves it, and the Accountant pays.">Organization, Users & Approvals</SectionTitle>
      <Card className="mb-4">
        <div className="text-sm font-medium mb-2">This Session</div>
        <ActingUserSwitcher />
        <p className="text-xs mt-2" style={{ color: C.slate }}>Each position has its own password. Use "Switch user" to sign out of this position and sign back in as someone else — this simulates named employees sharing one organization account.</p>
      </Card>

      <Card className="mb-4">
        <div className="text-sm font-medium mb-3">Procurement Approval Chain</div>
        <div className="flex flex-col sm:flex-row items-stretch gap-2">
          {[
            { step: "1. Requests", user: officer, desc: "Places procurement requests, RFQs and bulk orders.", icon: ClipboardList },
            { step: "2. Approves", user: ceo, desc: "Reviews and approves each quotation for payment.", icon: ShieldCheck },
            { step: "3. Pays", user: accountant, desc: "Processes payment once approved by the CEO / Principal.", icon: CreditCard },
          ].map((s, i, arr) => (
            <React.Fragment key={s.step}>
              <div className="flex-1 rounded border p-3" style={{ borderColor: C.border }}>
                <div className="flex items-center gap-2 mb-1">
                  <s.icon size={15} color={C.brand} />
                  <span className="text-xs font-semibold">{s.step}</span>
                </div>
                <div className="text-sm font-medium">{s.user?.name || "Unassigned"} {s.user?.id === actingUser.id && <Badge tone="brand">You</Badge>}</div>
                <div className="text-xs" style={{ color: C.slate }}>{s.user?.role}</div>
                <div className="text-xs mt-1" style={{ color: C.slate }}>{s.desc}</div>
              </div>
              {i < arr.length - 1 && <ArrowRight size={16} color={C.slate} className="self-center hidden sm:block" />}
            </React.Fragment>
          ))}
        </div>
      </Card>

      <Card pad={false} className="mb-4">
        <div className="p-4 pb-0 flex items-center justify-between flex-wrap gap-2">
          <div className="text-sm font-medium">Users & Access</div>
          {actingUser.isAdmin && <Btn size="sm" icon={Plus} onClick={() => setShowAdd(true)}>Add User</Btn>}
        </div>
        {!actingUser.isAdmin && (
          <div className="px-4 pt-2 text-xs flex items-center gap-1.5" style={{ color: C.slate }}>
            <ShieldCheck size={13} /> Only an organization Administrator can add, edit, or remove users. Signed in as {actingUser.name} ({actingUser.role}).
          </div>
        )}
        <Table columns={[
          { key: "name", label: "Name", render: (r) => <span>{r.name}{r.id === actingUser.id && <Badge tone="brand"> You</Badge>}{r.isAdmin && <Badge tone="brand"> Admin</Badge>}</span> },
          { key: "role", label: "Role" },
          { key: "canApprove", label: "Can Approve Quotations", render: (r) => r.isTopApprover ? <Badge tone="green">Yes</Badge> : <Badge tone="slate">No</Badge> },
          { key: "canPay", label: "Can Process Payment", render: (r) => r.isPayer ? <Badge tone="green">Yes</Badge> : <Badge tone="slate">No</Badge> },
          { key: "portalMenu", label: "Portal Menu", render: (r) => r.features ? <Badge tone="amber">{r.features.length} of {TOGGLEABLE_NAV.length} features</Badge> : <Badge tone="green">Full access</Badge> },
          ...(actingUser.isAdmin ? [{
            key: "a", label: "", render: (r) => (
              <div className="flex flex-wrap gap-2">
                <Btn size="sm" variant="ghost" onClick={() => openEdit(r)}>Edit Role</Btn>
                <Btn size="sm" variant="subtle" icon={LayoutDashboard} onClick={() => openFeatures(r)}>Portal Menu</Btn>
                <Btn size="sm" variant="danger" disabled={r.id === actingUser.id} onClick={() => setDeleteTarget(r)}>Delete</Btn>
              </div>
            ),
          }] : []),
        ]} rows={state.orgUsers} />
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        <div>
          <div className="text-sm font-medium mb-2">Awaiting CEO / Principal Approval</div>
          <Card pad={false}>
            <Table columns={[{ key: "id", label: "Quotation" }, { key: "subtotal", label: "Amount", render: (r) => GHS(r.subtotal) }, { key: "status", label: "Status", render: (r) => <Badge tone={statusTone(r.status)}>{r.status}</Badge> }]} rows={awaitingApproval} empty="Nothing awaiting approval." />
          </Card>
        </div>
        <div>
          <div className="text-sm font-medium mb-2">Awaiting Accountant Payment</div>
          <Card pad={false}>
            <Table columns={[{ key: "id", label: "Quotation" }, { key: "subtotal", label: "Amount", render: (r) => GHS(r.subtotal) }, { key: "status", label: "Status", render: (r) => <Badge tone={statusTone(r.status)}>{r.status}</Badge> }]} rows={awaitingPayment} empty="Nothing awaiting payment." />
          </Card>
        </div>
      </div>

      {showAdd && (
        <Modal title="Add Organization User" onClose={() => setShowAdd(false)}>
          <OrgUserFormFields form={addForm} setForm={setAddForm} />
          <Btn className="mt-4" icon={Plus} onClick={submitAdd}>Add User</Btn>
        </Modal>
      )}
      {editing && editForm && (
        <Modal title={`Edit ${editing.name}`} onClose={() => { setEditing(null); setEditForm(null); }}>
          <OrgUserFormFields form={editForm} setForm={setEditForm} />
          <Btn className="mt-4" icon={CheckCircle2} onClick={submitEdit}>Save Changes</Btn>
        </Modal>
      )}
      {deleteTarget && (
        <Modal title={`Remove ${deleteTarget.name}?`} onClose={() => setDeleteTarget(null)}>
          <p className="text-sm mb-4" style={{ color: C.inkSoft }}>This removes {deleteTarget.name} ({deleteTarget.role}) from the organization's user list. They will no longer be able to sign in to the Customer Portal.</p>
          <div className="flex gap-2">
            <Btn variant="danger" icon={Trash2} onClick={confirmDelete}>Remove User</Btn>
            <Btn variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Btn>
          </div>
        </Modal>
      )}
      {featuresTarget && (
        <Modal title={`Portal Menu — ${featuresTarget.name}`} onClose={() => setFeaturesTarget(null)}>
          <p className="text-sm mb-3" style={{ color: C.slate }}>Choose which pages {featuresTarget.name} ({featuresTarget.role}) can see in the Customer Portal. Dashboard is always available{featuresTarget.isAdmin ? ", and Administrators always keep access to Users & Approvals so they can't be locked out." : "."}</p>
          <label className="flex items-center gap-2 text-sm font-medium pb-2 mb-1.5 border-b" style={{ borderColor: C.border }}>
            <input type="checkbox" checked={featuresForm.length === TOGGLEABLE_NAV.length} ref={(el) => { if (el) el.indeterminate = featuresForm.length > 0 && featuresForm.length < TOGGLEABLE_NAV.length; }} onChange={() => (featuresForm.length === TOGGLEABLE_NAV.length ? selectNoneFeatures() : selectAllFeatures())} />
            Select All
          </label>
          <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
            {TOGGLEABLE_NAV.map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={key === "org" && featuresTarget.isAdmin ? true : featuresForm.includes(key)} disabled={key === "org" && featuresTarget.isAdmin} onChange={() => toggleFeature(key)} /> {label}{key === "org" && featuresTarget.isAdmin && <span className="text-xs" style={{ color: C.slate }}> (always on for Administrators)</span>}
              </label>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <Btn icon={CheckCircle2} onClick={submitFeatures}>Save Portal Menu</Btn>
            <Btn variant="ghost" onClick={selectAllFeatures}>Select All</Btn>
            <Btn variant="ghost" onClick={selectNoneFeatures}>Select None</Btn>
            <Btn variant="ghost" onClick={resetFeaturesToAll}>Reset to Full Access</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

