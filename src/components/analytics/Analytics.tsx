import { useState } from 'react';
import { BarChart3, PieChart, TrendingUp, Users, GraduationCap, BookOpen, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart as RechartsPieChart, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState<string>('6months');
  const [category, setCategory] = useState<string>('all');

  // Mock data for charts
  const enrollmentData = [
    { month: 'Jan', students: 1180, teachers: 85 },
    { month: 'Feb', students: 1195, teachers: 86 },
    { month: 'Mar', students: 1210, teachers: 88 },
    { month: 'Apr', students: 1225, teachers: 89 },
    { month: 'May', students: 1240, teachers: 89 },
    { month: 'Jun', students: 1247, teachers: 89 },
  ];

  const gradeDistribution = [
    { grade: 'Grade 9', students: 320, color: 'hsl(var(--primary))' },
    { grade: 'Grade 10', students: 298, color: 'hsl(var(--secondary))' },
    { grade: 'Grade 11', students: 315, color: 'hsl(var(--accent))' },
    { grade: 'Grade 12', students: 314, color: 'hsl(var(--muted))' },
  ];

  const attendanceData = [
    { month: 'Jan', attendance: 92.5 },
    { month: 'Feb', attendance: 94.2 },
    { month: 'Mar', attendance: 91.8 },
    { month: 'Apr', attendance: 93.6 },
    { month: 'May', attendance: 94.8 },
    { month: 'Jun', attendance: 94.2 },
  ];

  const subjectPerformance = [
    { subject: 'Mathematics', avgScore: 78.5, totalStudents: 1247 },
    { subject: 'English', avgScore: 82.3, totalStudents: 1247 },
    { subject: 'Science', avgScore: 75.8, totalStudents: 1247 },
    { subject: 'History', avgScore: 79.2, totalStudents: 1247 },
    { subject: 'Geography', avgScore: 76.9, totalStudents: 1247 },
  ];

  const kpiData = {
    totalStudents: 1247,
    totalTeachers: 89,
    totalCourses: 156,
    avgAttendance: 94.2,
    studentGrowth: 5.7,
    teacherRetention: 96.5,
    courseCompletion: 87.3,
    avgGrade: 78.9,
  };

  const chartConfig = {
    students: {
      label: "Students",
      color: "hsl(var(--primary))",
    },
    teachers: {
      label: "Teachers", 
      color: "hsl(var(--secondary))",
    },
    attendance: {
      label: "Attendance %",
      color: "hsl(var(--accent))",
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient-primary">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive insights and performance metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Export Charts
          </Button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="kpi-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Student Growth
            </CardTitle>
            <Users className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{kpiData.studentGrowth}%</div>
            <div className="flex items-center text-sm text-success">
              <TrendingUp className="w-4 h-4 mr-1" />
              {kpiData.totalStudents} total students
            </div>
          </CardContent>
        </Card>

        <Card className="kpi-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Teacher Retention
            </CardTitle>
            <GraduationCap className="w-5 h-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.teacherRetention}%</div>
            <div className="text-sm text-muted-foreground">
              {kpiData.totalTeachers} active teachers
            </div>
          </CardContent>
        </Card>

        <Card className="kpi-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Course Completion
            </CardTitle>
            <BookOpen className="w-5 h-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.courseCompletion}%</div>
            <div className="text-sm text-muted-foreground">
              {kpiData.totalCourses} active courses
            </div>
          </CardContent>
        </Card>

        <Card className="kpi-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Grade
            </CardTitle>
            <TrendingUp className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.avgGrade}%</div>
            <div className="text-sm text-success">
              +2.3% from last semester
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrollment Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Enrollment Trends</CardTitle>
            <CardDescription>Student and teacher growth over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-80">
              <BarChart data={enrollmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="students" fill="var(--color-students)" />
                <Bar dataKey="teachers" fill="var(--color-teachers)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Grade Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Grade Distribution</CardTitle>
            <CardDescription>Student distribution across grade levels</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-80">
              <RechartsPieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <RechartsPieChart data={gradeDistribution} cx="50%" cy="50%" outerRadius={80}>
                  {gradeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </RechartsPieChart>
              </RechartsPieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Attendance Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Attendance Trends</CardTitle>
            <CardDescription>Monthly attendance percentage</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-80">
              <LineChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[85, 100]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="attendance" 
                  stroke="var(--color-attendance)" 
                  strokeWidth={2}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Subject Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Subject Performance</CardTitle>
            <CardDescription>Average scores by subject</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {subjectPerformance.map((subject) => (
              <div key={subject.subject} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{subject.subject}</span>
                  <Badge variant="secondary">{subject.avgScore}%</Badge>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${subject.avgScore}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  {subject.totalStudents} students enrolled
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="stat-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Peak Performance</CardTitle>
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-success">Grade 10-A</div>
              <p className="text-sm text-muted-foreground">
                Highest average score: 86.7%
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Most Popular Subject</CardTitle>
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">English</div>
              <p className="text-sm text-muted-foreground">
                82.3% average score across all grades
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Best Attendance</CardTitle>
              <Calendar className="w-5 h-5 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">May 2024</div>
              <p className="text-sm text-muted-foreground">
                94.8% attendance rate
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;