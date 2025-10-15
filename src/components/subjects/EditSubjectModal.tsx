import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Subject, Class, Teacher } from "@/types";
import { updateSubject as apiUpdateSubject } from "@/services/subject";
import { getAllClasses } from "@/services/ClassesApi";
import { getAllTeachers } from "@/services/TeachersApi";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
  name: z.string().min(2, "Subject name must be at least 2 characters"),
  code: z.string().optional(),
  classId: z.string(),
  teacherIds: z.array(z.string()),
});

interface EditSubjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject: Subject | null;
  onSuccess: () => void;
}

const EditSubjectModal = ({
  open,
  onOpenChange,
  subject,
  onSuccess,
}: EditSubjectModalProps) => {
  const { toast } = useToast();

  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      code: "",
      classId: "",
      teacherIds: [],
    },
  });

  // Fetch classes and teachers when modal opens
  useEffect(() => {
    if (open) {
      fetchClasses();
      fetchTeachers();
    }
  }, [open]);

  const fetchClasses = async () => {
    try {
      const data = await getAllClasses();
      setClasses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch classes", error);
      setClasses([]);
    }
  };

  const fetchTeachers = async () => {
    try {
      const data = await getAllTeachers();

      // Handle both: array or paginated structure
      const teachersArray = Array.isArray(data)
        ? data
        : Array.isArray(data?.teachers)
        ? data.teachers
        : [];

      // Normalize and ensure _id exists
      const normalizedTeachers: Teacher[] = teachersArray.map((t: any) => ({
        ...t,
        _id: t._id || t.id || "", // fallback to empty string for safety
      }));

      setTeachers(normalizedTeachers);
    } catch (error) {
      console.error("Failed to fetch teachers", error);
      setTeachers([]);
    }
  };

  // Pre-fill form when modal opens
  useEffect(() => {
    if (open && subject && teachers.length > 0) {
      form.reset({
        name: subject.name || "",
        code: subject.code || "",
        classId: subject.classes?.[0]?._id || "",
        teacherIds: subject.teachers?.map((t) => t._id) || [],
      });
    }
  }, [open, subject, teachers]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!subject) return;
    setIsSubmitting(true);
    try {
      await apiUpdateSubject(subject._id, {
        name: data.name.trim(),
        code: data.code?.trim() || subject.code,
        classId: data.classId,
        teacherIds: data.teacherIds,
      });

      toast({
        title: "Subject Updated",
        description: "The subject details have been updated successfully.",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error updating subject:", error);

      // Extract backend message safely
      const backendMessage =
        error?.error || // from { error: "..." }
        error?.message ||
        error?.response?.data?.message ||
        "Failed to update subject. Please try again.";

      toast({
        title: "Update Failed",
        description: backendMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Subject</DialogTitle>
          <DialogDescription>
            Update the subject information below.
          </DialogDescription>
        </DialogHeader>

        {!subject ? (
          <p className="text-center text-gray-500">No subject selected.</p>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Subject Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter subject name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Subject Code */}
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter subject code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Class Dropdown (single select) */}
              <FormField
                control={form.control}
                name="classId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Class</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value || ""}
                        onValueChange={(val) => field.onChange(val)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                          {classes.map((c) => (
                            <SelectItem
                              key={c._id || c.id}
                              value={c._id || c.id}
                            >
                              {c.grade} {c.section || ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Teacher Multi-Select */}

              <FormField
                control={form.control}
                name="teacherIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Teachers</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between"
                          disabled={teachers.length === 0}
                        >
                          {field.value.length > 0
                            ? `${field.value.length} teacher(s) selected`
                            : "Select teachers"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full max-h-60 overflow-y-auto">
                        <div className="space-y-2">
                          {teachers.map((t) => (
                            <div
                              key={t._id}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                checked={field.value.includes(t._id)}
                                onCheckedChange={(checked) => {
                                  const newValues = checked
                                    ? [...field.value, t._id]
                                    : field.value.filter((id) => id !== t._id);
                                  field.onChange(newValues);
                                }}
                              />
                              <label className="text-sm">
                                {t.firstName} {t.lastName}
                              </label>
                            </div>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Updating...
                    </>
                  ) : (
                    "Update Subject"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditSubjectModal;
