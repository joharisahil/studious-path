import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Student, ApiResponse, PaginatedResponse, StudentFormData } from '../../types';

// Mock students data
const mockStudents: Student[] = [
  {
    id: '1',
    userId: '3',
    studentId: 'STU001',
    firstName: 'Jane',
    lastName: 'Student',
    email: 'jane.student@school.com',
    phone: '+1234567892',
    dateOfBirth: '2005-01-01',
    address: '123 Student St, City',
    enrollmentDate: '2024-01-15',
    status: 'active',
    grade: '10',
    section: 'A',
    avatar: '',
    emergencyContact: {
      name: 'Robert Parent',
      phone: '+1234567893',
      relation: 'Father'
    },
    academicHistory: [],
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
  {
    id: '2',
    userId: '5',
    studentId: 'STU002',
    firstName: 'Mike',
    lastName: 'Johnson',
    email: 'mike.johnson@school.com',
    phone: '+1234567894',
    dateOfBirth: '2004-05-15',
    address: '456 Oak Ave, City',
    enrollmentDate: '2024-01-15',
    status: 'active',
    grade: '11',
    section: 'B',
    avatar: '',
    emergencyContact: {
      name: 'Sarah Johnson',
      phone: '+1234567895',
      relation: 'Mother'
    },
    academicHistory: [],
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
];

const mockApiDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const studentsApi = createApi({
  reducerPath: 'studentsApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/students' }),
  tagTypes: ['Student'],
  endpoints: (builder) => ({
    getStudents: builder.query<ApiResponse<PaginatedResponse<Student>>, { page?: number; limit?: number; search?: string }>({
      async queryFn({ page = 1, limit = 10, search = '' }) {
        await mockApiDelay();

        let filteredStudents = mockStudents;
        if (search) {
          filteredStudents = mockStudents.filter(student =>
            student.firstName.toLowerCase().includes(search.toLowerCase()) ||
            student.lastName.toLowerCase().includes(search.toLowerCase()) ||
            student.email.toLowerCase().includes(search.toLowerCase()) ||
            student.studentId.toLowerCase().includes(search.toLowerCase())
          );
        }

        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedData = filteredStudents.slice(startIndex, endIndex);

        return {
          data: {
            success: true,
            message: 'Students retrieved successfully',
            data: {
              data: paginatedData,
              totalCount: filteredStudents.length,
              page,
              limit,
              totalPages: Math.ceil(filteredStudents.length / limit),
            },
          },
        };
      },
      providesTags: ['Student'],
    }),

    getStudent: builder.query<ApiResponse<Student>, string>({
      async queryFn(id) {
        await mockApiDelay();

        const student = mockStudents.find(s => s.id === id);
        if (!student) {
          return {
            error: {
              status: 404,
              data: { message: 'Student not found' },
            },
          };
        }

        return {
          data: {
            success: true,
            message: 'Student retrieved successfully',
            data: student,
          },
        };
      },
      providesTags: (_result, _error, id) => [{ type: 'Student', id }],
    }),

    createStudent: builder.mutation<ApiResponse<Student>, StudentFormData>({
      async queryFn(studentData) {
        await mockApiDelay(800);

        const newStudent: Student = {
          id: (mockStudents.length + 1).toString(),
          studentId: `STU${String(mockStudents.length + 1).padStart(3, '0')}`,
          userId: `user_${Date.now()}`,
          ...studentData,
          emergencyContact: {
            name: studentData.guardian.name,
            phone: studentData.guardian.phone,
            relation: studentData.guardian.relation,
          },
          enrollmentDate: new Date().toISOString(),
          status: 'active',
          avatar: '',
          academicHistory: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        mockStudents.push(newStudent);

        return {
          data: {
            success: true,
            message: 'Student created successfully',
            data: newStudent,
          },
        };
      },
      invalidatesTags: ['Student'],
    }),

    updateStudent: builder.mutation<ApiResponse<Student>, { id: string } & Partial<StudentFormData>>({
      async queryFn({ id, ...updateData }) {
        await mockApiDelay(600);

        const studentIndex = mockStudents.findIndex(s => s.id === id);
        if (studentIndex === -1) {
          return {
            error: {
              status: 404,
              data: { message: 'Student not found' },
            },
          };
        }

        mockStudents[studentIndex] = {
          ...mockStudents[studentIndex],
          ...updateData,
          updatedAt: new Date().toISOString(),
        };

        return {
          data: {
            success: true,
            message: 'Student updated successfully',
            data: mockStudents[studentIndex],
          },
        };
      },
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Student', id }],
    }),

    deleteStudent: builder.mutation<ApiResponse<{ success: boolean }>, string>({
      async queryFn(id) {
        await mockApiDelay(400);

        const studentIndex = mockStudents.findIndex(s => s.id === id);
        if (studentIndex === -1) {
          return {
            error: {
              status: 404,
              data: { message: 'Student not found' },
            },
          };
        }

        mockStudents.splice(studentIndex, 1);

        return {
          data: {
            success: true,
            message: 'Student deleted successfully',
            data: { success: true },
          },
        };
      },
      invalidatesTags: ['Student'],
    }),
  }),
});

export const {
  useGetStudentsQuery,
  useGetStudentQuery,
  useCreateStudentMutation,
  useUpdateStudentMutation,
  useDeleteStudentMutation,
} = studentsApi;