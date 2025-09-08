import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RegisterData, LoginCredentials } from '@/types';

// Create API
export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://school-erp-backend-kxsv.onrender.com/api/v1' }), // your backend URL
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
