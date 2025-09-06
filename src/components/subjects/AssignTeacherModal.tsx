import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';
import { useAssignTeacherMutation, useGetTeachersQuery } from '@/store/api/subjectsApi';
import { useToast } from '@/hooks/use-toast';
import { Subject } from '@/types';

interface ClassScheduleItem {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room: string;
}

interface AssignTeacherModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject: Subject;
  onSuccess: () => void;
}

const AssignTeacherModal = ({ open, onOpenChange, subject, onSuccess }: AssignTeacherModalProps) => {
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [schedule, setSchedule] = useState<ClassScheduleItem[]>([]);

  const form = useForm({
    defaultValues: {
      dayOfWeek: '',
      startTime: '',
      endTime: '',
      room: '',
    },
  });

  const { toast } = useToast();
  const { data: teachersResponse } = useGetTeachersQuery();
  const [assignTeacher, { isLoading }] = useAssignTeacherMutation();

  const teachers = teachersResponse?.data || [];
  const daysOfWeek = [
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
  ];

  const addScheduleItem = () => {
    const formData = form.getValues();
    if (formData.dayOfWeek && formData.startTime && formData.endTime && formData.room) {
      const newItem: ClassScheduleItem = {
        dayOfWeek: Number(formData.dayOfWeek),
        startTime: formData.startTime,
        endTime: formData.endTime,
        room: formData.room,
      };
      setSchedule([...schedule, newItem]);
      form.reset();
    }
  };

  const removeScheduleItem = (index: number) => {
    setSchedule(schedule.filter((_, i) => i !== index));
  };

  const getDayName = (dayOfWeek: number) => {
    return daysOfWeek.find(day => day.value === dayOfWeek)?.label || '';
  };

  const onSubmit = async () => {
    if (!selectedTeacher) {
      toast({
        title: "Error",
        description: "Please select a teacher to assign.",
        variant: "destructive",
      });
      return;
    }

    try {
      await assignTeacher({
        subjectId: subject.id,
        teacherId: selectedTeacher,
        classSchedule: schedule.length > 0 ? schedule : undefined,
      }).unwrap();

      toast({
        title: "Teacher Assigned",
        description: "Teacher has been successfully assigned to the subject.",
      });

      setSelectedTeacher('');
      setSchedule([]);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign teacher. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Teacher</DialogTitle>
          <DialogDescription>
            Assign a teacher to {subject.name} and optionally set up class schedule.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Subject Info */}
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Subject:</span>
                  <span>{subject.name} ({subject.code})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Department:</span>
                  <span>{subject.department}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Grade:</span>
                  <Badge variant="outline">Grade {subject.grade}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Teacher Selection */}
          <div>
            <label className="text-sm font-medium">Select Teacher</label>
            <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Choose a teacher" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    <div>
                      <div>{teacher.firstName} {teacher.lastName}</div>
                      <div className="text-xs text-muted-foreground">
                        {teacher.department} • {teacher.subjectSpecialization.join(', ')}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Class Schedule */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Class Schedule (Optional)</label>
            </div>

            {/* Add Schedule Form */}
            <Card>
              <CardContent className="pt-4">
                <Form {...form}>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <FormField
                      control={form.control}
                      name="dayOfWeek"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Day</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select day" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {daysOfWeek.map((day) => (
                                <SelectItem key={day.value} value={day.value.toString()}>
                                  {day.label}
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
                          <FormLabel>Room</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Room 101" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Time</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="endTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Time</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={addScheduleItem}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Schedule
                  </Button>
                </Form>
              </CardContent>
            </Card>

            {/* Schedule List */}
            {schedule.length > 0 && (
              <div className="space-y-2">
                <span className="text-sm font-medium">Added Schedule:</span>
                {schedule.map((item, index) => (
                  <Card key={index}>
                    <CardContent className="pt-3 pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Badge variant="outline">{getDayName(item.dayOfWeek)}</Badge>
                          <span className="text-sm">
                            {item.startTime} - {item.endTime}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {item.room}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeScheduleItem(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={isLoading || !selectedTeacher}>
            {isLoading ? 'Assigning...' : 'Assign Teacher'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignTeacherModal;