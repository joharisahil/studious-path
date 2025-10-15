import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deleteFeeStructure } from "@/services/FeesApi";

interface DeleteFeeStructureModalProps {
  isOpen: boolean;
  onClose: () => void;
  structureId: string;
  onDeleted?: () => void;
}

export const DeleteFeeStructureModal = ({
  isOpen,
  onClose,
  structureId,
  onDeleted,
}: DeleteFeeStructureModalProps) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteFeeStructure(structureId);
      alert("Fee structure deleted!");
      onDeleted?.();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to delete!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Delete Fee Structure</DialogTitle>
        </DialogHeader>
        <p>Are you sure you want to delete this fee structure?</p>
        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            variant="destructive"
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
