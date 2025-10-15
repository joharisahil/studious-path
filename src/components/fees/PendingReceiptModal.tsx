import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PendingReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: any | null; // can be a FeeRecord
}

export const PendingReceiptModal = ({
  isOpen,
  onClose,
  payment,
}: PendingReceiptModalProps) => {
  if (!payment) return null;

  // Determine next pending installment
  const nextPending = payment.installments?.find(
    (inst: any) => inst.status !== "Paid"
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Pending Fee Receipt</DialogTitle>
        </DialogHeader>

        <div className="space-y-2 text-sm">
          <p>
            <strong>Student:</strong> {payment.studentName}
          </p>
          <p>
            <strong>Class:</strong> {payment.grade}
          </p>
          {nextPending ? (
            <>
              <p>
                <strong>Month:</strong> {nextPending.month}
              </p>
              <p>
                <strong>Due Date:</strong>{" "}
                {new Date(nextPending.dueDate).toLocaleDateString()}
              </p>
              <p>
                <strong>Amount Due:</strong> ₹
                {nextPending.amount?.toLocaleString()}
              </p>
              <p>
                <strong>Status:</strong> {nextPending.status}
              </p>
            </>
          ) : (
            <p>All fees are up to date.</p>
          )}
        </div>

        <div className="flex justify-end mt-4">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
