const fs = require('fs');
const oldFile = fs.readFileSync('server.json-server.cjs', 'utf-8');
const newFile = fs.readFileSync('api/index.js', 'utf-8');

// Extract Resend Setup
const resendMatch = oldFile.match(/\/\/ ─── Resend Email Setup ───+[\s\S]*?(?=\/\/ ─── Professional PDF Receipt Generator)/);
const resendCode = resendMatch ? resendMatch[0] : '';

// Extract PDF logic
const pdfMatch = oldFile.match(/\/\/ ─── Professional PDF Receipt Generator ───+[\s\S]*?(?=\/\/ ─── Email Confirmation Endpoint)/);
const pdfCode = pdfMatch ? pdfMatch[0] : '';

// Extract Email logic
const emailMatch = oldFile.match(/\/\/ ─── Email Confirmation Endpoint ───+[\s\S]*?(?=\/\/ ─── JSON Server Router)/);
const emailCode = emailMatch ? emailMatch[0] : '';

if (resendCode && pdfCode && emailCode) {
    let replaced = newFile.replace(/\/\/ --- PDF & Email \(Mocked for simplicity\) ---[\s\S]*?(?=module\.exports = app;)/,
      resendCode + '\n' + pdfCode + '\n' + emailCode + '\n'
    );
    
    // add imports
    if (!replaced.includes("require('resend')")) {
        replaced = "const { Resend } = require('resend');\nconst PDFDocument = require('pdfkit');\nconst QRCode = require('qrcode');\n" + replaced;
    }
    
    // Fix server.post -> app.post in the injected code
    replaced = replaced.replace(/server\.post\('/g, "app.post('");
    
    // We also need the standalone generate-receipt route if it was mocked
    const oldGenerateReceipt = `
app.post('/api/generate-receipt', async (req, res) => {
  const { booking } = req.body;
  if (!booking) return res.status(400).json({ error: 'Missing booking details' });
  try {
    const pdfBuffer = await generateProfessionalPDF(booking);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', \`attachment; filename="TSWheels-Receipt-\${booking.id || 'booking'}.pdf"\`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error('[PDF] Generation error:', err);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});
`;
    replaced = replaced.replace(/\/\/ ─── Email Confirmation Endpoint ───+/, oldGenerateReceipt + '\n// ─── Email Confirmation Endpoint ───\n');

    fs.writeFileSync('api/index.js', replaced);
    console.log('Successfully injected email logic into api/index.js');
} else {
    console.log('Failed to extract', !!resendCode, !!pdfCode, !!emailCode);
}
