import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Plus,
  Calendar,
  UserCheck,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import API_BASE_URL from "@/config/api";
import { CreatePeriodModal } from "./CreatePeriodModal";
import { AutoGenerateModal } from "./AutoGenerateModal";
import { FindFreeTeachersModal } from "./FindFreeTeachersModal";
import { getClassTimetable, getTeacherTimetable } from "@/services/TimeTableApi";

// ✅ Helper to get token
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: { Authorization: `Bearer ${token}` },
    withCredentials: true,
  };
};

export const TimetableManagement: React.FC = () => {
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [createPeriodOpen, setCreatePeriodOpen] = useState(false);
  const [autoGenerateOpen, setAutoGenerateOpen] = useState(false);
  const [findTeachersOpen, setFindTeachersOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("class");

  const [classes, setClasses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classTimetable, setClassTimetable] = useState<any[]>([]);
  const [teacherTimetable, setTeacherTimetable] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const periods = Array.from({ length: 8 }, (_, i) => i + 1);

  //  Fetch all classes & teachers on mount
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        setLoadingDropdowns(true);
        const [classRes, teacherRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/class/getall`, getAuthHeaders()),
          axios.get(`${API_BASE_URL}/teachers/getall`, getAuthHeaders()),
        ]);

        setClasses(classRes.data.classes || []);
        setTeachers(teacherRes.data.teachers || []);
      } catch (err: any) {
        console.error(err);
        setError("Failed to load class/teacher data.");
      } finally {
        setLoadingDropdowns(false);
      }
    };
    fetchDropdownData();
  }, []);

  useEffect(() => {
    if (!selectedClassId) return;
    const fetchTimetable = async () => {
      try {
        setLoading(true);
        const timetable = await getClassTimetable(selectedClassId);
        setClassTimetable(timetable);
      } catch {
        setClassTimetable([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTimetable();
  }, [selectedClassId]);

  useEffect(() => {
    if (!selectedTeacherId) return;
    const fetchTimetable = async () => {
      try {
        setLoading(true);
        const timetable = await getTeacherTimetable(selectedTeacherId);
        setTeacherTimetable(timetable);
      } catch {
        setTeacherTimetable([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTimetable();
  }, [selectedTeacherId]);
  //  Random color generator for each subject (consistent per subject)
  const getColorForSubject = (subjectName: string) => {
    const colors = [
      "#0ea5e9", // blue
      "#10b981", // green
      "#f59e0b", // yellow
      "#ef4444", // red
      "#8b5cf6", // purple
      "#ec4899", // pink
      "#14b8a6", // teal
    ];
    const index =
      subjectName.split("").reduce((sum, c) => sum + c.charCodeAt(0), 0) %
      colors.length;
    return colors[index];
  };

  //  Render Class Timetable Grid
  const renderClassTimetable = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="animate-spin h-5 w-5 mr-2 text-blue-500" />
          <span className="text-sm text-muted-foreground">
            Loading timetable...
          </span>
        </div>
      );
    }

    if (!classTimetable.length)
      return (
        <p className="text-sm text-muted-foreground">
          No timetable found for this class.
        </p>
      );

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-9 gap-2 text-sm">
          {/* Header Row */}
          <div className="font-semibold p-3 bg-muted rounded-lg text-center">
            Day
          </div>
          {periods.map((p) => (
            <div
              key={p}
              className="font-semibold p-3 bg-muted rounded-lg text-center"
            >
              Period {p}
            </div>
          ))}

          {/* Timetable Rows */}
          {days.map((day) => (
            <React.Fragment key={day}>
              <div className="font-medium p-3 bg-muted/50 rounded-lg text-center">
                {day}
              </div>
              {periods.map((p) => {
                const period = classTimetable.find(
                  (item) => item.day === day && item.periodNumber === p
                );

                if (period) {
                  const color = getColorForSubject(period.subjectId?.name || "");
                  return (
                    <div
                      key={`${day}-${p}`}
                      className="p-2 border rounded-lg min-h-[80px] flex flex-col justify-center items-center text-center"
                      style={{ backgroundColor: `${color}10` }}
                    >
                      <div
                        className="font-medium text-xs mb-1"
                        style={{ color }}
                      >
                        {period.subjectId?.name || "Unknown"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {period.teacherId
                          ? `${period.teacherId.firstName || ""} ${period.teacherId.lastName || ""}`.trim()
                          : "No teacher"}
                      </div>

                    </div>
                  );
                }

                return (
                  <div
                    key={`${day}-${p}`}
                    className="p-2 border rounded-lg min-h-[80px] flex justify-center items-center text-xs text-muted-foreground"
                  >
                    Free
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  //  Render Teacher Timetable Grid
  const renderTeacherTimetable = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="animate-spin h-5 w-5 mr-2 text-blue-500" />
          <span className="text-sm text-muted-foreground">
            Loading timetable...
          </span>
        </div>
      );
    }

    if (!teacherTimetable.length)
      return (
        <p className="text-sm text-muted-foreground">
          No timetable found for this teacher.
        </p>
      );

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-9 gap-2 text-sm">
          {/* Header */}
          <div className="font-semibold p-3 bg-muted rounded-lg text-center">
            Day
          </div>
          {periods.map((p) => (
            <div
              key={p}
              className="font-semibold p-3 bg-muted rounded-lg text-center"
            >
              Period {p}
            </div>
          ))}

          {days.map((day) => (
            <React.Fragment key={day}>
              <div className="font-medium p-3 bg-muted/50 rounded-lg text-center">
                {day}
              </div>
              {periods.map((p) => {
                const period = teacherTimetable.find(
                  (item) => item.day === day && item.periodNumber === p
                );

                if (period) {
                  const color = getColorForSubject(period.subjectId?.name || "");
                  return (
                    <div
                      key={`${day}-${p}`}
                      className="p-2 border rounded-lg min-h-[80px] flex flex-col justify-center items-center text-center"
                      style={{ backgroundColor: `${color}10` }}
                    >
                      <div
                        className="font-medium text-xs mb-1"
                        style={{ color }}
                      >
                        {period.subjectId?.name || "Unknown"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {period.classId?.grade || "N/A"} - {period.classId?.section || "N/A"}
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={`${day}-${p}`}
                    className="p-2 border rounded-lg min-h-[80px] flex justify-center items-center text-xs text-muted-foreground"
                  >
                    Free
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Timetable Management</h1>
          <p className="text-muted-foreground">
            Manage class and teacher timetables
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setCreatePeriodOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Period
          </Button>
          <Button variant="outline" onClick={() => setAutoGenerateOpen(true)}>
            <Calendar className="mr-2 h-4 w-4" />
            Auto Generate
          </Button>
          <Button variant="outline" onClick={() => setFindTeachersOpen(true)}>
            <UserCheck className="mr-2 h-4 w-4" />
            Find Free Teachers
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="class">Class Timetable</TabsTrigger>
          <TabsTrigger value="teacher">Teacher Timetable</TabsTrigger>
        </TabsList>

        {/* Class View */}
        <TabsContent value="class" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Class Timetable View</CardTitle>
              <CardDescription>
                Select a class to view and manage its timetable
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                {loadingDropdowns ? (
                  <p className="text-sm text-muted-foreground">
                    Loading classes...
                  </p>
                ) : (
                  <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                    <SelectTrigger className="w-[300px]">
                      <SelectValue placeholder="Select a class" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      {classes.map((c) => (
                        <SelectItem key={c._id} value={c._id}>
                          {c.grade} - {c.section}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              {selectedClassId && renderClassTimetable()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Teacher View */}
        <TabsContent value="teacher" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Teacher Timetable View</CardTitle>
              <CardDescription>
                Select a teacher to view their schedule
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                {loadingDropdowns ? (
                  <p className="text-sm text-muted-foreground">
                    Loading teachers...
                  </p>
                ) : (
                  <Select
                    value={selectedTeacherId}
                    onValueChange={setSelectedTeacherId}
                  >
                    <SelectTrigger className="w-[300px]">
                      <SelectValue placeholder="Select a teacher" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      {teachers.map((t) => (
                        <SelectItem key={t._id} value={t._id}>
                          {t.firstName} {t.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              {selectedTeacherId && renderTeacherTimetable()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <CreatePeriodModal open={createPeriodOpen} onOpenChange={setCreatePeriodOpen} />
      <AutoGenerateModal open={autoGenerateOpen} onOpenChange={setAutoGenerateOpen} />
      <FindFreeTeachersModal open={findTeachersOpen} onOpenChange={setFindTeachersOpen} />
    </div>
  );
};
