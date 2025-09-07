import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { TeacherFormData, ApiResponse, PaginatedResponse } from '../../types';

const mockTeachers: TeacherFormData[] = [
  {
    id: '1',
    userId: 't_1',
    teacherId: 'TEA001',
    firstName: 'Alice',
    lastName: 'Smith',
    email: 'alice.smith@school.com',
    phone: '+1234567890',
    dateOfBirth: '1985-03-10',
    address: '123 Teacher Rd, City',
    department: 'Mathematics',
    subjectSpecialization: ['Mathematics'],
    qualifications: ['M.Sc. Mathematics'],
    yearsOfExperience: 10,
    dateOfJoining: '2014-01-15',
    position: 'Teacher',
    salary: 50000,
    avatar: '',
    courses: [],
    status: 'active',
    emergencyContact: { name: 'Robert Smith', phone: '+1234567891', relation: 'Spouse' },
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
  {
    id: '2',
    userId: 't_2',
    teacherId: 'TEA002',
    firstName: 'Bob',
    lastName: 'Johnson',
    email: 'bob.johnson@school.com',
    phone: '+1234567892',
    dateOfBirth: '1978-07-22',
    address: '456 Oak St, City',
    department: 'Physics',
    subjectSpecialization: ['Physics'],
    qualifications: ['M.Sc. Physics'],
    yearsOfExperience: 15,
    dateOfJoining: '2009-07-22',
    position: 'Teacher',
    salary: 55000,
    avatar: '',
    courses: [],
    status: 'inactive',
    emergencyContact: { name: 'Sarah Johnson', phone: '+1234567893', relation: 'Spouse' },
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
];

const mockApiDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const teachersApi = createApi({
  reducerPath: 'teachersApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/teachers' }),
  tagTypes: ['Teacher'],
  endpoints: (builder) => ({
    getTeachers: builder.query<
      ApiResponse<PaginatedResponse<TeacherFormData>>,
      { page?: number; limit?: number; search?: string }
    >({
      async queryFn({ page = 1, limit = 10, search = '' }) {
        await mockApiDelay();
        let filtered = mockTeachers;
        if (search) {
          filtered = filtered.filter(t =>
            t.firstName.toLowerCase().includes(search.toLowerCase()) ||
            t.lastName.toLowerCase().includes(search.toLowerCase()) ||
            t.email.toLowerCase().includes(search.toLowerCase()) ||
            t.teacherId.toLowerCase().includes(search.toLowerCase())
          );
        }
        const start = (page - 1) * limit;
        const paginated = filtered.slice(start, start + limit);
        return {
          data: {
            success: true,
            message: 'Teachers retrieved successfully',
            data: {
              data: paginated,
              totalCount: filtered.length,
              page,
              limit,
              totalPages: Math.ceil(filtered.length / limit),
            },
          },
        };
      },
      providesTags: ['Teacher'],
    }),

    getTeacher: builder.query<ApiResponse<TeacherFormData>, string>({
      async queryFn(id) {
        await mockApiDelay();
        const teacher = mockTeachers.find(t => t.id === id);
        if (!teacher) return { error: { status: 404, data: { message: 'Teacher not found' } } };
        return { data: { success: true, message: 'Teacher retrieved successfully', data: teacher } };
      },
      providesTags: (_result, _error, id) => [{ type: 'Teacher', id }],
    }),

    createTeacher: builder.mutation<ApiResponse<TeacherFormData>, TeacherFormData>({
      async queryFn(data) {
        await mockApiDelay();
        const newTeacher: TeacherFormData = {
          ...data,
          id: (mockTeachers.length + 1).toString(),
          userId: `t_${Date.now()}`,
          teacherId: `TEA${String(mockTeachers.length + 1).padStart(3, '0')}`,
          dateOfJoining: new Date().toISOString(),
          status: data.status ?? 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        mockTeachers.push(newTeacher);
        return { data: { success: true, message: 'Teacher created successfully', data: newTeacher } };
      },
      invalidatesTags: ['Teacher'],
    }),

    updateTeacher: builder.mutation<ApiResponse<TeacherFormData>, { id: string } & Partial<TeacherFormData>>({
      async queryFn({ id, ...data }) {
        await mockApiDelay();
        const index = mockTeachers.findIndex(t => t.id === id);
        if (index === -1) return { error: { status: 404, data: { message: 'Teacher not found' } } };
        const old = mockTeachers[index];
        mockTeachers[index] = {
          ...old,
          ...data,
          status: data.status ?? old.status,
          emergencyContact: {
            name: data.emergencyContact?.name ?? old.emergencyContact.name,
            phone: data.emergencyContact?.phone ?? old.emergencyContact.phone,
            relation: data.emergencyContact?.relation ?? old.emergencyContact.relation,
          },
          updatedAt: new Date().toISOString(),
        };
        return { data: { success: true, message: 'Teacher updated successfully', data: mockTeachers[index] } };
      },
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Teacher', id }],
    }),

    deleteTeacher: builder.mutation<ApiResponse<{ success: boolean }>, string>({
      async queryFn(id) {
        await mockApiDelay();
        const index = mockTeachers.findIndex(t => t.id === id);
        if (index === -1) return { error: { status: 404, data: { message: 'Teacher not found' } } };
        mockTeachers.splice(index, 1);
        return { data: { success: true, message: 'Teacher deleted successfully', data: { success: true } } };
      },
      invalidatesTags: ['Teacher'],
    }),
  }),
});

export const {
  useGetTeachersQuery,
  useGetTeacherQuery,
  useCreateTeacherMutation,
  useUpdateTeacherMutation,
  useDeleteTeacherMutation,
} = teachersApi;
