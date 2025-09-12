import { configureStore } from '@reduxjs/toolkit';
import { authApi } from './api/authApi';
import { studentsApi } from './api/studentsApi';
import { coursesApi } from './api/coursesApi';
import { classesApi } from './api/classesApi';
import { attendanceApi } from './api/attendanceApi';
import { assignmentsApi } from './api/assignmentsApi';
import { feesApi } from './api/feesApi';
import { messagesApi } from './api/messagesApi';
import { subjectsApi } from './api/subjectsApi';
import { timetableApi } from './api/timetableApi';
import { teachersApi } from './api/teachersApi';

import authSlice from './slices/authSlice';
import uiSlice from './slices/uiSlice';

// ✅ import our messages slice


export const store = configureStore({
  reducer: {
    // RTK Query API reducers
    [authApi.reducerPath]: authApi.reducer,
    [studentsApi.reducerPath]: studentsApi.reducer,
    [teachersApi.reducerPath]: teachersApi.reducer,
    [coursesApi.reducerPath]: coursesApi.reducer,
    [classesApi.reducerPath]: classesApi.reducer,
    [attendanceApi.reducerPath]: attendanceApi.reducer,
    [assignmentsApi.reducerPath]: assignmentsApi.reducer,
    [feesApi.reducerPath]: feesApi.reducer,
    [messagesApi.reducerPath]: messagesApi.reducer,
    [subjectsApi.reducerPath]: subjectsApi.reducer,
    [timetableApi.reducerPath]: timetableApi.reducer,

    // Regular slices
    auth: authSlice,
    ui: uiSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/REGISTER',
        ],
      },
    }).concat(
      authApi.middleware,
      studentsApi.middleware,
      teachersApi.middleware,
      coursesApi.middleware,
      classesApi.middleware,
      attendanceApi.middleware,
      assignmentsApi.middleware,
      feesApi.middleware,
      messagesApi.middleware,
      subjectsApi.middleware,
      timetableApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
