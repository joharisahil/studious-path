import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Class, ApiResponse, PaginatedResponse, ClassFormData, StudentUploadData } from '../../types';

const mockClasses: Class[] = [
  {
    id: '1',
    name: 'Grade 10 - Section A',
    grade: '10',
    section: 'A',
    academicYear: '2024-25',
    classTeacherId: '2',
    classTeacherName: 'John Teacher',
    subjects: ['Mathematics', 'Science', 'English', 'History'],
    students: ['1', '2'],
    maxCapacity: 30,
    currentStrength: 2,
    room: 'Room 101',
    schedule: [
      {
        id: '1',
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '10:00',
        room: 'Room 101'
      }
    ],
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

const mockApiDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const classesApi = createApi({
  reducerPath: 'classesApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/classes' }),
  tagTypes: ['Class'],
  endpoints: (builder) => ({
    getClasses: builder.query<ApiResponse<PaginatedResponse<Class>>, { page?: number; limit?: number; search?: string }>({
      async queryFn({ page = 1, limit = 10, search = '' }) {
        await mockApiDelay();

        let filteredClasses = mockClasses;
        if (search) {
          filteredClasses = mockClasses.filter(cls =>
            cls.name.toLowerCase().includes(search.toLowerCase()) ||
            cls.grade.toLowerCase().includes(search.toLowerCase()) ||
            cls.section.toLowerCase().includes(search.toLowerCase())
          );
        }

        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedData = filteredClasses.slice(startIndex, endIndex);

        return {
          data: {
            success: true,
            message: 'Classes retrieved successfully',
            data: {
              data: paginatedData,
              totalCount: filteredClasses.length,
              page,
              limit,
              totalPages: Math.ceil(filteredClasses.length / limit),
            },
          },
        };
      },
      providesTags: ['Class'],
    }),

    getClass: builder.query<ApiResponse<Class>, string>({
      async queryFn(id) {
        await mockApiDelay();

        const classItem = mockClasses.find(c => c.id === id);
        if (!classItem) {
          return {
            error: {
              status: 404,
              data: { message: 'Class not found' },
            },
          };
        }

        return {
          data: {
            success: true,
            message: 'Class retrieved successfully',
            data: classItem,
          },
        };
      },
      providesTags: (_result, _error, id) => [{ type: 'Class', id }],
    }),

    createClass: builder.mutation<ApiResponse<Class>, ClassFormData>({
      async queryFn(classData) {
        await mockApiDelay(800);

        const newClass: Class = {
          id: (mockClasses.length + 1).toString(),
          name: `Grade ${classData.grade} - Section ${classData.section}`,
          ...classData,
          classTeacherName: classData.classTeacherId ? 'Teacher Name' : undefined,
          students: [],
          currentStrength: 0,
          schedule: [],
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        mockClasses.push(newClass);

        return {
          data: {
            success: true,
            message: 'Class created successfully',
            data: newClass,
          },
        };
      },
      invalidatesTags: ['Class'],
    }),

    addStudentsToClass: builder.mutation<ApiResponse<Class>, { classId: string; studentIds: string[] }>({
      async queryFn({ classId, studentIds }) {
        await mockApiDelay(600);

        const classIndex = mockClasses.findIndex(c => c.id === classId);
        if (classIndex === -1) {
          return {
            error: {
              status: 404,
              data: { message: 'Class not found' },
            },
          };
        }

        const existingStudents = mockClasses[classIndex].students;
        const newStudents = [...new Set([...existingStudents, ...studentIds])];
        
        mockClasses[classIndex] = {
          ...mockClasses[classIndex],
          students: newStudents,
          currentStrength: newStudents.length,
          updatedAt: new Date().toISOString(),
        };

        return {
          data: {
            success: true,
            message: 'Students added to class successfully',
            data: mockClasses[classIndex],
          },
        };
      },
      invalidatesTags: ['Class'],
    }),

    uploadStudentsToClass: builder.mutation<ApiResponse<{ addedCount: number; errors: string[] }>, { classId: string; students: StudentUploadData[] }>({
      async queryFn({ classId, students }) {
        await mockApiDelay(1000);

        const classIndex = mockClasses.findIndex(c => c.id === classId);
        if (classIndex === -1) {
          return {
            error: {
              status: 404,
              data: { message: 'Class not found' },
            },
          };
        }

        // Mock validation and student creation
        const errors: string[] = [];
        const addedStudentIds: string[] = [];

        students.forEach((student, index) => {
          if (!student.firstName || !student.lastName || !student.email) {
            errors.push(`Row ${index + 1}: Missing required fields`);
            return;
          }

          // Mock student creation
          const studentId = `STU${Date.now()}_${index}`;
          addedStudentIds.push(studentId);
        });

        if (addedStudentIds.length > 0) {
          const existingStudents = mockClasses[classIndex].students;
          const newStudents = [...existingStudents, ...addedStudentIds];
          
          mockClasses[classIndex] = {
            ...mockClasses[classIndex],
            students: newStudents,
            currentStrength: newStudents.length,
            updatedAt: new Date().toISOString(),
          };
        }

        return {
          data: {
            success: true,
            message: `Students uploaded successfully. Added: ${addedStudentIds.length}, Errors: ${errors.length}`,
            data: {
              addedCount: addedStudentIds.length,
              errors,
            },
          },
        };
      },
      invalidatesTags: ['Class'],
    }),
  }),
});

export const {
  useGetClassesQuery,
  useGetClassQuery,
  useCreateClassMutation,
  useAddStudentsToClassMutation,
  useUploadStudentsToClassMutation,
} = classesApi;