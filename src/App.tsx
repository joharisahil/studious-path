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
import { MainLayout } from '@/components/layout/MainLayout';
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import FeeReport from '@/components/reports/FeeReport';
import Analytics from '@/components/analytics/Analytics';
import AttendanceManagement from '@/components/attendance/AttendanceManagement';
import { loginSuccess } from '@/store/slices/authSlice';

// App content component (separate to use Redux hooks inside Provider)
const AppContent = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Check for existing token on app load
    const token = localStorage.getItem('token');
    if (token) {
      // In a real app, you'd verify the token with the backend
      // For now, we'll just check if it's a valid mock token
      if (token.startsWith('mock-jwt-token-')) {
        const userId = token.replace('mock-jwt-token-', '');
        
        // Mock user data based on token
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
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-gradient-primary mb-4">Teacher Dashboard</h2>
                    <p className="text-muted-foreground">Coming soon...</p>
                  </div>
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
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-gradient-primary mb-4">Student Management</h2>
                    <p className="text-muted-foreground">Coming soon...</p>
                  </div>
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

          {/* Catch all - redirect to appropriate dashboard or login */}
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