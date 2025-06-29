
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: 'parent' | 'child';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireRole }) => {
  const { user, profile, loading } = useAuth();

  console.log('ProtectedRoute state:', { 
    user: !!user, 
    profile: profile ? { role: profile.role, id: profile.id } : null, 
    loading, 
    requireRole 
  });

  // Show loading spinner while auth is being determined
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        <div className="ml-4 text-lg">Loading...</div>
      </div>
    );
  }

  // No user - redirect to auth
  if (!user) {
    console.log('No user, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  // User exists but no profile - redirect to auth to complete signup
  if (user && !profile) {
    console.log('User exists but no profile, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  // Role-based access control
  if (requireRole && profile?.role !== requireRole) {
    console.log('Role mismatch, redirecting based on role:', profile?.role);
    if (profile?.role === 'parent') {
      return <Navigate to="/parents" replace />;
    }
    if (profile?.role === 'child') {
      return <Navigate to="/chat" replace />;
    }
  }

  console.log('ProtectedRoute allowing access');
  return <>{children}</>;
};
