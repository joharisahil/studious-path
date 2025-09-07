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
import { useUpdateStudentMutation } from "@/store/api/studentsApi";
import { useToast } from "@/hooks/use-toast";
import { StudentFormData } from "@/types";

interface EditStudentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: StudentFormData;
  onSuccess?: () => void;
}

const EditStudentModal = ({
  open,
  onOpenChange,
  student,
  onSuccess,
}: EditStudentModalProps) => {
  const [updateStudent, { isLoading }] = useUpdateStudentMutation();
  const { toast } = useToast();

const [formData, setFormData] = useState<StudentFormData>({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",               // optional, but default empty string
  dateOfBirth: "",         // yyyy-mm-dd format
  address: "",
  grade: "",               // e.g., "1", "2", ..., "12"
  section: "",             // e.g., "A", "B"
  rollNumber: "",          // optional
  admissionDate: "",       // yyyy-mm-dd
  guardian: {
    name: "",
    phone: "",
    relation: "",
  },
});

useEffect(() => {
  if (student && open) {
    setFormData({
      firstName: student.firstName,
      lastName: student.lastName,
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
    });
  }
}, [student, open]);


  const handleInputChange = (
    field: keyof StudentFormData | keyof StudentFormData["guardian"],
    value: any,
    isGuardian = false
  ) => {
    if (isGuardian) {
      setFormData((prev) => ({
        ...prev,
        guardian: {
          ...prev.guardian,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateStudent({
        id: student.id,
        ...formData,
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
            Update student personal and academic information
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Personal Information
            </h3>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rollNumber">Roll Number</Label>
                <Input
                  id="rollNumber"
                  value={formData.rollNumber}
                  onChange={(e) => handleInputChange("rollNumber", e.target.value)}
                />
              </div>
            </div>

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
          </div>

          {/* Academic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Academic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="grade">Grade *</Label>
                <Input
                  id="grade"
                  value={formData.grade}
                  onChange={(e) => handleInputChange("grade", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="section">Section *</Label>
                <Input
                  id="section"
                  value={formData.section}
                  onChange={(e) => handleInputChange("section", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="admissionDate">Admission Date</Label>
              <Input
                id="admissionDate"
                type="date"
                value={formData.admissionDate}
                onChange={(e) => handleInputChange("admissionDate", e.target.value)}
              />
            </div>
          </div>

          {/* Guardian Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Guardian Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="guardianName">Guardian Name *</Label>
                <Input
                  id="guardianName"
                  value={formData.guardian.name}
                  onChange={(e) => handleInputChange("name", e.target.value, true)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guardianPhone">Guardian Phone *</Label>
                <Input
                  id="guardianPhone"
                  type="tel"
                  value={formData.guardian.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value, true)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="guardianRelation">Relationship *</Label>
              <Input
                id="guardianRelation"
                value={formData.guardian.relation}
                onChange={(e) => handleInputChange("relation", e.target.value, true)}
                required
              />
            </div>
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
              {isLoading ? "Updating..." : "Update Student"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditStudentModal;
