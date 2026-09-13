import { useState } from "react";
import { Search, Truck, FileText, Building2, ClipboardList, CheckCircle2, AlertTriangle, Settings, Receipt, CreditCard, ChevronLeft, Factory, Send, PackageCheck, ShieldCheck } from "lucide-react";
import { Btn } from "../../atoms/Btn.jsx";
import { Card } from "../../atoms/Card.jsx";
import { Field } from "../../atoms/Field.jsx";
import { TextInput } from "../../atoms/TextInput.jsx";
import { Select } from "../../atoms/Select.jsx";
import { C } from "../../shared/tokens.js";
import { LOGO_ICON } from "../../shared/brandAssets.js";
import { pad } from "../../shared/helpers.js";
import { CATEGORIES, ORG_TYPES } from "../../data/seed.js";
import { log } from "../../store/reducer.js";
import { useStore } from "../../store/StoreContext.js";
import { SignupConfirmationModal } from "./SignupConfirmationModal.jsx";

export const PORTAL_CONFIG = {
  customer: {
    title: "Customer Portal",
    subtitle: "Request, approve, pay for and track procurement for your organization.",
    icon: Building2,
    demoHint: "Demo login: procurement@kingsfordprep.edu.gh / demo1234",
  },
  supplier: {
    title: "Supplier Portal",
    subtitle: "Receive RFQs, submit competitive quotations and fulfill AJ-PROXIS orders.",
    icon: Factory,
    demoHint: "Demo login: sales@accraofficeworld.com / supplier123",
  },
  admin: {
    title: "AJ-PROXIS Control Centre",
    subtitle: "Internal staff access — procurement, finance, logistics, suppliers and admin.",
    icon: Settings,
    demoHint: "Demo login: admin@ajproxis.com / admin123",
  },
};

