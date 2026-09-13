import { useState, useMemo } from "react";
import { ClipboardList, CheckCircle2, TrendingUp, Landmark } from "lucide-react";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Btn } from "../../atoms/Btn.jsx";
import { Card } from "../../atoms/Card.jsx";
import { SectionTitle } from "../../atoms/SectionTitle.jsx";
import { Stat } from "../../atoms/Stat.jsx";
import { Field } from "../../atoms/Field.jsx";
import { TextInput } from "../../atoms/TextInput.jsx";
import { C } from "../../shared/tokens.js";
import { GHS } from "../../shared/helpers.js";
import { useStore } from "../../store/StoreContext.js";

export function BudgetAnalytics() {
  const { state, dispatch } = useStore();
  const [annual, setAnnual] = useState(state.budget.annual);
  const available = state.budget.annual - state.budget.spent - state.budget.committed;
  const spendByCat = useMemo(() => {
    const map = {};
    state.orders.forEach((o) => o.items.forEach((it) => { map[it.category || "other"] = (map[it.category || "other"] || 0) + it.unitPrice * it.qty; }));
    return Object.entries(map).map(([category, value]) => ({ category, value: Math.round(value) }));
  }, [state.orders]);
  const monthly = [
    { m: "Apr", spend: 62000 }, { m: "May", spend: 71000 }, { m: "Jun", spend: 58000 },
    { m: "Jul", spend: 84000 }, { m: "Aug", spend: 96000 }, { m: "Sep", spend: 40000 + state.budget.spent - 40000 },
  ];
  const COLORS_PIE = [C.brand, C.amber, C.green, C.red, C.slate, C.brandDark];
  return (
    <div>
      <SectionTitle sub="Set budgets and analyze spend by category, month and supplier.">Budget & Analytics</SectionTitle>
      <div className="grid md:grid-cols-4 gap-3 mb-5">
        <Stat label="Annual Budget" value={GHS(state.budget.annual)} icon={Landmark} />
        <Stat label="Spent" value={GHS(state.budget.spent)} icon={TrendingUp} tint={C.redTint} fg={C.red} />
        <Stat label="Committed" value={GHS(state.budget.committed)} icon={ClipboardList} tint={C.amberTint} fg={C.amber} />
        <Stat label="Available" value={GHS(available)} icon={CheckCircle2} tint={C.greenTint} fg={C.green} />
      </div>
      <div className="grid lg:grid-cols-2 gap-4 mb-5">
        <Card>
          <div className="text-sm font-medium mb-2">Monthly Spend Trend</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthly}><CartesianGrid stroke={C.border} /><XAxis dataKey="m" fontSize={12} /><YAxis fontSize={12} /><Tooltip /><Line type="monotone" dataKey="spend" stroke={C.brand} strokeWidth={2} /></LineChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <div className="text-sm font-medium mb-2">Spend by Category</div>
          {spendByCat.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={spendByCat} dataKey="value" nameKey="category" outerRadius={80} label>
                  {spendByCat.map((_, i) => <Cell key={i} fill={COLORS_PIE[i % COLORS_PIE.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="text-sm py-16 text-center" style={{ color: C.slate }}>Place an order to see category breakdown.</div>}
        </Card>
      </div>
      <Card className="max-w-sm">
        <Field label="Set annual procurement budget (GHS)">
          <div className="flex gap-2"><TextInput type="number" value={annual} onChange={(e) => setAnnual(Number(e.target.value))} /><Btn onClick={() => dispatch({ type: "SET_BUDGET", annual })}>Save</Btn></div>
        </Field>
      </Card>
    </div>
  );
}

