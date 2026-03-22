import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: Array<'seeker' | 'service_provider' | 'admin'>;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ 
  children, 
  allowedRoles, 
  fallback,
  redirectTo 
}) => {
  const { currentUser, userRole, loading } = useAuth();
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

  // If user is not signed in, redirect to sign-in page
  if (!currentUser) {
    return <Navigate to={redirectTo || '/select-role'} state={{ from: location }} replace />;
  }

  // If user role is not in the allowed roles
  if (userRole && !allowedRoles.includes(userRole)) {
    // If a fallback component is provided, show it
    if (fallback) {
      return <>{fallback}</>;
    }
    
    // Otherwise, redirect to an appropriate page based on user role
    if (userRole === 'seeker') {
      return <Navigate to="/seeker/dashboard" replace />;
    } else if (userRole === 'service_provider') {
      return <Navigate to="/service-provider/dashboard" replace />;
    } else if (userRole === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    
    // Default fallback
    return <Navigate to="/select-role" replace />;
  }

  // If user has the correct role, show the children
  return <>{children}</>;
};

export default RoleBasedRoute;