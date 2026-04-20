import { useMemo, useState } from 'react';
import { AnimatedOutlet } from '@/core/routing/AnimatedOutlet';
import { cn } from '@/shared/lib/utils';
import { Sidebar } from './Sidebar';
import { Header } from './TopBar';
import { Button } from '@/shared/components/ui/button';
import { useAuth } from '@/providers/auth-provider';

export function PrivateLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { user, logout } = useAuth();

  const headerActions = useMemo(
    () => (
      <div className="flex flex-wrap items-center gap-3">
        {user ? (
          <div className="rounded-full border border-border px-3 py-1 text-sm text-muted-foreground">
            {user.fullName} • {user.role}
          </div>
        ) : null}
        <Button variant="outline" size="sm" onClick={logout}>
          Logout
        </Button>
      </div>
    ),
    [logout, user]
  );

  return (
    <div className="bg-background lg:h-svh lg:overflow-hidden">
      <Sidebar isCollapsed={isSidebarCollapsed} />

      <div
        className={cn(
          "transition-all duration-300 lg:h-svh",
          isSidebarCollapsed ? "lg:pl-20" : "lg:pl-64"
        )}
      >
        <main className="flex min-h-svh flex-col p-4 md:p-6 lg:h-svh lg:overflow-hidden">
          <Header
            actions={headerActions}
            isSidebarCollapsed={isSidebarCollapsed}
            toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
          <div className="mt-6 flex-1 overflow-y-auto pr-1">
            <AnimatedOutlet />
          </div>
        </main>
      </div>
    </div>
  );
}
