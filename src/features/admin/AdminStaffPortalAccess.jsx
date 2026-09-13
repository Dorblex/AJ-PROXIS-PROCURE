import { CheckCircle2, XCircle, ShieldCheck } from "lucide-react";
import { Btn } from "../../atoms/Btn.jsx";
import { Card } from "../../atoms/Card.jsx";
import { SectionTitle } from "../../atoms/SectionTitle.jsx";
import { Badge } from "../../atoms/Badge.jsx";
import { Select } from "../../atoms/Select.jsx";
import { C } from "../../shared/tokens.js";
import { pad } from "../../shared/helpers.js";
import { useStaff, useStore } from "../../store/StoreContext.js";
import { ADMIN_NAV } from "./adminNav.js";

export function AdminStaffPortalAccess() {
  const { state, dispatch } = useStore();
  const me = useStaff();
  const PAGES = ADMIN_NAV.filter(([key]) => key !== "dashboard" && key !== "users" && key !== "staff-access" && key !== "password-resets");

  function hasAccess(staffMember, key) {
    if (staffMember.isSuperAdmin) return true;
    return !staffMember.features || staffMember.features.includes(key);
  }

  function toggleCell(staffMember, key) {
    if (!me.isSuperAdmin || staffMember.isSuperAdmin) return;
    const current = staffMember.features ? [...staffMember.features] : PAGES.map(([k]) => k);
    const next = current.includes(key) ? current.filter((k) => k !== key) : [...current, key];
    dispatch({ type: "UPDATE_STAFF_FEATURES", id: staffMember.id, features: next });
  }

  function selectAllForStaff(staffMember) {
    if (!me.isSuperAdmin || staffMember.isSuperAdmin) return;
    dispatch({ type: "UPDATE_STAFF_FEATURES", id: staffMember.id, features: PAGES.map(([k]) => k) });
  }
  function selectNoneForStaff(staffMember) {
    if (!me.isSuperAdmin || staffMember.isSuperAdmin) return;
    dispatch({ type: "UPDATE_STAFF_FEATURES", id: staffMember.id, features: [] });
  }

  return (
    <div>
      <SectionTitle sub="A complete view of which AJ-PROXIS Control Centre pages each staff member can access. Click any cell to toggle it — only the Super Administrator can make changes here.">Staff Portal Access</SectionTitle>
      {!me.isSuperAdmin && (
        <Card className="mb-4 flex items-center gap-2" style={{ backgroundColor: C.amberTint }}>
          <ShieldCheck size={15} color={C.brandDark} />
          <span className="text-sm">You're signed in as {me.name} ({me.role}). Only the Super Administrator can edit staff portal access.</span>
        </Card>
      )}

      <Card pad={false} className="mb-4" style={{ overflowX: "auto" }}>
        <table className="text-sm" style={{ minWidth: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr className="border-b" style={{ borderColor: C.border }}>
              <th className="text-left py-2.5 px-4 font-medium text-xs uppercase tracking-wide sticky left-0" style={{ color: C.slate, backgroundColor: C.panel }}>Page</th>
              {state.staff.map((s) => {
                const allSelected = !s.features || PAGES.every(([k]) => s.features.includes(k));
                return (
                  <th key={s.id} className="text-center py-2.5 px-3 font-medium" style={{ minWidth: "34mm" }}>
                    <div className="text-xs">{s.name}{s.id === me.id && <Badge tone="brand"> You</Badge>}</div>
                    <div className="text-[10px] font-normal" style={{ color: C.slate }}>{s.role}{s.isSuperAdmin ? " · Super Admin" : ""}</div>
                    {me.isSuperAdmin && !s.isSuperAdmin && (
                      <label className="flex items-center justify-center gap-1 text-[10px] font-normal mt-1 cursor-pointer" style={{ color: C.brand }}>
                        <input
                          type="checkbox"
                          checked={allSelected}
                          ref={(el) => { if (el) el.indeterminate = !allSelected && PAGES.some(([k]) => hasAccess(s, k)); }}
                          onChange={() => (allSelected ? selectNoneForStaff(s) : selectAllForStaff(s))}
                        /> Select All
                      </label>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {PAGES.map(([key, label]) => (
              <tr key={key} className="border-b last:border-0" style={{ borderColor: C.border }}>
                <td className="py-2 px-4 sticky left-0" style={{ backgroundColor: C.panel }}>{label}</td>
                {state.staff.map((s) => {
                  const allowed = hasAccess(s, key);
                  const editable = me.isSuperAdmin && !s.isSuperAdmin;
                  return (
                    <td key={s.id} className="text-center py-2 px-3">
                      <button
                        disabled={!editable}
                        onClick={() => toggleCell(s, key)}
                        title={editable ? "Click to toggle" : s.isSuperAdmin ? "Super Administrators always have full access" : ""}
                        style={{ cursor: editable ? "pointer" : "default" }}
                      >
                        {allowed ? <CheckCircle2 size={16} color={C.green} /> : <XCircle size={16} color={C.border} />}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {me.isSuperAdmin && (
        <div className="flex flex-wrap gap-2">
          {state.staff.filter((s) => !s.isSuperAdmin).map((s) => (
            <Btn key={s.id} size="sm" variant="ghost" onClick={() => dispatch({ type: "UPDATE_STAFF_FEATURES", id: s.id, features: null })}>Reset {s.name} to Full Access</Btn>
          ))}
        </div>
      )}
    </div>
  );
}

