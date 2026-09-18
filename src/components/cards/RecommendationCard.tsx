import React, { useState } from 'react';
import {
  Sparkles,
  Heart,
  MapPin,
  Info,
  ArrowRight,
  MoreHorizontal,
  ShieldCheck,
  Share2,
  Check,
  Eye,
  CalendarPlus,
} from 'lucide-react';
import { RecommendationItem } from '../../types/travel';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { useI18n } from '../../i18n/index';

interface RecommendationCardProps {
  item: RecommendationItem;
  onSave: (id: string) => void;
  onNotInterested: (id: string) => void;
  onExplain: (item: RecommendationItem) => void;
  onSelect: (item: RecommendationItem) => void;
  onPlanTrip: (item: RecommendationItem) => void;
  onOpenFeedbackModal?: (item: RecommendationItem) => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  item,
  onSave,
  onNotInterested,
  onExplain,
  onSelect,
  onPlanTrip,
  onOpenFeedbackModal,
}) => {
  const { t } = useI18n();
  const [imgSrc, setImgSrc] = useState(item.imageUrl);
  const [, setImgError] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const handleImageError = () => {
    setImgError(true);
    setImgSrc(
      'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80'
    );
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareText = `Discover ${item.title} (${item.location.city}, ${item.location.state}) on Bharat Yatra!`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  const verificationStatus =
    (item as any).verificationStatus || item.source?.verifiedBy ? 'Verified' : 'Estimated';

  // Derive Reason Chips
  const reasonChips: string[] = [];
  if (item.explanation?.matchedInterests && item.explanation.matchedInterests.length > 0) {
    reasonChips.push(`Matches ${item.explanation.matchedInterests[0]}`);
  }
  if (item.explanation?.matchedBudget) {
    reasonChips.push(`Fits ${item.estimatedBudget} budget`);
  }
  if (item.distanceKm && item.distanceKm <= 350) {
    reasonChips.push(`Nearby (${Math.round(item.distanceKm)} km)`);
  }

  return (
    <div className="group relative bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col overflow-hidden w-full">
      {/* Image Container */}
      <div className="relative aspect-16/10 w-full overflow-hidden bg-stone-100 dark:bg-stone-800 shrink-0">
        <img
          src={imgSrc}
          alt={item.title}
          onError={handleImageError}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          referrerPolicy="no-referrer"
        />

        {/* Gradient Overlay for Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/75 via-transparent to-black/25 pointer-events-none" />

        {/* Top Badges & Actions Overlay */}
        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between gap-1.5 pointer-events-auto z-10">
          <div className="shrink-0 max-w-[55%]">
            <Badge classification={item.dataClassification} />
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleShare}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full backdrop-blur-md bg-white/85 dark:bg-stone-900/85 text-stone-700 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-900 flex items-center justify-center transition-all shadow-xs shrink-0"
              title="Share recommendation"
              aria-label="Share recommendation"
            >
              {copiedShare ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </button>

            {onOpenFeedbackModal && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenFeedbackModal(item);
                }}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full backdrop-blur-md bg-white/85 dark:bg-stone-900/85 text-stone-700 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-900 flex items-center justify-center transition-all shadow-xs shrink-0"
                title="Refine this recommendation"
                aria-label="Refine recommendation options"
              >
                <MoreHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSave(item.id);
              }}
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full backdrop-blur-md flex items-center justify-center transition-all shrink-0 ${
                item.isSaved
                  ? 'bg-red-500 text-white shadow-md scale-105'
                  : 'bg-white/85 dark:bg-stone-900/85 text-stone-700 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-900'
              }`}
              aria-label={item.isSaved ? 'Remove from saved' : 'Save place'}
            >
              <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${item.isSaved ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Bottom Image Badges */}
        <div className="absolute bottom-2.5 inset-x-2.5 flex items-center justify-between gap-1.5 pointer-events-auto z-10">
          {item.matchScore ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-950/85 backdrop-blur-md text-white text-xs font-black shadow-md border border-white/10 shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-[#D9531E] shrink-0" />
              <span>{item.matchScore}% Match</span>
            </div>
          ) : <div />}

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-900/75 backdrop-blur-md text-white/90 text-[11px] font-medium border border-white/10 shrink-0">
            <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
            <span>{verificationStatus}</span>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          {/* Location & Category Header */}
          <div className="flex items-center justify-between gap-2 text-xs text-stone-500 dark:text-stone-400">
            <span className="flex items-center gap-1 font-medium truncate min-w-0">
              <MapPin className="w-3.5 h-3.5 text-[#D9531E] shrink-0" />
              <span className="truncate">
                {item.location.city}, {item.location.state}
              </span>
            </span>
            <span className="capitalize font-semibold text-stone-600 dark:text-stone-300 px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 shrink-0 whitespace-nowrap">
              {item.category}
            </span>
          </div>

          {/* Title and Subtitle */}
          <div>
            <h3
              onClick={() => onSelect(item)}
              className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 group-hover:text-[#D9531E] transition-colors cursor-pointer leading-snug line-clamp-1 break-words"
            >
              {item.title}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 mt-1 leading-relaxed break-words">
              {item.subtitle}
            </p>
          </div>

          {/* Reason Chips */}
          {reasonChips.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-0.5">
              {reasonChips.map((chip, idx) => (
                <span
                  key={idx}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-[#D9531E]/10 text-[#D9531E] font-medium border border-[#D9531E]/20 truncate max-w-full"
                >
                  🎯 {chip}
                </span>
              ))}
            </div>
          )}

          {/* Key Attributes Tags */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium capitalize whitespace-nowrap">
              💰 {item.estimatedBudget}
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium whitespace-nowrap">
              ⏱️ {item.idealDuration}
            </span>
            {item.type === 'hidden_gem' && (
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 font-semibold whitespace-nowrap">
                ✨ Hidden Gem
              </span>
            )}
          </div>
        </div>

        {/* Explainability Trigger & Bottom Actions */}
        <div className="pt-2 border-t border-stone-100 dark:border-stone-800 space-y-2.5">
          <button
            type="button"
            onClick={() => onExplain(item)}
            className="w-full flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 hover:text-[#D9531E] transition-colors py-0.5 group/btn"
          >
            <span className="flex items-center gap-1.5 font-medium truncate">
              <Info className="w-3.5 h-3.5 text-[#D9531E] shrink-0" />
              <span className="truncate">{t.recommendations.whyRecommended}</span>
            </span>
            <span className="text-[#D9531E] text-xs font-semibold group-hover/btn:underline shrink-0 ml-1">
              Why this match? &rarr;
            </span>
          </button>

          {/* Action Buttons: View Details and Add to Itinerary */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSelect(item)}
              className="text-xs w-full min-h-[36px] justify-center px-2 truncate"
              leftIcon={<Eye className="w-3.5 h-3.5 shrink-0" />}
            >
              <span className="truncate">View Details</span>
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => onPlanTrip(item)}
              className="text-xs w-full min-h-[36px] justify-center px-2 truncate"
              leftIcon={<CalendarPlus className="w-3.5 h-3.5 shrink-0" />}
            >
              <span className="truncate">Add to Plan</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

