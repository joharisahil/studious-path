// Exam Management Types

export interface ExamSchedule {
  id: string;
  examId: string;
  classId: string;
  className: string;
  subjectId: string;
  subjectName: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  room: string;
  invigilatorId: string;
  invigilatorName: string;
  maxMarks: number;
  instructions?: string;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
}

export interface ExamTimetable {
  id: string;
  examName: string;
  academicYear: string;
  examType: 'midterm' | 'final' | 'quarterly' | 'unit_test';
  startDate: string;
  endDate: string;
  description?: string;
  schedules: ExamSchedule[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExamFormData {
  name: string;
  academicYear: string;
  examType: 'midterm' | 'final' | 'quarterly' | 'unit_test';
  startDate: string;
  endDate: string;
  description?: string;
}

export interface ExamScheduleFormData {
  examId: string;
  classId: string;
  subjectId: string;
  date: string;
  startTime: string;
  endTime: string;
  room: string;
  invigilatorId: string;
  maxMarks: number;
  instructions?: string;
}

export interface FeeReceipt {
  id: string;
  receiptNumber: string;
  studentId: string;
  studentName: string;
  className: string;
  academicYear: string;
  paymentDate: string;
  amount: number;
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'online';
  transactionId?: string;
  feeType: string;
  month: string;
  collectedBy: string;
  notes?: string;
  createdAt: string;
}