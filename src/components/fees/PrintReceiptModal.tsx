import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface PrintReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  basicInfo?: any;
  excelData?: any;
  note?: string;
  warning?: string | null;
}

export function PrintReceiptModal({
  isOpen,
  onClose,
  basicInfo,
  excelData,
  note = "Payment recorded successfully",
  warning = null,
}: PrintReceiptModalProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      const t = setTimeout(() => setLoading(false), 300);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  if (!basicInfo || !excelData) return null;

  const studentName = basicInfo.studentName || "-";
  const registrationNumber = basicInfo.registrationNumber || "-";
  const schoolName = basicInfo.schoolName || "School Name";

  const latestPayment = basicInfo.feeRecord?.payments?.slice(-1)[0] || {};
  const className = basicInfo.feeRecord?.classId
    ? `${basicInfo.feeRecord.classId.grade} - ${basicInfo.feeRecord.classId.section}`
    : basicInfo.feeRecord?.className || "-";

  // ------------------- Installments with Payment & Scholarships -------------------
  const installmentsWithPayment = excelData.installments?.map((inst: any) => {
    const paymentsForMonth =
      excelData.payments
        ?.filter((p: any) => p.month === inst.month)
        .map((p: any) => p.amount) || [];

    const totalPaid = paymentsForMonth.reduce((sum, x) => sum + x, 0);

    // --- Calculate scholarship for this month ---
    const scholarshipAmount =
      excelData.scholarships?.reduce((sum: number, s: any) => {
        if (s.months.includes(inst.month)) {
          if (s.valueType === "fixed") return sum + s.value;
          if (s.valueType === "percentage")
            return sum + (inst.amount * s.value) / 100;
        }
        return sum;
      }, 0) || 0;

    const adjustedAmount = inst.amount - scholarshipAmount;
    const isPaid = totalPaid >= adjustedAmount;
    const isPartial = totalPaid > 0 && totalPaid < adjustedAmount;

    return {
      ...inst,
      amount: adjustedAmount,
      scholarship: scholarshipAmount,
      amountPaid: isPaid ? totalPaid : isPartial ? totalPaid : 0,
      partial: isPartial ? paymentsForMonth.join("+") : "",
      displayMonth:
        isPartial || scholarshipAmount > 0 ? inst.month + "*" : inst.month,
      hasPayment: totalPaid > 0,
    };
  });

  const totalPaid = installmentsWithPayment?.reduce(
    (sum, i) => sum + (typeof i.amountPaid === "number" ? i.amountPaid : 0),
    0
  );
  const totalScholarship = installmentsWithPayment?.reduce(
    (sum, i) => sum + i.scholarship,
    0
  );
  const remainingBalance = excelData.totalAmount - totalScholarship - totalPaid;

  // Payments made today
  const today = new Date().toISOString().split("T")[0];
  const paymentsToday = excelData.payments?.filter(
    (p) => p.paidAt?.split("T")[0] === today
  );
  const paymentMadeTodayAmount =
    paymentsToday?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0;

  const scholarships = excelData.scholarships || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-4xl w-full p-0 print:p-0 max-h-[90vh] overflow-y-auto rounded-md"
        aria-describedby="receipt-content"
      >
        {/* Custom Buttons */}
        <div className="flex justify-end gap-2 p-4 print:hidden">
          <Button size="sm" onClick={() => window.print()}>
            Print Receipt
          </Button>
          <Button size="sm" variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-black"></div>
          </div>
        ) : (
          <div
            id="receipt-content"
            className="font-sans text-sm print:text-xs w-full"
            style={{
              width: "210mm",
              minHeight: "297mm",
              padding: "20mm",
              boxSizing: "border-box",
            }}
          >
            <div className="text-center mb-2">
              <h1 className="text-xl sm:text-2xl font-bold">{schoolName}</h1>
            </div>

            <div className="bg-gray-100 text-center py-1 font-semibold mb-4">
              FEE RECEIPT
            </div>

            {/* Student Info */}
            <table className="w-full text-sm mb-4 border border-gray-400">
              <tbody>
                <tr>
                  <td className="border px-2 py-1">
                    <strong>Registration No</strong>
                  </td>
                  <td className="border px-2 py-1">{registrationNumber}</td>
                  <td className="border px-2 py-1">
                    <strong>Name</strong>
                  </td>
                  <td className="border px-2 py-1">{studentName}</td>
                </tr>
                <tr>
                  <td className="border px-2 py-1">
                    <strong>Class</strong>
                  </td>
                  <td className="border px-2 py-1">{className}</td>
                  <td className="border px-2 py-1">
                    <strong>Session</strong>
                  </td>
                  <td className="border px-2 py-1">
                    {basicInfo.feeRecord?.session || "-"}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Fee Table */}
            <table className="w-full border border-gray-400 text-xs sm:text-sm table-fixed mb-4">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-2 py-1 text-left">S.No</th>
                  <th className="border px-2 py-1 text-left">
                    Installment Month
                  </th>
                  <th className="border px-2 py-1 text-right">Amount</th>
                  <th className="border px-2 py-1 text-right">Paid</th>
                  <th className="border px-2 py-1 text-right">Partial</th>
                </tr>
              </thead>
              <tbody>
                {installmentsWithPayment?.map((inst: any, idx: number) => (
                  <tr
                    key={idx}
                    className={inst.hasPayment ? "font-semibold" : ""}
                  >
                    <td className="border px-2 py-1">{idx + 1}</td>
                    <td className="border px-2 py-1">{inst.displayMonth}</td>
                    <td className="border px-2 py-1 text-right">
                      {inst.amount}
                    </td>
                    <td className="border px-2 py-1 text-right">
                      {inst.amountPaid}
                    </td>
                    <td className="border px-2 py-1 text-right">
                      {inst.partial}
                    </td>
                  </tr>
                ))}
                {totalScholarship > 0 && (
                  <tr className="font-semibold bg-gray-50">
                    <td colSpan={2} className="border px-2 py-1 text-right">
                      Scholarship Deducted
                    </td>
                    <td colSpan={3} className="border px-2 py-1 text-right">
                      -{totalScholarship}
                    </td>
                  </tr>
                )}
                <tr className="font-semibold bg-gray-50">
                  <td colSpan={2} className="border px-2 py-1 text-right">
                    Total
                  </td>
                  <td className="border px-2 py-1 text-right">
                    {excelData.totalAmount}
                  </td>
                  <td className="border px-2 py-1 text-right">{totalPaid}</td>
                  <td className="border px-2 py-1"></td>
                </tr>
                <tr className="font-semibold bg-gray-50">
                  <td colSpan={4} className="border px-2 py-1 text-right">
                    Remaining Balance
                  </td>
                  <td className="border px-2 py-1 text-right">
                    {remainingBalance}
                  </td>
                </tr>
                {paymentMadeTodayAmount > 0 && (
                  <tr className="bg-yellow-100 font-semibold">
                    <td colSpan={2} className="border px-2 py-1 text-left">
                      Payment made today
                    </td>
                    <td colSpan={3} className="border px-2 py-1 text-right">
                      {paymentMadeTodayAmount}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Scholarship Table */}
            {scholarships.length > 0 && (
              <div className="mb-4">
                <div className="bg-gray-100 text-left py-1 px-2 mb-2 font-semibold">
                  Scholarship Details
                </div>
                <table className="w-full border border-gray-400 text-xs sm:text-sm table-fixed">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border px-2 py-1 text-left">S.No</th>
                      <th className="border px-2 py-1 text-left">
                        Scholarship Name
                      </th>
                      <th className="border px-2 py-1 text-left">Month(s)</th>
                      <th className="border px-2 py-1 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scholarships.map((s: any, idx: number) => (
                      <tr key={idx}>
                        <td className="border px-2 py-1">{idx + 1}</td>
                        <td className="border px-2 py-1">{s.name}</td>
                        <td className="border px-2 py-1">
                          {s.months.join(", ")}
                        </td>
                        <td className="border px-2 py-1 text-right">
                          {s.valueType === "fixed" ? s.value : `${s.value}%`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Payment Info */}
            <div className="bg-gray-100 text-center py-1 px-2 mb-2 font-semibold">
              Payment Mode Info
            </div>
            <table className="w-full text-sm mb-4 border border-gray-400">
              <tbody>
                {latestPayment && (
                  <tr>
                    <td className="border px-2 py-1">
                      <strong>Mode</strong>
                    </td>
                    <td className="border px-2 py-1">
                      {latestPayment.mode || "-"}
                    </td>
                    <td className="border px-2 py-1">
                      <strong>Date</strong>
                    </td>
                    <td className="border px-2 py-1">
                      {latestPayment.paidAt
                        ? new Date(latestPayment.paidAt).toLocaleDateString()
                        : "-"}
                    </td>
                  </tr>
                )}
                {latestPayment?.transactionId && (
                  <tr>
                    <td className="border px-2 py-1">
                      <strong>Transaction ID</strong>
                    </td>
                    <td className="border px-2 py-1" colSpan={3}>
                      {latestPayment.transactionId}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {basicInfo.warning && (
              <div className="mb-2 text-red-600 font-semibold">
                ⚠ {basicInfo.warning}
              </div>
            )}
            {note && (
              <div className="mb-4">
                <strong>Note:</strong> {note}
              </div>
            )}

            <div className="mt-8 flex justify-between text-xs sm:text-sm">
              <div>
                <p>Received By:</p>
                <p className="border-b w-32 mt-8"></p>
              </div>
              <div className="text-right">
                <p>Authorized Signatory</p>
                <p className="border-b w-32 mt-8 ml-auto"></p>
              </div>
            </div>

            <div className="text-center text-xs text-gray-500 mt-4">
              This is a computer-generated receipt.
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
