import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Payment } from "@/types";

interface PrintReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment | null;
  studentName: string;
  className: string;
  receiptNumber: string;
  session: string;
  installment: string;
  feeDetails?: { description: string; due: number; con?: number; paid: number }[];
  payModeInfo: { mode: string; date: string; bank?: string; number?: string };
  note?: string;
}

export function PrintReceiptModal({
  isOpen,
  onClose,
  payment,
  studentName,
  className,
  receiptNumber,
  session,
  installment,
  feeDetails = [],
  payModeInfo,
  note = "N/A",
}: PrintReceiptModalProps) {
  if (!payment) return null; // Safety check

  const totalPaidToday = payment?.amount || 0;

  const totalDue = feeDetails.reduce((sum, f) => sum + (f.due || 0), 0);
  const remainingBalance = totalDue - totalPaidToday;

  const numberToWords = (num: number) => {
    if (num === undefined || num === null) return "0 only";
    return num.toLocaleString("en-IN") + " only";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-6 print:p-0">
        <div className="font-sans text-sm print:text-xs">
          {/* Header */}
          <div className="text-center mb-4">
            <img
              src="/logo.png"
              alt="School Logo"
              className="mx-auto w-16 h-16 object-contain mb-2"
            />
            <h1 className="text-xl font-bold">Delhi Public School</h1>
            <p>Site No.1, Sector-45, Urban Estate, Gurgaon, Haryana</p>
          </div>

          {/* Fee Receipt Title */}
          <div className="bg-gray-200 text-center py-1 font-semibold mb-4">FEE RECEIPT</div>

          {/* Student Info */}
          <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
            <div>
              <p><strong>Receipt No :</strong> {receiptNumber}</p>
              <p><strong>Adm No :</strong> {payment.transactionId || "N/A"}</p>
              <p><strong>Name :</strong> {studentName}</p>
              <p><strong>Installment :</strong> {installment}</p>
            </div>
            <div>
              <p><strong>Date :</strong> {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : "N/A"}</p>
              <p><strong>Session :</strong> {session}</p>
              <p><strong>Class :</strong> {className}</p>
              <p><strong>Counter No :</strong> DPS-RECEIPT</p>
            </div>
          </div>

          {/* Fee Table */}
          <table className="w-full border border-gray-500 mb-4 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1 text-left">Sl.No</th>
                <th className="border px-2 py-1 text-left">Description</th>
                <th className="border px-2 py-1 text-right">Due</th>
                <th className="border px-2 py-1 text-right">Con</th>
                <th className="border px-2 py-1 text-right">Paid Today</th>
              </tr>
            </thead>
            <tbody>
              {feeDetails.map((f, idx) => (
                <tr key={idx}>
                  <td className="border px-2 py-1">{idx + 1}</td>
                  <td className="border px-2 py-1">{f.description}</td>
                  <td className="border px-2 py-1 text-right">{f.due || 0}</td>
                  <td className="border px-2 py-1 text-right">{f.con || 0}</td>
                  <td className="border px-2 py-1 text-right">{totalPaidToday}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-100 font-semibold">
              <tr>
                <td colSpan={4} className="border px-2 py-1 text-right">Total Paid Today</td>
                <td className="border px-2 py-1 text-right">{totalPaidToday}</td>
              </tr>
              <tr>
                <td colSpan={4} className="border px-2 py-1 text-right">Remaining Balance</td>
                <td className="border px-2 py-1 text-right">{remainingBalance}</td>
              </tr>
            </tfoot>
          </table>

          {/* Pay Mode Information */}
          <div className="mb-4 text-sm">
            <h4 className="font-semibold">PAY MODE INFORMATION</h4>
            <p><strong>Pay Mode:</strong> {payModeInfo.mode}</p>
            <p><strong>Date:</strong> {payModeInfo.date}</p>
            {payModeInfo.bank && <p><strong>Bank:</strong> {payModeInfo.bank}</p>}
            {payModeInfo.number && <p><strong>Number:</strong> {payModeInfo.number}</p>}
            <p><strong>Total Paid Today:</strong> {totalPaidToday}</p>
          </div>

          {/* Total in Words */}
          <p className="mb-4 font-semibold">
            Total Paid Today in Words: {numberToWords(totalPaidToday)}
          </p>

          {/* Note */}
          <div className="mb-4">
            <p><strong>Note :</strong> {note}</p>
          </div>

          {/* Footer */}
          <div className="text-center text-xs">
            <p>This is a computer generated Receipt. Does not require signature.</p>
            <p className="mt-2 font-semibold">PARENT COPY</p>
          </div>

          {/* Print Button */}
          <div className="mt-4 flex justify-center print:hidden">
            <Button onClick={() => window.print()}>Print Receipt</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
