import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CreateStudentForm } from './CreateStudentForm';

interface CreateStudentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
    classId?: string | null;
  session?: string;
  onSuccess?: () => void;
}

const CreateStudentModal = ({ open, onOpenChange, onSuccess }: CreateStudentModalProps) => {
  const handleSuccess = () => {
    onSuccess?.();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Student</DialogTitle>
        </DialogHeader>
        <CreateStudentForm onClose={handleCancel} onStudentCreated={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
};

export default CreateStudentModal;