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
import { Form, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getStudentFee, collectFee } from "@/services/FeesApi";

interface CollectFeeFormData {
  studentId: string;
  month: string;
  amount: number;
  paymentMethod: "cash" | "card" | "bank_transfer" | "online";
  transactionId?: string;
  notes?: string;
}

export const CollectFeeModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { toast } = useToast();
  const [studentIdInput, setStudentIdInput] = useState("");
  const [studentFee, setStudentFee] = useState<any>(null);
  const [studentFetched, setStudentFetched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  const form = useForm<CollectFeeFormData>({
    resolver: zodResolver(
      z.object({
        studentId: z.string().min(1, "Student ID required"),
        month: z.string().min(1, "Month required"),
        amount: z.number().min(1, "Amount must be > 0"),
        paymentMethod: z.enum(["cash", "card", "bank_transfer", "online"]),
        transactionId: z.string().optional(),
        notes: z.string().optional(),
      })
    ),
    defaultValues: {
      studentId: "",
      month: "",
      amount: 0,
      paymentMethod: "cash",
      transactionId: "",
      notes: "",
    },
  });

  const selectedMonth = form.watch("month");
  const selectedPaymentMethod = form.watch("paymentMethod");
  const needsTransactionId = selectedPaymentMethod === "bank_transfer" || selectedPaymentMethod === "online";

  const fetchStudentFee = async () => {
    if (!studentIdInput) return;
    setIsLoading(true);
    try {
      const data = await getStudentFee(studentIdInput);
      const feeRecord = Array.isArray(data) ? data[0] : data;
      setStudentFee(feeRecord);
      setStudentFetched(true);
      form.setValue("studentId", studentIdInput);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.error || "Failed to fetch fee record",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-fill amount when month changes
  useEffect(() => {
    if (!studentFee || !selectedMonth) return;
    const inst = studentFee.installments.find((i: any) => i.month === selectedMonth);
    form.setValue("amount", inst ? inst.amount - inst.amountPaid : 0);
  }, [selectedMonth, studentFee, form]);

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
      });
      toast({
        title: "Success",
        description: `₹${data.amount} collected successfully. Txn ID: ${res.transactionId}`,
      });
      setTransactionId(res.transactionId); // for print receipt
      setStudentFee(res.feeRecord);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.error || "Failed to collect fee",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    form.reset();
    setStudentFee(null);
    setStudentFetched(false);
    setStudentIdInput("");
    setTransactionId(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Collect Fee</DialogTitle>
          <DialogDescription>
            {studentFetched ? "Record fee payment" : "Enter student ID to fetch fee record"}
          </DialogDescription>
        </DialogHeader>

        {!studentFetched ? (
          <div className="space-y-4">
            <Input
              placeholder="Enter student ID"
              value={studentIdInput}
              onChange={(e) => setStudentIdInput(e.target.value)}
            />
            <Button onClick={fetchStudentFee} disabled={isLoading}>
              {isLoading ? "Fetching..." : "Fetch Fee"}
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCollectFee)} className="space-y-4">
              {/* Month */}
              <FormItem>
                <FormLabel>Month</FormLabel>
                <FormControl>
                  <Select onValueChange={(val) => form.setValue("month", val)} value={form.getValues("month")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      {studentFee.installments.map((i: any) => (
                        <SelectItem key={i.month} value={i.month} disabled={i.status === "Paid"}>
                          {i.month} — ₹{i.amount - i.amountPaid} due
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>

              {/* Amount */}
              <FormItem>
                <FormLabel>Amount (₹)</FormLabel>
                <FormControl>
                  <Input type="number" {...form.register("amount")} />
                </FormControl>
              </FormItem>

              {/* Payment Method */}
              <FormItem>
                <FormLabel>Payment Method</FormLabel>
                <FormControl>
                  <Select onValueChange={(val) => form.setValue("paymentMethod", val as any)} value={form.getValues("paymentMethod")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>

              {/* Transaction ID */}
              {needsTransactionId && (
                <FormItem>
                  <FormLabel>Transaction ID</FormLabel>
                  <FormControl>
                    <Input {...form.register("transactionId")} />
                  </FormControl>
                </FormItem>
              )}

              {/* Notes */}
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea {...form.register("notes")} />
                </FormControl>
              </FormItem>

              {/* Buttons */}
              <div className="flex justify-end gap-3">
                <Button variant="outline" type="button" onClick={handleClose} disabled={isLoading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Processing..." : "Collect Fee"}
                </Button>
              </div>

              {/* Print Receipt */}
              {transactionId && (
                <div className="pt-2">
                  <Button
                    variant="secondary"
                    onClick={() => window.print()} // replace with proper print logic
                  >
                    Print Receipt (Txn: {transactionId})
                  </Button>
                </div>
              )}
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};
