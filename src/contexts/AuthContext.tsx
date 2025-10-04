import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'admin' | 'manager' | 'employee';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  companyId: string;
  managerId?: string;
}

export interface Company {
  id: string;
  name: string;
  currency: string;
}

interface AuthContextType {
  user: User | null;
  company: Company | null;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  signup: (email: string, password: string, name: string, companyName: string, currency: string, role: UserRole) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedCompany = localStorage.getItem('company');
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedCompany) setCompany(JSON.parse(savedCompany));
  }, []);

  const signup = async (email: string, password: string, name: string, companyName: string, currency: string, role: UserRole) => {
    // Mock signup - creates company and user with selected role
    const newCompany: Company = {
      id: `company-${Date.now()}`,
      name: companyName,
      currency,
    };

    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      name,
      role,
      companyId: newCompany.id,
    };

    setCompany(newCompany);
    setUser(newUser);
    localStorage.setItem('company', JSON.stringify(newCompany));
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const login = async (email: string, password: string, role: UserRole) => {
    // Mock login - in real app, this would call the backend
    const mockUser: User = {
      id: `user-${Date.now()}`,
      email,
      name: email.split('@')[0],
      role,
      companyId: 'company-1',
    };

    const mockCompany: Company = {
      id: 'company-1',
      name: 'Demo Company',
      currency: 'USD',
    };

    setUser(mockUser);
    setCompany(mockCompany);
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('company', JSON.stringify(mockCompany));
  };

  const logout = () => {
    setUser(null);
    setCompany(null);
    localStorage.removeItem('user');
    localStorage.removeItem('company');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      company, 
      login, 
      signup, 
      logout, 
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
