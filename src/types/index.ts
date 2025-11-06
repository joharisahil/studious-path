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

export type UserRole = "admin" | "teacher" | "student" | "parent";

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
  schoolName: string;
  planDays: number;
}

// Student Management
// types.ts

export interface Student {
  studentId: string;
  id: string;
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;

  // Guardian / Emergency Contact
  guardian?: Guardian;
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };

  // Father info
  fatherName?: string;
  fatherEmail?: string;
  fatherphone?: string; // kept lowercase to match DB
  fatherContact?: string;
  fatherOccupation?: string;

  // Mother info
  motherName?: string;
  motherEmail?: string;
  motherphone?: string;
  motherContact?: string;
  motherOccupation?: string;

  // Academic
  grade?: string;
  section?: string;
  classId?: string;
  registrationNumber?: string;
  rollNumber?: string;
  admissionDate?: string;
  enrollmentDate?: string;
  academicHistory?: any[];

  // Status
  status?: "active" | "inactive" | "graduated" | "suspended";

  // System fields
  userId?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
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
  status: "active" | "inactive" | "terminated";
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
  status: "active" | "inactive" | "completed";
  createdAt: string;
  updatedAt: string;
}

export interface CourseResource {
  id: string;
  title: string;
  type: "pdf" | "video" | "link" | "document";
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
  _id: string;
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
  status: "active" | "inactive" | "terminated" | "retired";
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
  status: "present" | "absent" | "late" | "excused";
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
  type: "assignment" | "quiz" | "project" | "exam";
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
  status: "submitted" | "graded" | "late" | "missing";
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
  type: "midterm" | "final" | "quiz" | "practical";
  results: ExamResult[];
  status: "scheduled" | "ongoing" | "completed" | "cancelled";
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
  collectionPeriod: "monthly" | "quarterly" | "yearly";
  nextDueDate?: string;
  payments: Payment[];
  status: "paid" | "partial" | "overdue" | "pending";
  lastPaymentDate?: string;
}

export interface Payment {
  regNo: any;
  session: any;
  className: any;
  studentName: any;
  student: any;
  registrationNumber: any;
  id: string;
  amount: number;
  paymentDate: string;
  paymentMethod: "Cash" | "Card" | "Bank Transfer" | "Online";
  transactionId?: string;
  receiptNumber: string;
  collectedBy: string;
  notes?: string;
}

export interface FeeReceipt {
  receiptNumber: string;
  studentName: string;
  className: string;
  paymentDate: string;
  academicYear: string;
  month: string;
  feeType: string;
  amount: number;
  paymentMethod: string;
  transactionId?: string;
  notes?: string;
  collectedBy: string;
}

// Communication
export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  targetAudience: UserRole[];
  priority: "low" | "medium" | "high" | "urgent";
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
  type: "enrollment" | "payment" | "grade" | "attendance" | "assignment";
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
export interface Guardian {
  name: string;
  phone: string;
  relation: string;
}

export interface StudentFormData {
  id?: string;
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string; // Make optional
  parentEmail?: string; // Add parentEmail
  grade?: string; // Make optional
  section?: string; // Make optional
  rollNumber?: string;
  admissionDate?: string;
  classId?: string;

  // Guardian info
  guardian?: Guardian; // Make optional for compatibility

  // Parent info (for compatibility with EditStudentModal)
  fatherName?: string;
  fatherEmail?: string;
  fatherContact?: string;
  fatherOccupation?: string;
  motherName?: string;
  motherEmail?: string;
  motherContact?: string;
  motherOccupation?: string;
}

export interface ScholarshipFormData {
  studentId: string;
  type: string; // e.g., 'Merit' | 'Need-Based'
  amount: number;
  notes?: string;
  academicYear?: string;
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
  type: Assignment["type"];
  instructions: string;
}

