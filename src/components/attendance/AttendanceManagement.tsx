import { useState } from 'react';
import { Calendar, Users, CheckCircle, XCircle, Clock, Search, Filter, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGetAttendanceRecordsQuery, useMarkAttendanceMutation, useGetAttendanceStatsQuery } from '@/store/api/attendanceApi';
import { useToast } from '@/hooks/use-toast';

const AttendanceManagement = () => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  const { toast } = useToast();
  const { data: attendanceResponse, isLoading } = useGetAttendanceRecordsQuery({});
  const { data: statsResponse } = useGetAttendanceStatsQuery({ studentId: '1' });
  const [markAttendance] = useMarkAttendanceMutation();

  // Mock data for demonstration
  const studentsForAttendance = [
    {
      id: '1',
      name: 'Sarah Johnson',
      studentId: 'STU001',
      grade: '10-A',
      status: null as 'present' | 'absent' | 'late' | 'excused' | null,
    },
    {
      id: '2',
      name: 'Mike Davis',
      studentId: 'STU002',
      grade: '10-A',
      status: null as 'present' | 'absent' | 'late' | 'excused' | null,
    },
    {
      id: '3',
      name: 'Emily Wilson',
      studentId: 'STU003',
      grade: '10-A',
      status: null as 'present' | 'absent' | 'late' | 'excused' | null,
    },
    {
      id: '4',
      name: 'John Smith',
      studentId: 'STU004',
      grade: '10-A',
      status: null as 'present' | 'absent' | 'late' | 'excused' | null,
    },
  ];

  const [attendanceMarking, setAttendanceMarking] = useState(studentsForAttendance);

  const attendanceStats = {
    todayPresent: 1156,
    todayAbsent: 91,
    totalStudents: 1247,
    attendanceRate: 92.7,
    onTimeRate: 89.3,
    lateArrivals: 48,
  };

  const recentAttendance = [
    {
      date: '2024-01-15',
      grade: '10-A',
      course: 'Mathematics',
      present: 28,
      absent: 2,
      late: 1,
      total: 31,
      rate: 93.5,
    },
    {
      date: '2024-01-15',
      grade: '11-B',
      course: 'English',
      present: 25,
      absent: 3,
      late: 0,
      total: 28,
      rate: 89.3,
    },
    {
      date: '2024-01-15',
      grade: '9-C',
      course: 'Science',
      present: 30,
      absent: 1,
      late: 2,
      total: 33,
      rate: 96.9,
    },
  ];

  const handleAttendanceChange = (studentId: string, status: 'present' | 'absent' | 'late' | 'excused') => {
    setAttendanceMarking(prev => 
      prev.map(student => 
        student.id === studentId ? { ...student, status } : student
      )
    );
  };

  const handleSubmitAttendance = async () => {
    const attendanceData = attendanceMarking
      .filter(student => student.status)
      .map(student => ({
        studentId: student.id,
        courseId: selectedCourse || '1',
        date: selectedDate,
        status: student.status!,
        markedBy: 'current-user',
      }));

    try {
      for (const record of attendanceData) {
        await markAttendance(record).unwrap();
      }
      
      toast({
        title: "Attendance Marked",
        description: `Successfully marked attendance for ${attendanceData.length} students.`,
      });
      
      // Reset form
      setAttendanceMarking(prev => prev.map(student => ({ ...student, status: null })));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark attendance. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'absent':
        return <XCircle className="w-4 h-4 text-destructive" />;
      case 'late':
        return <Clock className="w-4 h-4 text-warning" />;
      case 'excused':
        return <CheckCircle className="w-4 h-4 text-info" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string, rate?: number) => {
    switch (status) {
      case 'present':
        return <Badge className="bg-success/10 text-success">Present</Badge>;
      case 'absent':
        return <Badge variant="destructive">Absent</Badge>;
      case 'late':
        return <Badge className="bg-warning/10 text-warning">Late</Badge>;
      case 'excused':
        return <Badge className="bg-info/10 text-info">Excused</Badge>;
      default:
        if (rate !== undefined) {
          if (rate >= 95) return <Badge className="bg-success/10 text-success">Excellent</Badge>;
          if (rate >= 90) return <Badge className="bg-success/10 text-success">Good</Badge>;
          if (rate >= 80) return <Badge className="bg-warning/10 text-warning">Average</Badge>;
          return <Badge variant="destructive">Poor</Badge>;
        }
        return <Badge variant="secondary">-</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient-primary">Attendance Management</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage student attendance across all classes
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Today's Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="kpi-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today's Attendance
            </CardTitle>
            <Users className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceStats.attendanceRate}%</div>
            <div className="text-sm text-muted-foreground">
              {attendanceStats.todayPresent} of {attendanceStats.totalStudents} present
            </div>
          </CardContent>
        </Card>

        <Card className="kpi-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Present Students
            </CardTitle>
            <CheckCircle className="w-5 h-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{attendanceStats.todayPresent}</div>
            <div className="text-sm text-muted-foreground">
              On time rate: {attendanceStats.onTimeRate}%
            </div>
          </CardContent>
        </Card>

        <Card className="kpi-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Absent Students
            </CardTitle>
            <XCircle className="w-5 h-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{attendanceStats.todayAbsent}</div>
            <div className="text-sm text-muted-foreground">
              {((attendanceStats.todayAbsent / attendanceStats.totalStudents) * 100).toFixed(1)}% absence rate
            </div>
          </CardContent>
        </Card>

        <Card className="kpi-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Late Arrivals
            </CardTitle>
            <Clock className="w-5 h-5 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{attendanceStats.lateArrivals}</div>
            <div className="text-sm text-muted-foreground">
              {((attendanceStats.lateArrivals / attendanceStats.totalStudents) * 100).toFixed(1)}% late rate
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="mark" className="space-y-6">
        <TabsList>
          <TabsTrigger value="mark">Mark Attendance</TabsTrigger>
          <TabsTrigger value="records">Attendance Records</TabsTrigger>
        </TabsList>

        <TabsContent value="mark" className="space-y-6">
          {/* Attendance Marking Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Mark Attendance</CardTitle>
              <CardDescription>Select date, grade, and course to mark attendance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-48"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Grade</label>
                  <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Grades</SelectItem>
                      <SelectItem value="9">Grade 9</SelectItem>
                      <SelectItem value="10">Grade 10</SelectItem>
                      <SelectItem value="11">Grade 11</SelectItem>
                      <SelectItem value="12">Grade 12</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Course</label>
                  <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Courses</SelectItem>
                      <SelectItem value="1">Mathematics</SelectItem>
                      <SelectItem value="2">English</SelectItem>
                      <SelectItem value="3">Science</SelectItem>
                      <SelectItem value="4">History</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Student List for Attendance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Students - Grade 10-A</CardTitle>
              <CardDescription>Mark attendance for each student</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceMarking.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.studentId}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{student.grade}</TableCell>
                      <TableCell>
                        {student.status ? getStatusBadge(student.status) : <Badge variant="secondary">Not Marked</Badge>}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant={student.status === 'present' ? 'default' : 'outline'}
                            onClick={() => handleAttendanceChange(student.id, 'present')}
                            className="px-2"
                          >
                            <CheckCircle className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant={student.status === 'absent' ? 'destructive' : 'outline'}
                            onClick={() => handleAttendanceChange(student.id, 'absent')}
                            className="px-2"
                          >
                            <XCircle className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant={student.status === 'late' ? 'secondary' : 'outline'}
                            onClick={() => handleAttendanceChange(student.id, 'late')}
                            className="px-2"
                          >
                            <Clock className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              <div className="mt-4 flex justify-end">
                <Button 
                  onClick={handleSubmitAttendance}
                  disabled={!attendanceMarking.some(s => s.status)}
                  className="gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Submit Attendance
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="records" className="space-y-6">
          {/* Search and Filters */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={selectedGrade} onValueChange={setSelectedGrade}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                <SelectItem value="9">Grade 9</SelectItem>
                <SelectItem value="10">Grade 10</SelectItem>
                <SelectItem value="11">Grade 11</SelectItem>
                <SelectItem value="12">Grade 12</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Attendance Records Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Attendance Records</CardTitle>
              <CardDescription>Overview of attendance by class and date</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Present</TableHead>
                    <TableHead>Absent</TableHead>
                    <TableHead>Late</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentAttendance.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {new Date(record.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{record.grade}</TableCell>
                      <TableCell>{record.course}</TableCell>
                      <TableCell className="text-success">{record.present}</TableCell>
                      <TableCell className="text-destructive">{record.absent}</TableCell>
                      <TableCell className="text-warning">{record.late}</TableCell>
                      <TableCell>{record.total}</TableCell>
                      <TableCell>{getStatusBadge('rate', record.rate)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AttendanceManagement;