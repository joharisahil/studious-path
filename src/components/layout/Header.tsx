import { useSelector } from 'react-redux';
import { Bell, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { RootState } from '@/store';
import { Skeleton } from '@/components/ui/skeleton';

export const Header = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { notifications } = useSelector((state: RootState) => state.ui) || { notifications: [] };

  const unreadCount = notifications?.filter(n => !n.read).length ?? 0;

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm px-6 flex items-center justify-between">
      {/* Left Section - Search */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search students, courses, assignments..."
            className="pl-10 bg-background/50"
          />
        </div>
      </div>

      {/* Right Section - Actions & Profile */}
      <div className="flex items-center gap-3">
        {/* Quick Add Button */}
        <Button size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Quick Add</span>
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>

        {/* Profile Info */}
        <div className="flex items-center gap-3 pl-3 border-l border-border">
          {!user ? (
            <Skeleton className="h-8 w-32 rounded-md" />
          ) : (
            <>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium">
                  {user?.firstName ?? ''} {user?.lastName ?? ''}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {user?.role ?? ''}
                </p>
              </div>
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-medium text-sm">
                  {user?.firstName?.[0] ?? ''}{user?.lastName?.[0] ?? ''}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
