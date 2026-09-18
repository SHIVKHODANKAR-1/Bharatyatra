import React, { useState, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  Compass,
  MapPin,
  Clock,
  Wallet,
  Calendar,
  ShieldCheck,
  Heart,
  Share2,
  ArrowRight,
  Star,
  Check,
  Sparkles,
  Info,
  ChevronDown,
  Layers,
} from 'lucide-react';
import { Destination, UnifiedSearchItem } from '../../types/travel';
import { Badge } from '../common/Badge';
import { DataClassification } from '../../types/index';
import { DESTINATION_DETAILS_MAP } from '../../data/destinationsDetailsData';

interface DestinationListingViewProps {
  destinations: Destination[];
  onSelectDestination: (dest: Destination) => void;
  savedItemIds: Set<string>;
  onToggleSave: (id: string) => void;
  onAddToTrip: (destination: Destination) => void;
}

const DESTINATION_TYPES = [
  'All Types',
  'Spiritual',
  'Heritage',
  'Nature',
  'Himalayan Valley',
  'Wildlife',
  'Beach & Coastal',
];

const REGIONS = ['All Regions', 'North', 'South', 'East', 'West', 'Central', 'North-East'];

export const DestinationListingView: React.FC<DestinationListingViewProps> = ({
  destinations,
  onSelectDestination,
  savedItemIds,
  onToggleSave,
  onAddToTrip,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All Types');
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const [selectedBudget, setSelectedBudget] = useState('All Budgets');
  const [sortBy, setSortBy] = useState<'match' | 'rating' | 'duration'>('match');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showShareToast, setShowShareToast] = useState(false);

  const handleShare = (e: React.MouseEvent, dest: Destination) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/#destination-${dest.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedId(dest.id);
      setShowShareToast(true);
      setTimeout(() => {
        setCopiedId(null);
        setShowShareToast(false);
      }, 2500);
    }
  };

  // Filter & sort
  const filteredDestinations = useMemo(() => {
    return destinations
      .map((dest) => {
        const ext = DESTINATION_DETAILS_MAP[dest.id];
        const destType =
          dest.destinationType ||
          ext?.destinationType ||
          (dest.category === 'spiritual'
            ? 'Spiritual'
            : dest.category === 'nature'
            ? 'Nature'
            : 'Heritage');
        const matchScore = dest.matchScore || (dest.category === 'spiritual' ? 94 : 89);
        const matchExplanation =
          dest.matchExplanation ||
          ext?.matchExplanation ||
          `${matchScore}% Match — suitable for your heritage interest & weekend budget.`;

        return {
          ...dest,
          destinationType: destType,
          matchScore,
          matchExplanation,
          galleryImages: ext?.galleryImages || [dest.imageUrl],
        };
      })
      .filter((dest) => {
        if (selectedType !== 'All Types' && dest.destinationType !== selectedType) return false;
        if (selectedRegion !== 'All Regions' && dest.region !== selectedRegion) return false;
        if (selectedBudget !== 'All Budgets' && dest.estimatedBudget !== selectedBudget) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = dest.name.toLowerCase().includes(q);
          const matchCity = dest.location.city.toLowerCase().includes(q);
          const matchState = dest.location.state.toLowerCase().includes(q);
          const matchTag = dest.tagline.toLowerCase().includes(q);
          if (!matchName && !matchCity && !matchState && !matchTag) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'match') {
          return (b.matchScore || 0) - (a.matchScore || 0);
        }
        if (sortBy === 'rating') {
          return (b.ratingsSummary?.average || 0) - (a.ratingsSummary?.average || 0);
        }
        if (sortBy === 'duration') {
          return a.idealDurationDays - b.idealDurationDays;
        }
        return 0;
      });
  }, [destinations, selectedType, selectedRegion, selectedBudget, searchQuery, sortBy]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {showShareToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-sm border border-stone-700 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Destination link copied to clipboard!</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-900/10 via-orange-900/5 to-transparent dark:from-amber-950/30 p-6 rounded-3xl border border-amber-200/60 dark:border-amber-900/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#D9531E]/10 text-[#D9531E] dark:bg-[#D9531E]/20">
                Part 2B Discovery
              </span>
              <span className="text-xs text-stone-500 dark:text-stone-400">
                {filteredDestinations.length} verified destinations
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              Explore Destinations of Bharat
            </h1>
            <p className="text-sm text-stone-600 dark:text-stone-400 mt-1 max-w-2xl">
              Authentic Indian destinations curated with verified state tourism sources, transparent
              match explanations, and local travel economics.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search destination, city, or state..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#D9531E]/40"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="mt-5 pt-4 border-t border-stone-200/60 dark:border-stone-800/60 flex flex-wrap items-center gap-2">
          {DESTINATION_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                selectedType === type
                  ? 'bg-[#D9531E] text-white shadow-sm'
                  : 'bg-white/80 dark:bg-stone-800/80 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700'
              }`}
            >
              {type}
            </button>
          ))}

          {/* Sort selector */}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-stone-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              aria-label="Sort destinations by"
              className="px-2.5 py-1.5 rounded-xl text-xs font-medium bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 focus:outline-none"
            >
              <option value="match">Match Percentage</option>
              <option value="rating">Verified Rating</option>
              <option value="duration">Suggested Duration</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Destination Cards */}
      {filteredDestinations.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800">
          <Info className="w-10 h-10 text-stone-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-stone-800 dark:text-stone-200">No destinations found</h3>
          <p className="text-sm text-stone-500 mt-1">Try relaxing your search query or category filters.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedType('All Types');
              setSelectedRegion('All Regions');
              setSelectedBudget('All Budgets');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-[#D9531E] text-white text-xs font-semibold hover:bg-[#c24617] transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDestinations.map((dest) => {
            const isSaved = savedItemIds.has(dest.id);
            return (
              <div
                key={dest.id}
                onClick={() => onSelectDestination(dest)}
                className="group relative bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col cursor-pointer"
              >
                {/* Cover Image */}
                <div className="relative aspect-16/10 w-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                  <img
                    src={dest.imageUrl}
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
                    <Badge classification={dest.dataClassification} />

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => handleShare(e, dest)}
                        className="p-2 rounded-full bg-stone-900/60 hover:bg-stone-900/90 text-white backdrop-blur-md transition-colors"
                        title="Share destination"
                      >
                        {copiedId === dest.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Share2 className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleSave(dest.id);
                        }}
                        className={`p-2 rounded-full backdrop-blur-md transition-colors ${
                          isSaved
                            ? 'bg-red-500 text-white'
                            : 'bg-stone-900/60 text-white hover:bg-stone-900/90'
                        }`}
                        title={isSaved ? 'Remove from saved' : 'Save destination'}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Destination Type & Title on Image */}
                  <div className="absolute bottom-3 inset-x-3 text-white">
                    <span className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-md bg-stone-900/70 backdrop-blur-sm mb-1 text-amber-300">
                      {dest.destinationType}
                    </span>
                    <h2 className="text-lg font-bold leading-snug line-clamp-1">{dest.name}</h2>
                    <p className="text-xs text-stone-300 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-[#D9531E]" />
                      <span>
                        {dest.location.city}, {dest.location.state}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  {/* Match Percentage & Documented Explanation */}
                  <div className="p-2.5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-300/40 dark:border-amber-800/40 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        {dest.matchScore}% Match
                      </span>
                      <span className="text-[10px] text-stone-500 font-medium">Scoring Model v2.1</span>
                    </div>
                    <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed line-clamp-2">
                      {dest.matchExplanation}
                    </p>
                  </div>

                  {/* Metadata Chips: Budget, Duration, Season */}
                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-stone-100 dark:border-stone-800 text-[11px]">
                    <div className="flex flex-col">
                      <span className="text-stone-400 text-[10px]">Budget</span>
                      <span className="font-semibold text-stone-800 dark:text-stone-200 capitalize">
                        {dest.estimatedBudget}
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-stone-400 text-[10px]">Duration</span>
                      <span className="font-semibold text-stone-800 dark:text-stone-200">
                        {dest.idealDurationDays} Days
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-stone-400 text-[10px]">Best Season</span>
                      <span className="font-semibold text-stone-800 dark:text-stone-200 truncate">
                        {dest.peakSeasonMonths.slice(0, 2).join(', ')}
                      </span>
                    </div>
                  </div>

                  {/* Verified Rating & Distance */}
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-stone-100 dark:border-stone-800">
                    <div className="flex items-center gap-1.5">
                      {dest.ratingsSummary?.average ? (
                        <>
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span className="font-bold text-stone-800 dark:text-stone-200">
                            {dest.ratingsSummary.average.toFixed(1)}
                          </span>
                          <span className="text-[10px] text-stone-400">
                            ({dest.ratingsSummary.count.toLocaleString()} verified)
                          </span>
                        </>
                      ) : (
                        <span className="text-[10px] text-stone-400 italic">Unrated</span>
                      )}
                    </div>

                    {(dest as any).distanceKm !== undefined && (
                      <span className="text-[11px] text-stone-500 font-medium">
                        {Math.round((dest as any).distanceKm)} km away
                      </span>
                    )}
                  </div>

                  {/* Explore & Plan Actions */}
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectDestination(dest);
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-[#D9531E] hover:text-white dark:hover:bg-[#D9531E] text-stone-800 dark:text-stone-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Explore Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToTrip(dest);
                      }}
                      className="py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-700 hover:text-white dark:bg-amber-500/20 dark:text-amber-300 text-xs font-semibold transition-colors"
                      title="Plan a trip to this destination"
                    >
                      Plan Trip
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
