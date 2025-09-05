import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RegisterData, LoginCredentials } from '@/types';

// Create API
export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:4000/api/v1/register' }), // your backend URL
  endpoints: (builder) => ({
    // Admin Registration
    registerAdmin: builder.mutation<{ success: boolean; message: string }, RegisterData>({
      query: (data) => ({
        url: '/admin',
        method: 'POST',
        body: data,
      }),
    }),
    // Login for all roles
    loginAdmin: builder.mutation<{ success: boolean; token: string; user: any }, LoginCredentials>({
      query: (data) => ({
        url: '/signin',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const { useRegisterAdminMutation, useLoginAdminMutation } = authApi;
