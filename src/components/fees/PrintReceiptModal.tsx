import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Printer, Download, Calendar, CreditCard, User, GraduationCap } from 'lucide-react';
import { useGenerateFeeReceiptMutation } from '@/store/api/examsApi';
import { useToast } from '@/hooks/use-toast';
import type { FeeReceipt, Payment } from '@/types';

interface PrintReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment | null;
  studentName?: string;
  className?: string;
}

export function PrintReceiptModal({ 
  isOpen, 
  onClose, 
  payment,
  studentName = 'John Doe',
  className = 'Class 10-A'
}: PrintReceiptModalProps) {
  const [receipt, setReceipt] = useState<FeeReceipt | null>(null);
  const [generateReceipt, { isLoading }] = useGenerateFeeReceiptMutation();
  const { toast } = useToast();

  const handleGenerateReceipt = async () => {
    if (!payment) return;

    try {
      const result = await generateReceipt({
        paymentId: payment.id,
        studentId: 'student-id', // In real app, this would come from props
        amount: payment.amount,
        month: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        paymentMethod: payment.paymentMethod,
      }).unwrap();

      setReceipt(result.data);
      
      toast({
        title: 'Success',
        description: result.message,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate receipt',
        variant: 'destructive',
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // In a real application, you would generate a PDF here
    toast({
      title: 'Download',
      description: 'PDF download functionality would be implemented here',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Fee Receipt</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!receipt && payment && (
            <div className="text-center py-8">
              <Button 
                onClick={handleGenerateReceipt} 
                disabled={isLoading}
                size="lg"
              >
                {isLoading ? 'Generating...' : 'Generate Receipt'}
              </Button>
            </div>
          )}

          {receipt && (
            <div className="print:p-0">
              {/* Header with action buttons - hidden in print */}
              <div className="flex justify-end gap-2 mb-4 print:hidden">
                <Button onClick={handleDownload} variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
                <Button onClick={handlePrint} size="sm">
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </Button>
              </div>

              {/* Receipt Content */}
              <Card className="border-2">
                <CardHeader className="text-center border-b">
                  <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-primary">ABC International School</h1>
                    <p className="text-muted-foreground">123 Education Street, Learning City - 123456</p>
                    <p className="text-muted-foreground">Phone: +91 98765 43210 | Email: info@abcschool.edu</p>
                  </div>
                  <div className="mt-4">
                    <Badge variant="outline" className="text-lg px-4 py-2">
                      FEE RECEIPT
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  {/* Receipt Info */}
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <span className="font-semibold">Receipt No:</span>
                        <span className="ml-2 text-primary font-mono">{receipt.receiptNumber}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4" />
                        <span className="font-semibold">Date:</span>
                        <span className="ml-2">{formatDate(receipt.paymentDate)}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <span className="font-semibold">Academic Year:</span>
                        <span className="ml-2">{receipt.academicYear}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-semibold">Month:</span>
                        <span className="ml-2">{receipt.month}</span>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  {/* Student Info */}
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span className="font-semibold">Student Name:</span>
                        <span className="ml-2">{receipt.studentName}</span>
                      </div>
                      <div className="flex items-center">
                        <GraduationCap className="mr-2 h-4 w-4" />
                        <span className="font-semibold">Class:</span>
                        <span className="ml-2">{receipt.className}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <CreditCard className="mr-2 h-4 w-4" />
                        <span className="font-semibold">Payment Method:</span>
                        <span className="ml-2 capitalize">{receipt.paymentMethod.replace('_', ' ')}</span>
                      </div>
                      {receipt.transactionId && (
                        <div className="flex items-center">
                          <span className="font-semibold">Transaction ID:</span>
                          <span className="ml-2 font-mono text-sm">{receipt.transactionId}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator className="my-6" />

                  {/* Fee Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Fee Details</h3>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-muted">
                          <tr>
                            <th className="text-left p-3 font-semibold">Description</th>
                            <th className="text-right p-3 font-semibold">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-t">
                            <td className="p-3">{receipt.feeType}</td>
                            <td className="p-3 text-right font-semibold">
                              {formatCurrency(receipt.amount)}
                            </td>
                          </tr>
                        </tbody>
                        <tfoot className="bg-muted border-t-2">
                          <tr>
                            <td className="p-3 font-semibold">Total Amount Paid</td>
                            <td className="p-3 text-right font-bold text-lg">
                              {formatCurrency(receipt.amount)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  {receipt.notes && (
                    <div className="mt-6 p-3 bg-muted rounded-lg">
                      <span className="font-semibold">Notes:</span>
                      <p className="mt-1 text-sm">{receipt.notes}</p>
                    </div>
                  )}

                  <Separator className="my-6" />

                  {/* Footer */}
                  <div className="text-center space-y-2 text-sm text-muted-foreground">
                    <p>This is a computer-generated receipt and does not require signature.</p>
                    <p>For any queries, please contact the accounts office.</p>
                    <p className="font-semibold">Collected by: {receipt.collectedBy}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}