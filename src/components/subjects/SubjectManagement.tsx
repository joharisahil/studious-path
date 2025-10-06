import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Download,
  MoreVertical,
  UserPlus,
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

import CreateSubjectModal from "./CreateSubjectModal";
import EditSubjectModal from "./EditSubjectModal";
import SubjectDetailsModal from "./SubjectDetailsModal";
import AssignTeacherModal from "./AssignTeacherModal";

import { Subject } from "@/types";
import { getSubjects, deleteSubject, assignTeacher } from "@/services/subject";
import { getAllClasses } from "@/services/ClassesApi";

const SubjectsManagement = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);

  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  const [classes, setClasses] = useState<any[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);

  const { toast } = useToast();

  /* ---------------------- FETCH SUBJECTS ---------------------- */
  const fetchSubjects = async () => {
    setIsLoading(true);
    try {
      const data = await getSubjects({ page: 1, limit: 100 });
      setSubjects(data?.subjects || []);
      setFilteredSubjects(data?.subjects || []);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to fetch subjects",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------------------- FETCH CLASSES ---------------------- */
  const fetchClasses = async () => {
    setLoadingClasses(true);
    try {
      const data = await getAllClasses();
      setClasses(data || []);
    } catch (err) {
      console.error("Failed to fetch classes:", err);
    } finally {
      setLoadingClasses(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
    fetchClasses();
  }, []);

  /* ---------------------- SEARCH + FILTER ---------------------- */
  useEffect(() => {
    let result = subjects;

    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (subj) =>
          subj.name?.toLowerCase().includes(term) ||
          subj.code?.toLowerCase().includes(term)
      );
    }

    if (selectedClass !== "all") {
      result = result.filter((subj: any) => subj.classId === selectedClass);
    }

    setFilteredSubjects(result);
    setCurrentPage(1);
  }, [searchTerm, selectedClass, subjects]);

  /* ---------------------- PAGINATION ---------------------- */
  const subjectsPerPage = 10;
  const totalPages = Math.max(
    1,
    Math.ceil(filteredSubjects.length / subjectsPerPage)
  );
  const indexOfLastSubject = currentPage * subjectsPerPage;
  const indexOfFirstSubject = indexOfLastSubject - subjectsPerPage;
  const currentSubjects = filteredSubjects.slice(
    indexOfFirstSubject,
    indexOfLastSubject
  );

  /* ---------------------- ACTION HANDLERS ---------------------- */
  const handleEditSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    setEditModalOpen(true);
  };

  const handleViewSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    setDetailsModalOpen(true);
  };

  const handleDeleteSubject = async (subjectId: string) => {
    try {
      await deleteSubject(subjectId);
      setSubjects((prev) => prev.filter((s) => s._id !== subjectId));
      toast({
        title: "Deleted",
        description: "Subject deleted successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete subject",
        variant: "destructive",
      });
    }
  };

  const handleAssignTeacher = async (subject: Subject, teacherId: string) => {
    try {
      await assignTeacher({ teacherId, subjectId: subject._id! });
      toast({
        title: "Teacher Assigned",
        description: "Teacher successfully assigned to this subject.",
      });
      await fetchSubjects();
      setAssignModalOpen(false);
      setSelectedSubject(null);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to assign teacher",
        variant: "destructive",
      });
    }
  };

  const renderTeacherBadge = (subject: Subject) => {
    if (subject.teacherName) return <Badge>{subject.teacherName}</Badge>;
    return <Badge variant="outline">Unassigned</Badge>;
  };

  /* ---------------------- KPI CARDS ---------------------- */
  const totalSubjects = subjects.length;
  const assignedTeachers = subjects.filter((s) => s.teacherName).length;
  const unassignedSubjects = subjects.filter((s) => !s.teacherName).length;
  const totalClasses = classes.length;

  /* ---------------------- UI ---------------------- */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient-primary">
            Subjects Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage subjects and assigned teachers
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" /> Export
          </Button>
          <Button onClick={() => setCreateModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Add Subject
          </Button>
        </div>
      </div>

      {/* ------------------- KPI CARDS ------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="kpi-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Subjects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubjects}</div>
            <div className="text-sm text-muted-foreground">Across all classes</div>
          </CardContent>
        </Card>

        <Card className="kpi-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Assigned Teachers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{assignedTeachers}</div>
            <div className="text-sm text-muted-foreground">With assigned teachers</div>
          </CardContent>
        </Card>

        <Card className="kpi-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Unassigned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{unassignedSubjects}</div>
            <div className="text-sm text-muted-foreground">Need teacher assignment</div>
          </CardContent>
        </Card>

        <Card className="kpi-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClasses}</div>
            <div className="text-sm text-muted-foreground">Active classes</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Search & Filter Subjects</CardTitle>
          <CardDescription>Filter by name, code, or class</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {loadingClasses
                  ? <SelectItem value="loading" disabled>Loading...</SelectItem>
                  : classes.map((c) => (
                      <SelectItem key={c._id} value={c._id}>
                        {`Grade ${c.grade} (${c.section})`}
                      </SelectItem>
                    ))
                }
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Subjects Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Subjects List</CardTitle>
          <CardDescription>
            {isLoading
              ? "Loading..."
              : `Showing ${currentSubjects.length} of ${filteredSubjects.length} subjects`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading subjects...
            </div>
          ) : filteredSubjects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No subjects found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentSubjects.map((subject) => (
                  <TableRow key={subject._id}>
                    <TableCell>{subject.name}</TableCell>
                    <TableCell>{subject.code}</TableCell>
                    <TableCell>{renderTeacherBadge(subject)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewSubject(subject)}>
                            <Eye className="mr-2 h-4 w-4" /> View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditSubject(subject)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedSubject(subject);
                              setAssignModalOpen(true);
                            }}
                          >
                            <UserPlus className="mr-2 h-4 w-4" /> Assign Teacher
                          </DropdownMenuItem>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Subject</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete {subject.name}? This
                                  action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteSubject(subject._id!)}
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  size="sm"
                  variant={currentPage === p ? "default" : "outline"}
                  onClick={() => setCurrentPage(p)}
                >
                  {p}
                </Button>
              ))}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <CreateSubjectModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSuccess={fetchSubjects}
      />

      {selectedSubject && (
        <>
          <EditSubjectModal
            open={editModalOpen}
            onOpenChange={(open) => {
              setEditModalOpen(open);
              if (!open) setSelectedSubject(null);
            }}
            subject={selectedSubject}
            onSuccess={fetchSubjects}
          />

          <SubjectDetailsModal
            open={detailsModalOpen}
            onOpenChange={(open) => {
              setDetailsModalOpen(open);
              if (!open) setSelectedSubject(null);
            }}
            subject={selectedSubject}
          />

          <AssignTeacherModal
            open={assignModalOpen}
            onOpenChange={(open) => {
              setAssignModalOpen(open);
              if (!open) setSelectedSubject(null);
            }}
            subject={selectedSubject}
            onAssign={(teacherId) =>
              handleAssignTeacher(selectedSubject, teacherId)
            }
          />
        </>
      )}
    </div>
  );
};

export default SubjectsManagement;
