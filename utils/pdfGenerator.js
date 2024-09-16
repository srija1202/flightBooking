const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generatePDF = async (booking, paymentIntentId, amount) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const filePath = path.join(__dirname, '../uploads', `${booking._id}.pdf`);

    doc.pipe(fs.createWriteStream(filePath));

    // Title
    doc.fontSize(20).text('Booking Confirmation', { align: 'center' });
    doc.moveDown(2);

    // Booking Details
    doc.fontSize(14).text('Booking Details', { underline: true });
    doc.moveDown();
    doc.fontSize(12)
       .text(`Booking Reference: ${booking._id}`)
       .text(`Flight: ${booking.flight}`)
       .text(`Departure: ${booking.departure}`)
       .text(`Arrival: ${booking.arrival}`)
       .text(`Total Price: $${amount.toFixed(2)}`)
       .text(`Payment Intent ID: ${paymentIntentId}`);
    doc.moveDown();

    // Passengers Section
    doc.fontSize(14).text('Passengers:', { underline: true });
    doc.moveDown();

    booking.passengers.forEach((passenger, index) => {
      doc.fontSize(12).text(`${index + 1}. ${passenger.name}`, { bold: true });
      doc.fontSize(12).text(`   Seat Preference: ${passenger.seatPreference}`);
      doc.moveDown();
    });

    // Footer
    doc.moveDown();
    doc.fontSize(10).text('Thank you for booking with us!', { align: 'center' });

    doc.end();

    doc.on('finish', () => {
      resolve(filePath);
    });

    doc.on('error', reject);
  });
};


module.exports = generatePDF;
