import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Subject, Teacher, ApiResponse, PaginatedResponse, SubjectFormData, AssignTeacherData } from '../../types';

// Mock subjects data
const mockSubjects: Subject[] = [
  {
    _id: '1',
    id: '1',
    name: 'Advanced Mathematics',
    code: 'MATH301',
    admin: 'admin1',
    classes: [],
    teachers: [],
    description: 'Advanced calculus and algebra concepts for grade 11-12 students',
    department: 'Mathematics',
    credits: 4,
    type: 'core',
    grade: '11',
    teacherId: '1',
    teacherName: 'Dr. Sarah Wilson',
    classSchedule: [
      { dayOfWeek: 1, startTime: '09:00', endTime: '10:30', room: 'Math Lab 1' },
      { dayOfWeek: 3, startTime: '09:00', endTime: '10:30', room: 'Math Lab 1' },
      { dayOfWeek: 5, startTime: '09:00', endTime: '10:30', room: 'Math Lab 1' }
    ],
    syllabus: ['Differential Calculus', 'Integral Calculus', 'Linear Algebra', 'Statistics'],
    resources: ['Advanced Mathematics Textbook', 'Online Calculator', 'Graphing Software'],
    prerequisites: ['Basic Mathematics', 'Algebra I'],
    isActive: true,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
  {
    _id: '2',
    id: '2',
    name: 'Physics Laboratory',
    code: 'PHY201',
    admin: 'admin1',
    classes: [],
    teachers: [],
    description: 'Hands-on physics experiments and practical applications',
    department: 'Science',
    credits: 3,
    type: 'practical',
    grade: '10',
    teacherId: '2',
    teacherName: 'Prof. Michael Chen',
    classSchedule: [
      { dayOfWeek: 2, startTime: '14:00', endTime: '16:00', room: 'Physics Lab' },
      { dayOfWeek: 4, startTime: '14:00', endTime: '16:00', room: 'Physics Lab' }
    ],
    syllabus: ['Mechanics', 'Thermodynamics', 'Optics', 'Electricity & Magnetism'],
    resources: ['Lab Equipment', 'Safety Manual', 'Experiment Guide'],
    prerequisites: ['Basic Physics'],
    isActive: true,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
  {
    _id: '3',
    id: '3',
    name: 'English Literature',
    code: 'ENG401',
    admin: 'admin1',
    classes: [],
    teachers: [],
    description: 'Classic and contemporary literature analysis',
    department: 'English',
    credits: 3,
    type: 'theory',
    grade: '12',
    syllabus: ['Shakespeare Studies', 'Modern Poetry', 'Essay Writing', 'Critical Analysis'],
    resources: ['Literature Anthology', 'Writing Guide', 'Online Resources'],
    prerequisites: ['English Composition'],
    isActive: true,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
  {
    _id: '4',
    id: '4',
    name: 'Computer Programming',
    code: 'CS101',
    admin: 'admin1',
    classes: [],
    teachers: [],
    description: 'Introduction to programming concepts and languages',
    department: 'Computer Science',
    credits: 4,
    type: 'elective',
    grade: '10',
    teacherId: '1',
    teacherName: 'Dr. Sarah Wilson',
    classSchedule: [
      { dayOfWeek: 1, startTime: '11:00', endTime: '12:30', room: 'Computer Lab' },
      { dayOfWeek: 3, startTime: '11:00', endTime: '12:30', room: 'Computer Lab' }
    ],
    syllabus: ['Programming Fundamentals', 'Data Structures', 'Algorithms', 'Project Development'],
    resources: ['Programming IDE', 'Coding Textbook', 'Online Platform'],
    prerequisites: ['Basic Computer Skills'],
    isActive: true,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
];

// Mock teachers data for assignment
const mockTeachers: Teacher[] = [
  {
    _id: '1',
    id: '1',
    userId: '1',
    teacherId: 'TEA001',
    firstName: 'Dr. Sarah',
    lastName: 'Wilson',
    email: 'sarah.wilson@school.com',
    phone: '+1234567890',
    dateOfBirth: '1985-03-15',
    address: '123 Teacher Ave, City',
    department: 'Mathematics',
    subjectSpecialization: ['Mathematics', 'Computer Science'],
    qualifications: ['PhD in Mathematics', 'MSc Computer Science'],
    yearsOfExperience: 8,
    dateOfJoining: '2020-01-15',
    position: 'Senior Teacher',
    salary: 75000,
    status: 'active',
    emergencyContact: {
      name: 'John Wilson',
      phone: '+1234567891',
      relation: 'Spouse'
    },
    courses: ['1', '4'],
    achievements: ['Best Teacher Award 2023'],
    previousInstitutions: ['ABC School'],
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
  {
    _id: '2',
    id: '2',
    userId: '2',
    teacherId: 'TEA002',
    firstName: 'Prof. Michael',
    lastName: 'Chen',
    email: 'michael.chen@school.com',
    phone: '+1234567892',
    dateOfBirth: '1980-07-22',
    address: '456 Faculty St, City',
    department: 'Science',
    subjectSpecialization: ['Physics', 'Chemistry'],
    qualifications: ['PhD in Physics'],
    yearsOfExperience: 12,
    dateOfJoining: '2018-01-15',
    position: 'Head of Science',
    salary: 85000,
    status: 'active',
    emergencyContact: {
      name: 'Lisa Chen',
      phone: '+1234567893',
      relation: 'Spouse'
    },
    courses: ['2'],
    achievements: ['Research Excellence Award'],
    previousInstitutions: ['XYZ University'],
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
];

const mockApiDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const subjectsApi = createApi({
  reducerPath: 'subjectsApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/subjects' }),
  tagTypes: ['Subject'],
  endpoints: (builder) => ({
    getSubjects: builder.query<ApiResponse<PaginatedResponse<Subject>>, { 
      page?: number; 
      limit?: number; 
      search?: string; 
      department?: string; 
      grade?: string;
      teacherId?: string;
    }>({
      async queryFn({ page = 1, limit = 10, search = '', department = '', grade = '', teacherId = '' }) {
        await mockApiDelay();

        let filteredSubjects = mockSubjects;
        
        if (search) {
          filteredSubjects = filteredSubjects.filter(subject =>
            subject.name.toLowerCase().includes(search.toLowerCase()) ||
            subject.code.toLowerCase().includes(search.toLowerCase()) ||
            subject.department.toLowerCase().includes(search.toLowerCase()) ||
            (subject.teacherName && subject.teacherName.toLowerCase().includes(search.toLowerCase()))
          );
        }

        if (department && department !== 'all') {
          filteredSubjects = filteredSubjects.filter(subject => subject.department === department);
        }

        if (grade && grade !== 'all') {
          filteredSubjects = filteredSubjects.filter(subject => subject.grade === grade);
        }

        if (teacherId) {
          filteredSubjects = filteredSubjects.filter(subject => subject.teacherId === teacherId);
        }

        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedData = filteredSubjects.slice(startIndex, endIndex);

        return {
          data: {
            success: true,
            message: 'Subjects retrieved successfully',
            data: {
              data: paginatedData,
              totalCount: filteredSubjects.length,
              page,
              limit,
              totalPages: Math.ceil(filteredSubjects.length / limit),
            },
          },
        };
      },
      providesTags: ['Subject'],
    }),

    getSubject: builder.query<ApiResponse<Subject>, string>({
      async queryFn(id) {
        await mockApiDelay();

        const subject = mockSubjects.find(s => s.id === id);
        if (!subject) {
          return {
            error: {
              status: 404,
              data: { message: 'Subject not found' },
            },
          };
        }

        return {
          data: {
            success: true,
            message: 'Subject retrieved successfully',
            data: subject,
          },
        };
      },
      providesTags: (_result, _error, id) => [{ type: 'Subject', id }],
    }),

    getTeachers: builder.query<ApiResponse<Teacher[]>, void>({
      async queryFn() {
        await mockApiDelay();
        return {
          data: {
            success: true,
            message: 'Teachers retrieved successfully',
            data: mockTeachers,
          },
        };
      },
    }),

    createSubject: builder.mutation<ApiResponse<Subject>, SubjectFormData>({
      async queryFn(subjectData) {
        await mockApiDelay(800);

        const newSubject: Subject = {
          _id: (mockSubjects.length + 1).toString(),
          id: (mockSubjects.length + 1).toString(),
          admin: 'admin1',
          classes: [],
          teachers: [],
          ...subjectData,
          isActive: true,
          resources: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        mockSubjects.push(newSubject);

        return {
          data: {
            success: true,
            message: 'Subject created successfully',
            data: newSubject,
          },
        };
      },
      invalidatesTags: ['Subject'],
    }),

    updateSubject: builder.mutation<ApiResponse<Subject>, { id: string } & Partial<SubjectFormData>>({
      async queryFn({ id, ...updateData }) {
        await mockApiDelay(600);

        const subjectIndex = mockSubjects.findIndex(s => s.id === id);
        if (subjectIndex === -1) {
          return {
            error: {
              status: 404,
              data: { message: 'Subject not found' },
            },
          };
        }

        mockSubjects[subjectIndex] = {
          ...mockSubjects[subjectIndex],
          ...updateData,
          updatedAt: new Date().toISOString(),
        };

        return {
          data: {
            success: true,
            message: 'Subject updated successfully',
            data: mockSubjects[subjectIndex],
          },
        };
      },
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Subject', id }],
    }),

    assignTeacher: builder.mutation<ApiResponse<Subject>, AssignTeacherData>({
      async queryFn({ subjectId, teacherId, classSchedule }) {
        await mockApiDelay(600);

        const subjectIndex = mockSubjects.findIndex(s => s.id === subjectId);
        const teacher = mockTeachers.find(t => t.id === teacherId);

        if (subjectIndex === -1) {
          return {
            error: {
              status: 404,
              data: { message: 'Subject not found' },
            },
          };
        }

        if (!teacher) {
          return {
            error: {
              status: 404,
              data: { message: 'Teacher not found' },
            },
          };
        }

        mockSubjects[subjectIndex] = {
          ...mockSubjects[subjectIndex],
          teacherId,
          teacherName: `${teacher.firstName} ${teacher.lastName}`,
          classSchedule,
          updatedAt: new Date().toISOString(),
        };

        return {
          data: {
            success: true,
            message: 'Teacher assigned successfully',
            data: mockSubjects[subjectIndex],
          },
        };
      },
      invalidatesTags: ['Subject'],
    }),

    unassignTeacher: builder.mutation<ApiResponse<Subject>, string>({
      async queryFn(subjectId) {
        await mockApiDelay(400);

        const subjectIndex = mockSubjects.findIndex(s => s.id === subjectId);
        if (subjectIndex === -1) {
          return {
            error: {
              status: 404,
              data: { message: 'Subject not found' },
            },
          };
        }

        mockSubjects[subjectIndex] = {
          ...mockSubjects[subjectIndex],
          teacherId: undefined,
          teacherName: undefined,
          classSchedule: undefined,
          updatedAt: new Date().toISOString(),
        };

        return {
          data: {
            success: true,
            message: 'Teacher unassigned successfully',
            data: mockSubjects[subjectIndex],
          },
        };
      },
      invalidatesTags: ['Subject'],
    }),

    deleteSubject: builder.mutation<ApiResponse<{ success: boolean }>, string>({
      async queryFn(id) {
        await mockApiDelay(400);

        const subjectIndex = mockSubjects.findIndex(s => s.id === id);
        if (subjectIndex === -1) {
          return {
            error: {
              status: 404,
              data: { message: 'Subject not found' },
            },
          };
        }

        mockSubjects.splice(subjectIndex, 1);

        return {
          data: {
            success: true,
            message: 'Subject deleted successfully',
            data: { success: true },
          },
        };
      },
      invalidatesTags: ['Subject'],
    }),
  }),
});

export const {
  useGetSubjectsQuery,
  useGetSubjectQuery,
  useGetTeachersQuery,
  useCreateSubjectMutation,
  useUpdateSubjectMutation,
  useAssignTeacherMutation,
  useUnassignTeacherMutation,
  useDeleteSubjectMutation,
} = subjectsApi;