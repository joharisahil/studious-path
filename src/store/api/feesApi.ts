import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { FeeRecord, Payment, ApiResponse } from '../../types';

const mockFeeRecords: FeeRecord[] = [
  {
    id: '1',
    studentId: '1',
    studentName: 'Jane Student',
    academicYear: '2024-25',
    grade: '10',
    totalFee: 15000,
    paidAmount: 10000,
    dueAmount: 5000,
    payments: [
      {
        id: '1',
        amount: 10000,
        paymentDate: '2024-01-15T00:00:00Z',
        paymentMethod: 'bank_transfer',
        receiptNumber: 'RCP001',
        collectedBy: 'admin',
        transactionId: 'TXN001',
      }
    ],
    status: 'partial',
    lastPaymentDate: '2024-01-15T00:00:00Z',
  },
];

const mockApiDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const feesApi = createApi({
  reducerPath: 'feesApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/fees' }),
  tagTypes: ['Fee', 'Payment'],
  endpoints: (builder) => ({
    getFeeRecords: builder.query<ApiResponse<FeeRecord[]>, { studentId?: string }>({
      async queryFn() {
        await mockApiDelay();
        
        return {
          data: {
            success: true,
            message: 'Fee records retrieved successfully',
            data: mockFeeRecords,
          },
        };
      },
      providesTags: ['Fee'],
    }),

    recordPayment: builder.mutation<ApiResponse<Payment>, { feeRecordId: string; amount: number; paymentMethod: Payment['paymentMethod']; transactionId?: string }>({
      async queryFn({ feeRecordId, amount, paymentMethod, transactionId }) {
        await mockApiDelay(600);

        const payment: Payment = {
          id: Date.now().toString(),
          amount,
          paymentDate: new Date().toISOString(),
          paymentMethod,
          transactionId,
          receiptNumber: `RCP${Date.now()}`,
          collectedBy: 'current-user',
        };

        return {
          data: {
            success: true,
            message: 'Payment recorded successfully',
            data: payment,
          },
        };
      },
      invalidatesTags: ['Fee', 'Payment'],
    }),
  }),
});

export const {
  useGetFeeRecordsQuery,
  useRecordPaymentMutation,
} = feesApi;