import { ShoppingCart, Truck, AlertTriangle, DollarSign, BadgeCheck, ScrollText } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card } from "../../atoms/Card.jsx";
import { SectionTitle } from "../../atoms/SectionTitle.jsx";
import { Stat } from "../../atoms/Stat.jsx";
import { Table } from "../../molecules/Table.jsx";
import { C } from "../../shared/tokens.js";
import { GHS, pad, taxBreakdown } from "../../shared/helpers.js";
import { useStore } from "../../store/StoreContext.js";

export function AdminIGF() {
  const { state } = useStore();

  const paidQuotations = state.quotations.filter((q) => q.status === "Paid");
  const salesTotal = paidQuotations.reduce((s, q) => s + taxBreakdown(q.subtotal, q.discount || 0, q.delivery || 0).grand, 0);
  const deliveryTotal = paidQuotations.reduce((s, q) => s + (q.delivery || 0), 0);
  const productSalesOnly = salesTotal - deliveryTotal;
  const registrationTotal = state.customers.filter((c) => c.certificateId).length * state.registrationFee;
  const eventTicketTotal = state.eventTickets.reduce((s, t) => s + (t.amountPaid || 0), 0);
  const totalIGF = productSalesOnly + deliveryTotal + registrationTotal + eventTicketTotal;

  const sources = [
    { name: "Product & Service Sales", value: productSalesOnly, color: C.brand },
    { name: "Delivery Fees", value: deliveryTotal, color: C.amber },
    { name: "Registration & Renewal Fees", value: registrationTotal, color: C.red },
    { name: "Event Ticket Sales", value: eventTicketTotal, color: C.green },
  ];

  return (
    <div>
      <SectionTitle sub="Internally Generated Funds — every revenue stream AJ-PROXIS Solutions earns directly from its own operations.">IGF — Internally Generated Funds</SectionTitle>
      <Card className="mb-4 flex items-start gap-2" style={{ backgroundColor: C.amberTint }}>
        <AlertTriangle size={15} color={C.brandDark} className="mt-0.5 shrink-0" />
        <span className="text-sm">Registration & Renewal Fees are estimated from currently active registration certificates at today's fee rate, since individual historical renewal transactions aren't separately ledgered. All other figures are calculated directly from paid orders and ticket sales.</span>
      </Card>

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        <Stat label="Total IGF" value={GHS(totalIGF)} icon={DollarSign} tint={C.brandTint} fg={C.brand} />
        <Stat label="Product & Service Sales" value={GHS(productSalesOnly)} icon={ShoppingCart} />
        <Stat label="Delivery Fees" value={GHS(deliveryTotal)} icon={Truck} />
        <Stat label="Registration & Renewal Fees" value={GHS(registrationTotal)} icon={BadgeCheck} />
        <Stat label="Event Ticket Sales" value={GHS(eventTicketTotal)} icon={ScrollText} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        <Card>
          <div className="text-sm font-medium mb-3">Revenue by Source</div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={sources} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={(d) => `${((d.value / (totalIGF || 1)) * 100).toFixed(0)}%`}>
                {sources.map((s, i) => <Cell key={i} fill={s.color} />)}
              </Pie>
              <Tooltip formatter={(v) => GHS(v)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
        <Card pad={false}>
          <Table columns={[
            { key: "name", label: "Revenue Source" },
            { key: "value", label: "Amount", render: (r) => GHS(r.value) },
            { key: "pct", label: "% of Total", render: (r) => `${((r.value / (totalIGF || 1)) * 100).toFixed(1)}%` },
          ]} rows={sources} />
        </Card>
      </div>

      <div className="text-sm font-medium mb-2">Underlying Records</div>
      <div className="grid sm:grid-cols-3 gap-3 text-xs" style={{ color: C.slate }}>
        <Card>{paidQuotations.length} paid quotations/orders</Card>
        <Card>{state.customers.filter((c) => c.certificateId).length} active customer registrations</Card>
        <Card>{state.eventTickets.length} event tickets sold</Card>
      </div>
    </div>
  );
}

