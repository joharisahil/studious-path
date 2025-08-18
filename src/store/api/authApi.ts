import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { LoginCredentials, RegisterData, User, ApiResponse } from '../../types';

// Mock API base
const mockApiDelay = (ms: number = 1000) => new Promise(resolve => setTimeout(resolve, ms));

// Mock users data
const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@school.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    avatar: '',
    phone: '+1234567890',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    email: 'teacher@school.com',
    firstName: 'John',
    lastName: 'Teacher',
    role: 'teacher',
    avatar: '',
    phone: '+1234567891',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    email: 'student@school.com',
    firstName: 'Jane',
    lastName: 'Student',
    role: 'student',
    avatar: '',
    phone: '+1234567892',
    dateOfBirth: '2005-01-01',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '4',
    email: 'parent@school.com',
    firstName: 'Robert',
    lastName: 'Parent',
    role: 'parent',
    avatar: '',
    phone: '+1234567893',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/auth',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Auth'],
  endpoints: (builder) => ({
    login: builder.mutation<
      ApiResponse<{ user: User; token: string }>,
      LoginCredentials
    >({
      async queryFn(credentials) {
        await mockApiDelay(800);

        // Mock authentication logic
        const user = mockUsers.find(
          (u) => u.email === credentials.email && u.role === credentials.role
        );

        if (!user) {
          return {
            error: {
              status: 401,
              data: { message: 'Invalid credentials or role' },
            },
          };
        }

        // Mock token generation
        const token = `mock-jwt-token-${user.id}`;

        return {
          data: {
            success: true,
            message: 'Login successful',
            data: { user, token },
          },
        };
      },
      invalidatesTags: ['Auth'],
    }),

    register: builder.mutation<ApiResponse<{ user: User; token: string }>, RegisterData>({
      async queryFn(userData) {
        await mockApiDelay(1000);

        // Check if user already exists
        const existingUser = mockUsers.find((u) => u.email === userData.email);
        if (existingUser) {
          return {
            error: {
              status: 400,
              data: { message: 'User already exists with this email' },
            },
          };
        }

        // Create new user
        const newUser: User = {
          id: (mockUsers.length + 1).toString(),
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
          avatar: '',
          phone: '',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        mockUsers.push(newUser);
        const token = `mock-jwt-token-${newUser.id}`;

        return {
          data: {
            success: true,
            message: 'Registration successful',
            data: { user: newUser, token },
          },
        };
      },
      invalidatesTags: ['Auth'],
    }),

    verifyToken: builder.query<ApiResponse<User>, string>({
      async queryFn(token) {
        await mockApiDelay(300);

        // Extract user ID from mock token
        const userId = token.replace('mock-jwt-token-', '');
        const user = mockUsers.find((u) => u.id === userId);

        if (!user) {
          return {
            error: {
              status: 401,
              data: { message: 'Invalid token' },
            },
          };
        }

        return {
          data: {
            success: true,
            message: 'Token valid',
            data: user,
          },
        };
      },
      providesTags: ['Auth'],
    }),

    updateProfile: builder.mutation<ApiResponse<User>, Partial<User> & { id: string }>({
      async queryFn(userData) {
        await mockApiDelay(500);

        const userIndex = mockUsers.findIndex((u) => u.id === userData.id);
        if (userIndex === -1) {
          return {
            error: {
              status: 404,
              data: { message: 'User not found' },
            },
          };
        }

        mockUsers[userIndex] = {
          ...mockUsers[userIndex],
          ...userData,
          updatedAt: new Date().toISOString(),
        };

        return {
          data: {
            success: true,
            message: 'Profile updated successfully',
            data: mockUsers[userIndex],
          },
        };
      },
      invalidatesTags: ['Auth'],
    }),

    changePassword: builder.mutation<
      ApiResponse<{ success: boolean }>,
      { currentPassword: string; newPassword: string }
    >({
      async queryFn(passwordData) {
        await mockApiDelay(500);

        // Mock password change logic
        return {
          data: {
            success: true,
            message: 'Password changed successfully',
            data: { success: true },
          },
        };
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useVerifyTokenQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
} = authApi;