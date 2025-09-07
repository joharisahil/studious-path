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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useCreatePeriodMutation } from '@/store/api/timetableApi';
import { useGetClassesQuery } from '@/store/api/classesApi';
import { useGetTeachersQuery, useGetSubjectsQuery } from '@/store/api/subjectsApi';
import { TimetablePeriodFormData } from '@/types';

const formSchema = z.object({
  day: z.string().min(1, 'Day is required'),
  period: z.coerce.number().min(1).max(8, 'Period must be between 1-8'),
  classId: z.string().min(1, 'Class is required'),
  subjectId: z.string().min(1, 'Subject is required'),
  teacherId: z.string().min(1, 'Teacher is required'),
  room: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface CreatePeriodModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreatePeriodModal: React.FC<CreatePeriodModalProps> = ({
  open,
  onOpenChange,
}) => {
  const { toast } = useToast();
  const [createPeriod, { isLoading }] = useCreatePeriodMutation();
  const { data: classesResponse } = useGetClassesQuery({ page: 1, limit: 100, search: '' });
  const { data: teachersResponse } = useGetTeachersQuery();
  const { data: subjectsResponse } = useGetSubjectsQuery({ page: 1, limit: 100, search: '' });

  // Extract data from API responses
  const classes = classesResponse?.data?.data || [];
  const teachers = teachersResponse?.data || [];
  const subjects = subjectsResponse?.data?.data || [];

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      day: '',
      period: 1,
      classId: '',
      subjectId: '',
      teacherId: '',
      room: '',
    },
  });

  const days = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  const periods = Array.from({ length: 8 }, (_, i) => i + 1);

  const onSubmit = async (data: FormData) => {
    try {
      // Ensure all required fields are present
      const periodData: TimetablePeriodFormData = {
        day: data.day!,
        period: data.period!,
        classId: data.classId!,
        subjectId: data.subjectId!,
        teacherId: data.teacherId!,
        room: data.room,
      };

      const result = await createPeriod(periodData).unwrap();
      toast({
        title: 'Success',
        description: result.message,
      });
      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to create period',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Period</DialogTitle>
          <DialogDescription>
            Manually assign a subject and teacher to a specific time slot
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="day"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Day</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select day" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {days.map((day) => (
                          <SelectItem key={day} value={day}>
                            {day}
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
                name="period"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Period</FormLabel>
                    <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {periods.map((period) => (
                          <SelectItem key={period} value={period.toString()}>
                            Period {period}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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

            <FormField
              control={form.control}
              name="subjectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name} ({subject.code})
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
              name="teacherId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teacher</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select teacher" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.firstName} {teacher.lastName}
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
              name="room"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Room 101, Lab 201" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Period'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};