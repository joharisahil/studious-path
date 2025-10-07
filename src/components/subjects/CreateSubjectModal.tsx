import React from "react";
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
import { createSubject } from "@/services/subject";
import { Subject } from "@/types";

// ✅ Schema: name required, code optional
const formSchema = z.object({
  name: z.string().min(2, "Subject name must be at least 2 characters"),
  code: z.string().optional(),
});

interface CreateSubjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (newSubject: Subject) => void; // pass created subject to parent
}

const CreateSubjectModal = ({ open, onOpenChange, onSuccess }: CreateSubjectModalProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", code: "" },
  });

  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [apiError, setApiError] = React.useState<string>(""); // <-- for server/API errors

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      setApiError(""); // reset previous API errors

      const payload: { name: string; code?: string } = { name: data.name.trim() };
      if (data.code?.trim()) payload.code = data.code.trim();

      const response = await createSubject(payload);

      if (response.success && response.data) {
        toast({
          title: "Subject Created",
          description: response.message || "Subject has been successfully created.",
        });
        form.reset();
        onSuccess(response.data); // send new subject to parent
        onOpenChange(false);      // close modal
      } else {
        // API returned error
        setApiError(response.message || "Failed to create subject.");
      }
    } catch (err: any) {
      setApiError(err.response?.data?.message || err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Subject</DialogTitle>
          <DialogDescription>
            Add a new subject to the curriculum. Fill in the required information.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Subject Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>
                      Subject Name <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Advanced Mathematics" {...field} />
                    </FormControl>
                    {/* Show validation error OR API error */}
                    <FormMessage>
                      {fieldState.error?.message || (field.name === "name" && apiError)}
                    </FormMessage>
                  </FormItem>
                )}
              />

              {/* Subject Code */}
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject Code (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., MATH101" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Subject"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSubjectModal;