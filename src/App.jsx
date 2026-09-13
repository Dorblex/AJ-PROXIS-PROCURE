import { useState, useReducer, useEffect } from "react";

import { C, FONT_LINK } from "./shared/tokens.js";
import { reducer, initialState, seq } from "./store/reducer.js";
import { uidState } from "./store/ids.js";
import { StoreCtx } from "./store/StoreContext.js";

import { Landing } from "./features/company/Landing.jsx";
import { CompanyPage } from "./features/company/CompanyPage.jsx";
import { AuthScreen } from "./features/auth/AuthScreen.jsx";
import { CustomerPortal } from "./features/customer/CustomerPortal.jsx";
import { AdminPortal } from "./features/admin/AdminPortal.jsx";
import { SupplierPortal } from "./features/supplier/SupplierPortal.jsx";

/* ============================================================================
   AJ-PROXIS PROCURE — a multi-company B2B procurement & business-supply
   platform prototype for AJ-PROXIS SOLUTIONS.

   This file is now just the composition root: it owns the store (reducer +
   persistence) and picks which top-level page/portal to render. Every actual
   screen lives under atoms/molecules/organisms/templates/pages, split out by
   atomic-design layer — see README.md for the full map. All data is simulated
   /in-memory so the full request → quote → approve → pay → procure → deliver
   → reconcile loop can be explored without a live backend or payment provider.
   ========================================================================== */

const COMPANY_PAGES = ["about", "team", "contact", "careers", "events", "tickets", "documents"];
const STORAGE_KEY = "ajproxis-procure-state-v1";

export default function App() {
  const [role, setRole] = useState("landing");
  const [state, dispatch] = useReducer(reducer, initialState);
  const [hydrated, setHydrated] = useState(false);
  const loggedInFor = (portal) => state.session.portal === portal && state.session.accountId;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await window.storage.get(STORAGE_KEY, false);
        if (result && result.value && !cancelled) {
          const saved = JSON.parse(result.value);
          if (saved && saved.__state) {
            Object.assign(seq, saved.__seq || {});
            uidState.current = Math.max(uidState.current, saved.__uidCounter || 1000);
            dispatch({ type: "HYDRATE", payload: saved.__state });
          }
        }
      } catch (err) {
        // No saved data yet (first run) or storage unavailable — continue with the freshly seeded state.
      }
      if (!cancelled) setHydrated(true);
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const t = setTimeout(() => {
      window.storage
        .set(STORAGE_KEY, JSON.stringify({ __state: state, __seq: seq, __uidCounter: uidState.current }), false)
        .catch(() => {});
    }, 700);
    return () => clearTimeout(t);
  }, [state, hydrated]);

  if (!hydrated) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: C.paper, fontFamily: "'Inter', sans-serif", color: C.slate }}>
        <div className="text-sm">Loading AJ-PROXIS Procure…</div>
      </div>
    );
  }

  return (
    <StoreCtx.Provider value={{ state, dispatch }}>
      <style>{`
        @import url('${FONT_LINK}');
        * { box-sizing: border-box; }
        body { margin: 0; }
        @keyframes fadein { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        .animate-fadein { animation: fadein 0.45s ease; }
        @media print {
          body * { visibility: hidden; }
          .printable-doc, .printable-doc * { visibility: visible; }
          .printable-doc { position: absolute; top: 0; left: 0; width: 100%; padding: 24px; }
        }
      `}</style>
      {role === "landing" && <Landing setRole={setRole} />}
      {COMPANY_PAGES.includes(role) && <CompanyPage page={role} setRole={setRole} />}
      {role === "customer" && (loggedInFor("customer") ? <CustomerPortal setRole={setRole} /> : <AuthScreen portal="customer" setRole={setRole} />)}
      {role === "admin" && (loggedInFor("admin") ? <AdminPortal setRole={setRole} /> : <AuthScreen portal="admin" setRole={setRole} />)}
      {role === "supplier" && (loggedInFor("supplier") ? <SupplierPortal setRole={setRole} /> : <AuthScreen portal="supplier" setRole={setRole} />)}
    </StoreCtx.Provider>
  );
}
