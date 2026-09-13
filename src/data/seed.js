/* Seed/demo data: the ~500-item product catalogue, supplier roster (including 50 bulk-
   generated suppliers with 10,000 pending price submissions for scale-testing), category
   list, org roles, and the single demo customer organization. All in-memory — there is
   no real database. See reducer.js for how this seeds initialState. */

import {
  FileText, Boxes, ClipboardList, Building2, RefreshCcw, Factory, Handshake,
  BadgeCheck, Shield, Truck, PackageCheck, Sparkles,
} from "lucide-react";
import { pad } from "../shared/helpers.js";

export const WAREHOUSES = ["Accra", "Kumasi", "Takoradi", "Tamale"];

export const CATEGORIES = [
  { key: "office", label: "Office Supplies", icon: FileText },
  { key: "ict", label: "ICT & Electronics", icon: Boxes },
  { key: "school", label: "School Supplies", icon: ClipboardList },
  { key: "furniture", label: "Office Furniture", icon: Building2 },
  { key: "cleaning", label: "Cleaning & Janitorial", icon: RefreshCcw },
  { key: "construction", label: "Construction & Hardware", icon: Factory },
  { key: "hospitality", label: "Hospitality & Restaurant", icon: Handshake },
  { key: "branding", label: "Corporate Branding", icon: BadgeCheck },
  { key: "safety", label: "Safety & PPE", icon: Shield },
  { key: "fleet", label: "Logistics & Fleet", icon: Truck },
  { key: "medical", label: "Medical & Healthcare", icon: PackageCheck },
  { key: "events", label: "Events & Conference", icon: Sparkles },
];

