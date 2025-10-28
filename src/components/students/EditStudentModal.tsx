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
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { updateStudentService } from "@/services/StudentsApi";
import { StudentFormData } from "@/types";

interface EditStudentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: StudentFormData;
  onSuccess?: () => void;
}

// Schema
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
  fatherEmail: z
    .string()
    .email("Invalid father email")
    .optional()
    .or(z.literal("")),
  motherName: z.string().min(2, "Mother name is required"),
  motherContact: z.string().min(10, "Mother contact number is required"),
  motherOccupation: z.string().min(2, "Mother occupation is required"),
  motherEmail: z
    .string()
    .email("Invalid mother email")
    .optional()
    .or(z.literal("")),
});

type StudentEditFormData = z.infer<typeof studentEditSchema> & {
  _classId?: string;
};

// Helper: format ISO to YYYY-MM-DD
const formatDateForInput = (isoDate?: string) => {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
};

const EditStudentModal = ({
  open,
  onOpenChange,
  student,
  onSuccess,
}: EditStudentModalProps) => {
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
      _classId: "", // internal field for backend
    },
    mode: "onChange",
  });

  // Populate form when modal opens
  useEffect(() => {
    if (student && open) {
      form.reset({
        firstName: student.firstName,
        lastName: student.lastName || "",
        email: student.email,
        phone: student.phone || "",
        dateOfBirth: formatDateForInput(student.dob),
        address: student.address || "",
        grade: student.classId?.grade || "",
        section: student.classId?.section || "",
        rollNumber: student.rollNumber || "",
        admissionDate: formatDateForInput(student.admissionDate),
        guardian: {
          name: student.contactName || "",
          phone: student.contactPhone || "",
          relation: student.relation || "",
        },
        fatherName: student.fatherName || "",
        fatherContact: student.fatherphone || "",
        fatherOccupation: student.fatherOccupation || "",
        fatherEmail: student.fatherEmail || "",
        motherName: student.motherName || "",
        motherContact: student.motherphone || "",
        motherOccupation: student.motherOccupation || "",
        motherEmail: student.motherEmail || "",
        _classId: student.classId?._id || "", // store ObjectId for backend
      });
    }
  }, [student, open, form]);

  // Form submit
  const onSubmit = async (data: StudentEditFormData) => {
    try {
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName || "",
        email: data.email,
        phone: data.phone,
        dob: data.dateOfBirth,
        address: data.address,
        classId: data._classId || student.classId?._id, // send ObjectId
        rollNumber: data.rollNumber || "",
        admissionDate: data.admissionDate || "",
        contactName: data.guardian.name,
        contactPhone: data.guardian.phone,
        relation: data.guardian.relation,
        fatherName: data.fatherName,
        fatherphone: data.fatherContact,
        fatherOccupation: data.fatherOccupation,
        fatherEmail: data.fatherEmail || "",
        motherName: data.motherName,
        motherphone: data.motherContact,
        motherOccupation: data.motherOccupation,
        motherEmail: data.motherEmail || "",
      };

      console.log("EditStudentModal — sending payload:", payload);
      console.log(
        "EditStudentModal — student id:",
        student?._id || student?.id
      );

      const studentId = student?._id || student?.id;
      if (!studentId) throw new Error("Student id is missing");

      await updateStudentService(studentId, payload);

      toast({
        title: "Student Updated",
        description: "Student information has been successfully updated.",
      });

      onSuccess?.();
      onOpenChange(false);
    } catch (err: any) {
      console.error("Update error:", err.response?.data || err.message || err);
      toast({
        title: "Error",
        description:
          err.response?.data?.message ||
          err.message ||
          "Failed to update student",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-gradient-primary">
            Edit Student
          </DialogTitle>
          <DialogDescription>
            Update student personal, academic, and parent information
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>First Name *</Label>
                <Input {...form.register("firstName")} />
                {form.formState.errors.firstName && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.firstName.message}
                  </p>
                )}
              </div>
              <div>
                <Label>Last Name</Label>
                <Input {...form.register("lastName")} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Email *</Label>
                <Input type="email" {...form.register("email")} />
              </div>
              <div>
                <Label>Phone *</Label>
                <Input type="tel" {...form.register("phone")} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Date of Birth *</Label>
                <Input type="date" {...form.register("dateOfBirth")} />
              </div>
              <div>
                <Label>Roll Number</Label>
                <Input {...form.register("rollNumber")} />
              </div>
            </div>

            <div>
              <Label>Address *</Label>
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
                <Label>Grade *</Label>
                <Input {...form.register("grade")} />
              </div>
              <div>
                <Label>Section *</Label>
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
                <Label>Father Name *</Label>
                <Input {...form.register("fatherName")} />
              </div>
              <div>
                <Label>Father Contact *</Label>
                <Input {...form.register("fatherContact")} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Father Occupation *</Label>
                <Input {...form.register("fatherOccupation")} />
              </div>
              <div>
                <Label>Father Email</Label>
                <Input type="email" {...form.register("fatherEmail")} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Mother Name *</Label>
                <Input {...form.register("motherName")} />
              </div>
              <div>
                <Label>Mother Contact *</Label>
                <Input {...form.register("motherContact")} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Mother Occupation *</Label>
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
                <Label>Guardian Name *</Label>
                <Input {...form.register("guardian.name")} />
              </div>
              <div>
                <Label>Guardian Phone *</Label>
                <Input {...form.register("guardian.phone")} />
              </div>
            </div>
            <div>
              <Label>Relationship *</Label>
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
            <Button
              type="submit"
              disabled={form.formState.isSubmitting || !form.formState.isDirty}
              className="flex-1"
            >
              {form.formState.isSubmitting ? "Updating..." : "Update Student"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditStudentModal;
