import React, { useState, useEffect } from 'react';
import { Star, ShieldCheck, Flag, MessageSquare, Plus, ThumbsUp, AlertCircle } from 'lucide-react';
import { TravelerReview } from '../../types/booking';
import { ReviewService, ReviewStats } from '../../services/reviewService';
import { Button } from '../common/Button';
import { WriteReviewModal } from './WriteReviewModal';
import { ReportModal } from '../support/ReportModal';

interface ReviewsSectionProps {
  itemId: string;
  itemTitle: string;
  itemType: 'experience' | 'event' | 'destination' | 'provider';
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  itemId,
  itemTitle,
  itemType,
}) => {
  const [reviews, setReviews] = useState<TravelerReview[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    averageRating: 0,
    totalReviews: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [isWriteModalOpen, setIsWriteModalOpen] = useState<boolean>(false);
  const [reportingReview, setReportingReview] = useState<TravelerReview | null>(null);
  const [filterVerifiedOnly, setFilterVerifiedOnly] = useState<boolean>(false);

  const loadReviews = () => {
    const list = ReviewService.getReviewsForItem(itemId, false);
    setReviews(list);
    setStats(ReviewService.getReviewsStats(itemId));
  };

  useEffect(() => {
    loadReviews();
  }, [itemId]);

  const displayedReviews = filterVerifiedOnly
    ? reviews.filter((r) => r.isVerifiedBooking)
    : reviews;

  return (
    <div className="space-y-6 pt-6 border-t border-stone-200 dark:border-stone-800">
      {/* Header & Stats Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <span>Verified Traveler Reviews</span>
            <span className="text-xs font-normal text-stone-500">
              ({stats.totalReviews} total)
            </span>
          </h3>
          <p className="text-xs text-stone-500">
            Real feedback from certified travelers and participants
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsWriteModalOpen(true)}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          className="text-xs self-start sm:self-auto"
        >
          Write a Review
        </Button>
      </div>

      {/* Ratings Aggregate Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center gap-6">
        {/* Big number */}
        <div className="text-center sm:border-r sm:border-stone-200 sm:dark:border-stone-700 sm:pr-8">
          <div className="text-4xl font-black text-stone-900 dark:text-stone-100">
            {stats.averageRating > 0 ? stats.averageRating : '—'}
          </div>
          <div className="flex items-center justify-center gap-1 my-1 text-amber-400">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-4 h-4 ${
                  s <= Math.round(stats.averageRating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-stone-300 dark:text-stone-700'
                }`}
              />
            ))}
          </div>
          <div className="text-[11px] text-stone-500">
            Based on {stats.totalReviews} reviews
          </div>
        </div>

        {/* 5-Star Distribution Bars */}
        <div className="flex-1 w-full space-y-1.5 text-[11px]">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = stats.distribution[star] || 0;
            const pct = stats.totalReviews > 0 ? Math.round((count / stats.totalReviews) * 100) : 0;
            return (
              <div key={star} className="flex items-center gap-2">
                <span className="w-7 text-right text-stone-500 font-mono">{star} ★</span>
                <div className="flex-1 h-2 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-8 text-stone-400 font-mono text-[10px]">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-xs text-stone-600 dark:text-stone-400 cursor-pointer">
          <input
            type="checkbox"
            checked={filterVerifiedOnly}
            onChange={(e) => setFilterVerifiedOnly(e.target.checked)}
            className="rounded border-stone-300 text-[#D9531E] focus:ring-[#D9531E]"
          />
          <span>Show verified booking reviews only</span>
        </label>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {displayedReviews.length === 0 ? (
          <div className="text-center py-8 p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/30 border border-dashed border-stone-200 dark:border-stone-800 text-xs text-stone-500 space-y-2">
            <MessageSquare className="w-8 h-8 mx-auto text-stone-400" />
            <p className="font-semibold text-stone-700 dark:text-stone-300">No reviews yet</p>
            <p>Be the first traveler to share your authentic experience!</p>
          </div>
        ) : (
          displayedReviews.map((rev) => (
            <div
              key={rev.id}
              className="p-4 rounded-2xl bg-stone-50/70 dark:bg-stone-800/30 border border-stone-200 dark:border-stone-800 space-y-3 transition-colors"
            >
              {/* User Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-stone-200 dark:bg-stone-700 flex items-center justify-center font-bold text-xs text-stone-600 dark:text-stone-300">
                    {rev.userName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                        {rev.userName}
                      </span>
                      {rev.isVerifiedBooking && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Verified Booking</span>
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-stone-400">
                      {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <div className="flex items-center text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= rev.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-stone-300 dark:text-stone-700'
                        }`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => setReportingReview(rev)}
                    title="Report inappropriate review"
                    className="p-1 rounded-md text-stone-400 hover:text-red-500 hover:bg-stone-200 dark:hover:bg-stone-700 ml-2 transition-colors"
                  >
                    <Flag className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Review Title & Body */}
              <div className="space-y-1 text-xs">
                <h4 className="font-bold text-stone-900 dark:text-stone-100">
                  {rev.title}
                </h4>
                <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
                  {rev.comment}
                </p>
              </div>

              {/* Tags */}
              {rev.tags && rev.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {rev.tags.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded-full bg-stone-200/60 dark:bg-stone-700/60 text-[10px] text-stone-600 dark:text-stone-300"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}

              {/* Provider Response if any */}
              {rev.providerResponse && (
                <div className="p-3 rounded-xl bg-stone-100 dark:bg-stone-800/80 border-l-2 border-[#D9531E] space-y-1 text-xs mt-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-stone-800 dark:text-stone-200">
                    <span className="flex items-center gap-1 text-[#D9531E]">
                      <MessageSquare className="w-3 h-3" />
                      <span>Response from {rev.providerResponse.providerName}</span>
                    </span>
                    <span className="text-[10px] font-normal text-stone-400">
                      {new Date(rev.providerResponse.respondedAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                  <p className="text-stone-600 dark:text-stone-300 italic text-[11px]">
                    "{rev.providerResponse.text}"
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Write Review Modal */}
      <WriteReviewModal
        isOpen={isWriteModalOpen}
        onClose={() => setIsWriteModalOpen(false)}
        itemId={itemId}
        itemTitle={itemTitle}
        itemType={itemType}
        onReviewSubmitted={() => loadReviews()}
      />

      {/* Report Modal */}
      {reportingReview && (
        <ReportModal
          isOpen={Boolean(reportingReview)}
          onClose={() => setReportingReview(null)}
          targetType="review"
          targetId={reportingReview.id}
          targetTitle={`Review by ${reportingReview.userName} on "${reportingReview.itemTitle}"`}
        />
      )}
    </div>
  );
};
