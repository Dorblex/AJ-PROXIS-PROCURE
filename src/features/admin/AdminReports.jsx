import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card } from "../../atoms/Card.jsx";
import { SectionTitle } from "../../atoms/SectionTitle.jsx";
import { C } from "../../shared/tokens.js";
import { useStore } from "../../store/StoreContext.js";

export function AdminReports() {
  const { state } = useStore();
  const bySupplier = state.suppliers.map((s) => ({ name: s.name.split(" ")[0], score: Math.round((s.reliability + s.quality + s.delivery) / 3) }));
  return (
    <div>
      <SectionTitle sub="Purchase analytics across products, suppliers and time.">Reports & Analytics</SectionTitle>
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="text-sm font-medium mb-2">Supplier Performance Score</div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={bySupplier}><CartesianGrid stroke={C.border} /><XAxis dataKey="name" fontSize={11} /><YAxis fontSize={11} /><Tooltip /><Bar dataKey="score" fill={C.brand} radius={[3, 3, 0, 0]} /></BarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <div className="text-sm font-medium mb-2">Orders by Status</div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={["Processing", "Dispatched", "Out for Delivery", "Delivered", "Partially Delivered"].map((s) => ({ s, n: state.orders.filter((o) => o.deliveryStatus === s).length }))}>
              <CartesianGrid stroke={C.border} /><XAxis dataKey="s" fontSize={10} /><YAxis fontSize={11} allowDecimals={false} /><Tooltip /><Bar dataKey="n" fill={C.amber} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}

