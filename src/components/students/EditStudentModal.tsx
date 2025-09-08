import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateStudentMutation } from "@/store/api/studentsApi";
import { useToast } from "@/hooks/use-toast";
import { StudentFormData } from "@/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface EditStudentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: StudentFormData;
  onSuccess?: () => void;
}

// ✅ Zod Validation Schema
const studentEditSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().optional().or(z.literal("")),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  address: z.string().min(10, "Address must be at least 10 characters"),
  grade: z.string().min(1, "Grade is required"),
  section: z.string().min(1, "Section is required"),
  rollNumber: z.string().optional(),
  admissionDate: z.string().optional(),

  guardian: z.object({
    name: z.string().min(2, "Guardian name is required"),
    phone: z.string().min(10, "Guardian phone must be at least 10 digits"),
    relation: z.string().min(1, "Relation is required"),
  }),

  fatherName: z.string().min(2, "Father name is required"),
  fatherContact: z.string().min(10, "Father contact number is required"),
  fatherOccupation: z.string().min(2, "Father occupation is required"),
  fatherEmail: z.string().email("Invalid father email").optional().or(z.literal("")),

  motherName: z.string().min(2, "Mother name is required"),
  motherContact: z.string().min(10, "Mother contact number is required"),
  motherOccupation: z.string().min(2, "Mother occupation is required"),
  motherEmail: z.string().email("Invalid mother email").optional().or(z.literal("")),
});

type StudentEditFormData = z.infer<typeof studentEditSchema>;

const EditStudentModal = ({
  open,
  onOpenChange,
  student,
  onSuccess,
}: EditStudentModalProps) => {
  const [updateStudent, { isLoading }] = useUpdateStudentMutation();
  const { toast } = useToast();

  const form = useForm<StudentEditFormData>({
    resolver: zodResolver(studentEditSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      address: "",
      grade: "",
      section: "",
      rollNumber: "",
      admissionDate: "",
      guardian: { name: "", phone: "", relation: "" },
      fatherName: "",
      fatherContact: "",
      fatherOccupation: "",
      fatherEmail: "",
      motherName: "",
      motherContact: "",
      motherOccupation: "",
      motherEmail: "",
    },
  });

  useEffect(() => {
    if (student && open) {
      form.reset({
        firstName: student.firstName,
        lastName: student.lastName || "",
        email: student.email,
        phone: student.phone || "",
        dateOfBirth: student.dateOfBirth || "",
        address: student.address || "",
        grade: student.grade || "",
        section: student.section || "",
        rollNumber: student.rollNumber || "",
        admissionDate: student.admissionDate || "",
        guardian: {
          name: student.guardian?.name || "",
          phone: student.guardian?.phone || "",
          relation: student.guardian?.relation || "",
        },
        fatherName: student.fatherName || "",
        fatherContact: student.fatherContact || "",
        fatherOccupation: student.fatherOccupation || "",
        fatherEmail: student.fatherEmail || "",
        motherName: student.motherName || "",
        motherContact: student.motherContact || "",
        motherOccupation: student.motherOccupation || "",
        motherEmail: student.motherEmail || "",
      });
    }
  }, [student, open, form]);

  const onSubmit = async (data: StudentEditFormData) => {
    try {
      await updateStudent({
        id: student.id,
        ...data,
        guardian: {
          name: data.guardian.name,
          phone: data.guardian.phone,
          relation: data.guardian.relation,
        },
      }).unwrap();

      toast({
        title: "Student Updated",
        description: "Student information has been successfully updated.",
      });

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update student. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-gradient-primary">Edit Student</DialogTitle>
          <DialogDescription>
            Update student personal, academic, and parent information
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>
                  First Name <span className="text-red-500">*</span>
                </Label>
                <Input {...form.register("firstName")} />
                {form.formState.errors.firstName && (
                  <p className="text-red-500 text-sm">{form.formState.errors.firstName.message}</p>
                )}
              </div>
              <div>
                <Label>Last Name</Label>
                <Input {...form.register("lastName")} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input type="email" {...form.register("email")} />
                {form.formState.errors.email && (
                  <p className="text-red-500 text-sm">{form.formState.errors.email.message}</p>
                )}
              </div>
              <div>
                <Label>
                  Phone <span className="text-red-500">*</span>
                </Label>
                <Input type="tel" {...form.register("phone")} />
                {form.formState.errors.phone && (
                  <p className="text-red-500 text-sm">{form.formState.errors.phone.message}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>
                  Date of Birth <span className="text-red-500">*</span>
                </Label>
                <Input type="date" {...form.register("dateOfBirth")} />
              </div>
              <div>
                <Label>Roll Number</Label>
                <Input {...form.register ("rollNumber")} />
              </div>
            </div>
            <div>
              <Label>
                Address <span className="text-red-500">*</span>
              </Label>
              <Textarea rows={3} {...form.register("address")} />
            </div>
          </div>

          {/* Academic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Academic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>
                  Grade <span className="text-red-500">*</span>
                </Label>
                <Input {...form.register("grade")} />
              </div>
              <div>
                <Label>
                  Section <span className="text-red-500">*</span>
                </Label>
                <Input {...form.register("section")} />
              </div>
            </div>
            <div>
              <Label>Admission Date</Label>
              <Input type="date" {...form.register("admissionDate")} />
            </div>
          </div>

          {/* Parent Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Parent Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>
                  Father Name <span className="text-red-500">*</span>
                </Label>
                <Input {...form.register("fatherName")} />
              </div>
              <div>
                <Label>
                  Father Contact <span className="text-red-500">*</span>
                </Label>
                <Input {...form.register("fatherContact")} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>
                  Father Occupation <span className="text-red-500">*</span>
                </Label>
                <Input {...form.register("fatherOccupation")} />
              </div>
              <div>
                <Label>Father Email</Label>
                <Input type="email" {...form.register("fatherEmail")} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>
                  Mother Name <span className="text-red-500">*</span>
                </Label>
                <Input {...form.register("motherName")} />
              </div>
              <div>
                <Label>
                  Mother Contact <span className="text-red-500">*</span>
                </Label>
                <Input {...form.register("motherContact")} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>
                  Mother Occupation <span className="text-red-500">*</span>
                </Label>
                <Input {...form.register("motherOccupation")} />
              </div>
              <div>
                <Label>Mother Email</Label>
                <Input type="email" {...form.register("motherEmail")} />
              </div>
            </div>
          </div>

          {/* Guardian Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Guardian Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>
                  Guardian Name <span className="text-red-500">*</span>
                </Label>
                <Input {...form.register("guardian.name")} />
              </div>
              <div>
                <Label>
                  Guardian Phone <span className="text-red-500">*</span>
                </Label>
                <Input {...form.register("guardian.phone")} />
              </div>
            </div>
            <div>
              <Label>
                Relationship <span className="text-red-500">*</span>
              </Label>
              <Input {...form.register("guardian.relation")} />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Updating..." : "Update Student"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditStudentModal;