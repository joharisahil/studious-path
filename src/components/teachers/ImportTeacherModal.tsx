import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';  // For parsing Excel files

// Define an interface for the Excel row data
interface ExcelRow {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  phone2?: string;
  dob?: string;
  address?: string;
  subject?: string;
  qualification?: string;
  experience?: string;
}

const ImportTeacherModal = ({ open, onOpenChange, onSuccess }) => {
  const [file, setFile] = useState(null);
  const { toast } = useToast();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleImport = async () => {
    if (file) {
      try {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const data = e.target.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet) as ExcelRow[];  // Type assertion to ExcelRow[]

          // Now map the data, with TypeScript knowing the shape
          const mappedData = jsonData.map((row) => ({
            firstName: row.firstName || '',
            lastName: row.lastName || '',
            email: row.email || '',
            phone: row.phone || '',
            phone2: row.phone2 || '',
            dob: row.dob || '',
            address: row.address || '',
            subject: row.subject || '',
            qualification: row.qualification || '',
            experience: row.experience || '',
          }));

          // Send the mapped data to your API
          const response = await fetch('/api/v1/teachers/upload-csv', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(mappedData),
          });

          if (response.ok) {
            toast({
              title: "Success",
              description: "Teachers imported successfully!",
            });
            onSuccess();  // Refresh the teacher list
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
        console.error('Error processing file:', error);
        toast({
          title: "Error",
          description: "Failed to process or upload file.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Error",
        description: "Please select a file first!",
        variant: "destructive",
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Import Teachers</AlertDialogTitle>
          <AlertDialogDescription>
            Select an Excel or CSV file to import teacher data. Ensure it matches the required format.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4">
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileChange}
            className="border p-2 rounded w-full"
          />
        </div>
        <AlertDialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleImport}>Import</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ImportTeacherModal;
