import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import { Plus, X, MoveUp, MoveDown, Workflow as WorkflowIcon, Loader2 } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { fetchWorkflow, saveWorkflow, fetchUsers } from '../services/api';

const Workflow = () => {
  const [workflow, setWorkflow] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [availableApprovers, setAvailableApprovers] = useState<any[]>([]);

  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [workflowRes, usersRes] = await Promise.all([
          fetchWorkflow(),
          fetchUsers({ role: ['admin', 'manager'] })
        ]);
        
        setWorkflow(workflowRes.workflow);
        setAvailableApprovers(usersRes.users || []);

      } catch (error) {
        toast({ title: 'Error', description: 'Failed to load workflow data.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [toast]);

  const handleFieldChange = (field: string, value: any) => {
    setWorkflow((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleConditionalRuleChange = (field: string, value: any) => {
    setWorkflow((prev: any) => ({
      ...prev,
      conditionalRules: {
        ...prev.conditionalRules,
        [field]: value,
      }
    }));
  };

  const addApprover = () => {
    const newSequence = [
      ...(workflow.approvalSequence || []),
      { approverId: '', order: (workflow.approvalSequence?.length || 0) + 1 }
    ];
    handleFieldChange('approvalSequence', newSequence);
  };
  
  const removeApprover = (index: number) => {
    let newSequence = [...workflow.approvalSequence];
    newSequence.splice(index, 1);
    newSequence = newSequence.map((step, idx) => ({ ...step, order: idx + 1 }));
    handleFieldChange('approvalSequence', newSequence);
  };

  const moveApprover = (index: number, direction: 'up' | 'down') => {
    const newSequence = [...workflow.approvalSequence];
    const newIndex = direction === 'up' ? index - 1 : index + 1;

    if (newIndex >= 0 && newIndex < newSequence.length) {
      [newSequence[index], newSequence[newIndex]] = [newSequence[newIndex], newSequence[index]];
      const reorderedSequence = newSequence.map((step, idx) => ({ ...step, order: idx + 1 }));
      handleFieldChange('approvalSequence', reorderedSequence);
    }
  };

  const updateApproverInSequence = (index: number, approverId: string) => {
    const newSequence = [...workflow.approvalSequence];
    newSequence[index] = { ...newSequence[index], approverId: approverId };
    handleFieldChange('approvalSequence', newSequence);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        isManagerApprover: workflow.isManagerApprover,
        approvalSequence: workflow.approvalSequence.map((s: any) => ({ approverId: s.approverId, order: s.order })),
        conditionalRules: workflow.conditionalRules,
      };
      await saveWorkflow(payload);
      toast({
        title: 'Workflow Saved',
        description: 'Your approval workflow has been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Save Failed',
        description: 'Could not save the workflow.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !workflow) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Approval Workflow</h1>
          <p className="text-muted-foreground">Configure multi-level approvals and conditional rules</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <WorkflowIcon className="h-5 w-5" />
                Multi-Level Approvals
              </CardTitle>
              <CardDescription>Define the sequence of approvers for expense claims</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="manager-approver" className="text-base">
                    Manager as First Approver
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Expenses go to employee's manager first
                  </p>
                </div>
                <Switch
                  id="manager-approver"
                  checked={workflow.isManagerApprover}
                  onCheckedChange={(val) => handleFieldChange('isManagerApprover', val)}
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Approval Sequence (after manager)</Label>
                {workflow.approvalSequence?.map((approver: any, index: number) => (
                  <div key={index} className="flex items-center gap-2 rounded-lg border border-border p-3">
                    <Select onValueChange={(val) => updateApproverInSequence(index, val)} value={approver.approverId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an approver" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableApprovers.map(a => (
                          <SelectItem key={a._id} value={a._id}>{a.name} ({a.role})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => moveApprover(index, 'up')} disabled={index === 0}>
                        <MoveUp className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => moveApprover(index, 'down')} disabled={index === workflow.approvalSequence.length - 1}>
                        <MoveDown className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => removeApprover(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full" onClick={addApprover}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Approver Step
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Conditional Approval Rules</CardTitle>
              <CardDescription>Set up automatic approval conditions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="percentage-rule" className="text-base">Percentage Rule</Label>
                    <p className="text-sm text-muted-foreground">Auto-approve if X% of approvers approve</p>
                  </div>
                  <Switch
                    id="percentage-rule"
                    checked={workflow.conditionalRules?.usePercentageRule}
                    onCheckedChange={(val) => handleConditionalRuleChange('usePercentageRule', val)}
                  />
                </div>
                {workflow.conditionalRules?.usePercentageRule && (
                  <div className="ml-6 space-y-2">
                    <Label htmlFor="percentage">Approval Threshold (%)</Label>
                    <Input
                      id="percentage" type="number" min="1" max="100"
                      value={workflow.conditionalRules?.percentageThreshold || '60'}
                      onChange={(e) => handleConditionalRuleChange('percentageThreshold', parseInt(e.target.value))}
                    />
                  </div>
                )}
              </div>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="specific-approver" className="text-base">Specific Approver Rule</Label>
                    <p className="text-sm text-muted-foreground">Auto-approve if a specific person approves</p>
                  </div>
                  <Switch
                    id="specific-approver"
                    checked={workflow.conditionalRules?.useSpecificApprover}
                    onCheckedChange={(val) => handleConditionalRuleChange('useSpecificApprover', val)}
                  />
                </div>
                {workflow.conditionalRules?.useSpecificApprover && (
                  <div className="ml-6 space-y-2">
                    <Label htmlFor="approver-select">Select Specific Approver</Label>
                    <Select
                      value={workflow.conditionalRules?.specificApproverId}
                      onValueChange={(val) => handleConditionalRuleChange('specificApproverId', val)}
                    >
                      <SelectTrigger id="approver-select">
                        <SelectValue placeholder="Choose approver" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableApprovers.map((a) => (
                          <SelectItem key={a._id} value={a._id}>{a.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="hybrid-rule" className="text-base">Hybrid Rule</Label>
                    <p className="text-sm text-muted-foreground">Combine the rules above</p>
                  </div>
                  <Switch
                    id="hybrid-rule"
                    checked={workflow.conditionalRules?.useHybridRule}
                    onCheckedChange={(val) => handleConditionalRuleChange('useHybridRule', val)}
                  />
                </div>
                {workflow.conditionalRules?.useHybridRule && (
                  <div className="ml-6 space-y-2">
                    <Label htmlFor="logic">Combination Logic</Label>
                    <Select
                      value={workflow.conditionalRules?.hybridLogic || 'OR'}
                      onValueChange={(val) => handleConditionalRuleChange('hybridLogic', val)}
                    >
                      <SelectTrigger id="logic"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AND">Both rules must pass (AND)</SelectItem>
                        <SelectItem value="OR">Either rule can pass (OR)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} size="lg" disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Workflow Configuration
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Workflow;