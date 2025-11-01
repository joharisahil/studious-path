import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useCreatePeriodMutation } from "@/store/api/timetableApi";
import { useGetTeachersQuery } from "@/store/api/subjectsApi";
import { TimetablePeriodFormData } from "@/types";
import { getAllClasses } from "@/services/ClassesApi";
import { getSubjects, getSubjectsByClass } from "@/services/subject";
import { getAllTeachers, getTeachersBySubject } from "@/services/TeachersApi";

const formSchema = z.object({
  day: z.string().min(1, "Day is required"),
  period: z.coerce.number().min(1).max(8, "Period must be between 1-8"),
  classId: z.string().min(1, "Class is required"),
  subjectId: z.string().min(1, "Subject is required"),
  teacherId: z.string().min(1, "Teacher is required"),
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
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isSubjectsLoading, setIsSubjectsLoading] = useState(false);
  const [isClassesLoading, setIsClassesLoading] = useState(false);
  const [isTeacherLoading, setIsTeacherLoading] = useState(false);
  const { toast } = useToast();
  const [createPeriod, { isLoading }] = useCreatePeriodMutation();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      day: "",
      period: 1,
      classId: "",
      subjectId: "",
      teacherId: "",
      room: "",
    },
  });


  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const periods = Array.from({ length: 8 }, (_, i) => i + 1);

  useEffect(() => {
    if (!open) {
      form.reset();
      setSubjects([]);
      setTeachers([]);
    } else {
      fetchClasses();
    }
  }, [open]);

  const fetchClasses = async () => {
    try {
      setIsClassesLoading(true);
      const classesData = await getAllClasses();
      if (Array.isArray(classesData)) {
        setClasses(classesData);
      } else {
        throw new Error("Invalid API response");
      }
    } catch (err) {
      console.error("Error fetching classes:", err);
      toast({
        title: "Error",
        description: "Failed to fetch classes",
        variant: "destructive",
      });
    } finally {
      setIsClassesLoading(false);
    }
  };

  const fetchSubjectsByClass = async (classId: string) => {
    try {
      setIsSubjectsLoading(true);
      const { subjects } = await getSubjectsByClass(classId);
      setSubjects(subjects);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      toast({
        title: "Error",
        description: "Failed to load subjects for selected class",
        variant: "destructive",
      });
    } finally {
      setIsSubjectsLoading(false);
    }
  };

  const fetchTeachersBySubject = async (subjectId: string) => {
    try {
      setIsTeacherLoading(true);
      const { teachers } = await getTeachersBySubject(subjectId);
      setTeachers(teachers);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      toast({
        title: "Error",
        description: "Failed to load teachers for selected subject",
        variant: "destructive",
      });
    } finally {
      setIsTeacherLoading(false);
    }
  };


  const onSubmit = async (data: FormData) => {
    try {
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
        title: "Success",
        description: result.message,
      });
      form.reset(); // ✅ clear form
      onOpenChange(false); // ✅ close modal
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to create period",
        variant: "destructive",
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
            {/* Day and Period */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="day"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Day</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
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
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      defaultValue={field.value?.toString()}
                    >
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

            {/* Class Dropdown */}
            <FormField
              control={form.control}
              name="classId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value || ""}
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.setValue("subjectId", ""); // reset subject
                        form.setValue("teacherId", ""); // reset teacher
                        setSubjects([]);
                        setTeachers([]);
                        fetchSubjectsByClass(value); //  load subjects when class selected

                      }}
                      disabled={isClassesLoading}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            isClassesLoading ? "Loading classes..." : "Select class"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {isClassesLoading ? (
                          <SelectItem value="loading" disabled>
                            Loading...
                          </SelectItem>
                        ) : classes.length === 0 ? (
                          <SelectItem value="none" disabled>
                            No Classes Found
                          </SelectItem>
                        ) : (
                          classes.map((cls) => (
                            <SelectItem key={cls._id} value={cls._id}>
                              {cls.grade} - {cls.section}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Subject Dropdown */}
            <FormField
              control={form.control}
              name="subjectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <Select
                    value={field.value || ""}
                    onValueChange={(value) => {
                      field.onChange(value);
                      fetchTeachersBySubject(value);
                    }}
                    disabled={
                      isSubjectsLoading || !form.watch("classId") // disable until class selected
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            !form.watch("classId")
                              ? "Select class first"
                              : isSubjectsLoading
                                ? "Loading subjects..."
                                : "Select subject"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isSubjectsLoading ? (
                        <SelectItem value="loading" disabled>
                          Loading...
                        </SelectItem>
                      ) : subjects.length === 0 ? (
                        <SelectItem value="none" disabled>
                          No Subjects Found
                        </SelectItem>
                      ) : (
                        subjects.map((subject) => (
                          <SelectItem key={subject._id} value={subject._id}>
                            {subject.name} ({subject.code})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Teacher Dropdown */}
            <FormField
              control={form.control}
              name="teacherId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teacher</FormLabel>
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                    disabled={
                      isTeacherLoading || !form.watch("subjectId") // disable until subject selected
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            !form.watch("subjectId")
                              ? "Select subject first"
                              : isTeacherLoading
                                ? "Loading teachers..."
                                : "Select teacher"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isTeacherLoading ? (
                        <SelectItem value="loading" disabled>
                          Loading...
                        </SelectItem>
                      ) : teachers.length === 0 ? (
                        <SelectItem value="none" disabled>
                          No teachers Found
                        </SelectItem>
                      ) : (
                        teachers.map((teacher) => (
                          <SelectItem key={teacher._id} value={teacher._id}>
                            {teacher.firstName} {teacher.lastName}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />


            {/* Room */}
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

            {/* Buttons */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Period"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
