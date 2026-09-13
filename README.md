# AJ-PROXIS PROCURE

A React application implementing AJ-PROXIS Solutions' B2B procurement platform —
Customer Portal, AJ-PROXIS Control Centre, and Supplier Portal — structured by
[atomic design](https://bradfrost.com/blog/post/atomic-web-design/) principles.

## Getting Started

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

To build for production:

```bash
npm run build
npm run preview
```

## Project Structure

The app is organized by atomic-design layer rather than by portal, so shared pieces
(buttons, cards, the sidebar shell, the reducer) live in exactly one place and every
portal composes the same building blocks:

```
index.html              Vite entry HTML, loads Google Fonts (Inter, Space Grotesk)
src/main.jsx             React root + window.storage polyfill (see below)
src/App.jsx              Composition root: owns the store + picks landing/portal to render
src/index.css            Tailwind directives

src/atoms/               Smallest presentational primitives — Btn, Card, Badge, Field,
                         TextInput/TextArea/Select, SectionTitle, Stat. No app-state knowledge.
src/molecules/           Small combinations of atoms reused across >1 portal — Modal, Table,
                         Row, PaymentMethodFields, DocumentPreview, VendorCertificateModal,
                         QRCodeSVG.
src/templates/           Page-level layout shared by every portal — Shell (sidebar + header).
src/features/customer/   Customer Portal: every screen/organism plus CustomerPortal.jsx (page).
src/features/admin/      AJ-PROXIS Control Centre: every screen/organism plus AdminPortal.jsx.
src/features/supplier/   Supplier Portal (SupplierPortal.jsx).
src/features/auth/       Shared sign-in/sign-up screens used by all three portals.
src/features/company/    Public marketing site — Landing, CompanyPage, CompanyMenu.

src/store/               reducer.js (all state transitions + seed initialState), ids.js
                         (mutable uid counter), StoreContext.js (React context + useStore()/
                         useCustomer()/useStaff()/useSupplierAccount()/useActingUser() hooks).
src/data/                Seed/demo data — the ~500-item catalogue, supplier roster, org roles.
src/shared/              Cross-cutting, non-visual helpers — design tokens (tokens.js), brand
                         image assets (brandAssets.js), currency/tax/date math (helpers.js),
                         the Anthropic API calls (ai.js), the from-scratch QR encoder (qr.js),
                         and printable-document HTML builders (documents.js).

tailwind.config.js
postcss.config.js
vite.config.js
```

Each portal's top-level page (`CustomerPortal.jsx`, `AdminPortal.jsx`, `SupplierPortal.jsx`)
renders inside the shared `Shell` template and switches between that portal's organisms by
a `view` string kept in local state — the same pattern the original app used, just with each
screen now in its own file instead of one 9,000-line component.

## Important: things that behave differently outside Claude.ai

This app was originally built and tested as a single-file component running inside a
Claude.ai "artifact" sandbox. Two things in that sandbox are handled specially and need
attention when running this as a standalone app:

### 1. Persistence (`window.storage`) — already handled for you

Claude's artifact sandbox provides a `window.storage` API (get/set/delete/list) that
`src/App.jsx` (the composition root) uses to save and restore the entire app's state
between visits.

`src/main.jsx` includes a small polyfill that backs the exact same API with the browser's
`localStorage` when `window.storage` doesn't already exist — so persistence works
out of the box here too. No further action needed.

### 2. The in-app AI features — need your own backend wiring

Three features call the Anthropic API **directly from the browser**:

- **Ask AJ** (the customer-facing assistant chat)
- **AI Market Price Intelligence** (Control Centre & Supplier Portal)
- **AI Duplicate Catalogue Cleaner** (Control Centre)

Inside Claude.ai's artifact sandbox, these `fetch("https://api.anthropic.com/v1/messages", ...)`
calls are proxied automatically with no API key required. Running this app anywhere else,
that endpoint will reject the request (no key, and most browsers will hit a CORS error
calling it directly).

To make these three features work standalone, you have two options:

- **Simplest**: get an API key from [console.anthropic.com](https://console.anthropic.com),
  stand up a tiny backend endpoint (e.g. a serverless function) that forwards requests to
  `https://api.anthropic.com/v1/messages` with your key attached, and change the three
  `fetch(...)` call sites (`grep -rn api.anthropic.com src/`) — `src/shared/ai.js`
  (`fetchAiMarketPrice`, `fetchAiDuplicateAdvice`) and `src/features/customer/AskAJ.jsx` —
  to hit your endpoint instead of Anthropic's directly.
- Alternatively, swap those specific features for a different LLM provider/backend of your
  choice using the same request/response shape.

Everything else in the app (all three portals, all catalogue/order/payment/document/QR-ticket
features, etc.) runs entirely client-side and needs no backend.

## Tech Stack

- React 18 + Vite
- Tailwind CSS
- [lucide-react](https://lucide.dev/) for icons
- [recharts](https://recharts.org/) for charts
- A from-scratch, spec-compliant QR code encoder (no external dependency) for event tickets

## Notes

- All application data (customers, orders, catalogue, suppliers, etc.) lives in React state,
  persisted via the storage mechanism above — there is no real database or backend by default.
  This is a functional prototype/demo, not a production deployment.
