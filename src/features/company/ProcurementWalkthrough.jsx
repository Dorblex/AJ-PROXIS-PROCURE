import { useState, useEffect } from "react";
import { Search, Truck, FileText, ClipboardList, Receipt, CreditCard, Factory, PackageCheck, ShieldCheck, Play, Pause } from "lucide-react";
import { Card } from "../../atoms/Card.jsx";
import { C } from "../../shared/tokens.js";
import { pad } from "../../shared/helpers.js";

export const WALKTHROUGH_STEPS = [
  { title: "1. Discover", desc: "Browse thousands of items in the AJ-PROXIS catalogue — office supplies, ICT, construction, uniforms and more — or describe what you need in plain language.", icon: Search },
  { title: "2. Request", desc: "Submit a custom request, a multi-item RFQ, a bulk CSV upload, or just chat with the AJ Procurement Assistant.", icon: ClipboardList },
  { title: "3. Source", desc: "AJ-PROXIS Control Centre allocates a supplier and gathers competitive, exact pricing on your behalf.", icon: Factory },
  { title: "4. Quotation", desc: "You receive a fully itemized quotation — negotiate the price if you need to; Control Centre decides.", icon: FileText },
  { title: "5. Approve", desc: "Only your CEO or Principal can approve a quotation for payment — keeping spending under control.", icon: ShieldCheck },
  { title: "6. Pay", desc: "Pay instantly by Mobile Money, Visa card, bank transfer, wallet, or approved corporate credit.", icon: CreditCard },
  { title: "7. Track", desc: "Watch your order move from sourcing to dispatch to your doorstep, live.", icon: Truck },
  { title: "8. Receive & Reconcile", desc: "Confirm delivery, then download, print, or email your Purchase Order, Invoice, Receipt and Delivery Note.", icon: PackageCheck },
];

export function ProcurementWalkthrough() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const DURATION = 3400;
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!playing) return;
    const tick = 50;
    const interval = setInterval(() => {
      setElapsed((e) => {
        if (e + tick >= DURATION) {
          setStep((s) => (s + 1) % WALKTHROUGH_STEPS.length);
          return 0;
        }
        return e + tick;
      });
    }, tick);
    return () => clearInterval(interval);
  }, [playing, step]);

  function goTo(i) {
    setStep(i);
    setElapsed(0);
  }

  const current = WALKTHROUGH_STEPS[step];
  const Icon = current.icon;

  return (
    <Card className="overflow-hidden" pad={false}>
      <div className="relative flex flex-col items-center justify-center text-center px-8" style={{ backgroundColor: C.brandDark, minHeight: 260 }}>
        <div className="absolute top-3 left-4 flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "#fff" }}>
          <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: "#E31C34" }} /> HOW IT WORKS
        </div>
        <div key={step} className="animate-fadein py-12">
          <div className="h-14 w-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "rgba(255,255,255,0.12)" }}>
            <Icon size={26} color="#fff" />
          </div>
          <div className="text-white font-semibold text-lg mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{current.title}</div>
          <p className="text-sm max-w-md mx-auto" style={{ color: "#D6E4EE" }}>{current.desc}</p>
        </div>
      </div>
      <div className="px-4 py-3" style={{ backgroundColor: C.panel }}>
        <div className="flex items-center gap-2">
          <button onClick={() => setPlaying((p) => !p)} className="h-7 w-7 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: C.brandTint, color: C.brand }}>
            {playing ? <Pause size={13} /> : <Play size={13} />}
          </button>
          <div className="flex-1 flex gap-1">
            {WALKTHROUGH_STEPS.map((s, i) => (
              <button key={i} onClick={() => goTo(i)} className="h-1.5 flex-1 rounded-full overflow-hidden" style={{ backgroundColor: C.border }}>
                <div style={{
                  height: "100%",
                  width: i < step ? "100%" : i === step ? `${(elapsed / DURATION) * 100}%` : "0%",
                  backgroundColor: C.brand, transition: i === step ? "none" : "width 0.2s",
                }} />
              </button>
            ))}
          </div>
          <span className="text-[11px] shrink-0" style={{ color: C.slate }}>{step + 1} / {WALKTHROUGH_STEPS.length}</span>
        </div>
      </div>
    </Card>
  );
}

