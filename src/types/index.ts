// Core Types for ERP/LMS System

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'admin' | 'teacher' | 'student' | 'parent';

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  role: UserRole;
}

export interface RegisterData extends LoginCredentials {
  // firstName: string;
  // lastName: string;
  confirmPassword: string;
}

// Student Management
export interface Student {
  id: string;
  userId: string;
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth: string;
  address: string;
  parentId?: string;
  enrollmentDate: string;
  status: 'active' | 'inactive' | 'graduated' | 'suspended';
  grade: string;
  section: string;
  avatar?: string;
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  academicHistory: AcademicRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface AcademicRecord {
  year: string;
  grade: string;
  gpa: number;
  subjects: SubjectGrade[];
}

export interface SubjectGrade {
  subjectId: string;
  subjectName: string;
  grade: string;
  marks: number;
  totalMarks: number;
}

// Staff/Teacher Management  
export interface Staff {
  id: string;
  userId: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  dateOfJoining: string;
  salary: number;
  subjects: string[];
  qualifications: string[];
  address: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'terminated';
  createdAt: string;
  updatedAt: string;
}

// Course Management
export interface Course {
  id: string;
  name: string;
  code: string;
  description: string;
  grade: string;
  subject: string;
  teacherId: string;
  teacherName: string;
  duration: string;
  credits: number;
  syllabus: string[];
  resources: CourseResource[];
  enrolledStudents: string[];
  schedule: ClassSchedule[];
  status: 'active' | 'inactive' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface CourseResource {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'link' | 'document';
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface ClassSchedule {
  id: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string;
  endTime: string;
  room: string;
}


// Teacher Management
export interface Teacher {
  id: string;
  userId: string;
  teacherId: string; // like studentId
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  department: string;
  subjectSpecialization: string[];
  qualifications: string[];
  yearsOfExperience: number;
  dateOfJoining: string;
  position: string;
  salary: number;
  avatar?: string;
  status: 'active' | 'inactive' | 'terminated' | 'retired';
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  courses: string[]; // list of courseIds they teach
  achievements?: string[];
  previousInstitutions?: string[];
  createdAt: string;
  updatedAt: string;
}


// Attendance Management
export interface AttendanceRecord {
  id: string;
  studentId: string;
  courseId: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  markedBy: string;
  notes?: string;
  createdAt: string;
}

export interface AttendanceStats {
  totalClasses: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendancePercentage: number;
}

// Assignment & Exam Management
export interface Assignment {
  id: string;
  title: string;
  description: string;
  courseId: string;
  courseName: string;
  teacherId: string;
  dueDate: string;
  totalMarks: number;
  type: 'assignment' | 'quiz' | 'project' | 'exam';
  instructions: string;
  resources: string[];
  submissions: AssignmentSubmission[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  submittedAt: string;
  files: string[];
  notes?: string;
  grade?: number;
  feedback?: string;
  status: 'submitted' | 'graded' | 'late' | 'missing';
}

export interface Exam {
  id: string;
  title: string;
  courseId: string;
  courseName: string;
  teacherId: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number; // minutes
  totalMarks: number;
  passingMarks: number;
  room: string;
  instructions: string;
  type: 'midterm' | 'final' | 'quiz' | 'practical';
  results: ExamResult[];
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface ExamResult {
  id: string;
  examId: string;
  studentId: string;
  studentName: string;
  marks: number;
  grade: string;
  feedback?: string;
  submittedAt?: string;
}

// Fee Management
export interface FeeStructure {
  id: string;
  grade: string;
  academicYear: string;
  tuitionFee: number;
  labFee: number;
  libraryFee: number;
  transportFee?: number;
  hostelFee?: number;
  otherFees: { [key: string]: number };
  totalFee: number;
  paymentSchedule: PaymentSchedule[];
}

export interface PaymentSchedule {
  installment: number;
  dueDate: string;
  amount: number;
  description: string;
}

export interface FeeRecord {
  id: string;
  studentId: string;
  studentName: string;
  academicYear: string;
  grade: string;
  totalFee: number;
  paidAmount: number;
  dueAmount: number;
  collectionPeriod: 'monthly' | 'quarterly' | 'yearly';
  nextDueDate?: string;
  payments: Payment[];
  status: 'paid' | 'partial' | 'overdue' | 'pending';
  lastPaymentDate?: string;
}

export interface Payment {
  id: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'online';
  transactionId?: string;
  receiptNumber: string;
  collectedBy: string;
  notes?: string;
}

// Communication
export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  targetAudience: UserRole[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  attachments: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  receiverId: string;
  receiverName: string;
  receiverRole: UserRole;
  subject: string;
  content: string;
  attachments: string[];
  isRead: boolean;
  isStarred: boolean;
  threadId?: string;
  sentAt: string;
}

// Dashboard KPIs
export interface DashboardKPIs {
  admin: {
    totalStudents: number;
    totalTeachers: number;
    totalCourses: number;
    recentEnrollments: number;
    attendanceRate: number;
    feeCollection: {
      collected: number;
      pending: number;
      overdue: number;
    };
    recentActivities: Activity[];
  };
  teacher: {
    totalCourses: number;
    totalStudents: number;
    pendingAssignments: number;
    upcomingClasses: number;
    averageAttendance: number;
    recentSubmissions: AssignmentSubmission[];
    upcomingExams: Exam[];
  };
  student: {
    enrolledCourses: number;
    completedAssignments: number;
    pendingAssignments: number;
    attendanceRate: number;
    upcomingExams: Exam[];
    recentGrades: ExamResult[];
    feeStatus: {
      totalDue: number;
      nextDueDate: string;
    };
  };
  parent: {
    children: Student[];
    overallAttendance: number;
    pendingFees: number;
    upcomingExams: Exam[];
    recentGrades: ExamResult[];
    unreadMessages: number;
  };
}

export interface Activity {
  id: string;
  type: 'enrollment' | 'payment' | 'grade' | 'attendance' | 'assignment';
  description: string;
  userId: string;
  userName: string;
  timestamp: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form Types
export interface StudentFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  parentEmail?: string;
  grade: string;
  section: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
}

export interface TeacherFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  subject: string;
  qualification: string;
  yearsOfExperience: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
}

export interface CourseFormData {
  name: string;
  code: string;
  description: string;
  grade: string;
  subject: string;
  teacherId: string;
  duration: string;
  credits: number;
}

export interface AssignmentFormData {
  title: string;
  description: string;
  courseId: string;
  dueDate: string;
  totalMarks: number;
  type: Assignment['type'];
  instructions: string;
}