export function seedProducts() {
  const rows = [
    ["office", "A4 Copier Paper (80gsm)", "Advance", "ream", 38, 34, 20, 30],
    ["office", "A3 Copier Paper (80gsm)", "Advance", "ream", 62, 56, 20, 50],
    ["office", "Ballpoint Pens (box of 50)", "BIC", "box", 45, 40, 10, 36],
    ["office", "Box Files", "Bantex", "piece", 18, 16, 50, 14],
    ["office", "Toner Cartridge HP 12A", "HP", "piece", 380, 350, 5, 320],
    ["office", "Sticky Notes 3x3", "Post-it", "pack", 22, 19, 24, 17],
    ["ict", "Laptop – Core i5 14th Gen", "HP", "unit", 6800, 6450, 5, 6100],
    ["ict", "Desktop PC – Core i5", "Dell", "unit", 5200, 4950, 5, 4700],
    ["ict", "24\" LED Monitor", "Samsung", "unit", 1250, 1150, 10, 1050],
    ["ict", "Laser Printer", "Canon", "unit", 2100, 1950, 5, 1800],
    ["ict", "8-Port Network Switch", "TP-Link", "unit", 480, 440, 5, 400],
    ["ict", "1.5KVA UPS", "APC", "unit", 1450, 1350, 5, 1250],
    ["ict", "CCTV Camera Kit (4-channel)", "Hikvision", "kit", 3600, 3350, 3, 3100],
    ["school", "Student Desk & Chair Set", "AJ-Furnish", "set", 420, 390, 50, 360],
    ["school", "Teacher's Desk", "AJ-Furnish", "unit", 780, 720, 10, 660],
    ["school", "Exercise Books (pack of 10)", "Manhyia", "pack", 32, 28, 50, 25],
    ["school", "Whiteboard 4x6 ft", "Boardex", "unit", 340, 310, 10, 285],
    ["school", "School Uniform Set", "AJ-Threads", "set", 160, 145, 100, 130],
    ["furniture", "Executive Desk", "AJ-Furnish", "unit", 2450, 2300, 5, 2100],
    ["furniture", "Ergonomic Office Chair", "AJ-Furnish", "unit", 890, 820, 10, 750],
    ["furniture", "Conference Table (10-seater)", "AJ-Furnish", "unit", 4200, 3950, 2, 3700],
    ["furniture", "Filing Cabinet 4-drawer", "AJ-Furnish", "unit", 980, 910, 5, 840],
    ["cleaning", "Multi-surface Disinfectant 5L", "Dettol", "can", 95, 86, 20, 78],
    ["cleaning", "Toilet Rolls (pack of 24)", "SoftCare", "pack", 68, 60, 30, 54],
    ["cleaning", "Industrial Mop & Bucket Set", "CleanPro", "set", 145, 132, 10, 120],
    ["cleaning", "Hand Sanitizer 5L", "PureGel", "can", 120, 108, 15, 98],
    ["construction", "Portland Cement 50kg", "GHACEM", "bag", 92, 86, 100, 80],
    ["construction", "Iron Rod 12mm (length)", "Wahome Steel", "piece", 68, 62, 200, 57],
    ["construction", "Emulsion Paint 20L", "Duco", "can", 480, 440, 10, 400],
    ["construction", "Roofing Sheets (Aluzinc)", "Metalex", "sheet", 140, 128, 50, 118],
    ["hospitality", "Stainless Cutlery Set (24pc)", "Chef's Choice", "set", 210, 190, 20, 172],
    ["hospitality", "Commercial Fridge 400L", "LG", "unit", 4200, 3950, 3, 3700],
    ["hospitality", "Banquet Chair", "EventPro", "unit", 145, 130, 50, 118],
    ["hospitality", "Chafing Dish Set", "Chef's Choice", "set", 320, 295, 10, 270],
    ["branding", "Corporate Polo Shirts", "AJ-Threads", "piece", 65, 58, 50, 52],
    ["branding", "Custom Diaries", "AJ-Print", "piece", 48, 42, 100, 37],
    ["branding", "Roll-up Banner", "AJ-Print", "unit", 320, 290, 5, 265],
    ["branding", "Branded Tote Bags", "AJ-Print", "piece", 22, 19, 200, 16],
    ["safety", "Safety Boots", "3M", "pair", 210, 190, 20, 172],
    ["safety", "Reflective Jacket", "3M", "piece", 85, 76, 30, 68],
    ["safety", "Safety Helmet", "3M", "piece", 65, 58, 30, 52],
    ["safety", "Fire Extinguisher 5kg", "Firex", "unit", 380, 350, 10, 320],
    ["fleet", "Vehicle GPS Tracker", "TrackIt", "unit", 480, 440, 10, 400],
    ["fleet", "Heavy-duty Tyre 265/65R17", "Michelin", "unit", 1450, 1350, 4, 1250],
    ["fleet", "Vehicle Battery 12V", "Exide", "unit", 780, 720, 5, 660],
    ["medical", "Examination Gloves (box 100)", "MedSafe", "box", 42, 38, 40, 34],
    ["medical", "Surgical Face Masks (box 50)", "MedSafe", "box", 36, 32, 40, 28],
    ["medical", "First-Aid Kit (Institutional)", "MedSafe", "kit", 260, 235, 15, 210],
    ["events", "Canopy Tent 6x9m", "EventPro", "unit", 3200, 2950, 3, 2700],
    ["events", "PA Sound System", "JBL", "set", 4800, 4500, 2, 4200],
    ["events", "Registration Kiosk Setup", "EventPro", "set", 1800, 1650, 3, 1500],
  ];

  /* -------- expand the catalogue to a full ~500-item range -------- */
  const CATEGORY_BANK = {
    office: { brands: ["Advance", "BIC", "Bantex", "Faber-Castell", "Staedtler", "Paper Mate", "Post-it", "Pilot", "3M", "Genmark"], unit: "piece", priceRange: [12, 480], items: ["A4 Copier Paper 70gsm", "A3 Copier Paper 80gsm", "Gel Pens", "Highlighters", "Whiteboard Markers", "Permanent Markers", "Sticky Notes 3x5", "Lever Arch Files", "Ring Binders", "Paper Clips", "Binder Clips", "Correction Tape", "Envelopes A5", "Rulers 30cm", "Glue Sticks", "Notebooks A5", "Office Diaries", "Desk Calculators", "Punching Machines", "Rubber Stamps", "HP Toner Cartridge", "Canon Ink Cartridge", "Index Cards", "Clipboards", "Document Trays", "Desk Organizers", "Name Badges", "Laminating Pouches A4", "Paper Shredders", "Paper Cutters", "Whiteboard Erasers", "Bulldog Clips"] },
    ict: { brands: ["HP", "Dell", "Lenovo", "Samsung", "Canon", "Epson", "TP-Link", "APC", "Logitech", "Asus", "Hikvision"], unit: "unit", priceRange: [180, 8500], items: ["Laptop Core i5 14th Gen", "Laptop Core i7 14th Gen", "Desktop PC Core i5", "24-inch LED Monitor", "27-inch LED Monitor", "Laser Printer", "Inkjet Printer", "Document Scanner", "16-Port Network Switch", "Wireless Router", "3KVA UPS", "2TB External Hard Drive", "64GB USB Flash Drive", "Wireless Mouse", "Wireless Keyboard", "HD Webcam", "Noise-Cancelling Headset", "LED Projector", "CCTV Camera Kit 8-Channel", "NVR Recorder 8-Channel", "Laptop Bag", "20000mAh Power Bank", "HDMI Cable 5m", "Cat6 Ethernet Cable 20m", "Surge Protector 6-Way", "Tower Server", "10-inch Tablet", "Bluetooth Speaker", "All-in-One PC", "Barcode Scanner", "Label Printer", "Solid State Drive 1TB"] },
    school: { brands: ["AJ-Furnish", "Manhyia", "AJ-Threads", "Boardex", "Genmark"], unit: "piece", priceRange: [15, 820], items: ["Student Desk & Chair Set", "Teacher's Desk", "Exercise Books Pack of 10", "Textbook Set", "School Bag", "School Uniform Set", "Whiteboard 4x6ft", "Chalkboard 4x6ft", "Chalk Box", "Classroom Globe", "Lab Coat", "Science Lab Kit", "Sports Kit", "Football", "Basketball", "Skipping Rope", "Library Shelf Unit", "Storybook Set", "Crayon Set", "Colored Pencil Set", "School Sandals", "Geometry Set", "Reading Chart"] },
    furniture: { brands: ["AJ-Furnish", "Genmark"], unit: "unit", priceRange: [280, 4800], items: ["Executive Desk", "Ergonomic Office Chair", "Conference Table 10-seater", "Filing Cabinet 4-drawer", "Bookshelf", "Reception Desk", "Sofa Set 3-seater", "Coffee Table", "Partition Screen", "Workstation Desk", "Visitor Chair", "Storage Cabinet", "Bar Stool", "TV Stand", "Wardrobe", "Shoe Rack"] },
    cleaning: { brands: ["Dettol", "SoftCare", "CleanPro", "PureGel", "Omo", "Harpic"], unit: "piece", priceRange: [15, 260], items: ["Multi-surface Disinfectant 5L", "Toilet Rolls Pack of 24", "Industrial Mop & Bucket Set", "Hand Sanitizer 5L", "Dish Soap 1L", "Floor Cleaner 5L", "Glass Cleaner 750ml", "Trash Bags Roll", "Air Freshener Spray", "Broom", "Dustpan Set", "Rubber Gloves Pack", "Bleach 1L", "Laundry Detergent 5kg", "Microfiber Cloth Pack", "Toilet Brush Set"] },
    construction: { brands: ["GHACEM", "Wahome Steel", "Duco", "Metalex", "Genmark"], unit: "piece", priceRange: [25, 620], items: ["Portland Cement 50kg", "Iron Rod 12mm", "Iron Rod 16mm", "Emulsion Paint 20L", "Gloss Paint 4L", "Roofing Sheets Aluzinc", "Plywood Sheet 8x4", "Sand per Ton", "Concrete Blocks", "Nails Assorted Box", "Wire Mesh Roll", "PVC Pipe 4-inch", "Electrical Cable Roll", "Ceiling Tile Pack", "Floor Tile Pack", "Paint Brush Set", "Wheelbarrow", "Spirit Level", "Measuring Tape 30m", "Safety Netting Roll"] },
    hospitality: { brands: ["Chef's Choice", "LG", "EventPro", "Genmark"], unit: "piece", priceRange: [40, 4600], items: ["Stainless Cutlery Set 24pc", "Commercial Fridge 400L", "Banquet Chair", "Chafing Dish Set", "Dinner Plate Set", "Wine Glass Set", "Table Linen Set", "Buffet Warmer", "Commercial Coffee Machine", "Heavy Duty Blender", "Commercial Gas Cooker", "Kitchen Utensil Set", "Serving Tray Set", "Ice Bucket", "Bar Counter Unit", "Menu Holder Set"] },
    branding: { brands: ["AJ-Threads", "AJ-Print", "Genmark"], unit: "piece", priceRange: [15, 340], items: ["Corporate Polo Shirts", "Custom Diaries", "Roll-up Banner", "Branded Tote Bags", "Branded Mugs", "Branded Pens", "Branded Caps", "Branded Umbrellas", "Business Cards Pack", "Flyers A5 Pack", "Vinyl Stickers Set", "ID Card with Lanyard", "Branded T-Shirts", "Branded Notepads", "Branded Key Holders", "Branded Water Bottles"] },
    safety: { brands: ["3M", "Firex", "MedSafe", "Genmark"], unit: "piece", priceRange: [20, 420], items: ["Safety Boots", "Reflective Jacket", "Safety Helmet", "Fire Extinguisher 5kg", "Safety Goggles", "Ear Muffs", "Dust Masks Pack", "Safety Gloves Pair", "First Aid Kit Institutional", "Safety Harness", "Traffic Cones Set", "Fire Blanket", "Safety Vest", "Hard Hat with Liner", "Eye Wash Station", "Warning Signage Set"] },
    fleet: { brands: ["TrackIt", "Michelin", "Exide", "Castrol", "Genmark"], unit: "unit", priceRange: [90, 1650], items: ["Vehicle GPS Tracker", "Heavy-duty Tyre 265/65R17", "Vehicle Battery 12V", "Engine Oil 5L", "Brake Pads Set", "Hydraulic Car Jack", "Jump Starter Kit", "HD Dash Cam", "Vehicle Seat Covers Set", "Wiper Blades Pair", "Vehicle Tool Kit", "Radiator Coolant 5L", "Tyre Inflator", "Vehicle Fire Extinguisher", "Towing Rope"] },
    medical: { brands: ["MedSafe", "Genmark"], unit: "piece", priceRange: [18, 3200], items: ["Examination Gloves Box 100", "Surgical Face Masks Box 50", "First-Aid Kit Institutional", "Digital Thermometer", "Blood Pressure Monitor", "Standard Wheelchair", "Manual Hospital Bed", "Stethoscope", "Disposable Syringes Box", "Bandage Roll Pack", "Antiseptic Solution 1L", "Cotton Wool Roll", "Oxygen Concentrator", "Patient Monitor", "Surgical Gown Pack", "Medicine Cabinet"] },
    events: { brands: ["EventPro", "JBL", "Genmark"], unit: "unit", priceRange: [180, 5200], items: ["Canopy Tent 6x9m", "PA Sound System", "Registration Kiosk Setup", "Stage Platform Section", "LED Screen Panel", "Event Chair Set", "Photo Booth Setup", "Lighting Rig Kit", "Banner Stand", "Red Carpet Roll", "Portable Generator", "Event Tent Flooring", "Barricade Set", "Podium Stand", "Wireless Microphone Set"] },
  };
  const VARIANTS = ["", " – Standard Grade", " – Premium Grade", " – Economy Grade", " – Heavy Duty", " – Compact"];

  const target = 500;
  const remaining = Math.max(target - rows.length, 0);
  const catKeys = Object.keys(CATEGORY_BANK);
  const base = Math.floor(remaining / catKeys.length);
  const extra = remaining % catKeys.length;

  catKeys.forEach((key, ci) => {
    const bank = CATEGORY_BANK[key];
    const need = base + (ci < extra ? 1 : 0);
    let created = 0;
    for (let v = 0; v < VARIANTS.length && created < need; v++) {
      for (let it = 0; it < bank.items.length && created < need; it++) {
        const name = bank.items[it] + VARIANTS[v];
        const brand = bank.brands[(it + v) % bank.brands.length];
        const t = created / Math.max(need - 1, 1);
        const jitter = 0.85 + Math.random() * 0.3;
        const price = Math.max(5, Math.round((bank.priceRange[0] + (bank.priceRange[1] - bank.priceRange[0]) * t) * jitter));
        const corpPrice = Math.round(price * 0.92);
        const bulkPrice = Math.round(price * 0.85);
        const bulkQty = price < 50 ? 50 : price < 150 ? 30 : price < 500 ? 15 : price < 2000 ? 8 : 3;
        rows.push([key, name, brand, bank.unit, price, corpPrice, bulkQty, bulkPrice]);
        created++;
      }
    }
  });

  return rows.map((r, i) => {
    const [category, name, brand, unit, price, corpPrice, bulkQty, bulkPrice] = r;
    return {
      id: "P" + pad(i + 1, 4),
      sku: category.slice(0, 2).toUpperCase() + "-" + pad(i + 1, 3),
      name, category, brand, unit,
      price, corpPrice, bulkQty, bulkPrice,
      contractPrice: null,
      moq: 1,
      stock: Object.fromEntries(WAREHOUSES.map((w) => [w, Math.floor(20 + Math.random() * 300)])),
      reorderLevel: 25,
    };
  });
}

export const SUPPLIER_SEED = [
  { id: "S001", name: "Accra Office World Ltd", categories: ["office", "furniture"], location: "Accra", leadTime: 4, reliability: 92, quality: 90, delivery: 88, contact: "sales@accraofficeworld.com", email: "sales@accraofficeworld.com", phone: "+233 24 111 2201", password: "supplier123", status: "Approved", vendorCertificateId: "AJ-VCERT-00001", vendorCertificateIssuedAt: "2025-11-01" },
  { id: "S002", name: "Kumasi Tech Distributors", categories: ["ict"], location: "Kumasi", leadTime: 6, reliability: 88, quality: 91, delivery: 84, contact: "info@kumasitech.com", email: "info@kumasitech.com", phone: "+233 24 111 2202", password: "supplier123", status: "Approved", vendorCertificateId: "AJ-VCERT-00002", vendorCertificateIssuedAt: "2025-11-01" },
  { id: "S003", name: "Golden Uniform & Print", categories: ["school", "branding"], location: "Accra", leadTime: 7, reliability: 90, quality: 87, delivery: 90, contact: "orders@goldenuniform.com", email: "orders@goldenuniform.com", phone: "+233 24 111 2203", password: "supplier123", status: "Approved", vendorCertificateId: "AJ-VCERT-00003", vendorCertificateIssuedAt: "2025-11-01" },
  { id: "S004", name: "Northern Building Supplies", categories: ["construction"], location: "Tamale", leadTime: 5, reliability: 85, quality: 86, delivery: 80, contact: "sales@northernbuild.com", email: "sales@northernbuild.com", phone: "+233 24 111 2204", password: "supplier123", status: "Approved", vendorCertificateId: "AJ-VCERT-00004", vendorCertificateIssuedAt: "2025-11-01" },
  { id: "S005", name: "SafeGuard Industrial Ltd", categories: ["safety", "medical"], location: "Takoradi", leadTime: 3, reliability: 95, quality: 93, delivery: 92, contact: "hello@safeguard.com", email: "hello@safeguard.com", phone: "+233 24 111 2205", password: "supplier123", status: "Approved", vendorCertificateId: "AJ-VCERT-00005", vendorCertificateIssuedAt: "2025-11-01" },
  { id: "S006", name: "Coastal Hospitality Supplies", categories: ["hospitality", "events"], location: "Takoradi", leadTime: 6, reliability: 89, quality: 88, delivery: 85, contact: "sales@coastalhs.com", email: "sales@coastalhs.com", phone: "+233 24 111 2206", password: "supplier123", status: "Approved", vendorCertificateId: "AJ-VCERT-00006", vendorCertificateIssuedAt: "2025-11-01" },
];

