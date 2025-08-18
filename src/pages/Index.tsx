import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect to appropriate dashboard based on role
      const dashboardRoutes = {
        admin: '/dashboard/admin',
        teacher: '/dashboard/teacher',
        student: '/dashboard/student', 
        parent: '/dashboard/parent',
      };
      navigate(dashboardRoutes[user.role], { replace: true });
    } else {
      // Redirect to login if not authenticated
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Loading EduManage Pro...</p>
      </div>
    </div>
  );
};

export default Index;
