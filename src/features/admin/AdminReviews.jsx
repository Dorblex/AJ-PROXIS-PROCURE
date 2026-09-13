import { useState } from "react";
import { CheckCircle2, AlertTriangle, Star, Send, MessageCircle } from "lucide-react";
import { Btn } from "../../atoms/Btn.jsx";
import { Card } from "../../atoms/Card.jsx";
import { SectionTitle } from "../../atoms/SectionTitle.jsx";
import { Stat } from "../../atoms/Stat.jsx";
import { Field } from "../../atoms/Field.jsx";
import { TextArea } from "../../atoms/TextArea.jsx";
import { Modal } from "../../molecules/Modal.jsx";
import { C } from "../../shared/tokens.js";
import { useStore } from "../../store/StoreContext.js";

export function AdminReviews() {
  const { state, dispatch } = useStore();
  const [respondFor, setRespondFor] = useState(null);
  const [response, setResponse] = useState("");

  const avgRating = state.reviews.length ? (state.reviews.reduce((s, r) => s + r.rating, 0) / state.reviews.length).toFixed(1) : "—";

  function submitResponse() {
    if (!respondFor || !response.trim()) return;
    dispatch({ type: "RESPOND_REVIEW", id: respondFor.id, response: response.trim() });
    setRespondFor(null); setResponse("");
  }

  return (
    <div>
      <SectionTitle sub="Customer feedback on delivered orders — respond directly, visible back to the customer.">Reviews & Feedback</SectionTitle>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <Stat label="Average Rating" value={`${avgRating} / 5`} icon={Star} tint={C.amberTint} fg={C.amber} />
        <Stat label="Total Reviews" value={state.reviews.length} icon={MessageCircle} />
        <Stat label="Awaiting Response" value={state.reviews.filter((r) => !r.response).length} icon={AlertTriangle} tint={C.amberTint} fg={C.amber} />
        <Stat label="5★ Reviews" value={state.reviews.filter((r) => r.rating === 5).length} icon={CheckCircle2} tint={C.greenTint} fg={C.green} />
      </div>
      <div className="space-y-3">
        {state.reviews.map((r) => (
          <Card key={r.id}>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
              <div className="font-medium">{r.orgName} <span className="text-xs" style={{ color: C.slate }}>· {r.orderId} · {r.createdAt}</span></div>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => <Star key={n} size={14} fill={n <= r.rating ? C.amber : "none"} color={C.amber} />)}
              </div>
            </div>
            <div className="text-sm" style={{ color: C.inkSoft }}>{r.comment || <span style={{ color: C.slate }}>No written comment.</span>}</div>
            {r.response ? (
              <Card className="mt-2" style={{ backgroundColor: C.brandTint }}>
                <div className="text-xs font-medium mb-0.5" style={{ color: C.brandDark }}>Your response:</div>
                <div className="text-sm">{r.response}</div>
              </Card>
            ) : (
              <Btn size="sm" variant="ghost" className="mt-2" onClick={() => setRespondFor(r)}>Respond</Btn>
            )}
          </Card>
        ))}
        {!state.reviews.length && <Card className="text-center py-8 text-sm" style={{ color: C.slate }}>No reviews submitted yet.</Card>}
      </div>

      {respondFor && (
        <Modal title={`Respond to ${respondFor.orgName}'s review`} onClose={() => setRespondFor(null)}>
          <div className="flex items-center gap-0.5 mb-3">
            {[1, 2, 3, 4, 5].map((n) => <Star key={n} size={16} fill={n <= respondFor.rating ? C.amber : "none"} color={C.amber} />)}
          </div>
          <p className="text-sm mb-3" style={{ color: C.inkSoft }}>{respondFor.comment}</p>
          <Field label="Your response"><TextArea rows={3} value={response} onChange={(e) => setResponse(e.target.value)} /></Field>
          <Btn className="mt-3" icon={Send} onClick={submitResponse}>Send Response</Btn>
        </Modal>
      )}
    </div>
  );
}

