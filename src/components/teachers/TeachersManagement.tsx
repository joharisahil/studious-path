import { useState, useEffect } from 'react';
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
import { useToast } from '@/hooks/use-toast';

import CreateTeacherModal from './CreateTeacherModal';
import EditTeacherModal from './EditTeacherModal';
import TeacherDetailsModal from './TeacherDetailsModal'; // ✅ bring back details modal
import { TeacherFormData } from '@/types';
import { getAllTeachers } from '@/services/GetTotalTeachers';

const TeachersManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] =
    useState<TeacherFormData | null>(null);
  const [teachers, setTeachers] = useState<TeacherFormData[]>([]);
  const [loading, setLoading] = useState(true);

  const { toast } = useToast();

  // 🔹 Fetch teachers
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoading(true);
        const data = await getAllTeachers();
        setTeachers(data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch teachers.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

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
      // 👉 Add delete API later
      setTeachers((prev) => prev.filter((t) => t.id !== teacherId));
      toast({
        title: 'Teacher Deleted',
        description: 'Teacher has been successfully deleted.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete teacher. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // 🔎 Search + Filter
  const filteredTeachers = teachers.filter((teacher: TeacherFormData) => {
    const matchesStatus =
      selectedStatus === 'all' || teacher.status === selectedStatus;

    const firstName = teacher.firstName || '';
    const lastName = teacher.lastName || '';
    const email = teacher.email || '';

    const matchesSearch =
      firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase());

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

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Search & Filter Teachers</CardTitle>
          <CardDescription>
            Find teachers by name, ID, or status
          </CardDescription>
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
            {loading
              ? 'Loading...'
              : `Showing ${filteredTeachers.length} of ${teachers.length} teachers`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
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
                      {teacher.registrationNumber}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-primary-foreground text-xs font-medium">
                            {(teacher.firstName?.[0] || '').toUpperCase()}
                            {(teacher.lastName?.[0] || '').toUpperCase()}
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
                                    handleDeleteTeacher(teacher.registrationNumber)
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

          {filteredTeachers.length === 0 && !loading && (
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

      {/* Modals */}
      <CreateTeacherModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSuccess={() => {
          getAllTeachers().then(setTeachers);
        }}
      />

      {selectedTeacher && (
        <>
          <EditTeacherModal
            open={editModalOpen}
            onOpenChange={setEditModalOpen}
            teacher={selectedTeacher}
            onSuccess={() => {
              getAllTeachers().then(setTeachers);
              setSelectedTeacher(null);
            }}
          />

          <TeacherDetailsModal
            open={detailsModalOpen}
            onOpenChange={setDetailsModalOpen}
            teacher={{
              ...selectedTeacher,
              id: selectedTeacher.id!,
              teacherId: selectedTeacher.teacherId || '',
              userId: selectedTeacher.userId || '',
              status: selectedTeacher.status || 'active',
              createdAt: selectedTeacher.createdAt || new Date().toISOString(),
              updatedAt: selectedTeacher.updatedAt || new Date().toISOString(),
            }}
          />
        </>
      )}
    </div>
  );
};

export default TeachersManagement;