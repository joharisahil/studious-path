  import React, { useEffect, useState } from "react";
  import { useForm } from "react-hook-form";
  import { zodResolver } from "@hookform/resolvers/zod";
  import * as z from "zod";
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
  import { Button } from "@/components/ui/button";
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
  import { Loader2 } from "lucide-react";
  import { useToast } from "@/hooks/use-toast";
  import { getAllClasses } from "@/services/ClassesApi";
  import { autoGenerateTimetable } from "@/services/TimeTableApi";

  const formSchema = z.object({
    classId: z.string().min(1, "Class is required"),
    numberOfDays: z.coerce.number().min(1).max(6, "Days must be between 1-6"),
    periodsPerDay: z.coerce.number().min(1).max(8, "Periods per day must be between 1-8"),
  });

  type FormData = z.infer<typeof formSchema>;

  interface AutoGenerateModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }

  export const AutoGenerateModal: React.FC<AutoGenerateModalProps> = ({
    open,
    onOpenChange,
  }) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [loadingClasses, setLoadingClasses] = useState(false);
    const [classes, setClasses] = useState<{ _id: string; grade: string; section: string }[]>([]);

    const form = useForm<FormData>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        classId: "",
        numberOfDays: 6,
        periodsPerDay: 8,
      },
    });

    //  Fetch classes when modal opens
    useEffect(() => {
      if (open) {
        (async () => {
          try {
            setLoadingClasses(true);
            const response = await getAllClasses();
            setClasses(response || []);
          } catch {
            toast({
              title: "Error",
              description: "Failed to fetch classes.",
              variant: "destructive",
            });
          } finally {
            setLoadingClasses(false);
          }
        })();
      }
    }, [open, toast]);

const onSubmit = async (data: FormData) => {
  try {
    setLoading(true);

    const result = await autoGenerateTimetable(data as {
      classId: string;
      numberOfDays: number;
      periodsPerDay: number;
    });

    toast({
      title: "Success",
      description: result.message || "Timetable generated successfully.",
    });

    form.reset();
    onOpenChange(false);
  } catch (error: any) {
    toast({
      title: "Error",
      description: error?.message || "Failed to auto-generate timetable.",
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};


    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Auto-Generate Timetable</DialogTitle>
            <DialogDescription>
              Automatically generate a complete timetable for a class based on available subjects and teachers.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Class dropdown */}
              <FormField
                control={form.control}
                name="classId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={loadingClasses || classes.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger className="flex justify-between items-center">
                          <SelectValue
                            placeholder={
                              loadingClasses
                                ? "Loading classes..."
                                : classes.length === 0
                                ? "No classes available"
                                : "Select class"
                            }
                          />
                          {loadingClasses && (
                            <Loader2 className="animate-spin ml-2 h-4 w-4 text-muted-foreground" />
                          )}
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls._id} value={cls._id}>
                            {cls.grade} {cls.section ? `- ${cls.section}` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Days and periods */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="numberOfDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Days</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Days" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.from({ length: 6 }, (_, i) => i + 1).map((day) => (
                            <SelectItem key={day} value={day.toString()}>
                              {day} Day{day > 1 ? "s" : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="periodsPerDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Periods per Day</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Periods" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.from({ length: 8 }, (_, i) => i + 1).map((period) => (
                            <SelectItem key={period} value={period.toString()}>
                              {period} Period{period > 1 ? "s" : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="bg-muted p-3 rounded-lg text-sm text-muted-foreground">
                <p>
                  <strong>Note:</strong> This will automatically assign subjects and teachers
                  based on availability. Existing periods may be overwritten.
                </p>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-4 w-4" /> Generating...
                    </>
                  ) : (
                    "Generate Timetable"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    );
  };
