import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useGetFeeStructureQuery } from '@/store/api/feesApi';
import { LoaderIcon } from 'lucide-react';

interface ClassFeeStructureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClassFeeStructureModal = ({ isOpen, onClose }: ClassFeeStructureModalProps) => {
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  
  const { data: feeStructureResponse, isLoading } = useGetFeeStructureQuery({ 
    grade: selectedGrade 
  }, { 
    skip: !selectedGrade 
  });
  
  const feeStructure = feeStructureResponse?.data?.[0];

  const renderFeeBreakdown = () => {
    if (!feeStructure) return null;

    const fees = [
      { label: 'Tuition Fee', amount: feeStructure.tuitionFee },
      { label: 'Lab Fee', amount: feeStructure.labFee },
      { label: 'Library Fee', amount: feeStructure.libraryFee },
      ...(feeStructure.transportFee ? [{ label: 'Transport Fee', amount: feeStructure.transportFee }] : []),
      ...(feeStructure.hostelFee ? [{ label: 'Hostel Fee', amount: feeStructure.hostelFee }] : []),
      ...Object.entries(feeStructure.otherFees || {}).map(([label, amount]) => ({ label, amount })),
    ];

    return (
      <div className="space-y-4">
        <div className="grid gap-3">
          {fees.map((fee, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{fee.label}</span>
              <span className="font-medium">₹{fee.amount.toLocaleString()}</span>
            </div>
          ))}
        </div>
        
        <Separator />
        
        <div className="flex justify-between items-center text-lg font-bold">
          <span>Total Fee</span>
          <span className="text-primary">₹{feeStructure.totalFee.toLocaleString()}</span>
        </div>
      </div>
    );
  };

  const renderPaymentSchedule = () => {
    if (!feeStructure?.paymentSchedule) return null;

    return (
      <div className="space-y-3">
        <h4 className="font-medium">Payment Schedule</h4>
        <div className="space-y-2">
          {feeStructure.paymentSchedule.map((schedule, index) => (
            <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <div>
                <div className="font-medium">Installment {schedule.installment}</div>
                <div className="text-sm text-muted-foreground">{schedule.description}</div>
              </div>
              <div className="text-right">
                <div className="font-medium">₹{schedule.amount.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">
                  Due: {new Date(schedule.dueDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Fee Structure by Class</DialogTitle>
          <DialogDescription>
            View detailed fee structure for each grade/class.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium mb-2 block">Select Grade</label>
            <Select value={selectedGrade} onValueChange={setSelectedGrade}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a grade to view fee structure" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((grade) => (
                  <SelectItem key={grade} value={grade.toString()}>
                    Grade {grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedGrade && (
            <>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoaderIcon className="w-6 h-6 animate-spin" />
                  <span className="ml-2">Loading fee structure...</span>
                </div>
              ) : feeStructure ? (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Grade {feeStructure.grade} Fee Structure</span>
                        <Badge variant="outline">{feeStructure.academicYear}</Badge>
                      </CardTitle>
                      <CardDescription>
                        Academic year {feeStructure.academicYear} fee breakdown
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {renderFeeBreakdown()}
                    </CardContent>
                  </Card>

                  {feeStructure.paymentSchedule && feeStructure.paymentSchedule.length > 0 && (
                    <Card>
                      <CardContent className="pt-6">
                        {renderPaymentSchedule()}
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No fee structure found for Grade {selectedGrade}</p>
                      <p className="text-sm">Contact administration to set up fee structure.</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};