import React, { useState, useEffect } from 'react';
import { Star, X, AlertCircle, CheckCircle } from 'lucide-react';
import { reviewService, ReviewAuthorizationError } from '../services/reviewService';
import type { Review } from '../services/reviewService';
import type { UserRole } from '../services/reviewService';
import { useAuth } from '../contexts/AuthContext';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceProviderId: string;
  serviceProviderName: string;
  onReviewAdded?: () => void;
  editingReviewId?: string;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  serviceProviderId,
  serviceProviderName,
  onReviewAdded,
  editingReviewId
}) => {
  const { currentUser, userRole } = useAuth();
  
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);
  
  // Validation states
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState<boolean>(false);

  // Character count
  const charCount = comment.length;
  const isCharCountValid = charCount >= 10 && charCount <= 500;

  // Duplicate review check
  const [hasExistingReview, setHasExistingReview] = useState<boolean>(false);
  const [existingReview, setExistingReview] = useState<Review | null>(null);

  useEffect(() => {
    if (isOpen && editingReviewId) {
      // Load existing review for editing
      const loadExistingReview = async () => {
        try {
          const review = await reviewService.getReview(editingReviewId);
          if (review) {
            setRating(review.rating);
            setComment(review.comment);
            setExistingReview(review);
          }
        } catch (err) {
          console.error('Error loading review:', err);
        }
      };
      loadExistingReview();
    } else if (isOpen && !editingReviewId && currentUser) {
      // Check for existing review to prevent duplicates
      const checkExistingReview = async () => {
        try {
          const hasReviewed = await reviewService.hasUserReviewedServiceProvider(
            currentUser.uid, 
            serviceProviderId
          );
          setHasExistingReview(hasReviewed);
          
          if (hasReviewed) {
            const existing = await reviewService.getUserReviewForServiceProvider(
              currentUser.uid, 
              serviceProviderId
            );
            setExistingReview(existing);
          }
        } catch (err) {
          console.error('Error checking existing review:', err);
        }
      };
      checkExistingReview();
    }
  }, [isOpen, editingReviewId, serviceProviderId, currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);

    // Validation
    if (!isCharCountValid) {
      setError('Review must be between 10 and 500 characters');
      return;
    }

    if (!currentUser) {
      setError('You must be logged in to submit a review');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      if (editingReviewId && existingReview) {
        // Update existing review
        await reviewService.updateReview(editingReviewId, currentUser.uid, userRole as UserRole, {
          rating,
          comment,
          updatedAt: new Date()
        });
      } else {
        // Create new review
        await reviewService.createReview({
          serviceProviderId,
          reviewerId: currentUser.uid,
          reviewerName: currentUser.displayName || 'Anonymous',
          reviewerAvatar: currentUser.photoURL ?? undefined,
          rating,
          comment
        });
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setRating(5);
        setComment('');
        setHasAttemptedSubmit(false);
        onClose();
        onReviewAdded?.();
      }, 1500);

    } catch (err: any) {
      console.error('Error submitting review:', err);
      if (err.message?.includes('Cannot review own profile')) {
        setError('You cannot review your own profile');
      } else if (err.message?.includes('duplicate')) {
        setError('You have already reviewed this service provider');
      } else if (err.message?.includes('rating')) {
        setError('Please select a rating between 1 and 5');
      } else if (err.message?.includes('comment')) {
        setError('Review comment is required');
      } else if (err instanceof ReviewAuthorizationError) {
        setError('You do not have permission to perform this action');
      } else {
        setError('Failed to submit review. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleStarClick = (star: number) => {
    setRating(star);
  };

  const handleClose = () => {
    setRating(5);
    setComment('');
    setError('');
    setSuccess(false);
    setHasAttemptedSubmit(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">
        {/* Close Button */}
        <button
          onClick={handleClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 disabled:opacity-50"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-1">
            {editingReviewId ? 'Edit Review' : 'Add Review'}
          </h2>
          <p className="text-sm text-gray-600">
            for {serviceProviderName}
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm text-green-700">
              {editingReviewId ? 'Review updated successfully!' : 'Review submitted successfully!'}
            </span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {/* Duplicate Review Warning */}
        {hasExistingReview && !editingReviewId && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              You have already reviewed this service provider. You can only have one active review per provider.
            </p>
            {existingReview && (
              <button
                onClick={() => {
                  // Navigate to edit the existing review
                  // This would typically involve updating the parent component's state
                  console.log('Edit existing review:', existingReview.id);
                }}
                className="mt-2 text-sm text-yellow-600 hover:text-yellow-800 underline"
              >
                Edit your existing review
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Rating <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleStarClick(star)}
                  disabled={isLoading}
                  className="focus:outline-none transition-colors"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    } hover:text-yellow-400 transition-colors`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Your Review <span className="text-red-500">*</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this service provider..."
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-colors ${
                hasAttemptedSubmit && !isCharCountValid
                  ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
                  : 'border-gray-300 focus:ring-blue-200 focus:border-blue-400'
              }`}
              rows={5}
              disabled={isLoading || (hasExistingReview && !editingReviewId)}
            />
            <div className="flex justify-between items-center mt-2">
              <span className={`text-xs ${
                hasAttemptedSubmit && !isCharCountValid ? 'text-red-500' : 'text-gray-500'
              }`}>
                {charCount} / 500 characters
                {!isCharCountValid && hasAttemptedSubmit && (
                  <span className="ml-2">- Must be between 10 and 500 characters</span>
                )}
              </span>
              <span className={`text-xs ${
                charCount > 450 ? 'text-orange-500' : 'text-gray-400'
              }`}>
                {charCount > 450 && 'Getting close to limit'}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                isLoading || 
                !isCharCountValid || 
                (hasExistingReview && !editingReviewId) ||
                !currentUser
              }
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isLoading 
                ? 'Submitting...' 
                : editingReviewId 
                  ? 'Update Review' 
                  : 'Submit Review'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;