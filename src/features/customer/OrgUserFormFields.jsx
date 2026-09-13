import { Field } from "../../atoms/Field.jsx";
import { TextInput } from "../../atoms/TextInput.jsx";
import { Select } from "../../atoms/Select.jsx";

export const COMMON_ORG_ROLES = ["CEO / Principal", "Procurement Officer", "Finance Officer", "Accountant", "Storekeeper", "Administrator", "Department Head", "Teacher / Staff", "Other"];

export function OrgUserFormFields({ form, setForm }) {
  return (
    <div className="space-y-3">
      <Field label="Full name"><TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
      <Field label="Role / Position">
        <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          {COMMON_ORG_ROLES.map((r) => <option key={r}>{r}</option>)}
        </Select>
      </Field>
      <Field label="Password"><TextInput type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Sign-in password for this position" /></Field>
      <div className="space-y-1.5 pt-1">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isTopApprover} onChange={(e) => setForm({ ...form, isTopApprover: e.target.checked })} /> Can approve quotations for payment (CEO / Principal)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isPayer} onChange={(e) => setForm({ ...form, isPayer: e.target.checked })} /> Can process payment (Accountant)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isAdmin} onChange={(e) => setForm({ ...form, isAdmin: e.target.checked })} /> Is an organization Administrator (can manage users)
        </label>
      </div>
    </div>
  );
}

