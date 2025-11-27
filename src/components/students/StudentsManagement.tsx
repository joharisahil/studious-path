// StudentsManagement.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Download,
  MoreVertical,
  Upload,
  Copy,
  CheckCircle,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { useToast } from "@/hooks/use-toast";

import CreateStudentModal from "./CreateStudentModal";
import EditStudentModal from "./EditStudentModal";
import ImportStudentModal from "./ImportStudentModal";
import StudentDetailsModal from "./StudentDetailsModal";

import {
  getAllStudents,
  deleteStudent,
  getStudentById,
} from "@/services/StudentsApi";
import { getAllClasses } from "@/services/ClassesApi";

type Student = any;

const StudentsManagement: React.FC = () => {
  // data and loading
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // UI state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const studentsPerPage = 10;

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const { toast } = useToast();

  // classes
  const [classList, setClassList] = useState<any[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);

  // pagination & KPIs (comes from backend)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  });

  const [totalStudentCount, setTotalStudentCount] = useState<number>(0);
  const [totalScholarshipCount, setTotalScholarshipCount] =
    useState<number>(0);
  const [scholarshipPercentage, setScholarshipPercentage] =
    useState<string>("0%");

  // copied key for registration number copy feedback
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Filters state sent directly to backend
  const [filters, setFilters] = useState<{
    grade: string;
    section: string;
    scholarship: string; // "" | "yes"
    search: string;
  }>({
    grade: "",
    section: "",
    scholarship: "",
    search: "",
  });

  // ------------------------------
  // Fetch students (backend filtering + backend pagination)
  // ------------------------------
  const fetchStudents = async (page = 1) => {
    setIsLoading(true);
    try {
      const res: any = await getAllStudents(page, studentsPerPage, {
        grade: filters.grade || undefined,
        section: filters.section || undefined,
        scholarship: filters.scholarship || undefined,
        search: filters.search || undefined,
      });

      // backend response (as implemented):
      // { success, students, pagination, totalStudents, totalScholarshipStudents, scholarshipPercentage }
      const resp = res || {};

      setStudents(resp.students || []);
      setPagination(
        resp.pagination || {
          currentPage: page,
          totalPages: 1,
          total: resp.totalStudents ?? 0,
        }
      );

      setTotalStudentCount(resp.totalStudents ?? 0);
      setTotalScholarshipCount(resp.totalScholarshipStudents ?? 0);
      setScholarshipPercentage(resp.scholarshipPercentage ?? "0%");
      setCurrentPage(resp.pagination?.currentPage ?? page);
    } catch (err: any) {
      console.error("Error fetching students", err);
      toast({
        title: "Error",
        description: "Failed to fetch students",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ------------------------------
  // Fetch classes for filter dropdown
  // ------------------------------
  useEffect(() => {
    const fetchClasses = async () => {
      setLoadingClasses(true);
      try {
        const { data } = await getAllClasses();
        const sorted = (data || []).slice().sort((a: any, b: any) => {
          const ag = isFinite(Number(a.grade))
            ? Number(a.grade)
            : a.grade?.toString()?.localeCompare?.(b.grade ?? "");
          if (typeof ag === "number" && typeof Number(b.grade) === "number") {
            if (Number(a.grade) !== Number(b.grade))
              return Number(a.grade) - Number(b.grade);
          } else if (typeof ag === "string") {
            const cmp = (a.grade ?? "")
              .toString()
              .localeCompare((b.grade ?? "").toString());
            if (cmp !== 0) return cmp;
          }
          return (a.section ?? "").toString().localeCompare(b.section ?? "");
        });
        setClassList(sorted);
      } catch (err) {
        console.error("Failed to fetch classes:", err);
      } finally {
        setLoadingClasses(false);
      }
    };
    fetchClasses();
  }, []);

  // ------------------------------
  // Fetch when page or filters change
  // ------------------------------
  useEffect(() => {
    fetchStudents(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // When filters change, reset to page 1 and fetch
  useEffect(() => {
    setCurrentPage(1);
    fetchStudents(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.grade, filters.section, filters.scholarship, filters.search]);

  // ------------------------------
  // Handlers
  // ------------------------------
  const handleEditStudent = (student: any) => {
    setSelectedStudent(student);
    setEditModalOpen(true);
  };

  const handleViewStudent = async (student: any) => {
    try {
      const res: any = await getStudentById(student._id);
      if (res?.student) {
        setSelectedStudent(res.student);
      } else {
        setSelectedStudent(student);
      }
      setDetailsModalOpen(true);
    } catch (error: any) {
      console.error("Failed to fetch student details:", error);
      toast({
        title: "Error",
        description:
          error?.message || "Could not load student details. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    try {
      await deleteStudent(studentId);
      // After deletion, refetch current page (server will return correct pagination)
      fetchStudents(currentPage);
      toast({
        title: "Student Deleted",
        description: "Student has been successfully deleted.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error?.message || "Failed to delete student. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCopy = async (value: string, key?: string) => {
    if (!value) return;
    const uniqueKey = key ?? `val-${value}`;
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(uniqueKey);
      window.setTimeout(() => {
        setCopiedKey((prev) => (prev === uniqueKey ? null : prev));
      }, 1500);
      toast({
        title: "Copied",
        description: "Registeration Number Copied to clipboard.",
      });
    } catch (err) {
      toast({
        title: "Failed",
        description: "Could not copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  // ------------------------------
  // Derived helpers (purely UI: topPerformingClass, grades / sections from classes)
  // ------------------------------
  const topPerformingClass = useMemo(() => {
    const map: Record<string, { name: string; count: number }> = {};
    students.forEach((s) => {
      if (!s.classId) return;
      const key = `${s.classId.grade ?? s.grade ?? ""}-${
        s.classId.section ?? s.section ?? ""
      }`;
      if (!key) return;
      if (!map[key]) map[key] = { name: key, count: 0 };
      if (s.scholarshipInfo) map[key].count += 1;
    });
    const arr = Object.values(map).sort((a, b) => b.count - a.count);
    return arr.length ? arr[0] : { name: "None", count: 0 };
  }, [students]);

  const uniqueGrades = useMemo(() => {
    const set = new Set<string>();
    classList.forEach((c) => {
      if (c?.grade !== undefined && c?.grade !== null) {
        set.add(String(c.grade));
      }
    });
    const arr = Array.from(set);
    arr.sort((a, b) => {
      const na = Number(a);
      const nb = Number(b);
      if (isFinite(na) && isFinite(nb)) return na - nb;
      return a.localeCompare(b);
    });
    return arr;
  }, [classList]);

  const sectionsForSelectedGrade = useMemo(() => {
    if (!filters.grade) return [];
    const set = new Set<string>();
    classList.forEach((c) => {
      if (String(c.grade) === String(filters.grade)) {
        if (c?.section !== undefined && c?.section !== null) {
          set.add(String(c.section));
        }
      }
    });
    const arr = Array.from(set);
    arr.sort((a, b) => a.localeCompare(b));
    return arr;
  }, [classList, filters.grade]);

  // ------------------------------
  // Render
  // ------------------------------
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient-primary">
            Students Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage student profiles, enrollment, and academic records
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" /> Export
          </Button>
          <Button onClick={() => setCreateModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Add Student
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="kpi-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudentCount}</div>
            <div className="text-sm text-muted-foreground">All enrollments</div>
          </CardContent>
        </Card>

        <Card className="kpi-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Scholarship Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {totalScholarshipCount}
            </div>
            <div className="text-sm text-muted-foreground">
              Receiving scholarships
            </div>
          </CardContent>
        </Card>

        <Card className="kpi-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Scholarship Percentage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {scholarshipPercentage}
            </div>
            <div className="text-sm text-muted-foreground">
              % of students on scholarship
            </div>
          </CardContent>
        </Card>

        <Card className="kpi-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Top Performing Class
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topPerformingClass.name}</div>
            <div className="text-sm text-muted-foreground">
              {topPerformingClass.count} scholarship students
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Search & Filter Students</CardTitle>
          <CardDescription>
            Find students by name, ID, grade, or scholarship
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by name, email, or student ID..."
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                className="pl-10"
              />
            </div>

            {/* Grade select */}
            <Select
              value={filters.grade || "all"}
              onValueChange={(value) => {
                setFilters((prev) => ({
                  ...prev,
                  grade: value === "all" ? "" : value,
                  section: "",
                }));
              }}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                {loadingClasses ? (
                  <SelectItem value="loading" disabled>
                    Loading...
                  </SelectItem>
                ) : uniqueGrades.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No grades found
                  </SelectItem>
                ) : (
                  uniqueGrades.map((grade, i) => (
                    <SelectItem key={grade + i} value={grade}>
                      Grade {grade}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>

            {/* Section select (dependent on grade) */}
            <Select
              value={filters.section || "all"}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  section: value === "all" ? "" : value,
                }))
              }
            >
              <SelectTrigger
                className="w-48"
                disabled={!filters.grade}
              >
                <SelectValue placeholder="Select Section" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sections</SelectItem>
                {!filters.grade ? (
                  <SelectItem value="na" disabled>
                    Select a grade first
                  </SelectItem>
                ) : sectionsForSelectedGrade.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No sections found
                  </SelectItem>
                ) : (
                  sectionsForSelectedGrade.map((section, i) => (
                    <SelectItem key={section + i} value={section}>
                      Section {section}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>

            <Select
              value={filters.scholarship || "all"}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  scholarship: value === "all" ? "" : value,
                }))
              }
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Scholarship Students" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Students</SelectItem>
                <SelectItem value="yes">With Scholarship</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Students List</CardTitle>
          <CardDescription>
            {isLoading
              ? "Loading..."
              : `Showing page ${pagination.currentPage} of ${pagination.totalPages} — Total ${pagination.total} students`}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading students...</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Registration Number</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>DOB</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {students.map((student) => (
                  <TableRow key={student._id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <span>{student.registrationNumber || "-"}</span>
                        {student.registrationNumber && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-1"
                            onClick={() =>
                              handleCopy(
                                student.registrationNumber,
                                `reg-${student._id}`
                              )
                            }
                          >
                            {copiedKey === `reg-${student._id}` ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-primary-foreground text-xs font-medium">
                            {(student.firstName?.[0] ?? "") +
                              (student.lastName?.[0] ?? "")}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">
                            {student.firstName} {student.lastName}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-sm">
                      {student.email || "-"}
                    </TableCell>

                    <TableCell className="text-sm">
                      {student.phone || "-"}
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline">
                        {student.classId?.grade ?? "-"}
                      </Badge>
                    </TableCell>

                    <TableCell>{student.classId?.section ?? "-"}</TableCell>

                    <TableCell className="text-sm text-muted-foreground">
                      {student.dob
                        ? new Date(student.dob).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "N/A"}
                    </TableCell>

                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleViewStudent(student)}
                          >
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEditStudent(student)}
                          >
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>

                          {/* Delete Confirmation */}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onSelect={(e) => e.preventDefault()}
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>

                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Student
                                </AlertDialogTitle>
                                <div className="text-sm text-muted-foreground">
                                  Are you sure you want to delete{" "}
                                  {student.firstName} {student.lastName}? This
                                  action cannot be undone.
                                </div>
                              </AlertDialogHeader>

                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDeleteStudent(student._id)
                                  }
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {students.length === 0 && !isLoading && (
            <div className="text-center py-8">
              <div className="text-muted-foreground mb-2">
                No students found
              </div>
              <div className="text-sm text-muted-foreground">
                Try adjusting your search terms or filters
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Page {pagination.currentPage} of {pagination.totalPages} — Total:{" "}
            {pagination.total} students
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const prev = Math.max(1, pagination.currentPage - 1);
                setCurrentPage(prev);
                fetchStudents(prev);
              }}
              disabled={pagination.currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const next = Math.min(
                  pagination.totalPages,
                  pagination.currentPage + 1
                );
                setCurrentPage(next);
                fetchStudents(next);
              }}
              disabled={pagination.currentPage === pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateStudentModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSuccess={() => fetchStudents(1)}
      />
      {selectedStudent && (
        <>
          <EditStudentModal
            open={editModalOpen}
            onOpenChange={(open) => {
              setEditModalOpen(open);
              if (!open) setSelectedStudent(null);
            }}
            student={selectedStudent}
            onSuccess={() => {
              fetchStudents(pagination.currentPage);
              setSelectedStudent(null);
            }}
          />
          <StudentDetailsModal
            open={detailsModalOpen}
            onOpenChange={(open) => {
              setDetailsModalOpen(open);
              if (!open) setSelectedStudent(null);
            }}
            student={selectedStudent}
          />
        </>
      )}
      <ImportStudentModal
        open={importModalOpen}
        onOpenChange={setImportModalOpen}
        onSuccess={() => fetchStudents(pagination.currentPage)}
      />
    </div>
  );
};

export default StudentsManagement;
