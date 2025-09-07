import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAutoGenerateTimetableMutation } from '@/store/api/timetableApi';
import { useGetClassesQuery } from '@/store/api/classesApi';
import { AutoGenerateTimetableData } from '@/types';

const formSchema = z.object({
  classId: z.string().min(1, 'Class is required'),
  numberOfDays: z.coerce.number().min(1).max(6, 'Days must be between 1-6'),
  periodsPerDay: z.coerce.number().min(1).max(8, 'Periods per day must be between 1-8'),
});

type FormData = z.infer<typeof formSchema>;

interface AutoGenerateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AutoGenerateModal: React.FC<AutoGenerateModalProps> = ({
  open,
  onOpenChange,
}) => {
  const { toast } = useToast();
  const [autoGenerateTimetable, { isLoading }] = useAutoGenerateTimetableMutation();
  const { data: classesResponse } = useGetClassesQuery({ page: 1, limit: 100, search: '' });

  // Extract data from API response
  const classes = classesResponse?.data?.data || [];

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      classId: '',
      numberOfDays: 6,
      periodsPerDay: 8,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      // Ensure all required fields are present
      const generateData: AutoGenerateTimetableData = {
        classId: data.classId!,
        numberOfDays: data.numberOfDays!,
        periodsPerDay: data.periodsPerDay!,
      };

      const result = await autoGenerateTimetable(generateData).unwrap();
      toast({
        title: 'Success',
        description: result.message,
      });
      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to auto-generate timetable',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Auto-Generate Timetable</DialogTitle>
          <DialogDescription>
            Automatically generate a complete timetable for a class based on available subjects and teachers
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="classId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {classes.map((classItem) => (
                        <SelectItem key={classItem.id} value={classItem.id}>
                          {classItem.name}
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
                name="numberOfDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Days</FormLabel>
                    <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Days" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.from({ length: 6 }, (_, i) => i + 1).map((day) => (
                          <SelectItem key={day} value={day.toString()}>
                            {day} Day{day > 1 ? 's' : ''}
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
                name="periodsPerDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Periods per Day</FormLabel>
                    <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Periods" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.from({ length: 8 }, (_, i) => i + 1).map((period) => (
                          <SelectItem key={period} value={period.toString()}>
                            {period} Period{period > 1 ? 's' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="bg-muted p-3 rounded-lg text-sm text-muted-foreground">
              <p><strong>Note:</strong> This will automatically assign subjects and teachers to time slots based on availability. Existing periods may be overwritten.</p>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Generating...' : 'Generate Timetable'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};