/* -------- Auto-generate 50 additional approved suppliers, each with 200 pending
   price submissions drawn from the live catalogue (10,000 records total) -------- */
export const BULK_CITIES = ["Accra", "Kumasi", "Tema", "Takoradi", "Tamale", "Cape Coast", "Koforidua", "Sunyani", "Ho", "Bolgatanga", "Wa", "Techiman", "Obuasi", "Sekondi", "Nsawam", "Suhum", "Winneba", "Elmina", "Kasoa", "Madina", "Adenta", "Ashaiman", "Dansoman", "Achimota", "Nungua"];
export const BULK_BIZ_WORDS = ["Trading", "Enterprise", "Supplies", "Ventures", "Merchandise", "Distributors", "Commercial", "Industries", "Traders", "Import & Export"];
export function generateBulkSuppliers(count) {
  const suppliers = [];
  for (let i = 0; i < count; i++) {
    const num = i + 101; // S101..S150, avoiding collision with S001-S006
    const city = BULK_CITIES[i % BULK_CITIES.length];
    const biz = BULK_BIZ_WORDS[i % BULK_BIZ_WORDS.length];
    const cats = [CATEGORIES[i % CATEGORIES.length].key, CATEGORIES[(i + 5) % CATEGORIES.length].key];
    const name = `${city} ${biz} ${num} Ltd`;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "");
    suppliers.push({
      id: `S${num}`, name, categories: cats, location: city,
      leadTime: 3 + (i % 8), reliability: 80 + (i % 18), quality: 78 + (i % 20), delivery: 75 + (i % 22),
      contact: `sales@${slug}.com`, email: `sales@${slug}.com`, phone: `+233 24 ${String(300 + i).padStart(3, "0")} ${String(1000 + i).slice(-4)}`,
      password: "supplier123", status: "Approved",
      vendorCertificateId: `AJ-VCERT-${String(num).padStart(5, "0")}`, vendorCertificateIssuedAt: "2026-08-15",
    });
  }
  return suppliers;
}
export function generateBulkSubmissions(suppliers, products, perSupplier) {
  const submissions = [];
  const total = products.length;
  let counter = 1;
  suppliers.forEach((sup, si) => {
    const offset = (si * perSupplier) % total;
    for (let j = 0; j < perSupplier; j++) {
      const p = products[(offset + j) % total];
      const jitter = 0.85 + Math.random() * 0.2; // supplier's competing quote, 85%-105% of list price
      submissions.push({
        id: `BULK-${String(counter).padStart(5, "0")}`,
        supplierId: sup.id, supplierName: sup.name,
        sku: p.sku, name: p.name, category: p.category, unit: p.unit,
        price: Math.max(1, Math.round(p.price * jitter)),
        note: "", status: "Pending Review", submittedAt: "2026-09-10",
      });
      counter++;
    }
  });
  return submissions;
}
export const BULK_SUPPLIERS = generateBulkSuppliers(50);

export const ORG_TYPES = [
  "Private School", "Public Institution", "Company", "NGO", "Church / Religious Organization",
  "Hotel", "Restaurant", "Hospital / Clinic", "Government Institution", "Office",
  "Construction Company", "Retail Business", "Event Organizer", "Individual Corporate Client",
];

export const INTERNAL_ROLES = [
  { role: "Super Administrator", scope: "Full system control across every module." },
  { role: "Operations Manager", scope: "Oversees procurement and logistics end-to-end." },
  { role: "Procurement Manager", scope: "Runs RFQs, supplier sourcing and negotiation." },
  { role: "Finance Manager", scope: "Payments, invoicing and reconciliation." },
  { role: "Warehouse Manager", scope: "Inventory levels across all warehouses." },
  { role: "Logistics Manager", scope: "Delivery scheduling and driver assignment." },
  { role: "Sales / Customer Service", scope: "Customer accounts and support." },
  { role: "Supplier Manager", scope: "Supplier onboarding and performance scoring." },
];

export const ORG_USERS_SEED = [
  { id: "U1", name: "Efua Mensah", role: "CEO / Principal", password: "ceo123", isTopApprover: true, isPayer: false, isAdmin: false, features: null },
  { id: "U2", name: "Kwabena Owusu", role: "Procurement Officer", password: "proc123", isTopApprover: false, isPayer: false, isAdmin: false, features: null },
  { id: "U3", name: "Ama Boateng", role: "Finance Officer", password: "finance123", isTopApprover: false, isPayer: false, isAdmin: false, features: null },
  { id: "U4", name: "Yaw Darko", role: "Accountant", password: "account123", isTopApprover: false, isPayer: true, isAdmin: false, features: null },
  { id: "U5", name: "Adjoa Frimpong", role: "Storekeeper", password: "store123", isTopApprover: false, isPayer: false, isAdmin: false, features: null },
  { id: "U6", name: "Nana Kwarteng", role: "Administrator", password: "orgadmin123", isTopApprover: false, isPayer: false, isAdmin: true, features: null },
];

