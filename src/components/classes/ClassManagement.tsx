import { useState, useEffect } from "react";
import {
  Plus,
  Upload,
  Users,
  Search,
  Filter,
  Download,
  UserPlus,
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
import { CreateClassModal } from "./CreateClassModal";
import { UploadStudentsModal } from "./UploadStudentsModal";
import { CreateStudentForm } from "@/components/students/CreateStudentForm";
import { CreateStudentModal } from "../students";
import  {TestUploadModal} from "@/components/classes/TestUploadModal";

export const ClassManagement = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [getAllClassList, setGetAllClassList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadMode, setUploadMode] = useState<"upload" | "test">("upload");
  const [showTestModal, setShowTestModal] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterGrade, setFilterGrade] = useState("");
  const [filterSection, setFilterSection] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);

  // Create Student modal open state
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Session dropdowns
  const [fromYear, setFromYear] = useState("2025");
  const [toYear, setToYear] = useState("26");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalResults: 0,
  });

  // Fetch classes
  const fetchClasses = async (page = 1) => {
    try {
      setIsLoading(true);
      const {
        classes,
        pagination: pageInfo,
        data,
      } = await getAllClasses(page, pagination.limit);
      setGetAllClassList(data);
      setClasses(classes);
      setPagination(pageInfo);
    } catch (err) {
      console.error("Failed to fetch classes:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses(pagination.page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page]);

  // handle pagination change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  const totalStudents = classes.reduce(
    (sum, cls) => sum + (cls.studentCount || 0),
    0
  );
  const avgClassSize =
    classes.length > 0 ? Math.round(totalStudents / classes.length) : 0;

  const handleUploadStudents = (classId: string) => {
    setSelectedClass(classId);
    setShowUploadModal(true);
  };

  // OPEN create student modal for a particular class
  const handleAddStudent = (classId: string) => {
    setSelectedClass(classId);
    setCreateModalOpen(true);
  };

  //test excel button
  const handleTestExcel = (classId: string) => {
    setSelectedClass(classId);
    setShowUploadModal(true);
    setUploadMode("test");
  };

  // Filter classes
  const filteredClasses =
    filterGrade || filterSection || searchTerm
      ? getAllClassList.filter(
          (cls) =>
            (!filterGrade || cls.grade === filterGrade) &&
            (!filterSection || cls.section === filterSection) &&
            `${cls.grade}${cls.section}`
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
        )
      : classes;

  // Get unique grades
  const grades = Array.from(new Set(getAllClassList.map((cls) => cls.grade)));

  // Get sections for selected grade
  const sections = filterGrade
    ? Array.from(
        new Set(
          getAllClassList
            .filter((cls) => cls.grade === filterGrade)
            .map((cls) => cls.section)
        )
      )
    : [];

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

      {/* Modern KPI Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Total Classes */}
        <Card className="rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition duration-300">
          <CardContent className="flex flex-col items-center justify-center text-center py-6">
            <div className="bg-indigo-100 rounded-full p-3 mb-3">
              <Users className="h-6 w-6 text-indigo-600" />
            </div>
            <CardTitle className="text-sm font-semibold text-gray-600 mb-1">
              Total Classes
            </CardTitle>
            <div className="text-4xl font-extrabold text-indigo-600">
              {classes.length}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Active classes this year
            </p>
          </CardContent>
        </Card>

        {/* Total Students */}
        <Card className="rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition duration-300">
          <CardContent className="flex flex-col items-center justify-center text-center py-6">
            <div className="bg-green-100 rounded-full p-3 mb-3">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-sm font-semibold text-gray-600 mb-1">
              Total Students
            </CardTitle>
            <div className="text-4xl font-extrabold text-green-600">
              {totalStudents}
            </div>
            <p className="text-xs text-gray-400 mt-1">Students enrolled</p>
          </CardContent>
        </Card>

        {/* Avg Class Size */}
        <Card className="rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition duration-300">
          <CardContent className="flex flex-col items-center justify-center text-center py-6">
            <div className="bg-purple-100 rounded-full p-3 mb-3">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <CardTitle className="text-sm font-semibold text-gray-600 mb-1">
              Avg Class Size
            </CardTitle>
            <div className="text-4xl font-extrabold text-purple-600">
              {avgClassSize}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Average students per class
            </p>
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
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search classes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Grade */}
          <Select
            value={filterGrade}
            onValueChange={(val) => {
              setFilterGrade(val);
              setFilterSection("");
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Grade" />
            </SelectTrigger>
            <SelectContent>
              {grades.map((grade) => (
                <SelectItem key={grade} value={grade}>
                  Grade {grade}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Section */}
          <Select
            value={filterSection}
            onValueChange={setFilterSection}
            disabled={!filterGrade}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Section" />
            </SelectTrigger>
            <SelectContent>
              {sections.map((section) => (
                <SelectItem key={section} value={section}>
                  {section}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Session */}
      <Card>
        <CardHeader>
          <CardTitle>Academic Session</CardTitle>
          <CardDescription>Select session for student uploads</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <Select value={fromYear} onValueChange={setFromYear}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="From Year" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 10 }).map((_, i) => {
                const year = 2020 + i;
                return (
                  <SelectItem key={year} value={String(year)}>
                    {year}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          <Select value={toYear} onValueChange={setToYear}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="To Year" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 10 }).map((_, i) => {
                const year = 21 + i;
                return (
                  <SelectItem key={year} value={String(year)}>
                    {year}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class Name</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Academic Year</TableHead>
                  <TableHead>Class Teacher</TableHead>
                  <TableHead>Students</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClasses
                  .slice()
                  .sort((a, b) => {
                    const gradeA = parseInt(a.grade) || 0;
                    const gradeB = parseInt(b.grade) || 0;
                    if (gradeA !== gradeB) return gradeA - gradeB;
                    return a.section.localeCompare(b.section);
                  })
                  .map((cls) => {
                    const studentCount =
                      cls.studentCount ?? cls.students?.length ?? 0; // <-- fix student count
                    return (
                      <TableRow key={cls._id}>
                        <TableCell className="font-medium">
                          {cls.grade}-{cls.section}
                        </TableCell>
                        <TableCell>{cls.grade}</TableCell>
                        <TableCell>
                          {fromYear}-{toYear}
                        </TableCell>
                        <TableCell>
                          <span className="text-muted-foreground">
                            Not assigned
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="text-sm">{studentCount}/50</div>
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-primary rounded-full h-2"
                                style={{
                                  width: `${(studentCount / 50) * 100}%`,
                                }}
                              />
                            </div>

                            {/* Add Student button - opens CreateStudentModal */}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAddStudent(cls._id)}
                              className="ml-auto"
                            >
                              <UserPlus className="w-4 h-4 mr-2" />
                              Add Student
                            </Button>
                            {/* test excel button */}
                            <Button
  size="sm"
  variant="outline"
  disabled={!fromYear || !toYear}
  onClick={() => {
    setSelectedClass(cls._id);
    setShowTestModal(true);
  }}
  className="ml-auto"
>
  <Upload className="w-4 h-4 mr-2" />
  Test Excel
</Button>


                            {/* Upload Students */}
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={!fromYear || !toYear}
                              onClick={() => handleUploadStudents(cls._id)}
                              className="ml-2"
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Upload Students
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page === 1}
            onClick={() => handlePageChange(pagination.page - 1)}
          >
            Previous
          </Button>
          <div className="text-sm text-muted-foreground">
            Page <span className="font-medium">{pagination.page}</span> of{" "}
            <span className="font-medium">{pagination.totalPages}</span> | Total{" "}
            <span className="font-medium">{pagination.totalResults}</span>{" "}
            classes
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page === pagination.totalPages}
            onClick={() => handlePageChange(pagination.page + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Modals */}
      <CreateClassModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
      />
      <UploadStudentsModal
        open={showUploadModal}
        onOpenChange={setShowUploadModal}
        classId={selectedClass}
        session={`${fromYear}-${toYear}`}
        
      />

      {/* Create Student Modal */}
      <CreateStudentModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        classId={selectedClass}
        onSuccess={() => fetchClasses(pagination.page)}
      />
      {/*test upload modal */}
      <TestUploadModal
  open={showTestModal}
  onOpenChange={setShowTestModal}
  classId={selectedClass}
  session={`${fromYear}-${toYear}`}
/>

    </div>
  );
};
