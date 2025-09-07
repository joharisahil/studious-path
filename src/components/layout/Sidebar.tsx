import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  GraduationCap,
  LayoutDashboard,
  Users,
  UserCheck,
  BookOpen,
  Calendar,
  FileText,
  CreditCard,
  MessageSquare,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  School,
  Book,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RootState } from '@/store';
import { logout } from '@/store/slices/authSlice';
import { toggleSidebar } from '@/store/slices/uiSlice';
import { UserRole } from '@/types';
import { cn } from '@/lib/utils';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  path: string;
  roles: UserRole[];
}

const sidebarItems: SidebarItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['admin','teacher','student','parent'] },
  { id: 'students', label: 'Students', icon: Users, path: '/students', roles: ['admin','teacher'] },
  { id: 'teachers', label: 'Teachers', icon: UserCheck, path: '/teachers', roles: ['admin'] },
  { id: 'classes', label: 'Classes', icon: School, path: '/classes', roles: ['admin'] },
  { id: 'subjects', label: 'Subjects', icon: Book, path: '/subjects', roles: ['admin','teacher'] },
  { id: 'courses', label: 'Courses', icon: BookOpen, path: '/courses', roles: ['admin','teacher','student'] },
  { id: 'timetable', label: 'Timetable', icon: Calendar, path: '/timetable', roles: ['admin','teacher'] },
  { id: 'attendance', label: 'Attendance', icon: Calendar, path: '/attendance', roles: ['admin','teacher','student','parent'] },
  { id: 'assignments', label: 'Assignments', icon: FileText, path: '/assignments', roles: ['admin','teacher','student'] },
  { id: 'exams', label: 'Exams', icon: FileText, path: '/exams', roles: ['admin','teacher','student','parent'] },
  { id: 'fees', label: 'Fees', icon: CreditCard, path: '/fees', roles: ['admin','student','parent'] },
  { id: 'messages', label: 'Messages', icon: MessageSquare, path: '/messages', roles: ['admin','teacher','student','parent'] },
];

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { user } = useSelector((state: RootState) => state.auth);
  const { sidebarCollapsed } = useSelector((state: RootState) => state.ui);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const filteredItems = sidebarItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  const isActivePath = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname.startsWith('/dashboard');
    }
    return location.pathname.startsWith(path);
  };

  // --- derive safe initials ---
  const initials = user
    ? (user.firstName?.[0] || user.email?.[0] || '').toUpperCase()
      + (user.lastName?.[0] || '')
    : '';

  return (
    <aside
      className={cn(
        "bg-card border-r border-border flex flex-col transition-all duration-300 relative",
        sidebarCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-5 h-5 text-primary-foreground" />
          </div>
          {!sidebarCollapsed && (
            <div>
              <h1 className="font-bold text-lg text-gradient-primary">EduManage</h1>
              <p className="text-xs text-muted-foreground capitalize">
                {user?.role} Portal
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => dispatch(toggleSidebar())}
        className={cn(
          "absolute -right-3 top-20 z-10 w-6 h-6 rounded-full border border-border bg-background shadow-sm hover:bg-accent",
          sidebarCollapsed && "right-2"
        )}
      >
        {sidebarCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </Button>

      {/* User Info */}
      {!sidebarCollapsed && user && (
        <div className="p-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-medium text-sm">
                {initials || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">
                {user.firstName && user.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user.email}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActivePath(item.path);

          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "w-full justify-start h-11",
                sidebarCollapsed && "justify-center px-2",
                isActive && "bg-primary text-primary-foreground shadow-sm"
              )}
              onClick={() => {
                if (item.path === '/dashboard') {
                  navigate(`${item.path}/${user?.role}`);
                } else {
                  navigate(item.path);
                }
              }}
            >
              <Icon className={cn("w-5 h-5", !sidebarCollapsed && "mr-3")} />
              {!sidebarCollapsed && (
                <span className="font-medium">{item.label}</span>
              )}
            </Button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 space-y-2 border-t border-border">
        <Button
          variant="ghost"
          className={cn("w-full justify-start h-11", sidebarCollapsed && "justify-center px-2")}
          onClick={() => navigate('/settings')}
        >
          <Settings className={cn("w-5 h-5", !sidebarCollapsed && "mr-3")} />
          {!sidebarCollapsed && <span>Settings</span>}
        </Button>

        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start h-11 text-destructive hover:text-destructive hover:bg-destructive-light",
            sidebarCollapsed && "justify-center px-2"
          )}
          onClick={handleLogout}
        >
          <LogOut className={cn("w-5 h-5", !sidebarCollapsed && "mr-3")} />
          {!sidebarCollapsed && <span>Logout</span>}
        </Button>
      </div>
    </aside>
  );
};
