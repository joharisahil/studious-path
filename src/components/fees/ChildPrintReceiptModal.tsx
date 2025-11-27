import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, X } from "lucide-react";

export const ChildPrintReceiptModal = ({
  isOpen,
  onClose,
  payment,
  studentName = "",
  registrationNumber = "",
  className = "",
  schoolName = "",
}: {
  isOpen: boolean;
  onClose: () => void;
  payment: any | null;
  studentName?: string;
  registrationNumber?: string;
  className?: string;
  schoolName: string;
}) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const printRef = useRef<HTMLDivElement | null>(null);

  if (!isOpen) return null;

  const fmt = (n?: number) =>
    typeof n === "number" ? `₹${n.toLocaleString()}` : "₹0";

  const paidAmount = payment?.amount ?? payment?.paidAmount ?? 0;
  const mode = payment?.mode ?? payment?.paymentMode ?? "N/A";
  const txn = payment?.transactionId ?? payment?.txnId ?? "-";
  const paidAt =
    payment?.paidAt ?? payment?.paidAtDate ?? payment?.date ?? null;
  const month = payment?.month ?? payment?.installmentMonth ?? "";

  const handlePrint = () => {
    if (!printRef.current) return;

    setIsPrinting(true);
    const printContents = printRef.current.innerHTML;
    const popup = window.open(
      "",
      "_blank",
      "width=850,height=1100,scrollbars=yes"
    );
    if (!popup) {
      alert("Popup blocked. Please allow popups for this site to print.");
      setIsPrinting(false);
      return;
    }

    const styles = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; 
          margin: 20px; 
          color: #1f2937;
          background: #f9fafb;
        }
        
        .receipt-container { 
          max-width: 800px; 
          margin: 0 auto 40px auto;
          page-break-after: always;
        }
        
        .receipt { 
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 16px;
          padding: 40px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          position: relative;
          overflow: hidden;
        }
        
        .receipt-header {
          text-align: center;
          padding-bottom: 24px;
          border-bottom: 3px double #d1d5db;
          margin-bottom: 32px;
        }
        
        .school-name {
          font-size: 32px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
          text-transform: uppercase;
        }
        
        .school-name-decoration {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin-bottom: 12px;
        }
        
        .school-name-decoration::before,
        .school-name-decoration::after {
          content: '';
          height: 2px;
          width: 60px;
          background: linear-gradient(to right, transparent, #3b82f6, transparent);
        }
        
        .receipt-title {
          font-size: 18px;
          font-weight: 600;
          color: #3b82f6;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        
        .copy-badge {
          display: inline-block;
          padding: 6px 16px;
          background: #3b82f6;
          color: white;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 1px;
          margin-top: 8px;
        }
        
        .copy-badge.customer {
          background: #10b981;
        }
        
        .receipt-body {
          margin: 24px 0;
        }
        
        .info-section {
          margin-bottom: 24px;
        }
        
        .info-section-title {
          font-size: 13px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        
        .info-row {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .info-label {
          font-size: 12px;
          font-weight: 500;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .info-value {
          font-size: 15px;
          font-weight: 600;
          color: #111827;
        }
        
        .payment-summary {
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border: 2px solid #3b82f6;
          border-radius: 12px;
          padding: 24px;
          margin: 32px 0;
        }
        
        .payment-summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 8px 0;
        }
        
        .payment-summary-label {
          font-size: 14px;
          font-weight: 500;
          color: #1e40af;
        }
        
        .payment-summary-value {
          font-size: 16px;
          font-weight: 600;
          color: #1e40af;
        }
        
        .total-amount {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 16px;
          margin-top: 16px;
          border-top: 2px solid #3b82f6;
        }
        
        .total-amount-label {
          font-size: 18px;
          font-weight: 700;
          color: #1e40af;
          text-transform: uppercase;
        }
        
        .total-amount-value {
          font-size: 28px;
          font-weight: 700;
          color: #10b981;
        }
        
        .receipt-footer {
          text-align: center;
          padding-top: 24px;
          border-top: 2px solid #e5e7eb;
          margin-top: 32px;
        }
        
        .footer-note {
          font-size: 12px;
          color: #6b7280;
          line-height: 1.6;
          font-style: italic;
        }
        
        .footer-date {
          font-size: 11px;
          color: #9ca3af;
          margin-top: 12px;
        }
        
        .watermark {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-25deg);
          font-size: 72px;
          font-weight: 900;
          color: rgba(16, 185, 129, 0.05);
          pointer-events: none;
          text-transform: uppercase;
          letter-spacing: 8px;
        }
        
        @media print {
          body { margin: 0; background: white; }
          .receipt-container { margin: 0; page-break-after: always; }
          .receipt { box-shadow: none; border: 2px solid #e5e7eb; }
        }
      </style>
    `;

    popup.document.open();
    popup.document.write(
      `<html><head><title>Receipt - ${schoolName}</title>${styles}</head><body>${printContents}</body></html>`
    );
    popup.document.close();

    setTimeout(() => {
      popup.print();
      popup.close();
      setIsPrinting(false);
    }, 500);
  };

  const PrintableContent = ({ schoolName }: { schoolName: string }) => (
    <div ref={printRef as any}>
      {/* ORIGINAL */}
      <div className="receipt-container">
        <div className="receipt">
          <div className="receipt-header">
            <div className="school-name-decoration">
              <div className="school-name">{schoolName}</div>
            </div>
            <div className="receipt-title">Payment Receipt</div>
            <div className="copy-badge">Office Copy - Original</div>
          </div>

          <div className="receipt-body">
            <div className="info-section">
              <div className="info-section-title">Student Information</div>
              <div className="info-grid">
                <div className="info-row">
                  
                  <div className="info-label">Student Name</div>
                  <div className="info-value">{studentName}</div>
                </div>
                <div className="info-row">
                  
                  <div className="info-label">Registration No</div>
                  <div className="info-value">{registrationNumber}</div>
                </div>
                <div className="info-row">
                  <div className="info-label">Class</div>
                  <div className="info-value">{className}</div>
                </div>
              </div>
            </div>

            <div className="info-section">
              <div className="info-section-title">Payment Details</div>
              <div className="info-grid">
                <div className="info-row">
                  <div className="info-label">Payment For</div>
                  <div className="info-value">{month || "Tuition Fee"}</div>
                </div>
                <div className="info-row">
                  <div className="info-label">Payment Mode</div>
                  <div className="info-value">{mode}</div>
                </div>
                <div className="info-row">
                  <div className="info-label">Transaction ID</div>
                  <div className="info-value">{txn}</div>
                </div>
                <div className="info-row">
                  <div className="info-label">Payment Date</div>
                  <div className="info-value">
                    {paidAt ? new Date(paidAt).toLocaleDateString('en-IN', { 
                      day: '2-digit', 
                      month: 'short', 
                      year: 'numeric' 
                    }) : new Date().toLocaleDateString('en-IN', { 
                      day: '2-digit', 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="payment-summary">
              <div className="payment-summary-row">
                <div className="payment-summary-label">Amount Paid</div>
                <div className="payment-summary-value">{fmt(paidAmount)}</div>
              </div>
              <div className="total-amount">
                <div className="total-amount-label">Total Received</div>
                <div className="total-amount-value">{fmt(paidAmount)}</div>
              </div>
            </div>
          </div>

          <div className="receipt-footer">
            <div className="footer-note">
              This is the original receipt. Please retain this copy for official records.
              <br />
              For any queries, please contact the school administration.
            </div>
            <div className="footer-date">
              Generated on: {new Date().toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* CUSTOMER COPY */}
      <div className="receipt-container">
        <div className="receipt">
          <div className="watermark">Customer Copy</div>
          
          <div className="receipt-header">
            <div className="school-name-decoration">
              <div className="school-name">{schoolName}</div>
            </div>
            <div className="receipt-title">Payment Receipt</div>
            <div className="copy-badge customer">Customer Copy</div>
          </div>

          <div className="receipt-body">
            <div className="info-section">
              <div className="info-section-title">Student Information</div>
              <div className="info-grid">
                <div className="info-row">
                  <div className="info-label">Student Name</div>
                  <div className="info-value">{studentName}</div>
                </div>
                <div className="info-row">
                  
                  <div className="info-label">Registration No</div>
                  <div className="info-value">{registrationNumber}</div>
                </div>
                <div className="info-row">
                  <div className="info-label">Class</div>
                  <div className="info-value">{className}</div>
                </div>
              </div>
            </div>

            <div className="info-section">
              <div className="info-section-title">Payment Details</div>
              <div className="info-grid">
                <div className="info-row">
                  <div className="info-label">Payment For</div>
                  <div className="info-value">{month || "Tuition Fee"}</div>
                </div>
                <div className="info-row">
                  <div className="info-label">Payment Mode</div>
                  <div className="info-value">{mode}</div>
                </div>
                <div className="info-row">
                  <div className="info-label">Transaction ID</div>
                  <div className="info-value">{txn}</div>
                </div>
                <div className="info-row">
                  <div className="info-label">Payment Date</div>
                  <div className="info-value">
                    {paidAt ? new Date(paidAt).toLocaleDateString('en-IN', { 
                      day: '2-digit', 
                      month: 'short', 
                      year: 'numeric' 
                    }) : new Date().toLocaleDateString('en-IN', { 
                      day: '2-digit', 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="payment-summary">
              <div className="payment-summary-row">
                <div className="payment-summary-label">Amount Paid</div>
                <div className="payment-summary-value">{fmt(paidAmount)}</div>
              </div>
              <div className="total-amount">
                <div className="total-amount-label">Total Received</div>
                <div className="total-amount-value">{fmt(paidAmount)}</div>
              </div>
            </div>
          </div>

          <div className="receipt-footer">
            <div className="footer-note">
              This is your customer copy. Please retain for your records.
              <br />
              Thank you for your payment.
            </div>
            <div className="footer-date">
              Generated on: {new Date().toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const dateStr = paidAt 
    ? new Date(paidAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Printer className="h-6 w-6 text-primary" />
            Receipt Preview
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Enhanced Preview Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 shadow-sm">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{schoolName}</h3>
              <p className="text-sm text-blue-600 font-semibold uppercase tracking-wider">Payment Receipt</p>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Student Name</p>
                  <p className="text-base font-semibold text-gray-900">{studentName}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Class</p>
                  <p className="text-base font-semibold text-gray-900">{className}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Payment For</p>
                  <p className="text-base font-semibold text-gray-900">{month || "Tuition Fee"}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Payment Mode</p>
                  <p className="text-base font-semibold text-gray-900">{mode}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Transaction ID</p>
                  <p className="text-base font-semibold text-gray-900">{txn}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Payment Date</p>
                  <p className="text-base font-semibold text-gray-900">{dateStr}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t-2 border-blue-300">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-700">Total Amount Received</span>
                <span className="text-3xl font-bold text-green-600">{fmt(paidAmount)}</span>
              </div>
            </div>
          </div>

          {/* Info Note */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> Printing will generate two copies - one original for office records and one customer copy.
            </p>
          </div>

          {/* Hidden Printable Content */}
          <div style={{ display: "none" }}>
            <PrintableContent schoolName={schoolName} />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="gap-2">
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={handlePrint} disabled={isPrinting} className="gap-2">
              <Printer className="h-4 w-4" />
              {isPrinting ? "Printing..." : "Print Receipt"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
