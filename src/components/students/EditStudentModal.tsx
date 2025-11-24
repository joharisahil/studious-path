import { useEffect, useState } from "react";
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
import { Loader2 } from "lucide-react";
import { StudentFormData } from "@/types";

// ✅ ONLY firstName & phone required
const studentEditSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),

  email: z.string().optional(), // not required
  phone: z.string().min(10, "Phone must be at least 10 digits"),

  dateOfBirth: z.string().optional(),
  address: z.string().optional(),

  caste: z.string().optional(),
  aadhaarNumber: z
    .string()
    .optional()
    .refine((v) => !v || /^[0-9]{12}$/.test(v), {
      message: "Aadhaar must be 12 digits",
    }),

  grade: z.string().optional(),
  section: z.string().optional(),

  rollNumber: z.string().optional(),
  admissionDate: z.string().optional(),

  guardian: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    relation: z.string().optional(),
  }),

  fatherName: z.string().optional(),
  fatherContact: z.string().optional(),
  fatherOccupation: z.string().optional(),
  fatherEmail: z.string().optional(),

  motherName: z.string().optional(),
  motherContact: z.string().optional(),
  motherOccupation: z.string().optional(),
  motherEmail: z.string().optional(),
});

type StudentEditFormData = z.infer<typeof studentEditSchema> & {
  _classId?: string;
};

const formatDateForInput = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")}`;
};

interface EditStudentModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  student: StudentFormData | null;
  onSuccess?: () => void;
}

const EditStudentModal = ({
  open,
  onOpenChange,
  student,
  onSuccess,
}: EditStudentModalProps) => {
  const { toast } = useToast();
  const [loadingStudent, setLoadingStudent] = useState(true);

  const form = useForm<StudentEditFormData>({
    resolver: zodResolver(studentEditSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      address: "",
      caste: "",
      aadhaarNumber: "",
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
      _classId: "",
    },
  });

  useEffect(() => {
    if (student && open) {
      setLoadingStudent(true);

      form.reset({
        firstName: student.firstName || "",
        lastName: student.lastName || "",
        email: student.email || "",
        phone: student.phone || "",
        dateOfBirth: formatDateForInput(student.dob),
        address: student.address || "",
        caste: student.caste || "",
        aadhaarNumber: student.aadhaarNumber || "",
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
        _classId: student.classId?._id || "",
      });

      setTimeout(() => setLoadingStudent(false), 300);
    }
  }, [student, open, form]);

  const onSubmit = async (data: StudentEditFormData) => {
    try {
      const payload: any = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: student?.email,
        phone: data.phone,
        dob: data.dateOfBirth,
        address: data.address,
        caste: data.caste,
        aadhaarNumber: data.aadhaarNumber,
        classId: data._classId || student?.classId?._id,
        rollNumber: data.rollNumber,
        admissionDate: data.admissionDate,
        contactName: data.guardian?.name,
        contactPhone: data.guardian?.phone,
        relation: data.guardian?.relation,
        fatherName: data.fatherName,
        fatherphone: data.fatherContact,
        fatherOccupation: data.fatherOccupation,
        fatherEmail: data.fatherEmail,
        motherName: data.motherName,
        motherphone: data.motherContact,
        motherOccupation: data.motherOccupation,
        motherEmail: data.motherEmail,
      };

      const studentId = student?._id || student?._id;
      if (!studentId) throw new Error("Student ID missing");

      await updateStudentService(studentId, payload);

      toast({
        title: "Student Updated",
        description: "Student details updated successfully.",
      });

      onSuccess?.();
      onOpenChange(false);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || err.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Student</DialogTitle>
          <DialogDescription>Update student information.</DialogDescription>
        </DialogHeader>

        {loadingStudent ? (
          <div className="w-full py-20 flex justify-center">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* ✅ PERSONAL */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground">
                Personal Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>First Name *</Label>
                  <Input {...form.register("firstName")} />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input {...form.register("lastName")} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Email</Label>
                  <Input
                    {...form.register("email")}
                    disabled
                    className="bg-gray-100 opacity-70"
                  />
                </div>
                <div>
                  <Label>Phone *</Label>
                  <Input {...form.register("phone")} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Caste</Label>
                  <Input {...form.register("caste")} />
                </div>
                <div>
                  <Label>Aadhaar</Label>
                  <Input {...form.register("aadhaarNumber")} maxLength={12} />
                </div>
              </div>

              <div>
                <Label>Date of Birth</Label>
                <Input type="date" {...form.register("dateOfBirth")} />
              </div>

              <div>
                <Label>Address</Label>
                <Textarea rows={3} {...form.register("address")} />
              </div>
            </div>

            {/* ✅ ACADEMIC */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground">
                Academic Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Grade</Label>
                  <Input
                    {...form.register("grade")}
                    readOnly
                    className="bg-gray-100"
                  />
                </div>
                <div>
                  <Label>Section</Label>
                  <Input
                    {...form.register("section")}
                    readOnly
                    className="bg-gray-100"
                  />
                </div>
              </div>

              <div>
                <Label>Admission Date</Label>
                <Input type="date" {...form.register("admissionDate")} />
              </div>
            </div>

            {/* ✅ PARENTS */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground">
                Parent Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Father Name</Label>
                  <Input {...form.register("fatherName")} />
                </div>
                <div>
                  <Label>Father Contact</Label>
                  <Input {...form.register("fatherContact")} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Father Occupation</Label>
                  <Input {...form.register("fatherOccupation")} />
                </div>
                <div>
                  <Label>Father Email</Label>
                  <Input {...form.register("fatherEmail")} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Mother Name</Label>
                  <Input {...form.register("motherName")} />
                </div>
                <div>
                  <Label>Mother Contact</Label>
                  <Input {...form.register("motherContact")} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Mother Occupation</Label>
                  <Input {...form.register("motherOccupation")} />
                </div>
                <div>
                  <Label>Mother Email</Label>
                  <Input {...form.register("motherEmail")} />
                </div>
              </div>
            </div>

            {/* ✅ GUARDIAN */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground">
                Guardian Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Guardian Name</Label>
                  <Input {...form.register("guardian.name")} />
                </div>
                <div>
                  <Label>Guardian Phone</Label>
                  <Input {...form.register("guardian.phone")} />
                </div>
              </div>

              <div>
                <Label>Relation</Label>
                <Input {...form.register("guardian.relation")} />
              </div>
            </div>

            {/* ✅ BUTTONS */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="flex-1 flex items-center justify-center gap-2"
              >
                {form.formState.isSubmitting && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {form.formState.isSubmitting ? "Updating..." : "Update Student"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditStudentModal;
