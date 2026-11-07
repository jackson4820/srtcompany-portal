const nodemailer = require('nodemailer');
const path = require('path');

const UPLOADS = path.join(__dirname, '../uploads');

// SMTP set na ho to chup-chaap skip: inquiry DB me save hoti hi hai
module.exports = async function sendInquiryMail(inq) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, INQUIRY_TO } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return;
  try {
    const t = nodemailer.createTransport({ host: SMTP_HOST, port: Number(SMTP_PORT) || 587, secure: Number(SMTP_PORT) === 465, auth: { user: SMTP_USER, pass: SMTP_PASS } });
    const items = inq.items || [];
    const itemLines = items.map((it, i) =>
      `${i + 1}. ${it.name}${it.quantity ? ` - Qty: ${it.quantity}` : ''}${it.photo?.path ? ' (photo attached)' : ''}`
    ).join('\n');

    const rows = [
      ['Name', inq.name], ['Email', inq.email], ['Phone', inq.phone], ['Company', inq.company],
      ['Items', itemLines ? `\n${itemLines}` : inq.productName], ['Project', inq.projectName], ['Quantity', inq.quantity],
      ['Delivery location', inq.deliveryLocation], ['Required by', inq.requiredBy && new Date(inq.requiredBy).toDateString()],
      ['Message', inq.message],
    ].filter(([, v]) => v);

    // Item photos aur BOQ file mail ke saath attach
    const attachments = [];
    items.forEach((it, i) => {
      if (it.photo?.path) {
        const safe = it.name.replace(/[^\w\-]+/g, '_').slice(0, 40);
        attachments.push({ filename: `item${i + 1}_${safe}${path.extname(it.photo.path)}`, path: path.join(UPLOADS, it.photo.path) });
      }
    });
    if (inq.attachment?.path) attachments.push({ filename: inq.attachment.originalName || inq.attachment.path, path: path.join(UPLOADS, inq.attachment.path) });

    const first = items[0]?.name;
    const label = first ? `${first}${items.length > 1 ? ` +${items.length - 1} more` : ''}` : (inq.productName || inq.projectName || inq.name);

    await t.sendMail({
      from: `"S.R. Trading Website" <${SMTP_USER}>`,
      to: INQUIRY_TO || 'srtquotation6@gmail.com',
      replyTo: inq.email,
      subject: `New RFQ: ${label}`,
      text: rows.map(([k, v]) => `${k}: ${v}`).join('\n'),
      attachments,
    });
  } catch (e) {
    console.error('Inquiry mail failed:', e.message);
  }
};
