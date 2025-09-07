import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, GraduationCap } from 'lucide-react';
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
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useFindFreeTeachersMutation } from '@/store/api/timetableApi';
import { FreeTeacher, FindFreeTeachersData } from '@/types';

const formSchema = z.object({
  day: z.string().min(1, 'Day is required'),
  period: z.coerce.number().min(1).max(8, 'Period must be between 1-8'),
});

type FormData = z.infer<typeof formSchema>;

interface FindFreeTeachersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const FindFreeTeachersModal: React.FC<FindFreeTeachersModalProps> = ({
  open,
  onOpenChange,
}) => {
  const { toast } = useToast();
  const [findFreeTeachers, { isLoading }] = useFindFreeTeachersMutation();
  const [freeTeachers, setFreeTeachers] = useState<FreeTeacher[]>([]);
  const [searched, setSearched] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      day: '',
      period: 1,
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
      const searchData: FindFreeTeachersData = {
        day: data.day,
        period: data.period,
      };

      const result = await findFreeTeachers(searchData).unwrap();
      setFreeTeachers(result);
      setSearched(true);
      
      toast({
        title: 'Search Complete',
        description: `Found ${result.length} available teacher${result.length !== 1 ? 's' : ''}`,
      });
    } catch (error: any) {
      toast({
        title: 'Error', 
        description: 'Failed to find free teachers',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Find Free Teachers</DialogTitle>
          <DialogDescription>
            Find teachers available during a specific time slot
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

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? 'Searching...' : 'Find Free Teachers'}
            </Button>
          </form>
        </Form>

        {searched && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Available Teachers</h3>
              <Badge variant="secondary">{freeTeachers.length} Available</Badge>
            </div>

            {freeTeachers.length > 0 ? (
              <div className="grid gap-4">
                {freeTeachers.map((teacher) => (
                  <Card key={teacher.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{teacher.name}</h4>
                          <p className="text-sm text-muted-foreground">{teacher.department}</p>
                          <div className="flex items-center gap-2 text-sm mt-1">
                            <Mail className="h-4 w-4" />
                            <span>{teacher.email}</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {teacher.subjectSpecialization.map((subject) => (
                            <Badge key={subject} variant="outline" className="text-xs">
                              {subject}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <div className="text-center text-muted-foreground">
                    <GraduationCap className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No teachers available during this time slot</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};