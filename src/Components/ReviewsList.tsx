import React, { useState, useEffect, useMemo } from 'react';
import { Star,  Filter, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import ReviewCard from './ReviewCard';
import { reviewService } from '../services/reviewService';
import type { Review } from '../services/reviewService';
import type { UserRole } from '../services/reviewService';
import { useAuth } from '../contexts/AuthContext';
import { Timestamp } from 'firebase/firestore';

interface ReviewsListProps {
  serviceProviderId: string;
  serviceProviderName: string;
  onReviewAdded?: () => void;
  readOnly?: boolean;
}

type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest';

const ReviewsList: React.FC<ReviewsListProps> = ({
  serviceProviderId,
  serviceProviderName,
  onReviewAdded,
  readOnly = false
}) => {
  const { currentUser, userRole } = useAuth();
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Sorting and pagination
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState<boolean>(false);
  
  // Review stats
  const [averageRating, setAverageRating] = useState<number>(0);
  const [totalReviews, setTotalReviews] = useState<number>(0);
  const [ratingDistribution, setRatingDistribution] = useState<Record<number, number>>({
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0
  });


  useEffect(() => {
    fetchReviews();
  }, [serviceProviderId, onReviewAdded]);

  const fetchReviews = async () => {
    if (!serviceProviderId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const serviceProviderReviews = await reviewService.getReviewsByServiceProvider(serviceProviderId);
      setReviews(serviceProviderReviews);
      
      const stats = await reviewService.getReviewStats(serviceProviderId);
      setAverageRating(stats.averageRating);
      setTotalReviews(stats.totalReviews);
      setRatingDistribution(stats.ratingDistribution);
      
      setCurrentPage(1); // Reset to first page when data changes
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load reviews. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Sorting logic
  const sortedReviews = useMemo(() => {
    const sorted = [...reviews];
    
    switch (sortOption) {
      case 'newest':
        return sorted.sort((a, b) => {
          const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toDate() : a.createdAt;
          const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toDate() : b.createdAt;
          const timeA = dateA instanceof Date ? dateA.getTime() : new Date(dateA).getTime();
          const timeB = dateB instanceof Date ? dateB.getTime() : new Date(dateB).getTime();
          return timeB - timeA;
        });
      case 'oldest':
        return sorted.sort((a, b) => {
          const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toDate() : a.createdAt;
          const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toDate() : b.createdAt;
          const timeA = dateA instanceof Date ? dateA.getTime() : new Date(dateA).getTime();
          const timeB = dateB instanceof Date ? dateB.getTime() : new Date(dateB).getTime();
          return timeA - timeB;
        });
      case 'highest':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'lowest':
        return sorted.sort((a, b) => a.rating - b.rating);
      default:
        return sorted;
    }
  }, [reviews, sortOption]);

  // Pagination logic
  const itemsPerPage = 6;
  const totalPages = Math.max(1, Math.ceil(sortedReviews.length / itemsPerPage));
  const paginatedReviews = sortedReviews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDeleteReview = async (reviewId: string, reason?: string) => {
    try {
      await reviewService.deleteReview(reviewId, currentUser?.uid || '', userRole as UserRole);
      fetchReviews(); // Refresh the list
    } catch (err: any) {
      console.error('Error deleting review:', err);
      setError(err.message || 'Failed to delete review. Please try again.');
    }
  };

  const handleEditReview = (reviewId: string) => {
    // This would typically open an edit modal
    // For now, we'll just log the action
    console.log('Edit review:', reviewId);
  };

  const formatRating = (rating: number) => {
    return rating.toFixed(1);
  };

  const getSortLabel = (option: SortOption) => {
    switch (option) {
      case 'newest': return 'Newest First';
      case 'oldest': return 'Oldest First';
      case 'highest': return 'Highest Rated';
      case 'lowest': return 'Lowest Rated';
      default: return 'Newest First';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-gray-600">Loading reviews...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      {!readOnly && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                <span className="text-2xl font-bold text-gray-900">
                  {formatRating(averageRating)}
                </span>
                <span className="text-gray-500">/ 5</span>
              </div>
              <div className="text-sm text-gray-600">
                Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}
              </div>
            </div>
            
            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">{getSortLabel(sortOption)}</span>
                {isSortDropdownOpen ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </button>
              
              {isSortDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-10">
                  {(['newest', 'oldest', 'highest', 'lowest'] as SortOption[]).map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setSortOption(option);
                        setIsSortDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm ${
                        sortOption === option
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {getSortLabel(option)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Rating Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingDistribution[star] || 0;
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              
              return (
                <div key={star} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span>{star}</span>
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Reviews Grid */}
      <div className="space-y-4">
        {sortedReviews.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <Star className="w-12 h-12 text-gray-300" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">No Reviews Yet</h3>
                <p className="text-gray-600">
                  Be the first to share your experience with {serviceProviderName}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {paginatedReviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  currentUserId={currentUser?.uid || ''}
                  userRole={userRole as UserRole}
                  onEdit={handleEditReview}
                  onDelete={handleDeleteReview}
                  isLoading={loading}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 py-6">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium transition-colors ${
                        page === currentPage
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ReviewsList;