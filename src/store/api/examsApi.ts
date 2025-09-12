import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ApiResponse } from '../../types';
import { ExamTimetable, ExamFormData, ExamSchedule, ExamScheduleFormData, FeeReceipt } from '../../types/exams';

const mockExamTimetables: ExamTimetable[] = [
  {
    id: '1',
    examName: 'Mid Term Examination',
    academicYear: '2024-25',
    examType: 'midterm',
    startDate: '2024-03-15',
    endDate: '2024-03-25',
    description: 'Mid term examinations for all classes',
    schedules: [
      {
        id: '1',
        examId: '1',
        classId: '1',
        className: 'Class 10-A',
        subjectId: '1',
        subjectName: 'Mathematics',
        date: '2024-03-15',
        startTime: '09:00',
        endTime: '12:00',
        duration: 180,
        room: 'Room 101',
        invigilatorId: '1',
        invigilatorName: 'Dr. Smith',
        maxMarks: 100,
        instructions: 'Calculators not allowed',
        status: 'scheduled'
      },
      {
        id: '2',
        examId: '1',
        classId: '1',
        className: 'Class 10-A',
        subjectId: '2',
        subjectName: 'English',
        date: '2024-03-16',
        startTime: '09:00',
        endTime: '12:00',
        duration: 180,
        room: 'Room 102',
        invigilatorId: '2',
        invigilatorName: 'Prof. Johnson',
        maxMarks: 100,
        status: 'scheduled'
      }
    ],
    createdBy: 'admin',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  }
];

const mockApiDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const examsApi = createApi({
  reducerPath: 'examsApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/exams' }),
  tagTypes: ['Exam', 'ExamSchedule'],
  endpoints: (builder) => ({
    getExamTimetables: builder.query<ApiResponse<ExamTimetable[]>, void>({
      async queryFn() {
        await mockApiDelay();
        return {
          data: {
            success: true,
            message: 'Exam timetables retrieved successfully',
            data: mockExamTimetables,
          },
        };
      },
      providesTags: ['Exam'],
    }),

    createExam: builder.mutation<ApiResponse<ExamTimetable>, ExamFormData>({
      async queryFn(examData) {
        await mockApiDelay(600);
        
        const newExam: ExamTimetable = {
          id: Date.now().toString(),
          examName: examData.name,
          academicYear: examData.academicYear,
          examType: examData.examType,
          startDate: examData.startDate,
          endDate: examData.endDate,
          description: examData.description,
          schedules: [],
          createdBy: 'current-user',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        return {
          data: {
            success: true,
            message: 'Exam created successfully',
            data: newExam,
          },
        };
      },
      invalidatesTags: ['Exam'],
    }),

    createExamSchedule: builder.mutation<ApiResponse<ExamSchedule>, ExamScheduleFormData>({
      async queryFn(scheduleData) {
        await mockApiDelay(600);
        
        const newSchedule: ExamSchedule = {
          id: Date.now().toString(),
          ...scheduleData,
          className: 'Class Name', // Mock class name
          subjectName: 'Subject Name', // Mock subject name
          invigilatorName: 'Teacher Name', // Mock teacher name
          duration: 180,
          status: 'scheduled'
        };

        return {
          data: {
            success: true,
            message: 'Exam schedule created successfully',
            data: newSchedule,
          },
        };
      },
      invalidatesTags: ['Exam', 'ExamSchedule'],
    }),

    getExamScheduleByClass: builder.query<ApiResponse<ExamSchedule[]>, string>({
      async queryFn(classId) {
        await mockApiDelay();
        
        const schedules = mockExamTimetables.flatMap(exam => 
          exam.schedules.filter(schedule => schedule.classId === classId)
        );
        
        return {
          data: {
            success: true,
            message: 'Class exam schedule retrieved successfully',
            data: schedules,
          },
        };
      },
      providesTags: ['ExamSchedule'],
    }),

    generateFeeReceipt: builder.mutation<ApiResponse<FeeReceipt>, {
      paymentId: string;
      studentId: string;
      amount: number;
      month: string;
      paymentMethod: string;
    }>({
      async queryFn({ paymentId, studentId, amount, month, paymentMethod }) {
        await mockApiDelay(600);
        
        const receipt: FeeReceipt = {
          id: Date.now().toString(),
          receiptNumber: `RCP${Date.now()}`,
          studentId,
          studentName: 'John Doe',
          className: 'Class 10-A',
          academicYear: '2024-25',
          paymentDate: new Date().toISOString(),
          amount,
          paymentMethod: paymentMethod as any,
          feeType: 'Monthly Fee',
          month,
          collectedBy: 'current-user',
          createdAt: new Date().toISOString()
        };

        return {
          data: {
            success: true,
            message: 'Fee receipt generated successfully',
            data: receipt,
          },
        };
      },
    }),
  }),
});

export const {
  useGetExamTimetablesQuery,
  useCreateExamMutation,
  useCreateExamScheduleMutation,
  useGetExamScheduleByClassQuery,
  useGenerateFeeReceiptMutation,
} = examsApi;