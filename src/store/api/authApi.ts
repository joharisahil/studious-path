import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RegisterData, LoginCredentials } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
// Create API
export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }), // your backend URL
  endpoints: (builder) => ({
    // Admin Registration
    registerAdmin: builder.mutation<{ success: boolean; message: string }, RegisterData>({
      query: (data) => ({
        url: '/register/admin',
        method: 'POST',
        body: data,
      }),
    }),
    // Login for all roles
    loginAdmin: builder.mutation<{ success: boolean; token: string; user: any }, LoginCredentials>({
      query: (data) => ({
        url: '/register/signin',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const { useRegisterAdminMutation, useLoginAdminMutation } = authApi;
