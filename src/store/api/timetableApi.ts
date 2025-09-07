import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  TimetablePeriod,
  ClassTimetable,
  TeacherTimetable,
  FreeTeacher,
  TimetablePeriodFormData,
  AutoGenerateTimetableData,
  FindFreeTeachersData,
  ApiResponse,
  Teacher,
  Subject,
  Class,
} from '@/types';

// Mock data for colors to distinguish subjects
const subjectColors = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16'
];

// Mock timetable periods
const mockTimetablePeriods: TimetablePeriod[] = [
  {
    id: '1',
    classId: '1',
    className: 'Class 10 A',
    day: 'Monday',
    dayIndex: 0,
    period: 1,
    subjectId: '1',
    subjectName: 'Mathematics',
    subjectCode: 'MATH101',
    teacherId: '1',
    teacherName: 'John Smith',
    room: 'Room 101',
    color: subjectColors[0],
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    id: '2',
    classId: '1',
    className: 'Class 10 A',
    day: 'Monday',
    dayIndex: 0,
    period: 2,
    subjectId: '2',
    subjectName: 'Physics',
    subjectCode: 'PHY101',
    teacherId: '2',
    teacherName: 'Jane Doe',
    room: 'Lab 201',
    color: subjectColors[1],
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z',
  },
  {
    id: '3',
    classId: '1',
    className: 'Class 10 A',
    day: 'Tuesday',
    dayIndex: 1,
    period: 1,
    subjectId: '3',
    subjectName: 'Chemistry',
    subjectCode: 'CHEM101',
    teacherId: '3',
    teacherName: 'Robert Johnson',
    room: 'Lab 202',
    color: subjectColors[2],
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    id: '4',
    classId: '2',
    className: 'Class 10 B',
    day: 'Monday',
    dayIndex: 0,
    period: 1,
    subjectId: '2',
    subjectName: 'Physics',
    subjectCode: 'PHY101',
    teacherId: '2',
    teacherName: 'Jane Doe',
    room: 'Room 102',
    color: subjectColors[1],
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
];

// Mock free teachers
const mockFreeTeachers: FreeTeacher[] = [
  {
    id: '4',
    name: 'Sarah Wilson',
    email: 'sarah.wilson@school.com',
    department: 'English',
    subjectSpecialization: ['English', 'Literature'],
  },
  {
    id: '5',
    name: 'Michael Brown',
    email: 'michael.brown@school.com',
    department: 'History',
    subjectSpecialization: ['History', 'Geography'],
  },
];

export const timetableApi = createApi({
  reducerPath: 'timetableApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/timetable',
  }),
  tagTypes: ['TimetablePeriod', 'ClassTimetable', 'TeacherTimetable'],
  endpoints: (builder) => ({
    // Create a single period
    createPeriod: builder.mutation<ApiResponse<TimetablePeriod>, TimetablePeriodFormData>({
      queryFn: async (periodData) => {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Check for conflicts (same teacher/class at same time)
        const conflict = mockTimetablePeriods.find(
          (p) =>
            p.classId === periodData.classId &&
            p.day === periodData.day &&
            p.period === periodData.period
        );

        if (conflict) {
          return {
            error: {
              status: 400,
              data: { message: 'Time slot already occupied for this class' },
            },
          };
        }

        const newPeriod: TimetablePeriod = {
          id: Date.now().toString(),
          classId: periodData.classId,
          className: 'Class 10 A', // Mock class name
          day: periodData.day,
          dayIndex: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(periodData.day),
          period: periodData.period,
          subjectId: periodData.subjectId,
          subjectName: 'Mathematics', // Mock subject name
          subjectCode: 'MATH101', // Mock subject code
          teacherId: periodData.teacherId,
          teacherName: 'John Smith', // Mock teacher name
          room: periodData.room || 'Room 101',
          color: subjectColors[Math.floor(Math.random() * subjectColors.length)],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        mockTimetablePeriods.push(newPeriod);

        return {
          data: {
            success: true,
            data: newPeriod,
            message: 'Period created successfully',
          },
        };
      },
      invalidatesTags: ['ClassTimetable', 'TeacherTimetable'],
    }),

    // Auto-generate timetable
    autoGenerateTimetable: builder.mutation<ApiResponse<{ slotsCreated: number }>, AutoGenerateTimetableData>({
      queryFn: async (data) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const slotsCreated = data.numberOfDays * data.periodsPerDay;

        return {
          data: {
            success: true,
            data: { slotsCreated },
            message: `Timetable generated successfully with ${slotsCreated} slots`,
          },
        };
      },
      invalidatesTags: ['ClassTimetable', 'TeacherTimetable'],
    }),

    // Get class timetable
    getClassTimetable: builder.query<ClassTimetable, string>({
      queryFn: async (classId) => {
        await new Promise((resolve) => setTimeout(resolve, 300));

        const periods = mockTimetablePeriods.filter((p) => p.classId === classId);

        return {
          data: {
            classId,
            className: 'Class 10 A',
            periods,
            totalPeriods: 8,
            totalDays: 6,
          },
        };
      },
      providesTags: ['ClassTimetable'],
    }),

    // Get teacher timetable
    getTeacherTimetable: builder.query<TeacherTimetable, string>({
      queryFn: async (teacherId) => {
        await new Promise((resolve) => setTimeout(resolve, 300));

        const periods = mockTimetablePeriods.filter((p) => p.teacherId === teacherId);
        
        // Generate mock free periods
        const allSlots = [];
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        for (let dayIndex = 0; dayIndex < 6; dayIndex++) {
          for (let period = 1; period <= 8; period++) {
            allSlots.push({ day: days[dayIndex], dayIndex, period });
          }
        }

        const occupiedSlots = periods.map(p => ({ day: p.day, dayIndex: p.dayIndex, period: p.period }));
        const freePeriods = allSlots.filter(
          slot => !occupiedSlots.some(
            occupied => occupied.day === slot.day && occupied.period === slot.period
          )
        );

        return {
          data: {
            teacherId,
            teacherName: 'John Smith',
            periods,
            freePeriods,
          },
        };
      },
      providesTags: ['TeacherTimetable'],
    }),

    // Find free teachers
    findFreeTeachers: builder.mutation<FreeTeacher[], FindFreeTeachersData>({
      queryFn: async (data) => {
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Filter out teachers who are busy in this slot
        const busyTeachers = mockTimetablePeriods
          .filter((p) => p.day === data.day && p.period === data.period)
          .map((p) => p.teacherId);

        const freeTeachers = mockFreeTeachers.filter(
          (teacher) => !busyTeachers.includes(teacher.id)
        );

        return { data: freeTeachers };
      },
    }),

    // Delete period
    deletePeriod: builder.mutation<ApiResponse<void>, string>({
      queryFn: async (periodId) => {
        await new Promise((resolve) => setTimeout(resolve, 300));

        const index = mockTimetablePeriods.findIndex((p) => p.id === periodId);
        if (index !== -1) {
          mockTimetablePeriods.splice(index, 1);
        }

        return {
          data: {
            success: true,
            data: undefined,
            message: 'Period deleted successfully',
          },
        };
      },
      invalidatesTags: ['ClassTimetable', 'TeacherTimetable'],
    }),
  }),
});

export const {
  useCreatePeriodMutation,
  useAutoGenerateTimetableMutation,
  useGetClassTimetableQuery,
  useGetTeacherTimetableQuery,
  useFindFreeTeachersMutation,
  useDeletePeriodMutation,
} = timetableApi;