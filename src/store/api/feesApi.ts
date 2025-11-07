import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { FeeRecord, Payment, ApiResponse, FeeStructure } from '../../types';

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
    collectionPeriod: 'monthly',
    nextDueDate: '2024-03-15T00:00:00Z',
    payments: [
      {
        id: '1',
        amount: 10000,
        paymentDate: '2024-01-15T00:00:00Z',
        paymentMethod: 'Bank Transfer',
        receiptNumber: 'RCP001',
        collectedBy: 'admin',
        transactionId: 'TXN001',
      }
    ],
    status: 'partial',
    lastPaymentDate: '2024-01-15T00:00:00Z',
  },
  {
    id: '2',
    studentId: '2',
    studentName: 'John Smith',
    academicYear: '2024-25',
    grade: '9',
    totalFee: 12000,
    paidAmount: 4000,
    dueAmount: 8000,
    collectionPeriod: 'quarterly',
    nextDueDate: '2024-02-10T00:00:00Z',
    payments: [
      {
        id: '2',
        amount: 4000,
        paymentDate: '2024-01-10T00:00:00Z',
        paymentMethod: 'Cash',
        receiptNumber: 'RCP002',
        collectedBy: 'admin',
      }
    ],
    status: 'overdue',
    lastPaymentDate: '2024-01-10T00:00:00Z',
  },
  {
    id: '3',
    studentId: '3',
    studentName: 'Alice Brown',
    academicYear: '2024-25',
    grade: '11',
    totalFee: 18000,
    paidAmount: 18000,
    dueAmount: 0,
    collectionPeriod: 'yearly',
    payments: [
      {
        id: '3',
        amount: 18000,
        paymentDate: '2024-01-05T00:00:00Z',
        paymentMethod: 'Online',
        receiptNumber: 'RCP003',
        collectedBy: 'admin',
        transactionId: 'TXN003',
      }
    ],
    status: 'paid',
    lastPaymentDate: '2024-01-05T00:00:00Z',
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

    getFeeStructure: builder.query<ApiResponse<FeeStructure[]>, { grade?: string }>({
      async queryFn({ grade }) {
        await mockApiDelay();
        
        const allStructures = [
          {
            id: '1',
            grade: '1',
            academicYear: '2024-25',
            tuitionFee: 8000,
            labFee: 500,
            libraryFee: 400,
            transportFee: 1500,
            otherFees: { 'Activity Fee': 300, 'Sports Fee': 200 },
            totalFee: 10900,
            paymentSchedule: [
              { installment: 1, dueDate: '2024-04-15T00:00:00Z', amount: 5450, description: 'First Installment' },
              { installment: 2, dueDate: '2024-08-15T00:00:00Z', amount: 5450, description: 'Second Installment' }
            ]
          },
          {
            id: '2',
            grade: '2',
            academicYear: '2024-25',
            tuitionFee: 8500,
            labFee: 600,
            libraryFee: 450,
            transportFee: 1500,
            otherFees: { 'Activity Fee': 350, 'Sports Fee': 250 },
            totalFee: 11650,
            paymentSchedule: [
              { installment: 1, dueDate: '2024-04-15T00:00:00Z', amount: 5825, description: 'First Installment' },
              { installment: 2, dueDate: '2024-08-15T00:00:00Z', amount: 5825, description: 'Second Installment' }
            ]
          },
          {
            id: '3',
            grade: '3',
            academicYear: '2024-25',
            tuitionFee: 9000,
            labFee: 700,
            libraryFee: 500,
            transportFee: 1600,
            otherFees: { 'Activity Fee': 400, 'Sports Fee': 300 },
            totalFee: 12500,
            paymentSchedule: [
              { installment: 1, dueDate: '2024-04-15T00:00:00Z', amount: 6250, description: 'First Installment' },
              { installment: 2, dueDate: '2024-08-15T00:00:00Z', amount: 6250, description: 'Second Installment' }
            ]
          },
          {
            id: '4',
            grade: '4',
            academicYear: '2024-25',
            tuitionFee: 9500,
            labFee: 800,
            libraryFee: 550,
            transportFee: 1700,
            otherFees: { 'Activity Fee': 450, 'Sports Fee': 350 },
            totalFee: 13350,
            paymentSchedule: [
              { installment: 1, dueDate: '2024-04-15T00:00:00Z', amount: 6675, description: 'First Installment' },
              { installment: 2, dueDate: '2024-08-15T00:00:00Z', amount: 6675, description: 'Second Installment' }
            ]
          },
          {
            id: '5',
            grade: '5',
            academicYear: '2024-25',
            tuitionFee: 10000,
            labFee: 900,
            libraryFee: 600,
            transportFee: 1800,
            otherFees: { 'Activity Fee': 500, 'Sports Fee': 400 },
            totalFee: 14200,
            paymentSchedule: [
              { installment: 1, dueDate: '2024-04-15T00:00:00Z', amount: 7100, description: 'First Installment' },
              { installment: 2, dueDate: '2024-08-15T00:00:00Z', amount: 7100, description: 'Second Installment' }
            ]
          },
          {
            id: '6',
            grade: '6',
            academicYear: '2024-25',
            tuitionFee: 10500,
            labFee: 1000,
            libraryFee: 650,
            transportFee: 1900,
            otherFees: { 'Activity Fee': 550, 'Sports Fee': 450 },
            totalFee: 15050,
            paymentSchedule: [
              { installment: 1, dueDate: '2024-04-15T00:00:00Z', amount: 7525, description: 'First Installment' },
              { installment: 2, dueDate: '2024-08-15T00:00:00Z', amount: 7525, description: 'Second Installment' }
            ]
          },
          {
            id: '7',
            grade: '7',
            academicYear: '2024-25',
            tuitionFee: 11000,
            labFee: 1200,
            libraryFee: 700,
            transportFee: 2000,
            otherFees: { 'Activity Fee': 600, 'Sports Fee': 500 },
            totalFee: 16000,
            paymentSchedule: [
              { installment: 1, dueDate: '2024-04-15T00:00:00Z', amount: 8000, description: 'First Installment' },
              { installment: 2, dueDate: '2024-08-15T00:00:00Z', amount: 8000, description: 'Second Installment' }
            ]
          },
          {
            id: '8',
            grade: '8',
            academicYear: '2024-25',
            tuitionFee: 11500,
            labFee: 1300,
            libraryFee: 750,
            transportFee: 2000,
            otherFees: { 'Activity Fee': 650, 'Computer Fee': 800 },
            totalFee: 17000,
            paymentSchedule: [
              { installment: 1, dueDate: '2024-04-15T00:00:00Z', amount: 8500, description: 'First Installment' },
              { installment: 2, dueDate: '2024-08-15T00:00:00Z', amount: 8500, description: 'Second Installment' }
            ]
          },
          {
            id: '9',
            grade: '9',
            academicYear: '2024-25',
            tuitionFee: 12000,
            labFee: 1500,
            libraryFee: 800,
            transportFee: 2000,
            otherFees: { 'Activity Fee': 500, 'Sports Fee': 300 },
            totalFee: 17100,
            paymentSchedule: [
              { installment: 1, dueDate: '2024-04-15T00:00:00Z', amount: 8550, description: 'First Installment' },
              { installment: 2, dueDate: '2024-08-15T00:00:00Z', amount: 8550, description: 'Second Installment' }
            ]
          },
          {
            id: '10', 
            grade: '10',
            academicYear: '2024-25',
            tuitionFee: 15000,
            labFee: 2000,
            libraryFee: 1000,
            transportFee: 2500,
            otherFees: { 'Exam Fee': 800, 'Computer Fee': 1200 },
            totalFee: 22500,
            paymentSchedule: [
              { installment: 1, dueDate: '2024-04-15T00:00:00Z', amount: 11250, description: 'First Installment' },
              { installment: 2, dueDate: '2024-08-15T00:00:00Z', amount: 11250, description: 'Second Installment' }
            ]
          },
          {
            id: '11',
            grade: '11',
            academicYear: '2024-25',
            tuitionFee: 18000,
            labFee: 2500,
            libraryFee: 1200,
            transportFee: 3000,
            otherFees: { 'Exam Fee': 1000, 'Computer Fee': 1500, 'Lab Equipment': 800 },
            totalFee: 28000,
            paymentSchedule: [
              { installment: 1, dueDate: '2024-04-15T00:00:00Z', amount: 14000, description: 'First Installment' },
              { installment: 2, dueDate: '2024-08-15T00:00:00Z', amount: 14000, description: 'Second Installment' }
            ]
          },
          {
            id: '12',
            grade: '12',
            academicYear: '2024-25',
            tuitionFee: 20000,
            labFee: 3000,
            libraryFee: 1500,
            transportFee: 3000,
            otherFees: { 'Board Exam Fee': 1500, 'Computer Fee': 1800, 'Lab Equipment': 1000, 'Career Guidance': 500 },
            totalFee: 32300,
            paymentSchedule: [
              { installment: 1, dueDate: '2024-04-15T00:00:00Z', amount: 16150, description: 'First Installment' },
              { installment: 2, dueDate: '2024-08-15T00:00:00Z', amount: 16150, description: 'Second Installment' }
            ]
          }
        ];

        const filteredStructures = grade && grade !== 'all' 
          ? allStructures.filter(s => s.grade === grade)
          : allStructures;
        
        return {
          data: {
            success: true,
            message: 'Fee structures retrieved successfully',
            data: filteredStructures,
          },
        };
      },
      providesTags: ['Fee'],
    }),

    updateFeeStructure: builder.mutation<ApiResponse<FeeStructure>, Partial<FeeStructure> & { id: string }>({
      async queryFn(feeStructure) {
        await mockApiDelay(600);

        return {
          data: {
            success: true,
            message: 'Fee structure updated successfully',
            data: feeStructure as FeeStructure,
          },
        };
      },
      invalidatesTags: ['Fee'],
    }),

    collectFee: builder.mutation<ApiResponse<Payment>, { 
      studentId: string; 
      amount: number; 
      paymentMethod: Payment['paymentMethod']; 
      month: string;
      transactionId?: string;
      notes?: string;
    }>({
      async queryFn({ studentId, amount, paymentMethod, month, transactionId, notes }) {
        await mockApiDelay(600);

        const payment: Payment = {
          id: Date.now().toString(),
          amount,
          paymentDate: new Date().toISOString(),
          paymentMethod,
          transactionId,
          receiptNumber: `RCP${Date.now()}`,
          collectedBy: 'current-user',
          notes: `Fee collection for ${month}${notes ? ' - ' + notes : ''}`,
        };

        return {
          data: {
            success: true,
            message: `Fee of ₹${amount} collected successfully for ${month}`,
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
  useGetFeeStructureQuery,
  useUpdateFeeStructureMutation,
  useCollectFeeMutation,
} = feesApi;