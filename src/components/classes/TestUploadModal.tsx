import { useState, useRef } from "react";
import { toast } from "sonner";
import { Loader2, FileSpreadsheet, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { testStudentsExcelApi } from "@/services/ClassesApi";

interface TestUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string | null;
  session: string;
}

interface Student {
  firstName: string;
  phone: string;
  reason?: string;
}

export const TestUploadModal = ({ open, onOpenChange, classId, session }: TestUploadModalProps) => {
  const [loading, setLoading] = useState(false);
  const [validStudents, setValidStudents] = useState<Student[]>([]);
  const [invalidStudents, setInvalidStudents] = useState<Student[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasUploaded, setHasUploaded] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!classId) {
      toast.error("Please select a class before uploading.");
      return;
    }

    setLoading(true);
    setError(null);
    setValidStudents([]);
    setInvalidStudents([]);

    try {
      const data = await testStudentsExcelApi(file, classId, session);

      console.log("API Response:", data);

      // Access arrays from data.results
      const validsArray = Array.isArray(data.results?.valid) ? data.results.valid : [];
      const invalidsArray = Array.isArray(data.results?.invalid) ? data.results.invalid : [];

      // Map valid students
      const valids = validsArray.map((s: any) => ({
  firstName: s.row?.firstName || "--",
  phone: s.row?.phone || "--",
}));


      // Map invalid students (row may exist)
      const invalids: Student[] = invalidsArray.map((s: any) => ({
        firstName: s.row?.firstName || "--",
        phone: s.row?.phone || "--",
        reason: s.reason || "Missing required fields",
      }));

      console.log("Valid students:", valids);
      console.log("Invalid students:", invalids);

      setValidStudents(valids);
      setInvalidStudents(invalids);
      setHasUploaded(true);

      toast.success("Test upload completed!");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || err.message || "Something went wrong");
      setError(err?.response?.data?.message || err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setValidStudents([]);
    setInvalidStudents([]);
    setError(null);
    setHasUploaded(false);
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
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader className="flex justify-between items-center">
          <DialogTitle>Test Upload Students</DialogTitle>
          {/* <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            <X className="w-4 h-4" />
          </Button> */}
        </DialogHeader>

        <div className="space-y-4">
          {/* UPLOAD CARD */}
          {!hasUploaded && (
            <Card className="border-2 border-dashed">
              <CardContent className="pt-6 flex flex-col items-center py-8">
                <FileSpreadsheet className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Select Excel File</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  The file will be automatically uploaded for testing.
                </p>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading || !classId}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                  )}
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

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* RESULTS TABLES */}
          {hasUploaded && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* VALID STUDENTS */}
              <Card>
                <CardContent>
                  <h4 className="font-medium text-green-700 mb-2 flex justify-between items-center">
                    Valid Students{" "}
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded">
                      {validStudents.length}
                    </span>
                  </h4>
                  <div className="overflow-auto max-h-96 border border-green-100 rounded">
                    <table className="w-full text-sm border-collapse">
                      <thead className="bg-green-50 sticky top-0">
                        <tr>
                          <th className="border-b border-green-200 px-2 py-1 text-left">Name</th>
                          <th className="border-b border-green-200 px-2 py-1 text-left">Phone</th>
                        </tr>
                      </thead>
                      <tbody>
                        {validStudents.map((s, idx) => (
                          <tr key={idx} className="hover:bg-green-50">
                            <td className={s.firstName === "--" ? "text-red-600 italic" : ""}>{s.firstName}</td>
                            <td className={s.phone === "--" ? "text-red-600 italic" : ""}>{s.phone}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* INVALID STUDENTS */}
              <Card>
                <CardContent>
                  <h4 className="font-medium text-red-700 mb-2 flex justify-between items-center">
                    Invalid Students{" "}
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded">
                      {invalidStudents.length}
                    </span>
                  </h4>
                  <div className="overflow-auto max-h-96 border border-red-100 rounded">
                    <table className="w-full text-sm border-collapse">
                      <thead className="bg-red-50 sticky top-0">
                        <tr>
                          <th className="border-b border-red-200 px-2 py-1 text-left">Name</th>
                          <th className="border-b border-red-200 px-2 py-1 text-left">Phone</th>
                          <th className="border-b border-red-200 px-2 py-1 text-left">Reason</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invalidStudents.map((s, idx) => (
                          <tr key={idx} className="hover:bg-red-50">
                            <td className={s.firstName === "--" ? "text-red-600 italic" : ""}>{s.firstName}</td>
                            <td className={s.phone === "--" ? "text-red-600 italic" : ""}>{s.phone}</td>
                            <td>{s.reason}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
