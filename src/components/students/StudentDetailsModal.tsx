// StudentDetailsModal.tsx
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";

interface StudentDetailsModalProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
  student: any;
}

const StudentDetailsModal: React.FC<StudentDetailsModalProps> = ({
  open,
  onOpenChange,
  onClose,
  student,
}) => {
  if (!student) return null;

  const scholarshipMeta = student.scholarshipInfo ?? {};
  const scholarships = Array.isArray(scholarshipMeta.scholarships)
    ? scholarshipMeta.scholarships
    : [];

  const formatDate = (date: string | undefined | null) =>
    date
      ? new Date(date).toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—";

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onClose?.();
      onOpenChange?.(false);
    } else {
      onOpenChange?.(true);
    }
  };

  // Generic copy function
  const handleCopy = (text: string, label?: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label ?? "Information"} copied to clipboard!`);
  };

  // Format sections as plain text for copying
  const studentInfoText = `
Student: ${student.firstName ?? ""} ${student.lastName ?? ""}
Registration No: ${student.registrationNumber ?? ""}
Class: ${student.classId?.grade ?? student.grade ?? "—"}-${student.classId?.section ?? student.section ?? "—"}
Date of Birth: ${student.dob ? new Date(student.dob).toLocaleDateString("en-IN") : "—"}
Address: ${student.address ?? "N/A"}
Email: ${student.email ?? "N/A"}
Phone: ${student.phone ?? "N/A"}
Created On: ${formatDate(student.createdAt)}
  `.trim();

  const fatherInfoText = `
Father's Name: ${student.fatherName ?? "N/A"}
Occupation: ${student.fatherOccupation ?? "N/A"}
Phone: ${student.fatherphone ?? "N/A"}
Email: ${student.fatherEmail ?? "N/A"}
  `.trim();

  const motherInfoText = `
Mother's Name: ${student.motherName ?? "N/A"}
Occupation: ${student.motherOccupation ?? "N/A"}
Phone: ${student.motherphone ?? "N/A"}
Email: ${student.motherEmail ?? "N/A"}
  `.trim();

  const guardianInfoText = `
Contact Person: ${student.contactName ?? "N/A"}
Relation: ${student.relation ?? "N/A"}
Email: ${student.contactEmail ?? "N/A"}
Phone: ${student.contactPhone ?? "N/A"}
  `.trim();

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl bg-background border border-border">
        <DialogHeader className="border-b pb-3 mb-4">
          <DialogTitle className="text-2xl font-bold tracking-tight flex items-center justify-between">
            <span>
              {student.firstName} {student.lastName}
            </span>
            {/* <Badge variant="outline" className="text-sm px-3 py-1">
              {student.status ?? "Active"}
            </Badge> */}
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Registration No:{" "}
            <span className="font-medium">{student.registrationNumber}</span>
          </p>
        </DialogHeader>

        <div className="space-y-8 px-4 pb-6">
          {/* === STUDENT INFORMATION === */}
          <section>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold mb-2 text-primary">
                🎓 Student Information
              </h3>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => handleCopy(studentInfoText, "Student details")}
              >
                <Copy className="w-4 h-4 mr-1" /> Copy
              </Button>
            </div>
            <Separator className="mb-3" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <strong>Class:</strong>{" "}
                {student.classId?.grade ?? student.grade ?? "—"} -{" "}
                {student.classId?.section ?? student.section ?? "—"}
              </div>
              <div>
                <strong>Date of Birth:</strong>{" "}
                {student.dob
                  ? new Date(student.dob).toLocaleDateString("en-IN")
                  : "—"}
              </div>
              <div>
                <strong>Address:</strong> {student.address || "N/A"}
              </div>
              <div>
                <strong>Email:</strong> {student.email || "N/A"}
              </div>
              <div>
                <strong>Phone:</strong> {student.phone || "N/A"}
              </div>
              <div>
                <strong>Created On:</strong> {formatDate(student.createdAt)}
              </div>
            </div>
          </section>

          {/* === PARENT / GUARDIAN INFO === */}
          <section>
            <h3 className="text-lg font-semibold mb-2 text-primary">
              👨‍👩‍👧 Parent / Guardian Information
            </h3>
            <Separator className="mb-3" />

            {/* --- Father --- */}
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">Father</h4>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => handleCopy(fatherInfoText, "Father details")}
              >
                <Copy className="w-4 h-4 mr-1" /> Copy
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <strong>Name:</strong> {student.fatherName || "N/A"}
              </div>
              <div>
                <strong>Occupation:</strong> {student.fatherOccupation || "N/A"}
              </div>
              <div>
                <strong>Phone:</strong> {student.fatherphone || "N/A"}
              </div>
              <div>
                <strong>Email:</strong> {student.fatherEmail || "N/A"}
              </div>
            </div>

            <Separator className="my-4" />

            {/* --- Mother --- */}
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">Mother</h4>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => handleCopy(motherInfoText, "Mother details")}
              >
                <Copy className="w-4 h-4 mr-1" /> Copy
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <strong>Name:</strong> {student.motherName || "N/A"}
              </div>
              <div>
                <strong>Occupation:</strong> {student.motherOccupation || "N/A"}
              </div>
              <div>
                <strong>Phone:</strong> {student.motherphone || "N/A"}
              </div>
              <div>
                <strong>Email:</strong> {student.motherEmail || "N/A"}
              </div>
            </div>

            <Separator className="my-4" />

            {/* --- Guardian / Contact --- */}
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">Guardian / Contact</h4>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => handleCopy(guardianInfoText, "Guardian details")}
              >
                <Copy className="w-4 h-4 mr-1" /> Copy
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <strong>Contact Person:</strong> {student.contactName || "N/A"}
              </div>
              <div>
                <strong>Relation:</strong> {student.relation || "N/A"}
              </div>
              <div>
                <strong>Email:</strong> {student.contactEmail || "N/A"}
              </div>
              <div>
                <strong>Phone:</strong> {student.contactPhone || "N/A"}
              </div>
            </div>
          </section>

          {/* === SCHOLARSHIP INFO === */}
          <section>
            <h3 className="text-lg font-semibold mb-2 text-primary">
              🎖️ Scholarship Information
            </h3>
            <Separator className="mb-3" />
            {scholarships.length > 0 ? (
              <div className="space-y-4">
                {scholarships.map((scholarship: any, index: number) => (
                  <div
                    key={index}
                    className="border p-4 rounded-xl bg-muted/20 hover:bg-muted/30 transition"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-base">
                        {scholarship.name ?? scholarship.scholarshipName ?? "—"}
                      </h4>
                      <Badge variant="default" className="capitalize">
                        {scholarship.type ?? "—"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                      <div>
                        <strong>Amount:</strong>{" "}
                        {typeof scholarship.value !== "undefined"
                          ? scholarship.valueType === "fixed"
                            ? `₹${scholarship.value}`
                            : `${scholarship.value}%`
                          : "—"}
                      </div>
                      <div>
                        <strong>Period:</strong> {scholarship.period ?? "—"}
                      </div>
                      <div>
                        <strong>Months:</strong>{" "}
                        {Array.isArray(scholarship.months) &&
                        scholarship.months.length
                          ? scholarship.months.join(", ")
                          : "—"}
                      </div>
                      <div>
                        <strong>Applied Date:</strong>{" "}
                        {formatDate(scholarship.appliedAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No scholarship information available.
              </p>
            )}
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StudentDetailsModal;
