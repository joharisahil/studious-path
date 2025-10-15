import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Student } from "@/types";
import {
  applyScholarship as applyScholarshipApi,
  getStudentFee,
} from "@/services/FeesApi";
import { CheckCircle, AlertCircle } from "lucide-react";

const scholarshipSchema = z.object({
  studentId: z.string().min(1, "Please enter registration number"),
  name: z.string().min(1, "Scholarship name is required"),
  type: z.enum(["full", "half", "custom"]),
  value: z.number().min(0).optional(),
  valueType: z.enum(["fixed", "percentage"]).optional(),
  period: z.enum(["yearly", "monthly"]),
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
      type: "full",
      value: 0,
      valueType: "fixed",
      period: "yearly",
      months: [],
    },
  });

  const registrationNumber = form.watch("studentId");
  const selectedType = form.watch("type");
  const selectedPeriod = form.watch("period");

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

  const handleClose = () => {
    form.reset();
    setStudentFee(null);
    setSelectedStudentData(null);
    setShowConfirm(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[1000px] flex flex-col md:flex-row gap-6 p-6 bg-gray-50 rounded-lg shadow-lg">
        {/* Left Box: Student Details */}
        {studentFee && selectedStudentData && (
          <div className="w-full md:w-1/3 bg-white rounded-xl shadow-lg p-5 flex flex-col gap-4 border border-gray-100">
            <h3 className="text-2xl font-bold mb-2 border-b pb-2 text-indigo-600">
              Student Info
            </h3>
            <div className="space-y-1">
              <p>
                <span className="font-semibold">Name:</span>{" "}
                {selectedStudentData.firstName} {selectedStudentData.lastName}
              </p>
              <p>
                <span className="font-semibold">Registration:</span>{" "}
                {selectedStudentData.registrationNumber}
              </p>
              <p>
                <span className="font-semibold">Class:</span>{" "}
                {studentFee.className}
              </p>
              <p>
                <span className="font-semibold">Session:</span>{" "}
                {studentFee.session}
              </p>
              <p>
                <span className="font-semibold">Total Fee:</span> ₹
                {studentFee.totalAmount}
              </p>
              <p>
                <span className="font-semibold">Net Payable:</span> ₹
                {studentFee.netPayable}
              </p>
              <p>
                <span className="font-semibold">Balance:</span> ₹
                {studentFee.balance}
              </p>
            </div>

            {/* Installments */}
            <div className="mt-4">
              <span className="font-semibold text-indigo-600">
                Installments
              </span>
              <div className="mt-2 border rounded-md divide-y divide-gray-100">
                {studentFee.installments.map((inst: any) => (
                  <div
                    key={inst.month}
                    className="flex justify-between items-center px-3 py-2 hover:bg-gray-50"
                  >
                    <span className="font-medium">{inst.month}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-sm font-semibold ${
                        inst.amount > 0
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      ₹{inst.amount} ({inst.status})
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Scholarships */}
            {studentFee.scholarships.length > 0 && (
              <div className="mt-4">
                <span className="font-semibold text-indigo-600">
                  Scholarships Applied
                </span>
                <ul className="mt-2 flex flex-col gap-2">
                  {studentFee.scholarships.map((sch: any) => (
                    <li
                      key={sch._id}
                      className="flex justify-between items-center bg-blue-50 px-3 py-1 rounded-md shadow-sm hover:bg-blue-100"
                    >
                      <span>
                        {sch.name} ({sch.type})
                      </span>
                      <span className="text-gray-500 text-sm">
                        {new Date(sch.appliedAt).toLocaleDateString()}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Right Box: Scholarship Form */}
        <div className="w-full md:w-2/3 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <Form {...form}>
            <form className="space-y-6">
              {/* Registration Number + Search */}
              <div className="flex gap-2 items-end">
                <FormField
                  control={form.control}
                  name="studentId"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Registration Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter registration number"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  className="mb-1"
                  onClick={() => fetchStudentFee(form.getValues("studentId"))}
                >
                  Search
                </Button>
              </div>

              {/* Scholarship Name */}
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

              {/* Type */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="full">Full</SelectItem>
                        <SelectItem value="half">Half</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Value & ValueType if custom */}
              {selectedType === "custom" && (
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Value</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="valueType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Value Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="fixed">Fixed</SelectItem>
                            <SelectItem value="percentage">
                              Percentage
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Period */}
              <FormField
                control={form.control}
                name="period"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Period</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="yearly">Yearly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Months if monthly */}
              {selectedPeriod === "monthly" && studentFee && (
                <FormField
                  control={form.control}
                  name="months"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Months</FormLabel>
                      <Select
                        onValueChange={(val) => field.onChange([val])}
                        defaultValue=""
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select month" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {studentFee.installments.map((inst: any) => (
                            <SelectItem key={inst.month} value={inst.month}>
                              {inst.month} - ₹{inst.amount}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Buttons */}
              <div className="flex justify-end gap-3 mt-2">
                <Button type="button" variant="outline" onClick={handleClose}>
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

        {/* Confirmation Dialog */}
        {showConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-xl w-96 border border-gray-200">
              <div className="flex flex-col items-center gap-3">
                <AlertCircle className="w-12 h-12 text-red-500" />
                <h3 className="text-xl font-semibold">Confirm Scholarship</h3>
                <p>Are you sure you want to apply this scholarship to:</p>
                <p className="font-medium text-lg">
                  {selectedStudentData?.firstName}{" "}
                  {selectedStudentData?.lastName}
                </p>
                <p className="text-gray-500">
                  Registration: {selectedStudentData?.registrationNumber}
                </p>
              </div>
              <div className="flex justify-end gap-3 mt-5">
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
