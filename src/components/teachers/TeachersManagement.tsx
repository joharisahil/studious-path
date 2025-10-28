import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Download,
  MoreVertical,
  Upload, // Added for the Import button
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

import CreateTeacherModal from "./CreateTeacherModal";
import EditTeacherModal from "./EditTeacherModal";
import TeacherDetailsModal from "./TeacherDetailsModal";
import ImportTeacherModal from "./ImportTeacherModal.tsx"; // Import the new modal
import { TeacherFormData } from "@/types";
import { getAllTeachers } from "@/services/TeachersApi";

const TeachersManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false); // New state for import modal
  const [selectedTeacher, setSelectedTeacher] =
    useState<TeacherFormData | null>(null);
  const [teachers, setTeachers] = useState<TeacherFormData[]>([]);
  const [loading, setLoading] = useState(true);

  const { toast } = useToast();

  // Fetch teachers from API
  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const data = await getAllTeachers();
      const formattedTeachers = (data.teachers || []).map((t) => ({
        ...t,
        _id: t._id || t.id,
        experienceYears: t.experienceYears || 0,
        firstName: t.firstName || "",
        lastName: t.lastName || "",
        registrationNumber: t.registrationNumber || t.teacherId || "",
        status: t.status || "active",
      }));
      setTeachers(formattedTeachers);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch teachers.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleEditTeacher = (teacher: TeacherFormData) => {
    setSelectedTeacher(teacher);
    setEditModalOpen(true);
  };

  const handleViewTeacher = (teacher: TeacherFormData) => {
    setSelectedTeacher(teacher);
    setDetailsModalOpen(true);
  };

  const handleDeleteTeacher = async (teacherId: string) => {
    try {
      setTeachers((prev) => prev.filter((t) => t._id !== teacherId));
      toast({
        title: "Teacher Deleted",
        description: "Teacher has been successfully deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete teacher. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredTeachers = teachers.filter((teacher) => {
    const matchesStatus =
      selectedStatus === "all" || teacher.status === selectedStatus;
    const matchesSearch = (
      teacher.firstName +
      " " +
      teacher.lastName +
      " " +
      teacher.email
    )
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient-primary">
            Teachers Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage teacher profiles, details, and status
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
            <Plus className="w-4 h-4" /> Add Teacher
          </Button>
        </div>
      </div>

      {/* Teacher Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="kpi-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Teachers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teachers.length}</div>
            <div className="text-sm text-muted-foreground">All registered</div>
          </CardContent>
        </Card>
        <Card className="kpi-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Junior Teachers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {teachers.filter((t) => t.experienceYears <= 5).length}
            </div>
            <div className="text-sm text-muted-foreground">
              0–5 years of experience
            </div>
          </CardContent>
        </Card>
        <Card className="kpi-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Senior Teachers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {teachers.filter((t) => t.experienceYears > 5).length}
            </div>
            <div className="text-sm text-muted-foreground">
              6+ years of experience
            </div>
          </CardContent>
        </Card>
        <Card className="kpi-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. Experience
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {String(
                Math.round(
                  teachers.reduce((sum, t) => sum + t.experienceYears, 0) /
                    (teachers.length || 1)
                )
              ).padStart(2, "0")}{" "}
              yrs
            </div>
            <div className="text-sm text-muted-foreground">
              Across all teachers
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Search & Filter Teachers</CardTitle>
          <CardDescription>
            Find teachers by name, email, or status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by name, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {/* <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="onLeave">On Leave</SelectItem>
                <SelectItem value="terminated">Terminated</SelectItem>
                <SelectItem value="retired">Retired</SelectItem>
              </SelectContent>
            </Select> */}
          </div>
        </CardContent>
      </Card>

      {/* Teachers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Teachers List</CardTitle>
          <CardDescription>
            {loading
              ? "Loading..."
              : `Showing ${filteredTeachers.length} of ${teachers.length} teachers`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              Loading teachers...
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No teachers found. Try adjusting your search terms or filters.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Teacher ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone No.</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeachers.map((teacher) => (
                  <TableRow key={teacher._id}>
                    <TableCell className="font-medium">
                      {teacher.registrationNumber}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-primary-foreground text-xs font-medium">
                            {(teacher.firstName?.[0] || "").toUpperCase()}
                            {(teacher.lastName?.[0] || "").toUpperCase()}
                          </span>
                        </div>
                        <div className="font-medium">
                          {teacher.firstName} {teacher.lastName}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{teacher.email}</TableCell>
                    <TableCell>{teacher.phone || "-"}</TableCell>
                    <TableCell>
                      {String(teacher.experienceYears).padStart(2, "0")}
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
                            onClick={() => handleViewTeacher(teacher)}
                          >
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEditTeacher(teacher)}
                          >
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
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
                                  Delete Teacher
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete{" "}
                                  {teacher.firstName} {teacher.lastName}? This
                                  action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDeleteTeacher(teacher._id!)
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
      <CreateTeacherModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSuccess={fetchTeachers}
      />
      {selectedTeacher && (
        <>
          <EditTeacherModal
            open={editModalOpen}
            onOpenChange={setEditModalOpen}
            teacher={selectedTeacher}
            onSuccess={() => {
              fetchTeachers();
              setSelectedTeacher(null);
            }}
          />
          <TeacherDetailsModal
            open={detailsModalOpen}
            onOpenChange={setDetailsModalOpen}
            teacher={{
              ...selectedTeacher,
              id: selectedTeacher._id || selectedTeacher.id || "",
              registrationNumber:
                selectedTeacher.registrationNumber ||
                selectedTeacher.teacherId ||
                "",
              userId: selectedTeacher.userId || "",
              status: selectedTeacher.status || "active",
              createdAt: selectedTeacher.createdAt || new Date().toISOString(),
              updatedAt: selectedTeacher.updatedAt || new Date().toISOString(),
            }}
          />
        </>
      )}
      <ImportTeacherModal
        open={importModalOpen}
        onOpenChange={setImportModalOpen}
        onSuccess={fetchTeachers} // Refresh teachers after import
      />
    </div>
  );
};

export default TeachersManagement;
