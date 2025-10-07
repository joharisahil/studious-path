import { FC, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getFeeStructureByClass } from "@/services/FeesApi";

interface ClassType {
  _id: string;
  grade: string;
  section: string;
}

export interface FeeStructure {
  id: string;
  classId: string;
  session: string;
  status: string;
  totalAmount: number;
  months: {
    month: string;
    startDate: string;
    dueDate: string;
    amount: number;
    lateFine: number;
  }[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  classes: ClassType[];
}

export const ClassFeeStructureModal: FC<Props> = ({
  isOpen,
  onClose,
  classes,
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [feeStructure, setFeeStructure] = useState<FeeStructure | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedClassId) return;

    setIsLoading(true);
    setFeeStructure(null);
    setError(null);

    getFeeStructureByClass(selectedClassId)
      .then((data) => setFeeStructure(data))
      .catch(() => setError("Failed to load fee structure."))
      .finally(() => setIsLoading(false));
  }, [selectedClassId]);

  const renderFeeBreakdown = () => {
    if (!feeStructure) return null;

    return (
      <div className="space-y-4">
        {/* Session & Status */}
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted-foreground">
            Session: {feeStructure.session}
          </span>
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${
              feeStructure.status === "Published"
                ? "bg-green-100 text-green-700"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {feeStructure.status}
          </span>
        </div>

        {/* Month-wise Table */}
        <div className="border rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Month</th>
                <th className="p-2 text-left">Start Date</th>
                <th className="p-2 text-left">Due Date</th>
                <th className="p-2 text-right">Amount</th>
                <th className="p-2 text-right">Late Fine</th>
              </tr>
            </thead>
            <tbody>
              {feeStructure.months.map((m, idx) => (
                <tr key={idx} className="border-t">
                  <td className="p-2">{m.month}</td>
                  <td className="p-2">
                    {new Date(m.startDate).toLocaleDateString()}
                  </td>
                  <td className="p-2">
                    {new Date(m.dueDate).toLocaleDateString()}
                  </td>
                  <td className="p-2 text-right">
                    ₹{m.amount.toLocaleString()}
                  </td>
                  <td className="p-2 text-right">
                    ₹{m.lateFine.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total */}
        <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
          <span>Total Fee</span>
          <span className="text-primary">
            ₹{feeStructure.totalAmount.toLocaleString()}
          </span>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Class Fee Structure</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {classes.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No classes available
            </div>
          ) : (
            <>
              {/* Class Selector */}
              <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                <SelectTrigger className="w-60">
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls._id} value={cls._id}>
                      Grade {cls.grade} - Section {cls.section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Fee Structure */}
              {selectedClassId && (
                <div className="mt-4">
                  {isLoading ? (
                    <div className="text-center py-4">Loading fee structure...</div>
                  ) : error ? (
                    <div className="text-center py-4 text-red-600">{error}</div>
                  ) : feeStructure ? (
                    <Card>
                      <CardHeader>
                        <CardTitle>
                          Grade{" "}
                          {
                            classes.find((c) => c._id === selectedClassId)
                              ?.grade
                          }{" "}
                          - Section{" "}
                          {
                            classes.find((c) => c._id === selectedClassId)
                              ?.section
                          }
                        </CardTitle>
                      </CardHeader>
                      <CardContent>{renderFeeBreakdown()}</CardContent>
                    </Card>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No fee structure found for this class.
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
