/* The single source of truth for all application state: the reducer, its initial seed
   state, and the mutable ID counters/context/hooks components use to read from and
   dispatch into it. Everything here is portal-agnostic — every portal's components
   read this same state via useStore()/useCustomer()/useStaff()/useSupplierAccount(). */

import { GHS, pad, taxBreakdown, estimateDeliveryFee, estimateDeliveryDays, addOneYear, nowStamp } from "../shared/helpers.js";
import {
  seedProducts, SUPPLIER_SEED, BULK_SUPPLIERS, generateBulkSuppliers, generateBulkSubmissions,
  ORG_USERS_SEED, CUSTOMER_ORG, WAREHOUSES, INTERNAL_ROLES, BULK_CITIES, BULK_BIZ_WORDS,
} from "../data/seed.js";
import { uid } from "./ids.js";

export const seq = { pr: 0, rfq: 0, qtn: 0, po: 0, inv: 0, rct: 0, dn: 0, ord: 0, ret: 0, tkt: 0, rev: 0, cmp: 0, cert: 1, vcert: 7 };
export const genId = (kind) => {
  const map = {
    pr: () => `AJPR-2026-${pad(++seq.pr)}`,
    rfq: () => `AJRFQ-2026-${pad(++seq.rfq)}`,
    qtn: () => `AJ-QTN-2026-${pad(++seq.qtn)}`,
    po: () => `AJ-PO-2026-${pad(++seq.po)}`,
    inv: () => `AJ-INV-2026-${pad(++seq.inv)}`,
    rct: () => `AJ-RCT-2026-${pad(++seq.rct)}`,
    dn: () => `AJ-DN-2026-${pad(++seq.dn)}`,
    ord: () => `AJ-ORD-${pad(++seq.ord, 6)}`,
    ret: () => `AJ-RET-${pad(++seq.ret, 5)}`,
    tkt: () => `AJ-TKT-${pad(++seq.tkt, 5)}`,
    rev: () => `AJ-REV-${pad(++seq.rev, 5)}`,
    cmp: () => `AJ-CMP-${pad(++seq.cmp, 5)}`,
    cert: () => `AJ-CERT-${pad(++seq.cert, 5)}`,
    vcert: () => `AJ-VCERT-${pad(++seq.vcert, 5)}`,
  };
  return map[kind]();
};

/* ------------------------------- reducer --------------------------------- */
const EVENT_SEED = [
  {
    id: "EVT-001", title: "AJ-PROXIS Supplier & Procurement Fair", date: "2026-10-14", time: "9:00 AM – 4:00 PM", venue: "Accra International Conference Centre",
    description: "Meet AJ-PROXIS's vetted supplier network face-to-face, explore the latest office, ICT and construction offerings, and learn how to get the most out of AJ-PROXIS Procure.",
    cap: 200,
    priceCategories: [
      { key: "standard", label: "Standard Pass", price: 50, perks: "Full access to the exhibition floor and general sessions." },
      { key: "vip", label: "VIP Pass", price: 150, perks: "Standard access plus reserved seating, lunch, and a meet-the-suppliers session." },
      { key: "group", label: "Group Pass (up to 5 people)", price: 200, perks: "Standard access for up to 5 attendees from the same organization." },
    ],
  },
  {
    id: "EVT-002", title: "Smart Procurement Webinar: Budgeting for 2027", date: "2026-11-05", time: "2:00 PM – 3:30 PM", venue: "Online (Zoom)",
    description: "A practical session on setting procurement budgets, credit limits, and approval workflows for the year ahead.",
    cap: 500,
    priceCategories: [{ key: "free", label: "Free Attendance", price: 0, perks: "Live access to the webinar and Q&A." }],
  },
  {
    id: "EVT-003", title: "AJ-PROXIS Foundation Community Day", date: "2026-12-06", time: "10:00 AM – 2:00 PM", venue: "Kingsford Preparatory School, Accra",
    description: "See the AJ-PROXIS Foundation's community investments in action, funded by 5% of every sale on the platform.",
    cap: 150,
    priceCategories: [{ key: "free", label: "Free Entry", price: 0, perks: "Open to the public — no charge." }],
  },
];

const DEFAULT_COMPANY_CONTENT = {
  aboutIntro: "AJ-PROXIS SOLUTIONS is a Ghana-based provider of B2B procurement and business-supply services, built to help organizations source, request, approve, pay for, and track everything they need — from office essentials to construction materials — through one unified platform: AJ-PROXIS Procure.\n\nWe partner with a vetted network of suppliers across Ghana to deliver reliably and affordably, while giving every customer full visibility and control over their spend at every step — from request to receipt.\n\nA share of the revenue from every item sold also funds the AJ-PROXIS Foundation, reinvesting directly in schools and communities across Ghana.",
  historyText: "AJ-PROXIS SOLUTIONS began with a simple observation: no organization — whether a small school or a growing enterprise — should have to juggle dozens of suppliers, paper trails, and delayed deliveries just to keep operations running. What started as a focused office-supplies service grew into AJ-PROXIS Procure, a full B2B procurement platform now trusted by schools, companies, hospitals, and institutions across Ghana to source, approve, pay for, and track everything they need, all from one account.",
  missionText: "To simplify procurement for every organization in Ghana by providing a single, transparent platform to source, request, approve, pay for, and track business supplies — reliably, affordably, and without the friction of traditional purchasing.",
  visionText: "To become West Africa's most trusted procurement partner — the first place any organization turns when they need to buy, source, or supply anything for their business.",
  careersText: "We're always looking for people who care about building a better procurement experience for organizations across Ghana — from engineering and operations to logistics and supplier relations.\n\nHave a skill set you think we need? Reach out at hello@ajproxis.com and tell us how you'd like to contribute.",
  contact: { web: "procure.ajproxis.com", email: "hello@ajproxis.com", phone: "+233 24 000 0192", address: "Spintex Road, Accra, Ghana" },
  team: [
    { id: "tm-1", name: "Kwaku Ansah", title: "Chief Executive Officer", initials: "KA" },
    { id: "tm-2", name: "Ama Serwaa Boateng", title: "Chief Operating Officer", initials: "AB" },
    { id: "tm-3", name: "Nana Yaw Oppong", title: "Chief Financial Officer", initials: "NO" },
    { id: "tm-4", name: "Abena Osei-Mensah", title: "Head of Procurement & Supplier Relations", initials: "AO" },
    { id: "tm-5", name: "Kojo Antwi-Darko", title: "Head of Technology", initials: "KD" },
  ],
  documents: {
    brochure: {
      title: "AJ-PROXIS Solutions Brochure",
      body: `
      <h2>Request. Procure. Deliver.</h2>
      <p>AJ-PROXIS Procure is a centralized B2B procurement and business-supply platform. Any organization — schools, companies, hospitals, hotels, NGOs, government bodies and more — can request virtually any approved item, get a quotation, approve it, pay for it, and track it to their door, all from one account.</p>
      <h3>Three Ways to Procure</h3>
      <ul>
        <li><b>Buy from Catalogue</b> — Browse, add to cart, checkout, and pay.</li>
        <li><b>Request a Quote</b> — Submit a list of items and receive a formal quotation.</li>
        <li><b>Source For Me</b> — Describe what you need and AJ-PROXIS sources it for you.</li>
      </ul>
      <h3>Why AJ-PROXIS</h3>
      <ul>
        <li>A vetted network of suppliers across Ghana, delivering reliably and affordably.</li>
        <li>Full visibility and control over your organization's spend, from request to receipt.</li>
        <li>Registration certificates, vendor certificates, AI-assisted market pricing, and a loyalty rewards program.</li>
        <li>5% of every sale funds the AJ-PROXIS Foundation, reinvesting in schools and communities across Ghana.</li>
      </ul>
      <h3>Get Started</h3>
      <p>Visit procure.ajproxis.com to register your organization, or reach us at hello@ajproxis.com / +233 24 000 0192.</p>
    `,
    },
    "procurement-policy": {
      title: "Procurement Policy",
      body: `
      <h2>AJ-PROXIS Procurement Policy</h2>
      <p>This policy governs how organizations request, approve, and pay for goods and services through AJ-PROXIS Procure.</p>
      <h3>1. Requesting Procurement</h3>
      <p>Only users with the Procurement Officer, Administrator, or CEO/Principal role may submit a procurement request, whether via the Catalogue, a Custom Request, or an RFQ.</p>
      <h3>2. Approval Chain</h3>
      <p>Every request must be approved by the organization's CEO/Principal before payment. Approved requests are then routed to the Accountant for payment, and finally to AJ-PROXIS Control Centre for processing.</p>
      <h3>3. Quotation Validity</h3>
      <p>Quotations are valid for 7 days from issue. Prices may be renegotiated once per quotation prior to approval.</p>
      <h3>4. Payment Terms</h3>
      <p>Payment may be made via Mobile Money, Visa/Mastercard, bank transfer, or AJ-PROXIS Wallet balance. Approved organizations may qualify for Net 30 credit terms, subject to their assigned credit limit.</p>
      <h3>5. Delivery</h3>
      <p>Delivery fees are calculated automatically based on distance from the AJ-PROXIS Accra hub, with estimated delivery periods provided at the time of request.</p>
    `,
    },
    "return-policy": {
      title: "Item Return Policy",
      body: `
      <h2>AJ-PROXIS Item Return Policy</h2>
      <p>We want every organization to receive exactly what they ordered, in good condition. This policy explains how returns are handled.</p>
      <h3>1. Eligibility</h3>
      <p>Items may be returned within 7 days of delivery if they are damaged, defective, or materially different from what was ordered. Perishable goods, custom-branded items, and made-to-order products are not eligible for return.</p>
      <h3>2. How to Request a Return</h3>
      <p>Log in to your AJ-PROXIS Procure account, open the relevant order under Orders & Tracking, and submit a return request with a description and, where possible, photos of the issue.</p>
      <h3>3. Review & Resolution</h3>
      <p>AJ-PROXIS Control Centre reviews each return request and will offer a replacement, repair, or refund to your AJ-PROXIS Wallet, depending on the circumstances.</p>
      <h3>4. Refund Timing</h3>
      <p>Approved wallet refunds are processed within 3 business days of approval. Refunds to the original payment method may take longer, depending on the provider.</p>
    `,
    },
    "delivery-policy": {
      title: "Delivery Policy",
      body: `
      <h2>AJ-PROXIS Delivery Policy</h2>
      <p>This policy explains how AJ-PROXIS calculates delivery fees and estimated delivery periods.</p>
      <h3>1. Delivery Fee Calculation</h3>
      <p>Delivery fees are calculated automatically based on the straight-line distance between the AJ-PROXIS Accra hub and the delivery address provided, with a minimum fee of GHS 30 and a maximum of GHS 650.</p>
      <h3>2. Estimated Delivery Periods</h3>
      <p>Estimated delivery periods scale with distance: 1–2 business days within Accra, up to 7–10 business days for the most remote regions of Ghana. Estimates are shown before an order is placed and again once payment is confirmed.</p>
      <h3>3. Delivery Tracking</h3>
      <p>Every order can be tracked in real time under Orders & Tracking, from "Paid — Awaiting Control Centre" through to "Delivered", including Proof of Delivery capture on arrival.</p>
      <h3>4. Delivery Location</h3>
      <p>Customers may enter a delivery address manually, use their current GPS location, or select a previously saved delivery location, with a live map to confirm the pinned address before submitting.</p>
    `,
    },
  },
};

const DEFAULT_COMPANY_MENU_ITEMS = [
  { id: "cmi-about", label: "About AJ-PROXIS", type: "page", pageKey: "about", visible: true },
  { id: "cmi-team", label: "AJ-PROXIS Management Team", type: "page", pageKey: "team", visible: true },
  { id: "cmi-contact", label: "Contact Us", type: "page", pageKey: "contact", visible: true },
  { id: "cmi-careers", label: "Careers", type: "page", pageKey: "careers", visible: true },
  { id: "cmi-events", label: "Up-coming Events", type: "page", pageKey: "events", visible: true },
  { id: "cmi-tickets", label: "Event Ticket", type: "page", pageKey: "tickets", visible: true },
  { id: "cmi-documents", label: "Documents", type: "page", pageKey: "documents", visible: true },
  { id: "cmi-ajpmss", label: "AJ-PROXIS Multi-School System", type: "link", url: "https://schools.ajproxis.com", visible: true },
];
const PRODUCT_SEED = seedProducts();
// Seed a few realistic near-duplicate catalogue entries — the kind that naturally appear when
// two different supplier submissions for the same item both get approved as "new" products —
// so the AI Duplicate Catalogue Cleaner has something real to demonstrate out of the box.
(function seedDemoDuplicates() {
  const dupSources = [
    PRODUCT_SEED.find((p) => p.name === "A4 Copier Paper (80gsm)"),
    PRODUCT_SEED.find((p) => p.name === "Executive Desk"),
  ].filter(Boolean);
  dupSources.forEach((src, i) => {
    const n = PRODUCT_SEED.length + 1;
    PRODUCT_SEED.push({
      ...src,
      id: "P" + pad(n, 4),
      sku: src.category.slice(0, 2).toUpperCase() + "-DUP" + (i + 1),
      price: Math.round(src.price * (0.94 + Math.random() * 0.1)),
      corpPrice: Math.round(src.corpPrice * (0.94 + Math.random() * 0.1)),
      bulkPrice: Math.round(src.bulkPrice * (0.94 + Math.random() * 0.1)),
      stock: Object.fromEntries(WAREHOUSES.map((w) => [w, Math.floor(20 + Math.random() * 300)])),
    });
  });
})();
const BULK_SUBMISSIONS = generateBulkSubmissions(BULK_SUPPLIERS, PRODUCT_SEED, 200);

export const initialState = {
  session: { portal: null, accountId: null, adminReturn: null, actingUserId: null, staffVerified: false },
  customers: [
    { ...CUSTOMER_ORG, id: "ORG-0001", password: "demo1234", status: "Active" },
  ],
  staff: [
    { id: "STF-001", name: "Kwaku Ansah", email: "admin@ajproxis.com", role: "Super Administrator", password: "admin123", status: "Active", isSuperAdmin: true, features: null },
  ],
  internalRoles: [...INTERNAL_ROLES],
  products: PRODUCT_SEED,
  supplierSubmissions: BULK_SUBMISSIONS,
  supportTickets: [],
  orgUsers: [...ORG_USERS_SEED],
  foundation: { contributions: [], disbursements: [] },
  passwordResets: [],
  registrationFee: 500,
  announcements: [],
  creditRequests: [],
  loyaltyRate: 10,      // GHS spent per 1 point earned
  redemptionRate: 10,   // points redeemed per GHS 1 credited to wallet
  priceAnalyses: [],
  companyMenuItems: DEFAULT_COMPANY_MENU_ITEMS,
  companyContent: DEFAULT_COMPANY_CONTENT,
  eventTickets: [],
  events: EVENT_SEED,
  reviews: [],
  complianceDocs: [],
  cart: [],
  requests: [],     // custom procurement requests
  rfqs: [],         // multi-item RFQs
  quotations: [],   // quotations (from requests/rfqs or cart checkout)
  orders: [],       // confirmed orders with delivery pipeline
  wallet: { balance: 12500, transactions: [
    { id: uid(), date: "2026-08-02", type: "Deposit", amount: 20000 },
    { id: uid(), date: "2026-08-15", type: "Order Payment", amount: -7500 },
  ]},
  invoices: [],
  documents: [],
  contracts: [
    { id: "AJ-CTR-0007", product: "Office Essentials Plan", start: "2026-01-01", end: "2026-12-31", terms: "Net 30", value: 96000, customerId: "ORG-0001", status: "Active", signedBy: CUSTOMER_ORG.contact, signedAt: "2026-01-03" },
  ],
  budget: { annual: CUSTOMER_ORG.budgetAnnual, spent: 154000, committed: 32000 },
  suppliers: [...SUPPLIER_SEED, ...BULK_SUPPLIERS],
  auditLog: [],
  notifications: [
    { id: uid(), text: "Welcome to AJ-PROXIS Procure.", read: false },
  ],
  recurring: [
    { id: "REC-01", name: "Monthly Office Essentials", items: "50 boxes A4 paper, 10 cartons tissue", frequency: "Monthly", nextRun: "2026-10-01", active: true },
  ],
};

export function log(state, text) {
  state.auditLog = [{ id: uid(), time: new Date().toISOString(), text }, ...state.auditLog].slice(0, 200);
}
export function notify(state, text, scope = "customer") {
  state.notifications = [{ id: uid(), text, read: false, scope }, ...state.notifications].slice(0, 50);
}
const FOUNDATION_RATE = 0.05;
export function contributeToFoundation(state, order) {
  const amount = Math.round(order.subtotal * FOUNDATION_RATE * 100) / 100;
  state.foundation = {
    ...state.foundation,
    contributions: [
      { id: uid(), orderId: order.id, customerId: order.customerId, orgName: order.org, orderValue: order.subtotal, amount, date: order.createdAt },
      ...state.foundation.contributions,
    ],
  };
}

