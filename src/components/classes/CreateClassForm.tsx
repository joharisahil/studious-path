import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createClass } from '@/services/ClassesApi';
import { ClassFormData } from '@/types';

const classSchema = z.object({
  name: z.string().min(2, 'Class name is required'),
  grade: z.string().min(1, 'Grade is required'),
  section: z.string().min(1, 'Section is required'),
  academicYear: z.string().min(4, 'Academic year is required'),
  maxCapacity: z.number().min(1, 'Max capacity must be at least 1'),
  room: z.string().optional(),
  classTeacherId: z.string().optional(),
  subjects: z.array(z.string()).min(1, 'Select at least one subject'),
});

const availableSubjects = ['Math', 'Science', 'English', 'History', 'Geography', 'Physics', 'Chemistry', 'Biology'];

interface CreateClassFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const CreateClassForm = ({ onSuccess, onCancel }: CreateClassFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<ClassFormData>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      name: '',
      grade: '',
      section: '',
      academicYear: '',
      maxCapacity: 30,
      room: '',
      classTeacherId: '',
      subjects: [],
    },
  });

  const onSubmit = async (data: ClassFormData) => {
    setLoading(true);
    try {
      const res = await createClass(data);
      toast({ title: 'Success', description: res.message });
      form.reset();
      onSuccess?.();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to create class', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Class</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter class name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="grade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grade</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>Grade {i + 1}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="section"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Section</FormLabel>
                    <Input placeholder="A/B/C" {...field} />
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
                    <Input placeholder="e.g., 2025-2026" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="maxCapacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Capacity</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
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
                      <Input placeholder="Enter room" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <Label>Subjects</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {availableSubjects.map(subject => (
                  <label key={subject} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      value={subject}
                      checked={form.getValues('subjects').includes(subject)}
                      onChange={e => {
                        const current = form.getValues('subjects');
                        if (e.target.checked) {
                          form.setValue('subjects', [...current, subject]);
                        } else {
                          form.setValue('subjects', current.filter(s => s !== subject));
                        }
                      }}
                    />
                    {subject}
                  </label>
                ))}
              </div>
              <FormMessage>{form.formState.errors.subjects?.message}</FormMessage>
            </div>

            <div className="flex justify-end gap-4 pt-6">
              {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Class
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
