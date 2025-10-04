import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Combobox } from '@/components/ui/combobox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Loader2, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchCurrencies, processOCR } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const SubmitExpense = () => {
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [paidBy, setPaidBy] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [remarks, setRemarks] = useState('');
  const [approverName, setApproverName] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [currencies, setCurrencies] = useState<any[]>([]);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const loadCurrencies = async () => {
      const data = await fetchCurrencies();
      setCurrencies(data);
    };
    loadCurrencies();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Check if first file is an image for OCR
    const firstFile = files[0];
    if (firstFile.type.startsWith('image/')) {
      setIsProcessingOCR(true);
      toast({
        title: 'Processing receipt...',
        description: 'Extracting information from your receipt.',
      });

      try {
        const result = await processOCR(firstFile) as any;
        setAmount(result.amount);
        setExpenseDate(result.date);
        setDescription(result.description);
        setCategory(result.category);
        
        toast({
          title: 'Receipt processed!',
          description: 'Form fields have been auto-filled.',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to process receipt.',
          variant: 'destructive',
        });
      } finally {
        setIsProcessingOCR(false);
      }
    }

    setAttachments([...attachments, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    toast({
      title: 'Expense submitted!',
      description: 'Your expense has been submitted for approval.',
    });
    
    navigate('/expenses');
  };

  const currencyOptions = currencies.map(country => {
    const currencyCode = Object.keys(country.currencies || {})[0];
    const currencyName = country.currencies?.[currencyCode]?.name;
    return {
      value: currencyCode,
      label: `${currencyCode} - ${currencyName} (${country.name.common})`,
    };
  }).filter(c => c.value);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Submit New Expense</h1>
          <p className="text-muted-foreground">Fill in the details of your expense claim</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Expense Details</CardTitle>
              <CardDescription>Provide all necessary information about your expense</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Receipt Upload */}
              <div className="space-y-2">
                <Label>Attach Receipt / Documents</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  <Input
                    type="file"
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    disabled={isProcessingOCR}
                    className="hidden"
                    id="file-upload"
                    multiple
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Images, PDF, DOC (Max 10MB each)
                    </p>
                  </label>
                  {isProcessingOCR && (
                    <div className="mt-4 flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Processing receipt...</span>
                    </div>
                  )}
                </div>
                
                {attachments.length > 0 && (
                  <div className="space-y-2 mt-4">
                    <Label>Attached Files ({attachments.length})</Label>
                    <div className="space-y-2">
                      {attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <span className="text-sm truncate flex-1">{file.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAttachment(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  disabled={isProcessingOCR}
                  rows={3}
                  placeholder="Describe the expense..."
                />
              </div>

              {/* Category and Expense Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={category} onValueChange={setCategory} disabled={isProcessingOCR} required>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      <SelectItem value="Travel">Travel</SelectItem>
                      <SelectItem value="Food">Food & Meals</SelectItem>
                      <SelectItem value="Supplies">Office Supplies</SelectItem>
                      <SelectItem value="Accommodation">Accommodation</SelectItem>
                      <SelectItem value="Entertainment">Entertainment</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expenseDate">Expense Date *</Label>
                  <Input
                    id="expenseDate"
                    type="date"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    required
                    disabled={isProcessingOCR}
                  />
                </div>
              </div>

              {/* Paid By */}
              <div className="space-y-2">
                <Label htmlFor="paidBy">Paid By *</Label>
                <Select value={paidBy} onValueChange={setPaidBy} required>
                  <SelectTrigger id="paidBy">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="personal-card">Personal Credit Card</SelectItem>
                    <SelectItem value="company-card">Company Credit Card</SelectItem>
                    <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Amount and Currency */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Total Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    disabled={isProcessingOCR}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency *</Label>
                  <Combobox
                    options={currencyOptions}
                    value={currency}
                    onValueChange={setCurrency}
                    placeholder="Select currency"
                    searchPlaceholder="Search currencies..."
                    emptyText="No currency found."
                  />
                </div>
              </div>

              {/* Remarks */}
              <div className="space-y-2">
                <Label htmlFor="remarks">Remarks (Optional)</Label>
                <Textarea
                  id="remarks"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={2}
                  placeholder="Any additional notes..."
                />
              </div>

              {/* Approver Name */}
              <div className="space-y-2">
                <Label htmlFor="approverName">Approver Name *</Label>
                <Input
                  id="approverName"
                  type="text"
                  value={approverName}
                  onChange={(e) => setApproverName(e.target.value)}
                  required
                  placeholder="Name of the approver"
                />
              </div>

              {/* Status and Time (Read-only, shown as info) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Input value="Draft" disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label>Submission Time</Label>
                  <Input value={new Date().toLocaleString()} disabled className="bg-muted" />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" className="flex-1" disabled={isProcessingOCR}>
                  Submit Expense
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/expenses')}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </Layout>
  );
};

export default SubmitExpense;
