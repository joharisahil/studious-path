import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Download,
  MoreVertical,
  Upload,
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
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import CreateStudentModal from "./CreateStudentModal";
import EditStudentModal from "./EditStudentModal";
import StudentDetailsModal from "./StudentDetailsModal";
import ImportStudentModal from "./ImportStudentModal";
import { Student } from "@/types";
import {
  deleteStudent,
  getAllStudents,
  getStudentsWithScholarships,
} from "@/services/StudentsApi";
import { getAllClasses } from "@/services/ClassesApi";

const StudentsManagement = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrade, setSelectedGrade] = useState<string>("all");
  const [scholarshipFilter, setScholarshipFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const [classList, setClassList] = useState<any[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);

  const { toast } = useToast();

  const studentsPerPage = 10;

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  });

  // KPI counts
  const [totalStudentCount, setTotalStudentCount] = useState(0);
  const [totalScholarshipCount, setTotalScholarshipCount] = useState(0);

  // ------------------------------
  // Fetch students from API
  // ------------------------------
  const getStudentsFromAPI = async (page = 1) => {
    setIsLoading(true);
    try {
      const data = await getAllStudents(page, studentsPerPage);
      setStudents(data.students);
      setPagination(data.pagination || { currentPage: 1, totalPages: 1, total: data.students?.length || 0 });
    } catch (error) {
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
  // Fetch scholarship students
  // ------------------------------
  const fetchScholarshipStudents = async (page = 1) => {
    setIsLoading(true);
    try {
      const data = await getStudentsWithScholarships();
      setStudents(data.students.map((item: any) => item.studentId || item.student));
      setPagination({
        currentPage: 1,
        totalPages: 1,
        total: data.count || data.students.length || 0,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch scholarship students",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ------------------------------
  // Fetch KPI counts
  // ------------------------------
  const fetchKpiCounts = async () => {
    try {
      const studentsData = await getAllStudents(1, studentsPerPage);
      setTotalStudentCount(studentsData.pagination?.total || studentsData.students.length || 0);

      const scholarshipsData = await getStudentsWithScholarships();
      setTotalScholarshipCount(scholarshipsData.count || scholarshipsData.students?.length || 0);
    } catch (error) {
      console.error("Error fetching KPI counts:", error);
    }
  };

  // ------------------------------
  // Initial fetch & fetch classes
  // ------------------------------
  useEffect(() => {
    if (scholarshipFilter === "yes") {
      fetchScholarshipStudents(currentPage);
    } else {
      getStudentsFromAPI(currentPage);
    }
    fetchKpiCounts(); // fetch totals on mount/filter change
  }, [currentPage, scholarshipFilter]);

  useEffect(() => {
    const fetchClasses = async () => {
      setLoadingClasses(true);
      try {
        const data = await getAllClasses();
        setClassList(data || []);
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
  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setEditModalOpen(true);
  };

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setDetailsModalOpen(true);
  };

  const handleDeleteStudent = async (studentId: string) => {
    try {
      await deleteStudent(studentId);
      setStudents((prev) => prev.filter((s) => s._id !== studentId));
      fetchKpiCounts(); // refresh totals
      toast({
        title: "Student Deleted",
        description: "Student has been successfully deleted.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete student. Please try again.",
        variant: "destructive",
      });
    }
  };

  // ------------------------------
  // Filtered students
  // ------------------------------
  const filteredStudents = students.filter((student) => {
    const studentClassValue = `${student.classId?.grade ?? ""}-${student.classId?.section ?? ""}`;
    const matchesGrade = selectedGrade === "all" || studentClassValue === selectedGrade;
    const matchesSearch =
      (student.firstName ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.lastName ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.studentId ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.email ?? "").toLowerCase().includes(searchTerm.toLowerCase());

    return matchesGrade && matchesSearch;
  });

  const currentStudents = filteredStudents;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedGrade, scholarshipFilter]);

  const handleSearch = () => {
    setCurrentPage(1);
    if (scholarshipFilter === "yes") {
      fetchScholarshipStudents(1);
    } else {
      getStudentsFromAPI(1);
    }
  };

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

      {/* Stats Cards */}
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
              New This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">23</div>
            <div className="text-sm text-muted-foreground">
              Recent enrollments
            </div>
          </CardContent>
        </Card>

        <Card className="kpi-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Graduation Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <div className="text-sm text-muted-foreground">
              Last academic year
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
                  classList.map((cls, i) => (
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
                <SelectItem value="yes">Scholarship Students</SelectItem>
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
                {currentStudents.map((student) => (
                  <TableRow key={student._id}>
                    <TableCell className="font-medium">
                      {student.registrationNumber || "-"}
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
                    <TableCell className="text-sm">{student.email || "-"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{student.classId?.grade ?? "-"}</Badge>
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
                          <DropdownMenuItem onClick={() => handleViewStudent(student)}>
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditStudent(student)}>
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
                                <AlertDialogTitle>Delete Student</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete{" "}
                                  {student.firstName} {student.lastName}? This action cannot
                                  be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>

                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteStudent(student._id)}
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
              <div className="text-muted-foreground mb-2">No students found</div>
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
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={pagination.currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(pagination.totalPages, prev + 1)
                )
              }
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
        onSuccess={() => {
          getStudentsFromAPI();
          fetchKpiCounts();
        }}
      />
      {selectedStudent && (
        <>
          <EditStudentModal
            open={editModalOpen}
            onOpenChange={setEditModalOpen}
            student={selectedStudent}
            onSuccess={() => {
              getStudentsFromAPI();
              fetchKpiCounts();
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
        onSuccess={() => {
          getStudentsFromAPI();
          fetchKpiCounts();
        }}
      />
    </div>
  );
};

export default StudentsManagement;
