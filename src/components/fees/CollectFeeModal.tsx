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
import { PrintReceiptModal } from "./PrintReceiptModal";
import type { Payment } from "@/types";
import { register } from "module";

interface CollectFeeFormData {
  studentId: string;
  month: string;
  amount: number;
  paymentMethod: "Cash" | "Card" | "Bank Transfer" | "Online";
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
  const [studentIdInput, setStudentIdInput] = useState("");
  const [studentFee, setStudentFee] = useState<any>(null);
  const [studentInfo, setStudentInfo] = useState<any>(null); // ✅ store full student object
  const [studentFetched, setStudentFetched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastPayment, setLastPayment] = useState<Payment | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  const form = useForm<CollectFeeFormData>({
    resolver: zodResolver(
      z.object({
        studentId: z.string().min(1, "Student ID required"),
        month: z.string().min(1, "Month required"),
        amount: z.number().min(1, "Amount must be > 0"),
        paymentMethod: z.enum(["Cash", "Card", "Bank Transfer", "Online"]),
        transactionId: z.string().optional(),
        notes: z.string().optional(),
        paymentDate: z.string().optional(),
      })
    ),
    defaultValues: {
      studentId: "",
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
  const needsTransactionId =
    selectedPaymentMethod === "Bank Transfer" || selectedPaymentMethod === "Online";

  // ✅ Fetch student fee by Student ID only
  const fetchStudentFee = async () => {
    if (!studentIdInput) return;
    setIsLoading(true);
    try {
      const data = await getStudentFee(studentIdInput);
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
            totalPaid >= inst.amount ? "Paid" : totalPaid > 0 ? "Partial" : "Pending",
        };
      });

      setStudentFee({ ...feeRecord, installments: installmentsWithPaid });
      setStudentInfo(feeRecord.studentId); // ✅ store student object
      setStudentFetched(true);
      form.setValue("studentId", studentIdInput);
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

  // ✅ Auto-fill amount when month changes
  useEffect(() => {
    if (!studentFee || !selectedMonth) return;
    const inst = studentFee.installments.find((i: any) => i.month === selectedMonth);
    form.setValue("amount", inst ? inst.amount - inst.amountPaid : 0);
  }, [selectedMonth, studentFee, form]);

  // ✅ Handle Collect Fee submission
  const handleCollectFee = async (data: CollectFeeFormData) => {
    if (!studentFee) return;
    setIsLoading(true);
    try {
      const res = await collectFee(studentFee._id, {
        month: data.month,
        amount: data.amount,
        mode: data.paymentMethod,
        transactionId: data.transactionId,
        notes: data.notes,
        paymentDate: data.paymentDate,
      });

      const updatedInstallments = res.feeRecord.installments.map((inst: any) => {
        const totalPaid = res.feeRecord.payments
          .filter((p: any) => p.month === inst.month)
          .reduce((sum: number, p: any) => sum + p.amount, 0);
        return {
          ...inst,
          amountPaid: totalPaid,
          status:
            totalPaid >= inst.amount ? "Paid" : totalPaid > 0 ? "Partial" : "Pending",
        };
      });

      setStudentFee({ ...res.feeRecord, installments: updatedInstallments });
      // ✅ Keep studentInfo as is

      const txnId = res.transactionId || `TXN${Math.floor(Math.random() * 100000)}`;
      setLastPayment({
        id: txnId,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        transactionId: txnId,
        month: data.month,
        paymentDate: data.paymentDate || new Date().toISOString(),
        notes: data.notes || "",
        collectedBy: "Admin User",
      });

      toast({
        title: res.warning ? "Success with Warning" : "Success",
        description: res.warning
          ? `${res.message}. Warning: ${res.warning}`
          : `${res.message}. Txn ID: ${txnId}`,
      });
    } catch (err: any) {
      console.error("CollectFee API error:", err);
      toast({
        title: "Error",
        description:
          err.response?.data?.error || err.message || "Failed to collect fee",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    form.reset({ paymentDate: new Date().toISOString().slice(0, 10) });
    setStudentFee(null);
    setStudentInfo(null);
    setStudentFetched(false);
    setStudentIdInput("");
    setLastPayment(null);
    setShowReceipt(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Collect Fee</DialogTitle>
          <DialogDescription>
            {studentFetched
              ? "Record fee payment"
              : "Enter Student ID to fetch fee record"}
          </DialogDescription>
        </DialogHeader>

        {!studentFetched ? (
          <div className="space-y-4">
            <Input
              placeholder="Enter Student ID"
              value={studentIdInput}
              onChange={(e) => setStudentIdInput(e.target.value)}
            />
            <Button onClick={fetchStudentFee} disabled={isLoading}>
              {isLoading ? "Fetching..." : "Fetch Fee"}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-6">
            {/* Student Info */}
            <div className="w-full md:w-1/3 p-4 border rounded-md bg-gray-50">
              <h3 className="text-lg font-semibold mb-2">Student Details</h3>
              <p>
                <strong>Name:</strong> {studentInfo?.firstName} {studentInfo?.lastName}
              </p>
              <p>
                <strong>Class:</strong>{" "}
                {studentInfo?.classId
                  ? `${studentInfo.classId.grade} - ${studentInfo.classId.section}`
                  : "Not Assigned"}
              </p>
              <p>
                <strong>Student REG:</strong> {studentInfo.registrationNumber}
              </p>

              <div className="mt-4">
                <h4 className="font-medium mb-2">Fee Status</h4>
                <div className="flex flex-wrap gap-2">
                  {studentFee.installments.map((inst: any) => (
                    <div
                      key={inst.month}
                      className={`px-3 py-1 rounded-md text-white font-semibold cursor-pointer transition-all duration-300
                        ${
                          inst.status === "Paid"
                            ? "bg-green-500 border-2 border-yellow-300"
                            : inst.status === "Partial"
                            ? "bg-yellow-400 border-2 border-orange-300"
                            : "bg-red-500 border-2 border-pink-400"
                        }
                        hover:scale-105 hover:shadow-xl`}
                      onClick={() => form.setValue("month", inst.month)}
                    >
                      {inst.month} — ₹
                      {inst.amount - inst.amountPaid > 0 ? inst.amount - inst.amountPaid : 0}
                      {inst.status !== "Pending" ? ` (${inst.status})` : ""}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Fee Collection Form */}
            <div className="w-full md:w-2/3">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleCollectFee)}
                  className="space-y-4"
                >
                  {/* Month Select */}
                  <FormItem>
                    <FormLabel>Month</FormLabel>
                    <FormControl>
                      <Select
                        value={form.getValues("month")}
                        onValueChange={(val) => form.setValue("month", val as any)}
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
                              {i.month} — ₹{i.amount - i.amountPaid > 0 ? i.amount - i.amountPaid : 0} due
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>

                  {/* Amount */}
                  <FormItem>
                    <FormLabel>Amount (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...form.register("amount", { valueAsNumber: true })}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>

                  {/* Payment Method */}
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
                          <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                          <SelectItem value="Online">Online</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>

                  {/* Transaction ID */}
                  {needsTransactionId && (
                    <FormItem>
                      <FormLabel>Transaction ID</FormLabel>
                      <FormControl>
                        <Input {...form.register("transactionId")} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}

                  {/* Payment Date */}
                  <FormItem>
                    <FormLabel>Payment Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...form.register("paymentDate")} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>

                  {/* Notes */}
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea {...form.register("notes")} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>

                  {/* Buttons */}
                  <div className="flex justify-end gap-3">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={handleClose}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Processing..." : "Collect Fee"}
                    </Button>
                  </div>
                </form>

                {lastPayment && studentFee && (
                  <div className="mt-4 flex justify-center">
                    <Button
                      variant="secondary"
                      onClick={() => setShowReceipt(true)}
                    >
                      Print Receipt (Txn: {lastPayment.transactionId})
                    </Button>
                  </div>
                )}
              </Form>
            </div>
          </div>
        )}

        {/* Print Receipt */}
        {lastPayment && studentFee && studentInfo && (
  <PrintReceiptModal
    isOpen={showReceipt}
    onClose={() => setShowReceipt(false)}
    payment={lastPayment}
    studentName={`${studentInfo.firstName} ${studentInfo.lastName || ""}`}
    className={`${studentInfo.classId?.grade || "N/A"} - ${studentInfo.classId?.section || "N/A"}`}
    receiptNumber={lastPayment.transactionId || "N/A"}
    session={studentFee.structureId?.session || "N/A"}
    installment={form.getValues("month") || "N/A"}
    feeDetails={studentFee.installments.map((inst: any) => ({
      description: inst.month,
      due: inst.amount,
      con: inst.amountPaid,
      paid: inst.amountPaid,
    }))}
    payModeInfo={{
      mode: lastPayment.paymentMethod || "Cash",
      date: lastPayment.paymentDate || new Date().toISOString(),
      bank: lastPayment.bank,
      number: lastPayment.transactionId,
    }}
    note={form.getValues("notes") || "N/A"}
  />
)}

      </DialogContent>
    </Dialog>
  );
};
