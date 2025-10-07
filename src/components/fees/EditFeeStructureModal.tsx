import { FC, useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import axios from "axios";
import { updateFeeStructure } from "@/services/FeesApi"; // your API function
import { toast } from "react-hot-toast"; // optional for notifications

interface MonthDetail {
  month: string;
  startDate: string;
  dueDate: string;
  amount: number;
  lateFine: number;
}

interface FeeStructure {
  _id: string;
  classId: { _id: string; name?: string };
  session: string;
  monthDetails: MonthDetail[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  structure: FeeStructure;
  onSave: (updatedMonthDetails: MonthDetail[]) => void;
}

export const EditFeeStructureModal: FC<Props> = ({ isOpen, onClose, structure, onSave }) => {
  const [monthDetails, setMonthDetails] = useState<MonthDetail[]>([]);

  useEffect(() => {
    if (structure) {
      setMonthDetails(structure.monthDetails);
    }
  }, [structure]);

  const handleChange = (index: number, field: keyof MonthDetail, value: string | number) => {
    const updated = [...monthDetails];
    updated[index][field] = field === "amount" || field === "lateFine" ? Number(value) : value;
    setMonthDetails(updated);
  };

  const handleSave = async () => {
    try {
      await updateFeeStructure(structure._id, monthDetails);
      toast.success("Fee structure updated successfully!");
      onSave(monthDetails);
      onClose();
    } catch (error) {
      toast.error("Failed to update fee structure.");
      console.error(error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Fee Structure - {structure.classId.name || "Unknown Class"}</DialogTitle>
        </DialogHeader>

        <div className="overflow-x-auto mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Late Fine</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthDetails.map((m, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <Input value={m.month} onChange={(e) => handleChange(idx, "month", e.target.value)} />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="date"
                      value={new Date(m.startDate).toISOString().slice(0, 10)}
                      onChange={(e) => handleChange(idx, "startDate", e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="date"
                      value={new Date(m.dueDate).toISOString().slice(0, 10)}
                      onChange={(e) => handleChange(idx, "dueDate", e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={m.amount}
                      onChange={(e) => handleChange(idx, "amount", e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={m.lateFine}
                      onChange={(e) => handleChange(idx, "lateFine", e.target.value)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
