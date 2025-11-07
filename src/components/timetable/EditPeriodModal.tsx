import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getAllClasses } from "@/services/ClassesApi";
import { getSubjectsByClass } from "@/services/subject";
import { getTeachersBySubject } from "@/services/TeachersApi";
import {
  getPeriodByClassDayPeriod,
  updatePeriod,
} from "@/services/TimeTableApi";
import { Loader2 } from "lucide-react";

export const EditPeriodModal = ({ open, onOpenChange }) => {
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [periodId, setPeriodId] = useState("");
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const periods = Array.from({ length: 8 }, (_, i) => i + 1);

  // 🧭 Fetch classes when modal opens
  useEffect(() => {
    if (open) {
      fetchClasses();
    } else {
      resetAllFields();
    }
  }, [open]);

  const fetchClasses = async () => {
    const data = await getAllClasses();
    setClasses(data || []);
  };

  // 🧹 Reset entire modal
  const resetAllFields = () => {
    setSelectedClass("");
    setSelectedDay("");
    setSelectedPeriod(null);
    setSelectedSubject("");
    setSelectedTeacher("");
    setSubjects([]);
    setTeachers([]);
    setPeriodId("");
  };

  // 🧠 Fetch existing period
  const handleFetchExisting = async () => {
    if (!selectedClass || !selectedDay || !selectedPeriod) return;

    try {
      setLoading(true);
      const period = await getPeriodByClassDayPeriod(
        selectedClass,
        selectedDay,
        selectedPeriod
      );

      if (!period) {
        toast({
          title: "No Period Found",
          description:
            "No period exists for this class, day, and period.",
          variant: "destructive",
        });
        resetSubjectTeacher();
        return;
      }

      setPeriodId(period._id);
      setSelectedSubject(period.subjectId?._id || "");
      setSelectedTeacher(period.teacherId?._id || "");

      const { subjects } = await getSubjectsByClass(selectedClass);
      if (!subjects?.length) {
        toast({
          title: "No Subjects Found",
          description: "No subjects exist for this class.",
        });
        setSubjects([]);
        setTeachers([]);
        return;
      }
      setSubjects(subjects);

      if (period.subjectId?._id) {
        const { teachers } = await getTeachersBySubject(period.subjectId._id);
        if (!teachers?.length) {
          toast({
            title: "No Teachers Found",
            description: "No teachers exist for this subject.",
          });
          setTeachers([]);
        } else {
          setTeachers(teachers);
        }
      }
    } catch (err: any) {
      if (err?.response?.status === 404) {
        toast({
          title: "No Period Found",
          description:
            "No period exists for this class, day, and period.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch period details.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const resetSubjectTeacher = () => {
    setSelectedSubject("");
    setSelectedTeacher("");
    setSubjects([]);
    setTeachers([]);
  };

  // ✏️ Handle update
  const handleUpdate = async () => {
    if (!periodId) return;
    try {
      setUpdating(true);
      const result = await updatePeriod(periodId, {
        classId: selectedClass,
        day: selectedDay,
        periodNumber: selectedPeriod,
        subjectId: selectedSubject,
        teacherId: selectedTeacher,
      });
      toast({
        title: "Period Updated",
        description: result.message || "Period updated successfully.",
      });
      // clear subject and teacher only
      resetSubjectTeacher();
    } catch (err: any) {
      toast({
        title: "Error",
        description:
          err?.response?.data?.message ||
          "Failed to update period. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Period</DialogTitle>
          <DialogDescription>
            Select Class, Day, and Period to load and modify details.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Class Dropdown */}
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger>
              <SelectValue placeholder="Select Class" />
            </SelectTrigger>
            <SelectContent>
              {classes.length ? (
                classes.map((c) => (
                  <SelectItem key={c._id} value={c._id}>
                    {c.grade} - {c.section}
                  </SelectItem>
                ))
              ) : (
                <div className="p-2 text-sm text-muted-foreground">
                  No classes found
                </div>
              )}
            </SelectContent>
          </Select>

          {/* Day & Period */}
          <div className="grid grid-cols-2 gap-3">
            <Select value={selectedDay} onValueChange={setSelectedDay}>
              <SelectTrigger>
                <SelectValue placeholder="Select Day" />
              </SelectTrigger>
              <SelectContent>
                {days.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              onValueChange={(v) => setSelectedPeriod(Number(v))}
              value={selectedPeriod?.toString() || ""}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Period" />
              </SelectTrigger>
              <SelectContent>
                {periods.map((p) => (
                  <SelectItem key={p} value={p.toString()}>
                    Period {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleFetchExisting}
            disabled={!selectedClass || !selectedDay || !selectedPeriod || loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...
              </>
            ) : (
              "Fetch Period"
            )}
          </Button>

          {/* Subject and Teacher */}
          {periodId && (
            <>
              <Select
                value={selectedSubject}
                onValueChange={async (v) => {
                  setSelectedSubject(v);
                  const { teachers } = await getTeachersBySubject(v);
                  if (!teachers?.length) {
                    toast({
                      title: "No Teachers Found",
                      description: "No teachers exist for this subject.",
                    });
                    setTeachers([]);
                  } else {
                    setTeachers(teachers);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.length ? (
                    subjects.map((s) => (
                      <SelectItem key={s._id} value={s._id}>
                        {s.name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-muted-foreground">
                      No subjects exist for this class
                    </div>
                  )}
                </SelectContent>
              </Select>

              <Select
                value={selectedTeacher}
                onValueChange={setSelectedTeacher}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.length ? (
                    teachers.map((t) => (
                      <SelectItem key={t._id} value={t._id}>
                        {t.firstName} {t.lastName}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-muted-foreground">
                      No teachers exist for this subject
                    </div>
                  )}
                </SelectContent>
              </Select>

              <Button onClick={handleUpdate} disabled={updating}>
                {updating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
                  </>
                ) : (
                  "Update Period"
                )}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
