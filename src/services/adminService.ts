import { collection, doc, getDoc, setDoc, updateDoc, deleteDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';

export interface AdminLog {
  id: string;
  action: 'post_approved' | 'post_rejected' | 'review_approved' | 'review_rejected' | 'user_suspended' | 'user_activated';
  targetId: string;
  targetType: 'post' | 'review' | 'user';
  adminId: string;
  adminName: string;
  reason?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

const adminLogsCollection = collection(db, 'admin_logs');

export const adminService = {
  // Create an admin log entry
  async createAdminLog(logData: Omit<AdminLog, 'id' | 'timestamp'>): Promise<string> {
    const logRef = doc(adminLogsCollection);
    const now = new Date();
    
    const logDataWithId = {
      ...logData,
      id: logRef.id,
      timestamp: now
    };
    
    await setDoc(logRef, logDataWithId);
    return logRef.id;
  },

  // Get admin log by ID
  async getAdminLog(id: string): Promise<AdminLog | null> {
    const logRef = doc(adminLogsCollection, id);
    const logSnap = await getDoc(logRef);
    
    if (logSnap.exists()) {
      const data = logSnap.data();
      return {
        ...data,
        timestamp: data.timestamp.toDate(),
        id: logSnap.id
      } as AdminLog;
    }
    return null;
  },

  // Get admin logs by admin
  async getAdminLogsByAdmin(adminId: string, limitCount?: number): Promise<AdminLog[]> {
    let q = query(
      adminLogsCollection,
      where('adminId', '==', adminId),
      orderBy('timestamp', 'desc')
    );
    
    if (limitCount) {
      q = query(q, limit(limitCount));
    }
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        timestamp: data.timestamp.toDate(),
        id: doc.id
      } as AdminLog;
    });
  },

  // Get admin logs by target
  async getAdminLogsByTarget(targetId: string, targetType: AdminLog['targetType']): Promise<AdminLog[]> {
    const q = query(
      adminLogsCollection,
      where('targetId', '==', targetId),
      where('targetType', '==', targetType),
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        timestamp: data.timestamp.toDate(),
        id: doc.id
      } as AdminLog;
    });
  },

  // Get all admin logs (for admin dashboard)
  async getAllAdminLogs(limitCount?: number): Promise<AdminLog[]> {
    let q = query(adminLogsCollection, orderBy('timestamp', 'desc'));
    
    if (limitCount) {
      q = query(q, limit(limitCount));
    }
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        timestamp: data.timestamp.toDate(),
        id: doc.id
      } as AdminLog;
    });
  },

  // Get admin logs by action type
  async getAdminLogsByAction(action: string): Promise<AdminLog[]> {
    const q = query(
      adminLogsCollection,
      where('action', '==', action),
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        timestamp: data.timestamp.toDate(),
        id: doc.id
      } as AdminLog;
    });
  },

  // Approve a post
  async approvePost(postId: string, adminId: string, adminName: string): Promise<void> {
    const postRef = doc(collection(db, 'posts'), postId);
    await updateDoc(postRef, {
      status: 'approved',
      updatedAt: new Date()
    });
    
    // Log the action
    await this.createAdminLog({
      action: 'post_approved',
      targetId: postId,
      targetType: 'post',
      adminId,
      adminName
    });
  },

  // Reject a post
  async rejectPost(postId: string, adminId: string, adminName: string, reason?: string): Promise<void> {
    const postRef = doc(collection(db, 'posts'), postId);
    await updateDoc(postRef, {
      status: 'rejected',
      updatedAt: new Date()
    });
    
    // Log the action
    await this.createAdminLog({
      action: 'post_rejected',
      targetId: postId,
      targetType: 'post',
      adminId,
      adminName,
      reason
    });
  },

  // Approve a review
  async approveReview(reviewId: string, adminId: string, adminName: string): Promise<void> {
    const reviewRef = doc(collection(db, 'reviews'), reviewId);
    await updateDoc(reviewRef, {
      status: 'approved',
      updatedAt: new Date()
    });
    
    // Log the action
    await this.createAdminLog({
      action: 'review_approved',
      targetId: reviewId,
      targetType: 'review',
      adminId,
      adminName
    });
  },

  // Reject a review
  async rejectReview(reviewId: string, adminId: string, adminName: string, reason?: string): Promise<void> {
    const reviewRef = doc(collection(db, 'reviews'), reviewId);
    await updateDoc(reviewRef, {
      status: 'rejected',
      updatedAt: new Date()
    });
    
    // Log the action
    await this.createAdminLog({
      action: 'review_rejected',
      targetId: reviewId,
      targetType: 'review',
      adminId,
      adminName,
      reason
    });
  },

  // Suspend a user
  async suspendUser(userId: string, adminId: string, adminName: string, reason?: string): Promise<void> {
    const userRef = doc(collection(db, 'users'), userId);
    await updateDoc(userRef, {
      status: 'suspended',
      updatedAt: new Date()
    });
    
    // Log the action
    await this.createAdminLog({
      action: 'user_suspended',
      targetId: userId,
      targetType: 'user',
      adminId,
      adminName,
      reason
    });
  },

  // Activate a user
  async activateUser(userId: string, adminId: string, adminName: string): Promise<void> {
    const userRef = doc(collection(db, 'users'), userId);
    await updateDoc(userRef, {
      status: 'active',
      updatedAt: new Date()
    });
    
    // Log the action
    await this.createAdminLog({
      action: 'user_activated',
      targetId: userId,
      targetType: 'user',
      adminId,
      adminName
    });
  },

  // Get system statistics
  async getSystemStats(): Promise<{
    totalUsers: number;
    totalPosts: number;
    totalReviews: number;
    pendingPosts: number;
    approvedPosts: number;
    rejectedPosts: number;
    totalAdminActions: number;
  }> {
    // Get counts using separate queries
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const postsSnapshot = await getDocs(collection(db, 'posts'));
    const reviewsSnapshot = await getDocs(collection(db, 'reviews'));
    const adminLogsSnapshot = await getDocs(adminLogsCollection);
    
    // Count posts by status
    const pendingPosts = postsSnapshot.docs.filter(doc => doc.data().status === 'pending').length;
    const approvedPosts = postsSnapshot.docs.filter(doc => doc.data().status === 'approved').length;
    const rejectedPosts = postsSnapshot.docs.filter(doc => doc.data().status === 'rejected').length;
    
    return {
      totalUsers: usersSnapshot.docs.length,
      totalPosts: postsSnapshot.docs.length,
      totalReviews: reviewsSnapshot.docs.length,
      pendingPosts,
      approvedPosts,
      rejectedPosts,
      totalAdminActions: adminLogsSnapshot.docs.length
    };
  }
};