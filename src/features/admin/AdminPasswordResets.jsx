import { useState } from "react";
import { CheckCircle2, ShieldCheck, KeyRound, History } from "lucide-react";
import { Btn } from "../../atoms/Btn.jsx";
import { Card } from "../../atoms/Card.jsx";
import { SectionTitle } from "../../atoms/SectionTitle.jsx";
import { Badge } from "../../atoms/Badge.jsx";
import { Field } from "../../atoms/Field.jsx";
import { TextInput } from "../../atoms/TextInput.jsx";
import { Select } from "../../atoms/Select.jsx";
import { Modal } from "../../molecules/Modal.jsx";
import { Table } from "../../molecules/Table.jsx";
import { C } from "../../shared/tokens.js";
import { pad } from "../../shared/helpers.js";
import { useStaff, useStore } from "../../store/StoreContext.js";

export function AdminPasswordResets() {
  const { state, dispatch } = useStore();
  const me = useStaff();
  const [resetTarget, setResetTarget] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [justReset, setJustReset] = useState(null);
  const [toolPortal, setToolPortal] = useState("customer");
  const [toolAccountId, setToolAccountId] = useState("");

  const PORTAL_LABEL = { customer: "Customer Organization", supplier: "Supplier", staff: "Control Centre Staff", orgUser: "Company User" };

  function accountsForPortal(p) {
    if (p === "customer") return state.customers;
    if (p === "supplier") return state.suppliers;
    if (p === "staff") return state.staff;
    return state.orgUsers;
  }
  function labelFor(p, a) {
    if (p === "orgUser") return `${a.name} — ${a.role}`;
    return `${a.name || a.orgName} (${a.email || "no email"})`;
  }
  function generatePassword() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    let out = "";
    for (let i = 0; i < 10; i++) out += chars[Math.floor(Math.random() * chars.length)];
    setNewPassword(out);
  }
  function openResetFromRequest(req) {
    setResetTarget({ portal: req.portal, accountId: req.accountId, accountName: req.accountName, requestId: req.id });
    setNewPassword("");
  }
  function openResetFromTool() {
    if (!toolAccountId) return;
    const acc = accountsForPortal(toolPortal).find((a) => a.id === toolAccountId);
    if (!acc) return;
    setResetTarget({ portal: toolPortal, accountId: acc.id, accountName: acc.name || acc.orgName, requestId: null });
    setNewPassword("");
  }
  function confirmReset() {
    if (!resetTarget || !newPassword.trim()) return;
    dispatch({ type: "RESET_ACCOUNT_PASSWORD", portal: resetTarget.portal, accountId: resetTarget.accountId, newPassword: newPassword.trim(), resolvedBy: me.name, requestId: resetTarget.requestId, accountName: resetTarget.accountName });
    setJustReset({ accountName: resetTarget.accountName, newPassword: newPassword.trim() });
    setResetTarget(null);
    setNewPassword("");
    setToolAccountId("");
  }

  const pending = state.passwordResets.filter((r) => r.status === "Pending");
  const resolved = state.passwordResets.filter((r) => r.status === "Resolved");

  return (
    <div>
      <SectionTitle sub="Reset passwords for any account on AJ-PROXIS Procure — customer organizations, suppliers, Control Centre staff, and company users. Only the Super Administrator can reset passwords.">Password Resets</SectionTitle>
      {!me.isSuperAdmin && (
        <Card className="mb-4 flex items-center gap-2" style={{ backgroundColor: C.amberTint }}>
          <ShieldCheck size={15} color={C.brandDark} />
          <span className="text-sm">You're signed in as {me.name} ({me.role}). Only the Super Administrator can reset account passwords.</span>
        </Card>
      )}

      {justReset && (
        <Card className="mb-4" style={{ backgroundColor: C.greenTint }}>
          <div className="flex items-center gap-2 mb-1"><CheckCircle2 size={15} color={C.green} /><span className="text-sm font-medium">Password reset for {justReset.accountName}</span></div>
          <div className="text-sm">New password: <b>{justReset.newPassword}</b></div>
          <p className="text-xs mt-1" style={{ color: C.slate }}>Share this with the account holder through a secure channel — it won't be shown again.</p>
          <Btn size="sm" variant="ghost" className="mt-2" onClick={() => setJustReset(null)}>Dismiss</Btn>
        </Card>
      )}

      <div className="text-sm font-medium mb-2">Pending Reset Requests {pending.length > 0 && <Badge tone="amber">{pending.length}</Badge>}</div>
      <Card pad={false} className="mb-6">
        <Table columns={[
          { key: "accountName", label: "Account" },
          { key: "portal", label: "Type", render: (r) => PORTAL_LABEL[r.portal] || r.portal },
          { key: "identifier", label: "Identifier" },
          { key: "requestedAt", label: "Requested" },
          { key: "a", label: "", render: (r) => me.isSuperAdmin && <Btn size="sm" icon={KeyRound} onClick={() => openResetFromRequest(r)}>Reset Password</Btn> },
        ]} rows={pending} empty="No pending password reset requests." />
      </Card>

      {me.isSuperAdmin && (
        <Card className="mb-6">
          <div className="text-sm font-medium mb-3">Reset Any Account</div>
          <div className="grid sm:grid-cols-3 gap-3 items-end">
            <Field label="Account type">
              <Select value={toolPortal} onChange={(e) => { setToolPortal(e.target.value); setToolAccountId(""); }}>
                <option value="customer">Customer Organization</option>
                <option value="supplier">Supplier</option>
                <option value="staff">Control Centre Staff</option>
                <option value="orgUser">Company User</option>
              </Select>
            </Field>
            <Field label="Account">
              <Select value={toolAccountId} onChange={(e) => setToolAccountId(e.target.value)}>
                <option value="">Select an account…</option>
                {accountsForPortal(toolPortal).map((a) => <option key={a.id} value={a.id}>{labelFor(toolPortal, a)}</option>)}
              </Select>
            </Field>
            <Btn onClick={openResetFromTool} disabled={!toolAccountId} icon={KeyRound}>Reset Password</Btn>
          </div>
        </Card>
      )}

      <div className="text-sm font-medium mb-2">Reset History</div>
      <Card pad={false}>
        <Table columns={[
          { key: "accountName", label: "Account" },
          { key: "portal", label: "Type", render: (r) => PORTAL_LABEL[r.portal] || r.portal },
          { key: "resolvedAt", label: "Resolved" },
          { key: "resolvedBy", label: "Resolved By" },
        ]} rows={resolved} empty="No password resets have been made yet." />
      </Card>

      {resetTarget && (
        <Modal title={`Reset Password — ${resetTarget.accountName}`} onClose={() => setResetTarget(null)}>
          <p className="text-sm mb-3" style={{ color: C.slate }}>Set a new password for this account, or generate a random one.</p>
          <div className="flex gap-2 mb-3">
            <TextInput placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            <Btn variant="ghost" onClick={generatePassword}>Generate</Btn>
          </div>
          <Btn disabled={!newPassword.trim()} icon={CheckCircle2} onClick={confirmReset}>Confirm Reset</Btn>
        </Modal>
      )}
    </div>
  );
}

