
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
    console.log('ProtectedRoute: Still loading auth state');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  // No user - redirect to auth
  if (!user) {
    console.log('ProtectedRoute: No user, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  // User exists but no profile - redirect to auth to complete signup
  if (user && !profile) {
    console.log('ProtectedRoute: User exists but no profile, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  // Role-based access control
  if (requireRole && profile?.role !== requireRole) {
    console.log('ProtectedRoute: Role mismatch, user role:', profile?.role, 'required:', requireRole);
    if (profile?.role === 'parent') {
      console.log('ProtectedRoute: Redirecting parent to /parents');
      return <Navigate to="/parents" replace />;
    }
    if (profile?.role === 'child') {
      console.log('ProtectedRoute: Redirecting child to /chat');
      return <Navigate to="/chat" replace />;
    }
    // If no valid role, redirect to auth
    console.log('ProtectedRoute: Invalid role, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  console.log('ProtectedRoute: Allowing access');
  return <>{children}</>;
};
