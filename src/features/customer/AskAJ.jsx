import { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import { Btn } from "../../atoms/Btn.jsx";
import { Card } from "../../atoms/Card.jsx";
import { SectionTitle } from "../../atoms/SectionTitle.jsx";
import { TextInput } from "../../atoms/TextInput.jsx";
import { C } from "../../shared/tokens.js";
import { GHS } from "../../shared/helpers.js";
import { useCustomer, useStore } from "../../store/StoreContext.js";
import { Quotations } from "./Quotations.jsx";

export function AskAJ() {
  const { state } = useStore();
  const customer = useCustomer();
  const [messages, setMessages] = useState([
    { role: "assistant", text: `Hi! I'm the AJ-PROXIS Assistant. Ask me anything — your orders, wallet, quotations, how the platform works, or general procurement questions. Answers are generated instantly.` },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const suggestions = [
    "What's my wallet balance?",
    "Track my most recent order",
    "How do I request a quote?",
    "What payment methods do you accept?",
  ];

  function contextSnapshot() {
    const myOrders = state.orders.filter((o) => o.customerId === customer.id);
    const myQuotations = state.quotations.filter((q) => q.customerId === customer.id);
    const latestOrder = myOrders[0];
    return `Customer account data (only reference this if relevant to the question):
- Organization: ${customer.name} (${customer.type})
- Wallet balance: ${GHS(state.wallet.balance)}
- Credit limit: ${GHS(customer.creditLimit)}
- Total orders placed: ${myOrders.length}
- Most recent order: ${latestOrder ? `${latestOrder.id}, status "${latestOrder.deliveryStatus}", total ${GHS(latestOrder.total)}` : "none yet"}
- Quotations awaiting a decision: ${myQuotations.filter((q) => q.status.includes("Awaiting")).length}
- Open support tickets: ${state.supportTickets.filter((t) => t.customerId === customer.id && t.status !== "Resolved" && t.status !== "Closed").length}`;
  }

  async function send(text) {
    const q = (text ?? input).trim();
    if (!q || loading) return;
    const next = [...messages, { role: "user", text: q }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 500,
          messages: [{
            role: "user",
            content: `You are the AJ-PROXIS Assistant, a helpful support chatbot embedded in AJ-PROXIS Procure, a Ghanaian B2B procurement platform. Answer the customer's question clearly and concisely (2-5 sentences, or a short list if that's clearer). You can explain how the platform works (catalogue, RFQs, quotations, negotiation, approvals, wallet, contracts, delivery tracking, support tickets, compliance documents), give general procurement guidance, or reference the account data below when relevant. If asked something needing human judgement or authority (legal advice, special pricing approval, account disputes), tell them to raise a Support Ticket or contact AJ-PROXIS Control Centre.

${contextSnapshot()}

Conversation so far:
${next.map((m) => `${m.role === "user" ? "Customer" : "Assistant"}: ${m.text}`).join("\n")}

Respond only with your next reply as the Assistant — no preamble, no labels, no markdown headers.`,
          }],
        }),
      });
      const data = await resp.json();
      const replyText = (data.content || []).map((b) => b.text || "").join("").trim();
      setMessages((m) => [...m, { role: "assistant", text: replyText || "Sorry, I couldn't generate a response just now — please try again." }]);
    } catch (err) {
      setMessages((m) => [...m, { role: "assistant", text: "I'm having trouble responding right now. Please try again in a moment, or raise a Support Ticket if it's urgent." }]);
    }
    setLoading(false);
  }

  return (
    <div>
      <SectionTitle sub="Ask anything about your account, orders, or how AJ-PROXIS Procure works — replies are auto-generated instantly.">Ask AJ — Assistant Chat</SectionTitle>
      <Card className="max-w-2xl">
        <div ref={scrollRef} className="h-96 overflow-y-auto space-y-2 mb-3 pr-1">
          {messages.map((m, i) => (
            <div key={i} className={`max-w-[80%] rounded px-3 py-2 text-sm ${m.role === "user" ? "ml-auto" : ""}`} style={{ backgroundColor: m.role === "user" ? C.brandTint : "#EEF0EC" }}>
              <div className="text-[10px] mb-0.5" style={{ color: C.slate }}>{m.role === "user" ? "You" : "AJ-PROXIS Assistant"}</div>
              {m.text}
            </div>
          ))}
          {loading && (
            <div className="max-w-[60%] rounded px-3 py-2 text-sm" style={{ backgroundColor: "#EEF0EC", color: C.slate }}>
              AJ-PROXIS Assistant is typing…
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {suggestions.map((s) => (
            <button key={s} disabled={loading} onClick={() => send(s)} className="text-xs px-2.5 py-1 rounded border disabled:opacity-40" style={{ borderColor: C.border, color: C.inkSoft }}>{s}</button>
          ))}
        </div>
        <div className="flex gap-2">
          <TextInput placeholder="Type your question..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} disabled={loading} />
          <Btn icon={Send} onClick={() => send()} disabled={loading}>Send</Btn>
        </div>
      </Card>
    </div>
  );
}
