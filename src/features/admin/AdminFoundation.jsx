import { useState } from "react";
import { ShoppingCart, Wallet as WalletIcon, CheckCircle2, Plus, ShieldCheck, Heart } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Btn } from "../../atoms/Btn.jsx";
import { Card } from "../../atoms/Card.jsx";
import { SectionTitle } from "../../atoms/SectionTitle.jsx";
import { Stat } from "../../atoms/Stat.jsx";
import { Field } from "../../atoms/Field.jsx";
import { TextInput } from "../../atoms/TextInput.jsx";
import { TextArea } from "../../atoms/TextArea.jsx";
import { Modal } from "../../molecules/Modal.jsx";
import { Table } from "../../molecules/Table.jsx";
import { C } from "../../shared/tokens.js";
import { GHS, pad } from "../../shared/helpers.js";
import { useStaff, useStore } from "../../store/StoreContext.js";

export function AdminFoundation() {
  const { state, dispatch } = useStore();
  const me = useStaff();
  const [showGrant, setShowGrant] = useState(false);
  const [grantForm, setGrantForm] = useState({ recipient: "", purpose: "", amount: "" });

  const totalRaised = state.foundation.contributions.reduce((s, c) => s + c.amount, 0);
  const totalDisbursed = state.foundation.disbursements.reduce((s, d) => s + d.amount, 0);
  const available = totalRaised - totalDisbursed;

  const byMonth = {};
  state.foundation.contributions.forEach((c) => {
    const m = c.date?.slice(0, 7) || "unknown";
    byMonth[m] = (byMonth[m] || 0) + c.amount;
  });
  const chartData = Object.entries(byMonth).sort(([a], [b]) => a.localeCompare(b)).map(([m, v]) => ({ m, v: Math.round(v) }));

  function submitGrant() {
    if (!grantForm.recipient.trim() || !grantForm.amount || Number(grantForm.amount) <= 0) return;
    dispatch({ type: "RECORD_FOUNDATION_DISBURSEMENT", recipient: grantForm.recipient, purpose: grantForm.purpose, amount: Number(grantForm.amount), approvedBy: me.name });
    setGrantForm({ recipient: "", purpose: "", amount: "" });
    setShowGrant(false);
  }

  return (
    <div>
      <SectionTitle sub="Funded automatically by 5% of revenue from every item sold on AJ-PROXIS Procure, reinvested into community and social-impact initiatives.">AJ-PROXIS Foundation</SectionTitle>

      <Card className="mb-5 flex items-start gap-3" style={{ backgroundColor: C.brandTint }}>
        <div className="h-10 w-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "#fff" }}>
          <Heart size={18} color={C.red} fill={C.red} />
        </div>
        <div>
          <div className="font-semibold text-sm mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Our Commitment</div>
          <p className="text-sm" style={{ color: C.inkSoft }}>Every time a customer completes a purchase on AJ-PROXIS Procure, 5% of that order's product value is automatically set aside for the AJ-PROXIS Foundation — supporting schools, health outreach, and community development across Ghana. No extra cost to the customer; it's carried by AJ-PROXIS.</p>
        </div>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Stat label="Total Raised (All-Time)" value={GHS(totalRaised)} icon={Heart} tint={C.redTint} fg={C.red} />
        <Stat label="Total Disbursed" value={GHS(totalDisbursed)} icon={CheckCircle2} tint={C.greenTint} fg={C.green} />
        <Stat label="Available Balance" value={GHS(available)} icon={WalletIcon} />
        <Stat label="Contributing Orders" value={state.foundation.contributions.length} icon={ShoppingCart} />
      </div>

      <Card className="mb-6">
        <div className="text-sm font-medium mb-2">Contributions Over Time</div>
        {chartData.length ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}><CartesianGrid stroke={C.border} /><XAxis dataKey="m" fontSize={11} /><YAxis fontSize={11} /><Tooltip formatter={(v) => GHS(v)} /><Bar dataKey="v" fill={C.red} radius={[3, 3, 0, 0]} /></BarChart>
          </ResponsiveContainer>
        ) : <div className="text-sm py-10 text-center" style={{ color: C.slate }}>No contributions recorded yet — they'll appear here as orders are paid.</div>}
      </Card>

      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <div className="text-sm font-medium">Recent Contributions</div>
      </div>
      <Card pad={false} className="mb-6">
        <Table columns={[
          { key: "orderId", label: "Order" }, { key: "orgName", label: "Customer" },
          { key: "orderValue", label: "Order Value", render: (r) => GHS(r.orderValue) },
          { key: "amount", label: "Foundation Contribution (5%)", render: (r) => GHS(r.amount) },
          { key: "date", label: "Date" },
        ]} rows={state.foundation.contributions.slice(0, 50)} empty="No contributions yet." />
      </Card>

      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <div className="text-sm font-medium">Disbursements & Grants</div>
        {me.isSuperAdmin && <Btn size="sm" icon={Plus} onClick={() => setShowGrant(true)}>Record Disbursement</Btn>}
      </div>
      {!me.isSuperAdmin && (
        <Card className="mb-3 flex items-center gap-2" style={{ backgroundColor: C.amberTint }}>
          <ShieldCheck size={15} color={C.brandDark} />
          <span className="text-sm">Only the Super Administrator can record Foundation disbursements. Signed in as {me.name} ({me.role}).</span>
        </Card>
      )}
      <Card pad={false}>
        <Table columns={[
          { key: "id", label: "Reference" }, { key: "recipient", label: "Recipient / Cause" }, { key: "purpose", label: "Purpose" },
          { key: "amount", label: "Amount", render: (r) => GHS(r.amount) }, { key: "approvedBy", label: "Approved By" }, { key: "date", label: "Date" },
        ]} rows={state.foundation.disbursements} empty="No disbursements recorded yet." />
      </Card>

      {showGrant && (
        <Modal title="Record Foundation Disbursement" onClose={() => setShowGrant(false)}>
          <p className="text-sm mb-3" style={{ color: C.slate }}>Available balance: {GHS(available)}</p>
          <div className="space-y-3">
            <Field label="Recipient / Cause"><TextInput value={grantForm.recipient} onChange={(e) => setGrantForm({ ...grantForm, recipient: e.target.value })} placeholder="e.g. Kingsford Community School" /></Field>
            <Field label="Purpose"><TextArea rows={2} value={grantForm.purpose} onChange={(e) => setGrantForm({ ...grantForm, purpose: e.target.value })} placeholder="e.g. Classroom furniture donation" /></Field>
            <Field label="Amount (GHS)"><TextInput type="number" value={grantForm.amount} onChange={(e) => setGrantForm({ ...grantForm, amount: e.target.value })} /></Field>
            <Btn icon={Heart} disabled={!grantForm.recipient.trim() || !grantForm.amount} onClick={submitGrant}>Confirm Disbursement</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

