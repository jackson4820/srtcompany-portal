
const nodemailer = require("nodemailer");
const path = require("path");

const UPLOADS = path.join(__dirname, "../uploads");

const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);

module.exports = async function sendInquiryMail(inq) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, INQUIRY_TO } =
    process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return;

  try {
    const t = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    const items = inq.items || [];

    const attachments = [];

    items.forEach((it, i) => {
      if (it.photo?.path) {
        const safe = (it.name || "item")
          .replace(/[^\w\-]+/g, "_")
          .slice(0, 40);

        attachments.push({
          filename: `item${i + 1}_${safe}${path.extname(it.photo.path)}`,
          path: path.join(UPLOADS, it.photo.path),
        });
      }
    });

    if (inq.attachment?.path) {
      attachments.push({
        filename: inq.attachment.originalName || inq.attachment.path,
        path: path.join(UPLOADS, inq.attachment.path),
      });
    }

    const first = items[0]?.name;
    const label = first
      ? `${first}${items.length > 1 ? ` +${items.length - 1} more` : ""}`
      : inq.productName || inq.projectName || inq.name;

    const formatDate = (date) => {
      if (!date) return "";
      const d = new Date(date);
      return Number.isNaN(d.getTime())
        ? String(date)
        : d.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
    };

    const detailRows = [
      ["Customer Name", inq.name],
      ["Company", inq.company],
      ["Email", inq.email],
      ["Phone", inq.phone],
      ["Project", inq.projectName],
      ["Delivery Location", inq.deliveryLocation],
      ["Required By", formatDate(inq.requiredBy)],
      ["Quantity", inq.quantity],
    ].filter(([, value]) => value);

    const detailHtml = detailRows.map(([key, value]) => `
      <tr>
        <td style="padding:11px 12px;border-bottom:1px solid #e8edf3;color:#64748b;width:38%;font-size:13px;">
          ${escapeHtml(key)}
        </td>
        <td style="padding:11px 12px;border-bottom:1px solid #e8edf3;color:#172033;font-size:14px;font-weight:600;">
          ${escapeHtml(value)}
        </td>
      </tr>
    `).join("");

    const itemHtml = items.length
      ? items.map((it, i) => `
          <tr>
            <td style="padding:12px;border-bottom:1px solid #e8edf3;color:#334155;">
              ${i + 1}. ${escapeHtml(it.name || "Product")}
              ${it.photo?.path ? '<div style="font-size:11px;color:#64748b;">Photo attached</div>' : ""}
            </td>
            <td style="padding:12px;border-bottom:1px solid #e8edf3;text-align:right;font-weight:600;color:#172033;">
              ${escapeHtml(it.quantity || "—")}
            </td>
          </tr>
        `).join("")
      : `
          <tr>
            <td style="padding:12px;">${escapeHtml(inq.productName || "Product details not provided")}</td>
            <td style="padding:12px;text-align:right;">${escapeHtml(inq.quantity || "—")}</td>
          </tr>
        `;

    const messageHtml = inq.message
      ? `
        <div style="background:#f8fafc;border:1px solid #e8edf3;border-radius:8px;padding:16px;color:#334155;font-size:14px;line-height:1.7;white-space:pre-wrap;">${escapeHtml(inq.message)}</div>
      `
      : '<p style="color:#64748b;">No additional message provided.</p>';

    const text = [
      "NEW REQUEST FOR QUOTATION",
      "",
      ...detailRows.map(([key, value]) => `${key}: ${value}`),
      "",
      "REQUESTED MATERIALS",
      ...items.map((it, i) => `${i + 1}. ${it.name} - Qty: ${it.quantity || "—"}`),
      "",
      "CUSTOMER MESSAGE",
      inq.message || "No additional message provided.",
    ].join("\n");

    const html = `
      <div style="margin:0;padding:24px 10px;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
        <div style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">

          <div style="background:#142b45;padding:24px 28px;color:#ffffff;">
            <div style="font-size:22px;font-weight:700;letter-spacing:1px;">S.R. TRADING</div>
            <div style="font-size:12px;color:#cbd5e1;margin-top:5px;">Website Enquiry Notification</div>
          </div>

          <div style="padding:26px 28px 10px;">
            <div style="display:inline-block;background:#e8f2ff;color:#1557a0;padding:7px 12px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:1px;">
              NEW RFQ
            </div>
            <h2 style="font-size:23px;color:#142b45;margin:16px 0 6px;">New Request for Quotation</h2>
            <p style="font-size:13px;color:#64748b;margin:0;">
              A new enquiry has been submitted through your company website.
            </p>
          </div>

          <div style="padding:18px 28px;">
            <h3 style="font-size:16px;color:#142b45;margin:0 0 12px;">Customer Details</h3>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e8edf3;border-radius:8px;border-collapse:separate;border-spacing:0;">
              ${detailHtml}
            </table>
          </div>

          <div style="padding:10px 28px 20px;">
            <h3 style="font-size:16px;color:#142b45;margin:0 0 12px;">Requested Materials</h3>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e8edf3;border-radius:8px;border-collapse:separate;border-spacing:0;">
              <tr style="background:#f1f5f9;">
                <th align="left" style="padding:12px;font-size:12px;color:#475569;">Product / Material</th>
                <th align="right" style="padding:12px;font-size:12px;color:#475569;">Quantity</th>
              </tr>
              ${itemHtml}
            </table>
          </div>

          <div style="padding:10px 28px 24px;">
            <h3 style="font-size:16px;color:#142b45;margin:0 0 12px;">Customer Message</h3>
            ${messageHtml}
          </div>

          ${attachments.length ? `
            <div style="padding:0 28px 22px;color:#475569;font-size:13px;">
              <strong>Attachments:</strong> ${attachments.length} file(s) attached.
            </div>
          ` : ""}

          <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 28px;text-align:center;">
            <div style="font-size:13px;font-weight:700;color:#142b45;">S.R. Trading</div>
            <div style="font-size:11px;color:#64748b;margin-top:5px;">
              Automated RFQ notification from SRT Company Website
            </div>
          </div>

        </div>
      </div>
    `;

    await t.sendMail({
      from: `"S.R. Trading Website" <${SMTP_USER}>`,
      to: INQUIRY_TO || "srtquotation6@gmail.com",
      replyTo: inq.email,
      subject: `New RFQ: ${label}`,
      text,
      html,
      attachments,
    });
  } catch (e) {
    console.error("Inquiry mail failed:", e.message);
  }
};
