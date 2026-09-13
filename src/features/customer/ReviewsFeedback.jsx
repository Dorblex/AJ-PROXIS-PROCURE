import { useState } from "react";
import { Star } from "lucide-react";
import { Btn } from "../../atoms/Btn.jsx";
import { Card } from "../../atoms/Card.jsx";
import { SectionTitle } from "../../atoms/SectionTitle.jsx";
import { Field } from "../../atoms/Field.jsx";
import { TextArea } from "../../atoms/TextArea.jsx";
import { Modal } from "../../molecules/Modal.jsx";
import { Table } from "../../molecules/Table.jsx";
import { C } from "../../shared/tokens.js";
import { GHS, pad } from "../../shared/helpers.js";
import { useCustomer, useStore } from "../../store/StoreContext.js";

export function ReviewsFeedback() {
  const { state, dispatch } = useStore();
  const customer = useCustomer();
  const [rateFor, setRateFor] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const myOrders = state.orders.filter((o) => o.customerId === customer.id);
  const myReviews = state.reviews.filter((r) => r.customerId === customer.id);
  const reviewedOrderIds = new Set(myReviews.map((r) => r.orderId));
  const eligible = myOrders.filter((o) => o.deliveryStatus === "Delivered" && !reviewedOrderIds.has(o.id));

  function submit() {
    if (!rateFor) return;
    dispatch({ type: "SUBMIT_REVIEW", customerId: customer.id, orderId: rateFor.id, rating, comment });
    setRateFor(null); setRating(5); setComment("");
  }

  return (
    <div>
      <SectionTitle sub="Rate delivered orders — AJ-PROXIS Control Centre sees every review and can respond directly.">Ratings & Reviews</SectionTitle>

      <div className="text-sm font-medium mb-2">Orders you can rate</div>
      <Card pad={false} className="mb-5">
        <Table columns={[
          { key: "id", label: "Order" }, { key: "createdAt", label: "Date" }, { key: "total", label: "Total", render: (r) => GHS(r.total) },
          { key: "a", label: "", render: (r) => <Btn size="sm" onClick={() => setRateFor(r)}>Rate This Order</Btn> },
        ]} rows={eligible} empty="No delivered orders awaiting a review." />
      </Card>

      <div className="text-sm font-medium mb-2">My Reviews</div>
      <div className="space-y-3">
        {myReviews.map((r) => (
          <Card key={r.id}>
            <div className="flex items-center justify-between mb-1">
              <div className="font-medium">{r.orderId}</div>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => <Star key={n} size={14} fill={n <= r.rating ? C.amber : "none"} color={C.amber} />)}
              </div>
            </div>
            <div className="text-sm" style={{ color: C.inkSoft }}>{r.comment}</div>
            <div className="text-xs mt-1" style={{ color: C.slate }}>{r.createdAt}</div>
            {r.response && (
              <Card className="mt-2" style={{ backgroundColor: C.brandTint }}>
                <div className="text-xs font-medium mb-0.5" style={{ color: C.brandDark }}>AJ-PROXIS Control Centre replied:</div>
                <div className="text-sm">{r.response}</div>
              </Card>
            )}
          </Card>
        ))}
        {!myReviews.length && <Card className="text-center py-8 text-sm" style={{ color: C.slate }}>No reviews submitted yet.</Card>}
      </div>

      {rateFor && (
        <Modal title={`Rate Order ${rateFor.id}`} onClose={() => setRateFor(null)}>
          <div className="flex items-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => setRating(n)}>
                <Star size={26} fill={n <= rating ? C.amber : "none"} color={C.amber} />
              </button>
            ))}
          </div>
          <Field label="Comment"><TextArea rows={3} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="How was this order?" /></Field>
          <Btn className="mt-3" onClick={submit}>Submit Review</Btn>
        </Modal>
      )}
    </div>
  );
}

