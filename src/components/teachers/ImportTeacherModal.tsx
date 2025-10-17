import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";
import { Upload } from "lucide-react"; // for a nice icon

const TEMPLATE_HEADERS = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "phone2",
  "dob",
  "address",
  "subject",
  "qualification",
  "experience",
];

const ImportTeacherModal = ({ open, onOpenChange, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // 🔽 Download Excel Template
  const handleDownloadTemplate = () => {
    const sampleData = [
      {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        phone: "9876543210",
        phone2: "9876543211",
        dob: "1990-05-15",
        address: "123 Street Name",
        subject: "Math",
        qualification: "M.Sc",
        experience: "5 Years",
      },
      {
        firstName: "Jane",
        lastName: "Smith",
        email: "jane.smith@example.com",
        phone: "9123456789",
        phone2: "",
        dob: "1988-08-25",
        address: "45 Park Avenue",
        subject: "English",
        qualification: "M.A",
        experience: "7 Years",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData, { header: TEMPLATE_HEADERS });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Teachers Template");
    XLSX.writeFile(workbook, "teacher_import_template.xlsx");
  };

  const handleImport = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file first!",
        variant: "destructive",
      });
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const response = await fetch("/api/v1/teachers/upload-csv", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(jsonData),
        });

        if (response.ok) {
          toast({
            title: "Success",
            description: "Teachers imported successfully!",
          });
          onSuccess();
          onOpenChange(false);
        } else {
          const errorData = await response.json();
          toast({
            title: "Import Failed",
            description: errorData.message || "An error occurred.",
            variant: "destructive",
          });
        }
      };
      reader.readAsBinaryString(file);
    } catch (error) {
      console.error("Error processing file:", error);
      toast({
        title: "Error",
        description: "Failed to process or upload file.",
        variant: "destructive",
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-semibold text-center">
            Import Teachers
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-muted-foreground">
            Upload an Excel or CSV file containing teacher details.  
            You can download a sample format below for reference.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Upload Area */}
        <div className="flex flex-col items-center gap-4 py-6">
          <label
            htmlFor="file-upload"
            className="w-full border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:bg-gray-50 transition"
          >
            <div className="flex flex-col items-center gap-3">
              <Upload className="w-10 h-10 text-gray-500" />
              <p className="text-sm text-gray-600">
                {file ? (
                  <span className="font-medium text-blue-600">{file.name}</span>
                ) : (
                  <>
                    <span className="font-semibold">Click to upload</span> or drag and drop your file here
                  </>
                )}
              </p>
              <p className="text-xs text-gray-400">(Accepted: .xlsx, .xls, .csv)</p>
            </div>
            <input
              id="file-upload"
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {/* Download Template */}
          <Button variant="secondary" onClick={handleDownloadTemplate} className="w-full">
            Download Sample Template
          </Button>
        </div>

        {/* Footer Buttons */}
        <AlertDialogFooter className="flex justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleImport}>Import</Button>
        </AlertDialogFooter>

        {/* Requirements Note */}
        <div className="mt-6 text-sm text-gray-500 border-t pt-3">
          <p className="font-semibold text-gray-700 mb-1">📋 File Requirements:</p>
          <ul className="list-disc ml-6 space-y-1">
            <li>Accepted formats: <b>.xlsx, .xls, .csv</b></li>
            <li>Must include these columns: <b>firstName, lastName, email, phone, subject</b></li>
            <li>Date format should be <b>YYYY-MM-DD</b></li>
            <li>Maximum file size: <b>5 MB</b></li>
          </ul>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ImportTeacherModal;
