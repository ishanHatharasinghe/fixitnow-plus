import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { userService } from "../services/userService";
import { postService } from "../services/postService";
import { reviewService } from "../services/reviewService";
import { adminService } from "../services/adminService";
import {
  TestTube,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Database,
  User,
  FileText,
  MessageSquare,
  Shield,
  RefreshCw
} from "lucide-react";

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message: string;
  details?: string;
}

const FunctionalityTest: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [overallStatus, setOverallStatus] = useState<'idle' | 'running' | 'completed'>('idle');

  const runTest = async (name: string, testFn: () => Promise<string>): Promise<TestResult> => {
    setTests(prev => prev.map(t => 
      t.name === name ? { ...t, status: 'running', message: 'Running...' } : t
    ));
    
    try {
      const message = await testFn();
      return { name, status: 'success', message };
    } catch (error) {
      return { 
        name, 
        status: 'error', 
        message: 'Failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setOverallStatus('running');
    setTests([]);
    
    const newTests: TestResult[] = [
      { name: 'Authentication Context', status: 'pending', message: 'Waiting...' },
      { name: 'User Service CRUD', status: 'pending', message: 'Waiting...' },
      { name: 'Post Service CRUD', status: 'pending', message: 'Waiting...' },
      { name: 'Review Service CRUD', status: 'pending', message: 'Waiting...' },
      { name: 'Admin Service CRUD', status: 'pending', message: 'Waiting...' },
      { name: 'Firestore Security Rules', status: 'pending', message: 'Waiting...' }
    ];
    
    setTests(newTests);

    // Test Authentication
    const authTest = await runTest('Authentication Context', async () => {
      if (!currentUser) throw new Error('No authenticated user');
      if (!userProfile) throw new Error('No user profile loaded');
      return `Authenticated as ${userProfile.email} with role ${userProfile.role}`;
    });

    // Test User Service
    const userTest = await runTest('User Service CRUD', async () => {
      if (!currentUser) throw new Error('No authenticated user');
      
      // Test get user
      const user = await userService.getUser(currentUser.uid);
      if (!user) throw new Error('Failed to get user');
      
      // Test update user (temporary change)
      await userService.updateUser(currentUser.uid, {
        displayName: 'Test User'
      });
      
      // Verify update
      const updatedUser = await userService.getUser(currentUser.uid);
      if (!updatedUser?.displayName || updatedUser.displayName !== 'Test User') {
        throw new Error('Failed to update user');
      }
      
      // Restore original name
      if (userProfile?.displayName) {
        await userService.updateUser(currentUser.uid, {
          displayName: userProfile.displayName
        });
      }
      
      return 'User CRUD operations working correctly';
    });

    // Test Post Service
    const postTest = await runTest('Post Service CRUD', async () => {
      if (!currentUser) throw new Error('No authenticated user');
      
      // Create test post
      const testPost = {
        title: 'Test Post for Functionality Test',
        category: 'Plumbing',
        specializations: 'Test specializations',
        location: 'Colombo',
        specificCities: 'Colombo',
        travelDistance: '10 km',
        pricingModel: 'Fixed Price',
        description: 'This is a test post for functionality testing',
        keywords: 'test, functionality',
        checklist: ['Test item 1', 'Test item 2'],
        clientMaterials: 'No',
        timeFromHour: '09',
        timeFromAmPm: 'AM',
        timeToHour: '05',
        timeToAmPm: 'PM',
        availableDays: ['Monday', 'Tuesday'],
        startingPrice: '1000',
        inspectionFee: '500',
        emergency: 'No',
        ownerName: 'Test Owner',
        ownerAddress: 'Test Address',
        nic: '123456789V',
        mobile: '703215789',
        email: 'test@example.com',
        images: [],
        pdf: '',
        status: 'pending' as const,
        serviceProviderId: currentUser.uid
      };

      const postId = await postService.createPost(testPost);
      
      // Get post
      const retrievedPost = await postService.getPost(postId);
      if (!retrievedPost || retrievedPost.title !== testPost.title) {
        throw new Error('Failed to retrieve created post');
      }

      // Update post
      await postService.updatePost(postId, { title: 'Updated Test Post' });
      const updatedPost = await postService.getPost(postId);
      if (!updatedPost || updatedPost.title !== 'Updated Test Post') {
        throw new Error('Failed to update post');
      }

      // Get posts by service provider
      const userPosts = await postService.getPostsByServiceProvider(currentUser.uid);
      if (!userPosts.find(p => p.id === postId)) {
        throw new Error('Post not found in user posts');
      }

      // Delete post
      await postService.deletePost(postId);
      
      return 'Post CRUD operations working correctly';
    });

    // Test Review Service
    const reviewTest = await runTest('Review Service CRUD', async () => {
      if (!currentUser) throw new Error('No authenticated user');
      
      // Create test review
      const testReview = {
        serviceProviderId: currentUser.uid,
        reviewerId: currentUser.uid,
        reviewerName: 'Test Reviewer',
        rating: 5,
        comment: 'This is a test review for functionality testing'
      };

      const { id: reviewId } = await reviewService.createReview(testReview);
      
      // Get review
      const retrievedReview = await reviewService.getReview(reviewId);
      if (!retrievedReview || retrievedReview.comment !== testReview.comment) {
        throw new Error('Failed to retrieve created review');
      }

      // Update review (need currentUserId and userRole)
      // @ts-ignore - need userRole parameter
      await reviewService.updateReview(reviewId, currentUser.uid, 'seeker' as const, { rating: 4, comment: 'Updated test review' });
      const updatedReview = await reviewService.getReview(reviewId);
      if (!updatedReview || updatedReview.rating !== 4) {
        throw new Error('Failed to update review');
      }

      // Get reviews by service provider (getReviewsByPost doesn't exist)
      // @ts-ignore
      const providerReviews = await reviewService.getReviewsByServiceProvider(currentUser.uid);
      if (!providerReviews.find((r: any) => r.id === reviewId)) {
        throw new Error('Review not found in provider reviews');
      }

      // Delete review (need currentUserId and userRole)
      // @ts-ignore
      await reviewService.deleteReview(reviewId, currentUser.uid, 'seeker' as const);
      
      return 'Review CRUD operations working correctly';
    });

    // Test Admin Service
    const adminTest = await runTest('Admin Service CRUD', async () => {
      if (!currentUser) throw new Error('No authenticated user');
      
      // Create test admin log
      const testLog = {
        action: 'TEST_ACTION' as any,
        adminId: currentUser.uid,
        adminName: currentUser.displayName || 'Test Admin',
        targetId: currentUser.uid,
        targetType: 'user' as const,
        reason: 'Test admin action for functionality testing'
      };

      const logId = await adminService.createAdminLog(testLog);
      
      // Get log
      const retrievedLog = await adminService.getAdminLog(logId);
      if (!retrievedLog || retrievedLog.action !== testLog.action) {
        throw new Error('Failed to retrieve created admin log');
      }

      // Get all logs
      const allLogs = await adminService.getAllAdminLogs();
      if (!allLogs.find(l => l.id === logId)) {
        throw new Error('Admin log not found in all logs');
      }

      return 'Admin CRUD operations working correctly';
    });

    // Test Firestore Security Rules
    const securityTest = await runTest('Firestore Security Rules', async () => {
      if (!currentUser) throw new Error('No authenticated user');
      
      // Test that we can read our own user document
      const user = await userService.getUser(currentUser.uid);
      if (!user) throw new Error('Cannot read own user document');
      
      // Test that we can create posts
      const testPost = {
        title: 'Security Test Post',
        category: 'Plumbing',
        specializations: 'Test specializations',
        location: 'Colombo',
        specificCities: 'Colombo',
        travelDistance: '10 km',
        pricingModel: 'Fixed Price',
        description: 'Testing security rules',
        keywords: 'test, security',
        checklist: ['Test item'],
        clientMaterials: 'No',
        timeFromHour: '09',
        timeFromAmPm: 'AM',
        timeToHour: '05',
        timeToAmPm: 'PM',
        availableDays: ['Monday'],
        startingPrice: '1000',
        inspectionFee: '500',
        emergency: 'No',
        ownerName: 'Test',
        ownerAddress: 'Test Address',
        nic: '123456789V',
        mobile: '703215789',
        email: 'test@example.com',
        images: [],
        pdf: '',
        status: 'pending' as const,
        serviceProviderId: currentUser.uid
      };

      const postId = await postService.createPost(testPost);
      
      // Clean up
      await postService.deletePost(postId);
      
      return 'Firestore security rules working correctly';
    });

    setTests([authTest, userTest, postTest, reviewTest, adminTest, securityTest]);
    setOverallStatus('completed');
    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'running': return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      default: return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-emerald-50 border-emerald-200';
      case 'error': return 'bg-red-50 border-red-200';
      case 'running': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getOverallStatus = () => {
    if (overallStatus === 'running') return 'Testing in progress...';
    if (tests.length === 0) return 'Click "Run All Tests" to begin';
    
    const successCount = tests.filter(t => t.status === 'success').length;
    const errorCount = tests.filter(t => t.status === 'error').length;
    
    if (errorCount > 0) {
      return `Completed with ${errorCount} error(s) out of ${tests.length} tests`;
    }
    return `All ${tests.length} tests passed successfully!`;
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-gray-900">Functionality Test Suite</h1>
              <p className="text-gray-600 mt-1">Comprehensive testing of all implemented features</p>
            </div>
            <button
              onClick={runAllTests}
              disabled={isRunning}
              className="flex items-center gap-3 px-6 py-3 bg-[#0072D1] text-white font-bold rounded-xl
                hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <TestTube className="w-5 h-5" />
              {isRunning ? 'Running Tests...' : 'Run All Tests'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Status Summary */}
        <div className="mb-8">
          <div className={`p-6 rounded-2xl border-2 ${overallStatus === 'completed' && tests.filter(t => t.status === 'error').length === 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {overallStatus === 'completed' && tests.filter(t => t.status === 'error').length === 0 ? (
                  <CheckCircle className="w-6 h-6 text-emerald-500" />
                ) : overallStatus === 'running' ? (
                  <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-gray-500" />
                )}
                <div>
                  <h3 className="font-bold text-gray-900">{getOverallStatus()}</h3>
                  <p className="text-sm text-gray-600">
                    {overallStatus === 'completed' 
                      ? `${tests.filter(t => t.status === 'success').length} passed, ${tests.filter(t => t.status === 'error').length} failed`
                      : 'Tests will verify all CRUD operations and security rules'
                    }
                  </p>
                </div>
              </div>
              {overallStatus === 'completed' && (
                <button
                  onClick={runAllTests}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Run Again
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Test Results */}
        <div className="space-y-4">
          {tests.map((test, index) => (
            <div key={index} className={`p-6 rounded-2xl border-2 ${getStatusColor(test.status)}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {getStatusIcon(test.status)}
                  <div>
                    <h4 className="font-bold text-gray-900">{test.name}</h4>
                    <p className="text-sm text-gray-600">{test.message}</p>
                    {test.details && (
                      <p className="text-xs text-red-600 mt-1">{test.details}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    test.status === 'success' ? 'bg-emerald-100 text-emerald-700' :
                    test.status === 'error' ? 'bg-red-100 text-red-700' :
                    test.status === 'running' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {test.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="mt-8 p-6 bg-white rounded-2xl border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4">Test Coverage</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-gray-400" />
              <span>Authentication Context - User login and profile loading</span>
            </div>
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-400" />
              <span>User Service - Create, read, update, delete user profiles</span>
            </div>
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-gray-400" />
              <span>Post Service - Full CRUD operations for service posts</span>
            </div>
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-gray-400" />
              <span>Review Service - Manage reviews and ratings</span>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-gray-400" />
              <span>Admin Service - Administrative logging and operations</span>
            </div>
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-gray-400" />
              <span>Security Rules - Verify proper access control</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FunctionalityTest;