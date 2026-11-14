const nodemailer = require("nodemailer");
const path = require("path");
const storage = require("./storage");

const escapeHtml = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char],
  );

const safeFilename = (value) =>
  String(value || "file")
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
    .slice(0, 100);

const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return Number.isNaN(d.getTime())
    ? String(date)
    : d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Kolkata",
      });
};

// ---- Inline styles (Gmail/Outlook ke liye <style> tag use nahi kiya) ----
const FONT = "Arial,Helvetica,sans-serif";
const TH = `padding:8px 10px;border:1px solid #c4c9d0;background:#f1f3f6;font:bold 13px ${FONT};color:#1f2933;text-align:left;`;
const TD = `padding:8px 10px;border:1px solid #c4c9d0;font:13px ${FONT};color:#1f2933;vertical-align:top;`;
const P = `margin:0 0 12px;font:14px/1.6 ${FONT};color:#1f2933;`;

// Email ka content banata hai (HTML + plain text + subject)
function buildEmail(inq, { photoCids = {} } = {}) {
  const items = Array.from(inq.items || []);
  const cc = Array.from(inq.cc || []);

  const first = items[0];
  const label = first
    ? `${first.name}${
        items.length > 1
          ? ` +${items.length - 1} more`
          : first.quantity
            ? ` (${first.quantity})`
            : ""
      }`
    : inq.productName || inq.projectName || "New Enquiry";

  const subject = [`RFQ: ${label}`, inq.projectName, inq.company || inq.name]
    .filter(Boolean)
    .join(" | ")
    .replace(/[\r\n]+/g, " ")
    .slice(0, 180);

  const detailRows = [
    ["Name", inq.name],
    ["Company", inq.company],
    ["Email", inq.email, `mailto:${inq.email}`],
    ["Phone", inq.phone, inq.phone && `tel:${inq.phone.replace(/\s/g, "")}`],
    ["Project", inq.projectName],
    ["Delivery Location", inq.deliveryLocation],
    ["Required By", formatDate(inq.requiredBy)],
    ["CC", cc.join(", ")],
  ].filter(([, value]) => value);

  const detailHtml = detailRows
    .map(
      ([key, value, href]) => `
        <tr>
          <td style="${TH}width:32%;">${escapeHtml(key)}</td>
          <td style="${TD}">${
            href
              ? `<a href="${escapeHtml(href)}" style="color:#1155cc;text-decoration:none;">${escapeHtml(value)}</a>`
              : escapeHtml(value)
          }</td>
        </tr>`,
    )
    .join("");

  const itemRows = items.length
    ? items
        .map((it, i) => {
          const cid = photoCids[i];
          return `
        <tr>
          <td style="${TD}text-align:center;width:44px;">${i + 1}</td>
          <td style="${TD}">${escapeHtml(it.name || "Item")}${
            cid
              ? `<br><img src="cid:${cid}" alt="${escapeHtml(it.name || "Item photo")}" width="90" style="margin-top:6px;border:1px solid #c4c9d0;max-width:90px;height:auto;display:block;">`
              : ""
          }</td>
          <td style="${TD}text-align:center;width:90px;">${escapeHtml(it.quantity || "-")}</td>
        </tr>`;
        })
        .join("")
    : `
        <tr>
          <td style="${TD}text-align:center;">1</td>
          <td style="${TD}">${escapeHtml(inq.productName || "Item details not provided")}</td>
          <td style="${TD}text-align:center;">${escapeHtml(inq.quantity || "-")}</td>
        </tr>`;

  // Sirf wahi jo client ne message box me likha (kuch extra nahi)
  const messageHtml = inq.message
    ? `
      <p style="${P}margin-bottom:6px;"><b>Customer message:</b></p>
      <div style="margin:0 0 16px;padding:10px 14px;border-left:3px solid #c4c9d0;font:14px/1.6 ${FONT};color:#1f2933;white-space:pre-wrap;">${escapeHtml(inq.message)}</div>`
    : "";

  const html = `<!doctype html>
<html>
<body style="margin:0;padding:0;background:#ffffff;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#ffffff;">
<tr><td align="left" style="padding:16px;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:680px;">
<tr><td>

  <p style="${P}">Dear Team,</p>
  <p style="${P}">A new Request for Quotation has been received through the S.R. Trading Company website. Please find the details below.</p>

  <p style="${P}margin-bottom:6px;"><b>Material requirement</b></p>
  <table width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;margin:0 0 16px;">
    <tr>
      <th style="${TH}text-align:center;">Sr.</th>
      <th style="${TH}">Material Description</th>
      <th style="${TH}text-align:center;">Qty</th>
    </tr>
    ${itemRows}
  </table>

  <p style="${P}margin-bottom:6px;"><b>Customer &amp; project details</b></p>
  <table width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;margin:0 0 16px;">
    ${detailHtml}
  </table>

  ${messageHtml}

</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

  const text = [
    "Dear Team,",
    "",
    "A new Request for Quotation has been received through the S.R. Trading Company website. Please find the details below.",
    "",
    "MATERIAL REQUIREMENT",
    ...(items.length
      ? items.map(
          (it, i) =>
            `${i + 1}. ${it.name} - Qty: ${it.quantity || "-"}${it.photo?.path ? " (photo attached)" : ""}`,
        )
      : [
          `1. ${inq.productName || "Item details not provided"} - Qty: ${inq.quantity || "-"}`,
        ]),
    "",
    "CUSTOMER & PROJECT DETAILS",
    ...detailRows.map(([key, value]) => `${key}: ${value}`),
    ...(inq.message ? ["", "CUSTOMER MESSAGE", inq.message] : []),
  ].join("\n");

  return { subject, html, text };
}

module.exports = async function sendInquiryMail(inq) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, INQUIRY_TO } =
    process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn("Inquiry mail skipped: SMTP configuration missing.");
    return;
  }

  try {
    const t = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    const items = Array.from(inq.items || []);
    const attachments = [];
    const failed = []; // jo file read nahi ho payi (sirf server log me)
    const photoCids = {}; // item index -> inline image cid
    const addedKeys = new Set();

    // Ek file ka read fail ho to poori email na ruke
    const addStored = async (file, filename, extra = {}) => {
      if (!file?.path || addedKeys.has(file.path)) return false;
      const name = safeFilename(filename || file.originalName || file.path);
      try {
        const buffer = await storage.getBuffer(file.path);
        attachments.push({ filename: name, content: buffer, ...extra });
        addedKeys.add(file.path);
        return true;
      } catch (error) {
        console.error(`Attachment read failed (${name}):`, error.message);
        failed.push(name);
        return false;
      }
    };

    // Item photos (inline thumbnail + attachment)
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.photo?.path) continue;
      const ext = path.extname(item.photo.path);
      const cid = `item${i + 1}-${Date.now()}@srt`;
      const ok = await addStored(
        item.photo,
        `item${i + 1}_${safeFilename(item.name || "item")}${ext}`,
        { cid },
      );
      if (ok) photoCids[i] = cid;
    }

    // RFQ / BOQ attachments
    for (const file of inq.attachments || []) {
      await addStored(file, file.originalName || file.path);
    }

    // Old single attachment (duplicate automatically skip)
    if (inq.attachment?.path) {
      await addStored(
        inq.attachment,
        inq.attachment.originalName || inq.attachment.path,
      );
    }

    const { subject, html, text } = buildEmail(inq, { photoCids });

    const cc = Array.from(inq.cc || []);
    const bcc = Array.from(inq.bcc || []);

    const mailOptions = {
      from: `"S.R. Trading Website" <${SMTP_USER}>`,
      to: INQUIRY_TO || "srtsales4820@gmail.com",
      replyTo: { name: inq.name || "Customer", address: inq.email },
      subject,
      text,
      html,
      attachments,
    };
    if (cc.length) mailOptions.cc = cc;
    if (bcc.length) mailOptions.bcc = bcc;

    await t.sendMail(mailOptions);

    console.log(
      `Inquiry email sent: ${inq._id || inq.email} | attachments: ${attachments.length}${failed.length ? ` | failed: ${failed.length}` : ""}`,
    );
  } catch (error) {
    console.error("Inquiry mail failed:", error.message);
  }
};

module.exports.buildEmail = buildEmail;
