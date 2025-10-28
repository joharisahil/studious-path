import { useState, useEffect } from "react";
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
import { TeacherFormData } from "@/types";
import { updateTeacher } from "@/services/TeachersApi";

interface EditTeacherModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacher: TeacherFormData;
  onSuccess?: () => void;
}

const EditTeacherModal = ({
  open,
  onOpenChange,
  teacher,
  onSuccess,
}: EditTeacherModalProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<TeacherFormData>({
    firstName: "",
    lastName: "",
    registrationNumber: "",
    email: "",
    phone: "",
    phone2: "",
    dateOfBirth: "",
    dob: "",
    address: "",
    subjectSpecialization: [],
    subjects: [],
    qualifications: [],
    yearsOfExperience: 0,
    experienceYears: 0,
    emergencyContact: {
      name: "",
      phone: "",
      relation: "",
    },
  });

  // Populate form when teacher changes
  useEffect(() => {
    if (teacher) {
      setFormData({
        firstName: teacher.firstName || "",
        lastName: teacher.lastName || "",
        registrationNumber: teacher.registrationNumber || "",
        email: teacher.email || "",
        phone: teacher.phone || "",
        phone2: teacher.phone2 || "",
        dateOfBirth: teacher.dateOfBirth
          ? teacher.dateOfBirth.slice(0, 10)
          : "",
        dob: teacher.dob ? teacher.dob.slice(0, 10) : "",
        address: teacher.address || "",
        subjectSpecialization: teacher.subjectSpecialization || [],
        subjects: teacher.subjects || [],
        qualifications: teacher.qualifications || [],
        yearsOfExperience: teacher.yearsOfExperience || 0,
        experienceYears: teacher.experienceYears || 0,
        emergencyContact: {
          name: teacher.emergencyContact?.name || "",
          phone: teacher.emergencyContact?.phone || "",
          relation: teacher.emergencyContact?.relation || "",
        },
      });
    }
  }, [teacher]);

  // Handle input changes dynamically
  const handleInputChange = (field: keyof TeacherFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await updateTeacher(teacher._id, formData);

      toast({
        title: "Teacher Updated",
        description: "Teacher information has been successfully updated.",
      });

      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.error || "Failed to update teacher.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Teacher</DialogTitle>
          <DialogDescription>
            Update teacher personal information
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              required
            />
          </div>

          {/* Phone Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone2">Alternate Phone</Label>
              <Input
                id="phone2"
                type="tel"
                value={formData.phone2 || ""}
                onChange={(e) => handleInputChange("phone2", e.target.value)}
              />
            </div>
          </div>

          {/* DOB */}
          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth *</Label>
            <Input
              id="dob"
              type="date"
              value={formData.dob}
              onChange={(e) => handleInputChange("dob", e.target.value)}
              required
            />
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              rows={3}
              required
            />
          </div>

          {/* Subjects */}
          <div className="space-y-2">
            <Label htmlFor="subjects">Subjects *</Label>
            <Input
              id="subjects"
              value={formData.subjects.join(", ")}
              onChange={(e) =>
                handleInputChange(
                  "subjects",
                  e.target.value.split(",").map((s) => s.trim())
                )
              }
              placeholder="Comma separated subjects"
              required
            />
          </div>

          {/* Qualifications */}
          <div className="space-y-2">
            <Label htmlFor="qualifications">Qualifications *</Label>
            <Input
              id="qualifications"
              value={formData.qualifications.join(", ")}
              onChange={(e) =>
                handleInputChange(
                  "qualifications",
                  e.target.value.split(",").map((q) => q.trim())
                )
              }
              placeholder="Comma separated qualifications"
              required
            />
          </div>

          {/* Experience */}
          <div className="space-y-2">
            <Label htmlFor="experienceYears">Years of Experience *</Label>
            <Input
              id="experienceYears"
              type="number"
              value={formData.experienceYears}
              onChange={(e) =>
                handleInputChange("experienceYears", Number(e.target.value))
              }
              min={0}
              required
            />
          </div>

          {/* Action Buttons */}
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
              {isLoading ? "Updating..." : "Update Teacher"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditTeacherModal;
