import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { AttendanceRecord, ApiResponse, AttendanceStats } from '../../types';

const mockAttendanceRecords: AttendanceRecord[] = [];

const mockApiDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const attendanceApi = createApi({
  reducerPath: 'attendanceApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/attendance' }),
  tagTypes: ['Attendance'],
  endpoints: (builder) => ({
    getAttendanceRecords: builder.query<ApiResponse<AttendanceRecord[]>, { studentId?: string; courseId?: string; date?: string }>({
      async queryFn() {
        await mockApiDelay();
        
        return {
          data: {
            success: true,
            message: 'Attendance records retrieved successfully',
            data: mockAttendanceRecords,
          },
        };
      },
      providesTags: ['Attendance'],
    }),

    markAttendance: builder.mutation<ApiResponse<AttendanceRecord>, Omit<AttendanceRecord, 'id' | 'createdAt'>>({
      async queryFn(attendanceData) {
        await mockApiDelay(400);

        const newRecord: AttendanceRecord = {
          ...attendanceData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        };

        mockAttendanceRecords.push(newRecord);

        return {
          data: {
            success: true,
            message: 'Attendance marked successfully',
            data: newRecord,
          },
        };
      },
      invalidatesTags: ['Attendance'],
    }),

    getAttendanceStats: builder.query<ApiResponse<AttendanceStats>, { studentId: string; courseId?: string }>({
      async queryFn() {
        await mockApiDelay();

        const mockStats: AttendanceStats = {
          totalClasses: 20,
          present: 18,
          absent: 2,
          late: 0,
          excused: 0,
          attendancePercentage: 90,
        };

        return {
          data: {
            success: true,
            message: 'Attendance stats retrieved successfully',
            data: mockStats,
          },
        };
      },
      providesTags: ['Attendance'],
    }),
  }),
});

export const {
  useGetAttendanceRecordsQuery,
  useMarkAttendanceMutation,
  useGetAttendanceStatsQuery,
} = attendanceApi;