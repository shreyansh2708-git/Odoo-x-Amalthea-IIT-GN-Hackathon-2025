import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import SubmitExpense from "./pages/SubmitExpense";
import Approvals from "./pages/Approvals";
import Users from "./pages/Users";
import Workflow from "./pages/Workflow";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/auth" />;
};

// This new component will handle the routing logic after auth check is complete
const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/submit-expense" element={<ProtectedRoute><SubmitExpense /></ProtectedRoute>} />
      <Route path="/expenses" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
      <Route path="/approvals" element={<ProtectedRoute><Approvals /></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
      <Route path="/workflow" element={<ProtectedRoute><Workflow /></ProtectedRoute>} />
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

// This component will show a loader while we check for authentication
const AuthGate = () => {
  const { isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return <AppRoutes />;
};


const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthGate />
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

