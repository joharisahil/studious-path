import * as XLSX from "xlsx";
import { useState, useRef } from "react";
import {
  Upload,
  Download,
  CheckCircle,
  AlertCircle,
  FileSpreadsheet,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { uploadStudentsExcelApi } from "@/services/ClassesApi";
interface UploadStudentsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string | null;
  session: string; // pass session from parent (e.g., 2025-26)
}

export const UploadStudentsModal = ({
  open,
  onOpenChange,
  classId,
  session,
}: UploadStudentsModalProps) => {
  const [uploadResults, setUploadResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && classId) {
      await handleFile(file);
    } else {
      toast.error("Please select a class before uploading.");
    }
  };

  const handleFile = async (file: File) => {
    if (!classId) return;

    try {
      setLoading(true);
      const res = await uploadStudentsExcelApi(file, classId, session);
      setUploadResults(res);
      toast.success("Upload completed successfully!");
    } catch (err: any) {
      console.error("Upload Error:", err.response || err.message);
      toast.error(err?.response?.data?.error || "Failed to upload Excel file");
    } finally {
      setLoading(false);
    }
  };





// Function to download Excel template
 const downloadTemplate = () => {
  const headers = [
    { name: "firstName", required: true },
    { name: "lastName", required: false },
    { name: "phone", required: true },
    { name: "dob", required: false },
    { name: "address", required: false },
    { name: "aadhaarNumber", required: false },
    { name: "caste", required: false },
    { name: "contactEmail", required: false },
    { name: "contactName", required: false },
    { name: "contactPhone", required: false },
    { name: "relation", required: false },
    { name: "fatherName", required: false },
    { name: "motherName", required: false },
    { name: "fatherphone", required: false },
    { name: "motherphone", required: false },
    { name: "fatherEmail", required: false },
    { name: "motherEmail", required: false },
    { name: "fatherOccupation", required: false },
    { name: "motherOccupation", required: false },
  ];

  const exampleRow = {
    firstName: "Rahul",
    lastName: "Sharma",
    phone: "9876543210",
    dob: "2008-05-12",
    address: "123, MG Road, Delhi",
    aadhaarNumber: "123412341234",
    caste: "General",
    contactEmail: "parent@example.com",
    contactName: "Mr. Sharma",
    contactPhone: "9876543211",
    relation: "Father",
    fatherName: "Mr. Sharma",
    motherName: "Mrs. Sharma",
    fatherphone: "9876543211",
    motherphone: "9876543212",
    fatherEmail: "father@example.com",
    motherEmail: "mother@example.com",
    fatherOccupation: "Engineer",
    motherOccupation: "Teacher",
  };

  const ws = XLSX.utils.json_to_sheet([exampleRow], {
    header: headers.map((h) => h.name),
  });

  // Style header row
  const range = XLSX.utils.decode_range(ws["!ref"]!);
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
    if (!ws[cellAddress]) continue;

    const headerInfo = headers[C];
    ws[cellAddress].s = {
      font: { bold: true, color: { rgb: headerInfo.required ? "FF0000" : "008000" } },
      alignment: { horizontal: "center" },
      fill: { fgColor: { rgb: "FFFFFF" } },
    };
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "StudentsTemplate");

  XLSX.writeFile(wb, "student_upload_template.xlsx", { bookType: "xlsx" });
};

//   const headers = [
//     "firstName",
//     "lastName",
//     "phone",
//     "dob",
//     "address",
//     "aadhaarNumber",
//     "caste",
//     "contactEmail",
//     "contactName",
//     "contactPhone",
//     "relation",
//     "fatherName",
//     "motherName",
//     "fatherphone",
//     "motherphone",
//     "fatherEmail",
//     "motherEmail",
//     "fatherOccupation",
//     "motherOccupation",
//   ];
//    const exampleRow = {
//     firstName: "Rahul",
//     lastName: "Sharma",
//     phone: "9876543210",
//     dob: "2008-05-12",
//     address: "123, MG Road, Delhi",
//     aadhaarNumber: "123412341234",
//     caste: "General",
//     contactEmail: "parent@example.com",
//     contactName: "Mr. Sharma",
//     contactPhone: "9876543211",
//     relation: "Father",
//     fatherName: "Mr. Sharma",
//     motherName: "Mrs. Sharma",
//     fatherphone: "9876543211",
//     motherphone: "9876543212",
//     fatherEmail: "father@example.com",
//     motherEmail: "mother@example.com",
//     fatherOccupation: "Engineer",
//     motherOccupation: "Teacher",
//   };

//   // Optional: Add an example row (all empty for now)


//   const ws = XLSX.utils.json_to_sheet([exampleRow]);
//   const wb = XLSX.utils.book_new();
//   XLSX.utils.book_append_sheet(wb, ws, "StudentsTemplate");

//   XLSX.writeFile(wb, "student_upload_template.xlsx");
// };

// const downloadTemplate = () => {
//   // Define headers with info about required/optional
//   const headers = [
//     { name: "firstName", required: true },
//     { name: "lastName", required: false },
//     { name: "phone", required: true },
//     { name: "dob", required: false },
//     { name: "address", required: false },
//     { name: "aadhaarNumber", required: false },
//     { name: "caste", required: false },
//     { name: "contactEmail", required: false },
//     { name: "contactName", required: false },
//     { name: "contactPhone", required: false },
//     { name: "relation", required: false },
//     { name: "fatherName", required: false },
//     { name: "motherName", required: false },
//     { name: "fatherphone", required: false },
//     { name: "motherphone", required: false },
//     { name: "fatherEmail", required: false },
//     { name: "motherEmail", required: false },
//     { name: "fatherOccupation", required: false },
//     { name: "motherOccupation", required: false },
//   ];

//   // Example row
//   const exampleRow = {
//     firstName: "Rahul",
//     lastName: "Sharma",
//     phone: "9876543210",
//     dob: "2008-05-12",
//     address: "123, MG Road, Delhi",
//     aadhaarNumber: "123412341234",
//     caste: "General",
//     contactEmail: "parent@example.com",
//     contactName: "Mr. Sharma",
//     contactPhone: "9876543211",
//     relation: "Father",
//     fatherName: "Mr. Sharma",
//     motherName: "Mrs. Sharma",
//     fatherphone: "9876543211",
//     motherphone: "9876543212",
//     fatherEmail: "father@example.com",
//     motherEmail: "mother@example.com",
//     fatherOccupation: "Engineer",
//     motherOccupation: "Teacher",
//   };

//   // Create worksheet
//   const ws = XLSX.utils.json_to_sheet([exampleRow], {
//     header: headers.map((h) => h.name),
//   });

//   // Style header row
//   const range = XLSX.utils.decode_range(ws["!ref"]!);
//   for (let C = range.s.c; C <= range.e.c; ++C) {
//     const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
//     if (!ws[cellAddress]) continue;

//     const headerInfo = headers[C];

//     ws[cellAddress].s = {
//       font: { bold: true, color: { rgb: headerInfo.required ? "FF0000" : "008000" } },
//     };
//   }

//   // Create workbook and download
//   const wb = XLSX.utils.book_new();
//   XLSX.utils.book_append_sheet(wb, ws, "StudentsTemplate");
//   XLSX.writeFile(wb, "student_upload_template.xlsx");
// };

  const resetModal = () => {
    setUploadResults(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        onOpenChange(val);
        if (!val) resetModal();
      }}
    >
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Upload Students Excel</DialogTitle>
          <DialogDescription>
            Upload your Excel (.xlsx, .xls) file containing student details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Download Template */}
          <Card>
            <CardContent className="pt-6 flex justify-between items-center">
              <div>
                <h4 className="font-medium">Download Template</h4>
                <p className="text-sm text-muted-foreground">
                  Get the correct format for uploading students
                </p>
              </div>
              <Button variant="outline" onClick={downloadTemplate}>
                <Download className="w-4 h-4 mr-2" />
                Template
              </Button>
            </CardContent>
          </Card>

          {/* Upload Section */}
          {!uploadResults && (
            <Card className="border-2 border-dashed">
              <CardContent className="pt-6 flex flex-col items-center py-8">
                <FileSpreadsheet className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Upload Excel File</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Click below to upload your Excel file (.xlsx or .xls)
                </p>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading || !classId}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {loading ? "Uploading..." : "Choose File"}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={handleFileInput}
                />
              </CardContent>
            </Card>
          )}

          {/* Upload Results */}
          {uploadResults && (
            <>
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Uploaded {uploadResults.summary.success} students successfully.
                </AlertDescription>
              </Alert>

              {uploadResults.results.failed.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {uploadResults.results.failed.length} failed rows. Please
                    check your Excel file.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-center">
                <Button onClick={resetModal}>Upload Another File</Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
