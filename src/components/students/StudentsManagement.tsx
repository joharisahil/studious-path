import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Download,
  MoreVertical,
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
import { Student } from "@/types";
import { getAllStudents } from "@/services/GetTotalStudent";

const StudentsManagement = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrade, setSelectedGrade] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const { toast } = useToast();

  // fetch from API
  const getStudentsFromAPI = async () => {
    setIsLoading(true);
    try {
      const data = await getAllStudents();
      setStudents(data);
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

  useEffect(() => {
    getStudentsFromAPI();
  }, []);

  const totalStudents = students.length;
  const totalPages = Math.max(1, Math.ceil(totalStudents / 10));

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
      setStudents((prev) => prev.filter((s) => s.id !== studentId));
      toast({
        title: "Student Deleted",
        description: "Student has been successfully deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete student. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-success/10 text-success">Active</Badge>;
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>;
      case "graduated":
        return <Badge className="bg-info/10 text-info">Graduated</Badge>;
      case "suspended":
        return <Badge variant="destructive">Suspended</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Filter students safely
  const filteredStudents = students.filter((student) => {
    const matchesGrade =
      selectedGrade === "all" || student.grade === selectedGrade;
    const matchesStatus =
      selectedStatus === "all" || student.status === selectedStatus;

    const matchesSearch =
      (student.firstName ?? "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (student.lastName ?? "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (student.registrationNumber ?? "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (student.email ?? "").toLowerCase().includes(searchTerm.toLowerCase());

    return matchesGrade && matchesStatus && matchesSearch;
  });

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
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button onClick={() => setCreateModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Student
          </Button>
        </div>
      </div>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Students List</CardTitle>
          <CardDescription>
            {isLoading
              ? "Loading..."
              : `Showing ${filteredStudents.length} of ${totalStudents} students`}
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
                  <TableHead>Registeration Number</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Session</TableHead>
                  <TableHead>DOB</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">
                      {student.registrationNumber}
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
                          <div className="text-sm text-muted-foreground">
                            Section {student.section ?? "-"}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{student.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">Grade {student.grade}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(student.section)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {student.dateOfBirth
                        ? new Date(student.dateOfBirth).toLocaleDateString()
                        : "-"}
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
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEditStudent(student)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onSelect={(e) => e.preventDefault()}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Student
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete{" "}
                                  {student.firstName} {student.lastName}? This
                                  action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDeleteStudent(student.id!)
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
        </CardContent>
      </Card>

      {/* Modals */}
      <CreateStudentModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSuccess={getStudentsFromAPI}
      />

      {selectedStudent && (
        <>
          <EditStudentModal
            open={editModalOpen}
            onOpenChange={setEditModalOpen}
            student={selectedStudent}
            onSuccess={() => {
              getStudentsFromAPI();
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
    </div>
  );
};

export default StudentsManagement;