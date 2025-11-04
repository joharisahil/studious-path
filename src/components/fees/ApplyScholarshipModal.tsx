import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Student } from "@/types";
import {
  applyScholarship as applyScholarshipApi,
  getStudentFee,
  removeScholarshipApi,
} from "@/services/FeesApi";
import { AlertCircle } from "lucide-react";

const scholarshipSchema = z.object({
  studentId: z.string().min(1, "Please enter registration number"),
  name: z.string().min(1, "Scholarship name is required"),
  type: z.literal("custom"), // fixed to custom
  value: z.number().min(0, "Value required"),
  valueType: z.enum(["fixed", "percentage"]).optional(),
  period: z.literal("monthly"), // fixed to monthly
  months: z.array(z.string()).optional(),
});

type ScholarshipFormData = z.infer<typeof scholarshipSchema>;

interface ApplyScholarshipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApplyScholarshipModal = ({
  isOpen,
  onClose,
}: ApplyScholarshipModalProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [studentFee, setStudentFee] = useState<any>(null);
  const [selectedStudentData, setSelectedStudentData] =
    useState<Partial<Student> | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm<ScholarshipFormData>({
    resolver: zodResolver(scholarshipSchema),
    defaultValues: {
      studentId: "",
      name: "",
      type: "custom",
      value: 0,
      valueType: "fixed",
      period: "monthly",
      months: [],
    },
  });

  const fetchStudentFee = async (regNum: string) => {
    if (!regNum)
      return toast({
        title: "Error",
        description: "Enter registration number",
        variant: "destructive",
      });

    setIsLoading(true);
    try {
      const data = await getStudentFee(regNum);
      if (!data || data.length === 0) throw new Error("Student fee not found");
      const feeRecord = Array.isArray(data) ? data[0] : data;
      setStudentFee(feeRecord);
      setSelectedStudentData({
        firstName: feeRecord.studentName.split(" ")[0],
        lastName: feeRecord.studentName.split(" ")[1] || "",
        registrationNumber: feeRecord.registrationNumber,
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description:
          err.response?.data?.error ||
          err.message ||
          "Failed to fetch student fee",
        variant: "destructive",
      });
      setStudentFee(null);
      setSelectedStudentData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyScholarship = async () => {
    if (!selectedStudentData) return;
    setShowConfirm(false);
    setIsLoading(true);
    try {
      await applyScholarshipApi(
        selectedStudentData.registrationNumber,
        form.getValues()
      );
      toast({
        title: "Scholarship Applied",
        description: `${form.getValues("name")} applied successfully to ${
          selectedStudentData.firstName
        } ${selectedStudentData.lastName}`,
      });
      form.reset();
      setStudentFee(null);
      setSelectedStudentData(null);
      onClose();
    } catch (err: any) {
      console.error("ApplyScholarship API error:", err);
      toast({
        title: "Error",
        description: err.response?.data?.error || "Failed to apply scholarship",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveScholarship = async (scholarshipId: string) => {
    try {
      if (!selectedStudentData?.registrationNumber) {
        throw new Error("Student data not found");
      }

      const res = await removeScholarshipApi(
        selectedStudentData.registrationNumber,
        scholarshipId
      );

      toast({
        title: "Scholarship Removed",
        description: res.message || "Scholarship removed successfully.",
      });

      await fetchStudentFee(selectedStudentData.registrationNumber);
    } catch (error: any) {
      console.error("RemoveScholarship API error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove scholarship",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    form.reset();
    setStudentFee(null);
    setSelectedStudentData(null);
    setShowConfirm(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[1100px] flex flex-col md:flex-row gap-6 p-6 bg-gray-50 rounded-xl shadow-2xl">
        {/* === Left Box: Student Info === */}
        {studentFee && selectedStudentData && (
          <div className="w-full md:w-1/3 bg-white rounded-xl shadow p-5 border border-gray-100">
            <h3 className="text-2xl font-bold mb-3 border-b pb-2 text-indigo-600">
              Student Info
            </h3>
            <div className="space-y-1 text-gray-700">
              <p><b>Name:</b> {selectedStudentData.firstName} {selectedStudentData.lastName}</p>
              <p><b>Registration:</b> {selectedStudentData.registrationNumber}</p>
              <p><b>Class:</b> {studentFee.className}</p>
              <p><b>Session:</b> {studentFee.session}</p>
              <p><b>Total Fee:</b> ₹{studentFee.totalAmount}</p>
              <p><b>Balance:</b> ₹{studentFee.balance}</p>
            </div>

            <div className="mt-4">
              <h4 className="font-semibold text-indigo-600 mb-2">Installments</h4>
              <div className="border rounded-md divide-y">
                {studentFee.installments.map((inst: any) => (
                  <div
                    key={inst.month}
                    className="flex justify-between items-center px-3 py-2"
                  >
                    <span>{inst.month}</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        inst.status === "Paid"
                          ? "bg-green-100 text-green-700"
                          : inst.status === "Pending"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      ₹{inst.amount - inst.amountPaid} ({inst.status})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* === Center Box: Scholarship Form === */}
        <div className="w-full md:w-2/3 bg-white rounded-xl shadow p-6 border border-gray-100">
          <Form {...form}>
            <form className="space-y-6">
              <div className="flex gap-2 items-end">
                <FormField
                  control={form.control}
                  name="studentId"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Registration Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter registration number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  onClick={() => fetchStudentFee(form.getValues("studentId"))}
                >
                  Search
                </Button>
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scholarship Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Merit Scholarship" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Fixed Values Display */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FormLabel>Type</FormLabel>
                  <p className="border rounded-md px-3 py-2 bg-gray-50 text-gray-600">
                    Custom
                  </p>
                </div>
                <div>
                  <FormLabel>Period</FormLabel>
                  <p className="border rounded-md px-3 py-2 bg-gray-50 text-gray-600">
                    Monthly
                  </p>
                </div>
              </div>

              {/* Value Field */}
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Value (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Monthly selection grid */}
              {studentFee && (
                <FormField
                  control={form.control}
                  name="months"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Month(s)</FormLabel>
                      <div className="grid grid-cols-3 gap-2">
                        {studentFee.installments.map((inst: any) => {
                          const disabled = inst.status === "Paid";
                          return (
                            <Button
                              key={inst.month}
                              type="button"
                              variant={
                                field.value.includes(inst.month)
                                  ? "default"
                                  : "outline"
                              }
                              className={`w-full ${
                                disabled ? "opacity-50 cursor-not-allowed" : ""
                              }`}
                              onClick={() => {
                                if (disabled) return;
                                const updated = field.value.includes(inst.month)
                                  ? field.value.filter((m) => m !== inst.month)
                                  : [...field.value, inst.month];
                                field.onChange(updated);
                              }}
                            >
                              {inst.month}
                            </Button>
                          );
                        })}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowConfirm(true)}
                  disabled={!studentFee || isLoading}
                >
                  {isLoading ? "Applying..." : "Apply Scholarship"}
                </Button>
              </div>
            </form>
          </Form>
        </div>

        {/* === Right Box: Remove Scholarships === */}
        {studentFee && studentFee.scholarships.length > 0 && (
          <div className="w-full md:w-1/3 bg-white rounded-xl shadow p-5 border border-gray-100">
            <h3 className="text-2xl font-bold mb-3 border-b pb-2 text-red-600">
              Remove Scholarships
            </h3>
            {studentFee.scholarships.map((sch: any) => (
              <div
                key={sch._id}
                className="border rounded-lg p-3 shadow-sm mb-3 hover:shadow-md"
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-gray-800">{sch.name}</h4>
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                    Custom
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  {new Date(sch.appliedAt).toLocaleDateString()}
                </p>
                {sch.months?.length > 0 && (
                  <ul className="text-sm text-gray-700 mt-1">
                    {sch.months.map((m: string, i: number) => (
                      <li key={i}>{m} — ₹{sch.value || "N/A"}</li>
                    ))}
                  </ul>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  className="mt-2 w-full"
                  onClick={() => handleRemoveScholarship(sch._id)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* === Confirmation Dialog === */}
        {showConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-xl w-96 border border-gray-200 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">Confirm Scholarship</h3>
              <p>
                Apply this scholarship to{" "}
                <b>
                  {selectedStudentData?.firstName}{" "}
                  {selectedStudentData?.lastName}
                </b>
                ?
              </p>
              <p className="text-gray-500 text-sm mb-4">
                Reg: {selectedStudentData?.registrationNumber}
              </p>
              <div className="flex justify-center gap-3">
                <Button variant="outline" onClick={() => setShowConfirm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleApplyScholarship}>Yes, Apply</Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
