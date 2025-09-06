import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Download, MoreVertical, UserPlus, UserMinus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useGetSubjectsQuery, useDeleteSubjectMutation, useUnassignTeacherMutation } from '@/store/api/subjectsApi';
import { useToast } from '@/hooks/use-toast';
import CreateSubjectModal from './CreateSubjectModal';
import EditSubjectModal from './EditSubjectModal';
import AssignTeacherModal from './AssignTeacherModal';
import SubjectDetailsModal from './SubjectDetailsModal';
import { Subject } from '@/types';

const SubjectManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  const { toast } = useToast();
  const { data: subjectsResponse, isLoading, refetch } = useGetSubjectsQuery({
    page: currentPage,
    limit: 10,
    search: searchTerm,
    department: selectedDepartment,
    grade: selectedGrade,
  });
  const [deleteSubject] = useDeleteSubjectMutation();
  const [unassignTeacher] = useUnassignTeacherMutation();

  const subjects = subjectsResponse?.data?.data || [];
  const totalPages = subjectsResponse?.data?.totalPages || 1;
  const totalSubjects = subjectsResponse?.data?.totalCount || 0;

  const handleEditSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    setEditModalOpen(true);
  };

  const handleViewSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    setDetailsModalOpen(true);
  };

  const handleAssignTeacher = (subject: Subject) => {
    setSelectedSubject(subject);
    setAssignModalOpen(true);
  };

  const handleUnassignTeacher = async (subjectId: string) => {
    try {
      await unassignTeacher(subjectId).unwrap();
      toast({
        title: "Teacher Unassigned",
        description: "Teacher has been successfully unassigned from the subject.",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to unassign teacher. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSubject = async (subjectId: string) => {
    try {
      await deleteSubject(subjectId).unwrap();
      toast({
        title: "Subject Deleted",
        description: "Subject has been successfully deleted.",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete subject. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'core':
        return <Badge className="bg-primary/10 text-primary">Core</Badge>;
      case 'elective':
        return <Badge className="bg-info/10 text-info">Elective</Badge>;
      case 'practical':
        return <Badge className="bg-warning/10 text-warning">Practical</Badge>;
      case 'theory':
        return <Badge variant="secondary">Theory</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const departments = ['Mathematics', 'Science', 'English', 'Computer Science', 'History', 'Geography'];
  const grades = ['9', '10', '11', '12'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient-primary">Subject Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage subjects, assignments, and teacher allocations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button onClick={() => setCreateModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Subject
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="kpi-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Subjects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubjects}</div>
            <div className="text-sm text-muted-foreground">Across all departments</div>
          </CardContent>
        </Card>

        <Card className="kpi-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Assigned Teachers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {subjects.filter(s => s.teacherId).length}
            </div>
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
            <div className="text-2xl font-bold text-warning">
              {subjects.filter(s => !s.teacherId).length}
            </div>
            <div className="text-sm text-muted-foreground">Need teacher assignment</div>
          </CardContent>
        </Card>

        <Card className="kpi-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Departments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departments.length}</div>
            <div className="text-sm text-muted-foreground">Active departments</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Search & Filter Subjects</CardTitle>
          <CardDescription>Find subjects by name, code, department, or teacher</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by subject name, code, or teacher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedGrade} onValueChange={setSelectedGrade}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                {grades.map(grade => (
                  <SelectItem key={grade} value={grade}>Grade {grade}</SelectItem>
                ))}
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
            {isLoading ? 'Loading...' : `Showing ${subjects.length} of ${totalSubjects} subjects`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading subjects...</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjects.map((subject) => (
                  <TableRow key={subject.id}>
                    <TableCell className="font-medium">{subject.code}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{subject.name}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-48">
                          {subject.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{subject.department}</TableCell>
                    <TableCell>{getTypeBadge(subject.type)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">Grade {subject.grade}</Badge>
                    </TableCell>
                    <TableCell>{subject.credits}</TableCell>
                    <TableCell>
                      {subject.teacherName ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-primary-foreground text-xs font-medium">
                              {subject.teacherName.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <span className="text-sm">{subject.teacherName}</span>
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          Unassigned
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewSubject(subject)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditSubject(subject)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          {subject.teacherId ? (
                            <DropdownMenuItem onClick={() => handleUnassignTeacher(subject.id)}>
                              <UserMinus className="mr-2 h-4 w-4" />
                              Unassign Teacher
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleAssignTeacher(subject)}>
                              <UserPlus className="mr-2 h-4 w-4" />
                              Assign Teacher
                            </DropdownMenuItem>
                          )}
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
                                <AlertDialogTitle>Delete Subject</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete {subject.name}? 
                                  This action cannot be undone and will affect all related data.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteSubject(subject.id)}
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

          {subjects.length === 0 && !isLoading && (
            <div className="text-center py-8">
              <div className="text-muted-foreground mb-2">No subjects found</div>
              <div className="text-sm text-muted-foreground">
                Try adjusting your search terms or filters
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateSubjectModal 
        open={createModalOpen} 
        onOpenChange={setCreateModalOpen}
        onSuccess={() => refetch()}
      />
      
      {selectedSubject && (
        <>
          <EditSubjectModal
            open={editModalOpen}
            onOpenChange={setEditModalOpen}
            subject={selectedSubject}
            onSuccess={() => {
              refetch();
              setSelectedSubject(null);
            }}
          />
          <AssignTeacherModal
            open={assignModalOpen}
            onOpenChange={setAssignModalOpen}
            subject={selectedSubject}
            onSuccess={() => {
              refetch();
              setSelectedSubject(null);
            }}
          />
          <SubjectDetailsModal
            open={detailsModalOpen}
            onOpenChange={setDetailsModalOpen}
            subject={selectedSubject}
          />
        </>
      )}
    </div>
  );
};

export default SubjectManagement;