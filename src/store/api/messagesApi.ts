import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Message, Announcement, ApiResponse } from '../../types';

const mockMessages: Message[] = [];
const mockAnnouncements: Announcement[] = [
  {
    id: '1',
    title: 'Welcome to New Academic Year',
    content: 'We welcome all students and parents to the new academic year 2024-25. Please review the updated guidelines and schedule.',
    authorId: '1',
    authorName: 'Admin User',
    targetAudience: ['student', 'parent', 'teacher'],
    priority: 'high',
    attachments: [],
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

const mockApiDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const messagesApi = createApi({
  reducerPath: 'messagesApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/messages' }),
  tagTypes: ['Message', 'Announcement'],
  endpoints: (builder) => ({
    getMessages: builder.query<ApiResponse<Message[]>, { userId?: string }>({
      async queryFn() {
        await mockApiDelay();
        
        return {
          data: {
            success: true,
            message: 'Messages retrieved successfully',
            data: mockMessages,
          },
        };
      },
      providesTags: ['Message'],
    }),

    getAnnouncements: builder.query<ApiResponse<Announcement[]>, { role?: string }>({
      async queryFn() {
        await mockApiDelay();
        
        return {
          data: {
            success: true,
            message: 'Announcements retrieved successfully',
            data: mockAnnouncements,
          },
        };
      },
      providesTags: ['Announcement'],
    }),

    sendMessage: builder.mutation<ApiResponse<Message>, Omit<Message, 'id' | 'isRead' | 'isStarred' | 'sentAt'>>({
      async queryFn(messageData) {
        await mockApiDelay(400);

        const newMessage: Message = {
          ...messageData,
          id: Date.now().toString(),
          isRead: false,
          isStarred: false,
          sentAt: new Date().toISOString(),
        };

        mockMessages.push(newMessage);

        return {
          data: {
            success: true,
            message: 'Message sent successfully',
            data: newMessage,
          },
        };
      },
      invalidatesTags: ['Message'],
    }),
  }),
});

export const {
  useGetMessagesQuery,
  useGetAnnouncementsQuery,
  useSendMessageMutation,
} = messagesApi;