import { useState, useEffect } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { useUpdateFeeStructureMutation } from '@/store/api/feesApi';
import { FeeStructure } from '@/types';

const feeStructureSchema = z.object({
  grade: z.string().min(1, 'Grade is required'),
  academicYear: z.string().min(1, 'Academic year is required'),
  tuitionFee: z.string().min(1, 'Tuition fee is required'),
  labFee: z.string().min(0, 'Lab fee must be 0 or greater'),
  libraryFee: z.string().min(0, 'Library fee must be 0 or greater'),
  transportFee: z.string().optional(),
  hostelFee: z.string().optional(),
  activityFee: z.string().optional(),
  sportsFee: z.string().optional(),
});

type FeeStructureFormData = z.infer<typeof feeStructureSchema>;

interface FeeStructureModalProps {
  isOpen: boolean;
  onClose: () => void;
  feeStructure?: FeeStructure;
}

export const FeeStructureModal = ({ isOpen, onClose, feeStructure }: FeeStructureModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [updateFeeStructure] = useUpdateFeeStructureMutation();

  const form = useForm<FeeStructureFormData>({
    resolver: zodResolver(feeStructureSchema),
    defaultValues: {
      grade: '',
      academicYear: '2024-25',
      tuitionFee: '',
      labFee: '0',
      libraryFee: '0',
      transportFee: '0',
      hostelFee: '0',
      activityFee: '0',
      sportsFee: '0',
    },
  });

  useEffect(() => {
    if (feeStructure) {
      form.reset({
        grade: feeStructure.grade,
        academicYear: feeStructure.academicYear,
        tuitionFee: feeStructure.tuitionFee.toString(),
        labFee: feeStructure.labFee.toString(),
        libraryFee: feeStructure.libraryFee.toString(),
        transportFee: feeStructure.transportFee?.toString() || '0',
        hostelFee: feeStructure.hostelFee?.toString() || '0',
        activityFee: feeStructure.otherFees?.['Activity Fee']?.toString() || '0',
        sportsFee: feeStructure.otherFees?.['Sports Fee']?.toString() || '0',
      });
    }
  }, [feeStructure, form]);

  const onSubmit = async (data: FeeStructureFormData) => {
    setIsLoading(true);
    
    try {
      const otherFees: { [key: string]: number } = {};
      if (data.activityFee && parseFloat(data.activityFee) > 0) {
        otherFees['Activity Fee'] = parseFloat(data.activityFee);
      }
      if (data.sportsFee && parseFloat(data.sportsFee) > 0) {
        otherFees['Sports Fee'] = parseFloat(data.sportsFee);
      }

      const totalFee = 
        parseFloat(data.tuitionFee) +
        parseFloat(data.labFee || '0') +
        parseFloat(data.libraryFee || '0') +
        parseFloat(data.transportFee || '0') +
        parseFloat(data.hostelFee || '0') +
        Object.values(otherFees).reduce((sum, fee) => sum + fee, 0);

      const updatedStructure: Partial<FeeStructure> & { id: string } = {
        id: feeStructure?.id || Date.now().toString(),
        grade: data.grade,
        academicYear: data.academicYear,
        tuitionFee: parseFloat(data.tuitionFee),
        labFee: parseFloat(data.labFee || '0'),
        libraryFee: parseFloat(data.libraryFee || '0'),
        transportFee: data.transportFee ? parseFloat(data.transportFee) : undefined,
        hostelFee: data.hostelFee ? parseFloat(data.hostelFee) : undefined,
        otherFees,
        totalFee,
        paymentSchedule: feeStructure?.paymentSchedule || [
          { installment: 1, dueDate: '2024-04-15T00:00:00Z', amount: totalFee / 2, description: 'First Installment' },
          { installment: 2, dueDate: '2024-08-15T00:00:00Z', amount: totalFee / 2, description: 'Second Installment' }
        ],
      };

      await updateFeeStructure(updatedStructure).unwrap();
      
      toast({
        title: "Fee Structure Updated",
        description: `Fee structure for Grade ${data.grade} updated successfully. Total fee: ₹${totalFee.toLocaleString()}`,
      });
      
      form.reset();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update fee structure. Please try again.",
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {feeStructure ? 'Edit Fee Structure' : 'Create Fee Structure'}
          </DialogTitle>
          <DialogDescription>
            {feeStructure ? 'Update the fee structure details.' : 'Create a new fee structure for a grade.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="grade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grade</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select grade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((grade) => (
                          <SelectItem key={grade} value={grade.toString()}>
                            Grade {grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="academicYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Academic Year</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="2024-25">2024-25</SelectItem>
                        <SelectItem value="2025-26">2025-26</SelectItem>
                        <SelectItem value="2026-27">2026-27</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tuitionFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tuition Fee (₹)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="15000" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="labFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lab Fee (₹)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="2000" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="libraryFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Library Fee (₹)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="1000" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="transportFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transport Fee (₹)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="2500" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="hostelFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hostel Fee (₹)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="5000" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="activityFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity Fee (₹)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="500" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="sportsFee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sports Fee (₹)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="300" 
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
                {isLoading ? 'Saving...' : feeStructure ? 'Update Structure' : 'Create Structure'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};