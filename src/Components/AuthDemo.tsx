import React from 'react';
import { useAuth } from '../hooks/useAuth';

const AuthDemo: React.FC = () => {
  const { currentUser, userProfile, userRole, loading, error, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Authentication Demo</h1>
          
          {currentUser ? (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                {userProfile?.photoURL && (
                  <img 
                    src={userProfile.photoURL} 
                    alt="Profile" 
                    className="w-16 h-16 rounded-full"
                  />
                )}
                <div>
                  <h2 className="text-2xl font-semibold">
                    {userProfile?.displayName || currentUser.displayName || currentUser.email}
                  </h2>
                  <p className="text-gray-600">{currentUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900">User ID</h3>
                  <p className="text-blue-700 text-sm">{currentUser.uid}</p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900">Role</h3>
                  <p className={`text-sm font-medium ${
                    userRole === 'admin' ? 'text-red-600' : 
                    userRole === 'service_provider' ? 'text-blue-600' : 'text-green-600'
                  }`}>
                    {userRole?.toUpperCase()}
                    {userRole === 'admin' && ' (ADMIN)'}
                  </p>
                </div>
              </div>

              {userRole === 'admin' && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                  <h3 className="font-semibold text-red-900">Admin Privileges</h3>
                  <p className="text-red-700 text-sm">
                    You have administrative access to this application.
                  </p>
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  onClick={signOut}
                  className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                No User Signed In
              </h2>
              <p className="text-gray-500">
                Please sign in to see authentication details.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthDemo;