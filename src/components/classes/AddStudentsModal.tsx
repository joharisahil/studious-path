import { useState, useEffect } from 'react';
import { Search, Users, Check, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGetStudentsQuery } from '@/store/api/studentsApi';
import { useGetClassQuery, useAddStudentsToClassMutation } from '@/store/api/classesApi';
import { toast } from 'sonner';
import { Student } from '@/types';

interface AddStudentsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string | null;
}

export const AddStudentsModal = ({ open, onOpenChange, classId }: AddStudentsModalProps) => {
  const [addStudentsToClass, { isLoading: isAdding }] = useAddStudentsToClassMutation();
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: studentsData, isLoading } = useGetStudentsQuery({
    page: currentPage,
    limit: 20,
    search: searchTerm,
  });

  const { data: classData } = useGetClassQuery(classId || '', {
    skip: !classId,
  });

  const students = studentsData?.data?.data || [];
  const totalPages = studentsData?.data?.totalPages || 1;
  const classInfo = classData?.data;
  const enrolledStudentIds = classInfo?.students || [];

  // Filter students not already in class and by grade if selected
  const availableStudents = students.filter(student => {
    const notEnrolled = !enrolledStudentIds.includes(student.id);
    const matchesGrade = !gradeFilter || student.grade === gradeFilter;
    return notEnrolled && matchesGrade;
  });

  const handleStudentSelect = (studentId: string, selected: boolean) => {
    if (selected) {
      setSelectedStudents(prev => [...prev, studentId]);
    } else {
      setSelectedStudents(prev => prev.filter(id => id !== studentId));
    }
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === availableStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(availableStudents.map(s => s.id));
    }
  };

  const handleAddStudents = async () => {
    if (!classId || selectedStudents.length === 0) return;

    try {
      const result = await addStudentsToClass({
        classId,
        studentIds: selectedStudents,
      }).unwrap();

      toast.success(result.message);
      setSelectedStudents([]);
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to add students to class');
    }
  };

  const resetModal = () => {
    setSelectedStudents([]);
    setSearchTerm('');
    setGradeFilter('');
    setCurrentPage(1);
  };

  useEffect(() => {
    if (!open) {
      resetModal();
    }
  }, [open]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'graduated':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'suspended':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Add Students to Class</DialogTitle>
          <DialogDescription>
            Select students to add to {classInfo?.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Class Info */}
          {classInfo && (
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{classInfo.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Current: {classInfo.currentStrength}/{classInfo.maxCapacity} students
                    </p>
                  </div>
                  <Badge className={getStatusColor(classInfo.status)}>
                    {classInfo.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={gradeFilter} onValueChange={setGradeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Grades</SelectItem>
                <SelectItem value="9">Grade 9</SelectItem>
                <SelectItem value="10">Grade 10</SelectItem>
                <SelectItem value="11">Grade 11</SelectItem>
                <SelectItem value="12">Grade 12</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Selection Summary */}
          {selectedStudents.length > 0 && (
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">
                      {selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''} selected
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedStudents([])}
                  >
                    Clear Selection
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Students List */}
          <Card>
            <CardContent className="pt-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : availableStudents.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No available students</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || gradeFilter 
                      ? 'No students match your search criteria.'
                      : 'All students are already enrolled in this class.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Select All */}
                  <div className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="select-all"
                        checked={
                          selectedStudents.length === availableStudents.length &&
                          availableStudents.length > 0
                        }
                        onCheckedChange={handleSelectAll}
                      />
                      <label htmlFor="select-all" className="text-sm font-medium">
                        Select All ({availableStudents.length})
                      </label>
                    </div>
                  </div>

                  {/* Student List */}
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {availableStudents.map((student) => (
                      <div key={student.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent">
                        <Checkbox
                          id={student.id}
                          checked={selectedStudents.includes(student.id)}
                          onCheckedChange={(checked) => 
                            handleStudentSelect(student.id, checked as boolean)
                          }
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">
                                {student.firstName} {student.lastName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {student.studentId} • {student.email}
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge variant="outline" className="mb-1">
                                Grade {student.grade}-{student.section}
                              </Badge>
                              <p className="text-sm text-muted-foreground">
                                {student.status}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t pt-2">
                      <div className="text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(currentPage - 1)}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage(currentPage + 1)}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddStudents}
              disabled={selectedStudents.length === 0 || isAdding}
            >
              <Plus className="w-4 h-4 mr-2" />
              {isAdding 
                ? 'Adding...' 
                : `Add ${selectedStudents.length} Student${selectedStudents.length !== 1 ? 's' : ''}`
              }
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};