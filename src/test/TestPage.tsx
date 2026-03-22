import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import {
  TestTube,
  Database,
  User,
  FileText,
  MessageSquare,
  Shield,
  ArrowLeft
} from "lucide-react";

const TestPage: React.FC = () => {
  const { currentUser, userProfile } = useAuth();

  const testFeatures = [
    {
      title: "Authentication & User Management",
      description: "Test user login, profile loading, and user CRUD operations",
      icon: User,
      path: "/test/auth",
      color: "bg-blue-500"
    },
    {
      title: "Service Post Management",
      description: "Test creating, viewing, editing, and deleting service posts",
      icon: FileText,
      path: "/test/posts",
      color: "bg-green-500"
    },
    {
      title: "Review System",
      description: "Test review creation, retrieval, and management",
      icon: MessageSquare,
      path: "/test/reviews",
      color: "bg-purple-500"
    },
    {
      title: "Admin Operations",
      description: "Test administrative logging and system operations",
      icon: Shield,
      path: "/test/admin",
      color: "bg-red-500"
    },
    {
      title: "Security Rules",
      description: "Verify Firestore security rules and access control",
      icon: Shield,
      path: "/test/security",
      color: "bg-yellow-500"
    },
    {
      title: "Complete Test Suite",
      description: "Run all tests to verify the entire system works correctly",
      icon: TestTube,
      path: "/test/functionality",
      color: "bg-indigo-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-gray-900">System Test Suite</h1>
              <p className="text-gray-600 mt-2">Comprehensive testing of all FixItNow+ features</p>
            </div>
            <Link
              to="/"
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* User Info */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Current User</h2>
            {currentUser ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-bold text-blue-900">Authentication</h3>
                  <p className="text-sm text-blue-700">Authenticated as {currentUser.email}</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-bold text-green-900">Profile Status</h3>
                  <p className="text-sm text-green-700">
                    {userProfile ? 'Profile loaded successfully' : 'Profile not loaded'}
                  </p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-bold text-purple-900">Role</h3>
                  <p className="text-sm text-purple-700">
                    {userProfile?.role || 'Role not set'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-bold text-red-900">Not Authenticated</h3>
                <p className="text-sm text-red-700">Please log in to test the system</p>
              </div>
            )}
          </div>
        </div>

        {/* Test Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Link
                key={index}
                to={feature.path}
                className="block group"
              >
                <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center text-white`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                  <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Ready to test</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-12 bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/post-add"
              className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors"
            >
              <FileText className="w-5 h-5 text-blue-600" />
              <div>
                <h4 className="font-bold text-blue-900">Create Post</h4>
                <p className="text-sm text-blue-700">Test post creation</p>
              </div>
            </Link>
            <Link
              to="/my-posts"
              className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition-colors"
            >
              <Database className="w-5 h-5 text-green-600" />
              <div>
                <h4 className="font-bold text-green-900">View Posts</h4>
                <p className="text-sm text-green-700">Test post management</p>
              </div>
            </Link>
            <Link
              to="/profile"
              className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 transition-colors"
            >
              <User className="w-5 h-5 text-purple-600" />
              <div>
                <h4 className="font-bold text-purple-900">View Profile</h4>
                <p className="text-sm text-purple-700">Test profile loading</p>
              </div>
            </Link>
            <Link
              to="/edit-profile"
              className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-xl hover:bg-orange-100 transition-colors"
            >
              <Shield className="w-5 h-5 text-orange-600" />
              <div>
                <h4 className="font-bold text-orange-900">Edit Profile</h4>
                <p className="text-sm text-orange-700">Test profile updates</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Testing Instructions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
            <div>
              <h4 className="font-bold text-gray-900 mb-2">Before Testing</h4>
              <ul className="space-y-1">
                <li>• Ensure you are logged in</li>
                <li>• Have a service provider account ready</li>
                <li>• Make sure Firebase is properly configured</li>
                <li>• Check internet connection</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-2">During Testing</h4>
              <ul className="space-y-1">
                <li>• Test each feature individually</li>
                <li>• Verify data appears in Firestore</li>
                <li>• Check error handling</li>
                <li>• Test security rules</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage;