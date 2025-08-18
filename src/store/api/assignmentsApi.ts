import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Assignment, AssignmentSubmission, ApiResponse, AssignmentFormData } from '../../types';

const mockAssignments: Assignment[] = [];

const mockApiDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const assignmentsApi = createApi({
  reducerPath: 'assignmentsApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/assignments' }),
  tagTypes: ['Assignment', 'Submission'],
  endpoints: (builder) => ({
    getAssignments: builder.query<ApiResponse<Assignment[]>, { courseId?: string; teacherId?: string }>({
      async queryFn() {
        await mockApiDelay();
        
        return {
          data: {
            success: true,
            message: 'Assignments retrieved successfully',
            data: mockAssignments,
          },
        };
      },
      providesTags: ['Assignment'],
    }),

    createAssignment: builder.mutation<ApiResponse<Assignment>, AssignmentFormData>({
      async queryFn(assignmentData) {
        await mockApiDelay(600);

        const newAssignment: Assignment = {
          id: Date.now().toString(),
          ...assignmentData,
          courseName: 'Course Name', // Mock course name lookup
          teacherId: 'current-teacher-id',
          instructions: assignmentData.instructions || '',
          resources: [],
          submissions: [],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        mockAssignments.push(newAssignment);

        return {
          data: {
            success: true,
            message: 'Assignment created successfully',
            data: newAssignment,
          },
        };
      },
      invalidatesTags: ['Assignment'],
    }),

    submitAssignment: builder.mutation<ApiResponse<AssignmentSubmission>, { assignmentId: string; files: string[]; notes?: string }>({
      async queryFn({ assignmentId, files, notes }) {
        await mockApiDelay(800);

        const submission: AssignmentSubmission = {
          id: Date.now().toString(),
          assignmentId,
          studentId: 'current-student-id',
          studentName: 'Current Student',
          submittedAt: new Date().toISOString(),
          files,
          notes,
          status: 'submitted',
        };

        return {
          data: {
            success: true,
            message: 'Assignment submitted successfully',
            data: submission,
          },
        };
      },
      invalidatesTags: ['Assignment', 'Submission'],
    }),
  }),
});

export const {
  useGetAssignmentsQuery,
  useCreateAssignmentMutation,
  useSubmitAssignmentMutation,
} = assignmentsApi;