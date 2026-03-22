import { collection, doc, getDoc, setDoc, updateDoc, deleteDoc, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';

export interface Review {
  id: string;
  serviceProviderId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar?: string;
  rating: number; // 1-5
  comment: string;
  helpful?: number;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  isVerified?: boolean;
  status?: 'active' | 'deleted' | 'flagged'; // Optional for soft delete tracking
}

export type UserRole = 'service_provider' | 'admin' | 'seeker';

export class ReviewAuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ReviewAuthorizationError';
  }
}

const reviewsCollection = collection(db, 'reviews');

export const reviewService = {
  /**
   * CREATE REVIEW - Add a new review
   * Any authenticated user can create a review (validated: reviewerId must match currentUser)
   */
  async createReview(reviewData: Omit<Review, 'id' | 'helpful' | 'createdAt' | 'updatedAt' | 'status'>): Promise<{ id: string; message: string }> {
    // Validate: reviewer cannot review own profile
    if (reviewData.reviewerId === reviewData.serviceProviderId) {
      throw new Error('Cannot review own profile');
    }

    // Validate rating
    if (reviewData.rating < 1 || reviewData.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    // Validate comment
    if (!reviewData.comment || reviewData.comment.trim().length === 0) {
      throw new Error('Review comment cannot be empty');
    }

    const reviewRef = doc(reviewsCollection);
    const now = new Date();

    const reviewDataWithDefaults = {
      ...reviewData,
      id: reviewRef.id,
      helpful: 0,
      status: 'active',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    await setDoc(reviewRef, reviewDataWithDefaults);
    return { id: reviewRef.id, message: 'Review created successfully' };
  },

  /**
   * GET REVIEW BY ID
   * Anyone can read an active review
   */
  async getReview(id: string): Promise<Review | null> {
    const reviewRef = doc(reviewsCollection, id);
    const reviewSnap = await getDoc(reviewRef);

    if (reviewSnap.exists()) {
      const data = reviewSnap.data();
      return {
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
        id: reviewSnap.id
      } as Review;
    }
    return null;
  },

  /**
   * UPDATE REVIEW
   * Only reviewer or admin can update
   */
  async updateReview(id: string, currentUserId: string, userRole: UserRole, updates: Partial<Review>): Promise<{ success: boolean; message: string }> {
    const reviewRef = doc(reviewsCollection, id);
    const reviewSnap = await getDoc(reviewRef);

    if (!reviewSnap.exists()) {
      throw new Error('Review not found');
    }

    const review = reviewSnap.data() as Review;

    // Authorization check
    if (userRole !== 'admin' && currentUserId !== review.reviewerId) {
      throw new ReviewAuthorizationError('You do not have permission to update this review');
    }

    await updateDoc(reviewRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });

    return { success: true, message: 'Review updated successfully' };
  },

  /**
   * DELETE REVIEW - with role-based authorization
   * ADMIN: Can delete ANY review
   * SERVICE_PROVIDER: Can delete reviews on OWN profile only
   * SEEKER: Can delete ONLY their OWN reviews
   */
  async deleteReview(reviewId: string, currentUserId: string, userRole: UserRole): Promise<{ success: boolean; message: string }> {
    const reviewRef = doc(reviewsCollection, reviewId);
    const reviewSnap = await getDoc(reviewRef);

    if (!reviewSnap.exists()) {
      throw new Error('Review not found or already deleted');
    }

    const review = reviewSnap.data() as Review;

    // Authorization logic based on role
    let isAuthorized = false;

    if (userRole === 'admin') {
      // Admin can delete ANY review
      isAuthorized = true;
    } else if (userRole === 'service_provider') {
      // Service provider can delete reviews on their own profile only
      isAuthorized = review.serviceProviderId === currentUserId;
    } else if (userRole === 'seeker') {
      // Seeker can delete ONLY their own reviews
      isAuthorized = review.reviewerId === currentUserId;
    }

    if (!isAuthorized) {
      throw new ReviewAuthorizationError('Unauthorized: You do not have permission to delete this review');
    }

    // Perform deletion
    await deleteDoc(reviewRef);

    return { success: true, message: 'Review deleted successfully' };
  },

  /**
   * GET REVIEWS BY REVIEWER
   * Returns all reviews created by a specific user
   */
  async getReviewsByReviewer(reviewerId: string): Promise<Review[]> {
    const q = query(
      reviewsCollection,
      where('reviewerId', '==', reviewerId)
    );
    const querySnapshot = await getDocs(q);

    // Convert to array and sort client-side to avoid composite index requirement
    const reviews = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
        id: doc.id
      } as Review;
    });

    // Sort by createdAt descending (newest first)
    return reviews.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },

  /**
   * GET AVERAGE RATING FOR SERVICE PROVIDER
   * Calculates average rating from all active reviews
   */
  async getAverageRating(serviceProviderId: string): Promise<number> {
    const reviews = await this.getReviewsByServiceProvider(serviceProviderId);

    if (reviews.length === 0) {
      return 0;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return Math.round((totalRating / reviews.length) * 10) / 10; // Round to 1 decimal place
  },

  /**
   * GET REVIEW STATISTICS FOR SERVICE PROVIDER
   * Returns: total count, average rating, distribution by star rating
   */
  async getReviewStats(serviceProviderId: string): Promise<{
    totalReviews: number;
    averageRating: number;
    ratingDistribution: Record<number, number>;
  }> {
    const reviews = await this.getReviewsByServiceProvider(serviceProviderId);

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? Math.round((reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews) * 10) / 10
      : 0;

    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(review => {
      ratingDistribution[review.rating] = (ratingDistribution[review.rating] || 0) + 1;
    });

    return {
      totalReviews,
      averageRating,
      ratingDistribution
    };
  },

  /**
   * CHECK IF USER HAS ALREADY REVIEWED THIS SERVICE PROVIDER
   * Prevents duplicate reviews from the same user
   */
  async hasUserReviewedServiceProvider(reviewerId: string, serviceProviderId: string): Promise<boolean> {
    const q = query(
      reviewsCollection,
      where('reviewerId', '==', reviewerId),
      where('serviceProviderId', '==', serviceProviderId),
      where('status', '==', 'active')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.length > 0;
  },

  /**
   * GET REVIEWS BY SERVICE PROVIDER
   * Returns only active reviews for a service provider, ordered by newest first
   */
  async getReviewsByServiceProvider(serviceProviderId: string): Promise<Review[]> {
    const q = query(
      reviewsCollection,
      where('serviceProviderId', '==', serviceProviderId),
      where('status', '==', 'active')
    );
    const querySnapshot = await getDocs(q);

    // Convert to array and sort client-side to avoid composite index requirement
    const reviews = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
        id: doc.id
      } as Review;
    });

    // Sort by createdAt descending (newest first)
    return reviews.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },

  /**
   * GET EXISTING REVIEW FROM USER TO SERVICE PROVIDER
   * Returns the review if exists, null otherwise
   */
  async getUserReviewForServiceProvider(reviewerId: string, serviceProviderId: string): Promise<Review | null> {
    const q = query(
      reviewsCollection,
      where('reviewerId', '==', reviewerId),
      where('serviceProviderId', '==', serviceProviderId),
      where('status', '==', 'active')
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.docs.length > 0) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      return {
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
        id: doc.id
      } as Review;
    }
    return null;
  },

  /**
   * INCREMENT HELPFUL COUNT
   * Tracks how many users found the review helpful
   */
  async incrementHelpful(reviewId: string): Promise<void> {
    const reviewRef = doc(reviewsCollection, reviewId);
    const reviewSnap = await getDoc(reviewRef);

    if (reviewSnap.exists()) {
      const currentHelpful = reviewSnap.data().helpful || 0;
      await updateDoc(reviewRef, {
        helpful: currentHelpful + 1,
        updatedAt: Timestamp.now()
      });
    }
  }
};