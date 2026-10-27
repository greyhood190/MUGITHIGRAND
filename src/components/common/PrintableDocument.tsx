import React, { useState } from 'react';
import { Printer, X, Download, CheckCircle2, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import { Invoice, Payment, Reservation, Stay } from '../../types';
import { useHotel } from '../../context/HotelContext';

interface PrintableDocumentProps {
  type: 'invoice' | 'receipt' | 'reservation' | 'registration';
  invoice?: Invoice;
  payment?: Payment;
  reservation?: Reservation;
  stay?: Stay;
  onClose: () => void;
}

export const PrintableDocument: React.FC<PrintableDocumentProps> = ({
  type,
  invoice,
  payment,
  reservation,
  stay,
  onClose
}) => {
  const { settings } = useHotel();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const hotel = settings || {
    hotelName: 'Mugithi Grand Hotel',
    tagline: 'Premium Hospitality & Comfort in Kiambu',
    address: 'Kalimoni, Juja Constituency',
    location: 'Off Thika Superhighway, Near JKUAT Gate C, Kiambu County, Kenya',
    poBox: 'P.O. Box 450 - 01007, Juja, Kenya',
    phone: '+254 722 890 123',
    email: 'reservations@mugithigrand.co.ke',
    taxPin: 'P051284920K',
    mpesaTillNumber: '8923411',
    mpesaPaybill: '522522 (Acc: MGH-ROOM)'
  };

  const handleDownloadPdf = () => {
    setIsGeneratingPdf(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const margin = 14;
      let y = 18;

      if (type === 'invoice' && invoice) {
        // Document Header
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.setTextColor(15, 23, 42);
        doc.text(hotel.hotelName.toUpperCase(), margin, y);

        y += 6;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(180, 83, 9);
        doc.text(hotel.tagline.toUpperCase(), margin, y);

        // Document Meta (Top Right)
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(15);
        doc.setTextColor(15, 23, 42);
        doc.text('TAX INVOICE', 210 - margin, 18, { align: 'right' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(71, 85, 105);
        doc.text(`Invoice No: ${invoice.invoiceNumber}`, 210 - margin, 24, { align: 'right' });
        doc.text(`Issue Date: ${invoice.issueDate}`, 210 - margin, 29, { align: 'right' });
        doc.text(`Status: ${invoice.status.toUpperCase()}`, 210 - margin, 34, { align: 'right' });

        // Hotel Contacts
        y += 6;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(71, 85, 105);
        doc.text(`${hotel.address}, ${hotel.location}`, margin, y);
        y += 4.5;
        doc.text(`${hotel.poBox} | Tel: ${hotel.phone}`, margin, y);
        y += 4.5;
        doc.text(`Email: ${hotel.email} | KRA PIN: ${hotel.taxPin}`, margin, y);

        // Divider
        y += 6;
        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.4);
        doc.line(margin, y, 210 - margin, y);

        // Guest & Stay Info Box
        y += 5;
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(margin, y, 210 - margin * 2, 28, 2, 2, 'F');

        const boxY = y + 5;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text('BILLED TO (GUEST):', margin + 4, boxY);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(15, 23, 42);
        doc.text(invoice.guestName, margin + 4, boxY + 5.5);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(71, 85, 105);
        doc.text(`Phone: ${invoice.guestPhone}`, margin + 4, boxY + 10.5);
        if (invoice.guestIdNumber) {
          doc.text(`National ID / Passport: ${invoice.guestIdNumber}`, margin + 4, boxY + 15);
        } else if (invoice.guestEmail) {
          doc.text(`Email: ${invoice.guestEmail}`, margin + 4, boxY + 15);
        }

        const rightColX = 115;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text('STAY & ROOM DETAILS:', rightColX, boxY);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(71, 85, 105);
        doc.text(`Room: Room ${invoice.roomNumber} (${invoice.categoryName})`, rightColX, boxY + 5.5);
        doc.text(`Stay Period: ${invoice.checkInDate} → ${invoice.checkOutDate}`, rightColX, boxY + 10.5);
        doc.text(`Duration: ${invoice.billableNights} Night(s)`, rightColX, boxY + 15);

        y += 33;

        // Table Header
        doc.setFillColor(241, 245, 249);
        doc.rect(margin, y, 210 - margin * 2, 7, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(15, 23, 42);
        doc.text('ITEM DESCRIPTION', margin + 3, y + 4.8);
        doc.text('QTY', 125, y + 4.8, { align: 'center' });
        doc.text('UNIT PRICE (KES)', 160, y + 4.8, { align: 'right' });
        doc.text('AMOUNT (KES)', 210 - margin - 3, y + 4.8, { align: 'right' });

        y += 7;

        // Table Items
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(30, 41, 59);

        invoice.items.forEach(item => {
          if (y > 240) {
            doc.addPage();
            y = 20;
          }

          doc.text(item.description, margin + 3, y + 5);
          doc.text(String(item.quantity), 125, y + 5, { align: 'center' });
          doc.text(item.unitPrice.toLocaleString(), 160, y + 5, { align: 'right' });
          doc.text(item.amount.toLocaleString(), 210 - margin - 3, y + 5, { align: 'right' });

          doc.setDrawColor(241, 245, 249);
          doc.line(margin, y + 7, 210 - margin, y + 7);
          y += 7.5;
        });

        y += 4;

        // Financial Calculation Breakdown
        const totalBoxX = 120;
        const totalBoxW = 210 - margin - totalBoxX;

        const addRow = (label: string, valueStr: string, bold = false, fill = false) => {
          if (fill) {
            doc.setFillColor(241, 245, 249);
            doc.rect(totalBoxX, y - 0.5, totalBoxW, 6, 'F');
          }
          doc.setFont('helvetica', bold ? 'bold' : 'normal');
          doc.setFontSize(8);
          doc.setTextColor(bold ? 15 : 71, bold ? 23 : 85, bold ? 42 : 105);
          doc.text(label, totalBoxX + 2, y + 4);
          doc.text(valueStr, 210 - margin - 3, y + 4, { align: 'right' });
          y += 5.5;
        };

        addRow('Subtotal:', `KES ${invoice.subtotal.toLocaleString()}`);
        if (invoice.discountAmount > 0) {
          addRow('Discount / Courtesy:', `-KES ${invoice.discountAmount.toLocaleString()}`);
        }
        addRow(`VAT (${invoice.vatRate}%):`, `KES ${invoice.vatAmount.toLocaleString()}`);
        addRow(`Catering Levy (${invoice.cateringLevyRate}%):`, `KES ${invoice.cateringLevyAmount.toLocaleString()}`);
        addRow('Grand Total:', `KES ${invoice.grandTotal.toLocaleString()}`, true, true);
        addRow('Payments Received:', `KES ${invoice.totalPaid.toLocaleString()}`);
        addRow('Balance Due:', `KES ${invoice.balanceDue.toLocaleString()}`, true, true);

        y += 6;

        // Remittance channels note
        doc.setFillColor(254, 243, 199);
        doc.setDrawColor(251, 191, 36);
        doc.roundedRect(margin, y, 210 - margin * 2, 16, 1.5, 1.5, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(120, 53, 15);
        doc.text('OFFICIAL MUGITHI GRAND PAYMENT CHANNELS:', margin + 3, y + 4.5);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(146, 64, 14);
        doc.text(`M-Pesa Buy Goods Till: ${hotel.mpesaTillNumber}  |  M-Pesa Paybill: ${hotel.mpesaPaybill}`, margin + 3, y + 9);
        doc.text(`Bank Wire: Equity Bank Juja Branch | Acc: 0890283920194 | Acc Name: Mugithi Grand Hotel Ltd`, margin + 3, y + 13);

        y += 22;

        // Sign-off
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184);
        doc.text('Mugithi Grand Hotel Management System (MGHMS) · Authorized Front Desk Personnel', margin, y);
        doc.text(`KRA PIN: ${hotel.taxPin} · Official receipt required upon final departure`, margin, y + 3.5);

        doc.setDrawColor(203, 213, 225);
        doc.line(145, y, 210 - margin, y);
        doc.text('Authorized Signature & Stamp', 145, y + 3.5);

        doc.save(`${invoice.invoiceNumber}.pdf`);
      } else if (type === 'receipt' && payment) {
        // Receipt PDF
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.setTextColor(15, 23, 42);
        doc.text(hotel.hotelName.toUpperCase(), margin, y);

        y += 6;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(180, 83, 9);
        doc.text(hotel.tagline.toUpperCase(), margin, y);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(15);
        doc.setTextColor(5, 150, 105);
        doc.text('OFFICIAL RECEIPT', 210 - margin, 18, { align: 'right' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(71, 85, 105);
        doc.text(`Receipt #: ${payment.paymentReference}`, 210 - margin, 24, { align: 'right' });
        doc.text(`Date: ${new Date(payment.timestamp).toLocaleDateString('en-KE')}`, 210 - margin, 29, { align: 'right' });

        y += 10;
        doc.setFillColor(236, 253, 245);
        doc.setDrawColor(167, 243, 208);
        doc.roundedRect(margin, y, 210 - margin * 2, 22, 2, 2, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(6, 95, 70);
        doc.text(`AMOUNT PAID: KES ${payment.amount.toLocaleString()}`, margin + 5, y + 9);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(4, 120, 87);
        doc.text(`Payment Method: ${payment.method}  |  Ref: ${payment.transactionReference}`, margin + 5, y + 16);

        y += 28;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(15, 23, 42);
        doc.text(`Received From: ${payment.guestName}`, margin, y);
        y += 6;
        doc.text(`Cashier / Attendant: ${payment.receivedBy}`, margin, y);
        if (payment.notes) {
          y += 6;
          doc.text(`Notes: ${payment.notes}`, margin, y);
        }

        y += 20;
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184);
        doc.text(`Mugithi Grand Hotel · M-Pesa Till: ${hotel.mpesaTillNumber} · KRA PIN: ${hotel.taxPin}`, margin, y);

        doc.save(`${payment.paymentReference}.pdf`);
      } else if (type === 'reservation' && reservation) {
        // Reservation Voucher PDF
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.setTextColor(15, 23, 42);
        doc.text(hotel.hotelName.toUpperCase(), margin, y);

        y += 6;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(180, 83, 9);
        doc.text('BOOKING CONFIRMATION VOUCHER', margin, y);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(71, 85, 105);
        doc.text(`Reference: ${reservation.reference}`, 210 - margin, 18, { align: 'right' });
        doc.text(`Status: ${reservation.status.toUpperCase()}`, 210 - margin, 24, { align: 'right' });

        y += 12;
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(margin, y, 210 - margin * 2, 45, 2, 2, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(15, 23, 42);
        doc.text(`Guest: ${reservation.guestName} (${reservation.guestPhone})`, margin + 5, y + 8);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(71, 85, 105);
        doc.text(`Room Category: ${reservation.categoryName}`, margin + 5, y + 15);
        doc.text(`Stay Dates: ${reservation.checkInDate} to ${reservation.checkOutDate} (${reservation.totalNights} Nights)`, margin + 5, y + 21);
        doc.text(`Nightly Rate: KES ${reservation.nightlyRate.toLocaleString()}`, margin + 5, y + 27);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(`Estimated Total: KES ${reservation.estimatedTotal.toLocaleString()}`, margin + 5, y + 34);

        y += 55;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184);
        doc.text(`Mugithi Grand Hotel, Kalimoni, Juja, Kenya · Tel: ${hotel.phone}`, margin, y);

        doc.save(`${reservation.reference}.pdf`);
      } else {
        // Generic fallback print window
        window.print();
      }
    } catch (err) {
      console.error('PDF generation error:', err);
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const getDocTitle = () => {
    switch (type) {
      case 'invoice': return 'Official Tax Invoice';
      case 'receipt': return 'Official Payment Receipt';
      case 'reservation': return 'Booking Confirmation Voucher';
      case 'registration': return 'Guest Registration Record';
      default: return 'Hotel Document';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 p-3 sm:p-6 backdrop-blur-xs flex items-center justify-center">
      <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-300 my-auto">
        {/* Top Action Bar (Hidden when printing) */}
        <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between px-5 py-3.5 bg-slate-900 text-white border-b border-slate-800 gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span className="text-sm font-semibold tracking-wide uppercase">
              {getDocTitle()}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap sm:flex-nowrap">
            {/* Download to PDF button */}
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-sm transition disabled:opacity-50 cursor-pointer"
              title="Download official PDF to your computer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isGeneratingPdf ? 'Creating PDF...' : 'Download to PDF'}</span>
            </button>

            {/* Print button */}
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg shadow-sm transition cursor-pointer"
              title="Print document or send to printer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            {/* Cancel button */}
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition cursor-pointer"
              title="Close and cancel preview"
              aria-label="Cancel"
            >
              <X className="w-3.5 h-3.5 text-slate-400" />
              <span>Cancel</span>
            </button>
          </div>
        </div>

        {/* Printable Paper Area */}
        <div className="p-6 sm:p-10 text-slate-800 bg-white max-h-[75vh] overflow-y-auto" id="printable-area">
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 font-brand tracking-wider">
                {hotel.hotelName}
              </h1>
              <p className="text-xs font-semibold text-amber-800 uppercase tracking-widest mt-0.5">
                {hotel.tagline}
              </p>
              <p className="text-xs text-slate-600 mt-2 max-w-md leading-relaxed">
                {hotel.address}, {hotel.location}<br />
                {hotel.poBox} | Tel: {hotel.phone}<br />
                Email: {hotel.email} | KRA PIN: <span className="font-semibold">{hotel.taxPin}</span>
              </p>
            </div>
            <div className="text-right">
              <div className="inline-block px-3 py-1 bg-slate-100 border border-slate-300 rounded text-right">
                <span className="text-xs uppercase font-bold text-slate-500 block">Document Type</span>
                <span className="text-sm font-extrabold text-slate-900 uppercase">
                  {type === 'invoice' && 'Tax Invoice'}
                  {type === 'receipt' && 'Official Receipt'}
                  {type === 'reservation' && 'Booking Voucher'}
                  {type === 'registration' && 'Guest Registration'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Date: {new Date().toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Type 1: TAX INVOICE */}
          {type === 'invoice' && invoice && (
            <div>
              <div className="grid grid-cols-2 gap-6 mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs">
                <div>
                  <h3 className="font-bold text-slate-900 uppercase tracking-wide mb-1.5">Billed To:</h3>
                  <p className="font-semibold text-slate-800 text-sm">{invoice.guestName}</p>
                  <p className="text-slate-600">Phone: {invoice.guestPhone}</p>
                  {invoice.guestEmail && <p className="text-slate-600">Email: {invoice.guestEmail}</p>}
                  {invoice.guestIdNumber && <p className="text-slate-600">ID / Passport: {invoice.guestIdNumber}</p>}
                </div>
                <div className="text-right sm:text-left sm:pl-6 border-l border-slate-200">
                  <h3 className="font-bold text-slate-900 uppercase tracking-wide mb-1.5">Stay Information:</h3>
                  <p><span className="text-slate-500">Invoice No:</span> <strong className="text-slate-900">{invoice.invoiceNumber}</strong></p>
                  <p><span className="text-slate-500">Room:</span> <strong>{invoice.roomNumber} ({invoice.categoryName})</strong></p>
                  <p><span className="text-slate-500">Stay Period:</span> {invoice.checkInDate} to {invoice.checkOutDate} ({invoice.billableNights} Nights)</p>
                  <p><span className="text-slate-500">Status:</span> <strong className="uppercase">{invoice.status}</strong></p>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-xs text-left border-collapse mb-6">
                <thead>
                  <tr className="border-b border-slate-900 bg-slate-100 text-slate-900 uppercase font-semibold">
                    <th className="py-2.5 px-3">Item Description</th>
                    <th className="py-2.5 px-2 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Unit Rate</th>
                    <th className="py-2.5 px-3 text-right">Amount (KES)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {invoice.items.map((item, idx) => (
                    <tr key={idx} className={item.type === 'Tax' ? 'text-slate-500 italic' : ''}>
                      <td className="py-2.5 px-3">
                        <span className="font-medium text-slate-800">{item.description}</span>
                        {item.type && item.type !== 'Accommodation' && item.type !== 'Tax' && (
                          <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            {item.type}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-2 text-center">{item.quantity}</td>
                      <td className="py-2.5 px-3 text-right">{item.unitPrice < 0 ? `-${Math.abs(item.unitPrice).toLocaleString()}` : item.unitPrice.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right font-medium">{item.amount < 0 ? `-${Math.abs(item.amount).toLocaleString()}` : item.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Financial Totals */}
              <div className="flex justify-end mb-6">
                <div className="w-72 space-y-1.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-600">Subtotal:</span>
                    <span className="font-semibold text-slate-800">KES {invoice.subtotal.toLocaleString()}</span>
                  </div>
                  {invoice.discountAmount > 0 && (
                    <div className="flex justify-between py-1 text-emerald-700">
                      <span>Discount / Courtesy:</span>
                      <span>-KES {invoice.discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-1 border-b border-slate-200 text-slate-600">
                    <span>VAT ({invoice.vatRate}%):</span>
                    <span>KES {invoice.vatAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200 text-slate-600">
                    <span>Catering Tourism Levy ({invoice.cateringLevyRate}%):</span>
                    <span>KES {invoice.cateringLevyAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b-2 border-slate-900 text-sm font-bold text-slate-950">
                    <span>Grand Total:</span>
                    <span>KES {invoice.grandTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1 text-slate-700">
                    <span>Payments Received:</span>
                    <span className="font-medium text-emerald-700">KES {invoice.totalPaid.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1.5 bg-slate-100 px-2 rounded font-extrabold text-sm text-slate-900">
                    <span>Balance Due:</span>
                    <span className={invoice.balanceDue > 0 ? 'text-rose-700' : 'text-emerald-700'}>
                      KES {invoice.balanceDue.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Remittance note */}
              <div className="text-[11px] text-slate-600 bg-amber-50/70 p-3 rounded border border-amber-200 mb-6">
                <p className="font-bold text-slate-900 mb-0.5">Payment Channels:</p>
                <p>M-Pesa Buy Goods Till: <strong className="text-slate-900">{hotel.mpesaTillNumber}</strong> | Paybill: <strong className="text-slate-900">{hotel.mpesaPaybill}</strong></p>
                <p>Bank: Equity Bank Juja Branch | Acc: 0890283920194 | Acc Name: Mugithi Grand Hotel Ltd</p>
              </div>
            </div>
          )}

          {/* Type 2: OFFICIAL PAYMENT RECEIPT */}
          {type === 'receipt' && payment && (
            <div>
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg mb-6 text-center">
                <span className="text-xs uppercase font-bold text-emerald-800 tracking-wider">Payment Acknowledged</span>
                <h2 className="text-3xl font-extrabold text-emerald-950 mt-1">
                  KES {payment.amount.toLocaleString()}
                </h2>
                <p className="text-xs text-emerald-700 mt-1">Method: {payment.method} | Ref: {payment.transactionReference}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs mb-8">
                <div>
                  <span className="text-slate-500 block">Receipt Reference:</span>
                  <span className="font-bold text-slate-900">{payment.paymentReference}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Received From:</span>
                  <span className="font-bold text-slate-900">{payment.guestName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Date & Time:</span>
                  <span className="font-semibold text-slate-800">{new Date(payment.timestamp).toLocaleString('en-KE')}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Receiving Cashier / Staff:</span>
                  <span className="font-semibold text-slate-800">{payment.receivedBy}</span>
                </div>
                {payment.notes && (
                  <div className="col-span-2">
                    <span className="text-slate-500 block">Transaction Notes:</span>
                    <span className="text-slate-700 italic">{payment.notes}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Type 3: BOOKING RESERVATION VOUCHER */}
          {type === 'reservation' && reservation && (
            <div>
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-lg mb-6 text-xs">
                <div className="flex justify-between items-center border-b border-slate-200 pb-3 mb-3">
                  <div>
                    <span className="text-slate-500 block">Reservation Reference:</span>
                    <strong className="text-base text-slate-900">{reservation.reference}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 block">Status:</span>
                    <strong className="text-emerald-700 uppercase">{reservation.status}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-500">Guest Name:</p>
                    <p className="font-bold text-slate-900">{reservation.guestName}</p>
                    <p className="text-slate-600">{reservation.guestPhone}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Accommodation:</p>
                    <p className="font-bold text-slate-900">{reservation.categoryName}</p>
                    <p className="text-slate-600">Assigned Room: {reservation.roomNumber || 'Allocated at Check-in'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Arrival (Check-in):</p>
                    <p className="font-bold text-slate-900">{reservation.checkInDate} (From 14:00)</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Departure (Check-out):</p>
                    <p className="font-bold text-slate-900">{reservation.checkOutDate} (Until 10:30)</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Estimated Total:</p>
                    <p className="font-extrabold text-slate-950 text-sm">KES {reservation.estimatedTotal.toLocaleString()}</p>
                    <p className="text-[11px] text-slate-500">({reservation.totalNights} nights @ KES {reservation.nightlyRate.toLocaleString()})</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Special Instructions:</p>
                    <p className="text-slate-700 italic">{reservation.specialRequests || 'Standard hospitality setup'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Type 4: GUEST REGISTRATION CARD */}
          {type === 'registration' && stay && (
            <div>
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-lg mb-6 text-xs">
                <div className="flex justify-between items-center border-b border-slate-200 pb-3 mb-3">
                  <div>
                    <span className="text-slate-500 block">Stay Reference:</span>
                    <strong className="text-base text-slate-900">{stay.stayReference}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 block">Allocated Room:</span>
                    <strong className="text-base text-amber-700 font-bold">Room {stay.roomNumber} ({stay.categoryName})</strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-500">Guest Name:</p>
                    <p className="font-bold text-slate-900">{stay.guestName}</p>
                    <p className="text-slate-600">{stay.guestPhone}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Identification / Passport:</p>
                    <p className="font-bold text-slate-900">{(stay as any).guestIdNumber || stay.notes || 'Verified at check-in'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Check-in Time:</p>
                    <p className="font-semibold text-slate-800">{new Date(stay.checkInTime).toLocaleString('en-KE')}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Expected Departure:</p>
                    <p className="font-semibold text-slate-800">{stay.expectedCheckOutDate} (10:30 AM)</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Signature */}
          <div className="border-t border-slate-300 pt-6 mt-8 flex justify-between items-end text-xs text-slate-500">
            <div>
              <p>Mugithi Grand Hotel Management System (MGHMS)</p>
              <p>Generated by authorized personnel on duty.</p>
            </div>
            <div className="text-center w-48">
              <div className="border-b border-slate-400 mb-1 h-8"></div>
              <p className="text-[11px] uppercase tracking-wider">Authorized Signature & Stamp</p>
            </div>
          </div>
        </div>

        {/* Bottom Action Footer Bar (Visible on screen, hidden on print) */}
        <div className="no-print bg-slate-50 border-t border-slate-200 px-5 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            Document generated by Mugithi Grand Hotel Management System.
          </p>
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {/* Cancel Button */}
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition cursor-pointer flex items-center gap-1.5"
            >
              <X className="w-4 h-4 text-slate-500" />
              <span>Cancel</span>
            </button>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg shadow-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>

            {/* Download to PDF Button */}
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-xs transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>{isGeneratingPdf ? 'Generating...' : 'Download to PDF'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
