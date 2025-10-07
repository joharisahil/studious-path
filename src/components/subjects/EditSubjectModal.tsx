import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Subject } from "@/types";
import { updateSubject as apiUpdateSubject } from "@/services/subject";

// ✅ Validation Schema
const formSchema = z.object({
  name: z.string().min(2, "Subject name must be at least 2 characters long"),
  code: z.string().optional(),
});

interface EditSubjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject: Subject | null;
  onSuccess: () => void;
}

const EditSubjectModal = ({
  open,
  onOpenChange,
  subject,
  onSuccess,
}: EditSubjectModalProps) => {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", code: "" },
  });

  // ✅ Pre-fill form when modal opens
  useEffect(() => {
    if (subject && open) {
      form.reset({
        name: subject.name || "",
        code: subject.code || "",
      });
    }
  }, [subject, open, form]);

  // ✅ Submit Handler
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!subject || !subject.code) return;

    try {
      const payload = {
        name: data.name.trim(),
        code: data.code?.trim() || subject.code,
      };

      await apiUpdateSubject(subject.code, payload);

      toast({
        title: "Subject Updated",
        description: "The subject details have been updated successfully.",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error updating subject:", error);
      toast({
        title: "Update Failed",
        description:
          error?.response?.data?.message ||
          error.message ||
          "Failed to update subject. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Subject</DialogTitle>
          <DialogDescription>
            Update the subject information below.
          </DialogDescription>
        </DialogHeader>

        {!subject ? (
          <p className="text-center text-gray-500">No subject selected.</p>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Subject Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter subject name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Subject Code */}
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter subject code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Update Subject</Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditSubjectModal;