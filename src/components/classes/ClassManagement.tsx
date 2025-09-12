import { useState, useEffect } from "react";
import {
  Plus,
  Upload,
  Users,
  Search,
  Filter,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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

import { getAllClasses } from "@/services/ClassesApi";
import { getAllStudents } from "@/services/StudentsApi";
import { CreateClassModal } from "./CreateClassModal";
import { UploadStudentsModal } from "./UploadStudentsModal";
import { AddStudentsModal } from "./AddStudentsModal";

// ✅ Define Student type (or import from your types file)
interface Student {
  _id: string;
  name: string;
  classId: string;
  // add other fields if needed
}

export const ClassManagement = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [classStudents, setClassStudents] = useState<{ [key: string]: Student[] }>({});
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterGrade, setFilterGrade] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAddStudentsModal, setShowAddStudentsModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);

  // ✅ Fetch classes once on mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setIsLoading(true);
        const data = await getAllClasses();
        setClasses(data); // data is already array of classes
      } catch (err) {
        console.error("Failed to fetch classes:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClasses();
  }, []);

  // ✅ Fetch students per class after classes are loaded
useEffect(() => {
  const fetchStudentsPerClass = async () => {
    try {
      const students = await getAllStudents();

      // group students by class id
      const studentsMap: { [key: string]: any[] } = {};
      students.forEach((student) => {
        const classId = student.classId; // classId is already a string
        if (!classId) return; // skip if no classId
        if (!studentsMap[classId]) studentsMap[classId] = [];
        studentsMap[classId].push(student);
      });

      setClassStudents(studentsMap);
    } catch (err) {
      console.error("Failed to fetch students per class:", err);
    }
  };

  if (classes.length > 0) {
    fetchStudentsPerClass();
  }
}, [classes]);

  // ✅ Derived stats
  const totalStudents = Object.values(classStudents).reduce(
    (sum, students) => sum + (students?.length || 0),
    0
  );
  const avgClassSize =
    classes.length > 0 ? Math.round(totalStudents / classes.length) : 0;

  const getStatusColor = () =>
    "bg-green-100 text-green-800 border-green-200";

  const handleUploadStudents = (classId: string) => {
    setSelectedClass(classId);
    setShowUploadModal(true);
  };

  const handleAddStudents = (classId: string) => {
    setSelectedClass(classId);
    setShowAddStudentsModal(true);
  };

  // ✅ Filtered classes
  const filteredClasses = classes.filter(
    (cls) =>
      (!filterGrade || filterGrade === "all" || cls.grade === filterGrade) &&
      (cls.grade.includes(searchTerm) || cls.section.includes(searchTerm))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gradient-primary">
            Class Management
          </h1>
          <p className="text-muted-foreground">
            Manage classes and student enrollments
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button onClick={() => setShowCreateModal(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Class
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classes.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Class Size</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgClassSize}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" /> Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search classes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterGrade} onValueChange={setFilterGrade}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                {[1, 2, 3, 4].map((g) => (
                  <SelectItem key={g} value={String(g)}>
                    Grade {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Classes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Classes</CardTitle>
          <CardDescription>
            Manage all classes and their student enrollments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredClasses.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No classes found</h3>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4 mr-2" /> Create Class
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class Name</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Academic Year</TableHead>
                    <TableHead>Class Teacher</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClasses.map((cls) => (
                    <TableRow key={cls._id}>
                      <TableCell className="font-medium">
                        {cls.grade}-{cls.section}
                      </TableCell>
                      <TableCell>{cls.grade}</TableCell>
                      <TableCell>2025-26</TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">Not assigned</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
  <div className="text-sm">
    {classStudents[cls._id]?.length || 0}/30
  </div>
  <div className="w-16 bg-gray-200 rounded-full h-2">
    <div
      className="bg-primary rounded-full h-2"
      style={{
        width: `${((classStudents[cls._id]?.length || 0) / 30) * 100}%`,
      }}
    />
  </div>
</div>

                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor()}>active</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUploadStudents(cls._id)}
                          >
                            <Upload className="w-3 h-3 mr-1" /> Upload
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddStudents(cls._id)}
                          >
                            <Plus className="w-3 h-3 mr-1" /> Add
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <CreateClassModal open={showCreateModal} onOpenChange={setShowCreateModal} />
      <UploadStudentsModal
        open={showUploadModal}
        onOpenChange={setShowUploadModal}
        classId={selectedClass}
      />
      <AddStudentsModal
        open={showAddStudentsModal}
        onOpenChange={setShowAddStudentsModal}
        classId={selectedClass}
      />
    </div>
  );
};
