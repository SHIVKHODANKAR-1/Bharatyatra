import React, { useState } from 'react';
import {
  MapPin,
  Clock,
  Coins,
  ShieldCheck,
  Star,
  Bookmark,
  Share2,
  Check,
  Eye,
  Sparkles,
  Accessibility,
  Compass,
  CalendarPlus,
} from 'lucide-react';
import { UnifiedSearchItem } from '../../types/travel';
import { DataClassification } from '../../types/index';
import { formatDistanceString } from '../../services/geoService';

interface SearchResultCardProps {
  item: UnifiedSearchItem;
  userCity?: string;
  isSaved?: boolean;
  onToggleSave?: (item: UnifiedSearchItem) => void;
  onViewDetails?: (item: UnifiedSearchItem) => void;
  onAddToItinerary?: (item: UnifiedSearchItem) => void;
  viewMode?: 'grid' | 'list';
}

export const SearchResultCard: React.FC<SearchResultCardProps> = ({
  item,
  userCity = 'Nagpur',
  isSaved = false,
  onToggleSave,
  onViewDetails,
  onAddToItinerary,
  viewMode = 'grid',
}) => {
  const [copiedShare, setCopiedShare] = useState(false);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareText = `Explore ${item.name} (${item.location.city}, ${item.location.state}) on Bharat Yatra: ${window.location.origin}/?search=${encodeURIComponent(item.name)}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2200);
    }
  };

  const isVerified = item.dataClassification === DataClassification.VERIFIED;
  const matchScore = item.matchScore || Math.min(99, Math.round(75 + (item.rating || 4.5) * 4));

  if (viewMode === 'list') {
    return (
      <div
        onClick={() => onViewDetails && onViewDetails(item)}
        className="group relative bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 shadow-xs hover:shadow-md transition-all p-3 flex flex-col sm:flex-row gap-4 cursor-pointer"
      >
        {/* Image Container */}
        <div className="relative sm:w-52 h-44 sm:h-auto rounded-xl overflow-hidden shrink-0 bg-stone-100 dark:bg-stone-800">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            <span className="px-2 py-0.5 rounded-md bg-stone-900/80 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider">
              {item.type}
            </span>
            {item.isHiddenGem && (
              <span className="px-2 py-0.5 rounded-md bg-amber-500/90 text-stone-900 text-[10px] font-bold shadow-xs">
                💎 Hidden Gem
              </span>
            )}
          </div>
          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-white/90 dark:bg-stone-900/90 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 shadow-xs">
            <Sparkles className="w-3 h-3" />
            <span>{matchScore}% Match</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-start justify-between gap-2 mb-1">
              <div>
                <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 group-hover:text-[#D9531E] transition-colors line-clamp-1">
                  {item.name}
                </h3>
                <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-[#D9531E] shrink-0" />
                  <span>{item.location.city}, {item.location.state}</span>
                  {item.distanceKm !== undefined && (
                    <span className="text-stone-400 font-medium">
                      • {formatDistanceString(item.distanceKm, userCity)}
                    </span>
                  )}
                </p>
              </div>

              {/* Verified Badge */}
              {isVerified && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold shrink-0 border border-emerald-200 dark:border-emerald-800">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Verified</span>
                </span>
              )}
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-300 line-clamp-2 my-2 leading-relaxed">
              {item.description}
            </p>

            {/* Badges / Metrics */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-stone-600 dark:text-stone-400">
              {item.approxPriceInr !== undefined && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 font-medium text-[11px]">
                  <Coins className="w-3 h-3 text-emerald-600" />
                  <span>{item.approxPriceInr === 0 ? 'Free' : `₹${item.approxPriceInr.toLocaleString('en-IN')}`}</span>
                </span>
              )}
              {item.suggestedDuration && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 font-medium text-[11px]">
                  <Clock className="w-3 h-3 text-blue-500" />
                  <span>{item.suggestedDuration}</span>
                </span>
              )}
              {item.rating && (
                <span className="flex items-center gap-1 font-bold text-stone-800 dark:text-stone-200 text-xs">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>{item.rating.toFixed(1)}</span>
                  {item.ratingCount && (
                    <span className="text-stone-400 text-[10px] font-normal">({item.ratingCount})</span>
                  )}
                </span>
              )}
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-3 mt-2 border-t border-stone-100 dark:border-stone-800/80">
            <div className="text-[11px] text-stone-400">
              {item.accessibilityVerified ? (
                <span className="text-purple-600 dark:text-purple-400 flex items-center gap-1">
                  <Accessibility className="w-3 h-3" />
                  <span>Accessible</span>
                </span>
              ) : (
                <span className="text-stone-400 italic">Accessibility not verified</span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleShare}
                className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-700 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-50 transition-colors"
                title="Share link"
              >
                {copiedShare ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onToggleSave) onToggleSave(item);
                }}
                className={`p-1.5 rounded-lg border transition-colors ${
                  isSaved
                    ? 'border-[#D9531E] bg-[#D9531E]/10 text-[#D9531E]'
                    : 'border-stone-200 dark:border-stone-700 text-stone-500 hover:bg-stone-50'
                }`}
                title={isSaved ? 'Saved to collection' : 'Save place'}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-[#D9531E]' : ''}`} />
              </button>

              {onAddToItinerary && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToItinerary(item);
                  }}
                  className="px-2.5 py-1.5 rounded-lg border border-[#D9531E]/40 text-[#D9531E] hover:bg-[#D9531E]/10 text-xs font-semibold flex items-center gap-1 transition-all"
                  title="Add to Itinerary"
                >
                  <CalendarPlus className="w-3.5 h-3.5" />
                  <span>Add to Trip</span>
                </button>
              )}

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onViewDetails) onViewDetails(item);
                }}
                className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-semibold flex items-center gap-1 transition-all"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid View Mode
  return (
    <div
      onClick={() => onViewDetails && onViewDetails(item)}
      className="group bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 shadow-xs hover:shadow-lg transition-all overflow-hidden flex flex-col justify-between cursor-pointer"
    >
      <div>
        {/* Card Image Header */}
        <div className="relative h-48 w-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />

          {/* Badges Overlay */}
          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
            <span className="px-2.5 py-0.5 rounded-md bg-stone-900/80 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider">
              {item.type}
            </span>
            {item.isHiddenGem && (
              <span className="px-2 py-0.5 rounded-md bg-amber-500 text-stone-900 text-[10px] font-bold shadow-xs">
                💎 Hidden Gem
              </span>
            )}
          </div>

          <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
            <button
              type="button"
              onClick={handleShare}
              className="p-1.5 rounded-lg bg-white/90 dark:bg-stone-900/90 text-stone-700 dark:text-stone-200 hover:bg-white transition-colors shadow-xs"
              title="Share"
            >
              {copiedShare ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onToggleSave) onToggleSave(item);
              }}
              className={`p-1.5 rounded-lg backdrop-blur-xs shadow-xs transition-colors ${
                isSaved
                  ? 'bg-[#D9531E] text-white'
                  : 'bg-white/90 dark:bg-stone-900/90 text-stone-700 dark:text-stone-200 hover:bg-white'
              }`}
              title={isSaved ? 'Saved' : 'Save'}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-white' : ''}`} />
            </button>
          </div>

          {/* Match Score */}
          <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md bg-stone-900/80 backdrop-blur-xs text-[10px] font-bold text-emerald-400 flex items-center gap-1 shadow-xs">
            <Sparkles className="w-3 h-3" />
            <span>{matchScore}% Match</span>
          </div>

          {/* Distance */}
          {item.distanceKm !== undefined && (
            <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-white/90 dark:bg-stone-900/90 text-[10px] font-semibold text-stone-700 dark:text-stone-300 shadow-xs">
              {formatDistanceString(item.distanceKm, userCity)}
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-1">
            <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 group-hover:text-[#D9531E] transition-colors line-clamp-1">
              {item.name}
            </h3>
            {isVerified && (
              <span title="Verified Authority Data" className="inline-flex items-center shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </span>
            )}
          </div>

          <p className="text-xs text-stone-500 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#D9531E] shrink-0" />
            <span className="truncate">{item.location.city}, {item.location.state}</span>
          </p>

          <p className="text-xs text-stone-600 dark:text-stone-300 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-4 pb-4 pt-2 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {item.rating && (
            <span className="flex items-center gap-1 font-bold text-stone-800 dark:text-stone-200">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{item.rating.toFixed(1)}</span>
            </span>
          )}
          {item.approxPriceInr !== undefined && (
            <span className="text-[11px] font-semibold text-emerald-600">
              {item.approxPriceInr === 0 ? 'Free' : `₹${item.approxPriceInr.toLocaleString('en-IN')}`}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {onAddToItinerary && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAddToItinerary(item);
              }}
              className="p-1.5 rounded-lg border border-[#D9531E]/40 text-[#D9531E] hover:bg-[#D9531E]/10 transition-colors"
              title="Add to Itinerary"
            >
              <CalendarPlus className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onViewDetails) onViewDetails(item);
            }}
            className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-[#D9531E] hover:text-white dark:hover:bg-[#D9531E] text-stone-700 dark:text-stone-300 font-semibold text-xs flex items-center gap-1 transition-colors"
          >
            <Eye className="w-3 h-3" />
            <span>Details</span>
          </button>
        </div>
      </div>
    </div>
  );
};
