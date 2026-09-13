import React from "react";
import { ShoppingCart, FileText, Building2, Settings, ArrowRight, Globe, Factory } from "lucide-react";
import { Btn } from "../../atoms/Btn.jsx";
import { Card } from "../../atoms/Card.jsx";
import { C } from "../../shared/tokens.js";
import { HERO_MAIN, LOGO_FULL, LOGO_ICON } from "../../shared/brandAssets.js";
import { getGreeting } from "../../shared/helpers.js";
import { Catalogue } from "../customer/Catalogue.jsx";
import { ProcurementWalkthrough } from "./ProcurementWalkthrough.jsx";
import { CompanyMenu } from "./CompanyMenu.jsx";

export function Landing({ setRole }) {
  const modes = [
    ["Buy from Catalogue", "Browse → Cart → Checkout → Pay", ShoppingCart],
    ["Request a Quote", "Submit a list → Quotation → Approve → Pay", FileText],
    ["Source For Me", "Describe it → We source → Quote → Approve → Pay → Deliver", Globe],
  ];
  const flow = ["Discover", "Request", "Compare", "Quote", "Approve", "Pay", "Procure", "Track", "Receive", "Reconcile", "Report"];
  return (
    <div style={{ backgroundColor: C.paper, minHeight: "100vh", fontFamily: "'Inter', sans-serif", color: C.ink }}>
      <div className="flex items-center justify-between px-4 py-2" style={{ backgroundColor: C.brandDark }}>
        <div className="flex items-center gap-2">
          <img src={LOGO_ICON} alt="AJ-PROXIS" className="h-6 w-6" />
          <span className="text-xs tracking-wide" style={{ color: "#9FC7E0" }}>AJ-PROXIS SOLUTIONS</span>
        </div>
        <CompanyMenu setRole={setRole} />
      </div>
      <div className="text-center py-4 px-4" style={{ backgroundColor: C.red, color: "#fff", borderBottom: "3px solid #0B79B7" }}>
        <span className="text-base md:text-xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          👋 {getGreeting()}! Welcome to AJ-PROXIS Procure
        </span>
        <div className="text-xs md:text-sm font-semibold mt-1" style={{ color: "#FCE4E7" }}>
          Request, approve, pay and track your procurement — all in one place.
        </div>
      </div>
      <div style={{ backgroundColor: C.brandDark }} className="text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_MAIN} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-contain object-right" />
          <div className="absolute inset-0" style={{ background: `linear-gradient(90deg, ${C.brandDark} 0%, ${C.brandDark} 32%, rgba(8,58,87,0.55) 46%, rgba(8,58,87,0.15) 65%, rgba(8,58,87,0) 100%)` }} />
        </div>
        <div className="max-w-6xl mx-auto px-6 py-16 relative" style={{ zIndex: 1 }}>
          <div className="inline-block bg-white rounded-lg px-4 py-3 mb-6">
            <img src={LOGO_FULL} alt="AJ-PROXIS Solutions — Office Essentials, Simplified" className="h-14 w-auto" />
          </div>
          <h1 className="mt-2 text-4xl md:text-5xl font-semibold leading-tight max-w-2xl" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Request. Procure. Deliver.
          </h1>
          <p className="mt-4 max-w-xl text-sm md:text-base" style={{ color: "#D6E4EE" }}>
            AJ-PROXIS Procure is a centralized B2B procurement and business-supply platform. Any organization can request virtually any approved item, get a quotation, approve, pay, and track it to their door — one account, everything they need.
          </p>
          <div className="flex flex-wrap gap-3 mt-7">
            <Btn variant="amber" size="lg" onClick={() => setRole("customer")}>Customer Log In / Sign Up</Btn>
            <button onClick={() => setRole("admin")} className="text-sm underline underline-offset-4" style={{ color: "#D6E4EE" }}>AJ-PROXIS Control Centre →</button>
            <button onClick={() => setRole("supplier")} className="text-sm underline underline-offset-4" style={{ color: "#D6E4EE" }}>Supplier Portal →</button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-xs uppercase tracking-wide mb-3" style={{ color: C.slate }}>The full loop, one dashboard</div>
        <div className="flex flex-wrap gap-1.5 mb-8">
          {flow.map((f, i) => (
            <React.Fragment key={f}>
              <span className="text-xs px-2.5 py-1 rounded border" style={{ borderColor: C.border, backgroundColor: C.panel }}>{f}</span>
              {i < flow.length - 1 && <ArrowRight size={13} color={C.slate} className="self-center" />}
            </React.Fragment>
          ))}
        </div>

        <div className="mb-14">
          <div className="text-xs uppercase tracking-wide mb-3" style={{ color: C.slate }}>Watch how it works</div>
          <ProcurementWalkthrough />
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-14">
          {modes.map(([t, d, Icon]) => (
            <Card key={t}>
              <Icon size={20} color={C.brand} />
              <div className="font-medium mt-3">{t}</div>
              <div className="text-sm mt-1" style={{ color: C.slate }}>{d}</div>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-14">
          <div>
            <h3 className="font-semibold mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Not just an online store</h3>
            <p className="text-sm" style={{ color: C.slate }}>A company should be able to procure one pen or ten thousand school desks — office furniture, ICT equipment, construction materials, branded uniforms, cleaning supplies, imported machinery — through a single AJ-PROXIS account.</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Built for every kind of organization</h3>
            <div className="flex flex-wrap gap-1.5">
              {["Private schools", "Public institutions", "Companies", "NGOs", "Churches", "Hotels", "Restaurants", "Hospitals", "Government", "Construction", "Retail", "Event organizers"].map((s) => (
                <span key={s} className="text-xs px-2 py-1 rounded" style={{ backgroundColor: C.brandTint, color: C.brandDark }}>{s}</span>
              ))}
            </div>
          </div>
        </div>

        <Card className="text-center py-8">
          <div className="text-sm mb-3" style={{ color: C.slate }}>Choose how you'd like to explore the platform</div>
          <div className="flex flex-wrap justify-center gap-3">
            <Btn onClick={() => setRole("customer")} icon={Building2}>Customer Portal</Btn>
            <Btn variant="ghost" onClick={() => setRole("admin")} icon={Settings}>AJ-PROXIS Control Centre</Btn>
            <Btn variant="ghost" onClick={() => setRole("supplier")} icon={Factory}>Supplier Portal</Btn>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* =================================== ROOT ==================================== */

export const STORAGE_KEY = "ajproxis-procure-state-v1";

