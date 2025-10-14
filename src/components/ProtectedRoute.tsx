import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect employees away from admin-only pages
  if (user.role === 'employee') {
    const adminOnlyPaths = ['/employees', '/departments', '/attendance', '/location-attendance'];
    if (adminOnlyPaths.includes(location.pathname)) {
      return <Navigate to="/employee-dashboard" replace />;
    }
    // Redirect employees from admin dashboard to employee dashboard
    if (location.pathname === '/dashboard') {
      return <Navigate to="/employee-dashboard" replace />;
    }
  }

  // Redirect admin from employee dashboard to admin dashboard
  if (user.role === 'admin' && location.pathname === '/employee-dashboard') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;