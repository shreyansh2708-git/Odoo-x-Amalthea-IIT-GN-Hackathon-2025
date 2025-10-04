import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';

const Dashboard = () => {
  const { user, company } = useAuth();

  // Role-specific stats
  const getStatsForRole = () => {
    if (user?.role === 'employee') {
      return [
        {
          title: 'My Total Expenses',
          value: `${company?.currency} 2,450`,
          change: 'This month',
          icon: DollarSign,
          trend: 'up',
        },
        {
          title: 'Pending Expenses',
          value: '3',
          change: 'Awaiting approval',
          icon: Clock,
          trend: 'neutral',
        },
        {
          title: 'Approved Expenses',
          value: '12',
          change: 'This month',
          icon: CheckCircle2,
          trend: 'up',
        },
        {
          title: 'Average Approval Time',
          value: '1.8 days',
          change: 'For your expenses',
          icon: TrendingUp,
          trend: 'up',
        },
      ];
    }

    if (user?.role === 'manager') {
      return [
        {
          title: 'Team Expenses',
          value: `${company?.currency} 8,450`,
          change: '+15% from last month',
          icon: DollarSign,
          trend: 'up',
        },
        {
          title: 'Pending Approvals',
          value: '5',
          change: 'Require your action',
          icon: Clock,
          trend: 'neutral',
        },
        {
          title: 'Approved This Month',
          value: '18',
          change: '+10% from last month',
          icon: CheckCircle2,
          trend: 'up',
        },
        {
          title: 'Your Approval Time',
          value: '1.2 days',
          change: 'Average response',
          icon: TrendingUp,
          trend: 'up',
        },
      ];
    }

    // Admin stats
    return [
      {
        title: 'Total Company Expenses',
        value: `${company?.currency} 45,890`,
        change: '+12% from last month',
        icon: DollarSign,
        trend: 'up',
      },
      {
        title: 'Pending Approvals',
        value: '15',
        change: 'Across all departments',
        icon: Clock,
        trend: 'neutral',
      },
      {
        title: 'Approved This Month',
        value: '87',
        change: '+8% from last month',
        icon: CheckCircle2,
        trend: 'up',
      },
      {
        title: 'Average Processing Time',
        value: '2.4 days',
        change: '-0.5 days improvement',
        icon: TrendingUp,
        trend: 'up',
      },
    ];
  };

  const stats = getStatsForRole();

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name}!</h1>
          <p className="text-muted-foreground">Here's what's happening with your expenses today.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {user?.role === 'employee' && (
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Expenses</CardTitle>
                <CardDescription>Your latest submitted expenses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Navigate to "My Expenses" to view all your expense claims, or click "Submit Expense" to create a new one.
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
                  <li>• Upload receipts for faster processing</li>
                  <li>• Submit expenses in any currency</li>
                  <li>• Track your approval status in real-time</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        {user?.role === 'manager' && (
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Pending Approvals</CardTitle>
                <CardDescription>Expenses waiting for your review</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Navigate to "Approvals" to review and approve expense claims from your team members.
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Your Expenses</CardTitle>
                <CardDescription>Manage your own expense claims</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  As a manager, you can also submit and track your own expenses through "My Expenses".
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {user?.role === 'admin' && (
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Pending Approvals</CardTitle>
                <CardDescription>Company-wide expenses requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Review and approve expenses across all departments. You have override permissions.
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Admin Tools</CardTitle>
                <CardDescription>Manage your organization</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Add and manage users</li>
                  <li>• Configure approval workflows</li>
                  <li>• View all company expenses</li>
                  <li>• Set up approval rules</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
