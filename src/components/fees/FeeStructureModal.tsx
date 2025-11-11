import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
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
import { Loader2 } from "lucide-react"; // ✅ Spinner icon
import { useToast } from "@/hooks/use-toast";
import { createFeeStructure as apiCreateFeeStructure } from "@/services/FeesApi";
import { getAllClasses } from "@/services/ClassesApi";

const monthsList = [
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
  "January",
  "February",
  "March",
];

const monthNumberMap: Record<string, number> = {
  April: 3,
  May: 4,
  June: 5,
  July: 6,
  August: 7,
  September: 8,
  October: 9,
  November: 10,
  December: 11,
  January: 0,
  February: 1,
  March: 2,
};

const getMonthDates = (month: string, session: string) => {
  const sessionStartYear = parseInt(session.split("-")[0]);
  const monthNum = monthNumberMap[month];
  const year = monthNum >= 3 ? sessionStartYear : sessionStartYear + 1;
  const startDate = new Date(year, monthNum, 1).toISOString().split("T")[0];
  const lastDay = new Date(year, monthNum + 1, 0).getDate();
  const dueDate = new Date(year, monthNum, lastDay).toISOString().split("T")[0];
  return { startDate, dueDate };
};

const feeStructureSchema = z.object({
  classIds: z.array(z.string()).min(1, "Select at least one class"),
  session: z.string().min(1, "Session is required"),
  monthDetails: z
    .array(
      z.object({
        month: z.string(),
        startDate: z.string(),
        dueDate: z.string(),
        amount: z.number().min(1),
        lateFine: z.number().min(0).optional(),
      })
    )
    .min(1, "Select at least one month"),
});

type FeeStructureFormData = z.infer<typeof feeStructureSchema>;

interface FeeStructureModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: "create" | "view" | "edit" | "delete";
  initialData?: FeeStructureFormData;
}

