/* Builds the printable/downloadable HTML for every generated document in the app:
   order receipts/invoices/delivery notes, supply agreements, registration and vendor
   certificates, company content documents, and signup confirmation emails. */

import { GHS, deliveredLabel, isCertExpired, isCertExpiringSoon } from "./helpers.js";
import { LOGO_FULL, LOGO_ICON } from "./brandAssets.js";

export function buildDocumentHtml(doc, order, cust) {
  const isDelivery = doc.kind === "Delivery Note";
  const dueDate = new Date(new Date(order.createdAt).getTime() + 7 * 86400000).toISOString().slice(0, 10);

  const rowsHtml = order.items.map((it) => `
    <tr>
      <td style="padding:6px 8px;border-bottom:1px solid #E3E4E2;">${it.name}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #E3E4E2;text-align:right;">${it.qty}</td>
      ${isDelivery
        ? `<td style="padding:6px 8px;border-bottom:1px solid #E3E4E2;text-align:right;">${deliveredLabel(order.deliveredItems[it.name] || 0, it.qty)}</td>`
        : `<td style="padding:6px 8px;border-bottom:1px solid #E3E4E2;text-align:right;">${GHS(it.unitPrice)}</td><td style="padding:6px 8px;border-bottom:1px solid #E3E4E2;text-align:right;">${GHS(it.unitPrice * it.qty)}</td>`}
    </tr>`).join("");

  const totalsHtml = !isDelivery ? `
    <div style="display:flex;justify-content:flex-end;margin-bottom:16px;">
      <table style="width:260px;font-size:12px;border-collapse:collapse;">
        <tr><td style="color:#6B6F72;padding:2px 0;">Subtotal</td><td style="text-align:right;">${GHS(order.subtotal)}</td></tr>
        <tr><td style="color:#6B6F72;padding:2px 0;">NHIL (2.5%)</td><td style="text-align:right;">${GHS(order.tax.nhil)}</td></tr>
        <tr><td style="color:#6B6F72;padding:2px 0;">GETFund (2.5%)</td><td style="text-align:right;">${GHS(order.tax.getfund)}</td></tr>
        <tr><td style="color:#6B6F72;padding:2px 0;">VAT (12.5%)</td><td style="text-align:right;">${GHS(order.tax.vat)}</td></tr>
        <tr><td style="color:#6B6F72;padding:2px 0;">Delivery</td><td style="text-align:right;">${GHS(order.tax.delivery)}</td></tr>
        <tr><td style="font-weight:700;padding-top:6px;border-top:1px solid #E3E4E2;">Total</td><td style="text-align:right;font-weight:700;padding-top:6px;border-top:1px solid #E3E4E2;">${GHS(order.total)}</td></tr>
      </table>
    </div>` : "";

  const receiptHtml = doc.kind === "Receipt"
    ? `<div style="color:#2F7D5E;font-weight:600;font-size:14px;margin-bottom:16px;">&#10003; PAID via ${order.paymentMethod} on ${order.createdAt}</div>` : "";
  const deliveryHtml = isDelivery
    ? `<div style="font-size:12px;color:#6B6F72;margin-bottom:16px;">Status: ${order.deliveryStatus}${order.pod ? ` · Received by ${order.pod.receiver} on ${order.pod.date}` : ""}</div>` : "";

  const referenceExtra = `
    ${(doc.kind === "Invoice" || doc.kind === "Purchase Order") ? `<div>Payment Terms: Net 30 / on approval</div>` : ""}
    ${doc.kind === "Purchase Order" ? `<div>Delivery Deadline: ${dueDate}</div>` : ""}
    ${doc.kind === "Purchase Order" ? `<div>Authorized By: ${cust?.contact || ""}</div>` : ""}
  `;

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><title>${doc.kind} ${doc.id}</title></head>
<body style="font-family: Inter, Arial, sans-serif; color:#16191C; background:#F7F8F9; margin:0; padding:32px;">
  <div style="max-width:720px;margin:0 auto;background:#fff;border:1px solid #E3E4E2;border-radius:8px;padding:32px;">
    <div style="display:flex;align-items:flex-start;justify-content:space-between;padding-bottom:16px;margin-bottom:16px;border-bottom:1px solid #E3E4E2;">
      <img src="${LOGO_FULL}" alt="AJ-PROXIS Solutions" style="height:48px;" />
      <div style="text-align:right;">
        <div style="font-weight:700;text-transform:uppercase;font-size:13px;color:#0B79B7;">${doc.kind}</div>
        <div style="font-size:11px;color:#6B6F72;">${doc.id}</div>
        <div style="font-size:11px;color:#6B6F72;">${order.createdAt}</div>
      </div>
    </div>
    <div style="display:flex;justify-content:space-between;gap:16px;margin-bottom:16px;font-size:12px;">
      <div>
        <div style="text-transform:uppercase;font-size:10px;color:#6B6F72;margin-bottom:4px;">${isDelivery ? "Deliver To" : "Bill To"}</div>
        <div style="font-weight:600;">${cust?.name || order.org}</div>
        <div>${isDelivery ? (cust?.deliveryAddress || "") : (cust?.billingAddress || "")}</div>
        ${cust?.vat ? `<div>VAT: ${cust.vat}</div>` : ""}
      </div>
      <div style="text-align:right;">
        <div style="text-transform:uppercase;font-size:10px;color:#6B6F72;margin-bottom:4px;">Reference</div>
        <div>Order: ${order.id}</div>
        <div>PO: ${order.poId}</div>
        ${referenceExtra}
      </div>
    </div>
    <table style="width:100%;font-size:12px;border-collapse:collapse;margin-bottom:16px;">
      <thead>
        <tr style="border-bottom:1px solid #E3E4E2;">
          <th style="text-align:left;padding:6px 8px;">Item</th>
          <th style="text-align:right;padding:6px 8px;">Qty</th>
          ${isDelivery ? `<th style="text-align:right;padding:6px 8px;">Delivered</th>` : `<th style="text-align:right;padding:6px 8px;">Unit Price</th><th style="text-align:right;padding:6px 8px;">Line Total</th>`}
        </tr>
      </thead>
      <tbody>${rowsHtml}</tbody>
    </table>
    ${totalsHtml}
    ${receiptHtml}
    ${deliveryHtml}
    <div style="font-size:10px;color:#6B6F72;padding-top:12px;border-top:1px solid #E3E4E2;">
      AJ-PROXIS SOLUTIONS · This is a system-generated document from AJ-PROXIS Procure.
    </div>
  </div>
</body>
</html>`;
}

export function downloadDocument(doc, order, cust) {
  const html = buildDocumentHtml(doc, order, cust);
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `AJ-PROXIS-${doc.kind.replace(/\s+/g, "-")}-${doc.id}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}


export function buildSupplyAgreementClauses(contract, customer) {
  const start = contract.start || "the Effective Date";
  const end = contract.end || "the end of the agreed term";
  const value = GHS(contract.value || 0);
  const product = contract.product || "the agreed products and services";
  return [
    { title: "1. Parties", body: `This Supply Agreement ("Agreement") is made between AJ-PROXIS SOLUTIONS ("Supplier"), a business-supply and procurement company operating the AJ-PROXIS Procure platform, and ${customer.name} ("Customer"), a ${customer.type} with billing address at ${customer.billingAddress || "the address on file"}. This Agreement governs the supply of products and services described herein.` },
    { title: "2. Definitions", body: `"Products" means any goods listed in the AJ-PROXIS Procure catalogue or otherwise agreed in writing. "Services" means delivery, installation, sourcing, or related support services provided by the Supplier. "Order" means any purchase order, quotation, or procurement request accepted by both parties through the Platform. "Platform" means the AJ-PROXIS Procure system through which Orders are placed, approved and tracked.` },
    { title: "3. Scope of Supply", body: `The Supplier agrees to supply the Customer with ${product}, together with any additional products or services the Customer orders through the Platform from time to time. Each Order placed and accepted through the Platform forms part of, and is governed by, this Agreement unless the parties agree otherwise in writing.` },
    { title: "4. Term and Renewal", body: `This Agreement commences on ${start} and continues until ${end}, unless terminated earlier in accordance with Clause 14. Upon expiry, this Agreement may be renewed by mutual written consent, or will continue on a month-to-month basis for recurring schedules already active on the Platform at the time of expiry.` },
    { title: "5. Pricing and Payment Terms", body: `Pricing for Products and Services shall be as quoted through the Platform at the time of each Order, subject to the pricing tier applicable to the Customer's account. Payment terms for this Agreement are ${contract.terms || "Net 30"}, with an estimated annual contract value of ${value}. Statutory levies (NHIL, GETFund) and VAT apply in addition to quoted prices, as itemized on each invoice. Late payments may attract administrative charges and may affect the Customer's approved credit limit.` },
    { title: "6. Ordering Procedure", body: `Orders may be placed via the Platform's catalogue, request-for-quotation tools, or custom procurement requests. Orders are only binding once a corresponding quotation has been approved by the Customer and, where applicable, cleared through the Customer's internal approval workflow, and payment has been confirmed or credit terms applied.` },
    { title: "7. Delivery and Risk of Loss", body: `The Supplier shall use reasonable efforts to deliver Products and perform Services within the timeframes indicated at the point of Order. Risk of loss or damage to Products passes to the Customer upon delivery to the address specified in the Order. Partial deliveries may be made and invoiced separately where agreed or where operationally necessary.` },
    { title: "8. Inspection and Rejection", body: `The Customer shall inspect Products upon delivery and notify the Supplier of any shortage, damage, or non-conformity within seven (7) days via a Return Request on the Platform or a Support Ticket. Failure to notify within this period constitutes acceptance of the Products as delivered, without prejudice to statutory warranty rights.` },
    { title: "9. Warranties", body: `The Supplier warrants that Products supplied will be of satisfactory quality and reasonably fit for their intended purpose, and that Services will be performed with reasonable skill and care. Manufacturer warranties, where applicable, are passed through to the Customer. This Agreement does not exclude any warranty that cannot lawfully be excluded under applicable Ghanaian law.` },
    { title: "10. Confidentiality", body: `Each party shall keep confidential any non-public business, pricing, or account information disclosed by the other party in connection with this Agreement, and shall not disclose such information to third parties except as required to perform its obligations or as required by law.` },
    { title: "11. Limitation of Liability", body: `Except in respect of death, personal injury, or fraud, neither party's liability under this Agreement shall exceed the total value of Orders placed in the twelve (12) months preceding the claim. Neither party shall be liable for indirect, incidental, or consequential losses arising from this Agreement.` },
    { title: "12. Force Majeure", body: `Neither party shall be liable for delay or failure to perform its obligations under this Agreement to the extent such delay or failure results from circumstances beyond its reasonable control, including but not limited to natural disaster, strikes, import restrictions, or disruption to transport or utilities.` },
    { title: "13. Compliance", body: `The Customer agrees to provide accurate business and compliance information (including registration and tax documentation where applicable) via the Compliance Documents feature on the Platform, particularly where institutional or higher-credit procurement is involved. The Supplier reserves the right to suspend credit facilities pending verification of outstanding compliance documents.` },
    { title: "14. Termination", body: `Either party may terminate this Agreement by giving thirty (30) days' written notice to the other party. The Supplier may terminate or suspend this Agreement immediately if the Customer fails to make payment when due, breaches this Agreement materially, or provides false compliance information. Termination does not affect Orders already accepted prior to the termination date.` },
    { title: "15. Dispute Resolution and Governing Law", body: `The parties shall first attempt to resolve any dispute arising from this Agreement through good-faith negotiation, including via the Platform's Support Ticket system. Unresolved disputes shall be referred to mediation, and failing settlement, to arbitration or the courts of the Republic of Ghana, whose laws shall govern this Agreement.` },
    { title: "16. Notices", body: `Notices under this Agreement shall be given in writing via the Platform's messaging or Support Ticket features, or to the postal or email addresses on file for each party, and shall be deemed received when acknowledged or, if earlier, within two (2) business days of sending.` },
    { title: "17. Entire Agreement and Amendments", body: `This Agreement, together with any Orders placed under it, constitutes the entire agreement between the parties regarding its subject matter and supersedes all prior discussions. Amendments must be agreed in writing, save for routine pricing or catalogue updates made by the Supplier through the Platform in the ordinary course of business.` },
  ];
}

export function buildSupplyAgreementHtml(contract, customer) {
  const clauses = buildSupplyAgreementClauses(contract, customer);
  const today = new Date().toISOString().slice(0, 10);
  const clausesHtml = clauses.map((c, i) => `
    <div style="margin-bottom:16px;${i > 0 && i % 4 === 0 ? "page-break-before:always;padding-top:24px;" : ""}">
      <div style="font-weight:700;font-size:13px;margin-bottom:4px;">${c.title}</div>
      <div style="font-size:12px;line-height:1.6;color:#333;">${c.body}</div>
    </div>`).join("");

  const signatureHtml = contract.status === "Active" ? `
    <div style="font-size:12px;color:#2F7D5E;font-weight:600;margin-top:8px;">&#10003; Digitally signed by ${contract.signedBy} on behalf of ${customer.name} on ${contract.signedAt}.</div>` :
    `<div style="font-size:12px;color:#E31C34;font-weight:600;margin-top:8px;">Awaiting Customer signature.</div>`;

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><title>Supply Agreement ${contract.id}</title></head>
<body style="font-family: Inter, Arial, sans-serif; color:#16191C; background:#F7F8F9; margin:0; padding:32px;">
  <div style="max-width:760px;margin:0 auto;background:#fff;border:1px solid #E3E4E2;border-radius:8px;padding:40px;">
    <div style="display:flex;align-items:flex-start;justify-content:space-between;padding-bottom:16px;margin-bottom:24px;border-bottom:1px solid #E3E4E2;">
      <img src="${LOGO_FULL}" alt="AJ-PROXIS Solutions" style="height:48px;" />
      <div style="text-align:right;">
        <div style="font-weight:700;text-transform:uppercase;font-size:13px;color:#0B79B7;">Supply Agreement</div>
        <div style="font-size:11px;color:#6B6F72;">${contract.id}</div>
        <div style="font-size:11px;color:#6B6F72;">Generated ${today}</div>
      </div>
    </div>
    <h1 style="font-size:18px;margin:0 0 8px;">SUPPLY OF PRODUCTS AND SERVICES AGREEMENT</h1>
    <p style="font-size:12px;color:#6B6F72;margin:0 0 24px;">Between AJ-PROXIS SOLUTIONS ("Supplier") and ${customer.name} ("Customer")</p>
    ${clausesHtml}
    <div style="margin-top:32px;padding-top:16px;border-top:1px solid #E3E4E2;display:flex;justify-content:space-between;gap:24px;font-size:12px;">
      <div>
        <div style="font-weight:700;margin-bottom:24px;">For the Customer</div>
        <div>Name: ${contract.signedBy || "____________________"}</div>
        <div>Organization: ${customer.name}</div>
        <div>Date: ${contract.signedAt || "____________________"}</div>
      </div>
      <div>
        <div style="font-weight:700;margin-bottom:24px;">For AJ-PROXIS SOLUTIONS</div>
        <div>Name: Kwaku Ansah</div>
        <div>Title: Super Administrator</div>
        <div>Date: ${contract.signedAt || today}</div>
      </div>
    </div>
    ${signatureHtml}
    <div style="font-size:10px;color:#6B6F72;padding-top:16px;margin-top:16px;border-top:1px solid #E3E4E2;">
      AJ-PROXIS SOLUTIONS · This Supply Agreement was auto-generated by AJ-PROXIS Procure from the terms of contract ${contract.id}.
    </div>
  </div>
</body>
</html>`;
}


export function buildCertificateHtml(customer, ceoName) {
  const statusLabel = isCertExpired(customer) ? "EXPIRED" : isCertExpiringSoon(customer) ? "EXPIRING SOON" : "ACTIVE";
  const statusColor = isCertExpired(customer) ? "#E31C34" : isCertExpiringSoon(customer) ? "#F2A200" : "#2F7D5E";
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><title>Registration Certificate — ${customer.certificateId}</title></head>
<body style="font-family: Georgia, 'Times New Roman', serif; color:#16191C; background:#F0F1EC; margin:0; padding:36px;">
  <div style="max-width:760px;margin:0 auto;background:#083A57;padding:8px;">
    <div style="height:8px;background:linear-gradient(90deg, #E31C34 0%, #E31C34 33%, #0B79B7 33%, #0B79B7 66%, #F2A200 66%, #F2A200 100%);"></div>
    <div style="background:radial-gradient(circle at 50% 0%, #E4F1F9 0%, #FBE2E5 45%, #FDEED2 100%);padding:36px;text-align:center;position:relative;border:2px solid #F2A200;border-top:none;">
      <img src="${LOGO_ICON}" alt="" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);height:340px;opacity:0.06;pointer-events:none;" />
      <div style="position:relative;">
        <img src="${LOGO_FULL}" alt="AJ-PROXIS Solutions" style="height:46px;margin-bottom:18px;background:#fff;padding:8px 14px;border-radius:6px;" />
        <div style="font-size:11px;letter-spacing:4px;color:#5B6266;text-transform:uppercase;margin-bottom:6px;">AJ-PROXIS Procure</div>
        <h1 style="font-size:26px;letter-spacing:2px;color:#083A57;margin:0 0 6px;font-family: 'Times New Roman', serif;">CERTIFICATE OF REGISTRATION</h1>
        <div style="width:140px;height:4px;margin:10px auto 22px;background:linear-gradient(90deg, #E31C34 0%, #E31C34 33%, #0B79B7 33%, #0B79B7 66%, #F2A200 66%, #F2A200 100%);"></div>
        <p style="font-size:13px;color:#333;">This is to certify that</p>
        <h2 style="font-size:24px;color:#0B79B7;margin:8px 0;font-family: 'Times New Roman', serif;">${customer.name}</h2>
        <p style="font-size:13px;color:#333;max-width:520px;margin:0 auto 20px;line-height:1.6;">is a duly registered customer organization of <b>AJ-PROXIS SOLUTIONS</b> on the AJ-PROXIS Procure platform, and is entitled to all rights and privileges of registered membership, subject to the terms of registration and annual renewal.</p>

        <table style="margin:0 auto 20px;font-size:12px;text-align:left;background:rgba(255,255,255,0.6);border-radius:6px;padding:10px 16px;">
          <tr><td style="padding:3px 14px 3px 0;color:#5B6266;">Certificate No.</td><td style="padding:3px 0;font-weight:bold;">${customer.certificateId}</td></tr>
          <tr><td style="padding:3px 14px 3px 0;color:#5B6266;">Organization Type</td><td style="padding:3px 0;">${customer.type}</td></tr>
          <tr><td style="padding:3px 14px 3px 0;color:#5B6266;">Date Issued</td><td style="padding:3px 0;">${customer.certificateIssuedAt}</td></tr>
          <tr><td style="padding:3px 14px 3px 0;color:#5B6266;">Valid Until</td><td style="padding:3px 0;font-weight:bold;">${customer.certificateExpiresAt}</td></tr>
          <tr><td style="padding:3px 14px 3px 0;color:#5B6266;">Status</td><td style="padding:3px 0;font-weight:bold;color:${statusColor};">${statusLabel}</td></tr>
        </table>

        <div style="display:flex;justify-content:center;margin-top:34px;">
          <div style="text-align:center;">
            <div style="font-family:'Brush Script MT', cursive; font-size:30px; color:#083A57;">${ceoName}</div>
            <div style="width:200px;border-top:1px solid #333;margin:2px auto 6px;"></div>
            <div style="font-size:12px;font-weight:bold;">${ceoName}</div>
            <div style="font-size:11px;color:#5B6266;">Chief Executive Officer, AJ-PROXIS SOLUTIONS</div>
          </div>
        </div>

        <p style="font-size:9px;color:#5B6266;margin-top:26px;">This certificate is subject to yearly renewal at a fee determined by AJ-PROXIS Control Centre. Accounts with an expired certificate are automatically placed on hold until renewed.</p>
      </div>
    </div>
    <div style="height:8px;background:linear-gradient(90deg, #F2A200 0%, #F2A200 33%, #0B79B7 33%, #0B79B7 66%, #E31C34 66%, #E31C34 100%);"></div>
  </div>
</body>
</html>`;
}


export function buildCompanyDocumentHtml(doc) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><title>${doc.title}</title></head>
<body style="font-family: Georgia, 'Times New Roman', serif; color:#16191C; background:#F0F1EC; margin:0; padding:36px;">
  <div style="max-width:760px;margin:0 auto;background:#fff;border:1px solid #E3E4E2;padding:40px;">
    <img src="${LOGO_FULL}" alt="AJ-PROXIS Solutions" style="height:40px;margin-bottom:24px;" />
    <div style="font-size:13px;line-height:1.7;">${doc.body}</div>
    <p style="font-size:10px;color:#5B6266;margin-top:30px;border-top:1px solid #E3E4E2;padding-top:12px;">AJ-PROXIS SOLUTIONS · procure.ajproxis.com · hello@ajproxis.com · +233 24 000 0192 · Spintex Road, Accra, Ghana</p>
  </div>
</body>
</html>`;
}

export function buildVendorCertificateHtml(supplier, ceoName) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><title>Vendor Certificate — ${supplier.vendorCertificateId}</title></head>
<body style="font-family: Georgia, 'Times New Roman', serif; color:#16191C; background:#F0F1EC; margin:0; padding:36px;">
  <div style="max-width:760px;margin:0 auto;background:#083A57;padding:8px;">
    <div style="height:8px;background:linear-gradient(90deg, #F2A200 0%, #F2A200 33%, #0B79B7 33%, #0B79B7 66%, #E31C34 66%, #E31C34 100%);"></div>
    <div style="background:radial-gradient(circle at 50% 0%, #FDEED2 0%, #E4F1F9 45%, #FBE2E5 100%);padding:36px;text-align:center;position:relative;border:2px solid #0B79B7;border-top:none;">
      <img src="${LOGO_ICON}" alt="" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);height:340px;opacity:0.06;pointer-events:none;" />
      <div style="position:relative;">
        <img src="${LOGO_FULL}" alt="AJ-PROXIS Solutions" style="height:46px;margin-bottom:18px;background:#fff;padding:8px 14px;border-radius:6px;" />
        <div style="font-size:11px;letter-spacing:4px;color:#5B6266;text-transform:uppercase;margin-bottom:6px;">AJ-PROXIS Procure</div>
        <h1 style="font-size:26px;letter-spacing:2px;color:#083A57;margin:0 0 6px;font-family: 'Times New Roman', serif;">VENDOR CERTIFICATE</h1>
        <div style="width:140px;height:4px;margin:10px auto 22px;background:linear-gradient(90deg, #F2A200 0%, #F2A200 33%, #0B79B7 33%, #0B79B7 66%, #E31C34 66%, #E31C34 100%);"></div>
        <p style="font-size:13px;color:#333;">This is to certify that</p>
        <h2 style="font-size:24px;color:#0B79B7;margin:8px 0;font-family: 'Times New Roman', serif;">${supplier.name}</h2>
        <p style="font-size:13px;color:#333;max-width:520px;margin:0 auto 20px;line-height:1.6;">is a duly registered and approved vendor of <b>AJ-PROXIS SOLUTIONS</b>, authorized to supply goods and services through the AJ-PROXIS Procure platform, having met the required standards for onboarding and verification.</p>

        <table style="margin:0 auto 20px;font-size:12px;text-align:left;background:rgba(255,255,255,0.6);border-radius:6px;padding:10px 16px;">
          <tr><td style="padding:3px 14px 3px 0;color:#5B6266;">Certificate No.</td><td style="padding:3px 0;font-weight:bold;">${supplier.vendorCertificateId}</td></tr>
          <tr><td style="padding:3px 14px 3px 0;color:#5B6266;">Supply Categories</td><td style="padding:3px 0;">${(supplier.categories || []).join(", ")}</td></tr>
          <tr><td style="padding:3px 14px 3px 0;color:#5B6266;">Location</td><td style="padding:3px 0;">${supplier.location}</td></tr>
          <tr><td style="padding:3px 14px 3px 0;color:#5B6266;">Date Issued</td><td style="padding:3px 0;font-weight:bold;">${supplier.vendorCertificateIssuedAt}</td></tr>
          <tr><td style="padding:3px 14px 3px 0;color:#5B6266;">Status</td><td style="padding:3px 0;font-weight:bold;color:#2F7D5E;">APPROVED VENDOR</td></tr>
        </table>

        <div style="display:flex;justify-content:center;margin-top:34px;">
          <div style="text-align:center;">
            <div style="font-family:'Brush Script MT', cursive; font-size:30px; color:#083A57;">${ceoName}</div>
            <div style="width:200px;border-top:1px solid #333;margin:2px auto 6px;"></div>
            <div style="font-size:12px;font-weight:bold;">${ceoName}</div>
            <div style="font-size:11px;color:#5B6266;">Chief Executive Officer, AJ-PROXIS SOLUTIONS</div>
          </div>
        </div>

        <p style="font-size:9px;color:#5B6266;margin-top:26px;">This certificate confirms this vendor's approved status on the AJ-PROXIS Procure platform as of the date of issue.</p>
      </div>
    </div>
    <div style="height:8px;background:linear-gradient(90deg, #E31C34 0%, #E31C34 33%, #0B79B7 33%, #0B79B7 66%, #F2A200 66%, #F2A200 100%);"></div>
  </div>
</body>
</html>`;
}


