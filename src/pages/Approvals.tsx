import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { CheckCircle2, XCircle, Eye, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { fetchPendingApprovals, convertCurrency, approveExpense, rejectExpense } from '../services/api';
import { useToast } from '../hooks/use-toast';

const Approvals = () => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [rejectionComment, setRejectionComment] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [convertedAmounts, setConvertedAmounts] = useState<{ [key: string]: number }>({});
  const { company } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const loadApprovals = async () => {
      try {
        setLoading(true);
        const response = await fetchPendingApprovals();
        setExpenses(response.expenses || []);
      } catch (error) {
        console.error("Failed to load approvals:", error);
        toast({
          title: 'Error',
          description: 'Could not fetch pending approvals.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    loadApprovals();
  }, [toast]);


  useEffect(() => {
    const convertAllAmounts = async () => {
      if (!company?.currency || expenses.length === 0) return;

      const converted: { [key: string]: number } = {};
      for (const expense of expenses) {
        if (expense.currency !== company.currency) {
          try {
            converted[expense._id] = await convertCurrency(expense.amount, expense.currency, company.currency);
          } catch (error) {
            console.error(`Failed to convert currency for expense ${expense._id}`, error);
            converted[expense._id] = expense.amount; // fallback to original amount
          }
        } else {
          converted[expense._id] = expense.amount;
        }
      }
      setConvertedAmounts(converted);
    };
    convertAllAmounts();
  }, [expenses, company]);

  const handleApprove = async (expenseId: string) => {
    try {
      await approveExpense(expenseId);
      setExpenses(expenses.filter(e => e._id !== expenseId));
      toast({
        title: 'Expense approved',
        description: 'The expense has been approved successfully.',
      });
      setSelectedExpense(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve expense.',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async () => {
    if (!selectedExpense || !rejectionComment.trim()) {
      toast({
        title: 'Comment required',
        description: 'Please provide a reason for rejection.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await rejectExpense(selectedExpense._id, rejectionComment);
      setExpenses(expenses.filter(e => e._id !== selectedExpense._id));
      toast({
        title: 'Expense rejected',
        description: 'The expense has been rejected.',
      });
      setShowRejectDialog(false);
      setSelectedExpense(null);
      setRejectionComment('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject expense.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pending Approvals</h1>
          <p className="text-muted-foreground">Review and approve expense claims from your team</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Awaiting Your Approval</CardTitle>
            <CardDescription>
              {expenses.length} {expenses.length === 1 ? 'expense' : 'expenses'} pending review
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Original Amount</TableHead>
                    <TableHead>In {company?.currency}</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        No pending approvals
                      </TableCell>
                    </TableRow>
                  ) : (
                    expenses.map((expense) => (
                      <TableRow key={expense._id}>
                        <TableCell className="font-medium">{expense.employeeId.name}</TableCell>
                        <TableCell>{new Date(expense.expenseDate).toLocaleDateString()}</TableCell>
                        <TableCell>{expense.category}</TableCell>
                        <TableCell className="max-w-xs truncate">{expense.description}</TableCell>
                        <TableCell>
                          {expense.currency} {expense.amount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {company?.currency} {convertedAmounts[expense._id]?.toFixed(2) || '...'}
                          {expense.currency !== company?.currency && (
                            <span className="text-xs text-muted-foreground ml-1">(converted)</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedExpense(expense)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="default"
                              className="bg-success hover:bg-success/90"
                              onClick={() => handleApprove(expense._id)}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                setSelectedExpense(expense);
                                setShowRejectDialog(true);
                              }}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Expense Details Dialog */}
        <Dialog open={!!selectedExpense && !showRejectDialog} onOpenChange={(open) => !open && setSelectedExpense(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Expense Details</DialogTitle>
              <DialogDescription>Review the expense information</DialogDescription>
            </DialogHeader>
            {selectedExpense && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Employee</Label>
                    <p className="font-medium">{selectedExpense.employeeId.name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Date</Label>
                    <p className="font-medium">{new Date(selectedExpense.expenseDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Category</Label>
                    <p className="font-medium">{selectedExpense.category}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Amount</Label>
                    <p className="font-medium">
                      {selectedExpense.currency} {selectedExpense.amount.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Description</Label>
                  <p className="mt-1">{selectedExpense.description}</p>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    className="flex-1 bg-success hover:bg-success/90"
                    onClick={() => handleApprove(selectedExpense._id)}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => setShowRejectDialog(true)}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Expense</DialogTitle>
              <DialogDescription>Please provide a reason for rejecting this expense</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rejection-comment">Rejection Reason</Label>
                <Textarea
                  id="rejection-comment"
                  value={rejectionComment}
                  onChange={(e) => setRejectionComment(e.target.value)}
                  placeholder="Please provide itemized receipt..."
                  rows={4}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowRejectDialog(false);
                    setRejectionComment('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleReject}
                >
                  Confirm Rejection
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Approvals;