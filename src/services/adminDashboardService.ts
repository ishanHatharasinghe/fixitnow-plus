import { collection, doc, getDoc, getDocs, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { postService } from './postService';
import { userService } from './userService';
import { reviewService } from './reviewService';

export interface DashboardStats {
  totalUsers: number;
  totalProviders: number;
  totalSeekers: number;
  totalPosts: number;
  pendingPosts: number;
  approvedPosts: number;
  rejectedPosts: number;
  totalReviews: number;
  pendingReviews: number;
  approvedReviews: number;
  totalRevenue: number;
}

export interface DashboardUser {
  id: string;
  name: string;
  email: string;
  role: 'Provider' | 'Seeker';
  status: 'PENDING' | 'ACTIVE' | 'VERIFIED' | 'SUSPENDED';
  date: string;
  avatar: string;
}

export interface DashboardPost {
  id: string;
  customer: string;
  initials: string;
  color: string;
  service: string;
  date: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'IN PROGRESS';
}

export interface DashboardActivity {
  icon: string;
  color: string;
  title: string;
  time: string;
}

export interface BookingTrend {
  month: string;
  value: number;
}

export const adminDashboardService = {
  // Get comprehensive dashboard statistics
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Get all users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const totalUsers = usersSnapshot.docs.length;
      
      // Count providers and seekers
      let totalProviders = 0;
      let totalSeekers = 0;
      usersSnapshot.docs.forEach(doc => {
        const userData = doc.data();
        if (userData.role === 'service_provider') {
          totalProviders++;
        } else if (userData.role === 'seeker') {
          totalSeekers++;
        }
      });

      // Get all posts
      const postsSnapshot = await getDocs(collection(db, 'posts'));
      const totalPosts = postsSnapshot.docs.length;
      
      // Count posts by status
      let pendingPosts = 0;
      let approvedPosts = 0;
      let rejectedPosts = 0;
      postsSnapshot.docs.forEach(doc => {
        const postData = doc.data();
        const status = postData.status;
        if (status === 'pending') {
          pendingPosts++;
        } else if (status === 'approved') {
          approvedPosts++;
        } else if (status === 'rejected') {
          rejectedPosts++;
        }
      });

      // Get all reviews
      const reviewsSnapshot = await getDocs(collection(db, 'reviews'));
      const totalReviews = reviewsSnapshot.docs.length;
      
      // Count reviews by status (assuming reviews have status field)
      let pendingReviews = 0;
      let approvedReviews = 0;
      reviewsSnapshot.docs.forEach(doc => {
        const reviewData = doc.data();
        const status = reviewData.status || 'pending';
        if (status === 'pending') {
          pendingReviews++;
        } else if (status === 'approved') {
          approvedReviews++;
        }
      });

      // Calculate total revenue (placeholder - would need actual revenue data)
      const totalRevenue = 0;

      return {
        totalUsers,
        totalProviders,
        totalSeekers,
        totalPosts,
        pendingPosts,
        approvedPosts,
        rejectedPosts,
        totalReviews,
        pendingReviews,
        approvedReviews,
        totalRevenue
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // Get users for service providers section
  async getServiceProviders(): Promise<DashboardUser[]> {
    try {
      const providersSnapshot = await getDocs(
        query(collection(db, 'users'), where('role', '==', 'service_provider'))
      );

      return providersSnapshot.docs.map(doc => {
        const data = doc.data();
        const createdAt = data.createdAt instanceof Timestamp 
          ? data.createdAt.toDate() 
          : new Date();
        
        return {
          id: doc.id,
          name: data.displayName || data.email.split('@')[0],
          email: data.email,
          role: 'Provider',
          status: data.status === 'suspended' ? 'SUSPENDED' : 'ACTIVE',
          date: createdAt.toLocaleDateString(),
          avatar: data.displayName ? data.displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'SP'
        };
      });
    } catch (error) {
      console.error('Error fetching service providers:', error);
      throw error;
    }
  },

  // Get users for customers section
  async getCustomers(): Promise<DashboardUser[]> {
    try {
      const seekersSnapshot = await getDocs(
        query(collection(db, 'users'), where('role', '==', 'seeker'))
      );

      return seekersSnapshot.docs.map(doc => {
        const data = doc.data();
        const createdAt = data.createdAt instanceof Timestamp 
          ? data.createdAt.toDate() 
          : new Date();
        
        return {
          id: doc.id,
          name: data.displayName || data.email.split('@')[0],
          email: data.email,
          role: 'Seeker',
          status: 'ACTIVE',
          date: createdAt.toLocaleDateString(),
          avatar: data.displayName ? data.displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'C'
        };
      });
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  },

  // Get posts for post management section
  async getPosts(): Promise<DashboardPost[]> {
    try {
      const postsSnapshot = await getDocs(collection(db, 'posts'));

      return postsSnapshot.docs.map(doc => {
        const data = doc.data();
        const createdAt = data.createdAt instanceof Timestamp 
          ? data.createdAt.toDate() 
          : new Date();
        
        // Generate random color for each post
        const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-red-500', 'bg-teal-500'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        return {
          id: `#SR-${doc.id.substring(0, 4).toUpperCase()}`,
          customer: data.ownerName || 'Unknown',
          initials: data.ownerName ? data.ownerName.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'UN',
          color: randomColor,
          service: data.category || 'Service',
          date: createdAt.toLocaleDateString(),
          status: data.status === 'pending' ? 'PENDING' : 
                 data.status === 'approved' ? 'APPROVED' : 
                 data.status === 'rejected' ? 'REJECTED' : 'IN PROGRESS'
        };
      });
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  },

  // Get approved posts for approval section
  async getApprovedPosts(): Promise<DashboardPost[]> {
    try {
      const postsSnapshot = await getDocs(
        query(collection(db, 'posts'), where('status', '==', 'approved'))
      );

      return postsSnapshot.docs.map(doc => {
        const data = doc.data();
        const createdAt = data.createdAt instanceof Timestamp 
          ? data.createdAt.toDate() 
          : new Date();
        
        const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-red-500', 'bg-teal-500'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        return {
          id: `#SR-${doc.id.substring(0, 4).toUpperCase()}`,
          customer: data.ownerName || 'Unknown',
          initials: data.ownerName ? data.ownerName.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'UN',
          color: randomColor,
          service: data.category || 'Service',
          date: createdAt.toLocaleDateString(),
          status: 'APPROVED'
        };
      });
    } catch (error) {
      console.error('Error fetching approved posts:', error);
      throw error;
    }
  },

  // Get booking trends (placeholder data - would need actual booking data)
  async getBookingTrends(): Promise<BookingTrend[]> {
    try {
      // This would typically aggregate booking data from a bookings collection
      // For now, returning mock data based on posts
      const postsSnapshot = await getDocs(collection(db, 'posts'));
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      // Group posts by month
      const monthlyCounts: Record<string, number> = {};
      months.forEach(month => monthlyCounts[month] = 0);

      postsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const createdAt = data.createdAt instanceof Timestamp 
          ? data.createdAt.toDate() 
          : new Date();
        const month = months[createdAt.getMonth()];
        monthlyCounts[month]++;
      });

      return months.map(month => ({
        month,
        value: monthlyCounts[month]
      }));
    } catch (error) {
      console.error('Error fetching booking trends:', error);
      throw error;
    }
  },

  // Get recent activities (placeholder data)
  async getRecentActivities(): Promise<DashboardActivity[]> {
    try {
      // This would typically come from an activities or logs collection
      // For now, returning mock data
      return [
        {
          icon: 'Users',
          color: 'bg-blue-100 text-blue-600',
          title: 'New Provider applied for Plumber role',
          time: '2 minutes ago'
        },
        {
          icon: 'CheckCircle',
          color: 'bg-green-100 text-green-600',
          title: 'Booking Completed – ID #48291',
          time: '15 minutes ago'
        },
        {
          icon: 'AlertCircle',
          color: 'bg-red-100 text-red-500',
          title: 'Urgent Request for HVAC Repair',
          time: '45 minutes ago'
        },
        {
          icon: 'CheckSquare',
          color: 'bg-yellow-100 text-yellow-600',
          title: '5-Star Review for Maria Garcia',
          time: '1 hour ago'
        }
      ];
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      throw error;
    }
  },

  // Get detailed post information for modal
  async getPostDetails(postId: string): Promise<any> {
    try {
      const postRef = doc(collection(db, 'posts'), postId);
      const postSnap = await getDoc(postRef);
      
      if (!postSnap.exists()) {
        throw new Error('Post not found');
      }

      const data = postSnap.data();
      const createdAt = data.createdAt instanceof Timestamp 
        ? data.createdAt.toDate() 
        : new Date();

      return {
        id: postId,
        title: data.title || 'Service Request',
        location: data.location || 'Unknown Location',
        description: data.description || 'No description available',
        includedServices: data.checklist?.join(', ') || 'No services specified',
        clientMaterials: data.clientMaterials || 'Not specified',
        pricingModel: data.pricingModel || 'Not specified',
        startingPrice: data.startingPrice || 'Not specified',
        inspectionFee: data.inspectionFee || 'Not specified',
        specificCities: data.specificCities || 'Not specified',
        travelDistance: data.travelDistance || 'Not specified',
        availableDays: data.availableDays?.join(', ') || 'Not specified',
        availableHours: `${data.timeFromHour || '09'}:${data.timeFromAmPm || 'AM'} - ${data.timeToHour || '05'}:${data.timeToAmPm || 'PM'}`,
        emergency: data.emergency || 'Not specified',
        images: data.images || []
      };
    } catch (error) {
      console.error('Error fetching post details:', error);
      throw error;
    }
  },

  // Approve a post
  async approvePost(postId: string, adminId: string, adminName: string): Promise<void> {
    try {
      await postService.updatePost(postId, { status: 'approved' });
      
      // Log the action (would need admin service integration)
      console.log(`Post ${postId} approved by ${adminName}`);
    } catch (error) {
      console.error('Error approving post:', error);
      throw error;
    }
  },

  // Reject a post
  async rejectPost(postId: string, adminId: string, adminName: string, reason?: string): Promise<void> {
    try {
      await postService.updatePost(postId, { status: 'rejected' });
      
      // Log the action (would need admin service integration)
      console.log(`Post ${postId} rejected by ${adminName}: ${reason || 'No reason provided'}`);
    } catch (error) {
      console.error('Error rejecting post:', error);
      throw error;
    }
  }
};