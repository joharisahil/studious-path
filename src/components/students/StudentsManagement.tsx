// StudentsManagement.tsx
import React, { useEffect, useState, useMemo } from "react";
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
import { getAllStudents, deleteStudent } from "@/services/StudentsApi";
import { getAllClasses } from "@/services/ClassesApi";
import StudentDetailsModal from "./StudentDetailsModal";

const StudentsManagement: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrade, setSelectedGrade] = useState<string>("all");
  const [scholarshipFilter, setScholarshipFilter] = useState<string>("all"); // 'all' | 'yes'
  const [currentPage, setCurrentPage] = useState(1);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

  const [classList, setClassList] = useState<any[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);

  const { toast } = useToast();

  const studentsPerPage = 10;

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  });

  // KPI values (populated from getAllStudents response)
  const [totalStudentCount, setTotalStudentCount] = useState<number>(0);
  const [totalScholarshipCount, setTotalScholarshipCount] = useState<number>(0);
  const [scholarshipPercentage, setScholarshipPercentage] =
    useState<string>("0%");

  // ------------------------------
  // Fetch students from API (single source of truth)
  // ------------------------------
  const fetchStudents = async (page = 1) => {
    setIsLoading(true);
    try {
      const res: any = await getAllStudents(page, studentsPerPage);
      // expecting response to match the JSON you showed:
      // { success, totalStudents, totalScholarshipStudents, scholarshipPercentage, students, pagination }
      const resp = res || {};
      setStudents(resp.students || []);
      setPagination(
        resp.pagination || {
          currentPage: page,
          totalPages: 1,
          total: resp.totalStudents || (resp.students?.length ?? 0),
        }
      );

      // KPIs from server (fallbacks to computed)
      setTotalStudentCount(
        resp.totalStudents ??
          resp.pagination?.total ??
          resp.students?.length ??
          0
      );
      setTotalScholarshipCount(
        resp.totalScholarshipStudents ??
          computeTotalScholarshipFromList(resp.students || [])
      );
      setScholarshipPercentage(
        resp.scholarshipPercentage ??
          computeScholarshipPercent(
            resp.totalScholarshipStudents ?? undefined,
            resp.totalStudents ?? undefined,
            resp.students || []
          )
      );
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

  // compute helpers in case server doesn't provide KPIs
  const computeTotalScholarshipFromList = (list: any[]) =>
    list.filter((s) => s.scholarshipInfo != null).length;
  const computeScholarshipPercent = (
    serverScholarshipCount?: number,
    serverTotal?: number,
    list: any[] = []
  ) => {
    const total = serverTotal ?? list.length;
    const scholarshipCount =
      typeof serverScholarshipCount === "number"
        ? serverScholarshipCount
        : computeTotalScholarshipFromList(list);
    if (!total) return "0%";
    return `${((scholarshipCount / total) * 100).toFixed(2)}%`;
  };

  // ------------------------------
  // Initial fetch & fetch classes
  // ------------------------------
  useEffect(() => {
    fetchStudents(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  useEffect(() => {
    // fetch classes and sort them before showing
    const fetchClasses = async () => {
      setLoadingClasses(true);
      try {
        const data: any[] = await getAllClasses();
        // sort by numeric grade when possible, then section
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
          // fallback to section sort
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
  // Handlers
  // ------------------------------
  const handleEditStudent = (student: any) => {
    setSelectedStudent(student);
    setEditModalOpen(true);
  };

  const handleViewStudent = (student: any) => {
    setSelectedStudent(student);
    setDetailsModalOpen(true);
  };

  const handleDeleteStudent = async (studentId: string) => {
    try {
      await deleteStudent(studentId);
      setStudents((prev) => prev.filter((s) => s._id !== studentId));
      // update KPIs locally
      const newTotal = Math.max(0, totalStudentCount - 1);
      const hadScholarship =
        students.find((s) => s._id === studentId)?.scholarshipInfo != null;
      setTotalStudentCount(newTotal);
      if (hadScholarship) setTotalScholarshipCount((p) => Math.max(0, p - 1));
      setScholarshipPercentage(
        computeScholarshipPercent(
          undefined,
          newTotal,
          students.filter((s) => s._id !== studentId)
        )
      );
      toast({
        title: "Student Deleted",
        description: "Student has been successfully deleted.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.message || "Failed to delete student. Please try again.",
        variant: "destructive",
      });
    }
  };

  // copy registration number
  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied",
        description: "Registration number copied to clipboard.",
      });
    } catch {
      toast({
        title: "Failed",
        description: "Could not copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  // ------------------------------
  // Derived / filtered students
  // ------------------------------
  const filteredStudents = useMemo(() => {
    const base = students || [];
    // apply scholarship filter first
    const scholarshipFiltered =
      scholarshipFilter === "yes"
        ? base.filter((s) => s.scholarshipInfo != null)
        : base;

    // apply grade filter
    const gradeFiltered =
      selectedGrade === "all"
        ? scholarshipFiltered
        : scholarshipFiltered.filter((s) => {
            const clsGrade = s.classId?.grade ?? s.grade ?? "";
            const clsSection = s.classId?.section ?? s.section ?? "";
            return `${clsGrade}-${clsSection}` === selectedGrade;
          });

    // apply search
    const search = searchTerm.trim().toLowerCase();
    if (!search) return gradeFiltered;

    return gradeFiltered.filter((student) => {
      return (
        (student.firstName ?? "").toString().toLowerCase().includes(search) ||
        (student.lastName ?? "").toString().toLowerCase().includes(search) ||
        (student.registrationNumber ?? "")
          .toString()
          .toLowerCase()
          .includes(search) ||
        (student.email ?? "").toString().toLowerCase().includes(search)
      );
    });
  }, [students, scholarshipFilter, selectedGrade, searchTerm]);

  // top performing class (by scholarship students count)
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
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setImportModalOpen(true)}
          >
            <Upload className="w-4 h-4" /> Import
          </Button>
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedGrade} onValueChange={setSelectedGrade}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                {loadingClasses ? (
                  <SelectItem value="loading" disabled>
                    Loading...
                  </SelectItem>
                ) : classList.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No classes found
                  </SelectItem>
                ) : (
                  classList.map((cls: any, i: number) => (
                    <SelectItem key={i} value={`${cls.grade}-${cls.section}`}>
                      Class {cls.grade} ({cls.section})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>

            <Select
              value={scholarshipFilter}
              onValueChange={setScholarshipFilter}
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
                  <TableHead>Class</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>DOB</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredStudents.map((student) => (
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
                              handleCopy(student.registrationNumber)
                            }
                          >
                            <Copy className="w-4 h-4" />
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

          {filteredStudents.length === 0 && !isLoading && (
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
                setCurrentPage((p) => Math.max(1, p - 1));
                fetchStudents(Math.max(1, currentPage - 1));
              }}
              disabled={pagination.currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCurrentPage((p) => Math.min(pagination.totalPages, p + 1));
                fetchStudents(Math.min(pagination.totalPages, currentPage + 1));
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
            onOpenChange={setEditModalOpen}
            student={selectedStudent}
            onSuccess={() => {
              fetchStudents(pagination.currentPage);
              setSelectedStudent(null);
            }}
          />
          <StudentDetailsModal
            open={detailsModalOpen}
            onOpenChange={setDetailsModalOpen}
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
