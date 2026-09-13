import { useState } from "react";
import { Wallet as WalletIcon, TrendingUp, Gift } from "lucide-react";
import { Btn } from "../../atoms/Btn.jsx";
import { Card } from "../../atoms/Card.jsx";
import { SectionTitle } from "../../atoms/SectionTitle.jsx";
import { Stat } from "../../atoms/Stat.jsx";
import { Field } from "../../atoms/Field.jsx";
import { TextInput } from "../../atoms/TextInput.jsx";
import { C } from "../../shared/tokens.js";
import { GHS } from "../../shared/helpers.js";
import { useCustomer, useStore } from "../../store/StoreContext.js";

export function RewardsPage() {
  const { state, dispatch } = useStore();
  const customer = useCustomer();
  const [redeemAmt, setRedeemAmt] = useState(100);
  const points = customer.loyaltyPoints || 0;
  const creditValue = Math.floor(points / state.redemptionRate);
  const redeemCredit = Math.floor(redeemAmt / state.redemptionRate);

  return (
    <div>
      <SectionTitle sub="Earn points automatically every time you pay for an order, and redeem them for wallet credit anytime.">Rewards & Loyalty</SectionTitle>
      <div className="grid sm:grid-cols-3 gap-3 mb-6">
        <Stat label="Points Balance" value={points.toLocaleString()} icon={Gift} tint={C.amberTint} fg={C.amber} />
        <Stat label="Redeemable Value" value={GHS(creditValue)} icon={WalletIcon} />
        <Stat label="Earn Rate" value={`1 pt / ${GHS(state.loyaltyRate)} spent`} icon={TrendingUp} />
      </div>
      <Card className="max-w-md">
        <div className="text-sm font-medium mb-3">Redeem Points for Wallet Credit</div>
        <Field label={`Points to redeem (you have ${points})`}>
          <TextInput type="number" min="0" max={points} value={redeemAmt} onChange={(e) => setRedeemAmt(Number(e.target.value))} />
        </Field>
        <p className="text-xs my-2" style={{ color: C.slate }}>{redeemAmt} points = {GHS(redeemCredit)} wallet credit ({state.redemptionRate} points per GHS 1).</p>
        <Btn icon={Gift} disabled={redeemAmt <= 0 || redeemAmt > points} onClick={() => dispatch({ type: "REDEEM_LOYALTY_POINTS", customerId: customer.id, points: redeemAmt })}>Redeem Now</Btn>
      </Card>
    </div>
  );
}

