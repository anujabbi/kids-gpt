
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: 'parent' | 'child';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireRole }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If a specific role is required and user doesn't have it, redirect
  if (requireRole && profile?.role !== requireRole) {
    // Parents trying to access child routes go to parent dashboard
    if (profile?.role === 'parent') {
      return <Navigate to="/parents" replace />;
    }
    // Children trying to access parent routes go to main page
    if (profile?.role === 'child') {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};
