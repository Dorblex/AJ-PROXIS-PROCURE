import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Btn } from "../../atoms/Btn.jsx";
import { Card } from "../../atoms/Card.jsx";
import { SectionTitle } from "../../atoms/SectionTitle.jsx";
import { Field } from "../../atoms/Field.jsx";
import { TextInput } from "../../atoms/TextInput.jsx";
import { Table } from "../../molecules/Table.jsx";
import { C } from "../../shared/tokens.js";
import { GHS, pad } from "../../shared/helpers.js";
import { useStaff, useStore } from "../../store/StoreContext.js";

export function AdminLoyaltyProgram() {
  const { state, dispatch } = useStore();
  const me = useStaff();
  const [loyaltyRate, setLoyaltyRate] = useState(state.loyaltyRate);
  const [redemptionRate, setRedemptionRate] = useState(state.redemptionRate);

  return (
    <div>
      <SectionTitle sub="Customers automatically earn points on every paid order and can redeem them for wallet credit. Set the earn and redemption rates here.">Rewards Program</SectionTitle>
      {me.isSuperAdmin ? (
        <Card className="mb-6 max-w-md">
          <div className="text-sm font-medium mb-3">Program Rates</div>
          <Field label="Points earned per GHS spent"><TextInput type="number" value={loyaltyRate} onChange={(e) => setLoyaltyRate(e.target.value)} /></Field>
          <Field label="Points required per GHS 1 redeemed"><TextInput type="number" value={redemptionRate} onChange={(e) => setRedemptionRate(e.target.value)} /></Field>
          <Btn className="mt-2" onClick={() => dispatch({ type: "SET_LOYALTY_RATES", loyaltyRate, redemptionRate })}>Save Rates</Btn>
        </Card>
      ) : (
        <Card className="mb-4 flex items-center gap-2" style={{ backgroundColor: C.amberTint }}>
          <ShieldCheck size={15} color={C.brandDark} />
          <span className="text-sm">Only the Super Administrator can change program rates. Currently: 1 point per {GHS(state.loyaltyRate)}, {state.redemptionRate} points per GHS 1 redeemed.</span>
        </Card>
      )}
      <div className="text-sm font-medium mb-2">Customer Points Balances</div>
      <Card pad={false}>
        <Table columns={[
          { key: "name", label: "Organization" },
          { key: "loyaltyPoints", label: "Points Balance", render: (c) => (c.loyaltyPoints || 0).toLocaleString() },
          { key: "value", label: "Redeemable Value", render: (c) => GHS(Math.floor((c.loyaltyPoints || 0) / state.redemptionRate)) },
        ]} rows={state.customers.filter((c) => c.status === "Active")} empty="No active customers yet." />
      </Card>
    </div>
  );
}