// Class Management
export interface Class {
  _id: string;
  id: string;
  name: string;
  grade: string;
  section: string;
  academicYear: string;
  classTeacherId?: string;
  classTeacherName?: string;
  subjects: string[];
  students: string[]; // student IDs
  maxCapacity: number;
  currentStrength: number;
  room?: string;
  schedule: ClassSchedule[];
  status: "active" | "inactive" | "archived";
  createdAt: string;
  updatedAt: string;
}

export interface ClassFormData {
  name: string;
  grade: string;
  section: string;
  academicYear: string;
  classTeacherId?: string;
  subjects: string[];
  maxCapacity: number;
  room?: string;
}

export interface StudentUploadData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth: string;
  address: string;
  parentEmail?: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
}

// Subject Management

export interface ClassRef {
  _id: string;
  grade: string;
  section?: string;
}

export interface TeacherList {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}
export interface Subject {
  _id: string;
  name: string;
  code: string;
  admin: string;
  classes: ClassRef[];
  teachers: TeacherList[];
  department?: string;
  type?: string;
  grade:string;
  credits?: number;
  description?: string;
  classSchedule?: {
    dayOfWeek: number; // 0-6 (Sunday-Saturday)
    startTime: string;
    endTime: string;
    room: string;
  }[];

}

export interface SubjectResponse {
  success: boolean;
  message?: string;
  subject?: Subject;
  subjects?: Subject[];
  pagination?: {
    page: number;
    totalPages: number;
    totalResults: number;
  };
}

export interface SubjectFormData {
  name: string;
  code: string;
  description: string;
  department: string;
  credits: number;
  type: Subject["type"];
  grade: string;
  syllabus: string[];
  prerequisites: string[];
}

export interface AssignTeacherData {
  subjectId: string;
  teacherId: string;
  classSchedule?: Subject["classSchedule"];
}

// Timetable Management
export interface TimetablePeriod {
  id: string;
  classId: string;
  className: string;
  day: string; // Monday, Tuesday, etc.
  dayIndex: number; // 0-5 for Mon-Sat
  period: number; // 1-8
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  teacherId: string;
  teacherName: string;
  room?: string;
  color: string; // For UI color coding
  createdAt: string;
  updatedAt: string;
}

export interface ClassTimetable {
  classId: string;
  className: string;
  periods: TimetablePeriod[];
  totalPeriods: number;
  totalDays: number;
}

export interface TeacherTimetable {
  teacherId: string;
  teacherName: string;
  periods: TimetablePeriod[];
  freePeriods: {
    day: string;
    dayIndex: number;
    period: number;
  }[];
}

export interface FreeTeacher {
  id: string;
  name: string;
  email: string;
  department: string;
  subjectSpecialization: string[];
}

export interface TimetablePeriodFormData {
  day: string;
  period: number;
  classId: string;
  subjectId: string;
  teacherId: string;
  room?: string;
}

export interface AutoGenerateTimetableData {
  classId: string;
  numberOfDays: number;
  periodsPerDay: number;
}

export interface FindFreeTeachersData {
  day: string;
  period: number;
}
export type TeacherStatus =
  | "active"
  | "inactive"
  | "terminated"
  | "retired"
  | "onLeave";

export interface TeacherFormData {
  // Optional for update, required for creation
  id?: string;
  userId?: string;
  teacherId?: string;
  registrationNumber?: string; // Add this missing property

  // Basic info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  phone2?: string; // Add this missing property
  dateOfBirth: string;
  dob?: string; // Add this alias for backward compatibility
  address: string;
  department?: string; // optional if coming from a form
  position?: string;
  dateOfJoining?: string;
  salary?: number;
  avatar?: string;
  status?: TeacherStatus;

  // Arrays
  subjectSpecialization: string[]; // from form: [subject]
  subjects?: string[]; // Add this alias for backward compatibility
  qualifications: string[]; // from form: [qualification]

  // Experience
  yearsOfExperience: number; // convert string from form to number
  experienceYears?: number; // Add this alias for backward compatibility

  // Emergency contact
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };

  // Courses taught
  courses?: string[]; // optional for form
  _id?: string; // Add this for MongoDB compatibility

  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}
