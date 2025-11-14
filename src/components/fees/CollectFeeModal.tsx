import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getStudentFee, collectFee } from "@/services/FeesApi";
import { PrintReceiptModal } from "@/components/fees/PrintReceiptModal";

interface CollectFeeFormData {
  registrationNumber: string;
  month: string;
  amount: number;
  paymentMethod: "Cash" | "Card" | "Bank Transfer";
  transactionId?: string;
  notes?: string;
  paymentDate?: string;
}

export const CollectFeeModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { toast } = useToast();
  const [registrationInput, setRegistrationInput] = useState("");
  const [studentFee, setStudentFee] = useState<any>(null);
  const [studentFetched, setStudentFetched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [buttonFrozen, setButtonFrozen] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastPayment, setLastPayment] = useState<any>(null);

  const form = useForm<CollectFeeFormData>({
    resolver: zodResolver(
      z.object({
        registrationNumber: z.string().min(1, "Registration Number required"),
        month: z.string().min(1, "Month required"),
        amount: z.number().min(1, "Amount must be > 0"),
        paymentMethod: z.enum(["Cash", "Card", "Bank Transfer"]),
        transactionId: z.string().optional(),
        notes: z.string().optional(),
        paymentDate: z.string().optional(),
      })
    ),
    defaultValues: {
      registrationNumber: "",
      month: "",
      amount: 0,
      paymentMethod: "Cash",
      transactionId: "",
      notes: "",
      paymentDate: new Date().toISOString().slice(0, 10),
    },
  });

  const selectedMonth = form.watch("month");
  const selectedPaymentMethod = form.watch("paymentMethod");
  const needsTransactionId = selectedPaymentMethod === "Bank Transfer";

  const fetchStudentFee = async () => {
    if (!registrationInput) return;
    setIsLoading(true);
    try {
      const data = await getStudentFee(registrationInput);
      const feeRecord = Array.isArray(data) ? data[0] : data;
      if (!feeRecord) throw new Error("No fee record found");

      const installmentsWithPaid = feeRecord.installments.map((inst: any) => {
        const totalPaid = feeRecord.payments
          .filter((p: any) => p.month === inst.month)
          .reduce((sum: number, p: any) => sum + p.amount, 0);
        return {
          ...inst,
          amountPaid: totalPaid,
          status:
            totalPaid >= inst.amount
              ? "Paid"
              : totalPaid > 0
              ? "Partial"
              : "Pending",
        };
      });

      setStudentFee({ ...feeRecord, installments: installmentsWithPaid });
      setStudentFetched(true);
      form.setValue("registrationNumber", registrationInput);
    } catch (err: any) {
      toast({
        title: "Error",
        description:
          err.response?.data?.error || "Failed to fetch student fee record",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!studentFee || !selectedMonth) return;
    const inst = studentFee.installments.find(
      (i: any) => i.month === selectedMonth
    );
    form.setValue("amount", inst ? inst.amount - inst.amountPaid : 0);
  }, [selectedMonth, studentFee, form]);

  const handleCollectFee = async () => {
    if (buttonFrozen) return;
    setButtonFrozen(true);
    setIsLoading(true);

    const data = form.getValues();
    if (!studentFee) return;

    const inst = studentFee.installments.find((i) => i.month === data.month);
    if (inst && data.amount > inst.amount - inst.amountPaid) {
      toast({
        title: "Invalid Amount",
        description: `You cannot pay more than ₹${
          inst.amount - inst.amountPaid
        }`,
        variant: "destructive",
      });
      setIsLoading(false);
      setButtonFrozen(false);
      return;
    }

    try {
      const res = await collectFee(data.registrationNumber, {
        month: data.month,
        amount: data.amount,
        mode: data.paymentMethod,
        transactionId: data.transactionId,
        notes: data.notes,
        paymentDate: data.paymentDate,
      });

      // 1️⃣ Update payments array with the new payment
      const updatedPayments = [
        ...studentFee.payments,
        {
          amount: data.amount,
          mode: data.paymentMethod,
          transactionId: res.transactionId,
          month: data.month,
          paidAt: data.paymentDate || new Date().toISOString(),
        },
      ];

      // 2️⃣ Update installments array to reflect new payment
      const updatedInstallments = studentFee.installments.map((inst: any) => {
        if (inst.month === data.month) {
          const totalPaid = updatedPayments
            .filter((p: any) => p.month === inst.month)
            .reduce((sum: number, p: any) => sum + p.amount, 0);
          return {
            ...inst,
            amountPaid: totalPaid,
            status:
              totalPaid >= inst.amount
                ? "Paid"
                : totalPaid > 0
                ? "Partial"
                : "Pending",
          };
        }
        return inst;
      });

      // 3️⃣ Force React re-render by updating studentFee with a new object
      const updatedFeeRecord = {
        ...studentFee,
        installments: updatedInstallments,
        payments: updatedPayments,
      };
      setStudentFee({ ...updatedFeeRecord }); // ✅ This is the crucial part

      // 4️⃣ Update lastPayment for receipt
      const paymentInfo = {
        registrationNumber: studentFee.registrationNumber,
        studentName: studentFee.studentName,
        className: studentFee.className,
        schoolName: studentFee.schoolName || "School Name",
        feeRecord: updatedFeeRecord,
        amount: data.amount,
        month: data.month,
        transactionId: res.transactionId,
        paymentMethod: data.paymentMethod,
        notes: data.notes,
        paymentDate: data.paymentDate || new Date().toISOString(),
      };
      setLastPayment(paymentInfo);

      setShowConfirmDialog(false);
      setShowReceipt(true);

      toast({
        title: "Success",
        description: `${res.message}. Txn ID: ${res.transactionId}`,
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description:
          err.response?.data?.error || err.message || "Failed to collect fee",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setButtonFrozen(false);
    }
  };

  const handleFullClose = () => {
    form.reset({ paymentDate: new Date().toISOString().slice(0, 10) });
    setStudentFee(null);
    setStudentFetched(false);
    setRegistrationInput("");
    setShowConfirmDialog(false);
    setShowReceipt(false);
    setLastPayment(null);
    onClose();
  };

  const handleSubmitClick = () => {
    const data = form.getValues();
    if (!data.month || !data.amount) {
      toast({
        title: "Missing Info",
        description: "Please fill all required fields before confirming.",
      });
      return;
    }
    const inst = studentFee.installments.find((i) => i.month === data.month);
    if (inst && data.amount > inst.amount - inst.amountPaid) {
      toast({
        title: "Invalid Amount",
        description: `You cannot pay more than ₹${
          inst.amount - inst.amountPaid
        }`,
        variant: "destructive",
      });
      setIsLoading(false);
      setButtonFrozen(false);
      return;
    }
    setShowConfirmDialog(true);
  };

  return (
    <>
      {/* Collect Fee Modal */}
      <Dialog open={isOpen} onOpenChange={handleFullClose}>
        <DialogContent className="max-w-[95vw] sm:max-w-[700px] max-h-[90vh] overflow-y-auto rounded-xl">
          <DialogHeader>
            <DialogTitle>Collect Fee</DialogTitle>
            <DialogDescription>
              {studentFetched
                ? "Review and collect payment"
                : "Enter Registration Number to fetch fee record"}
            </DialogDescription>
          </DialogHeader>

          {!studentFetched ? (
            <div className="space-y-4">
              <Input
                placeholder="Enter Registration Number"
                value={registrationInput}
                onChange={(e) => setRegistrationInput(e.target.value)}
              />
              <Button
                onClick={fetchStudentFee}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                {isLoading ? "Fetching..." : "Fetch Fee"}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Student Info */}
              <div className="w-full lg:w-1/3 p-4 border rounded-md bg-gray-50 shadow-sm">
                <h3 className="text-lg font-semibold mb-2">Student Details</h3>
                <p>
                  <strong>Name:</strong> {studentFee.studentName || "N/A"}
                </p>
                <p>
                  <strong>Class:</strong> {studentFee.className || "N/A"}
                </p>
                <p>
                  <strong>Reg. No:</strong> {studentFee.registrationNumber}
                </p>

                <div className="mt-4">
                  <h4 className="font-medium mb-2">Installments</h4>
                  <div className="flex flex-wrap gap-2">
                    {studentFee.installments.map((inst: any) => (
                      <div
                        key={inst.month}
                        className={`px-3 py-1 rounded-md text-white font-semibold cursor-pointer transition-all duration-200 ${
                          inst.status === "Paid"
                            ? "bg-green-500"
                            : inst.status === "Partial"
                            ? "bg-yellow-400 text-black"
                            : "bg-red-500"
                        } hover:scale-105`}
                        onClick={() => form.setValue("month", inst.month)}
                      >
                        {inst.month} — ₹
                        {Math.max(inst.amount - inst.amountPaid, 0)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Fee Form */}
              <div className="w-full lg:w-2/3">
                <Form {...form}>
                  <form className="space-y-4">
                    <FormItem>
                      <FormLabel>Month</FormLabel>
                      <FormControl>
                        <Select
                          value={form.getValues("month")}
                          onValueChange={(val) =>
                            form.setValue("month", val as any)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select month" />
                          </SelectTrigger>
                          <SelectContent>
                            {studentFee.installments.map((i: any) => (
                              <SelectItem
                                key={i.month}
                                value={i.month}
                                disabled={i.status === "Paid"}
                              >
                                {i.month}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>

                    <FormItem>
                      <FormLabel>Amount (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...form.register("amount", { valueAsNumber: true })}
                        />
                      </FormControl>
                    </FormItem>

                    <FormItem>
                      <FormLabel>Payment Method</FormLabel>
                      <FormControl>
                        <Select
                          value={form.getValues("paymentMethod")}
                          onValueChange={(val) =>
                            form.setValue("paymentMethod", val as any)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Cash">Cash</SelectItem>
                            <SelectItem value="Card">Card</SelectItem>
                            <SelectItem value="Bank Transfer">
                              Bank Transfer
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>

                    {needsTransactionId && (
                      <FormItem>
                        <FormLabel>Transaction ID</FormLabel>
                        <FormControl>
                          <Input {...form.register("transactionId")} />
                        </FormControl>
                      </FormItem>
                    )}

                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea {...form.register("notes")} />
                      </FormControl>
                    </FormItem>

                    <div className="flex justify-end gap-3">
                      <Button variant="outline" onClick={handleFullClose}>
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        onClick={handleSubmitClick}
                        disabled={buttonFrozen}
                      >
                        Collect Fee
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Fee Collection</DialogTitle>
            <DialogDescription>
              Review details before confirming.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 text-sm mt-3">
            <p>
              <strong>Student:</strong> {studentFee?.studentName || "N/A"}
            </p>
            <p>
              <strong>Month:</strong> {form.getValues("month")}
            </p>
            <p>
              <strong>Amount:</strong> ₹{form.getValues("amount")}
            </p>
            <p>
              <strong>Method:</strong> {form.getValues("paymentMethod")}
            </p>
          </div>
          <div className="flex justify-end gap-3 mt-5">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCollectFee}
              disabled={isLoading || buttonFrozen}
            >
              {isLoading ? "Processing..." : "Confirm & Collect"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Print Receipt Modal */}
      {lastPayment && (
        <PrintReceiptModal
          isOpen={showReceipt}
          onClose={() => setShowReceipt(false)}
          basicInfo={lastPayment}
          excelData={lastPayment.feeRecord}
          note="Payment recorded successfully"
        />
      )}
    </>
  );
};
