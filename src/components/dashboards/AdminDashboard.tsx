import { Users, GraduationCap, BookOpen, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateStudentModal from '@/components/students/CreateStudentModal';
import { getAllStudents } from '@/services/StudentsApi.ts';
import { getAllTeachers } from '@/services/TeachersApi';


const AdminDashboard = () => {
  const [createStudentModalOpen, setCreateStudentModalOpen] = useState(false);
  const navigate = useNavigate();

  const [studentsCount, setStudentsCount] = useState<number>(0); // ✅ state for total students
    const [teachersCount, setTeachersCount] = useState<number>(0);

  // Fetch students on mount
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const students = await getAllStudents();
        setStudentsCount(students.length); // ✅ update count
      } catch (error) {
        console.error("Failed to fetch students", error);
      }
    };

    fetchStudents();
  }, []);

   // Fetch teachers on mount
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const teachers = await getAllTeachers();
        setTeachersCount(teachers.length); // ✅ update teachers count
      } catch (error) {
        console.error('Failed to fetch teachers', error);
      }
    };

    fetchTeachers();
  }, []);

 

  // Mock KPI data
  const kpiData = {
    totalStudents: 1247,
    totalTeachers: 89,
    totalCourses: 156,
    recentEnrollments: 23,
    attendanceRate: 94.2,
    feeCollection: {
      collected: 2450000,
      pending: 350000,
      overdue: 75000,
    },
  };

  const recentActivities = [
    {
      id: '1',
      type: 'enrollment',
      description: 'New student Sarah Johnson enrolled in Grade 10-A',
      timestamp: '2 hours ago',
    },
    {
      id: '2',
      type: 'payment',
      description: 'Fee payment received from Mike Davis - $1,500',
      timestamp: '3 hours ago',
    },
    {
      id: '3',
      type: 'grade',
      description: 'Mathematics exam results published for Grade 11-B',
      timestamp: '5 hours ago',
    },
    {
      id: '4',
      type: 'attendance',
      description: 'Daily attendance marked for all classes',
      timestamp: '1 day ago',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient-primary">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's an overview of your school management system.
          </p>
        </div>
        <Button className="gap-2">
          <Users className="w-4 h-4" />
          Generate Report
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="kpi-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Students
            </CardTitle>
            <Users className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentsCount.toLocaleString()}</div>
            <div className="flex items-center text-sm text-success">
              <TrendingUp className="w-4 h-4 mr-1" />
              +{kpiData.recentEnrollments} this month
            </div>
          </CardContent>
        </Card>

        <Card className="kpi-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Teachers
            </CardTitle>
            <GraduationCap className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teachersCount.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Active faculty members</div>
          </CardContent>
        </Card>

        <Card className="kpi-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Courses
            </CardTitle>
            <BookOpen className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.totalCourses}</div>
            <div className="text-sm text-muted-foreground">Across all grades</div>
          </CardContent>
        </Card>

        <Card className="kpi-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Attendance Rate
            </CardTitle>
            <TrendingUp className="w-5 h-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.attendanceRate}%</div>
            <div className="flex items-center text-sm text-success">
              <TrendingUp className="w-4 h-4 mr-1" />
              +2.1% from last month
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fee Collection Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="stat-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Fee Collection</CardTitle>
              <DollarSign className="w-5 h-5 text-success" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Collected</span>
                <span className="font-semibold text-success">
                  ${kpiData.feeCollection.collected.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Pending</span>
                <span className="font-semibold text-warning">
                  ${kpiData.feeCollection.pending.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Overdue</span>
                <span className="font-semibold text-destructive">
                  ${kpiData.feeCollection.overdue.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Recent Activities</CardTitle>
            <CardDescription>Latest updates and activities across the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {activity.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
          <CardDescription>Frequently used administrative functions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => setCreateStudentModalOpen(true)}
            >
              <Users className="w-6 h-6" />
              <span className="text-xs">Add Student</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <GraduationCap className="w-6 h-6" />
              <span className="text-xs">Add Teacher</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <BookOpen className="w-6 h-6" />
              <span className="text-xs">Create Course</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => navigate('/reports/fees')}
            >
              <DollarSign className="w-6 h-6" />
              <span className="text-xs">Fee Report</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => navigate('/analytics')}
            >
              <TrendingUp className="w-6 h-6" />
              <span className="text-xs">Analytics</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => navigate('/attendance')}
            >
              <Users className="w-6 h-6" />
              <span className="text-xs">Attendance</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <CreateStudentModal 
        open={createStudentModalOpen} 
        onOpenChange={setCreateStudentModalOpen} 
      />
    </div>
  );
};

export default AdminDashboard;
