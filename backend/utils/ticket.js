const QRCode = require('qrcode');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Generate QR code
exports.generateQRCode = async (bookingId) => {
  try {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const qrData = `${clientUrl}/bookings/${bookingId}/ticket/download`;

    const qrCodePath = path.join(
      __dirname,
      '../uploads/tickets',
      `qr-${bookingId}.png`
    );

    // Create directory if it doesn't exist
    const dir = path.dirname(qrCodePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    await QRCode.toFile(qrCodePath, JSON.stringify(qrData), {
      errorCorrectionLevel: 'H',
      type: 'png',
      width: 300,
    });

    return `/uploads/tickets/qr-${bookingId}.png`;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

// Generate PDF ticket
exports.generateTicketPDF = async (booking) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const pdfPath = path.join(
        __dirname,
        '../uploads/tickets',
        `ticket-${booking._id}.pdf`
      );

      // Create directory if it doesn't exist
      const dir = path.dirname(pdfPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const stream = fs.createWriteStream(pdfPath);
      doc.pipe(stream);

      // Header
      doc.fontSize(24).text('Sportify Ticket', { align: 'center' });
      doc.moveDown();

      // Booking Details
      doc.fontSize(16).text('Booking Details', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12);
      doc.text(`Booking ID: ${booking._id}`);
      doc.text(`Venue: ${booking.venue.name}`);
      doc.text(`Date: ${new Date(booking.bookingDate).toLocaleDateString()}`);
      doc.text(`Time: ${booking.startTime} - ${booking.endTime}`);
      doc.text(`Number of Players: ${booking.numberOfPlayers}`);
      doc.text(`Total Price: $${booking.totalPrice}`);
      doc.moveDown();

      // QR Code
      if (booking.ticket && booking.ticket.qrCode) {
        const qrPath = path.join(__dirname, '..', booking.ticket.qrCode);
        if (fs.existsSync(qrPath)) {
          doc.image(qrPath, {
            fit: [200, 200],
            align: 'center',
          });
          doc.moveDown();
        }
      }

      // Footer
      doc.fontSize(10).text('Thank you for using our service!', {
        align: 'center',
      });

      doc.end();

      stream.on('finish', () => {
        resolve(`/uploads/tickets/ticket-${booking._id}.pdf`);
      });

      stream.on('error', (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
};

