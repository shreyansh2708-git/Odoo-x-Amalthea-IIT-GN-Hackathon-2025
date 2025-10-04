import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Plus, X, MoveUp, MoveDown, Workflow as WorkflowIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Approver {
  id: string;
  name: string;
  role: string;
}

const Workflow = () => {
  const [approvers, setApprovers] = useState<Approver[]>([
    { id: '1', name: 'Manager', role: 'manager' },
    { id: '2', name: 'Finance', role: 'finance' },
  ]);
  const [isManagerApprover, setIsManagerApprover] = useState(true);
  const [usePercentageRule, setUsePercentageRule] = useState(false);
  const [percentageThreshold, setPercentageThreshold] = useState('60');
  const [useSpecificApprover, setUseSpecificApprover] = useState(false);
  const [specificApprover, setSpecificApprover] = useState('');
  const [useHybridRule, setUseHybridRule] = useState(false);
  const [hybridLogic, setHybridLogic] = useState('OR');

  const { toast } = useToast();

  const moveApprover = (index: number, direction: 'up' | 'down') => {
    const newApprovers = [...approvers];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex >= 0 && newIndex < approvers.length) {
      [newApprovers[index], newApprovers[newIndex]] = [newApprovers[newIndex], newApprovers[index]];
      setApprovers(newApprovers);
    }
  };

  const removeApprover = (index: number) => {
    setApprovers(approvers.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    toast({
      title: 'Workflow saved',
      description: 'Your approval workflow has been updated successfully.',
    });
  };

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
                  checked={isManagerApprover}
                  onCheckedChange={setIsManagerApprover}
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Approval Sequence</Label>
                {approvers.map((approver, index) => (
                  <div key={approver.id} className="flex items-center gap-2 rounded-lg border border-border p-3">
                    <Badge variant="secondary" className="min-w-[60px]">
                      Step {index + 1}
                    </Badge>
                    <span className="flex-1 font-medium">{approver.name}</span>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => moveApprover(index, 'up')}
                        disabled={index === 0}
                      >
                        <MoveUp className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => moveApprover(index, 'down')}
                        disabled={index === approvers.length - 1}
                      >
                        <MoveDown className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeApprover(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Approver
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
                    <Label htmlFor="percentage-rule" className="text-base">
                      Percentage Rule
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Auto-approve if X% of approvers approve
                    </p>
                  </div>
                  <Switch
                    id="percentage-rule"
                    checked={usePercentageRule}
                    onCheckedChange={setUsePercentageRule}
                  />
                </div>
                {usePercentageRule && (
                  <div className="ml-6 space-y-2">
                    <Label htmlFor="percentage">Approval Threshold (%)</Label>
                    <Input
                      id="percentage"
                      type="number"
                      min="1"
                      max="100"
                      value={percentageThreshold}
                      onChange={(e) => setPercentageThreshold(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="specific-approver" className="text-base">
                      Specific Approver Rule
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Auto-approve if specific person approves
                    </p>
                  </div>
                  <Switch
                    id="specific-approver"
                    checked={useSpecificApprover}
                    onCheckedChange={setUseSpecificApprover}
                  />
                </div>
                {useSpecificApprover && (
                  <div className="ml-6 space-y-2">
                    <Label htmlFor="approver-select">Select Approver</Label>
                    <Select value={specificApprover} onValueChange={setSpecificApprover}>
                      <SelectTrigger id="approver-select">
                        <SelectValue placeholder="Choose approver" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        <SelectItem value="cfo">CFO</SelectItem>
                        <SelectItem value="ceo">CEO</SelectItem>
                        <SelectItem value="finance-director">Finance Director</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="hybrid-rule" className="text-base">
                      Hybrid Rule
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Combine percentage and specific approver rules
                    </p>
                  </div>
                  <Switch
                    id="hybrid-rule"
                    checked={useHybridRule}
                    onCheckedChange={setUseHybridRule}
                  />
                </div>
                {useHybridRule && (
                  <div className="ml-6 space-y-2">
                    <Label htmlFor="logic">Combination Logic</Label>
                    <Select value={hybridLogic} onValueChange={setHybridLogic}>
                      <SelectTrigger id="logic">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
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
          <Button onClick={handleSave} size="lg">
            Save Workflow Configuration
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Workflow;