export const CUSTOMER_ORG = {
  name: "Kingsford Preparatory School",
  type: "Private School",
  tier: "corporate",
  regNo: "GH-EDU-004421",
  contact: "Efua Mensah",
  phone: "+233 24 555 0192",
  email: "procurement@kingsfordprep.edu.gh",
  billingAddress: "12 Liberation Rd, Accra",
  deliveryAddress: "Kingsford Preparatory School, Spintex Rd, Accra",
  gps: "5.6415° N, 0.1450° W",
  vat: "GH-VAT-0093281",
  creditLimit: 60000,
  budgetAnnual: 500000,
  certificateId: "AJ-CERT-00001",
  certificateIssuedAt: "2025-08-01",
  certificateExpiresAt: "2026-08-01",
  loyaltyPoints: 340,
  savedLocations: [
    { id: "LOC-0001", label: "Main Campus", address: "Kingsford Preparatory School, Spintex Rd, Accra", lat: 5.6037, lon: -0.1870 },
  ],
};

export const PAYMENT_METHODS = [
  { key: "mobile", label: "Mobile Money (MTN / Telecel / AT)" },
  { key: "card", label: "Visa / Mastercard" },
  { key: "bank", label: "Bank Transfer" },
  { key: "wallet", label: "AJ-PROXIS Wallet" },
  { key: "credit", label: "Corporate Credit (30-day)" },
];
