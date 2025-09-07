import { useState } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Download,
  MoreVertical,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
} from '@/components/ui/alert-dialog';
import {
  useGetTeachersQuery,
  useDeleteTeacherMutation,
} from '@/store/api/teachersApi';
import { useToast } from '@/hooks/use-toast';
import CreateTeacherModal from './CreateTeacherModal';
import EditTeacherModal from './EditTeacherModal';
import TeacherDetailsModal from './TeacherDetailsModal';
import { Teacher, TeacherFormData } from '@/types';

const TeachersManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] =
    useState<TeacherFormData | null>(null);

  const { toast } = useToast();
  const { data: teachersResponse, isLoading, refetch } = useGetTeachersQuery({
    page: currentPage,
    limit: 10,
    search: searchTerm,
  });
  const [deleteTeacher] = useDeleteTeacherMutation();

  const teachers = teachersResponse?.data?.data || [];
  const totalPages = teachersResponse?.data?.totalPages || 1;
  const totalTeachers = teachersResponse?.data?.totalCount || 0;

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
      await deleteTeacher(teacherId).unwrap();
      toast({
        title: 'Teacher Deleted',
        description: 'Teacher has been successfully deleted.',
      });
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete teacher. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const filteredTeachers = teachers.filter((teacher: TeacherFormData) => {
    const matchesStatus =
      selectedStatus === 'all' || teacher.status === selectedStatus;
    return matchesStatus;
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
            Manage teacher profiles, departments, and employment status
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button onClick={() => setCreateModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Teacher
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Search & Filter Teachers</CardTitle>
          <CardDescription>Find teachers by name, ID, or status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by name, email, or teacher ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
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
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Teachers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Teachers List</CardTitle>
          <CardDescription>
            {isLoading
              ? 'Loading...'
              : `Showing ${filteredTeachers.length} of ${totalTeachers} teachers`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading teachers...</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Teacher ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeachers.map((teacher: TeacherFormData) => (
                  <TableRow key={teacher.id}>
                    <TableCell className="font-medium">
                      {teacher.teacherId}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-primary-foreground text-xs font-medium">
                            {teacher.firstName[0]}
                            {teacher.lastName[0]}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">
                            {teacher.firstName} {teacher.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {teacher.department || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{teacher.email}</TableCell>
                    <TableCell>{teacher.department || '-'}</TableCell>
                    <TableCell className="text-sm">{teacher.status}</TableCell>
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
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEditTeacher(teacher)}
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
                                  Delete Teacher
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete{' '}
                                  {teacher.firstName} {teacher.lastName}? This
                                  action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDeleteTeacher(teacher.id!)
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

          {filteredTeachers.length === 0 && !isLoading && (
            <div className="text-center py-8">
              <div className="text-muted-foreground mb-2">
                No teachers found
              </div>
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
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateTeacherModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSuccess={() => refetch()}
      />

      {selectedTeacher && (
        <>
          <EditTeacherModal
            open={editModalOpen}
            onOpenChange={setEditModalOpen}
            teacher={selectedTeacher}
            onSuccess={() => {
              refetch();
              setSelectedTeacher(null);
            }}
          />
          {/* <TeacherDetailsModal
            open={detailsModalOpen}
            onOpenChange={setDetailsModalOpen}
            teacher={selectedTeacher}
          /> */}
        </>
      )}
    </div>
  );
};

export default TeachersManagement;
