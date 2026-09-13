import { useState } from "react";
import { AlertTriangle, LogOut, CreditCard } from "lucide-react";
import { Btn } from "../../atoms/Btn.jsx";
import { Card } from "../../atoms/Card.jsx";
import { Row } from "../../molecules/Row.jsx";
import { PaymentMethodFields } from "../../molecules/PaymentMethodFields.jsx";
import { C } from "../../shared/tokens.js";
import { LOGO_ICON } from "../../shared/brandAssets.js";
import { GHS, canSubmitPayment, daysUntil } from "../../shared/helpers.js";
import { PAYMENT_METHODS } from "../../data/seed.js";
import { useCustomer, useStore } from "../../store/StoreContext.js";

export function AccountOnHold({ setRole }) {
  const { state, dispatch } = useStore();
  const customer = useCustomer();
  const days = daysUntil(customer.certificateExpiresAt);
  const [payment, setPayment] = useState("mobile");
  const [payValues, setPayValues] = useState({});
  const paymentReady = canSubmitPayment(payment, payValues, state.wallet.balance, state.registrationFee);

  function handleRenew() {
    dispatch({ type: "PAY_CERTIFICATE_RENEWAL", customerId: customer.id, paymentMethod: payment });
  }

  return (
    <div style={{ backgroundColor: C.paper, minHeight: "100vh", fontFamily: "'Inter', sans-serif", color: C.ink }}>
      <div style={{ backgroundColor: C.brandDark }} className="text-white">
        <div className="max-w-lg mx-auto px-6 py-8 flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm" style={{ color: "#D6E4EE" }}><img src={LOGO_ICON} alt="AJ-PROXIS" className="h-8 w-8" /> {customer.name}</span>
          <button onClick={() => { dispatch({ type: "LOGOUT" }); setRole("landing"); }} className="flex items-center gap-2 text-xs" style={{ color: "#D6E4EE" }}><LogOut size={14} /> Log out</button>
        </div>
      </div>
      <div className="max-w-lg mx-auto px-6 py-10">
        <Card style={{ backgroundColor: C.redTint, borderColor: C.red }} className="mb-5">
          <div className="flex items-start gap-3">
            <AlertTriangle size={22} color={C.red} className="shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Account On Hold</div>
              <p className="text-sm mt-1" style={{ color: C.inkSoft }}>{customer.name}'s AJ-PROXIS registration certificate expired {Math.abs(days)} day(s) ago (on {customer.certificateExpiresAt}). Access to the Customer Portal has been placed on hold automatically. Pay the annual renewal fee below to restore full access instantly, or contact AJ-PROXIS Control Centre to request manual access.</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="text-sm font-medium mb-3">Renew Registration Certificate</div>
          <Row l="Certificate No." v={customer.certificateId} />
          <Row l="Annual Renewal Fee" v={GHS(state.registrationFee)} bold />
          <div className="space-y-1 my-3">
            {PAYMENT_METHODS.map((m) => (
              <label key={m.key} className="flex items-center gap-2 text-sm">
                <input type="radio" name="holdpm" checked={payment === m.key} onChange={() => { setPayment(m.key); setPayValues({}); }} /> {m.label}
              </label>
            ))}
          </div>
          <PaymentMethodFields method={payment} values={payValues} setValues={setPayValues} walletBalance={state.wallet.balance} />
          <Btn full className="mt-4" icon={CreditCard} disabled={!paymentReady} onClick={handleRenew}>Pay {GHS(state.registrationFee)} & Restore Access</Btn>
        </Card>
      </div>
    </div>
  );
}
