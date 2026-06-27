const jsonServer = require('json-server');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const { Resend } = require('resend');
const crypto = require('crypto');

const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

// ─── Auth Routes ────────────────────────────────────────────────────

server.post('/login', (req, res) => {
  const { email, password } = req.body;
  const db = router.db;
  const user = db.get('users').find({ email, password }).value();

  if (user) {
    const { password, ...userWithoutPassword } = user;
    res.jsonp({
      user: userWithoutPassword,
      token: 'mock-jwt-token-' + Math.random().toString(36).substring(7)
    });
  } else {
    res.status(401).jsonp({ error: "Invalid email or password" });
  }
});

server.post('/signup', (req, res) => {
  const { email, password, name } = req.body;
  const db = router.db;
  const userExists = db.get('users').find({ email }).value();

  if (userExists) {
    res.status(400).jsonp({ error: "User already exists" });
  } else {
    const newUser = {
      id: Date.now().toString(),
      email,
      password,
      name,
      role: 'user'
    };
    db.get('users').push(newUser).write();
    const { password: p, ...userWithoutPassword } = newUser;
    res.jsonp({
      user: userWithoutPassword,
      token: 'mock-jwt-token-' + Math.random().toString(36).substring(7)
    });
  }
});

// ─── UPI Payment Simulation ─────────────────────────────────────────

server.post('/simulate-upi-payment', (req, res) => {
  const { amount, upiId } = req.body;
  setTimeout(() => {
    res.jsonp({
      status: 'success',
      transactionId: 'TXN' + Date.now(),
      message: 'Payment of ₹' + amount + ' received successfully'
    });
  }, 2000);
});

server.post('/api/easebuzz/initiate', async (req, res) => {
  const { txnid, amount, productinfo, firstname, email, phone, udf1, udf2, udf3, udf4, udf5 } = req.body;
  const key = '2JRJU40RU';
  const salt = '3UW7CPPBT';

  // Sequence: key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||salt
  const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|${udf1 || ''}|${udf2 || ''}|${udf3 || ''}|${udf4 || ''}|${udf5 || ''}||||||${salt}`;
  const hash = crypto.createHash('sha512').update(hashString).digest('hex');

  const formData = new URLSearchParams();
  formData.append('key', key);
  formData.append('txnid', txnid);
  formData.append('amount', amount);
  formData.append('productinfo', productinfo);
  formData.append('firstname', firstname);
  formData.append('phone', phone);
  formData.append('email', email);
  formData.append('surl', 'http://localhost:3001/api/easebuzz/success');
  formData.append('furl', 'http://localhost:3001/api/easebuzz/failure');
  formData.append('hash', hash);

  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch('https://testpay.easebuzz.in/payment/initiateLink', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: formData
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Easebuzz initiate error:', error);
    res.status(500).json({ status: 0, message: 'Failed to initiate payment' });
  }
});

server.post('/api/easebuzz/success', (req, res) => {
  const { txnid } = req.body;
  const db = router.db;
  const booking = db.get('bookings').find({ id: txnid }).value();
  if (booking) {
    db.get('bookings').find({ id: txnid }).assign({ status: 'confirmed' }).write();
  }
  res.redirect(`http://localhost:5173/bookings?payment=success&txnid=${txnid}`);
});

server.post('/api/easebuzz/failure', (req, res) => {
  const { txnid } = req.body;
  const db = router.db;
  const booking = db.get('bookings').find({ id: txnid }).value();
  if (booking) {
    db.get('bookings').find({ id: txnid }).assign({ status: 'cancelled' }).write();
  }
  res.redirect(`http://localhost:5173/bookings?payment=failure&txnid=${txnid}`);
});

// ─── Resend Email Setup ─────────────────────────────────────────────

const resend = new Resend('re_hnWedhMu_Dw6KTiw8qiXXmKQN7FByugvq');

// ─── Professional PDF Receipt Generator ─────────────────────────────

