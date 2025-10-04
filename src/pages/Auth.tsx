import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Wallet, Loader2 } from 'lucide-react';
import { fetchCurrencies } from '../services/api';
import { useToast } from '../hooks/use-toast';

const Auth = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'admin' | 'manager' | 'employee'>('admin');
  const [companyName, setCompanyName] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [currencies, setCurrencies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, signup, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const loadCurrencies = async () => {
      try {
        const data = await fetchCurrencies();
        setCurrencies(data.countries || []);
      } catch (error) {
        console.error('Failed to load currencies:', error);
        toast({ title: 'Error', description: 'Could not load currency list.', variant: 'destructive' });
      }
    };
    loadCurrencies();
  }, [toast]);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setRole('admin');
    setCompanyName('');
    setCurrency('USD');
  };

  const handleTabChange = (value: string) => {
    resetForm();
    setActiveTab(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (activeTab === 'login') {
        await login(email, password, role);
        toast({
          title: 'Welcome back!',
          description: 'You have successfully logged in.',
        });
      } else {
        await signup(email, password, name, companyName, currency, 'admin');
        toast({
          title: 'Account created!',
          description: 'Your company has been set up successfully.',
        });
      }
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Authentication Failed',
        description: error.message || 'Please check your credentials and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Wallet className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Expenzify</CardTitle>
          <CardDescription>Manage your expenses efficiently</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="loginRole">Login as</Label>
                  <Select value={role} onValueChange={(value: any) => setRole(value)} required>
                    <SelectTrigger id="loginRole">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="employee">Employee</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    'Login'
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="signup-role">Role</Label>
                  <Input
                    id="signup-role"
                    value="Admin (auto-assigned)"
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    placeholder="Acme Inc."
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Default Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger id="currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      {currencies.map((c) => (
                        <SelectItem key={c.currencyCode} value={c.currencyCode}>
                          {c.currencyCode} - {c.countryName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;