import { useState } from "react";
import { CheckCircle2, AlertTriangle, ChevronLeft, Send } from "lucide-react";
import { Btn } from "../../atoms/Btn.jsx";
import { Card } from "../../atoms/Card.jsx";
import { Field } from "../../atoms/Field.jsx";
import { TextInput } from "../../atoms/TextInput.jsx";
import { Select } from "../../atoms/Select.jsx";
import { C } from "../../shared/tokens.js";
import { LOGO_ICON } from "../../shared/brandAssets.js";
import { useCustomer, useStore } from "../../store/StoreContext.js";

export function StaffSignIn({ setRole }) {
  const { state, dispatch } = useStore();
  const customer = useCustomer();
  const [userId, setUserId] = useState(state.orgUsers[0].id);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [forgotMode, setForgotMode] = useState(false);

  function handleSignIn(e) {
    if (e && e.preventDefault) e.preventDefault();
    const user = state.orgUsers.find((u) => u.id === userId);
    if (!user || user.password !== password) {
      setError("Incorrect password for this position.");
      return;
    }
    setError("");
    dispatch({ type: "STAFF_SIGN_IN", userId: user.id });
  }

  function handleForgotPassword() {
    const user = state.orgUsers.find((u) => u.id === userId);
    if (user) {
      dispatch({ type: "REQUEST_PASSWORD_RESET", portal: "orgUser", accountId: user.id, identifier: user.role, accountName: `${user.name} (${customer.name})` });
    }
    setForgotMode(false);
    setPassword("");
    setError("");
    setInfo(`A password reset request for ${user?.name} has been sent to AJ-PROXIS Control Centre. You'll be notified once your new password is ready.`);
  }

  return (
    <div style={{ backgroundColor: C.paper, minHeight: "100vh", fontFamily: "'Inter', sans-serif", color: C.ink }}>
      <div style={{ backgroundColor: C.brandDark }} className="text-white">
        <div className="max-w-md mx-auto px-6 py-10 flex items-center justify-between">
          <button onClick={() => { dispatch({ type: "LOGOUT" }); setRole("landing"); }} className="flex items-center gap-2 text-sm" style={{ color: "#D6E4EE" }}><ChevronLeft size={16} /> Log out of {customer.name}</button>
          <img src={LOGO_ICON} alt="AJ-PROXIS" className="h-9 w-9 shrink-0" />
        </div>
      </div>
      <div className="max-w-md mx-auto px-6 py-10">
        <div className="font-semibold text-lg mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Staff Sign-In</div>
        <p className="text-sm mb-6" style={{ color: C.slate }}>{customer.name} — choose your position and enter your password to continue into the portal.</p>
        {error && <Card className="mb-4 flex items-start gap-2" style={{ borderColor: C.red }}><AlertTriangle size={15} color={C.red} className="mt-0.5 shrink-0" /><span className="text-sm">{error}</span></Card>}
        {info && <Card className="mb-4 flex items-start gap-2"><CheckCircle2 size={15} color={C.green} className="mt-0.5 shrink-0" /><span className="text-sm">{info}</span></Card>}
        <Card>
          {!forgotMode ? (
            <div className="space-y-3" onKeyDown={(e) => e.key === "Enter" && handleSignIn(e)}>
              <Field label="Position">
                <Select value={userId} onChange={(e) => { setUserId(e.target.value); setError(""); }}>
                  {state.orgUsers.map((u) => <option key={u.id} value={u.id}>{u.name} — {u.role}</option>)}
                </Select>
              </Field>
              <Field label="Password"><TextInput type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
              <Btn full onClick={handleSignIn}>Sign In</Btn>
              <button type="button" onClick={() => { setForgotMode(true); setError(""); setInfo(""); }} className="text-xs underline block mx-auto" style={{ color: C.brand }}>Forgot password?</button>
              <p className="text-[11px] text-center pt-1" style={{ color: C.slate }}>Demo passwords — CEO/Principal: ceo123 · Procurement Officer: proc123 · Finance Officer: finance123 · Accountant: account123 · Storekeeper: store123 · Administrator: orgadmin123</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm" style={{ color: C.slate }}>Select your position — AJ-PROXIS Control Centre will review the request and set a new password for you.</p>
              <Field label="Position">
                <Select value={userId} onChange={(e) => setUserId(e.target.value)}>
                  {state.orgUsers.map((u) => <option key={u.id} value={u.id}>{u.name} — {u.role}</option>)}
                </Select>
              </Field>
              <Btn full icon={Send} onClick={handleForgotPassword}>Send Reset Request</Btn>
              <button type="button" onClick={() => setForgotMode(false)} className="text-xs underline block mx-auto" style={{ color: C.brand }}>Back to Sign In</button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

