import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { StatusBadge } from '../components/StatusBadge';
import { Plus, Loader2, Send, Trash2 } from 'lucide-react';
import { fetchExpenses, submitExpenseForApproval, deleteExpense } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/use-toast';

const Expenses = () => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const loadExpenses = async () => {
      try {
        setLoading(true);
        const response = await fetchExpenses();
        setExpenses(response.expenses || []);
      } catch (error) {
        console.error('Error loading expenses:', error);
        toast({
          title: 'Error',
          description: 'Failed to load expenses',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadExpenses();
  }, [toast]);

  const handleSubmitForApproval = async (expenseId: string) => {
    try {
      const response = await submitExpenseForApproval(expenseId);
      // Update the status of the submitted expense in the local state
      setExpenses(expenses.map(exp => 
        exp._id === expenseId ? { ...exp, status: 'pending', currentApproverId: response.expense.currentApproverId } : exp
      ));
      toast({
        title: 'Expense Submitted',
        description: 'Your expense is now pending approval.',
      });
    } catch (error: any) {
      toast({
        title: 'Submission Failed',
        description: error.message || 'Could not submit the expense for approval.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteDraft = async (expenseId: string) => {
    try {
      await deleteExpense(expenseId);
      setExpenses(expenses.filter(exp => exp._id !== expenseId));
      toast({
        title: 'Draft Deleted',
        description: 'The expense draft has been successfully deleted.',
      });
    } catch (error: any) {
       toast({
        title: 'Deletion Failed',
        description: error.message || 'Could not delete the expense draft.',
        variant: 'destructive',
      });
    }
  };


  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Expenses</h1>
            <p className="text-muted-foreground">View and manage your expense claims</p>
          </div>
          <Button onClick={() => navigate('/submit-expense')}>
            <Plus className="mr-2 h-4 w-4" />
            New Expense
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Expense History</CardTitle>
            <CardDescription>All your submitted expense claims</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading expenses...</span>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No expenses found
                      </TableCell>
                    </TableRow>
                  ) : (
                    expenses.map((expense) => (
                      <TableRow key={expense._id}>
                        <TableCell>{new Date(expense.expenseDate).toLocaleDateString()}</TableCell>
                        <TableCell>{expense.category}</TableCell>
                        <TableCell className="max-w-xs truncate">{expense.description}</TableCell>
                        <TableCell>
                          {expense.currency} {expense.amount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={expense.status as 'pending' | 'approved' | 'rejected' | 'processing' | 'draft'} />
                        </TableCell>
                        <TableCell>
                          {expense.status === 'draft' && (
                             <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => handleSubmitForApproval(expense._id)}>
                                  <Send className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => handleDeleteDraft(expense._id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Expenses;