export function reducer(state, action) {
  switch (action.type) {
    case "ADD_TO_CART": {
      const { product, qty } = action;
      const existing = state.cart.find((c) => c.id === product.id);
      const cart = existing
        ? state.cart.map((c) => (c.id === product.id ? { ...c, qty: c.qty + qty } : c))
        : [...state.cart, { id: product.id, product, qty }];
      return { ...state, cart };
    }
    case "SET_QTY": {
      const cart = state.cart.map((c) => (c.id === action.id ? { ...c, qty: Math.max(1, action.qty) } : c));
      return { ...state, cart };
    }
    case "REMOVE_FROM_CART":
      return { ...state, cart: state.cart.filter((c) => c.id !== action.id) };
    case "CLEAR_CART":
      return { ...state, cart: [] };

    case "SUBMIT_CART_FOR_APPROVAL": {
      const ns = { ...state };
      const cust = state.customers.find((c) => c.id === action.customerId) || state.customers[0];
      const qid = genId("qtn");
      const { km: cartKm } = estimateDeliveryFee(action.deliveryAddress);
      const quotation = {
        id: qid, origin: "Catalogue Cart", kind: "Cart", items: action.items,
        subtotal: action.subtotal, discount: action.discount || 0, delivery: action.delivery || 0,
        status: "Awaiting Customer",
        history: [{ price: action.subtotal, note: "Cart submitted for CEO / Principal approval", date: nowStamp() }],
        createdAt: nowStamp(),
        customerId: cust.id, orgName: cust.name, deliveryAddress: action.deliveryAddress,
        estimatedDeliveryPeriod: estimateDeliveryDays(cartKm).label,
      };
      ns.quotations = [quotation, ...state.quotations];
      ns.cart = [];
      log(ns, `Cart submitted as ${qid} by ${cust.name} — routed to the CEO / Principal for approval.`);
      notify(ns, `Your cart (${qid}) was submitted for CEO / Principal approval.`);
      return ns;
    }

    case "CREATE_CUSTOM_REQUEST": {
      const ns = { ...state };
      const cust = state.customers.find((c) => c.id === action.payload.customerId) || state.customers[0];
      const id = genId("pr");
      const deliveryAddress = action.payload.deliveryAddress || cust.deliveryAddress;
      const { km: deliveryKm, fee: estimatedDeliveryFee } = estimateDeliveryFee(deliveryAddress);
      const estimatedDeliveryPeriod = estimateDeliveryDays(deliveryKm).label;
      const req = {
        id, ...action.payload, category: action.payload.category || "office", orgName: cust.name,
        deliveryAddress, deliveryKm, estimatedDeliveryFee, estimatedDeliveryPeriod,
        status: "Pending Review", createdAt: nowStamp(), kind: "custom",
        assignedSupplierId: null, assignedSupplierName: null,
      };
      ns.requests = [req, ...state.requests];
      log(ns, `Custom procurement request ${id} submitted by ${cust.name} — delivery estimated at ${GHS(estimatedDeliveryFee)} (~${deliveryKm}km, ${estimatedDeliveryPeriod}).`);
      notify(ns, `Procurement Request ${id} created.`);
      return ns;
    }

    case "ASSIGN_SUPPLIER_TO_REQUEST": {
      const ns = { ...state };
      const supplier = state.suppliers.find((s) => s.id === action.supplierId);
      ns.requests = state.requests.map((r) => {
        if (r.id !== action.id) return r;
        return {
          ...r,
          assignedSupplierId: supplier?.id || null,
          assignedSupplierName: supplier?.name || null,
          status: r.status === "Pending Review" ? "Supplier Assigned" : r.status,
        };
      });
      log(ns, `Request ${action.id} allocated to supplier "${supplier?.name}" by AJ-PROXIS Control Centre.`);
      notify(ns, `Your request ${action.id} is being sourced from ${supplier?.name}.`);
      return ns;
    }

    case "CREATE_RFQ": {
      const ns = { ...state };
      const cust = state.customers.find((c) => c.id === action.customerId) || state.customers[0];
      const id = genId("rfq");
      const deliveryAddress = action.deliveryAddress || cust.deliveryAddress;
      const { km: deliveryKm, fee: estimatedDeliveryFee } = estimateDeliveryFee(deliveryAddress);
      const estimatedDeliveryPeriod = estimateDeliveryDays(deliveryKm).label;
      const rfq = {
        id, items: action.items, status: "Sourcing", createdAt: nowStamp(),
        institutional: action.institutional || false, supplierQuotes: [], customerId: cust.id, orgName: cust.name,
        deliveryAddress, deliveryKm, estimatedDeliveryFee, estimatedDeliveryPeriod,
      };
      ns.rfqs = [rfq, ...state.rfqs];
      log(ns, `RFQ ${id} created by ${cust.name} with ${action.items.length} line item(s) — delivery estimated at ${GHS(estimatedDeliveryFee)} (~${deliveryKm}km, ${estimatedDeliveryPeriod}).`);
      notify(ns, `RFQ ${id} submitted for supplier sourcing.`);
      return ns;
    }

    case "GENERATE_SUPPLIER_QUOTES": {
      const ns = { ...state };
      ns.rfqs = state.rfqs.map((r) => {
        if (r.id !== action.id) return r;
        const approved = state.suppliers.filter((s) => s.status !== "Pending" && s.status !== "Rejected");
        const relevant = approved.filter((s) => r.items.some((it) => s.categories.includes(it.category))).slice(0, 3);
        const pool = relevant.length ? relevant : approved.slice(0, 3);
        const base = r.items.reduce((s, it) => s + it.qty * it.unitPrice, 0);
        const quotes = pool.map((s, idx) => ({
          supplierId: s.id, supplierName: s.name,
          price: Math.round(base * (0.92 + idx * 0.04 + Math.random() * 0.03)),
          deliveryDays: s.leadTime + idx,
          score: Math.round((s.reliability + s.quality + s.delivery) / 3),
        }));
        return { ...r, status: "Quotes Received", supplierQuotes: quotes };
      });
      log(ns, `Supplier quotations generated for ${action.id}.`);
      return ns;
    }

    case "SELECT_SUPPLIER_QUOTE": {
      const ns = { ...state };
      let sourceItems = [];
      ns.rfqs = state.rfqs.map((r) => {
        if (r.id !== action.id) return r;
        sourceItems = r.items;
        return { ...r, status: "Supplier Selected", selectedSupplier: action.supplierId };
      });
      const rfq = state.rfqs.find((r) => r.id === action.id);
      const chosen = rfq.supplierQuotes.find((q) => q.supplierId === action.supplierId);
      const qid = genId("qtn");
      const subtotal = sourceItems.reduce((s, it) => s + it.qty * it.unitPrice, 0);
      const scaled = chosen ? chosen.price : subtotal;
      const quotation = {
        id: qid, origin: rfq.id, kind: "RFQ", items: sourceItems, subtotal: scaled,
        discount: 0, delivery: rfq.estimatedDeliveryFee ?? 150, status: "Awaiting Customer",
        history: [{ price: scaled, note: "Initial quotation", date: new Date().toISOString().slice(0, 10) }],
        createdAt: new Date().toISOString().slice(0, 10),
        customerId: rfq.customerId, orgName: rfq.orgName,
        supplierId: chosen?.supplierId || null, supplierName: chosen?.supplierName || null,
        estimatedDeliveryPeriod: rfq.estimatedDeliveryPeriod,
      };
      ns.quotations = [quotation, ...state.quotations];
      log(ns, `Quotation ${qid} prepared from RFQ ${rfq.id} using ${chosen?.supplierName}.`);
      notify(ns, `Your quotation ${qid} is ready for review.`);
      return ns;
    }

    case "ADMIN_QUOTE_RFQ": {
      const ns = { ...state };
      const rfq = state.rfqs.find((r) => r.id === action.id);
      const supplier = state.suppliers.find((s) => s.id === action.supplierId);
      const items = rfq.items.map((it) => ({ ...it, unitPrice: Number(action.itemPrices[it.name]) || it.unitPrice || 0 }));
      const subtotal = items.reduce((s, it) => s + it.qty * it.unitPrice, 0);
      const qid = genId("qtn");
      const quotation = {
        id: qid, origin: rfq.id, kind: "RFQ", items, subtotal,
        discount: 0, delivery: action.delivery ?? rfq.estimatedDeliveryFee ?? 150, status: "Awaiting Customer",
        history: [{ price: subtotal, note: "Initial quotation", date: new Date().toISOString().slice(0, 10) }],
        createdAt: new Date().toISOString().slice(0, 10),
        customerId: rfq.customerId, orgName: rfq.orgName,
        supplierId: supplier?.id || null, supplierName: supplier?.name || null,
        estimatedDeliveryPeriod: rfq.estimatedDeliveryPeriod,
      };
      ns.quotations = [quotation, ...state.quotations];
      ns.rfqs = state.rfqs.map((r) => (r.id === action.id ? { ...r, status: "Supplier Selected", selectedSupplier: supplier?.id || null } : r));
      log(ns, `Quotation ${qid} prepared for RFQ ${rfq.id} with exact pricing, allocated to ${supplier?.name || "Control Centre (no supplier)"}.`);
      notify(ns, `Your quotation ${qid} is ready for review.`);
      return ns;
    }

    case "ADMIN_QUOTE_CUSTOM_REQUEST": {
      const ns = { ...state };
      ns.requests = state.requests.map((r) => (r.id === action.id ? { ...r, status: "Quoted" } : r));
      const req = state.requests.find((r) => r.id === action.id);
      const qid = genId("qtn");
      const quotation = {
        id: qid, origin: req.id, kind: "Custom", items: [{ name: req.item, qty: req.qty, unitPrice: action.unitPrice, category: req.category || "custom" }],
        subtotal: req.qty * action.unitPrice, discount: 0, delivery: action.delivery ?? req.estimatedDeliveryFee ?? 100,
        status: "Awaiting Customer",
        history: [{ price: req.qty * action.unitPrice, note: "Initial quotation", date: new Date().toISOString().slice(0, 10) }],
        createdAt: new Date().toISOString().slice(0, 10),
        customerId: req.customerId, orgName: req.orgName,
        supplierId: req.assignedSupplierId || null, supplierName: req.assignedSupplierName || null,
        estimatedDeliveryPeriod: req.estimatedDeliveryPeriod,
      };
      ns.quotations = [quotation, ...state.quotations];
      log(ns, `Quotation ${qid} prepared for request ${req.id}${req.assignedSupplierName ? ` (sourced from ${req.assignedSupplierName})` : ""}.`);
      notify(ns, `Your quotation ${qid} is ready for review.`);
      return ns;
    }

    case "REQUEST_NEGOTIATION": {
      const ns = { ...state };
      ns.quotations = state.quotations.map((q) => {
        if (q.id !== action.id) return q;
        return {
          ...q,
          status: "Negotiation Requested",
          negotiation: { requestedPrice: action.requestedPrice, reason: action.reason, requestedAt: new Date().toISOString().slice(0, 10), decision: null, note: "" },
          history: [...q.history, { price: action.requestedPrice, note: `Customer requested ${GHS(action.requestedPrice)} — awaiting Control Centre decision`, date: new Date().toISOString().slice(0, 10) }],
        };
      });
      log(ns, `Quotation ${action.id}: customer requested ${GHS(action.requestedPrice)} — awaiting Control Centre decision.`);
      notify(ns, `Quotation ${action.id} has a customer price negotiation awaiting your decision.`, "admin");
      return ns;
    }

    case "DECIDE_NEGOTIATION": {
      const ns = { ...state };
      ns.quotations = state.quotations.map((q) => {
        if (q.id !== action.id || !q.negotiation) return q;
        const accepted = action.decision === "Accepted";
        const newPrice = accepted ? q.negotiation.requestedPrice : q.subtotal;
        return {
          ...q,
          subtotal: newPrice,
          status: accepted ? "Revised — Awaiting Customer" : "Awaiting Customer",
          negotiation: { ...q.negotiation, decision: action.decision, note: action.note || "" },
          history: [...q.history, {
            price: newPrice,
            note: accepted
              ? `AJ-PROXIS Control Centre accepted the negotiated price of ${GHS(newPrice)}.${action.note ? " Note: " + action.note : ""}`
              : `AJ-PROXIS Control Centre rejected the negotiation request. Original price stands.${action.note ? " Note: " + action.note : ""}`,
            date: new Date().toISOString().slice(0, 10),
          }],
        };
      });
      log(ns, `Quotation ${action.id} negotiation ${action.decision.toLowerCase()} by AJ-PROXIS Control Centre.`);
      notify(ns, `Your price negotiation on ${action.id} was ${action.decision.toLowerCase()}.`);
      return ns;
    }

    case "REJECT_QUOTATION": {
      const ns = { ...state };
      ns.quotations = state.quotations.map((q) => (q.id === action.id ? { ...q, status: "Rejected" } : q));
      log(ns, `Quotation ${action.id} rejected by customer.`);
      return ns;
    }

    case "APPROVE_QUOTATION": {
      const ns = { ...state };
      ns.quotations = state.quotations.map((x) => (x.id === action.id ? { ...x, status: "Approved" } : x));
      log(ns, `Quotation ${action.id} approved by the CEO/Principal — routed to the Accountant for payment.`);
      notify(ns, `Quotation ${action.id} approved and sent to the Accountant for payment.`);
      return ns;
    }

    case "PAY_QUOTATION": {
      const ns0 = { ...state };
      const q = state.quotations.find((x) => x.id === action.id);
      const cust = state.customers.find((c) => c.id === q.customerId) || state.customers[0];
      const tax = taxBreakdown(q.subtotal, q.discount || 0, q.delivery || 0);
      const orderId = genId("ord");
      const poId = genId("po");
      const invId = genId("inv");
      const rctId = genId("rct");
      const dnId = genId("dn");
      const order = {
        id: orderId, poId, invId, rctId, dnId, quotationId: q.id,
        items: q.items, subtotal: q.subtotal, tax, total: tax.grand,
        paymentMethod: action.paymentMethod, status: "Approved", deliveryStatus: "Paid — Awaiting Control Centre",
        createdAt: new Date().toISOString().slice(0, 10), deliveredItems: {}, source: q.kind,
        org: cust.name, customerId: cust.id, gps: cust.gps,
      };
      const ns = { ...ns0 };
      ns.orders = [order, ...state.orders];
      ns.documents = [
        { id: poId, kind: "Purchase Order", orderId },
        { id: invId, kind: "Invoice", orderId },
        { id: rctId, kind: "Receipt", orderId },
        { id: dnId, kind: "Delivery Note", orderId },
        ...state.documents,
      ];
      ns.quotations = state.quotations.map((x) => (x.id === action.id ? { ...x, status: "Paid" } : x));
      ns.budget = { ...state.budget, spent: state.budget.spent + tax.grand };
      contributeToFoundation(ns, order);
      const pointsEarned = Math.floor(tax.grand / state.loyaltyRate);
      ns.customers = (ns.customers || state.customers).map((c) => (c.id === cust.id ? { ...c, loyaltyPoints: (c.loyaltyPoints || 0) + pointsEarned } : c));
      if (action.paymentMethod === "wallet") {
        ns.wallet = {
          balance: state.wallet.balance - tax.grand,
          transactions: [{ id: uid(), date: order.createdAt, type: `Order Payment ${orderId}`, amount: -tax.grand }, ...state.wallet.transactions],
        };
      }
      log(ns, `Accountant paid order ${orderId} from quotation ${q.id} via ${action.paymentMethod} — moved to AJ-PROXIS Control Centre for processing. ${pointsEarned} loyalty points earned.`);
      notify(ns, `Order ${orderId} paid and sent to AJ-PROXIS Control Centre. You earned ${pointsEarned} loyalty points!`);
      return ns;
    }

    case "ADD_FUNDS": {
      const ns = { ...state };
      const label = action.method ? `Deposit via ${action.method}` : "Deposit";
      ns.wallet = {
        balance: state.wallet.balance + action.amount,
        transactions: [{ id: uid(), date: new Date().toISOString().slice(0, 10), type: label, amount: action.amount }, ...state.wallet.transactions],
      };
      log(ns, `Wallet topped up with ${GHS(action.amount)} via ${action.method || "unspecified method"}.`);
      return ns;
    }

    case "UPDATE_DELIVERY_STATUS": {
      const ns = { ...state };
      ns.orders = state.orders.map((o) => {
        if (o.id !== action.id) return o;
        // If staff mark the order Delivered directly from the status dropdown (skipping the
        // itemized Proof of Delivery capture), fill in full delivered quantities for every
        // item so the per-item "Delivered" column stays consistent with the order's status.
        const delivered = action.status === "Delivered"
          ? { ...o.deliveredItems, ...Object.fromEntries(o.items.map((it) => [it.name, it.qty])) }
          : o.deliveredItems;
        return { ...o, deliveryStatus: action.status, driver: action.driver || o.driver, deliveredItems: delivered };
      });
      log(ns, `Order ${action.id} delivery status set to "${action.status}".`);
      notify(ns, `Order ${action.id} is now ${action.status}.`);
      return ns;
    }

    case "MARK_DELIVERED": {
      const ns = { ...state };
      ns.orders = state.orders.map((o) => {
        if (o.id !== action.id) return o;
        const delivered = { ...o.deliveredItems };
        action.deliveries.forEach((d) => { delivered[d.name] = d.qty; });
        const fullyDelivered = o.items.every((it) => (delivered[it.name] || 0) >= it.qty);
        return {
          ...o, deliveredItems: delivered,
          deliveryStatus: fullyDelivered ? "Delivered" : "Partially Delivered",
          pod: { receiver: action.receiver, date: new Date().toISOString().slice(0, 10), gps: o.gps || "GPS not on file", signed: true },
        };
      });
      log(ns, `Proof of delivery captured for order ${action.id} (received by ${action.receiver}).`);
      notify(ns, `Order ${action.id} delivery confirmed.`);
      return ns;
    }

    case "REQUEST_RETURN": {
      const ns = { ...state };
      const id = genId("ret");
      const ret = { id, orderId: action.orderId, reason: action.reason, status: "Under Review", createdAt: new Date().toISOString().slice(0, 10) };
      ns.orders = state.orders.map((o) => (o.id === action.orderId ? { ...o, returns: [...(o.returns || []), ret] } : o));
      log(ns, `Return request ${id} opened for order ${action.orderId} (${action.reason}).`);
      return ns;
    }

    case "TOGGLE_RECURRING": {
      const ns = { ...state };
      ns.recurring = state.recurring.map((r) => (r.id === action.id ? { ...r, active: !r.active } : r));
      return ns;
    }
    case "ADD_RECURRING": {
      const ns = { ...state };
      ns.recurring = [{ id: "REC-" + pad(state.recurring.length + 1, 2), ...action.payload, active: true }, ...state.recurring];
      log(ns, `Recurring procurement schedule "${action.payload.name}" created.`);
      return ns;
    }

    case "ADD_CONTRACT": {
      const ns = { ...state };
      const id = "AJ-CTR-" + pad(state.contracts.length + 8, 4);
      ns.contracts = [{ id, status: "Pending Signature", signedBy: null, signedAt: null, ...action.payload }, ...state.contracts];
      log(ns, `Contract ${action.payload.product} created — a Supply Agreement has been generated and is awaiting the customer's signature.`);
      notify(ns, `Your new contract ${id} has a Supply Agreement ready to review and sign.`);
      return ns;
    }

    case "SIGN_CONTRACT": {
      const ns = { ...state };
      ns.contracts = state.contracts.map((c) => (c.id === action.id ? { ...c, status: "Active", signedBy: action.signedBy, signedAt: new Date().toISOString().slice(0, 10) } : c));
      log(ns, `Supply Agreement for contract ${action.id} signed by ${action.signedBy}.`);
      notify(ns, `Supply Agreement ${action.id} signed — contract is now active.`);
      return ns;
    }

    case "SET_BUDGET": {
      const ns = { ...state };
      ns.budget = { ...state.budget, annual: action.annual };
      log(ns, `Annual procurement budget set to ${GHS(action.annual)}.`);
      return ns;
    }

    case "ADD_SUPPLIER": {
      const ns = { ...state };
      const id = "S" + pad(state.suppliers.length + 1, 3);
      ns.suppliers = [{ id, reliability: 80, quality: 80, delivery: 80, leadTime: 5, status: "Approved", ...action.payload }, ...state.suppliers];
      log(ns, `Supplier "${action.payload.name}" onboarded directly by Control Centre (auto-approved).`);
      return ns;
    }

    case "GENERATE_BULK_SUPPLIERS": {
      const ns = { ...state };
      // Runs against whatever is currently loaded (not just a fresh install), so it works
      // even if this browser already had a saved session from before this feature existed.
      const existingIds = new Set(state.suppliers.map((s) => s.id));
      let n = 101;
      while (existingIds.has("S" + n)) n++;
      const newSuppliers = [];
      for (let i = 0; i < (action.count || 50); i++) {
        while (existingIds.has("S" + n)) n++;
        const one = generateBulkSuppliers(1).map((s) => ({ ...s, id: "S" + n }))[0];
        // re-derive name/contact from the final id so they stay consistent
        const city = BULK_CITIES[(n + i) % BULK_CITIES.length];
        const biz = BULK_BIZ_WORDS[(n + i) % BULK_BIZ_WORDS.length];
        one.name = `${city} ${biz} ${n} Ltd`;
        const slug = one.name.toLowerCase().replace(/[^a-z0-9]+/g, "");
        one.contact = `sales@${slug}.com`;
        one.email = one.contact;
        one.vendorCertificateId = `AJ-VCERT-${pad(n, 5)}`;
        one.vendorCertificateIssuedAt = new Date().toISOString().slice(0, 10);
        newSuppliers.push(one);
        existingIds.add("S" + n);
        n++;
      }
      const newSubmissions = generateBulkSubmissions(newSuppliers, state.products, action.perSupplier || 200);
      // Keep new submission IDs unique against anything already in this session.
      const existingSubIds = new Set(state.supplierSubmissions.map((s) => s.id));
      let counter = 1;
      newSubmissions.forEach((s) => {
        while (existingSubIds.has(`GEN-${pad(counter, 6)}`)) counter++;
        s.id = `GEN-${pad(counter, 6)}`;
        s.submittedAt = nowStamp();
        existingSubIds.add(s.id);
        counter++;
      });
      ns.suppliers = [...state.suppliers, ...newSuppliers];
      ns.supplierSubmissions = [...newSubmissions, ...state.supplierSubmissions];
      log(ns, `${newSuppliers.length} new suppliers auto-generated with ${newSubmissions.length} pending price submissions (${action.perSupplier || 200} each) by ${action.generatedBy}.`);
      return ns;
    }

    /* -------------------------- catalogue management (Control Centre only) -------------------------- */
    case "ADD_PRODUCT": {
      const ns = { ...state };
      const p = action.payload;
      const id = "P" + pad(state.products.length + 1, 4);
      const sku = p.sku && p.sku.trim() ? p.sku.trim() : (p.category || "GN").slice(0, 2).toUpperCase() + "-" + pad(state.products.length + 1, 3);
      const product = {
        id, sku, name: p.name, category: p.category, brand: p.brand || "AJ-PROXIS",
        unit: p.unit || "unit",
        price: Number(p.price) || 0,
        corpPrice: Number(p.corpPrice) || Math.round((Number(p.price) || 0) * 0.93),
        bulkQty: Number(p.bulkQty) || 10,
        bulkPrice: Number(p.bulkPrice) || Math.round((Number(p.price) || 0) * 0.88),
        contractPrice: null,
        moq: Number(p.moq) || 1,
        stock: Object.fromEntries(WAREHOUSES.map((w) => [w, Number(p.initialStock) || 0])),
        reorderLevel: Number(p.reorderLevel) || 25,
      };
      ns.products = [product, ...state.products];
      log(ns, `Catalogue item "${product.name}" (${product.sku}) added by AJ-PROXIS Control Centre.`);
      return ns;
    }

    case "BULK_ADD_PRODUCTS": {
      const ns = { ...state };
      let next = state.products.length;
      const added = action.items.map((p) => {
        next += 1;
        const sku = p.sku && p.sku.trim() ? p.sku.trim() : (p.category || "GN").slice(0, 2).toUpperCase() + "-" + pad(next, 3);
        return {
          id: "P" + pad(next, 4), sku, name: p.name, category: p.category || "office", brand: p.brand || "AJ-PROXIS",
          unit: p.unit || "unit", price: Number(p.price) || 0,
          corpPrice: Number(p.corpPrice) || Math.round((Number(p.price) || 0) * 0.93),
          bulkQty: Number(p.bulkQty) || 10,
          bulkPrice: Number(p.bulkPrice) || Math.round((Number(p.price) || 0) * 0.88),
          contractPrice: null, moq: 1,
          stock: Object.fromEntries(WAREHOUSES.map((w) => [w, 0])),
          reorderLevel: 25,
        };
      });
      ns.products = [...added, ...state.products];
      log(ns, `${added.length} catalogue item(s) bulk-uploaded by AJ-PROXIS Control Centre.`);
      return ns;
    }

    case "UPDATE_PRODUCT": {
      const ns = { ...state };
      ns.products = state.products.map((p) => (p.id === action.id ? { ...p, ...action.patch } : p));
      log(ns, `Catalogue item ${action.id} updated by AJ-PROXIS Control Centre.`);
      return ns;
    }

    case "REMOVE_PRODUCT": {
      const ns = { ...state };
      const removed = state.products.find((p) => p.id === action.id);
      ns.products = state.products.filter((p) => p.id !== action.id);
      log(ns, `Catalogue item "${removed?.name || action.id}" removed by AJ-PROXIS Control Centre.`);
      return ns;
    }

    /* -------------------- supplier price submissions (Control Centre eyes only) -------------------- */
    case "SUBMIT_SUPPLIER_PRICE": {
      const ns = { ...state };
      const supplier = state.suppliers.find((s) => s.id === action.supplierId);
      const id = "SUB-" + pad(state.supplierSubmissions.length + 1, 5);
      const entry = {
        id, supplierId: action.supplierId, supplierName: supplier?.name || "Unknown Supplier",
        sku: action.payload.sku || "", name: action.payload.name, category: action.payload.category || "office",
        unit: action.payload.unit || "unit", price: Number(action.payload.price) || 0,
        note: action.payload.note || "", status: "Pending Review",
        submittedAt: new Date().toISOString().slice(0, 10),
      };
      ns.supplierSubmissions = [entry, ...state.supplierSubmissions];
      log(ns, `${supplier?.name || "A supplier"} submitted a price for "${entry.name}" — visible to Control Centre only.`);
      notify(ns, `New supplier price submission: ${entry.name} from ${supplier?.name || "supplier"}.`, "admin");
      return ns;
    }

    case "BULK_SUBMIT_SUPPLIER_PRICES": {
      const ns = { ...state };
      const supplier = state.suppliers.find((s) => s.id === action.supplierId);
      let next = state.supplierSubmissions.length;
      const added = action.items.map((it) => {
        next += 1;
        return {
          id: "SUB-" + pad(next, 5), supplierId: action.supplierId, supplierName: supplier?.name || "Unknown Supplier",
          sku: it.sku || "", name: it.name, category: it.category || "office", unit: it.unit || "unit",
          price: Number(it.price) || 0, note: it.note || "", status: "Pending Review",
          submittedAt: new Date().toISOString().slice(0, 10),
        };
      });
      ns.supplierSubmissions = [...added, ...state.supplierSubmissions];
      log(ns, `${supplier?.name || "A supplier"} bulk-submitted ${added.length} price(s) — visible to Control Centre only.`);
      notify(ns, `${added.length} new supplier price submission(s) from ${supplier?.name || "supplier"}.`, "admin");
      return ns;
    }

    case "REVIEW_SUPPLIER_SUBMISSION": {
      const ns = { ...state };
      ns.supplierSubmissions = state.supplierSubmissions.map((s) => (s.id === action.id ? { ...s, status: action.status } : s));
      log(ns, `Supplier price submission ${action.id} marked "${action.status}" by AJ-PROXIS Control Centre.`);
      return ns;
    }

    /* -------------------------- Feature 1: Help & Support Tickets (customer <-> Control Centre) -------------------------- */
    case "CREATE_TICKET": {
      const ns = { ...state };
      const cust = state.customers.find((c) => c.id === action.customerId) || state.customers[0];
      const id = genId("tkt");
      const ticket = {
        id, customerId: cust.id, orgName: cust.name,
        subject: action.subject, category: action.category, priority: action.priority,
        status: "Open", createdAt: new Date().toISOString().slice(0, 10),
        messages: [{ from: "customer", text: action.message, at: new Date().toISOString() }],
      };
      ns.supportTickets = [ticket, ...state.supportTickets];
      log(ns, `Support ticket ${id} opened by ${cust.name}: "${action.subject}".`);
      notify(ns, `New support ticket ${id} from ${cust.name} needs a response.`, "admin");
      return ns;
    }

    case "REPLY_TICKET": {
      const ns = { ...state };
      ns.supportTickets = state.supportTickets.map((t) => {
        if (t.id !== action.id) return t;
        const messages = [...t.messages, { from: action.from, text: action.text, at: new Date().toISOString() }];
        let status = t.status;
        if (action.from === "support" && status === "Open") status = "In Progress";
        if (action.from === "customer" && status === "Resolved") status = "Open";
        return { ...t, messages, status };
      });
      if (action.from === "support") {
        log(ns, `AJ-PROXIS Control Centre replied to ticket ${action.id}.`);
        notify(ns, `AJ-PROXIS replied to your ticket ${action.id}.`);
      } else {
        log(ns, `Customer replied to ticket ${action.id}.`);
        notify(ns, `New customer reply on ticket ${action.id}.`, "admin");
      }
      return ns;
    }

    case "UPDATE_TICKET_STATUS": {
      const ns = { ...state };
      ns.supportTickets = state.supportTickets.map((t) => (t.id === action.id ? { ...t, status: action.status } : t));
      log(ns, `Ticket ${action.id} marked "${action.status}" by AJ-PROXIS Control Centre.`);
      return ns;
    }

    /* -------------------------- Feature 2: Ratings & Reviews (customer <-> Control Centre) -------------------------- */
    case "SUBMIT_REVIEW": {
      const ns = { ...state };
      const cust = state.customers.find((c) => c.id === action.customerId) || state.customers[0];
      const id = genId("rev");
      const review = {
        id, customerId: cust.id, orgName: cust.name, orderId: action.orderId,
        rating: action.rating, comment: action.comment, response: null,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      ns.reviews = [review, ...state.reviews];
      log(ns, `${cust.name} rated order ${action.orderId} — ${action.rating}/5.`);
      notify(ns, `New ${action.rating}★ review from ${cust.name} on order ${action.orderId}.`, "admin");
      return ns;
    }

    case "RESPOND_REVIEW": {
      const ns = { ...state };
      ns.reviews = state.reviews.map((r) => (r.id === action.id ? { ...r, response: action.response } : r));
      log(ns, `AJ-PROXIS Control Centre responded to review ${action.id}.`);
      notify(ns, `AJ-PROXIS responded to your review ${action.id}.`);
      return ns;
    }

    /* -------------------------- Feature 3: Compliance Document Vault (customer <-> Control Centre) -------------------------- */
    case "UPLOAD_COMPLIANCE_DOC": {
      const ns = { ...state };
      const cust = state.customers.find((c) => c.id === action.customerId) || state.customers[0];
      const id = genId("cmp");
      const doc = {
        id, customerId: cust.id, orgName: cust.name,
        docType: action.docType, fileName: action.fileName, expiryDate: action.expiryDate || "",
        status: "Pending Review", note: "", uploadedAt: new Date().toISOString().slice(0, 10),
      };
      ns.complianceDocs = [doc, ...state.complianceDocs];
      log(ns, `${cust.name} uploaded a compliance document (${action.docType}) for Control Centre review.`);
      notify(ns, `New compliance document from ${cust.name}: ${action.docType}.`, "admin");
      return ns;
    }

    case "REVIEW_COMPLIANCE_DOC": {
      const ns = { ...state };
      ns.complianceDocs = state.complianceDocs.map((d) => (d.id === action.id ? { ...d, status: action.status, note: action.note || "" } : d));
      log(ns, `Compliance document ${action.id} marked "${action.status}" by AJ-PROXIS Control Centre.`);
      notify(ns, `Your compliance document ${action.id} was marked "${action.status}".`);
      return ns;
    }

    case "MARK_NOTIFS_READ": {
      const ns = { ...state };
      ns.notifications = state.notifications.map((n) => ((n.scope || "customer") === action.portal ? { ...n, read: true } : n));
      return ns;
    }

    case "EMAIL_DOCUMENT": {
      const ns = { ...state };
      log(ns, `${action.kind} ${action.docId} emailed to ${action.to}.`);
      notify(ns, `${action.kind} ${action.docId} was sent to ${action.to}.`);
      return ns;
    }

    case "LOG_DOCUMENT_DOWNLOAD": {
      const ns = { ...state };
      log(ns, `${action.kind} ${action.docId} downloaded.`);
      return ns;
    }

    /* ---------------------------- auth & accounts ---------------------------- */
    case "SIGNUP_CUSTOMER": {
      const ns = { ...state };
      const id = "ORG-" + pad(state.customers.length + 1, 4);
      const acc = {
        id, name: action.payload.orgName, type: action.payload.orgType, tier: "corporate",
        contact: action.payload.contact, email: action.payload.email, phone: action.payload.phone,
        billingAddress: action.payload.billingAddress, deliveryAddress: action.payload.deliveryAddress,
        gps: "Not yet set", vat: "Pending", creditLimit: 0, budgetAnnual: 0,
        password: action.payload.password, status: "Pending",
      };
      ns.customers = [...state.customers, acc];
      log(ns, `New customer registration: ${acc.name} — awaiting Control Centre approval.`);
      log(ns, `Confirmation email sent instantly to ${acc.email} for registration ${id}.`);
      notify(ns, `New customer signup: ${acc.name} needs approval.`, "admin");
      return ns;
    }

    case "SIGNUP_SUPPLIER": {
      const ns = { ...state };
      const id = "S" + pad(state.suppliers.length + 1, 3);
      const acc = {
        id, name: action.payload.name, categories: [action.payload.category], location: action.payload.location,
        email: action.payload.email, phone: action.payload.phone, contact: action.payload.email,
        password: action.payload.password, status: "Pending",
        leadTime: 5, reliability: 80, quality: 80, delivery: 80,
      };
      ns.suppliers = [...state.suppliers, acc];
      log(ns, `New supplier registration: ${acc.name} — awaiting Control Centre approval.`);
      notify(ns, `New supplier signup: ${acc.name} needs approval.`, "admin");
      return ns;
    }

    case "SIGNUP_STAFF": {
      const ns = { ...state };
      const id = "STF-" + pad(state.staff.length + 1, 3);
      const acc = { id, name: action.payload.name, email: action.payload.email, role: action.payload.role, password: action.payload.password, status: "Pending" };
      ns.staff = [...state.staff, acc];
      log(ns, `New Control Centre staff registration: ${acc.name} (${acc.role}) — awaiting Super Administrator approval.`);
      notify(ns, `New staff signup: ${acc.name} needs approval.`, "admin");
      return ns;
    }

    case "APPROVE_ACCOUNT": {
      const ns = { ...state };
      const okStatus = action.portal === "supplier" ? "Approved" : "Active";
      if (action.portal === "customer") {
        const today = new Date().toISOString().slice(0, 10);
        ns.customers = state.customers.map((c) => (c.id === action.id ? {
          ...c, status: okStatus,
          creditLimit: c.creditLimit || 20000,
          budgetAnnual: c.budgetAnnual || 200000,
          gps: c.gps === "Not yet set" ? "Pending GPS pin" : c.gps,
          vat: c.vat === "Pending" ? "GH-VAT-" + Math.floor(100000 + Math.random() * 900000) : c.vat,
          certificateId: c.certificateId || genId("cert"),
          certificateIssuedAt: c.certificateIssuedAt || today,
          certificateExpiresAt: c.certificateExpiresAt || addOneYear(today),
          loyaltyPoints: c.loyaltyPoints ?? 0,
          savedLocations: c.savedLocations || [],
        } : c));
      }
      if (action.portal === "supplier") {
        const today = new Date().toISOString().slice(0, 10);
        ns.suppliers = state.suppliers.map((s) => (s.id === action.id ? {
          ...s, status: okStatus,
          vendorCertificateId: s.vendorCertificateId || genId("vcert"),
          vendorCertificateIssuedAt: s.vendorCertificateIssuedAt || today,
        } : s));
      }
      if (action.portal === "staff") ns.staff = state.staff.map((s) => (s.id === action.id ? { ...s, status: okStatus } : s));
      log(ns, `${action.portal[0].toUpperCase()}${action.portal.slice(1)} account ${action.id} approved.`);
      if (action.portal === "customer") log(ns, `Registration certificate issued for customer ${action.id}, valid for one year.`);
      if (action.portal === "supplier") log(ns, `Vendor certificate issued for supplier ${action.id}.`);
      return ns;
    }

    case "REJECT_ACCOUNT": {
      const ns = { ...state };
      if (action.portal === "customer") ns.customers = state.customers.map((c) => (c.id === action.id ? { ...c, status: "Rejected" } : c));
      if (action.portal === "supplier") ns.suppliers = state.suppliers.map((s) => (s.id === action.id ? { ...s, status: "Rejected" } : s));
      if (action.portal === "staff") ns.staff = state.staff.map((s) => (s.id === action.id ? { ...s, status: "Rejected" } : s));
      log(ns, `${action.portal[0].toUpperCase()}${action.portal.slice(1)} account ${action.id} rejected.`);
      return ns;
    }

    /* -------------------- Control Centre staff & role management (Super Administrator) -------------------- */
    case "ADD_STAFF_DIRECT": {
      const ns = { ...state };
      const id = "STF-" + pad(state.staff.length + 1, 3);
      const acc = {
        id, name: action.payload.name.trim(), email: action.payload.email.trim(), role: action.payload.role,
        password: (action.payload.password || "changeme123").trim(), status: "Active", isSuperAdmin: !!action.payload.isSuperAdmin,
        features: null,
      };
      ns.staff = [...state.staff, acc];
      log(ns, `${acc.name} added directly to AJ-PROXIS Control Centre as ${acc.role} by the Super Administrator — can sign in immediately with ${acc.email}.`);
      notify(ns, `${acc.name} was added to AJ-PROXIS Control Centre and can log in now.`, "admin");
      return ns;
    }

    case "UPDATE_STAFF": {
      const ns = { ...state };
      const patch = { ...action.patch };
      if (typeof patch.email === "string") patch.email = patch.email.trim();
      if (typeof patch.password === "string" && patch.password) patch.password = patch.password.trim();
      ns.staff = state.staff.map((s) => (s.id === action.id ? { ...s, ...patch } : s));
      const updated = ns.staff.find((s) => s.id === action.id);
      log(ns, `${updated?.name}'s Control Centre role/access updated to "${updated?.role}" by the Super Administrator.`);
      return ns;
    }

    case "UPDATE_STAFF_FEATURES": {
      const ns = { ...state };
      ns.staff = state.staff.map((s) => (s.id === action.id ? { ...s, features: action.features } : s));
      const updated = ns.staff.find((s) => s.id === action.id);
      log(ns, `Control Centre portal menu for ${updated?.name} updated by the Super Administrator.`);
      notify(ns, `Your Control Centre menu was updated by the Super Administrator.`, "admin");
      return ns;
    }

    case "DELETE_STAFF": {
      const ns = { ...state };
      if (action.id === state.session.accountId) {
        log(ns, `Blocked attempt to delete the currently signed-in Control Centre account (${action.id}).`);
        return ns;
      }
      const removed = state.staff.find((s) => s.id === action.id);
      ns.staff = state.staff.filter((s) => s.id !== action.id);
      log(ns, `${removed?.name || action.id} removed from AJ-PROXIS Control Centre by the Super Administrator.`);
      return ns;
    }

    case "ADD_INTERNAL_ROLE": {
      const ns = { ...state };
      ns.internalRoles = [...state.internalRoles, { role: action.role, scope: action.scope }];
      log(ns, `New Control Centre role "${action.role}" added by the Super Administrator.`);
      return ns;
    }

    case "UPDATE_INTERNAL_ROLE": {
      const ns = { ...state };
      ns.internalRoles = state.internalRoles.map((r) => (r.role === action.originalRole ? { role: action.role, scope: action.scope } : r));
      if (action.originalRole !== action.role) {
        ns.staff = state.staff.map((s) => (s.role === action.originalRole ? { ...s, role: action.role } : s));
      }
      log(ns, `Control Centre role "${action.originalRole}" updated by the Super Administrator.`);
      return ns;
    }

    case "DELETE_INTERNAL_ROLE": {
      const ns = { ...state };
      if (action.role === "Super Administrator") {
        log(ns, `Blocked attempt to delete the Super Administrator role.`);
        return ns;
      }
      ns.internalRoles = state.internalRoles.filter((r) => r.role !== action.role);
      log(ns, `Control Centre role "${action.role}" removed by the Super Administrator.`);
      return ns;
    }

    /* -------------------------- Password reset requests & Super Administrator resets -------------------------- */
    case "REQUEST_PASSWORD_RESET": {
      const ns = { ...state };
      const id = "PWR-" + pad(state.passwordResets.length + 1, 5);
      const req = {
        id, portal: action.portal, accountId: action.accountId, identifier: action.identifier,
        accountName: action.accountName, status: "Pending",
        requestedAt: new Date().toISOString().slice(0, 10),
      };
      ns.passwordResets = [req, ...state.passwordResets];
      log(ns, `Password reset requested for ${action.accountName} (${action.portal}) — ${id}.`);
      notify(ns, `New password reset request: ${action.accountName} (${action.portal}).`, "admin");
      return ns;
    }

    case "RESET_ACCOUNT_PASSWORD": {
      const ns = { ...state };
      const { portal, accountId, newPassword, resolvedBy, requestId } = action;
      if (portal === "customer") ns.customers = state.customers.map((c) => (c.id === accountId ? { ...c, password: newPassword } : c));
      if (portal === "supplier") ns.suppliers = state.suppliers.map((s) => (s.id === accountId ? { ...s, password: newPassword } : s));
      if (portal === "staff") ns.staff = state.staff.map((s) => (s.id === accountId ? { ...s, password: newPassword } : s));
      if (portal === "orgUser") ns.orgUsers = state.orgUsers.map((u) => (u.id === accountId ? { ...u, password: newPassword } : u));
      if (requestId) {
        ns.passwordResets = state.passwordResets.map((r) => (r.id === requestId ? { ...r, status: "Resolved", resolvedAt: new Date().toISOString().slice(0, 10), resolvedBy } : r));
      } else {
        const id = "PWR-" + pad(state.passwordResets.length + 1, 5);
        ns.passwordResets = [{ id, portal, accountId, identifier: "", accountName: action.accountName, status: "Resolved", requestedAt: new Date().toISOString().slice(0, 10), resolvedAt: new Date().toISOString().slice(0, 10), resolvedBy }, ...state.passwordResets];
      }
      log(ns, `Password reset by ${resolvedBy} for ${action.accountName} (${portal}).`);
      notify(ns, `Your password was reset by AJ-PROXIS Control Centre. Use your new password to log in.`, portal === "staff" ? "admin" : portal === "supplier" ? "supplier" : "customer");
      return ns;
    }

    /* -------------------------- Registration certificate renewal & access control -------------------------- */
    case "SET_REGISTRATION_FEE": {
      const ns = { ...state };
      ns.registrationFee = Number(action.fee) || state.registrationFee;
      log(ns, `Annual registration renewal fee set to ${GHS(ns.registrationFee)} by the Super Administrator.`);
      return ns;
    }

    case "PAY_CERTIFICATE_RENEWAL": {
      const ns = { ...state };
      const cust = state.customers.find((c) => c.id === action.customerId);
      if (!cust) return ns;
      const today = new Date().toISOString().slice(0, 10);
      const newExpiry = addOneYear(today);
      ns.customers = state.customers.map((c) => (c.id === action.customerId ? { ...c, certificateExpiresAt: newExpiry } : c));
      if (action.paymentMethod === "wallet") {
        ns.wallet = {
          balance: state.wallet.balance - state.registrationFee,
          transactions: [{ id: uid(), date: today, type: `Registration Renewal (${cust.certificateId})`, amount: -state.registrationFee }, ...state.wallet.transactions],
        };
      }
      log(ns, `${cust.name} paid ${GHS(state.registrationFee)} via ${action.paymentMethod} to renew registration certificate ${cust.certificateId} — valid until ${newExpiry}.`);
      notify(ns, `Registration renewed! Your certificate is now valid until ${newExpiry} and full access is restored.`);
      return ns;
    }

    case "GRANT_ACCESS_MANUAL": {
      const ns = { ...state };
      const cust = state.customers.find((c) => c.id === action.customerId);
      if (!cust) return ns;
      const newExpiry = addOneYear(new Date().toISOString().slice(0, 10));
      ns.customers = state.customers.map((c) => (c.id === action.customerId ? { ...c, certificateExpiresAt: newExpiry } : c));
      log(ns, `Access manually granted to ${cust.name} by Super Administrator ${action.grantedBy} — no renewal fee charged. Certificate now valid until ${newExpiry}.`);
      notify(ns, `AJ-PROXIS Control Centre has restored your access. Your certificate is now valid until ${newExpiry}.`);
      return ns;
    }

    /* -------------------------- Loyalty Rewards -------------------------- */
    case "REDEEM_LOYALTY_POINTS": {
      const ns = { ...state };
      const cust = state.customers.find((c) => c.id === action.customerId);
      if (!cust || (cust.loyaltyPoints || 0) < action.points || action.points <= 0) return ns;
      const credit = Math.floor(action.points / state.redemptionRate);
      ns.customers = state.customers.map((c) => (c.id === action.customerId ? { ...c, loyaltyPoints: c.loyaltyPoints - action.points } : c));
      ns.wallet = {
        balance: state.wallet.balance + credit,
        transactions: [{ id: uid(), date: new Date().toISOString().slice(0, 10), type: `Loyalty Points Redeemed (${action.points} pts)`, amount: credit }, ...state.wallet.transactions],
      };
      log(ns, `${cust.name} redeemed ${action.points} loyalty points for ${GHS(credit)} wallet credit.`);
      notify(ns, `${GHS(credit)} credited to your wallet from ${action.points} loyalty points.`);
      return ns;
    }

    case "SET_LOYALTY_RATES": {
      const ns = { ...state };
      ns.loyaltyRate = Number(action.loyaltyRate) || state.loyaltyRate;
      ns.redemptionRate = Number(action.redemptionRate) || state.redemptionRate;
      log(ns, `Loyalty program rates updated by the Super Administrator: earn 1 point per ${GHS(ns.loyaltyRate)} spent, redeem ${ns.redemptionRate} points per GHS 1.`);
      return ns;
    }

    /* -------------------------- Announcements (Control Centre → Customers) -------------------------- */
    case "POST_ANNOUNCEMENT": {
      const ns = { ...state };
      const ann = {
        id: "ANN-" + pad(state.announcements.length + 1, 4),
        title: action.title, message: action.message, urgency: action.urgency || "Normal",
        postedBy: action.postedBy, postedAt: new Date().toISOString().slice(0, 10),
      };
      ns.announcements = [ann, ...state.announcements];
      log(ns, `Announcement "${ann.title}" posted by ${ann.postedBy}.`);
      notify(ns, `New announcement: ${ann.title}`);
      return ns;
    }

    case "DELETE_ANNOUNCEMENT": {
      const ns = { ...state };
      ns.announcements = state.announcements.filter((a) => a.id !== action.id);
      log(ns, `Announcement ${action.id} removed by the Super Administrator.`);
      return ns;
    }

    /* -------------------------- Credit & Budget Increase Requests -------------------------- */
    case "REQUEST_CREDIT_INCREASE": {
      const ns = { ...state };
      const cust = state.customers.find((c) => c.id === action.customerId);
      if (!cust) return ns;
      const id = "CR-" + pad(state.creditRequests.length + 1, 4);
      const reqObj = {
        id, customerId: cust.id, orgName: cust.name,
        currentLimit: cust.creditLimit, requestedLimit: Number(action.requestedLimit),
        currentBudget: cust.budgetAnnual, requestedBudget: Number(action.requestedBudget) || cust.budgetAnnual,
        reason: action.reason, status: "Pending", requestedAt: nowStamp(),
      };
      ns.creditRequests = [reqObj, ...state.creditRequests];
      log(ns, `${cust.name} requested a credit limit increase to ${GHS(reqObj.requestedLimit)} (${id}).`);
      notify(ns, `Credit increase request ${id} submitted to AJ-PROXIS Control Centre.`, "admin");
      return ns;
    }

    case "DECIDE_CREDIT_REQUEST": {
      const ns = { ...state };
      const reqObj = state.creditRequests.find((r) => r.id === action.id);
      if (!reqObj) return ns;
      ns.creditRequests = state.creditRequests.map((r) => (r.id === action.id ? { ...r, status: action.decision, decidedBy: action.decidedBy, decidedAt: new Date().toISOString().slice(0, 10) } : r));
      if (action.decision === "Approved") {
        ns.customers = state.customers.map((c) => (c.id === reqObj.customerId ? { ...c, creditLimit: reqObj.requestedLimit, budgetAnnual: reqObj.requestedBudget || c.budgetAnnual } : c));
      }
      log(ns, `Credit request ${action.id} ${action.decision.toLowerCase()} by ${action.decidedBy}.`);
      notify(ns, `Your credit request ${action.id} was ${action.decision.toLowerCase()}.`);
      return ns;
    }

    /* -------------------------- Saved Delivery Locations -------------------------- */
    case "ADD_SAVED_LOCATION": {
      const ns = { ...state };
      const cust = state.customers.find((c) => c.id === action.customerId);
      if (!cust) return ns;
      const loc = { id: "LOC-" + pad((cust.savedLocations || []).length + 1, 4), label: action.label, address: action.address, lat: action.lat, lon: action.lon };
      ns.customers = state.customers.map((c) => (c.id === action.customerId ? { ...c, savedLocations: [...(c.savedLocations || []), loc] } : c));
      log(ns, `${cust.name} saved a new delivery location: "${loc.label}".`);
      return ns;
    }

    case "DELETE_SAVED_LOCATION": {
      const ns = { ...state };
      ns.customers = state.customers.map((c) => (c.id === action.customerId ? { ...c, savedLocations: (c.savedLocations || []).filter((l) => l.id !== action.locId) } : c));
      return ns;
    }

    /* -------------------------- AI Market Price Intelligence -------------------------- */
    case "SAVE_AI_PRICE_ANALYSIS": {
      const ns = { ...state };
      const id = "PA-" + pad(state.priceAnalyses.length + 1, 5);
      const entry = {
        id, supplierId: action.supplierId || null, supplierName: action.supplierName || null,
        submissionId: action.submissionId || null, itemName: action.itemName, category: action.category,
        supplierPrice: action.supplierPrice, aiMarketLow: action.aiMarketLow, aiMarketHigh: action.aiMarketHigh,
        aiSuggestedPrice: action.aiSuggestedPrice, aiRationale: action.aiRationale,
        status: "Pending Review", createdAt: new Date().toISOString().slice(0, 10),
      };
      ns.priceAnalyses = [entry, ...state.priceAnalyses];
      log(ns, `AI market price analysis run for "${entry.itemName}" — supplier priced at ${GHS(entry.supplierPrice)}, AI suggests ${GHS(entry.aiSuggestedPrice)}.`);
      return ns;
    }

    case "APPROVE_AI_PRICE_ANALYSIS": {
      const ns = { ...state };
      const a = state.priceAnalyses.find((p) => p.id === action.id);
      if (!a) return ns;
      ns.priceAnalyses = state.priceAnalyses.map((p) => (p.id === action.id ? { ...p, status: "Approved", decidedBy: action.decidedBy, decidedAt: new Date().toISOString().slice(0, 10) } : p));
      const match = state.products.find((pr) => pr.name.toLowerCase().includes(a.itemName.toLowerCase()) || a.itemName.toLowerCase().includes(pr.name.toLowerCase()));
      if (match) {
        // Guard against a zero/invalid current price so the tiered prices never corrupt to NaN or Infinity.
        const ratio = match.price > 0 ? a.aiSuggestedPrice / match.price : 1;
        // Replacing the whole products array (a new array reference) is what makes every catalogue
        // view across every portal — Customer Catalogue, Cart, Control Centre Catalogue, RFQ/Custom
        // Request quoting, and Supplier Catalogue Pricing — re-render with the new price immediately,
        // since they all read live from state.products rather than a cached copy.
        ns.products = state.products.map((pr) => (pr.id === match.id ? {
          ...pr, price: a.aiSuggestedPrice,
          corpPrice: Math.max(1, Math.round(pr.corpPrice * ratio)),
          bulkPrice: Math.max(1, Math.round(pr.bulkPrice * ratio)),
        } : pr));
        log(ns, `AI-suggested price ${GHS(a.aiSuggestedPrice)} for "${a.itemName}" approved by ${action.decidedBy} and applied to catalogue item "${match.name}" — now live across every portal's catalogue.`);
        notify(ns, `${match.name} is now priced at ${GHS(a.aiSuggestedPrice)} in the catalogue.`, "customer");
      } else {
        log(ns, `AI-suggested price ${GHS(a.aiSuggestedPrice)} for "${a.itemName}" approved by ${action.decidedBy} — no matching catalogue item found to update.`);
      }
      return ns;
    }

    case "DISMISS_AI_PRICE_ANALYSIS": {
      const ns = { ...state };
      ns.priceAnalyses = state.priceAnalyses.map((p) => (p.id === action.id ? { ...p, status: "Dismissed" } : p));
      log(ns, `AI price analysis ${action.id} dismissed.`);
      return ns;
    }

    /* -------------------------- Event Tickets (cap-enforced) -------------------------- */
    case "ISSUE_EVENT_TICKET": {
      const ns = { ...state };
      const issuedForEvent = state.eventTickets.filter((t) => t.eventId === action.eventId).length;
      if (issuedForEvent >= action.cap) {
        log(ns, `Blocked ticket issue for ${action.eventId} — event is sold out (cap ${action.cap}).`);
        return ns;
      }
      const entry = {
        id: action.id, eventId: action.eventId, eventTitle: action.eventTitle,
        name: action.name, email: action.email,
        priceCategory: action.priceCategory, amountPaid: action.amountPaid, paymentMethod: action.paymentMethod,
        issuedAt: nowStamp(),
      };
      ns.eventTickets = [entry, ...state.eventTickets];
      log(ns, `Event ticket ${entry.id} issued for "${entry.eventTitle}" (${entry.priceCategory}) to ${entry.name}.`);
      return ns;
    }

    /* -------------------------- Up-coming Events management (Control Centre) -------------------------- */
    case "ADD_EVENT": {
      const ns = { ...state };
      const id = "EVT-" + pad(state.events.length + 1, 3);
      const event = { id, ...action.payload };
      ns.events = [...state.events, event];
      log(ns, `Event "${event.title}" (${id}) created by AJ-PROXIS Control Centre.`);
      return ns;
    }

    case "UPDATE_EVENT": {
      const ns = { ...state };
      ns.events = state.events.map((e) => (e.id === action.id ? { ...e, ...action.payload } : e));
      log(ns, `Event ${action.id} updated by AJ-PROXIS Control Centre.`);
      return ns;
    }

    case "DELETE_EVENT": {
      const ns = { ...state };
      ns.events = state.events.filter((e) => e.id !== action.id);
      log(ns, `Event ${action.id} removed by AJ-PROXIS Control Centre.`);
      return ns;
    }

    /* -------------------------- Company Dropdown Menu management (Super Administrator) -------------------------- */
    case "ADD_COMPANY_MENU_ITEM": {
      const ns = { ...state };
      const item = { id: "cmi-" + uid(), visible: true, ...action.payload };
      ns.companyMenuItems = [...state.companyMenuItems, item];
      log(ns, `Company menu item "${item.label}" added by the Super Administrator.`);
      return ns;
    }

    case "UPDATE_COMPANY_MENU_ITEM": {
      const ns = { ...state };
      ns.companyMenuItems = state.companyMenuItems.map((i) => (i.id === action.id ? { ...i, ...action.patch } : i));
      log(ns, `Company menu item ${action.id} updated by the Super Administrator.`);
      return ns;
    }

    case "DELETE_COMPANY_MENU_ITEM": {
      const ns = { ...state };
      ns.companyMenuItems = state.companyMenuItems.filter((i) => i.id !== action.id);
      log(ns, `Company menu item ${action.id} removed by the Super Administrator.`);
      return ns;
    }

    case "RESTORE_DEFAULT_COMPANY_MENU": {
      const ns = { ...state };
      ns.companyMenuItems = DEFAULT_COMPANY_MENU_ITEMS.map((i) => ({ ...i }));
      log(ns, `Company menu restored to defaults by the Super Administrator.`);
      return ns;
    }

    /* -------------------------- Company page content management (Super Administrator) -------------------------- */
    case "UPDATE_COMPANY_CONTENT": {
      const ns = { ...state };
      ns.companyContent = { ...state.companyContent, ...action.patch };
      log(ns, `Company page content updated by the Super Administrator.`);
      return ns;
    }

    case "UPDATE_COMPANY_DOCUMENT": {
      const ns = { ...state };
      ns.companyContent = {
        ...state.companyContent,
        documents: { ...state.companyContent.documents, [action.key]: { ...state.companyContent.documents[action.key], ...action.patch } },
      };
      log(ns, `"${action.key}" document updated by the Super Administrator.`);
      return ns;
    }

    case "ADD_TEAM_MEMBER": {
      const ns = { ...state };
      const member = { id: "tm-" + uid(), ...action.payload };
      ns.companyContent = { ...state.companyContent, team: [...state.companyContent.team, member] };
      log(ns, `Team member "${member.name}" added by the Super Administrator.`);
      return ns;
    }

    case "UPDATE_TEAM_MEMBER": {
      const ns = { ...state };
      ns.companyContent = { ...state.companyContent, team: state.companyContent.team.map((m) => (m.id === action.id ? { ...m, ...action.patch } : m)) };
      log(ns, `Team member ${action.id} updated by the Super Administrator.`);
      return ns;
    }

    case "DELETE_TEAM_MEMBER": {
      const ns = { ...state };
      ns.companyContent = { ...state.companyContent, team: state.companyContent.team.filter((m) => m.id !== action.id) };
      log(ns, `Team member ${action.id} removed by the Super Administrator.`);
      return ns;
    }

    case "RESTORE_DEFAULT_COMPANY_CONTENT": {
      const ns = { ...state };
      ns.companyContent = JSON.parse(JSON.stringify(DEFAULT_COMPANY_CONTENT));
      log(ns, `Company page content restored to defaults by the Super Administrator.`);
      return ns;
    }

    /* -------------------------- AJ-PROXIS Foundation (Super Administrator) -------------------------- */
    case "RECORD_FOUNDATION_DISBURSEMENT": {
      const ns = { ...state };
      const totalRaised = state.foundation.contributions.reduce((s, c) => s + c.amount, 0);
      const totalDisbursed = state.foundation.disbursements.reduce((s, d) => s + d.amount, 0);
      const available = totalRaised - totalDisbursed;
      if (Number(action.amount) > available) {
        log(ns, `Blocked Foundation disbursement of ${GHS(action.amount)} — exceeds available balance of ${GHS(available)}.`);
        return ns;
      }
      const id = "AJF-" + pad(state.foundation.disbursements.length + 1, 4);
      const disbursement = {
        id, recipient: action.recipient, purpose: action.purpose, amount: Number(action.amount) || 0,
        approvedBy: action.approvedBy, date: new Date().toISOString().slice(0, 10),
      };
      ns.foundation = { ...state.foundation, disbursements: [disbursement, ...state.foundation.disbursements] };
      log(ns, `AJ-PROXIS Foundation disbursed ${GHS(disbursement.amount)} to ${disbursement.recipient} for "${disbursement.purpose}", approved by ${disbursement.approvedBy}.`);
      return ns;
    }

    case "HYDRATE": {
      // Merge saved data over the current defaults so any fields added to the app
      // after a user's data was last saved (e.g. newer features) don't come back
      // as `undefined` and crash the app — they just fall back to a sensible default.
      const merged = { ...initialState, ...action.payload };
      merged.session = { ...initialState.session, ...(action.payload.session || {}) };
      merged.wallet = { ...initialState.wallet, ...(action.payload.wallet || {}) };
      merged.budget = { ...initialState.budget, ...(action.payload.budget || {}) };
      merged.foundation = { ...initialState.foundation, ...(action.payload.foundation || {}) };
      // Repair orders saved before delivered quantities were tracked consistently:
      // if an order's overall status is Delivered, every item should show as delivered too.
      merged.orders = (merged.orders || []).map((o) => {
        if (o.deliveryStatus !== "Delivered") return o;
        const fixed = { ...(o.deliveredItems || {}) };
        let changed = false;
        (o.items || []).forEach((it) => { if ((fixed[it.name] || 0) < it.qty) { fixed[it.name] = it.qty; changed = true; } });
        return changed ? { ...o, deliveredItems: fixed } : o;
      });
      return merged;
    }

    case "LOGIN":
      return { ...state, session: { portal: action.portal, accountId: action.accountId, adminReturn: null, actingUserId: null, staffVerified: false } };

    case "LOGOUT":
      return { ...state, session: { portal: null, accountId: null, adminReturn: null, actingUserId: null, staffVerified: false } };

    case "VIEW_AS": {
      const ns = { ...state };
      const cust = state.customers.find((c) => c.id === action.accountId);
      ns.session = { portal: action.portal, accountId: action.accountId, adminReturn: { portal: state.session.portal, accountId: state.session.accountId }, actingUserId: "U2", staffVerified: true };
      log(ns, `Control Centre opened ${cust ? cust.name : action.accountId}'s customer portal directly.`);
      return ns;
    }

    case "EXIT_VIEW_AS": {
      const ret = state.session.adminReturn || { portal: null, accountId: null };
      return { ...state, session: { portal: ret.portal, accountId: ret.accountId, adminReturn: null, actingUserId: null, staffVerified: false } };
    }

    case "STAFF_SIGN_IN": {
      const ns = { ...state };
      const user = state.orgUsers.find((u) => u.id === action.userId);
      ns.session = { ...state.session, actingUserId: action.userId, staffVerified: true };
      log(ns, `${user?.name} (${user?.role}) signed in to the Customer Portal.`);
      return ns;
    }

    case "STAFF_SIGN_OUT": {
      return { ...state, session: { ...state.session, actingUserId: null, staffVerified: false } };
    }

    case "ADD_ORG_USER": {
      const ns = { ...state };
      const nextNum = state.orgUsers.reduce((max, u) => Math.max(max, Number(String(u.id).replace(/\D/g, "")) || 0), 0) + 1;
      const id = "U" + nextNum;
      const user = {
        id, name: action.payload.name, role: action.payload.role, password: action.payload.password || "changeme123",
        isTopApprover: !!action.payload.isTopApprover, isPayer: !!action.payload.isPayer, isAdmin: !!action.payload.isAdmin,
        features: null,
      };
      ns.orgUsers = [...state.orgUsers, user];
      log(ns, `${user.name} added as ${user.role} by the organization Administrator.`);
      return ns;
    }

    case "UPDATE_ORG_USER": {
      const ns = { ...state };
      ns.orgUsers = state.orgUsers.map((u) => (u.id === action.id ? { ...u, ...action.patch } : u));
      const updated = ns.orgUsers.find((u) => u.id === action.id);
      log(ns, `${updated?.name}'s role/permissions updated to "${updated?.role}" by the organization Administrator.`);
      return ns;
    }

    case "UPDATE_USER_FEATURES": {
      const ns = { ...state };
      ns.orgUsers = state.orgUsers.map((u) => (u.id === action.id ? { ...u, features: action.features } : u));
      const updated = ns.orgUsers.find((u) => u.id === action.id);
      log(ns, `Portal features for ${updated?.name} updated by the organization Administrator.`);
      notify(ns, `Your portal menu was updated by your organization Administrator.`);
      return ns;
    }

    case "DELETE_ORG_USER": {
      const ns = { ...state };
      if (action.id === state.session.actingUserId) {
        log(ns, `Blocked attempt to delete the currently signed-in user (${action.id}).`);
        return ns;
      }
      const removed = state.orgUsers.find((u) => u.id === action.id);
      ns.orgUsers = state.orgUsers.filter((u) => u.id !== action.id);
      log(ns, `${removed?.name || action.id} removed from the organization by the Administrator.`);
      return ns;
    }

    default:
      return state;
  }
}

/* ------------------------------- context --------------------------------- */
