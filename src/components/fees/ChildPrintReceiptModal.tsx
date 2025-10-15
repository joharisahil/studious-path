import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const ChildPrintReceiptModal = ({
  isOpen,
  onClose,
  payment,
  studentName = "",
  className = "",
}: {
  isOpen: boolean;
  onClose: () => void;
  payment: any | null;
  studentName?: string;
  className?: string;
}) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const printRef = useRef<HTMLDivElement | null>(null);

  // Safety: if no payment, render minimal UI (prevents undefined access errors)
  if (!isOpen) return null;

  // helper formatting
  const fmt = (n?: number) =>
    typeof n === "number" ? `₹${n.toLocaleString()}` : "₹0";

  const paidAmount = payment?.amount ?? payment?.paidAmount ?? 0;
  const mode = payment?.mode ?? payment?.paymentMode ?? "N/A";
  const txn = payment?.transactionId ?? payment?.txnId ?? "-";
  const paidAt =
    payment?.paidAt ?? payment?.paidAtDate ?? payment?.date ?? null;
  const month = payment?.month ?? payment?.installmentMonth ?? "";

  const handlePrint = () => {
    // Print only the printRef contents using a simple approach:
    // open a new window with the printable HTML and call print.
    if (!printRef.current) return;

    setIsPrinting(true);
    const printContents = printRef.current.innerHTML;
    const popup = window.open(
      "",
      "_blank",
      "width=800,height=1100,scrollbars=yes"
    );
    if (!popup) {
      alert("Popup blocked. Please allow popups for this site to print.");
      setIsPrinting(false);
      return;
    }

    // Basic styles for print layout (you can expand this)
    const styles = `
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial; margin:20px; color:#111; }
        .receipt { border: 1px solid #ddd; padding: 16px; margin-bottom: 18px; border-radius: 6px; width: 100%; box-sizing: border-box; }
        .receipt h3 { margin: 0 0 6px 0; }
        .receipt .meta { font-size: 13px; color: #444; margin-bottom: 10px; }
        .receipt .row { display:flex; justify-content:space-between; margin:6px 0; font-size:14px; }
        .receipt .total { font-weight:700; font-size:16px; margin-top:10px; }
        .watermark { position: absolute; top:40%; left:10%; font-size:48px; color:rgba(0,0,0,0.06); transform:rotate(-20deg); pointer-events:none; }
        .copy-note { font-size:12px; color:#666; margin-top:6px; }
      </style>
    `;

    popup.document.open();
    popup.document.write(
      `<html><head><title>Receipt</title>${styles}</head><body>${printContents}</body></html>`
    );
    popup.document.close();

    // Give browser a moment to render then call print
    setTimeout(() => {
      popup.print();
      popup.close();
      setIsPrinting(false);
    }, 350);
  };

  // Build the printable markup: two receipts — ORIGINAL and COPY
  const PrintableContent = () => (
    <div ref={printRef as any}>
      {/* ORIGINAL */}
      <div className="receipt" style={{ position: "relative" }}>
        <h3 style={{ marginBottom: 6 }}>SCHOOL NAME / Receipt (ORIGINAL)</h3>
        <div className="meta">For office records</div>

        <div className="row">
          <div>Student</div>
          <div>{studentName}</div>
        </div>
        <div className="row">
          <div>Class</div>
          <div>{className}</div>
        </div>
        <div className="row">
          <div>Payment For</div>
          <div>{month || "Tuition"}</div>
        </div>
        <div className="row">
          <div>Amount</div>
          <div>{fmt(paidAmount)}</div>
        </div>
        <div className="row">
          <div>Mode</div>
          <div>{mode}</div>
        </div>
        <div className="row">
          <div>Transaction ID</div>
          <div>{txn}</div>
        </div>
        <div className="row">
          <div>Date</div>
          <div>
            {paidAt
              ? new Date(paidAt).toLocaleString()
              : new Date().toLocaleString()}
          </div>
        </div>

        <div className="total">Received Amount: {fmt(paidAmount)}</div>
        <div className="copy-note">
          This is the ORIGINAL receipt. Keep for your records.
        </div>
      </div>

      {/* COPY (slightly different: watermark + "Customer Copy") */}
      <div className="receipt" style={{ position: "relative" }}>
        <div style={{ position: "absolute", inset: 0 }}>
          <div className="watermark">CUSTOMER COPY</div>
        </div>

        <h3 style={{ marginBottom: 6 }}>SCHOOL NAME / Receipt (COPY)</h3>
        <div className="meta">Customer copy</div>

        <div className="row">
          <div>Student</div>
          <div>{studentName}</div>
        </div>
        <div className="row">
          <div>Class</div>
          <div>{className}</div>
        </div>
        <div className="row">
          <div>Payment For</div>
          <div>{month || "Tuition"}</div>
        </div>
        <div className="row">
          <div>Amount</div>
          <div>{fmt(paidAmount)}</div>
        </div>
        <div className="row">
          <div>Mode</div>
          <div>{mode}</div>
        </div>
        <div className="row">
          <div>Transaction ID</div>
          <div>{txn}</div>
        </div>
        <div className="row">
          <div>Date</div>
          <div>
            {paidAt
              ? new Date(paidAt).toLocaleString()
              : new Date().toLocaleString()}
          </div>
        </div>

        <div className="total">Received Amount: {fmt(paidAmount)}</div>
        <div className="copy-note">
          This is the CUSTOMER COPY. Please retain for your reference.
        </div>
      </div>
    </div>
  );

  // The modal visual (non-print) - small preview + print/close buttons
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Print Receipt (Original + Copy)</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* In-modal preview: render smaller versions */}
          <div
            style={{ border: "1px solid #eee", padding: 12, borderRadius: 6 }}
          >
            <strong>Preview:</strong>
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>
                {studentName} — {className}
              </div>
              <div style={{ fontSize: 13, color: "#555", marginTop: 6 }}>
                {month ? `For: ${month}` : "Tuition / Fees"}
              </div>
              <div style={{ marginTop: 8 }}>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>Amount</span>
                  <span>{fmt(paidAmount)}</span>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>Mode</span>
                  <span>{mode}</span>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>Txn ID</span>
                  <span>{txn}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hidden large printable content is the same element we send to popup (printRef).*/}
          {/* We still render it in DOM (so styles apply) but it doesn't need to be visible. */}
          <div style={{ display: "none" }}>
            <PrintableContent />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={handlePrint} disabled={isPrinting}>
              {isPrinting ? "Printing..." : "Print Original + Copy"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
