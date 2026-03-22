import React, { useState } from 'react';
import { Star, User, Calendar, Edit, Trash2, MoreVertical } from 'lucide-react';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import type { Review } from '../services/reviewService';
import { Timestamp } from 'firebase/firestore';

interface ReviewCardProps {
  review: Review;
  currentUserId: string;
  userRole: 'seeker' | 'service_provider' | 'admin';
  onEdit: (reviewId: string) => void;
  onDelete: (reviewId: string, reason?: string) => Promise<void>;
  isLoading?: boolean;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  currentUserId,
  userRole,
  onEdit,
  onDelete,
  isLoading = false
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showActions, setShowActions] = useState(false);

  // Determine if user can delete based on role-based permissions
  const canDelete = 
    (currentUserId === review.reviewerId && userRole === 'seeker') ||
    (currentUserId === review.reviewerId && userRole === 'admin') ||
    (currentUserId === review.serviceProviderId && userRole === 'service_provider') ||
    userRole === 'admin';

  const canEdit = currentUserId === review.reviewerId && userRole !== 'admin';

  const handleDelete = async (reason?: string) => {
    await onDelete(review.id, reason);
    setShowDeleteModal(false);
  };

  const formatDate = (date: Date | string | Timestamp) => {
    try {
      // Handle Firebase Timestamp objects
      if (date instanceof Timestamp) {
        return date.toDate().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
      
      const dateObj = date instanceof Date ? date : new Date(date);
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
        {/* Header with reviewer info */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center flex-shrink-0">
              {review.reviewerAvatar ? (
                <img 
                  src={review.reviewerAvatar} 
                  alt={review.reviewerName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-6 h-6 text-blue-600" />
              )}
            </div>

            {/* Reviewer info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-gray-900 text-sm truncate">
                  {review.reviewerName}
                </h4>
                {review.isVerified && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Verified
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(review.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <span className="font-medium">{review.rating}/5</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions dropdown */}
          {(canEdit || canDelete) && (
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                disabled={isLoading}
              >
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </button>

              {showActions && (
                <div className="absolute right-0 top-8 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-10">
                  {canEdit && (
                    <button
                      onClick={() => {
                        onEdit(review.id);
                        setShowActions(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      disabled={isLoading}
                    >
                      <Edit className="w-3 h-3" />
                      Edit Review
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => {
                        setShowDeleteModal(true);
                        setShowActions(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      disabled={isLoading}
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete Review
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Review content */}
        <div className="mb-4">
          <p className="text-gray-700 text-sm leading-relaxed">
            {review.comment}
          </p>
        </div>

        {/* Footer with helpful count */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-400" />
              <span>{review.rating} out of 5</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              <span>{review.helpful || 0} found helpful</span>
            </span>
          </div>
          
          {/* Edit/Delete buttons for mobile */}
          <div className="flex gap-2 md:hidden">
            {canEdit && (
              <button
                onClick={() => onEdit(review.id)}
                className="px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                disabled={isLoading}
              >
                Edit
              </button>
            )}
            {canDelete && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-3 py-1 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                disabled={isLoading}
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        isLoading={isLoading}
        reviewerName={review.reviewerName}
        userRole={userRole}
      />
    </>
  );
};

export default ReviewCard;