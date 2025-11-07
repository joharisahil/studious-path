import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deleteFeeStructure } from "@/services/FeesApi";
import { Loader2 } from "lucide-react";

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
          {/* Cancel button */}
          <Button onClick={onClose} variant="outline" disabled={loading}>
            Cancel
          </Button>

          {/* Delete button with spinner */}
          <Button
            onClick={handleDelete}
            variant="destructive"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
