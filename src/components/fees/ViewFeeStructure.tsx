import { FC, useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateFeeStructure, deleteFeeStructure } from "@/services/FeesApi";
import { toast } from "react-hot-toast";

interface MonthDetail {
  month: string;
  startDate: string;
  dueDate: string;
  amount: number;
  lateFine: number;
}

interface FeeStructure {
  _id: string;
  classId: { _id: string };
  className?: string;
  session?: string;
  status: string;
  totalAmount: number;
  monthDetails: MonthDetail[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  structures: FeeStructure[];
}

export const ViewFeeStructure: FC<Props> = ({ isOpen, onClose, structures }) => {
  const [localStructures, setLocalStructures] = useState<FeeStructure[]>(structures);
  const [editingStructure, setEditingStructure] = useState<FeeStructure | null>(null);
  const [monthDetails, setMonthDetails] = useState<MonthDetail[]>([]);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    setLocalStructures(structures);
  }, [structures]);

  /** Delete fee structure */
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this fee structure?")) return;

    try {
      await deleteFeeStructure(id);
      setLocalStructures(prev => prev.filter(s => s._id !== id));
      toast.success("Fee structure deleted successfully");
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete fee structure");
    }
  };

  /** Open edit modal */
  const handleEdit = (structure: FeeStructure) => {
    setEditingStructure(structure);
    setMonthDetails(structure.monthDetails.map(m => ({ ...m }))); // deep copy
  };

  /** Save changes */
  const handleUpdate = async () => {
    if (!editingStructure) return;

    // Validation
    if (
      monthDetails.some(
        m =>
          !m.month ||
          !m.startDate ||
          !m.dueDate ||
          m.amount < 0 ||
          m.lateFine < 0
      )
    ) {
      toast.error("Please fill all fields correctly and ensure no negative amounts");
      return;
    }

    try {
      setUpdating(true);
      await updateFeeStructure(editingStructure._id, monthDetails);
      setLocalStructures(prev =>
        prev.map(s =>
          s._id === editingStructure._id
            ? { ...s, monthDetails, totalAmount: monthDetails.reduce((a, b) => a + b.amount, 0) }
            : s
        )
      );
      toast.success("Fee structure updated successfully");
      setEditingStructure(null);
    } catch (err) {
      console.error("Update failed:", err);
      toast.error("Failed to update fee structure");
    } finally {
      setUpdating(false);
    }
  };

  /** Handle input changes in edit modal */
  const handleChange = (index: number, field: keyof MonthDetail, value: string | number) => {
    const updated = [...monthDetails];
    updated[index][field] = field === "amount" || field === "lateFine" ? Number(value) : value;
    setMonthDetails(updated);
  };

  /** Add new month row */
  const handleAddMonth = () => {
    setMonthDetails(prev => [
      ...prev,
      { month: "", startDate: "", dueDate: "", amount: 0, lateFine: 0 }
    ]);
  };

  /** Remove month row */
  const handleRemoveMonth = (index: number) => {
    if (!confirm("Remove this month?")) return;
    setMonthDetails(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Fee Structures</DialogTitle>
        </DialogHeader>

        {localStructures.length > 0 ? (
          <div className="space-y-4">
            {localStructures.map((fs) => (
              <Card key={fs._id}>
                <CardHeader className="flex justify-between items-center">
                  <CardTitle>
                    Class: {fs.className || "Unknown"} |{" "}
                    {fs.session ? `Session: ${fs.session}` : ""} |{" "}
                    <Badge variant={fs.status === "Published" ? "default" : "secondary"}>
                      {fs.status}
                    </Badge>
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(fs)}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(fs._id)}>Delete</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
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
                        {fs.monthDetails.map((m, idx) => (
                          <tr key={idx} className="border-t">
                            <td className="p-2">{m.month}</td>
                            <td className="p-2">{new Date(m.startDate).toLocaleDateString()}</td>
                            <td className="p-2">{new Date(m.dueDate).toLocaleDateString()}</td>
                            <td className="p-2 text-right">₹{m.amount.toLocaleString()}</td>
                            <td className="p-2 text-right">₹{m.lateFine.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-between items-center text-lg font-bold border-t pt-2 mt-2">
                    <span>Total Fee</span>
                    <span className="text-primary">₹{fs.totalAmount.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No fee structures found.
          </div>
        )}

        {/* Edit Modal */}
        {editingStructure && (
          <Dialog open={!!editingStructure} onOpenChange={() => setEditingStructure(null)}>
            <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Fee Structure - {editingStructure.className}</DialogTitle>
              </DialogHeader>

              <div className="overflow-x-auto mt-4">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 text-left">Month</th>
                      <th className="p-2 text-left">Start Date</th>
                      <th className="p-2 text-left">Due Date</th>
                      <th className="p-2 text-right">Amount</th>
                      <th className="p-2 text-right">Late Fine</th>
                      <th className="p-2">Remove</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthDetails.map((m, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="p-2">
                          <Input value={m.month} onChange={(e) => handleChange(idx, "month", e.target.value)} />
                        </td>
                        <td className="p-2">
                          <Input
                            type="date"
                            value={m.startDate ? new Date(m.startDate).toISOString().slice(0, 10) : ""}
                            onChange={(e) => handleChange(idx, "startDate", e.target.value)}
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="date"
                            value={m.dueDate ? new Date(m.dueDate).toISOString().slice(0, 10) : ""}
                            onChange={(e) => handleChange(idx, "dueDate", e.target.value)}
                          />
                        </td>
                        <td className="p-2">
                          <Input type="number" value={m.amount} onChange={(e) => handleChange(idx, "amount", e.target.value)} />
                        </td>
                        <td className="p-2">
                          <Input type="number" value={m.lateFine} onChange={(e) => handleChange(idx, "lateFine", e.target.value)} />
                        </td>
                        <td className="p-2">
                          <Button size="sm" variant="destructive" onClick={() => handleRemoveMonth(idx)}>Remove</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex justify-start mt-2">
                  <Button size="sm" onClick={handleAddMonth}>Add Month</Button>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setEditingStructure(null)}>Cancel</Button>
                <Button onClick={handleUpdate} disabled={updating}>{updating ? "Saving..." : "Save Changes"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        <div className="flex justify-end mt-4">
          <Button onClick={onClose} variant="outline">Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
