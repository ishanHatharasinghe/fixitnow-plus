import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true, 
  redirectTo = '/select-role' 
}) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while auth is being resolved
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If authentication is required and user is not signed in
  if (requireAuth && !currentUser) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If authentication is not required or user is signed in, show the children
  return <>{children}</>;
};

export default ProtectedRoute;