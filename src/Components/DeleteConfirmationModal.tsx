import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import type { UserRole } from '../services/reviewService';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => Promise<void>;
  isLoading: boolean;
  reviewerName: string;
  userRole: UserRole;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  reviewerName,
  userRole
}) => {
  const [reason, setReason] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');

  const handleConfirm = async () => {
    await onConfirm(reason === 'other' ? customReason : reason);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 disabled:opacity-50"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-red-500" />
          <h2 className="text-lg font-bold text-gray-900">Delete Review?</h2>
        </div>

        {/* Message */}
        <p className="text-sm text-gray-600 mb-4">
          Are you sure you want to delete the review from{' '}
          <span className="font-semibold">{reviewerName}</span>?
        </p>

        {/* Admin Reason Section */}
        {userRole === 'admin' && (
          <div className="mb-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Deletion Reason (Admin Moderation)
            </label>

            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="reason"
                  value="spam"
                  checked={reason === 'spam'}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-4 h-4"
                  disabled={isLoading}
                />
                <span className="text-sm text-gray-700">Spam/Inappropriate Content</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="reason"
                  value="unverified"
                  checked={reason === 'unverified'}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-4 h-4"
                  disabled={isLoading}
                />
                <span className="text-sm text-gray-700">Verified Users Only</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="reason"
                  value="false_claim"
                  checked={reason === 'false_claim'}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-4 h-4"
                  disabled={isLoading}
                />
                <span className="text-sm text-gray-700">False Claims</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="reason"
                  value="duplicate"
                  checked={reason === 'duplicate'}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-4 h-4"
                  disabled={isLoading}
                />
                <span className="text-sm text-gray-700">Duplicate Review</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="reason"
                  value="other"
                  checked={reason === 'other'}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-4 h-4"
                  disabled={isLoading}
                />
                <span className="text-sm text-gray-700">Other</span>
              </label>
            </div>

            {reason === 'other' && (
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Please specify the reason for deletion..."
                className="w-full mt-3 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={3}
                disabled={isLoading}
              />
            )}
          </div>
        )}

        {/* Warning for Service Provider */}
        {userRole === 'service_provider' && (
          <div className="mb-6 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-xs text-yellow-800">
              This will remove the review from your profile. This action cannot be undone.
            </p>
          </div>
        )}

        {/* Warning for Seeker */}
        {userRole === 'seeker' && (
          <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-800">
              You can only delete reviews you've written. This action cannot be undone.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading || (userRole === 'admin' && !reason)}
            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
