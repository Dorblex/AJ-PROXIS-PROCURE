import { useState } from "react";
import { Truck, FileText, Users, Download, MapPin, Clock, CreditCard, Globe, ChevronLeft, RefreshCcw, ScrollText, PhoneCall, Printer, Mail, Target, Compass, History, Eye } from "lucide-react";
import { Btn } from "../../atoms/Btn.jsx";
import { Card } from "../../atoms/Card.jsx";
import { Badge } from "../../atoms/Badge.jsx";
import { Field } from "../../atoms/Field.jsx";
import { TextInput } from "../../atoms/TextInput.jsx";
import { Select } from "../../atoms/Select.jsx";
import { Modal } from "../../molecules/Modal.jsx";
import { Row } from "../../molecules/Row.jsx";
import { PaymentMethodFields } from "../../molecules/PaymentMethodFields.jsx";
import { C } from "../../shared/tokens.js";
import { LOGO_FULL, LOGO_ICON } from "../../shared/brandAssets.js";
import { GHS, buildTicketQrPayload, canSubmitPayment } from "../../shared/helpers.js";
import { buildCompanyDocumentHtml } from "../../shared/documents.js";
import { PAYMENT_METHODS } from "../../data/seed.js";
import { useStore } from "../../store/StoreContext.js";
import { TicketCode } from "./TicketCode.jsx";

