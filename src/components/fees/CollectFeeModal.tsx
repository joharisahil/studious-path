import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useCollectFeeMutation } from '@/store/api/feesApi';
import { Student, Payment } from '@/types';

const collectFeeSchema = z.object({
  studentId: z.string().min(1, 'Please select a student'),
  amount: z.string().min(1, 'Amount is required'),
  paymentMethod: z.enum(['cash', 'card', 'bank_transfer', 'online'], {
    required_error: 'Please select payment method',
  }),
  month: z.string().min(1, 'Month is required'),
  transactionId: z.string().optional(),
  notes: z.string().optional(),
});

type CollectFeeFormData = z.infer<typeof collectFeeSchema>;

interface CollectFeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
}

export const CollectFeeModal = ({ isOpen, onClose, students }: CollectFeeModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [collectFee] = useCollectFeeMutation();

  const form = useForm<CollectFeeFormData>({
    resolver: zodResolver(collectFeeSchema),
    defaultValues: {
      studentId: '',
      amount: '',
      paymentMethod: 'cash',
      month: '',
      transactionId: '',
      notes: '',
    },
  });

  const selectedPaymentMethod = form.watch('paymentMethod');
  const needsTransactionId = selectedPaymentMethod === 'bank_transfer' || selectedPaymentMethod === 'online';

  const onSubmit = async (data: CollectFeeFormData) => {
    setIsLoading(true);
    
    try {
      const selectedStudent = students.find(s => s.id === data.studentId);
      
      await collectFee({
        studentId: data.studentId,
        amount: parseFloat(data.amount),
        paymentMethod: data.paymentMethod as Payment['paymentMethod'],
        month: data.month,
        transactionId: data.transactionId,
        notes: data.notes,
      }).unwrap();
      
      toast({
        title: "Fee Collected Successfully",
        description: `₹${parseFloat(data.amount).toLocaleString()} collected from ${selectedStudent?.firstName} ${selectedStudent?.lastName} for ${data.month}`,
      });
      
      form.reset();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to collect fee. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Collect Fee Payment</DialogTitle>
          <DialogDescription>
            Record a fee payment from a student for a specific month.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="studentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a student" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.firstName} {student.lastName} - Grade {student.grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (₹)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="1500" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="month"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Month</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select month" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="January 2024">January 2024</SelectItem>
                        <SelectItem value="February 2024">February 2024</SelectItem>
                        <SelectItem value="March 2024">March 2024</SelectItem>
                        <SelectItem value="April 2024">April 2024</SelectItem>
                        <SelectItem value="May 2024">May 2024</SelectItem>
                        <SelectItem value="June 2024">June 2024</SelectItem>
                        <SelectItem value="July 2024">July 2024</SelectItem>
                        <SelectItem value="August 2024">August 2024</SelectItem>
                        <SelectItem value="September 2024">September 2024</SelectItem>
                        <SelectItem value="October 2024">October 2024</SelectItem>
                        <SelectItem value="November 2024">November 2024</SelectItem>
                        <SelectItem value="December 2024">December 2024</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Credit/Debit Card</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="online">Online Payment</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {needsTransactionId && (
              <FormField
                control={form.control}
                name="transactionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transaction ID</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter transaction ID" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any additional notes about this payment..." 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Processing...' : 'Collect Payment'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};