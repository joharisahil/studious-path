import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  requireAuth?: boolean;
}

export const ProtectedRoute = ({ 
  children, 
  allowedRoles,
  requireAuth = true 
}: ProtectedRouteProps) => {
  const location = useLocation();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user is authenticated but trying to access login/register pages
  if (!requireAuth && isAuthenticated) {
    // Redirect to appropriate dashboard based on user role
    const dashboardRoutes = {
      admin: '/dashboard/admin',
      teacher: '/dashboard/teacher',
      student: '/dashboard/student',
      parent: '/dashboard/parent',
    };
    
    return <Navigate to={dashboardRoutes[user!.role]} replace />;
  }

  // If specific roles are required, check if user has the required role
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};