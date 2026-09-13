import { useState } from "react";
import { ClipboardList, CheckCircle2, MessageSquare, Plus, Trash2, Upload, MapPin, Clock, ListChecks, Sparkles, Send, ShieldCheck } from "lucide-react";
import { Btn } from "../../atoms/Btn.jsx";
import { Card } from "../../atoms/Card.jsx";
import { SectionTitle } from "../../atoms/SectionTitle.jsx";
import { Field } from "../../atoms/Field.jsx";
import { TextInput } from "../../atoms/TextInput.jsx";
import { TextArea } from "../../atoms/TextArea.jsx";
import { Select } from "../../atoms/Select.jsx";
import { Table } from "../../molecules/Table.jsx";
import { C } from "../../shared/tokens.js";
import { GHS, estimateDeliveryDays, estimateDeliveryFee } from "../../shared/helpers.js";
import { CATEGORIES } from "../../data/seed.js";
import { useActingUser, useCustomer, useStore } from "../../store/StoreContext.js";
import { Catalogue } from "./Catalogue.jsx";
import { DeliveryLocationPicker } from "./DeliveryLocationPicker.jsx";

export function RequestProcurement() {
  const { state, dispatch } = useStore();
  const customer = useCustomer();
  const actingUser = useActingUser();
  const canRequest = actingUser.isTopApprover || actingUser.isAdmin || actingUser.role === "Procurement Officer";
  const [mode, setMode] = useState("custom");
  const [custom, setCustom] = useState({ item: "", category: CATEGORIES[0].key, description: "", qty: 1, brand: "", spec: "", requiredDate: "", budget: "" });
  const [rows, setRows] = useState([{ name: "", qty: 1, unitPrice: 0, category: "office" }]);
  const [institutional, setInstitutional] = useState(false);
  const [bulkText, setBulkText] = useState("SKU,Item,Quantity\nA4-001,A4 Paper,200\nDESK-002,Student Desk,500\nCHAIR-004,Office Chair,100");
  const [wa, setWa] = useState("");
  const [waLog, setWaLog] = useState([{ from: "ajproxis", text: "Hi! Tell me what you need and we'll create a procurement request. e.g. \"I need 100 cartons of A4 paper.\"" }]);
  const [ai, setAi] = useState("");
  const [aiList, setAiList] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [confirmMsg, setConfirmMsg] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState(customer.deliveryAddress || "");
  const { km: deliveryKm, fee: estimatedDeliveryFee } = estimateDeliveryFee(deliveryAddress);
  const deliveryPeriod = estimateDeliveryDays(deliveryKm).label;

  function submitCustom(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!custom.item.trim()) return;
    dispatch({ type: "CREATE_CUSTOM_REQUEST", payload: { ...custom, deliveryAddress, customerId: customer.id } });
    setConfirmMsg("Procurement request submitted — AJ-PROXIS will source this and send a quotation.");
    setCustom({ item: "", category: CATEGORIES[0].key, description: "", qty: 1, brand: "", spec: "", requiredDate: "", budget: "" });
  }

  function submitRFQ() {
    const items = rows.filter((r) => r.name).map((r) => ({ ...r, unitPrice: Number(r.unitPrice) || 50, qty: Number(r.qty) || 1 }));
    if (!items.length) return;
    dispatch({ type: "CREATE_RFQ", items, institutional, customerId: customer.id, deliveryAddress });
    setConfirmMsg("RFQ submitted for supplier sourcing and price comparison.");
    setRows([{ name: "", qty: 1, unitPrice: 0, category: "office" }]);
  }

  function submitBulk() {
    const lines = bulkText.trim().split("\n").slice(1);
    const items = lines.map((l) => {
      const [sku, item, qty] = l.split(",");
      const match = state.products.find((p) => p.sku === sku?.trim());
      return { name: item?.trim() || sku, qty: Number(qty) || 1, unitPrice: match ? match.price : 60, category: match ? match.category : "office" };
    }).filter((i) => i.name);
    if (!items.length) return;
    dispatch({ type: "CREATE_RFQ", items, institutional: false, customerId: customer.id, deliveryAddress });
    setConfirmMsg(`Bulk upload matched ${items.length} line item(s) against the catalogue and created an RFQ.`);
  }

  function sendWhatsapp() {
    if (!wa.trim()) return;
    const text = wa.trim();
    setWaLog((l) => [...l, { from: "me", text }]);
    dispatch({ type: "CREATE_CUSTOM_REQUEST", payload: { item: text, description: "Submitted via WhatsApp", qty: 1, brand: "", spec: "", requiredDate: "", budget: "", deliveryAddress, customerId: customer.id } });
    setTimeout(() => {
      setWaLog((l) => [...l, { from: "ajproxis", text: `AJ-PROXIS Procurement Request created. We'll confirm pricing shortly.` }]);
    }, 500);
    setWa("");
  }

  async function runAssistant() {
    if (!ai.trim()) return;
    setAiLoading(true);
    setAiList(null);
    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `You are the AJ Procurement Assistant for a Ghanaian B2B procurement platform. A customer wrote: "${ai}". Respond ONLY with a JSON array (no markdown, no preamble) of objects like {"name": "...", "qty": 10, "category": "office|ict|school|furniture|cleaning|construction|hospitality|branding|safety|fleet|medical|events"} representing a sensible procurement list for their situation. Return 6-14 realistic line items.`,
          }],
        }),
      });
      const data = await resp.json();
      const text = (data.content || []).map((b) => b.text || "").join("");
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setAiList(parsed);
    } catch (err) {
      setAiList({ error: true });
    }
    setAiLoading(false);
  }

  function addAiListToRfq() {
    const items = aiList.map((i) => ({ name: i.name, qty: Number(i.qty) || 1, unitPrice: 60, category: i.category || "office" }));
    dispatch({ type: "CREATE_RFQ", items, institutional: false, customerId: customer.id, deliveryAddress });
    setConfirmMsg("AI-generated list added to a new RFQ for sourcing.");
    setAiList(null); setAi("");
  }

  const tabs = [
    ["custom", "Request a Product", ClipboardList],
    ["rfq", "RFQ — Submit a List", ListChecks],
    ["bulk", "Bulk Upload", Upload],
    ["whatsapp", "WhatsApp Procurement", MessageSquare],
    ["ai", "AJ Procurement Assistant", Sparkles],
  ];

  if (!canRequest) {
    return (
      <div>
        <SectionTitle sub="Only the Procurement Officer, an Administrator, or the CEO / Principal can submit procurement requests.">Request Procurement</SectionTitle>
        <Card className="max-w-lg" style={{ backgroundColor: C.amberTint }}>
          <div className="flex items-start gap-3">
            <ShieldCheck size={18} color={C.brandDark} className="mt-0.5 shrink-0" />
            <div>
              <div className="font-medium text-sm mb-1">You don't have permission to submit requests</div>
              <p className="text-sm" style={{ color: C.inkSoft }}>You're signed in as {actingUser.name} ({actingUser.role}). Only the Procurement Officer, an Administrator, or the CEO / Principal can place a procurement request. Ask one of them to sign in, or use "Switch user" from the sidebar.</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <SectionTitle sub="Three ways to procure: buy from catalogue, request a quote, or let AJ-PROXIS source it for you.">Request Procurement</SectionTitle>
      <Card className="mb-4">
        <DeliveryLocationPicker address={deliveryAddress} onAddressChange={setDeliveryAddress} label="Delivery Address for this request" />
        <p className="text-xs mt-2 flex items-center gap-1.5" style={{ color: C.slate }}>
          <MapPin size={13} /> Estimated distance ~{deliveryKm}km from AJ-PROXIS Accra hub — delivery fee auto-calculated at {GHS(estimatedDeliveryFee)}, applied to whichever request method you use below.
        </p>
        <p className="text-xs mt-1 flex items-center gap-1.5" style={{ color: C.slate }}>
          <Clock size={13} /> Estimated delivery period: <b style={{ color: C.ink }}>{deliveryPeriod}</b> once your request is approved and paid for.
        </p>
      </Card>
      <div className="flex gap-1.5 mb-5 flex-wrap">
        {tabs.map(([k, l, I]) => (
          <button key={k} onClick={() => { setMode(k); setConfirmMsg(""); }} className="text-xs px-3 py-1.5 rounded border flex items-center gap-1.5"
            style={{ borderColor: mode === k ? C.brand : C.border, color: mode === k ? C.brand : C.inkSoft, backgroundColor: mode === k ? C.brandTint : "transparent" }}>
            <I size={13} /> {l}
          </button>
        ))}
      </div>
      {confirmMsg && <Card className="mb-4 flex items-center gap-2" ><CheckCircle2 size={16} color={C.green} /><span className="text-sm">{confirmMsg}</span></Card>}

      {mode === "custom" && (
        <Card className="max-w-xl">
          <div className="space-y-3">
            <Field label="Item name"><TextInput required value={custom.item} onChange={(e) => setCustom({ ...custom, item: e.target.value })} /></Field>
            <Field label="Category">
              <Select value={custom.category} onChange={(e) => setCustom({ ...custom, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
              </Select>
            </Field>
            <Field label="Description"><TextArea rows={2} value={custom.description} onChange={(e) => setCustom({ ...custom, description: e.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Quantity"><TextInput type="number" min={1} value={custom.qty} onChange={(e) => setCustom({ ...custom, qty: e.target.value })} /></Field>
              <Field label="Preferred brand"><TextInput value={custom.brand} onChange={(e) => setCustom({ ...custom, brand: e.target.value })} /></Field>
              <Field label="Required date"><TextInput type="date" value={custom.requiredDate} onChange={(e) => setCustom({ ...custom, requiredDate: e.target.value })} /></Field>
              <Field label="Budget (GHS)"><TextInput type="number" value={custom.budget} onChange={(e) => setCustom({ ...custom, budget: e.target.value })} /></Field>
            </div>
            <Field label="Specifications / reference"><TextArea rows={2} value={custom.spec} onChange={(e) => setCustom({ ...custom, spec: e.target.value })} placeholder="Attach details here (file upload simulated)" /></Field>
            <Btn onClick={submitCustom} icon={Send}>Submit Procurement Request</Btn>
          </div>
        </Card>
      )}

      {mode === "rfq" && (
        <Card>
          <div className="flex items-center gap-2 mb-3 text-sm">
            <input type="checkbox" checked={institutional} onChange={(e) => setInstitutional(e.target.checked)} />
            <span>Mark as Government / Institutional procurement (adds tender-style bid comparison)</span>
          </div>
          <div className="space-y-2">
            {rows.map((r, i) => (
              <div key={i} className="grid grid-cols-12 gap-2">
                <TextInput className="col-span-5" placeholder="Item name" value={r.name} onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
                <Select className="col-span-3" value={r.category} onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, category: e.target.value } : x)))}>
                  {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
                </Select>
                <TextInput className="col-span-2" type="number" placeholder="Qty" value={r.qty} onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, qty: e.target.value } : x)))} />
                <TextInput className="col-span-1" type="number" placeholder="Est. price" value={r.unitPrice} onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, unitPrice: e.target.value } : x)))} />
                <button className="col-span-1" onClick={() => setRows(rows.filter((_, j) => j !== i))}><Trash2 size={15} color={C.red} /></button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <Btn variant="ghost" size="sm" icon={Plus} onClick={() => setRows([...rows, { name: "", qty: 1, unitPrice: 0, category: "office" }])}>Add line</Btn>
            <Btn size="sm" icon={Send} onClick={submitRFQ}>Submit RFQ</Btn>
          </div>
        </Card>
      )}

      {mode === "bulk" && (
        <Card className="max-w-xl">
          <p className="text-sm mb-2" style={{ color: C.slate }}>Paste a CSV (SKU, Item, Quantity) — Excel, CSV, PDF or Word uploads are supported in production; this demo accepts pasted CSV text.</p>
          <TextArea rows={6} value={bulkText} onChange={(e) => setBulkText(e.target.value)} />
          <Btn className="mt-3" icon={Upload} onClick={submitBulk}>Match Against Catalogue & Create RFQ</Btn>
        </Card>
      )}

      {mode === "whatsapp" && (
        <Card className="max-w-md">
          <div className="rounded p-3 mb-3 h-64 overflow-y-auto space-y-2" style={{ backgroundColor: "#EAF3EA" }}>
            {waLog.map((m, i) => (
              <div key={i} className={`max-w-[80%] rounded px-3 py-1.5 text-sm ${m.from === "me" ? "ml-auto" : ""}`} style={{ backgroundColor: m.from === "me" ? "#DCF8C6" : "#fff" }}>{m.text}</div>
            ))}
          </div>
          <div className="flex gap-2">
            <TextInput placeholder="I need 100 cartons of A4 paper" value={wa} onChange={(e) => setWa(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendWhatsapp()} />
            <Btn icon={Send} onClick={sendWhatsapp}>Send</Btn>
          </div>
        </Card>
      )}

      {mode === "ai" && (
        <Card className="max-w-xl">
          <p className="text-sm mb-2" style={{ color: C.slate }}>Describe your situation in plain language — the assistant drafts a procurement list you can send straight to sourcing.</p>
          <TextArea rows={3} value={ai} onChange={(e) => setAi(e.target.value)} placeholder="I am opening a new school for 500 students. I need everything for classrooms, offices and sanitation." />
          <Btn className="mt-2" icon={Sparkles} onClick={runAssistant} disabled={aiLoading}>{aiLoading ? "Thinking…" : "Generate Procurement List"}</Btn>
          {aiList && !aiList.error && (
            <div className="mt-4">
              <Table columns={[{ key: "name", label: "Item" }, { key: "qty", label: "Qty" }, { key: "category", label: "Category" }]} rows={aiList} />
              <Btn className="mt-2" variant="amber" onClick={addAiListToRfq}>Add All to Procurement Request</Btn>
            </div>
          )}
          {aiList?.error && <p className="text-sm mt-2" style={{ color: C.red }}>Couldn't reach the assistant right now — try again in a moment.</p>}
        </Card>
      )}
    </div>
  );
}

