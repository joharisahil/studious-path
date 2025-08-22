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
import { Student } from '@/types';

const classFees = {
  '1': 8000, '2': 8500, '3': 9000, '4': 9500, '5': 10000,
  '6': 11000, '7': 12000, '8': 13000, '9': 14000, '10': 15000,
  '11': 16000, '12': 17000
};

const addFeeSchema = z.object({
  studentId: z.string().min(1, 'Please select a student'),
  academicYear: z.string().min(1, 'Academic year is required'),
  totalFee: z.string().min(1, 'Total fee is required'),
  collectionPeriod: z.enum(['monthly', 'quarterly', 'yearly'], {
    required_error: 'Please select collection period',
  }),
  dueDate: z.string().min(1, 'Due date is required'),
  description: z.string().optional(),
});

type AddFeeFormData = z.infer<typeof addFeeSchema>;

interface AddFeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
}

export const AddFeeModal = ({ isOpen, onClose, students }: AddFeeModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<AddFeeFormData>({
    resolver: zodResolver(addFeeSchema),
    defaultValues: {
      studentId: '',
      academicYear: '2024-25',
      totalFee: '',
      collectionPeriod: 'monthly',
      dueDate: '',
      description: '',
    },
  });

  const selectedStudent = form.watch('studentId');
  const selectedStudentData = students.find(s => s.id === selectedStudent);

  // Auto-fill fee based on selected student's grade
  useEffect(() => {
    if (selectedStudentData?.grade) {
      const gradeFee = classFees[selectedStudentData.grade as keyof typeof classFees];
      if (gradeFee) {
        form.setValue('totalFee', gradeFee.toString());
      }
    }
  }, [selectedStudentData, form]);

  const onSubmit = async (data: AddFeeFormData) => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const selectedStudent = students.find(s => s.id === data.studentId);
      
      toast({
        title: "Fee Added Successfully",
        description: `Fee of ₹${parseInt(data.totalFee).toLocaleString()} added for ${selectedStudent?.firstName} ${selectedStudent?.lastName}`,
      });
      
      form.reset();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add fee. Please try again.",
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
          <DialogTitle>Add New Fee</DialogTitle>
          <DialogDescription>
            Add fee details for a student. This will create a new fee record.
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

              <FormField
                control={form.control}
                name="collectionPeriod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Collection Period</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
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
                name="totalFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Fee Amount (₹)</FormLabel>
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
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Tuition Fee, Activity Fee, etc." 
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
                {isLoading ? 'Adding...' : 'Add Fee'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};