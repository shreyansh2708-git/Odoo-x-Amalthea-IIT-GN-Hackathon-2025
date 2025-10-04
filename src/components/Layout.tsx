import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Receipt,
  Users,
  Settings,
  LogOut,
  Wallet,
  FileText,
  Plus,
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', roles: ['admin', 'manager', 'employee'] },
    { icon: Plus, label: 'Submit Expense', path: '/submit-expense', roles: ['employee', 'manager', 'admin'] },
    { icon: Receipt, label: 'My Expenses', path: '/expenses', roles: ['employee', 'manager', 'admin'] },
    { icon: FileText, label: 'Approvals', path: '/approvals', roles: ['manager', 'admin'] },
    { icon: Users, label: 'Users', path: '/users', roles: ['admin'] },
    { icon: Settings, label: 'Workflow', path: '/workflow', roles: ['admin'] },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role || 'employee')
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-2 border-b border-border px-6">
            <Wallet className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Expenzify</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Button
                  key={item.path}
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={`w-full justify-start ${
                    isActive ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''
                  }`}
                  onClick={() => navigate(item.path)}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.label}
                </Button>
              );
            })}
          </nav>

          {/* User section */}
          <div className="border-t border-border p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium">{user?.name}</p>
                <p className="truncate text-xs text-muted-foreground capitalize">{user?.role}</p>
              </div>
              <ThemeToggle />
            </div>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 min-h-screen">
        <div className="container mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
