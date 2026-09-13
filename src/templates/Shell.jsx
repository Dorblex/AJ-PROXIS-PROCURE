import { useState } from "react";
import { Users, LogOut, Shield, Bell } from "lucide-react";
import { C } from "../shared/tokens.js";
import { LOGO_ICON } from "../shared/brandAssets.js";
import { useStore } from "../store/StoreContext.js";

export function Shell({ nav, view, setView, setRole, roleLabel, roleOrg, children, badgeCount, badgeKey, badges, onSwitchUser, portal }) {
  const { state, dispatch } = useStore();
  const [showNotifs, setShowNotifs] = useState(false);
  const notifications = state.notifications.filter((n) => (n.scope || "customer") === portal);
  const unread = notifications.filter((n) => !n.read).length;
  const badgeMap = badges || (badgeKey ? { [badgeKey]: badgeCount } : {});
  return (
    <div className="min-h-screen flex" style={{ backgroundColor: C.paper, fontFamily: "'Inter', sans-serif", color: C.ink }}>
      <aside className="w-60 shrink-0 border-r flex flex-col" style={{ borderColor: C.border, backgroundColor: C.brandDark }}>
        <div className="px-5 py-5 border-b flex items-center gap-2.5" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
          <img src={LOGO_ICON} alt="AJ-PROXIS" className="h-9 w-9 shrink-0" />
          <div>
            <div className="text-white font-semibold text-lg leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>AJ-PROXIS</div>
            <div className="text-[11px]" style={{ color: "#9FC7E0" }}>PROCURE</div>
          </div>
        </div>
        <nav className="flex-1 py-3 overflow-y-auto">
          {nav.map(([key, label, Icon]) => (
            <button key={key} onClick={() => setView(key)} className="w-full flex items-center gap-2.5 px-5 py-2.5 text-sm text-left relative"
              style={{ color: view === key ? "#fff" : "#B7CAD9", backgroundColor: view === key ? "rgba(255,255,255,0.08)" : "transparent" }}>
              <Icon size={16} /> {label}
              {badgeMap[key] > 0 && <span className="ml-auto text-[10px] rounded-full px-1.5 py-0.5" style={{ backgroundColor: C.amber, color: "#fff" }}>{badgeMap[key]}</span>}
            </button>
          ))}
        </nav>
        <div className="px-5 py-4 border-t space-y-2" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
          {onSwitchUser && (
            <button onClick={onSwitchUser} className="flex items-center gap-2 text-xs" style={{ color: "#B7CAD9" }}><Users size={14} /> Switch user</button>
          )}
          <button onClick={() => { dispatch({ type: "LOGOUT" }); setRole("landing"); }} className="flex items-center gap-2 text-xs" style={{ color: "#B7CAD9" }}><LogOut size={14} /> Log out</button>
        </div>
      </aside>
      <div className="flex-1 min-w-0 flex flex-col">
        {state.session.adminReturn && (
          <div className="px-6 py-2 text-xs flex items-center justify-between" style={{ backgroundColor: C.amberTint, color: C.brandDark }}>
            <span className="flex items-center gap-1.5"><Shield size={13} /> Viewing this portal on behalf of AJ-PROXIS Control Centre.</span>
            <button
              className="underline font-medium"
              onClick={() => {
                const ret = state.session.adminReturn;
                dispatch({ type: "EXIT_VIEW_AS" });
                setRole(ret.portal || "admin");
              }}
            >
              Return to Control Centre
            </button>
          </div>
        )}
        <header className="h-14 shrink-0 border-b flex items-center justify-between px-6" style={{ borderColor: C.border, backgroundColor: C.panel }}>
          <div>
            <div className="text-sm font-medium">{roleLabel}</div>
            <div className="text-[11px]" style={{ color: C.slate }}>{roleOrg}</div>
          </div>
          <div className="relative">
            <button onClick={() => { setShowNotifs(!showNotifs); dispatch({ type: "MARK_NOTIFS_READ", portal }); }} className="relative p-2 rounded hover:bg-black/5">
              <Bell size={17} />
              {unread > 0 && <span className="absolute top-1 right-1 h-2 w-2 rounded-full" style={{ backgroundColor: C.red }} />}
            </button>
            {showNotifs && (
              <div className="absolute right-0 mt-2 w-72 rounded border shadow-lg z-40" style={{ borderColor: C.border, backgroundColor: C.panel }}>
                <div className="px-3 py-2 text-xs font-medium border-b" style={{ borderColor: C.border }}>Notifications</div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.map((n) => <div key={n.id} className="px-3 py-2 text-xs border-b last:border-0" style={{ borderColor: C.border }}>{n.text}</div>)}
                  {!notifications.length && <div className="px-3 py-4 text-xs text-center" style={{ color: C.slate }}>No notifications yet.</div>}
                </div>
              </div>
            )}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