export function CompanyPage({ page, setRole }) {
  const { state, dispatch } = useStore();
  const titles = { about: "About AJ-PROXIS", team: "AJ-PROXIS Management Team", contact: "Contact Us", careers: "Careers at AJ-PROXIS", events: "Up-coming Events", tickets: "Event Ticket", documents: "Documents" };
  const [ticketEventId, setTicketEventId] = useState(state.events[0].id);
  const [priceCategoryKey, setPriceCategoryKey] = useState(state.events[0].priceCategories[0].key);
  const [ticketName, setTicketName] = useState("");
  const [ticketEmail, setTicketEmail] = useState("");
  const [payMethod, setPayMethod] = useState("mobile");
  const [payValues, setPayValues] = useState({});
  const [ticket, setTicket] = useState(null);
  const [emailedCopy, setEmailedCopy] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [soldOutMsg, setSoldOutMsg] = useState(false);
  const [viewDocKey, setViewDocKey] = useState(null);

  const selectedEvent = state.events.find((e) => e.id === ticketEventId);
  const selectedCategory = selectedEvent.priceCategories.find((c) => c.key === priceCategoryKey) || selectedEvent.priceCategories[0];
  const isPaid = selectedCategory.price > 0;
  const paymentReady = !isPaid || canSubmitPayment(payMethod, payValues, Infinity, selectedCategory.price);
  const issuedCount = state.eventTickets.filter((t) => t.eventId === selectedEvent.id).length;
  const remaining = selectedEvent.cap - issuedCount;
  const isSoldOut = remaining <= 0;

  function selectEvent(id) {
    setTicketEventId(id);
    const ev = state.events.find((e) => e.id === id);
    setPriceCategoryKey(ev.priceCategories[0].key);
    setPayValues({});
    setSoldOutMsg(false);
  }

  function getTicket() {
    if (!ticketName.trim() || !ticketEmail.trim() || !paymentReady) return;
    if (isSoldOut) { setSoldOutMsg(true); return; }
    const code = "TCK-" + Math.floor(100000 + Math.random() * 900000);
    const newTicket = {
      id: code, event: selectedEvent,
      name: ticketName.trim(), email: ticketEmail.trim(),
      priceCategory: selectedCategory.label,
      paymentMethod: isPaid ? PAYMENT_METHODS.find((m) => m.key === payMethod)?.label : "Free Entry",
      amountPaid: selectedCategory.price,
    };
    dispatch({
      type: "ISSUE_EVENT_TICKET", id: code, eventId: selectedEvent.id, eventTitle: selectedEvent.title, cap: selectedEvent.cap,
      name: newTicket.name, email: newTicket.email, priceCategory: newTicket.priceCategory,
      amountPaid: newTicket.amountPaid, paymentMethod: newTicket.paymentMethod,
    });
    setTicket(newTicket);
    setScanned(false);
    if (isPaid) {
      dispatch({ type: "EMAIL_DOCUMENT", docId: code, kind: "Event Ticket", to: newTicket.email });
      setEmailedCopy(true);
    } else {
      setEmailedCopy(false);
    }
  }
  function downloadTicket() {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8" /><title>${ticket.id}</title></head>
<body style="font-family:Arial,sans-serif;padding:30px;">
<h2>AJ-PROXIS Event Ticket</h2>
<p><b>Ticket No.</b> ${ticket.id}</p>
<p><b>Event:</b> ${ticket.event.title}</p>
<p><b>Date:</b> ${ticket.event.date} · ${ticket.event.time}</p>
<p><b>Venue:</b> ${ticket.event.venue}</p>
<p><b>Attendee:</b> ${ticket.name} (${ticket.email})</p>
<p><b>Price Category:</b> ${ticket.priceCategory}</p>
<p><b>Amount Paid:</b> ${GHS(ticket.amountPaid)}</p>
<p><b>Payment Method:</b> ${ticket.paymentMethod}</p>
</body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `AJ-PROXIS-Ticket-${ticket.id}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{ backgroundColor: C.paper, minHeight: "100vh", fontFamily: "'Inter', sans-serif", color: C.ink }}>
      <div className="flex items-center justify-between px-4 py-2" style={{ backgroundColor: C.brandDark }}>
        <button onClick={() => setRole("landing")} className="flex items-center gap-2 text-xs" style={{ color: "#D6E4EE" }}>
          <ChevronLeft size={15} /> Back to Home
        </button>
        <div className="flex items-center gap-2">
          <img src={LOGO_ICON} alt="AJ-PROXIS" className="h-6 w-6" />
          <span className="text-xs tracking-wide" style={{ color: "#9FC7E0" }}>AJ-PROXIS SOLUTIONS</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-14">
        <h1 className="text-2xl md:text-3xl font-semibold mb-8" style={{ fontFamily: "'Space Grotesk', sans-serif", color: C.brandDark }}>{titles[page]}</h1>

        {page === "about" && (
          <div>
            {state.companyContent.aboutIntro.split("\n\n").map((para, i) => (
              <p key={i} className={`text-sm leading-relaxed ${i === 0 ? "" : "mt-4"}`} style={{ color: C.inkSoft }}>{para}</p>
            ))}

            <div className="space-y-4 mt-8">
              <Card style={{ backgroundColor: C.brand }}>
                <History size={20} color="#fff" />
                <div className="font-semibold mt-3 mb-1.5" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#fff" }}>Our History</div>
                <p className="text-sm" style={{ color: "#E4F1F9" }}>{state.companyContent.historyText}</p>
              </Card>
              <Card style={{ backgroundColor: C.amber }}>
                <Target size={20} color="#fff" />
                <div className="font-semibold mt-3 mb-1.5" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#fff" }}>Our Mission</div>
                <p className="text-sm" style={{ color: "#FDEED2" }}>{state.companyContent.missionText}</p>
              </Card>
              <Card style={{ backgroundColor: C.red }}>
                <Compass size={20} color="#fff" />
                <div className="font-semibold mt-3 mb-1.5" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#fff" }}>Our Vision</div>
                <p className="text-sm" style={{ color: "#FBE2E5" }}>{state.companyContent.visionText}</p>
              </Card>
            </div>
          </div>
        )}

        {page === "team" && (
          <div className="space-y-4">
            {state.companyContent.team.map((m) => (
              <Card key={m.id} className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full flex items-center justify-center text-base font-semibold shrink-0" style={{ backgroundColor: C.brandTint, color: C.brand }}>{m.initials}</div>
                <div>
                  <div className="text-sm font-medium">{m.name}</div>
                  <div className="text-xs" style={{ color: C.slate }}>{m.title}</div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {page === "contact" && (
          <div className="space-y-4">
            <Card className="flex items-center gap-3"><Globe size={18} color={C.brand} /> <span className="text-sm">{state.companyContent.contact.web}</span></Card>
            <Card className="flex items-center gap-3"><Mail size={18} color={C.brand} /> <span className="text-sm">{state.companyContent.contact.email}</span></Card>
            <Card className="flex items-center gap-3"><PhoneCall size={18} color={C.brand} /> <span className="text-sm">{state.companyContent.contact.phone}</span></Card>
            <Card className="flex items-center gap-3"><MapPin size={18} color={C.brand} /> <span className="text-sm">{state.companyContent.contact.address}</span></Card>
          </div>
        )}

        {page === "careers" && (
          <div>
            {state.companyContent.careersText.split("\n\n").map((para, i) => (
              <p key={i} className={`text-sm leading-relaxed ${i === 0 ? "" : "mt-4"}`} style={{ color: C.inkSoft }}>{para}</p>
            ))}
          </div>
        )}

        {page === "documents" && (
          <div className="space-y-3">
            <p className="text-sm mb-2" style={{ color: C.inkSoft }}>Download official AJ-PROXIS documents and policies.</p>
            {[
              ["brochure", FileText],
              ["procurement-policy", ScrollText],
              ["return-policy", RefreshCcw],
              ["delivery-policy", Truck],
            ].map(([key, Icon]) => {
              const doc = state.companyContent.documents[key];
              return (
                <Card key={key} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Icon size={18} color={C.brand} />
                    <span className="text-sm font-medium">{doc.title}</span>
                  </div>
                  <div className="flex gap-1.5">
                    <Btn size="sm" variant="subtle" icon={Eye} onClick={() => setViewDocKey(key)}>View</Btn>
                    <Btn size="sm" variant="ghost" icon={Printer} onClick={() => {
                      const w = window.open("", "_blank");
                      w.document.write(buildCompanyDocumentHtml(doc));
                      w.document.close();
                      w.print();
                    }}>Print</Btn>
                    <Btn size="sm" icon={Download} onClick={() => {
                      const html = buildCompanyDocumentHtml(doc);
                      const blob = new Blob([html], { type: "text/html" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `AJ-PROXIS-${doc.title.replace(/\s+/g, "-")}.html`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}>Download</Btn>
                  </div>
                </Card>
              );
            })}

            {viewDocKey && (
              <Modal title={state.companyContent.documents[viewDocKey].title} onClose={() => setViewDocKey(null)} wide>
                <div className="printable-doc rounded border p-6" style={{ borderColor: C.border, backgroundColor: "#fff", fontFamily: "Georgia, serif" }}>
                  <style>{`.doc-preview-body h2{font-size:18px;margin:0 0 12px;color:${C.brandDark};} .doc-preview-body h3{font-size:14px;margin:16px 0 6px;color:${C.brandDark};} .doc-preview-body p{margin:0 0 10px;} .doc-preview-body ul{margin:0 0 10px;padding-left:20px;} .doc-preview-body li{margin-bottom:4px;}`}</style>
                  <img src={LOGO_FULL} alt="AJ-PROXIS Solutions" className="h-9 mb-5" />
                  <div className="text-sm leading-relaxed doc-preview-body" dangerouslySetInnerHTML={{ __html: state.companyContent.documents[viewDocKey].body }} />
                  <p className="text-[10px] mt-6 pt-3 border-t" style={{ borderColor: C.border, color: C.slate }}>AJ-PROXIS SOLUTIONS · procure.ajproxis.com · hello@ajproxis.com · +233 24 000 0192 · Spintex Road, Accra, Ghana</p>
                </div>
                <div className="flex gap-2 mt-4">
                  <Btn size="sm" icon={Printer} onClick={() => {
                    const w = window.open("", "_blank");
                    w.document.write(buildCompanyDocumentHtml(state.companyContent.documents[viewDocKey]));
                    w.document.close();
                    w.print();
                  }}>Print</Btn>
                  <Btn size="sm" variant="subtle" icon={Download} onClick={() => {
                    const doc = state.companyContent.documents[viewDocKey];
                    const html = buildCompanyDocumentHtml(doc);
                    const blob = new Blob([html], { type: "text/html" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `AJ-PROXIS-${doc.title.replace(/\s+/g, "-")}.html`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}>Download</Btn>
                  <Btn size="sm" variant="ghost" onClick={() => setViewDocKey(null)}>Close</Btn>
                </div>
              </Modal>
            )}
          </div>
        )}

        {page === "events" && (
          <div className="space-y-4">
            <p className="text-sm mb-2" style={{ color: C.inkSoft }}>Join us at these upcoming AJ-PROXIS events — from supplier fairs to procurement webinars and community days.</p>
            {state.events.map((e) => {
              const issued = state.eventTickets.filter((t) => t.eventId === e.id).length;
              const left = e.cap - issued;
              const fromPrice = Math.min(...e.priceCategories.map((c) => c.price));
              return (
                <Card key={e.id}>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="font-medium">{e.title}</div>
                    <Badge tone={fromPrice > 0 ? "amber" : "green"}>{fromPrice > 0 ? `From ${GHS(fromPrice)}` : "Free"}</Badge>
                  </div>
                  <div className="text-xs flex flex-wrap gap-x-4 gap-y-1 mb-2" style={{ color: C.slate }}>
                    <span className="flex items-center gap-1"><Clock size={12} /> {e.date} · {e.time}</span>
                    <span className="flex items-center gap-1"><MapPin size={12} /> {e.venue}</span>
                    <span className="flex items-center gap-1"><Users size={12} /> {left > 0 ? `${left} of ${e.cap} tickets left` : "Sold out"}</span>
                  </div>
                  <p className="text-sm" style={{ color: C.inkSoft }}>{e.description}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {e.priceCategories.map((c) => <Badge key={c.key} tone="slate">{c.label} — {c.price > 0 ? GHS(c.price) : "Free"}</Badge>)}
                  </div>
                  <Btn size="sm" className="mt-3" icon={ScrollText} disabled={left <= 0} onClick={() => { selectEvent(e.id); setRole("tickets"); }}>{left > 0 ? "Get a Ticket" : "Sold Out"}</Btn>
                </Card>
              );
            })}
          </div>
        )}

        {page === "tickets" && (
          <div>
            {!ticket ? (
              <Card className="max-w-md">
                <div className="text-sm font-medium mb-3">Reserve Your Ticket</div>
                <Field label="Event">
                  <Select value={ticketEventId} onChange={(e) => selectEvent(e.target.value)}>
                    {state.events.map((e) => <option key={e.id} value={e.id}>{e.title} — {e.date}</option>)}
                  </Select>
                </Field>
                <div className="text-xs mb-3 flex items-center gap-1.5" style={{ color: isSoldOut ? C.red : C.slate }}>
                  <Users size={12} /> {isSoldOut ? "This event is sold out." : `${remaining} of ${selectedEvent.cap} tickets remaining`}
                </div>

                <Field label="Price Category">
                  <div className="space-y-2">
                    {selectedEvent.priceCategories.map((c) => (
                      <label key={c.key} className="flex items-start gap-2 p-2 rounded border text-sm cursor-pointer" style={{ borderColor: priceCategoryKey === c.key ? C.brand : C.border, backgroundColor: priceCategoryKey === c.key ? C.brandTint : "transparent" }}>
                        <input type="radio" className="mt-1" name="pricecat" checked={priceCategoryKey === c.key} onChange={() => { setPriceCategoryKey(c.key); setPayValues({}); }} />
                        <div>
                          <div className="font-medium flex items-center gap-2">{c.label} <span style={{ color: C.brand }}>{c.price > 0 ? GHS(c.price) : "Free"}</span></div>
                          <div className="text-xs" style={{ color: C.slate }}>{c.perks}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </Field>

                <Field label="Full Name"><TextInput value={ticketName} onChange={(e) => setTicketName(e.target.value)} /></Field>
                <Field label="Email"><TextInput type="email" value={ticketEmail} onChange={(e) => setTicketEmail(e.target.value)} /></Field>

                {soldOutMsg && <p className="text-xs mb-2" style={{ color: C.red }}>This event sold out while you were filling in the form — please choose another event.</p>}

                {isPaid ? (
                  <>
                    <div className="mt-3 pt-3 border-t" style={{ borderColor: C.border }}>
                      <div className="text-sm font-medium mb-2">Payment — {GHS(selectedCategory.price)}</div>
                      <div className="space-y-1 mb-2">
                        {PAYMENT_METHODS.map((m) => (
                          <label key={m.key} className="flex items-center gap-2 text-sm">
                            <input type="radio" name="ticketpm" checked={payMethod === m.key} onChange={() => { setPayMethod(m.key); setPayValues({}); }} /> {m.label}
                          </label>
                        ))}
                      </div>
                      <PaymentMethodFields method={payMethod} values={payValues} setValues={setPayValues} walletBalance={Infinity} />
                    </div>
                    <Btn className="mt-3" icon={CreditCard} disabled={isSoldOut || !ticketName.trim() || !ticketEmail.trim() || !paymentReady} onClick={getTicket}>Pay {GHS(selectedCategory.price)} & Get My Ticket</Btn>
                  </>
                ) : (
                  <Btn className="mt-3" icon={ScrollText} disabled={isSoldOut || !ticketName.trim() || !ticketEmail.trim()} onClick={getTicket}>Get My Free Ticket</Btn>
                )}
              </Card>
            ) : (
              <div>
                {emailedCopy && (
                  <Card className="max-w-md mb-3 flex items-center gap-2" style={{ backgroundColor: C.greenTint }}>
                    <Mail size={15} color={C.green} /> <span className="text-sm">A copy of this ticket has been emailed to <b>{ticket.email}</b>.</span>
                  </Card>
                )}
                <Card className="max-w-md printable-doc" style={{ border: `2px dashed ${C.brand}` }}>
                  <div className="flex items-center justify-between mb-3">
                    <img src={LOGO_ICON} alt="AJ-PROXIS" className="h-8 w-8" />
                    <Badge tone="brand">{ticket.id}</Badge>
                  </div>
                  <div className="font-semibold mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{ticket.event.title}</div>
                  <div className="text-xs mb-3" style={{ color: C.slate }}>{ticket.event.date} · {ticket.event.time} · {ticket.event.venue}</div>
                  <div className="border-t pt-3" style={{ borderColor: C.border }}>
                    <div className="text-sm">Attendee: <b>{ticket.name}</b></div>
                    <div className="text-xs" style={{ color: C.slate }}>{ticket.email}</div>
                  </div>
                  <div className="border-t pt-3 mt-3" style={{ borderColor: C.border }}>
                    <Row l="Price Category" v={ticket.priceCategory} />
                    <Row l="Amount Paid" v={GHS(ticket.amountPaid)} />
                    <Row l="Payment Method" v={ticket.paymentMethod} />
                  </div>
                  <div className="border-t pt-4 mt-3 flex justify-center" style={{ borderColor: C.border }}>
                    <TicketCode code={ticket.id} payload={buildTicketQrPayload(ticket)} scanned={scanned} onScan={() => setScanned(true)} />
                  </div>
                </Card>

                {scanned && (
                  <Card className="max-w-md mt-3" style={{ backgroundColor: C.brandTint }}>
                    <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: C.brand }}>Scan Result</div>
                    <Row l="Ticket No." v={ticket.id} bold />
                    <Row l="Attendee" v={ticket.name} />
                    <Row l="Email" v={ticket.email} />
                    <Row l="Event" v={ticket.event.title} />
                    <Row l="Date & Venue" v={`${ticket.event.date} · ${ticket.event.venue}`} />
                    <Row l="Price Category" v={ticket.priceCategory} />
                    <Row l="Payment" v={`${ticket.paymentMethod} — ${GHS(ticket.amountPaid)}`} />
                  </Card>
                )}

                <div className="flex gap-2 mt-4">
                  <Btn size="sm" icon={Printer} onClick={() => window.print()}>Print</Btn>
                  <Btn size="sm" variant="subtle" icon={Download} onClick={downloadTicket}>Download</Btn>
                  <Btn size="sm" variant="ghost" onClick={() => { setTicket(null); setPayValues({}); setScanned(false); setEmailedCopy(false); setSoldOutMsg(false); }}>Get Another Ticket</Btn>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