export function AuthScreen({ portal, setRole }) {
  const { state, dispatch } = useStore();
  const cfg = PORTAL_CONFIG[portal];
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const [custForm, setCustForm] = useState({ orgName: "", orgType: ORG_TYPES[0], contact: "", email: "", phone: "", billingAddress: "", deliveryAddress: "", password: "" });
  const [supForm, setSupForm] = useState({ name: "", category: CATEGORIES[0].key, location: "", email: "", phone: "", password: "" });
  const [staffForm, setStaffForm] = useState({ name: "", email: "", role: state.internalRoles[1]?.role || state.internalRoles[0].role, password: "" });
  const [emailConfirm, setEmailConfirm] = useState(null);
  const [forgotEmail, setForgotEmail] = useState("");

  function accountsFor(p) {
    if (p === "customer") return state.customers;
    if (p === "supplier") return state.suppliers;
    return state.staff;
  }
  function isActive(p, acc) {
    return p === "supplier" ? acc.status === "Approved" : acc.status === "Active";
  }

  function handleLogin(e) {
    if (e && e.preventDefault) e.preventDefault();
    setError(""); setInfo("");
    const list = accountsFor(portal);
    const acc = list.find((a) => (a.email || "").trim().toLowerCase() === email.trim().toLowerCase() && (a.password || "").trim() === password.trim());
    if (!acc) { setError("Incorrect email or password."); return; }
    if (!isActive(portal, acc)) {
      setError(acc.status === "Rejected"
        ? "This registration was declined by AJ-PROXIS Control Centre. Contact AJ-PROXIS for details."
        : "This account is awaiting approval from AJ-PROXIS Control Centre. You'll get access once it's approved.");
      return;
    }
    dispatch({ type: "LOGIN", portal, accountId: acc.id });
    setRole(portal);
  }

  function handleForgotPassword(e) {
    if (e && e.preventDefault) e.preventDefault();
    setError(""); setInfo("");
    if (!forgotEmail.trim()) { setError("Enter the email on your account."); return; }
    const list = accountsFor(portal);
    const acc = list.find((a) => (a.email || "").trim().toLowerCase() === forgotEmail.trim().toLowerCase());
    if (acc) {
      dispatch({ type: "REQUEST_PASSWORD_RESET", portal, accountId: acc.id, identifier: forgotEmail.trim(), accountName: acc.name || acc.orgName || acc.email });
    }
    setForgotEmail("");
    setMode("login");
    setInfo("If an account exists with this email, a password reset request has been sent to AJ-PROXIS Control Centre. You'll be notified once your new password is ready.");
  }

  function handleSignup(e) {
    if (e && e.preventDefault) e.preventDefault();
    setError(""); setInfo("");
    const list = accountsFor(portal);
    const form = portal === "customer" ? custForm : portal === "supplier" ? supForm : staffForm;
    if (!form.email || !form.password) { setError("Email and password are required."); return; }
    if (list.some((a) => (a.email || "").toLowerCase() === form.email.trim().toLowerCase())) { setError("An account with this email already exists."); return; }
    if (portal === "customer") {
      const orgId = "ORG-" + pad(state.customers.length + 1, 4);
      dispatch({ type: "SIGNUP_CUSTOMER", payload: custForm });
      setEmailConfirm({ form: { ...custForm }, orgId });
    }
    if (portal === "supplier") dispatch({ type: "SIGNUP_SUPPLIER", payload: supForm });
    if (portal === "admin") dispatch({ type: "SIGNUP_STAFF", payload: staffForm });
    setInfo("Registration submitted. AJ-PROXIS Control Centre will review your details and approve your account before you can log in.");
    setMode("login");
    setEmail(form.email); setPassword("");
  }

  const Icon = cfg.icon;

  return (
    <div style={{ backgroundColor: C.paper, minHeight: "100vh", fontFamily: "'Inter', sans-serif", color: C.ink }}>
      <div style={{ backgroundColor: C.brandDark }} className="text-white">
        <div className="max-w-4xl mx-auto px-6 py-10 flex items-center justify-between">
          <button onClick={() => setRole("landing")} className="flex items-center gap-2 text-sm" style={{ color: "#D6E4EE" }}><ChevronLeft size={16} /> Back</button>
          <div className="flex items-center gap-2.5">
            <div className="text-right">
              <div className="text-xs tracking-wide" style={{ color: "#9FC7E0" }}>AJ-PROXIS SOLUTIONS</div>
              <div className="font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>AJ-PROXIS Procure</div>
            </div>
            <img src={LOGO_ICON} alt="AJ-PROXIS" className="h-10 w-10 shrink-0" />
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-1">
          <div className="h-10 w-10 rounded flex items-center justify-center" style={{ backgroundColor: C.brandTint }}><Icon size={19} color={C.brand} /></div>
          <div>
            <div className="font-semibold text-lg" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{cfg.title}</div>
          </div>
        </div>
        <p className="text-sm mb-6" style={{ color: C.slate }}>{cfg.subtitle}</p>

        <div className="flex rounded border overflow-hidden mb-5" style={{ borderColor: C.border }}>
          {["login", "signup"].map((m) => (
            <button key={m} onClick={() => { setMode(m); setError(""); setInfo(""); }} className="flex-1 text-sm py-2 font-medium"
              style={{ backgroundColor: mode === m ? C.brand : "transparent", color: mode === m ? "#fff" : C.inkSoft }}>
              {m === "login" ? "Log In" : "Sign Up"}
            </button>
          ))}
        </div>

        {error && <Card className="mb-4 flex items-start gap-2" style={{ borderColor: C.red }}><AlertTriangle size={15} color={C.red} className="mt-0.5 shrink-0" /><span className="text-sm">{error}</span></Card>}
        {info && <Card className="mb-4 flex items-start gap-2"><CheckCircle2 size={15} color={C.green} className="mt-0.5 shrink-0" /><span className="text-sm">{info}</span></Card>}

        {mode === "login" && (
          <Card>
            <div className="space-y-3" onKeyDown={(e) => e.key === "Enter" && handleLogin(e)}>
              <Field label="Email"><TextInput type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
              <Field label="Password"><TextInput type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
              <Btn onClick={handleLogin} full>Log In</Btn>
              <button type="button" onClick={() => { setMode("forgot"); setError(""); setInfo(""); }} className="text-xs underline block mx-auto" style={{ color: C.brand }}>Forgot password?</button>
              <p className="text-[11px] text-center pt-1" style={{ color: C.slate }}>{cfg.demoHint}</p>
            </div>
          </Card>
        )}

        {mode === "forgot" && (
          <Card>
            <p className="text-sm mb-3" style={{ color: C.slate }}>Enter the email on your account. AJ-PROXIS Control Centre will review the request and set a new password for you.</p>
            <div className="space-y-3" onKeyDown={(e) => e.key === "Enter" && handleForgotPassword(e)}>
              <Field label="Email"><TextInput type="email" required value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} /></Field>
              <Btn onClick={handleForgotPassword} full icon={Send}>Send Reset Request</Btn>
              <button type="button" onClick={() => { setMode("login"); setError(""); setInfo(""); }} className="text-xs underline block mx-auto" style={{ color: C.brand }}>Back to Log In</button>
            </div>
          </Card>
        )}

        {mode === "signup" && portal === "customer" && (
          <Card>
            <div className="space-y-3" onKeyDown={(e) => e.key === "Enter" && handleSignup(e)}>
              <Field label="Organization name"><TextInput required value={custForm.orgName} onChange={(e) => setCustForm({ ...custForm, orgName: e.target.value })} /></Field>
              <Field label="Organization type">
                <Select value={custForm.orgType} onChange={(e) => setCustForm({ ...custForm, orgType: e.target.value })}>
                  {ORG_TYPES.map((t) => <option key={t}>{t}</option>)}
                </Select>
              </Field>
              <Field label="Contact person"><TextInput required value={custForm.contact} onChange={(e) => setCustForm({ ...custForm, contact: e.target.value })} /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Email"><TextInput type="email" required value={custForm.email} onChange={(e) => setCustForm({ ...custForm, email: e.target.value })} /></Field>
                <Field label="Phone"><TextInput required value={custForm.phone} onChange={(e) => setCustForm({ ...custForm, phone: e.target.value })} /></Field>
              </div>
              <Field label="Billing address"><TextInput value={custForm.billingAddress} onChange={(e) => setCustForm({ ...custForm, billingAddress: e.target.value })} /></Field>
              <Field label="Delivery address"><TextInput value={custForm.deliveryAddress} onChange={(e) => setCustForm({ ...custForm, deliveryAddress: e.target.value })} /></Field>
              <Field label="Password"><TextInput type="password" required value={custForm.password} onChange={(e) => setCustForm({ ...custForm, password: e.target.value })} /></Field>
              <Btn onClick={handleSignup} full icon={Send}>Submit Registration</Btn>
              <p className="text-[11px] text-center pt-1" style={{ color: C.slate }}>Reviewed by AJ-PROXIS Control Centre before you can log in.</p>
            </div>
          </Card>
        )}

        {mode === "signup" && portal === "supplier" && (
          <Card>
            <div className="space-y-3" onKeyDown={(e) => e.key === "Enter" && handleSignup(e)}>
              <Field label="Company name"><TextInput required value={supForm.name} onChange={(e) => setSupForm({ ...supForm, name: e.target.value })} /></Field>
              <Field label="Primary category">
                <Select value={supForm.category} onChange={(e) => setSupForm({ ...supForm, category: e.target.value })}>
                  {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
                </Select>
              </Field>
              <Field label="Location"><TextInput required value={supForm.location} onChange={(e) => setSupForm({ ...supForm, location: e.target.value })} /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Email"><TextInput type="email" required value={supForm.email} onChange={(e) => setSupForm({ ...supForm, email: e.target.value })} /></Field>
                <Field label="Phone"><TextInput required value={supForm.phone} onChange={(e) => setSupForm({ ...supForm, phone: e.target.value })} /></Field>
              </div>
              <Field label="Password"><TextInput type="password" required value={supForm.password} onChange={(e) => setSupForm({ ...supForm, password: e.target.value })} /></Field>
              <Btn onClick={handleSignup} full icon={Send}>Submit Registration</Btn>
              <p className="text-[11px] text-center pt-1" style={{ color: C.slate }}>Reviewed by AJ-PROXIS Control Centre before you can receive RFQs.</p>
            </div>
          </Card>
        )}

        {mode === "signup" && portal === "admin" && (
          <Card>
            <div className="space-y-3" onKeyDown={(e) => e.key === "Enter" && handleSignup(e)}>
              <Field label="Full name"><TextInput required value={staffForm.name} onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })} /></Field>
              <Field label="Internal role">
                <Select value={staffForm.role} onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}>
                  {state.internalRoles.map((r) => <option key={r.role}>{r.role}</option>)}
                </Select>
              </Field>
              <Field label="Work email"><TextInput type="email" required value={staffForm.email} onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })} /></Field>
              <Field label="Password"><TextInput type="password" required value={staffForm.password} onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })} /></Field>
              <Btn onClick={handleSignup} full icon={Send}>Request Access</Btn>
              <p className="text-[11px] text-center pt-1" style={{ color: C.slate }}>New staff accounts need Super Administrator approval.</p>
            </div>
          </Card>
        )}
      </div>
      {emailConfirm && (
        <SignupConfirmationModal form={emailConfirm.form} orgId={emailConfirm.orgId} onClose={() => setEmailConfirm(null)} />
      )}
    </div>
  );
}

