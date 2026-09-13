import { C } from "../shared/tokens.js";
import { GHS } from "../shared/helpers.js";
import { Field } from "../atoms/Field.jsx";
import { Select } from "../atoms/Select.jsx";
import { TextInput } from "../atoms/TextInput.jsx";
import { Card } from "../atoms/Card.jsx";

export function PaymentMethodFields({ method, values, setValues, walletBalance }) {
  return (
    <div className="space-y-2 mt-2">
      {method === "mobile" && (
        <>
          <Field label="Network">
            <Select value={values.momoNetwork || "MTN"} onChange={(e) => setValues({ ...values, momoNetwork: e.target.value })}>
              <option>MTN</option><option>Telecel</option><option>AirtelTigo</option>
            </Select>
          </Field>
          <Field label="Mobile Money number"><TextInput placeholder="024 000 0000" value={values.momoNumber || ""} onChange={(e) => setValues({ ...values, momoNumber: e.target.value })} /></Field>
          <p className="text-[11px]" style={{ color: C.slate }}>You'll receive a prompt on this number to approve the payment with your Mobile Money PIN.</p>
        </>
      )}
      {method === "card" && (
        <>
          <Field label="Card number"><TextInput placeholder="4000 1234 5678 9010" value={values.cardNumber || ""} onChange={(e) => setValues({ ...values, cardNumber: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Expiry"><TextInput placeholder="MM/YY" value={values.cardExpiry || ""} onChange={(e) => setValues({ ...values, cardExpiry: e.target.value })} /></Field>
            <Field label="CVV"><TextInput placeholder="123" value={values.cardCvv || ""} onChange={(e) => setValues({ ...values, cardCvv: e.target.value })} /></Field>
          </div>
          <p className="text-[11px]" style={{ color: C.slate }}>Card details are processed securely by the payment provider and are never stored by AJ-PROXIS.</p>
        </>
      )}
      {method === "bank" && (
        <>
          <Card className="text-xs" style={{ color: C.slate }}>
            Transfer to AJ-PROXIS SOLUTIONS — Acc. 0012004488, GCB Bank, Ridge Branch, then confirm below.
          </Card>
          <Field label="Your transfer reference (optional)"><TextInput placeholder="e.g. bank reference number" value={values.bankRef || ""} onChange={(e) => setValues({ ...values, bankRef: e.target.value })} /></Field>
          <p className="text-[11px]" style={{ color: C.slate }}>Orders paid by bank transfer are confirmed once AJ-PROXIS reconciles the transfer, typically within 1 business day.</p>
        </>
      )}
      {method === "wallet" && (
        <p className="text-xs" style={{ color: C.slate }}>Amount will be deducted immediately from your AJ-PROXIS Wallet balance ({GHS(walletBalance || 0)} available).</p>
      )}
      {method === "credit" && (
        <label className="flex items-start gap-2 text-xs" style={{ color: C.slate }}>
          <input type="checkbox" checked={values.creditAgree || false} onChange={(e) => setValues({ ...values, creditAgree: e.target.checked })} className="mt-0.5" />
          I acknowledge this purchase will be billed to our approved corporate credit account under agreed payment terms.
        </label>
      )}
    </div>
  );
}