export function buildSignupConfirmationEmailHtml(form, orgId) {
  const today = new Date().toISOString().slice(0, 10);
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><title>Welcome to AJ-PROXIS Procure</title></head>
<body style="font-family: Inter, Arial, sans-serif; color:#16191C; background:#F7F8F9; margin:0; padding:32px;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #E3E4E2;border-radius:8px;padding:32px;">
    <img src="${LOGO_FULL}" alt="AJ-PROXIS Solutions" style="height:44px;margin-bottom:20px;" />
    <div style="font-size:11px;color:#6B6F72;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;">Registration Received</div>
    <h1 style="font-size:18px;margin:0 0 14px;">Welcome to AJ-PROXIS Procure, ${form.orgName}!</h1>
    <p style="font-size:13px;line-height:1.6;">Dear ${form.contact || "Sir/Madam"},</p>
    <p style="font-size:13px;line-height:1.6;">Thank you for registering <b>${form.orgName}</b> with AJ-PROXIS SOLUTIONS. We've received your organization's details and your registration reference is:</p>
    <div style="font-size:16px;font-weight:700;color:#0B79B7;margin:14px 0;">${orgId}</div>
    <table style="width:100%;font-size:12px;border-collapse:collapse;margin-bottom:16px;">
      <tr><td style="padding:5px 0;color:#6B6F72;width:40%;">Organization Type</td><td style="padding:5px 0;">${form.orgType}</td></tr>
      <tr><td style="padding:5px 0;color:#6B6F72;">Contact Person</td><td style="padding:5px 0;">${form.contact}</td></tr>
      <tr><td style="padding:5px 0;color:#6B6F72;">Email</td><td style="padding:5px 0;">${form.email}</td></tr>
      <tr><td style="padding:5px 0;color:#6B6F72;">Phone</td><td style="padding:5px 0;">${form.phone}</td></tr>
      <tr><td style="padding:5px 0;color:#6B6F72;">Delivery Address</td><td style="padding:5px 0;">${form.deliveryAddress || "—"}</td></tr>
      <tr><td style="padding:5px 0;color:#6B6F72;">Date Submitted</td><td style="padding:5px 0;">${today}</td></tr>
    </table>
    <div style="background:#FDEED2;border-radius:6px;padding:12px 14px;font-size:12px;margin-bottom:16px;">
      <b>What happens next:</b> AJ-PROXIS Control Centre will review your registration. Once approved, you'll be able to log in and your account will be activated with a starter credit limit and procurement budget.
    </div>
    <p style="font-size:12px;color:#6B6F72;">If you did not request this registration, please contact AJ-PROXIS SOLUTIONS immediately.</p>
    <div style="font-size:10px;color:#6B6F72;padding-top:14px;margin-top:14px;border-top:1px solid #E3E4E2;">
      AJ-PROXIS SOLUTIONS · Office Essentials, Simplified · This is an automated message from AJ-PROXIS Procure.
    </div>
  </div>
</body>
</html>`;
}

