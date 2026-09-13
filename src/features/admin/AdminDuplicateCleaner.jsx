import { useState } from "react";
import { Search, AlertTriangle, Trash2, Sparkles, ShieldCheck, Loader2, Pencil } from "lucide-react";
import { Btn } from "../../atoms/Btn.jsx";
import { Card } from "../../atoms/Card.jsx";
import { SectionTitle } from "../../atoms/SectionTitle.jsx";
import { Badge } from "../../atoms/Badge.jsx";
import { C } from "../../shared/tokens.js";
import { GHS } from "../../shared/helpers.js";
import { fetchAiDuplicateAdvice, findDuplicateGroups } from "../../shared/ai.js";
import { useStaff, useStore } from "../../store/StoreContext.js";
import { Catalogue } from "../customer/Catalogue.jsx";
import { EditProductModal } from "./EditProductModal.jsx";

export function AdminDuplicateCleaner() {
  const { state, dispatch } = useStore();
  const me = useStaff();
  const [groups, setGroups] = useState(null); // null = not scanned yet this session
  const [scanning, setScanning] = useState(false);
  const [adviceMap, setAdviceMap] = useState({}); // groupKey -> advice | "loading" | "error"
  const [editTarget, setEditTarget] = useState(null);

  function scan() {
    setScanning(true);
    setTimeout(() => {
      setGroups(findDuplicateGroups(state.products));
      setAdviceMap({});
      setScanning(false);
    }, 250);
  }

  async function getAdvice(group, key) {
    setAdviceMap((m) => ({ ...m, [key]: "loading" }));
    try {
      const advice = await fetchAiDuplicateAdvice(group);
      setAdviceMap((m) => ({ ...m, [key]: advice }));
    } catch (err) {
      setAdviceMap((m) => ({ ...m, [key]: "error" }));
    }
  }

  function deleteItem(p) {
    dispatch({ type: "REMOVE_PRODUCT", id: p.id });
    setGroups((gs) => gs.map((g) => g.filter((x) => x.id !== p.id)).filter((g) => g.length > 1));
  }

  if (!me.isSuperAdmin) {
    return (
      <div>
        <SectionTitle sub="Scan the live catalogue for duplicate items and clean them up with AI-assisted recommendations.">AI Duplicate Catalogue Cleaner</SectionTitle>
        <Card className="flex items-center gap-2" style={{ backgroundColor: C.amberTint }}>
          <ShieldCheck size={15} color={C.brandDark} /> <span className="text-sm">Only the Super Administrator can use the Duplicate Catalogue Cleaner.</span>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <SectionTitle sub="Scan the live catalogue for duplicate items — typically created when two supplier submissions for the same product both get approved as new catalogue entries — and clean them up with AI-assisted recommendations.">AI Duplicate Catalogue Cleaner</SectionTitle>
      <Card className="mb-4 flex items-start gap-2" style={{ backgroundColor: C.amberTint }}>
        <AlertTriangle size={15} color={C.brandDark} className="mt-0.5 shrink-0" />
        <span className="text-sm">Detection compares exact catalogue item names, so genuinely distinct variants and grades are never mistakenly flagged. The AI recommendation is advisory only — you always make the final Delete or Edit decision, and any change is published to every portal's catalogue immediately.</span>
      </Card>
      <Btn icon={scanning ? Loader2 : Search} disabled={scanning} onClick={scan}>{scanning ? "Scanning…" : "Scan Catalogue for Duplicates"}</Btn>

      {groups !== null && (
        <div className="mt-5">
          {groups.length === 0 ? (
            <Card className="text-center py-10 text-sm" style={{ color: C.slate }}>No duplicate items found in the catalogue right now.</Card>
          ) : (
            <div className="space-y-4">
              <div className="text-sm font-medium">{groups.length} duplicate group{groups.length > 1 ? "s" : ""} found ({groups.reduce((s, g) => s + g.length, 0)} items)</div>
              {groups.map((group, gi) => {
                const key = group[0].name + "-" + gi;
                const advice = adviceMap[key];
                return (
                  <Card key={key}>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="font-medium">{group[0].name}</div>
                      {!advice && <Btn size="sm" variant="ghost" icon={Sparkles} onClick={() => getAdvice(group, key)}>Get AI Recommendation</Btn>}
                    </div>
                    {advice === "loading" && <p className="text-xs mb-3" style={{ color: C.slate }}>Asking AI for a recommendation…</p>}
                    {advice === "error" && <p className="text-xs mb-3" style={{ color: C.red }}>Couldn't reach the AI service — try again.</p>}
                    {advice && advice !== "loading" && advice !== "error" && (
                      <Card className="mb-3" style={{ backgroundColor: C.brandTint }}>
                        <div className="text-xs"><b>AI recommends keeping SKU {advice.keepSku}.</b> {advice.rationale}</div>
                      </Card>
                    )}
                    <div className="space-y-2">
                      {group.map((p) => (
                        <div key={p.id} className="flex flex-wrap items-center justify-between gap-2 p-2 rounded border" style={{ borderColor: advice && advice.keepSku === p.sku ? C.brand : C.border }}>
                          <div className="text-sm">
                            <span className="font-medium">{p.sku}</span> — {GHS(p.price)} (corp {GHS(p.corpPrice)}, bulk {GHS(p.bulkPrice)})
                            {advice && advice.keepSku === p.sku && <Badge tone="brand"> AI Pick</Badge>}
                          </div>
                          <div className="flex gap-1.5">
                            <Btn size="sm" variant="ghost" icon={Pencil} onClick={() => setEditTarget(p)}>Edit</Btn>
                            <Btn size="sm" variant="danger" icon={Trash2} onClick={() => deleteItem(p)}>Delete</Btn>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {editTarget && (
        <EditProductModal product={editTarget} onClose={() => setEditTarget(null)} onSaved={() => { setEditTarget(null); scan(); }} />
      )}
    </div>
  );
}