async function generateProfessionalPDF(booking) {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      const pageWidth = doc.page.width - 100; // usable width
      const leftX = 50;

      // ── Colored Header Bar ──
      doc.rect(0, 0, doc.page.width, 100).fill('#1e3a8a');
      doc.fontSize(28).fillColor('#ffffff').text('TSWHEELS', leftX, 30, { continued: true });
      doc.fontSize(12).fillColor('#93c5fd').text('  BOOKING RECEIPT', { baseline: 'bottom' });
      doc.fontSize(10).fillColor('#bfdbfe').text('Premium Vehicle Rentals', leftX, 60);

      // Status badge on right
      const statusText = (booking.status || 'CONFIRMED').toUpperCase();
      doc.fontSize(10).fillColor('#86efac').text(statusText, doc.page.width - 150, 40, { width: 100, align: 'right' });
      doc.fontSize(9).fillColor('#bfdbfe').text(`ID: ${booking.id || 'N/A'}`, doc.page.width - 150, 55, { width: 100, align: 'right' });

      // ── QR Code (top-right below header) ──
      const qrText = [
        `Booking: ${booking.id || 'N/A'}`,
        `Customer: ${booking.customerName || 'N/A'}`,
        `Vehicle: ${booking.vehicleName || 'N/A'}`,
        `Amount: Rs.${booking.totalPrice}`
      ].join('\n');
      const qrDataUrl = await QRCode.toDataURL(qrText, { width: 120, margin: 1 });
      doc.image(qrDataUrl, doc.page.width - 170, 110, { width: 120 });

      // ── Customer & Booking Info ──
      let y = 120;
      doc.fontSize(11).fillColor('#1e3a8a').text('CUSTOMER DETAILS', leftX, y, { underline: true });
      y += 20;
      doc.fontSize(10).fillColor('#333333');
      doc.text(`Name: ${booking.customerName || 'N/A'}`, leftX, y); y += 16;
      doc.text(`Email: ${booking.customerEmail || 'N/A'}`, leftX, y); y += 16;
      if (booking.customerPhone) {
        doc.text(`Phone: ${booking.customerPhone}`, leftX, y); y += 16;
      }

      y += 10;
      doc.fontSize(11).fillColor('#1e3a8a').text('VEHICLE DETAILS', leftX, y, { underline: true });
      y += 20;
      doc.fontSize(10).fillColor('#333333');
      doc.text(`Vehicle: ${booking.vehicleName || 'N/A'}`, leftX, y); y += 16;
      doc.text(`RTO Number: ${booking.rtoNumber || 'MH-01-XX-0000'}`, leftX, y); y += 16;

      // Vehicle specs
      const specs = booking.vehicleSpecs || {};
      if (specs.fuelType || specs.transmission || specs.seats) {
        doc.text(`Type: ${specs.fuelType || '-'} | ${specs.transmission || '-'} | ${specs.seats || '-'} Seats`, leftX, y);
        y += 16;
      }
      if (specs.engineCapacity) {
        doc.text(`Engine: ${specs.engineCapacity} | Mileage: ${specs.mileage || '-'}`, leftX, y);
        y += 16;
      }

      // Vehicle features
      const features = booking.vehicleFeatures || [];
      if (features.length > 0) {
        doc.text(`Features: ${features.join(', ')}`, leftX, y, { width: 300 });
        y += Math.ceil(features.join(', ').length / 50) * 14 + 8;
      }

      // ── Rental Period ──
      y += 10;
      doc.fontSize(11).fillColor('#1e3a8a').text('RENTAL PERIOD', leftX, y, { underline: true });
      y += 20;
      doc.fontSize(10).fillColor('#333333');
      doc.text(`Start Date: ${booking.startDate || 'N/A'}`, leftX, y); y += 16;
      doc.text(`End Date: ${booking.endDate || 'N/A'}`, leftX, y); y += 16;

      const startD = new Date(booking.startDate);
      const endD = new Date(booking.endDate);
      const days = Math.max(1, Math.ceil(Math.abs(endD - startD) / (1000 * 60 * 60 * 24)));
      doc.text(`Duration: ${days} ${days === 1 ? 'Day' : 'Days'}`, leftX, y); y += 16;

      // ── Pricing Breakdown ──
      y += 10;
      doc.fontSize(11).fillColor('#1e3a8a').text('CHARGES BREAKDOWN', leftX, y, { underline: true });
      y += 20;

      const rawTotal = parseFloat(booking.totalPrice) || 0;
      const taxRate = 0.12;
      const securityDeposit = 2000;
      const rentalCharge = (rawTotal - securityDeposit) / (1 + taxRate);
      const gstAmount = rentalCharge * taxRate;

      // Table header
      doc.rect(leftX, y, pageWidth, 22).fill('#f1f5f9');
      doc.fontSize(9).fillColor('#475569');
      doc.text('Description', leftX + 10, y + 6, { width: 300 });
      doc.text('Amount', leftX + 350, y + 6, { width: 100, align: 'right' });
      y += 26;

      // Table rows
      const drawRow = (label, amount, bold = false) => {
        doc.fontSize(10).fillColor(bold ? '#1e3a8a' : '#333333');
        if (bold) doc.font('Helvetica-Bold'); else doc.font('Helvetica');
        doc.text(label, leftX + 10, y, { width: 300 });
        doc.text(amount, leftX + 350, y, { width: 100, align: 'right' });
        y += 20;
      };

      drawRow('Vehicle Rental Charge', `Rs. ${rentalCharge.toFixed(2)}`);
      drawRow('CGST + SGST (12%)', `Rs. ${gstAmount.toFixed(2)}`);
      drawRow('Refundable Security Deposit', `Rs. ${securityDeposit.toFixed(2)}`);

      // Separator
      doc.moveTo(leftX, y).lineTo(leftX + pageWidth, y).strokeColor('#cbd5e1').stroke();
      y += 8;

      drawRow('TOTAL AMOUNT PAID', `Rs. ${rawTotal.toFixed(2)}`, true);
      doc.font('Helvetica'); // reset font

      // ── Payment Info ──
      y += 10;
      doc.fontSize(11).fillColor('#1e3a8a').text('PAYMENT DETAILS', leftX, y, { underline: true });
      y += 20;
      doc.fontSize(10).fillColor('#333333');
      doc.text(`Payment Method: ${(booking.paymentMethod || 'UPI').toUpperCase()}`, leftX, y); y += 16;
      doc.text(`Transaction ID: ${booking.transactionId || 'N/A'}`, leftX, y); y += 16;

      // ── Footer ──
      y += 30;
      doc.moveTo(leftX, y).lineTo(leftX + pageWidth, y).strokeColor('#e2e8f0').stroke();
      y += 15;
      doc.fontSize(10).fillColor('#64748b').text('Thank you for choosing TSWHEELS!', leftX, y, { align: 'center', width: pageWidth });
      y += 16;
      doc.fontSize(8).fillColor('#94a3b8').text('This is a computer-generated receipt. No signature required.', leftX, y, { align: 'center', width: pageWidth });
      y += 14;
      doc.text(`Generated on: ${new Date().toLocaleString('en-IN')} | support@tswheels.com`, leftX, y, { align: 'center', width: pageWidth });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

// ─── PDF Receipt Download Endpoint ──────────────────────────────────

server.post('/api/generate-receipt-pdf', async (req, res) => {
  const { booking } = req.body;
  if (!booking) {
    return res.status(400).json({ error: 'Booking data missing' });
  }

  try {
    const pdfBuffer = await generateProfessionalPDF(booking);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="TSWheels-Receipt-${booking.id || 'booking'}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error('[PDF] Generation error:', err);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// ─── Email Confirmation Endpoint ────────────────────────────────────

server.post('/api/send-email', async (req, res) => {
  const { to, subject, booking } = req.body;

  if (!to || !booking) {
    return res.status(400).jsonp({ error: 'Missing to or booking details' });
  }

  // Build vehicle details section for the email
  const vehicleImage = booking.vehicleImage || '';
  const vehicleFeatures = booking.vehicleFeatures || [];
  const vehicleSpecs = booking.vehicleSpecs || {};
  const rtoNumber = booking.rtoNumber || 'MH-01-XX-0000';

  const vehicleImageHtml = vehicleImage
    ? `<div style="text-align: center; margin: 15px 0;">
         <img src="${vehicleImage}" alt="${booking.vehicleName}" style="max-width: 100%; max-height: 200px; border-radius: 8px; border: 1px solid #e2e8f0;" />
       </div>`
    : '';

  const featuresHtml = vehicleFeatures.length > 0
    ? `<tr>
         <td style="padding: 6px 0; font-weight: bold; color: #475569;">Features:</td>
         <td style="padding: 6px 0; color: #0f172a;">${vehicleFeatures.join(', ')}</td>
       </tr>`
    : '';

  const specsHtml = `
    ${vehicleSpecs.fuelType ? `<tr><td style="padding: 4px 0; font-weight: bold; color: #475569; width: 140px;">Fuel Type:</td><td style="padding: 4px 0; color: #0f172a;">${vehicleSpecs.fuelType}</td></tr>` : ''}
    ${vehicleSpecs.transmission ? `<tr><td style="padding: 4px 0; font-weight: bold; color: #475569;">Transmission:</td><td style="padding: 4px 0; color: #0f172a;">${vehicleSpecs.transmission}</td></tr>` : ''}
    ${vehicleSpecs.seats ? `<tr><td style="padding: 4px 0; font-weight: bold; color: #475569;">Seats:</td><td style="padding: 4px 0; color: #0f172a;">${vehicleSpecs.seats}</td></tr>` : ''}
    ${vehicleSpecs.engineCapacity ? `<tr><td style="padding: 4px 0; font-weight: bold; color: #475569;">Engine:</td><td style="padding: 4px 0; color: #0f172a;">${vehicleSpecs.engineCapacity}</td></tr>` : ''}
    ${vehicleSpecs.mileage ? `<tr><td style="padding: 4px 0; font-weight: bold; color: #475569;">Mileage:</td><td style="padding: 4px 0; color: #0f172a;">${vehicleSpecs.mileage}</td></tr>` : ''}
  `;

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
      <div style="text-align: center; border-bottom: 2px solid #3b82f6; padding-bottom: 20px;">
        <h1 style="color: #1e3a8a; margin: 0;">TSWheels Rental Confirmation</h1>
        <p style="color: #6b7280; font-size: 14px; margin: 5px 0 0 0;">Thank you for renting with TSWheels!</p>
      </div>

      <div style="padding: 20px 0; line-height: 1.6; color: #334155;">
        <p>Dear ${booking.customerName || 'Customer'},</p>
        <p>Your booking is confirmed! Below are your booking and payment details:</p>

        ${vehicleImageHtml}

        <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #1e3a8a; font-size: 18px; margin-top: 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Vehicle Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #475569; width: 140px;">Vehicle:</td>
              <td style="padding: 6px 0; color: #0f172a;">${booking.vehicleName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #475569;">RTO Number:</td>
              <td style="padding: 6px 0; color: #0f172a;">${rtoNumber}</td>
            </tr>
            ${specsHtml}
            ${featuresHtml}
          </table>
        </div>

        <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #1e3a8a; font-size: 18px; margin-top: 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Booking Summary</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #475569; width: 140px;">Booking ID:</td>
              <td style="padding: 6px 0; color: #0f172a;">${booking.id || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #475569;">Start Date:</td>
              <td style="padding: 6px 0; color: #0f172a;">${booking.startDate}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #475569;">End Date:</td>
              <td style="padding: 6px 0; color: #0f172a;">${booking.endDate}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #475569;">Transaction ID:</td>
              <td style="padding: 6px 0; color: #0f172a;"><code>${booking.transactionId}</code></td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #475569;">Payment Method:</td>
              <td style="padding: 6px 0; color: #0f172a; text-transform: uppercase;">${booking.paymentMethod}</td>
            </tr>
            <tr style="border-top: 1px solid #e2e8f0;">
              <td style="padding: 10px 0 0 0; font-weight: bold; color: #1e3a8a; font-size: 16px;">Total Price Paid:</td>
              <td style="padding: 10px 0 0 0; color: #1e3a8a; font-weight: bold; font-size: 16px;">Rs. ${booking.totalPrice}</td>
            </tr>
          </table>
        </div>

        <p>You can view your active booking, print your receipt, or track your vehicle's live GPS location at any time by visiting your bookings dashboard on our portal.</p>

        <div style="text-align: center; margin: 30px 0 10px 0;">
          <a href="http://localhost:5173/bookings" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Go to My Bookings</a>
        </div>
      </div>

      <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 12px; color: #94a3b8; text-align: center;">
        <p>If you have any questions or require immediate support, please contact us at support@tswheels.com or call our 24/7 hotline.</p>
        <p>&copy; ${new Date().getFullYear()} TSWheels. All rights reserved.</p>
      </div>
    </div>
  `;

  try {
    // Generate PDF ticket to attach
    const pdfBuffer = await generateProfessionalPDF(booking);

    const { data, error } = await resend.emails.send({
      from: 'TSWheels Tickets <onboarding@resend.dev>',
      to: [to],
      subject: subject || 'Your TSWheels Booking is Confirmed!',
      html: emailHtml,
      attachments: [
        {
          filename: `TSWheels-Receipt-${booking.id || 'booking'}.pdf`,
          content: pdfBuffer,
        }
      ]
    });

    if (error) {
      console.error('[Email] Resend Error:', error);
      return res.status(500).jsonp({ error: 'Failed to send email via Resend', details: error });
    }

    console.log(`[Email] Sent ticket to ${to} via Resend. ID: ${data.id}`);
    return res.jsonp({
      success: true,
      messageId: data.id,
      html: emailHtml
    });
  } catch (err) {
    console.error('[Email] Error sending email or generating PDF:', err);
    return res.status(500).jsonp({ error: 'Failed to send email' });
  }
});

// ─── JSON Server Router ─────────────────────────────────────────────

server.use(router);
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`JSON Server is running on port ${PORT}`);
});
