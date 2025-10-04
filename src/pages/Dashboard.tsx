import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { fetchDashboardStats } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const { user, company } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getStats = async () => {
      try {
        setLoading(true);
        const response = await fetchDashboardStats('month');
        setStats(response.stats);
      } catch (error) {
        console.error('Failed to load dashboard stats:', error);
        toast({
          title: 'Error',
          description: 'Could not load dashboard data.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    getStats();
  }, [toast]);

  const StatCard = ({ title, value, change, icon: Icon, trend }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{change}</p>
      </CardContent>
    </Card>
  );

  const LoadingSkeleton = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
            <div className="h-4 w-4 bg-muted rounded-full animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="h-8 w-1/2 bg-muted rounded animate-pulse mb-2" />
            <div className="h-3 w-1/3 bg-muted rounded animate-pulse" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const getDashboardCards = () => {
    if (!stats) return null;

    const formattedTotalAmount = `${stats.currency} ${stats.totalAmount.toFixed(2)}`;
    const amountChangeText = `${stats.changes.amount >= 0 ? '+' : ''}${stats.changes.amount}% from last month`;
    const expenseCountChangeText = `${stats.changes.expenseCount >= 0 ? '+' : ''}${stats.changes.expenseCount}% from last month`;

    const commonStats = [
      { title: 'Total Expenses', value: formattedTotalAmount, change: amountChangeText, icon: DollarSign },
      { title: 'Pending', value: stats.pendingExpenses, change: 'Awaiting action', icon: Clock },
      { title: 'Approved', value: stats.approvedExpenses, change: expenseCountChangeText, icon: CheckCircle2 },
      { title: 'Rejected', value: stats.rejectedExpenses, change: 'This month', icon: XCircle },
    ];
    
    // Customize titles based on role
    if (user?.role === 'manager') {
        commonStats[0].title = 'Team Expenses (incl. yours)';
        commonStats[1].title = 'Pending Your Approval';
    } else if (user?.role === 'admin') {
        commonStats[0].title = 'Total Company Expenses';
        commonStats[1].title = 'Total Pending Approvals';
    }
    
    return commonStats.map((stat) => <StatCard key={stat.title} {...stat} />);
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name}!</h1>
          <p className="text-muted-foreground">Here's what's happening with your expenses today.</p>
        </div>

        {loading ? <LoadingSkeleton /> : <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{getDashboardCards()}</div>}

        <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest expense activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Navigate to "My Expenses" to view all your expense claims, or click "New Expense" to create a new one.
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Quick Tips</CardTitle>
                <CardDescription>Get the most out of the system</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Upload receipts using OCR for faster submission.</li>
                  <li>• Submit expenses in any currency; they will be converted automatically.</li>
                  <li>• Track your approval status in real-time from the "My Expenses" page.</li>
                </ul>
              </CardContent>
            </Card>
          </div>
      </div>
    </Layout>
  );
};

export default Dashboard;