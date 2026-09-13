import { Badge } from "../../atoms/Badge.jsx";
import { C } from "../../shared/tokens.js";
import { useActingUser, useStore } from "../../store/StoreContext.js";

export function ActingUserSwitcher({ compact }) {
  const { dispatch } = useStore();
  const actingUser = useActingUser();
  return (
    <div className={`flex items-center gap-2 flex-wrap ${compact ? "text-xs" : "text-sm"}`}>
      <span style={{ color: C.slate }}>Signed in as:</span>
      <span className="font-medium">{actingUser.name} — {actingUser.role}</span>
      {actingUser.isTopApprover && <Badge tone="green">Can approve requests</Badge>}
      {actingUser.isPayer && <Badge tone="green">Can process payment</Badge>}
      {!actingUser.isTopApprover && !actingUser.isPayer && <Badge tone="amber">View / submit / negotiate only</Badge>}
      <button onClick={() => dispatch({ type: "STAFF_SIGN_OUT" })} className="text-xs underline" style={{ color: C.brand }}>Not you? Switch user</button>
    </div>
  );
}

export const COMMON_ORG_ROLES = ["CEO / Principal", "Procurement Officer", "Finance Officer", "Accountant", "Storekeeper", "Administrator", "Department Head", "Teacher / Staff", "Other"];

