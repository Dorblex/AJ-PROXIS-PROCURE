import { useState } from "react";
import { DollarSign, Landmark } from "lucide-react";
import { Card } from "../../atoms/Card.jsx";
import { SectionTitle } from "../../atoms/SectionTitle.jsx";
import { Stat } from "../../atoms/Stat.jsx";
import { Field } from "../../atoms/Field.jsx";
import { TextInput } from "../../atoms/TextInput.jsx";
import { Row } from "../../molecules/Row.jsx";
import { C } from "../../shared/tokens.js";
import { GHS } from "../../shared/helpers.js";
import { useStore } from "../../store/StoreContext.js";

export function AdminFinance() {
  const { state } = useStore();
  const revenue = state.orders.reduce((s, o) => s + o.total, 0);
  const vat = state.orders.reduce((s, o) => s + (o.tax?.vat || 0), 0);
  const nhil = state.orders.reduce((s, o) => s + (o.tax?.nhil || 0), 0);
  const getfund = state.orders.reduce((s, o) => s + (o.tax?.getfund || 0), 0);
  const [fx, setFx] = useState({ cost: 1000, freight: 150, insurance: 40, duty: 220, port: 90, clearing: 60, transport: 50, rate: 14.2, margin: 25 });
  const landedUSD = fx.cost + fx.freight + fx.insurance + fx.duty + fx.port + fx.clearing + fx.transport;
  const landedGHS = landedUSD * fx.rate;
  const sellingPrice = landedGHS * (1 + fx.margin / 100);
  return (
    <div>
      <SectionTitle sub="Revenue, statutory levies, and import costing tools.">Finance</SectionTitle>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Stat label="Revenue" value={GHS(revenue)} icon={DollarSign} />
        <Stat label="VAT Collected" value={GHS(vat)} icon={Landmark} />
        <Stat label="NHIL Collected" value={GHS(nhil)} icon={Landmark} />
        <Stat label="GETFund Collected" value={GHS(getfund)} icon={Landmark} />
      </div>
      <Card className="max-w-2xl">
        <div className="text-sm font-medium mb-3">Landed Cost & FX Calculator (Importation)</div>
        <div className="grid sm:grid-cols-3 gap-3">
          {[["cost", "Product Cost (USD)"], ["freight", "Int'l Freight"], ["insurance", "Insurance"], ["duty", "Customs Duty"], ["port", "Port Charges"], ["clearing", "Clearing Charges"], ["transport", "Local Transport"], ["rate", "FX Rate (USD→GHS)"], ["margin", "Margin %"]].map(([k, l]) => (
            <Field key={k} label={l}><TextInput type="number" value={fx[k]} onChange={(e) => setFx({ ...fx, [k]: Number(e.target.value) })} /></Field>
          ))}
        </div>
        <div className="border-t mt-4 pt-3 grid sm:grid-cols-3 gap-2 text-sm" style={{ borderColor: C.border }}>
          <Row l="Landed Cost (USD)" v={"$" + landedUSD.toFixed(2)} />
          <Row l="Landed Cost (GHS)" v={GHS(landedGHS)} />
          <Row l="Recommended Selling Price" v={GHS(sellingPrice)} bold />
        </div>
      </Card>
    </div>
  );
}

