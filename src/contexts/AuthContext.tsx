import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as loginAPI, register as registerAPI, getCurrentUser, logout as logoutAPI } from '../services/api';

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
  isAuthLoading: boolean; // Add loading state
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true); // Initialize loading to true

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      try {
        if (token) {
          const response = await getCurrentUser();
          setUser(response.user);
          setCompany(response.user.company);
        }
      } catch (error) {
        console.error('Failed to get current user:', error);
        localStorage.removeItem('token');
      } finally {
        // This will run regardless of success or failure
        setIsAuthLoading(false);
      }
    };
    initializeAuth();
  }, []);

  const signup = async (email: string, password: string, name: string, companyName: string, currency: string, role: UserRole) => {
    try {
      const response = await registerAPI({
        name,
        email,
        password,
        role,
        companyName,
        currency
      });
      
      setUser(response.user);
      setCompany(response.user.company);
    } catch (error) {
      throw error;
    }
  };

  const login = async (email: string, password: string, role: UserRole) => {
    try {
      const response = await loginAPI(email, password, role);
      setUser(response.user);
      setCompany(response.user.company);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutAPI();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setCompany(null);
      localStorage.removeItem('token');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      company, 
      login, 
      signup, 
      logout, 
      isAuthenticated: !!user,
      isAuthLoading // Expose the loading state
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

