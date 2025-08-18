import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Course, ApiResponse, PaginatedResponse, CourseFormData } from '../../types';

const mockCourses: Course[] = [
  {
    id: '1',
    name: 'Mathematics',
    code: 'MATH101',
    description: 'Advanced Mathematics for Grade 10',
    grade: '10',
    subject: 'Mathematics',
    teacherId: '2',
    teacherName: 'John Teacher',
    duration: '1 Year',
    credits: 4,
    syllabus: ['Algebra', 'Geometry', 'Trigonometry', 'Statistics'],
    resources: [
      {
        id: '1',
        title: 'Chapter 1: Algebra Basics',
        type: 'pdf',
        url: '/resources/math-chapter1.pdf',
        uploadedAt: '2024-01-01T00:00:00Z',
        uploadedBy: '2'
      }
    ],
    enrolledStudents: ['1', '2'],
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

export const coursesApi = createApi({
  reducerPath: 'coursesApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/courses' }),
  tagTypes: ['Course'],
  endpoints: (builder) => ({
    getCourses: builder.query<ApiResponse<PaginatedResponse<Course>>, { page?: number; limit?: number }>({
      async queryFn({ page = 1, limit = 10 }) {
        await mockApiDelay();
        
        return {
          data: {
            success: true,
            message: 'Courses retrieved successfully',
            data: {
              data: mockCourses,
              totalCount: mockCourses.length,
              page,
              limit,
              totalPages: Math.ceil(mockCourses.length / limit),
            },
          },
        };
      },
      providesTags: ['Course'],
    }),

    getCourse: builder.query<ApiResponse<Course>, string>({
      async queryFn(id) {
        await mockApiDelay();

        const course = mockCourses.find(c => c.id === id);
        if (!course) {
          return {
            error: {
              status: 404,
              data: { message: 'Course not found' },
            },
          };
        }

        return {
          data: {
            success: true,
            message: 'Course retrieved successfully',
            data: course,
          },
        };
      },
      providesTags: (_result, _error, id) => [{ type: 'Course', id }],
    }),

    createCourse: builder.mutation<ApiResponse<Course>, CourseFormData>({
      async queryFn(courseData) {
        await mockApiDelay(800);

        const newCourse: Course = {
          id: (mockCourses.length + 1).toString(),
          ...courseData,
          teacherName: 'Teacher Name', // Mock teacher name lookup
          syllabus: [],
          resources: [],
          enrolledStudents: [],
          schedule: [],
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        mockCourses.push(newCourse);

        return {
          data: {
            success: true,
            message: 'Course created successfully',
            data: newCourse,
          },
        };
      },
      invalidatesTags: ['Course'],
    }),
  }),
});

export const {
  useGetCoursesQuery,
  useGetCourseQuery,
  useCreateCourseMutation,
} = coursesApi;