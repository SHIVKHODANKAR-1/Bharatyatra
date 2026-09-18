import React, { useState } from 'react';
import { X, Star, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Button } from '../common/Button';
import { ReviewService } from '../../services/reviewService';
import { TravelerReview } from '../../types/booking';
import { useAuth } from '../../context/AuthContext';

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
  itemTitle: string;
  itemType: 'experience' | 'event' | 'destination' | 'provider';
  onReviewSubmitted?: (review: TravelerReview) => void;
}

export const WriteReviewModal: React.FC<WriteReviewModalProps> = ({
  isOpen,
  onClose,
  itemId,
  itemTitle,
  itemType,
  onReviewSubmitted,
}) => {
  const { currentUser } = useAuth();

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [title, setTitle] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('Authentic Culture');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const availableTags = [
    'Authentic Culture',
    'Great Storytelling',
    'Spiritual & Peaceful',
    'Family Friendly',
    'Excellent Host',
    'Value for Money',
    'Photography Worthy',
  ];

  const handleSubmit = () => {
    setErrorMessage(null);
    if (rating < 1 || rating > 5) {
      setErrorMessage('Please select a star rating between 1 and 5.');
      return;
    }
    if (!title.trim()) {
      setErrorMessage('Please give your review a short title.');
      return;
    }
    if (comment.trim().length < 10) {
      setErrorMessage('Please share a few sentences of detail (at least 10 characters).');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = ReviewService.submitReview({
        itemType,
        itemId,
        itemTitle,
        userId: currentUser?.id || currentUser?.uid || 'usr_demo_traveler',
        userName: currentUser?.fullName || currentUser?.displayName || 'Aarav Sharma',
        userAvatar: currentUser?.avatarUrl || currentUser?.photoURL,
        rating,
        title: title.trim(),
        comment: comment.trim(),
        tags: [selectedTag],
      });

      if (result.success && result.review) {
        setSuccess(true);
        if (onReviewSubmitted) onReviewSubmitted(result.review);
        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 1500);
      } else {
        setErrorMessage(result.error || 'Could not submit review.');
      }
    } catch {
      setErrorMessage('Unexpected error submitting review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/80 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col my-auto animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D9531E]" />
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
              Write Verified Review
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs text-stone-900 dark:text-stone-100">
          {success ? (
            <div className="text-center py-8 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-in zoom-in" />
              <h4 className="text-base font-bold">Review Published!</h4>
              <p className="text-stone-500">Thank you for sharing genuine guidance for fellow travelers.</p>
            </div>
          ) : (
            <>
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-center gap-2 text-red-700 dark:text-red-300">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800 space-y-0.5">
                <span className="text-[10px] text-stone-400 uppercase tracking-wider font-bold">Reviewing</span>
                <p className="font-bold text-stone-900 dark:text-stone-100 text-sm truncate">{itemTitle}</p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Booking Status will be automatically attached if completed.</span>
                </p>
              </div>

              {/* Star selection */}
              <div className="space-y-1.5 text-center py-2">
                <label className="text-xs font-semibold text-stone-600 dark:text-stone-400">
                  Overall Rating
                </label>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          (hoverRating || rating) >= star
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-stone-300 dark:text-stone-700'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                  {rating === 5 && 'Outstanding Experience'}
                  {rating === 4 && 'Very Good / Recommended'}
                  {rating === 3 && 'Average / Met Expectations'}
                  {rating === 2 && 'Needs Improvement'}
                  {rating === 1 && 'Disappointing'}
                </div>
              </div>

              {/* Title input */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-stone-700 dark:text-stone-300">
                  Review Headline *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Unforgettable morning chants on Mother Ganga"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#D9531E]"
                />
              </div>

              {/* Comment */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-stone-700 dark:text-stone-300">
                  Detailed Experience & Recommendations *
                </label>
                <textarea
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What made this experience memorable? Mention tips about clothing, timing, guides, or accessibility..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#D9531E]"
                />
              </div>

              {/* Highlight Tag */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-stone-700 dark:text-stone-300">
                  Select Key Highlight Tag
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {availableTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSelectedTag(tag)}
                      className={`px-2.5 py-1 rounded-full text-[11px] border transition-colors ${
                        selectedTag === tag
                          ? 'bg-[#D9531E] text-white border-[#D9531E]'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <Button
                  variant="outline"
                  className="text-xs"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  className="flex-1 text-xs"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Publishing Review...' : 'Publish Verified Review'}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
