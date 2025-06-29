
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: 'parent' | 'child';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireRole }) => {
  const { user, profile, loading } = useAuth();

  console.log('ProtectedRoute state:', { user: !!user, profile, loading, requireRole });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        <div className="ml-4 text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    console.log('No user, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  // If user exists but no profile, redirect to auth (user needs to complete signup)
  if (user && !profile) {
    console.log('User exists but no profile, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  // If a specific role is required and user doesn't have it, redirect
  if (requireRole && profile?.role !== requireRole) {
    console.log('Role mismatch, redirecting based on role:', profile?.role);
    // Parents trying to access child routes go to parent dashboard
    if (profile?.role === 'parent') {
      return <Navigate to="/parents" replace />;
    }
    // Children trying to access parent routes go to main page
    if (profile?.role === 'child') {
      return <Navigate to="/" replace />;
    }
  }

  console.log('ProtectedRoute allowing access');
  return <>{children}</>;
};