export const FeeStructureModal = ({
  isOpen,
  onClose,
  mode = "create",
  initialData,
}: FeeStructureModalProps) => {
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Added loading for fetching classes
  const [isClassLoading, setIsClassLoading] = useState(true);

  const [classes, setClasses] = useState<
    { _id: string; grade: string; section: string }[]
  >([]);

  const { toast } = useToast();

  const form = useForm<FeeStructureFormData>({
    resolver: zodResolver(feeStructureSchema),
    defaultValues: initialData || {
      classIds: [],
      session: "2024-25",
      monthDetails: [],
    },
  });

  const { watch, reset } = form;
  const sessionValue = watch("session");

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setIsClassLoading(true); // ✅ Spinner ON
        const { data } = await getAllClasses();
        setClasses(data);
      } catch (err) {
        console.error("Failed to fetch classes:", err);
      } finally {
        setIsClassLoading(false); // ✅ Spinner OFF
      }
    };
    fetchClasses();
  }, []);

  const sortedClasses = [...classes].sort((a, b) => {
    if (a.grade === b.grade) return a.section.localeCompare(b.section);
    return parseInt(a.grade) - parseInt(b.grade);
  });

  const classesByGrade: Record<string, { _id: string; section: string }[]> = {};
  sortedClasses.forEach((cls) => {
    if (!classesByGrade[cls.grade]) classesByGrade[cls.grade] = [];
    classesByGrade[cls.grade].push({ _id: cls._id, section: cls.section });
  });

  const onSubmit = async (data: FeeStructureFormData) => {
    if (mode === "view" || mode === "delete") return;

    setIsLoading(true); // ✅ Spinner ON
    try {
      const sanitizedMonthDetails = data.monthDetails.map((m) => ({
        month: m.month || "",
        startDate: m.startDate || "",
        dueDate: m.dueDate || "",
        amount: Number(m.amount) || 0,
        lateFine: m.lateFine ?? 0,
      }));

      await apiCreateFeeStructure({
        classIds: data.classIds,
        session: data.session,
        monthDetails: sanitizedMonthDetails,
      });

      toast({
        title: "Fee Structure Saved",
        description: `Fee structure for ${data.classIds.length} classes in session ${data.session} saved successfully.`,
      });

      reset();
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.error || "Failed to save fee structure. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false); // ✅ Spinner OFF
    }
  };

  const handleClose = () => {
    reset(
      initialData || {
        classIds: [],
        session: "2024-25",
        monthDetails: [],
      }
    );
    onClose();
  };

  const isReadOnly = mode === "view" || mode === "delete";

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" && "Create Fee Structure"}
            {mode === "view" && "View Fee Structure"}
            {mode === "edit" && "Edit Fee Structure"}
            {mode === "delete" && "Delete Fee Structure"}
          </DialogTitle>
          <DialogDescription>
            {mode === "view" && "View the details of the fee structure."}
            {mode === "create" && "Create a new fee structure for classes."}
            {mode === "edit" && "Edit the selected fee structure."}
            {mode === "delete" && "Confirm deletion of this fee structure."}
          </DialogDescription>
        </DialogHeader>

        {/* ✅ Show loader while classes are loading */}
        {isClassLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* CLASSES */}
              <FormField
                control={form.control}
                name="classIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Classes</FormLabel>
                    <div className="flex flex-col gap-2 max-h-40 overflow-y-auto border rounded p-2">
                      {Object.keys(classesByGrade).map((grade) => (
                        <div key={grade} className="flex gap-2">
                          {classesByGrade[grade].map((cls) => {
                            const isChecked = field.value.includes(cls._id);
                            return (
                              <label
                                key={cls._id}
                                className="flex items-center gap-2 cursor-pointer border rounded px-2 py-1"
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    if (!isReadOnly) {
                                      if (e.target.checked)
                                        field.onChange([
                                          ...field.value,
                                          cls._id,
                                        ]);
                                      else
                                        field.onChange(
                                          field.value.filter(
                                            (id) => id !== cls._id
                                          )
                                        );
                                    }
                                  }}
                                  disabled={isReadOnly}
                                />
                                <span>
                                  {grade}-{cls.section}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* SESSION */}
              <FormField
                control={form.control}
                name="session"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Session</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isReadOnly} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* MONTH DETAILS */}
              <FormField
                control={form.control}
                name="monthDetails"
                render={({ field }) => {
                  const sortedSelectedMonths = [...field.value].sort(
                    (a, b) =>
                      monthsList.indexOf(a.month) -
                      monthsList.indexOf(b.month)
                  );

                  const handleMonthToggle = (month: string) => {
                    if (isReadOnly) return;

                    const existingIndex = field.value.findIndex(
                      (m) => m.month === month
                    );

                    if (existingIndex === -1) {
                      const { startDate, dueDate } = getMonthDates(
                        month,
                        sessionValue
                      );

                      field.onChange([
                        ...field.value,
                        { month, startDate, dueDate, amount: 0, lateFine: 0 },
                      ]);
                    } else {
                      field.onChange(
                        field.value.filter((m) => m.month !== month)
                      );
                    }
                  };

                  return (
                    <FormItem>
                      <FormLabel>Collection Months</FormLabel>

                      <div className="flex flex-wrap gap-3 mt-3">
                        {monthsList.map((month) => {
                          const isSelected = field.value.some(
                            (m) => m.month === month
                          );
                          return (
                            <div
                              key={month}
                              onClick={() => handleMonthToggle(month)}
                              className={`cursor-pointer border rounded-lg px-4 py-3 flex items-center justify-between min-w-[110px] hover:shadow-md transition-all
                                ${
                                  isSelected
                                    ? "bg-blue-50 border-blue-500"
                                    : "bg-white border-gray-300"
                                }`}
                            >
                              <span className="font-medium">{month}</span>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                readOnly
                                className="h-4 w-4 cursor-pointer"
                              />
                            </div>
                          );
                        })}
                      </div>

                      <div className="mt-5 grid grid-cols-1 gap-4">
                        {sortedSelectedMonths.map((monthObj, index) => (
                          <div
                            key={monthObj.month}
                            className="border rounded-lg p-4 bg-gray-50 shadow-sm"
                          >
                            <h4 className="font-semibold mb-3">
                              {monthObj.month}
                            </h4>

                            <div className="grid grid-cols-2 gap-4">
                              {/* START DATE */}
                              <Controller
                                control={form.control}
                                name={`monthDetails.${index}.startDate`}
                                render={({ field: startField }) => (
                                  <FormItem>
                                    <FormLabel className="text-sm">
                                      Start Date
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        type="date"
                                        {...startField}
                                        required
                                        className="text-sm"
                                        disabled={isReadOnly}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />

                              {/* DUE DATE */}
                              <Controller
                                control={form.control}
                                name={`monthDetails.${index}.dueDate`}
                                render={({ field: dueField }) => (
                                  <FormItem>
                                    <FormLabel className="text-sm">
                                      Due Date
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        type="date"
                                        {...dueField}
                                        required
                                        className="text-sm"
                                        disabled={isReadOnly}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />

                              {/* AMOUNT */}
                              <Controller
                                control={form.control}
                                name={`monthDetails.${index}.amount`}
                                render={({ field: amtField }) => (
                                  <FormItem>
                                    <FormLabel className="text-sm">
                                      Amount (₹)
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        placeholder="Amount"
                                        {...amtField}
                                        min={1}
                                        className="text-sm"
                                        disabled={isReadOnly}
                                        onChange={(e) =>
                                          !isReadOnly &&
                                          amtField.onChange(
                                            Number(e.target.value) || ""
                                          )
                                        }
                                        onWheel={(e) =>
                                          e.currentTarget.blur()
                                        }
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />

                              {/* LATE FINE */}
                              <Controller
                                control={form.control}
                                name={`monthDetails.${index}.lateFine`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-sm">
                                      Late Fine (₹)
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        placeholder="Late Fine"
                                        min={0}
                                        value={field.value ?? 0}
                                        disabled={isReadOnly}
                                        onChange={(e) =>
                                          !isReadOnly &&
                                          field.onChange(
                                            e.target.value === ""
                                              ? ""
                                              : Number(e.target.value)
                                          )
                                        }
                                        onWheel={(e) =>
                                          e.currentTarget.blur()
                                        }
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              {/* ACTION BUTTONS */}
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>

                {(mode === "create" || mode === "edit") && (
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : mode === "create" ? (
                      "Create Structure"
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                )}

                {mode === "delete" && (
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={isLoading}
                    onClick={() => {
                      /* your delete API */
                    }}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Delete"
                    )}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};
