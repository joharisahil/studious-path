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
import { useToast } from "@/hooks/use-toast"; // Import useToast for notifications

const ImportStudentModal = ({ open, onOpenChange, onSuccess }) => {
  const [file, setFile] = useState(null);
  const { toast } = useToast(); // Use the toast hook for notifications

  const handleFileChange = (e) => {
    setFile(e.target.files[0]); // Store the selected file
  };

  const handleImport = async () => {
    if (file) {
      const formData = new FormData();
      formData.append("file", file); // Append the file to FormData (assuming the API expects a field named 'file')

      try {
        const response = await fetch("/api/v1/class/upload-csv", {
          method: "POST",
          body: formData, // Send the FormData as the body
          headers: {
            // Add any additional headers if needed, e.g., authentication
          },
        });

        if (response.ok) {
          toast({
            title: "Success",
            description: "Students imported successfully!",
            variant: "default",
          });
          onSuccess(); // Call onSuccess to refresh the student list in the parent component
          onOpenChange(false); // Close the modal
        } else {
          const errorData = await response.json(); // Get error details from the response
          toast({
            title: "Import Failed",
            description:
              errorData.message || "An error occurred during import.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error uploading file:", error);
        toast({
          title: "Error",
          description: "Failed to upload file. Please try again.",
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
          <AlertDialogTitle>Import Students</AlertDialogTitle>
          <AlertDialogDescription>
            Select a CSV file to import student data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4">
          <input
            type="file"
            accept=".csv" // Restrict to CSV files
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

export default ImportStudentModal;
