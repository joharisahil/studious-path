import { useState, useRef } from 'react';
import { Upload, Download, AlertCircle, CheckCircle, FileSpreadsheet } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useUploadStudentsToClassMutation } from '@/store/api/classesApi';
import { toast } from 'sonner';
import { StudentUploadData } from '@/types';

interface UploadStudentsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string | null;
}

export const UploadStudentsModal = ({ open, onOpenChange, classId }: UploadStudentsModalProps) => {
  const [uploadStudents, { isLoading }] = useUploadStudentsToClassMutation();
  const [dragActive, setDragActive] = useState(false);
  const [uploadResults, setUploadResults] = useState<{
    addedCount: number;
    errors: string[];
  } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    if (!classId) return;

    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];

    if (!validTypes.includes(file.type)) {
      toast.error('Please upload an Excel (.xlsx, .xls) or CSV file');
      return;
    }

    try {
      // Mock CSV/Excel parsing - in real implementation, use a library like xlsx or papaparse
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        toast.error('File must contain header row and at least one data row');
        return;
      }

      // Expected headers: firstName,lastName,email,phone,dateOfBirth,address,parentEmail,emergencyContactName,emergencyContactPhone,emergencyContactRelation
      const headers = lines[0].split(',').map(h => h.trim());
      const requiredHeaders = ['firstName', 'lastName', 'email', 'dateOfBirth', 'address', 'emergencyContactName', 'emergencyContactPhone', 'emergencyContactRelation'];
      
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      if (missingHeaders.length > 0) {
        toast.error(`Missing required columns: ${missingHeaders.join(', ')}`);
        return;
      }

      const students: StudentUploadData[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length !== headers.length) continue;

        const student: any = {};
        headers.forEach((header, index) => {
          student[header] = values[index];
        });

        students.push(student as StudentUploadData);
      }

      const result = await uploadStudents({
        classId,
        students,
      }).unwrap();

      setUploadResults(result.data);
      toast.success(result.message);
      
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to upload students');
    }
  };

  const downloadTemplate = () => {
    const headers = [
      'firstName',
      'lastName', 
      'email',
      'phone',
      'dateOfBirth',
      'address',
      'parentEmail',
      'emergencyContactName',
      'emergencyContactPhone',
      'emergencyContactRelation'
    ];

    const sampleData = [
      'John,Doe,john.doe@email.com,1234567890,2005-01-15,123 Main St,parent@email.com,Jane Doe,9876543210,Mother'
    ];

    const csvContent = [headers.join(','), ...sampleData].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'student_upload_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const resetModal = () => {
    setUploadResults(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) resetModal();
    }}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Upload Students to Class</DialogTitle>
          <DialogDescription>
            Upload an Excel or CSV file to add multiple students to this class
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Template Download */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
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
              </div>
            </CardContent>
          </Card>

          {/* Upload Area */}
          {!uploadResults && (
            <Card
              className={`border-2 border-dashed transition-colors ${
                dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center py-8">
                  <FileSpreadsheet className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Upload Student Data</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Drag and drop your Excel or CSV file here, or click to browse
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {isLoading ? 'Uploading...' : 'Choose File'}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upload Results */}
          {uploadResults && (
            <div className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Successfully added {uploadResults.addedCount} students to the class
                </AlertDescription>
              </Alert>

              {uploadResults.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-medium mb-2">
                      {uploadResults.errors.length} errors occurred:
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {uploadResults.errors.slice(0, 5).map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                      {uploadResults.errors.length > 5 && (
                        <li>... and {uploadResults.errors.length - 5} more errors</li>
                      )}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-center">
                <Button onClick={resetModal}>
                  Upload Another File
                </Button>
              </div>
            </div>
          )}

          {/* Instructions */}
          <Card>
            <CardContent className="pt-6">
              <h4 className="font-medium mb-2">File Requirements:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Supported formats: Excel (.xlsx, .xls) or CSV</li>
                <li>• First row must contain headers</li>
                <li>• Required columns: firstName, lastName, email, dateOfBirth, address, emergencyContactName, emergencyContactPhone, emergencyContactRelation</li>
                <li>• Optional columns: phone, parentEmail</li>
                <li>• Maximum 100 students per upload</li>
              </ul>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};