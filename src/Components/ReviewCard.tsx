import React, { useState, useEffect } from 'react';
import { Star, User, Calendar, Edit, Trash2, MoreVertical, Heart } from 'lucide-react';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { reviewService, type Review } from '../services/reviewService';
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
  isLoading = false,
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [isReacting, setIsReacting] = useState(false);
  const [userHasReacted, setUserHasReacted] = useState(false);
  const [likeCount, setLikeCount] = useState(review.likes || 0);

  // ── Auth check ───────────────────────────────────────────────────────────────
  const isAuthenticated = !!currentUserId;

  // ── Permission flags ─────────────────────────────────────────────────────────

  // ANY authenticated user (seeker, service_provider, admin) can react
  const canReact = isAuthenticated;

  // The reviewer (seeker) OR admin can edit their own review / any review
  const canEdit =
    isAuthenticated &&
    (currentUserId === review.reviewerId ||
      userRole === 'admin');

  // Reviewer, service provider of that post, or admin can delete
  const canDelete =
    isAuthenticated &&
    (currentUserId === review.reviewerId ||
      currentUserId === review.serviceProviderId ||
      userRole === 'admin');

  // ── Initialise reaction state from Firestore ─────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;

    const checkReaction = async () => {
      try {
        const hasReacted = await reviewService.hasUserReacted(review.id, currentUserId);
        if (!cancelled) setUserHasReacted(hasReacted);
      } catch (err) {
        console.error('Error checking reaction:', err);
      }
    };

    checkReaction();
    return () => { cancelled = true; };
  }, [review.id, currentUserId, isAuthenticated]);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleDelete = async (reason?: string) => {
    await onDelete(review.id, reason);
    setShowDeleteModal(false);
  };

  /**
   * Toggle heart reaction.
   * Open to ALL authenticated users regardless of role.
   * Uses optimistic UI update then confirms with server response.
   */
  const handleToggleReaction = async () => {
    if (!canReact || isReacting || isLoading) return;

    // Optimistic update
    const optimisticReacted = !userHasReacted;
    const optimisticCount = optimisticReacted ? likeCount + 1 : likeCount - 1;
    setUserHasReacted(optimisticReacted);
    setLikeCount(optimisticCount);

    setIsReacting(true);
    try {
      const result = await reviewService.toggleReaction(review.id, currentUserId);
      // Confirm with server truth
      setUserHasReacted(result.liked);
      setLikeCount(result.count);
    } catch (err) {
      // Roll back optimistic update on failure
      setUserHasReacted(!optimisticReacted);
      setLikeCount(likeCount);
      console.error('Error toggling reaction:', err);
    } finally {
      setIsReacting(false);
    }
  };

  // ── Helpers ──────────────────────────────────────────────────────────────────

  const formatDate = (date: Date | string | Timestamp): string => {
    try {
      const d = date instanceof Timestamp ? date.toDate() : new Date(date);
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Invalid date';
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">

        {/* ── Header ── */}
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

            {/* Reviewer name + meta */}
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

          {/* ── Actions dropdown (edit / delete) ── */}
          {(canEdit || canDelete) && (
            <div className="relative">
              <button
                onClick={() => setShowActions(prev => !prev)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                disabled={isLoading}
                aria-label="Review actions"
              >
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </button>

              {showActions && (
                <>
                  {/* Click-away backdrop */}
                  <div
                    className="fixed inset-0 z-0"
                    onClick={() => setShowActions(false)}
                  />
                  <div className="absolute right-0 top-8 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-10">
                    {canEdit && (
                      <button
                        onClick={() => { onEdit(review.id); setShowActions(false); }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        disabled={isLoading}
                      >
                        <Edit className="w-3 h-3" />
                        Edit Review
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => { setShowDeleteModal(true); setShowActions(false); }}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        disabled={isLoading}
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete Review
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* ── Comment body ── */}
        <div className="mb-4">
          <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>
        </div>

        {/* ── Footer: star summary + heart reaction ── */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            <span>{review.rating} out of 5</span>
          </div>

          {/*
           * Heart button — visible to ALL authenticated users.
           * canReact = isAuthenticated, so seekers, providers, and admins
           * can all like a review. Unauthenticated visitors see nothing.
           */}
          {canReact && (
            <button
              onClick={handleToggleReaction}
              disabled={isReacting || isLoading}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 ${
                userHasReacted
                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-red-500'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              aria-label={userHasReacted ? 'Remove reaction' : 'Add reaction'}
            >
              <Heart
                className={`w-4 h-4 transition-all duration-200 ${
                  userHasReacted ? 'fill-red-600 scale-110' : ''
                }`}
              />
              <span className="text-xs font-semibold">{likeCount}</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Delete confirmation modal ── */}
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