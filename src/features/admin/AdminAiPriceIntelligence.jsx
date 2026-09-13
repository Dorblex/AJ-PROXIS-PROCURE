import { useState } from "react";
import { CheckCircle2, XCircle, AlertTriangle, ShieldCheck, Loader2, Target, History } from "lucide-react";
import { Btn } from "../../atoms/Btn.jsx";
import { Card } from "../../atoms/Card.jsx";
import { SectionTitle } from "../../atoms/SectionTitle.jsx";
import { Badge, statusTone } from "../../atoms/Badge.jsx";
import { Table } from "../../molecules/Table.jsx";
import { C } from "../../shared/tokens.js";
import { GHS, pad } from "../../shared/helpers.js";
import { fetchAiMarketPrice } from "../../shared/ai.js";
import { useStaff, useStore } from "../../store/StoreContext.js";
import { Catalogue } from "../customer/Catalogue.jsx";

export function AdminAiPriceIntelligence() {
  const { state, dispatch } = useStore();
  const me = useStaff();
  const [loadingId, setLoadingId] = useState(null);
  const [errorId, setErrorId] = useState(null);

  async function runAnalysis(sub) {
    setLoadingId(sub.id);
    setErrorId(null);
    try {
      const result = await fetchAiMarketPrice(sub.name, sub.category, sub.price);
      dispatch({
        type: "SAVE_AI_PRICE_ANALYSIS",
        supplierId: sub.supplierId, supplierName: sub.supplierName, submissionId: sub.id,
        itemName: sub.name, category: sub.category, supplierPrice: sub.price,
        aiMarketLow: result.marketLow, aiMarketHigh: result.marketHigh,
        aiSuggestedPrice: result.suggestedPrice, aiRationale: result.rationale,
      });
    } catch (err) {
      setErrorId(sub.id);
    }
    setLoadingId(null);
  }

  function analysisFor(submissionId) {
    return state.priceAnalyses.find((p) => p.submissionId === submissionId);
  }

  const pendingSubmissions = state.supplierSubmissions.filter((s) => s.status === "Pending Review" || s.status === "Applied");

  return (
    <div>
      <SectionTitle sub="Compare supplier-submitted prices against AI-estimated Ghanaian market prices, and approve AI-suggested prices for the customer catalogue.">AI Market Price Intelligence</SectionTitle>
      <Card className="mb-4 flex items-start gap-2" style={{ backgroundColor: C.amberTint }}>
        <AlertTriangle size={15} color={C.brandDark} className="mt-0.5 shrink-0" />
        <span className="text-sm">Market prices are AI-generated estimates based on general knowledge, not live market data feeds — use them as a guide alongside your own judgment.</span>
      </Card>

      <div className="text-sm font-medium mb-2">Supplier Submissions</div>
      <div className="space-y-3 mb-6">
        {pendingSubmissions.map((sub) => {
          const analysis = analysisFor(sub.id);
          return (
            <Card key={sub.id}>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div>
                  <div className="font-medium">{sub.name}</div>
                  <div className="text-xs" style={{ color: C.slate }}>{sub.supplierName} · Submitted {sub.submittedAt} · Their price: {GHS(sub.price)}</div>
                </div>
                {!analysis && (
                  <Btn size="sm" icon={loadingId === sub.id ? Loader2 : Target} disabled={loadingId === sub.id} onClick={() => runAnalysis(sub)}>
                    {loadingId === sub.id ? "Analyzing…" : "Run AI Analysis"}
                  </Btn>
                )}
              </div>
              {errorId === sub.id && <p className="text-xs" style={{ color: C.red }}>Couldn't reach the AI service — try again.</p>}
              {analysis && (
                <Card style={{ backgroundColor: C.brandTint }}>
                  <div className="grid sm:grid-cols-3 gap-3 mb-2">
                    <div><div className="text-xs" style={{ color: C.slate }}>Supplier Price</div><div className="font-semibold">{GHS(analysis.supplierPrice)}</div></div>
                    <div><div className="text-xs" style={{ color: C.slate }}>AI Market Range</div><div className="font-semibold">{GHS(analysis.aiMarketLow)} – {GHS(analysis.aiMarketHigh)}</div></div>
                    <div><div className="text-xs" style={{ color: C.slate }}>AI Suggested Price</div><div className="font-semibold" style={{ color: C.brand }}>{GHS(analysis.aiSuggestedPrice)}</div></div>
                  </div>
                  <p className="text-xs mb-3" style={{ color: C.inkSoft }}>{analysis.aiRationale}</p>
                  {analysis.status === "Pending Review" ? (
                    me.isSuperAdmin ? (
                      <div className="flex gap-2">
                        <Btn size="sm" icon={CheckCircle2} onClick={() => dispatch({ type: "APPROVE_AI_PRICE_ANALYSIS", id: analysis.id, decidedBy: me.name })}>Approve & Update Catalogue</Btn>
                        <Btn size="sm" variant="ghost" icon={XCircle} onClick={() => dispatch({ type: "DISMISS_AI_PRICE_ANALYSIS", id: analysis.id })}>Dismiss</Btn>
                      </div>
                    ) : (
                      <div className="text-xs flex items-center gap-1.5" style={{ color: C.slate }}><ShieldCheck size={13} /> Only the Super Administrator can approve catalogue price changes.</div>
                    )
                  ) : (
                    <Badge tone={statusTone(analysis.status)}>{analysis.status}</Badge>
                  )}
                </Card>
              )}
            </Card>
          );
        })}
        {!pendingSubmissions.length && <Card className="text-center py-10 text-sm" style={{ color: C.slate }}>No supplier submissions to analyze right now.</Card>}
      </div>

      <div className="text-sm font-medium mb-2">Analysis History</div>
      <Card pad={false}>
        <Table columns={[
          { key: "itemName", label: "Item" }, { key: "supplierName", label: "Supplier" },
          { key: "supplierPrice", label: "Supplier Price", render: (r) => GHS(r.supplierPrice) },
          { key: "aiSuggestedPrice", label: "AI Suggested", render: (r) => GHS(r.aiSuggestedPrice) },
          { key: "status", label: "Status", render: (r) => <Badge tone={statusTone(r.status)}>{r.status}</Badge> },
          { key: "createdAt", label: "Date" },
        ]} rows={state.priceAnalyses} empty="No AI price analyses run yet." />
      </Card>
    </div>
  );
}

