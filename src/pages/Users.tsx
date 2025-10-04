import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { UserPlus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { fetchUsers, createUser, fetchManagers } from '../services/api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'employee';
  managerId?: { _id: string, name: string };
  isActive: boolean;
}

const Users = () => {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [managers, setManagers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee' as 'admin' | 'manager' | 'employee',
    managerId: '',
  });

  const { toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersResponse, managersResponse] = await Promise.all([
        fetchUsers(),
        fetchManagers(),
      ]);
      setUsers(usersResponse.users || []);
      setManagers(managersResponse.managers || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load user data.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const userData: any = { ...formData };
      if (formData.role !== 'employee') {
        delete userData.managerId;
      }

      await createUser(userData);
      
      toast({
        title: 'User created',
        description: `${formData.name} has been added successfully.`,
      });

      setOpen(false);
      setFormData({ name: '', email: '', password: '', role: 'employee', managerId: '' });
      await loadData(); // Refresh the user list
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create user.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
            <p className="text-muted-foreground">Manage employees, managers, and their relationships</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>Add a new employee or manager to the system</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select 
                    value={formData.role} 
                    onValueChange={(value: any) => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.role === 'employee' && (
                  <div className="space-y-2">
                    <Label htmlFor="manager">Assign Manager</Label>
                    <Select 
                      value={formData.managerId} 
                      onValueChange={(value) => setFormData({ ...formData, managerId: value })}
                    >
                      <SelectTrigger id="manager">
                        <SelectValue placeholder="Select manager" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        {managers.map((manager) => (
                          <SelectItem key={manager._id} value={manager._id}>
                            {manager.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</>
                  ) : (
                    'Create User'
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>{users.length} users in the system</CardDescription>
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
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Manager</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? 'secondary' : 'outline'} className="capitalize">
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.managerId?.name || '-'}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Users;

