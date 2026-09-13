import { useState } from "react";
import { CheckCircle2, CreditCard, Landmark, PhoneCall, Loader2 } from "lucide-react";
import { Btn } from "../../atoms/Btn.jsx";
import { Card } from "../../atoms/Card.jsx";
import { SectionTitle } from "../../atoms/SectionTitle.jsx";
import { Field } from "../../atoms/Field.jsx";
import { TextInput } from "../../atoms/TextInput.jsx";
import { Modal } from "../../molecules/Modal.jsx";
import { Table } from "../../molecules/Table.jsx";
import { PaymentMethodFields } from "../../molecules/PaymentMethodFields.jsx";
import { C } from "../../shared/tokens.js";
import { GHS, canSubmitPayment, pad } from "../../shared/helpers.js";
import { PAYMENT_METHODS } from "../../data/seed.js";
import { useStore } from "../../store/StoreContext.js";

export function WalletView() {
  const { state, dispatch } = useStore();
  const [amt, setAmt] = useState(1000);
  const [method, setMethod] = useState("mobile");
  const [values, setValues] = useState({});
  const [confirm, setConfirm] = useState("");
  const [momoStep, setMomoStep] = useState(null); // null | "requesting" | "pin" | "verifying"
  const [pin, setPin] = useState("");
  const [momoError, setMomoError] = useState("");

  const methodIcons = { mobile: PhoneCall, card: CreditCard, bank: Landmark };
  const topUpMethods = PAYMENT_METHODS.filter((m) => ["mobile", "card", "bank"].includes(m.key));
  const networkLabel = values.momoNetwork || "your network";

  function handleAdd() {
    if (!amt || amt <= 0 || !canSubmitPayment(method, values, Infinity, 0)) return;
    if (method === "mobile") {
      // Simulate a real Mobile Money flow: send a payment prompt to the phone, then require the PIN to authorize.
      setMomoError("");
      setMomoStep("requesting");
      setTimeout(() => setMomoStep("pin"), 2200);
      return;
    }
    const label = topUpMethods.find((m) => m.key === method).label;
    dispatch({ type: "ADD_FUNDS", amount: amt, method: label });
    setConfirm(`${GHS(amt)} added via ${label}.`);
    setValues({});
    setTimeout(() => setConfirm(""), 4000);
  }

  function cancelMomo() {
    setMomoStep(null);
    setPin("");
    setMomoError("");
  }

  function confirmMomoPin() {
    if (pin.length !== 4) { setMomoError("Enter the 4-digit Mobile Money PIN sent to your phone."); return; }
    setMomoError("");
    setMomoStep("verifying");
    setTimeout(() => {
      dispatch({ type: "ADD_FUNDS", amount: amt, method: "Mobile Money" });
      setMomoStep(null);
      setPin("");
      setValues({});
      setConfirm(`${GHS(amt)} added via Mobile Money.`);
      setTimeout(() => setConfirm(""), 4000);
    }, 1400);
  }

  return (
    <div>
      <SectionTitle sub="A pre-funded procurement account for faster checkout — top up by Mobile Money, Visa card or bank transfer.">Wallet</SectionTitle>
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="md:col-span-1">
          <div className="text-center mb-4">
            <div className="text-xs uppercase tracking-wide" style={{ color: C.slate }}>Balance</div>
            <div className="text-3xl font-semibold mt-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{GHS(state.wallet.balance)}</div>
          </div>
          {confirm && <Card className="mb-3 flex items-center gap-2"><CheckCircle2 size={15} color={C.green} /><span className="text-xs">{confirm}</span></Card>}
          <Field label="Amount to add (GHS)"><TextInput type="number" min={10} value={amt} onChange={(e) => setAmt(Number(e.target.value))} /></Field>
          <div className="grid grid-cols-3 gap-1.5 mt-3">
            {topUpMethods.map((m) => {
              const Icon = methodIcons[m.key];
              return (
                <button key={m.key} onClick={() => { setMethod(m.key); setValues({}); }} className="flex flex-col items-center gap-1 py-2 rounded border text-[11px]"
                  style={{ borderColor: method === m.key ? C.brand : C.border, backgroundColor: method === m.key ? C.brandTint : "transparent", color: method === m.key ? C.brandDark : C.inkSoft }}>
                  <Icon size={15} /> {m.key === "mobile" ? "Mobile Money" : m.key === "card" ? "Visa Card" : "Bank Transfer"}
                </button>
              );
            })}
          </div>
          <PaymentMethodFields method={method} values={values} setValues={setValues} walletBalance={state.wallet.balance} />
          <Btn full className="mt-3" disabled={!amt || amt <= 0 || !canSubmitPayment(method, values, Infinity, 0)} onClick={handleAdd}>{method === "mobile" ? "Request Mobile Money Payment" : "Add Funds"}</Btn>
        </Card>
        <Card className="md:col-span-2" pad={false}>
          <Table columns={[{ key: "date", label: "Date" }, { key: "type", label: "Description" }, { key: "amount", label: "Amount", render: (r) => <span style={{ color: r.amount < 0 ? C.red : C.green }}>{r.amount < 0 ? "-" : "+"}{GHS(Math.abs(r.amount))}</span> }]} rows={state.wallet.transactions} />
        </Card>
      </div>

      {momoStep && (
        <Modal title="Mobile Money Payment" onClose={cancelMomo}>
          {momoStep === "requesting" && (
            <div className="text-center py-8">
              <Loader2 size={28} className="mx-auto animate-spin" color={C.brand} />
              <p className="text-sm mt-4">Sending a payment request of {GHS(amt)} to <b>{values.momoNumber || "your phone"}</b> on {networkLabel}…</p>
              <p className="text-xs mt-1" style={{ color: C.slate }}>Please wait for the prompt to appear on your phone.</p>
            </div>
          )}
          {momoStep === "pin" && (
            <div>
              <Card className="mb-3 flex items-start gap-2" style={{ backgroundColor: C.brandTint }}>
                <PhoneCall size={15} color={C.brand} className="mt-0.5 shrink-0" />
                <span className="text-sm">A prompt for <b>{GHS(amt)}</b> was sent to <b>{values.momoNumber}</b>. Enter your Mobile Money PIN below to authorize the payment, just as you would on your phone.</span>
              </Card>
              <Field label="Mobile Money PIN">
                <TextInput type="password" inputMode="numeric" maxLength={4} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="••••" />
              </Field>
              {momoError && <p className="text-xs mt-1" style={{ color: C.red }}>{momoError}</p>}
              <div className="flex gap-2 mt-3">
                <Btn onClick={confirmMomoPin}>Confirm Payment</Btn>
                <Btn variant="ghost" onClick={cancelMomo}>Cancel</Btn>
              </div>
            </div>
          )}
          {momoStep === "verifying" && (
            <div className="text-center py-8">
              <Loader2 size={28} className="mx-auto animate-spin" color={C.brand} />
              <p className="text-sm mt-4">Verifying payment with {networkLabel}…</p>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

