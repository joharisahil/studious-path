import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Provider } from 'react-redux';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { store } from '@/store';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm'; // ✅ import register form
import { MainLayout } from '@/components/layout/MainLayout';
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import FeeReport from '@/components/reports/FeeReport';
import Analytics from '@/components/analytics/Analytics';
import AttendanceManagement from '@/components/attendance/AttendanceManagement';
import StudentsManagement from '@/components/students/StudentsManagement';
import TeachersManagement from '@/components/teachers/TeachersManagement';
import { FeesManagement } from '@/components/fees';
import { ClassManagement } from '@/components/classes';
import { SubjectManagement } from '@/components/subjects';
import { loginSuccess } from '@/store/slices/authSlice';
import { TimetableManagement } from './components/timetable/TimetableManagement';
import MessageCenter from './components/Messages/MessageCenter';
import { ExamManagement } from '@/components/exams';

// App content component
const AppContent = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      if (token.startsWith('mock-jwt-token-')) {
        const userId = token.replace('mock-jwt-token-', '');

        const mockUsers = {
          '1': { id: '1', email: 'admin@school.com', firstName: 'Admin', lastName: 'User', role: 'admin' as const },
          '2': { id: '2', email: 'teacher@school.com', firstName: 'John', lastName: 'Teacher', role: 'teacher' as const },
          '3': { id: '3', email: 'student@school.com', firstName: 'Jane', lastName: 'Student', role: 'student' as const },
          '4': { id: '4', email: 'parent@school.com', firstName: 'Robert', lastName: 'Parent', role: 'parent' as const },
        };

        const user = mockUsers[userId as keyof typeof mockUsers];
        if (user) {
          dispatch(loginSuccess({
            user: {
              ...user,
              avatar: '',
              phone: '+1234567890',
              isActive: true,
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-01T00:00:00Z',
            },
            token,
          }));
        }
      }
    }
  }, [dispatch]);

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route
            path="/login"
            element={
              <ProtectedRoute requireAuth={false}>
                <LoginForm />
              </ProtectedRoute>
            }
          />

          <Route
            path="/register"
            element={
              <ProtectedRoute requireAuth={false}>
                <RegisterForm />   {/* ✅ new register route */}
              </ProtectedRoute>
            }
          />

          {/* Protected routes with layout */}
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <MainLayout>
                  <AdminDashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/dashboard/teacher"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <MainLayout>
                 <TeachersManagement/>
                </MainLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/dashboard/student"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <MainLayout>
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-gradient-primary mb-4">Student Dashboard</h2>
                    <p className="text-muted-foreground">Coming soon...</p>
                  </div>
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/parent"
            element={
              <ProtectedRoute allowedRoles={['parent']}>
                <MainLayout>
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-gradient-primary mb-4">Parent Dashboard</h2>
                    <p className="text-muted-foreground">Coming soon...</p>
                  </div>
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Feature routes */}
          <Route
            path="/students"
            element={
              <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                <MainLayout>
                  <StudentsManagement />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/teachers"
            element={
              <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                <MainLayout>
                  <TeachersManagement />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports/fees"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <MainLayout>
                  <FeeReport />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/analytics"
            element={
              <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                <MainLayout>
                  <Analytics />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/attendance"
            element={
              <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                <MainLayout>
                  <AttendanceManagement />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/fees"
            element={
              <ProtectedRoute allowedRoles={['admin', 'student', 'parent']}>
                <MainLayout>
                  <FeesManagement />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/classes"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <MainLayout>
                  <ClassManagement />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/subjects"
            element={
              <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                <MainLayout>
                  <SubjectManagement />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/timetable"
            element={
              <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                <MainLayout>
                  <TimetableManagement />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/exams"
            element={
              <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                <MainLayout>
                  <ExamManagement />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/messages"
            element={
              <ProtectedRoute allowedRoles={['admin', 'teacher', 'student', 'parent']}>
                 <MainLayout>
                  <MessageCenter />
                </MainLayout>
             </ProtectedRoute>
              }
             />


          {/* Catch all - redirect to appropriate dashboard or login */}
          {/* Catch all */}
          <Route
            path="*"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <AdminDashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  );
};

const App = () => (
  <Provider store={store}>
    <AppContent />
  </Provider>
);

export default App;
