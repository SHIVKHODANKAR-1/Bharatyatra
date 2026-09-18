import React, { useState, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  Compass,
  MapPin,
  Clock,
  Wallet,
  ShieldCheck,
  Heart,
  Share2,
  ArrowRight,
  Sparkles,
  Info,
  Check,
  Star,
  Activity,
  Flame,
  Calendar,
  Filter,
} from 'lucide-react';
import { Experience } from '../../types/travel';
import { Badge } from '../common/Badge';

interface ExperienceDiscoveryViewProps {
  experiences: Experience[];
  onSelectExperience: (exp: Experience) => void;
  savedItemIds: Set<string>;
  onToggleSave: (id: string) => void;
}

export const EXPERIENCE_CATEGORIES = [
  'All Experiences',
  'Sightseeing',
  'Trekking',
  'Heritage walks',
  'Workshops',
  'Cooking classes',
  'River rafting',
  'Wildlife safaris',
  'Spiritual rituals',
  'Cultural shows',
  'Photography tours',
  'Village walks',
  'Yoga and wellness',
  'Bicycle tours',
  'Desert camping',
  'Backwater cruises',
  'Extreme sports',
  'Night trails',
  'Handicraft immersion',
];

export const ExperienceDiscoveryView: React.FC<ExperienceDiscoveryViewProps> = ({
  experiences,
  onSelectExperience,
  savedItemIds,
  onToggleSave,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Experiences');
  const [selectedIntensity, setSelectedIntensity] = useState<string>('All');
  const [selectedBudget, setSelectedBudget] = useState<string>('All');
  const [maxDurationHours, setMaxDurationHours] = useState<number>(24);
  const [selectedSeason, setSelectedSeason] = useState<string>('All Seasons');
  const [sortBy, setSortBy] = useState<'match' | 'priceAsc' | 'priceDesc' | 'duration'>('match');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleShare = (e: React.MouseEvent, exp: Experience) => {
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/#experience-${exp.id}`);
      setCopiedId(exp.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const filteredExperiences = useMemo(() => {
    return experiences
      .filter((exp) => {
        // Category
        if (selectedCategory !== 'All Experiences') {
          const cat = (exp.experienceType || exp.category || '').toLowerCase();
          const target = selectedCategory.toLowerCase();
          if (!cat.includes(target) && !target.includes(cat)) {
            // Also check title or description
            if (
              !exp.title.toLowerCase().includes(target) &&
              !exp.description.toLowerCase().includes(target)
            ) {
              return false;
            }
          }
        }

        // Intensity
        if (selectedIntensity !== 'All') {
          if (exp.intensity !== selectedIntensity) return false;
        }

        // Budget tier
        if (selectedBudget !== 'All') {
          if (selectedBudget === 'Free' && exp.approxPriceInr > 0) return false;
          if (selectedBudget === 'Under 1000' && exp.approxPriceInr > 1000) return false;
          if (selectedBudget === '1000-3000' && (exp.approxPriceInr < 1000 || exp.approxPriceInr > 3000))
            return false;
          if (selectedBudget === 'Above 3000' && exp.approxPriceInr <= 3000) return false;
        }

        // Duration filter (durationMinutes / 60)
        const hours = exp.durationMinutes / 60;
        if (hours > maxDurationHours) return false;

        // Search text
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = exp.title.toLowerCase().includes(q);
          const matchDest = exp.destinationName.toLowerCase().includes(q);
          const matchCity = exp.location.city.toLowerCase().includes(q);
          const matchDesc = exp.description.toLowerCase().includes(q);
          if (!matchTitle && !matchDest && !matchCity && !matchDesc) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'match') return (b.matchScore || 0) - (a.matchScore || 0);
        if (sortBy === 'priceAsc') return a.approxPriceInr - b.approxPriceInr;
        if (sortBy === 'priceDesc') return b.approxPriceInr - a.approxPriceInr;
        if (sortBy === 'duration') return a.durationMinutes - b.durationMinutes;
        return 0;
      });
  }, [
    experiences,
    selectedCategory,
    selectedIntensity,
    selectedBudget,
    maxDurationHours,
    searchQuery,
    sortBy,
  ]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Search */}
      <div className="bg-gradient-to-r from-indigo-950/20 via-orange-950/10 to-transparent p-6 rounded-3xl border border-stone-200 dark:border-stone-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                Part 2B Experiences
              </span>
              <span className="text-xs text-stone-500">
                {filteredExperiences.length} curated activities & journeys
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              Immersive Experiences of Bharat
            </h1>
            <p className="text-sm text-stone-600 dark:text-stone-400 mt-1 max-w-2xl">
              From Vedic sunrise chants in Kashi to Living Root bridge treks in Meghalaya. Filter by
              activity type, intensity, and verified operator status.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search experiences or destination..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>
        </div>

        {/* Categories Bar */}
        <div className="mt-5 pt-4 border-t border-stone-200/60 dark:border-stone-800/60 flex items-center gap-2 overflow-x-auto pb-2">
          {EXPERIENCE_CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white/80 dark:bg-stone-800/80 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Secondary Filters: Intensity, Budget, Duration, Sort */}
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
          {/* Intensity Tabs */}
          <div className="flex items-center gap-1 bg-white dark:bg-stone-900 p-1 rounded-xl border border-stone-200 dark:border-stone-800">
            <span className="text-[11px] text-stone-400 px-2 font-medium">Intensity:</span>
            {['All', 'Easy', 'Moderate', 'Challenging'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedIntensity(lvl)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                  selectedIntensity === lvl
                    ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          {/* Budget filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-stone-500">Budget:</span>
            <select
              value={selectedBudget}
              onChange={(e) => setSelectedBudget(e.target.value)}
              aria-label="Filter experiences by budget"
              className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 focus:outline-none"
            >
              <option value="All">All Budgets</option>
              <option value="Free">Free / Low Cost</option>
              <option value="Under 1000">Under ₹1,000</option>
              <option value="1000-3000">₹1,000 – ₹3,000</option>
              <option value="Above 3000">Above ₹3,000</option>
            </select>
          </div>

          {/* Duration Max Slider */}
          <div className="flex items-center gap-2 bg-white dark:bg-stone-900 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-800">
            <Clock className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-stone-600 dark:text-stone-400">Max Duration:</span>
            <span className="font-bold text-stone-800 dark:text-stone-200">
              {maxDurationHours >= 24 ? 'Any' : `${maxDurationHours}h`}
            </span>
            <input
              type="range"
              min={1}
              max={24}
              value={maxDurationHours}
              onChange={(e) => setMaxDurationHours(Number(e.target.value))}
              aria-label="Maximum duration in hours"
              className="w-20 accent-indigo-600"
            />
          </div>

          {/* Sort selector */}
          <div className="ml-auto flex items-center gap-1.5">
            <span className="text-stone-500">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              aria-label="Sort experiences by"
              className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 focus:outline-none"
            >
              <option value="match">Match Score</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
              <option value="duration">Shortest Duration</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Experiences */}
      {filteredExperiences.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800">
          <Info className="w-10 h-10 text-stone-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-stone-800 dark:text-stone-200">No experiences found</h3>
          <p className="text-sm text-stone-500 mt-1">Try resetting the intensity, category, or duration filters.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All Experiences');
              setSelectedIntensity('All');
              setSelectedBudget('All');
              setMaxDurationHours(24);
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExperiences.map((exp) => {
            const isSaved = savedItemIds.has(exp.id);
            const durationHrs = Math.floor(exp.durationMinutes / 60);
            const durationMins = exp.durationMinutes % 60;
            const durationStr =
              durationHrs > 0
                ? `${durationHrs}h ${durationMins > 0 ? `${durationMins}m` : ''}`
                : `${durationMins}m`;

            return (
              <div
                key={exp.id}
                onClick={() => onSelectExperience(exp)}
                className="group relative bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col cursor-pointer"
              >
                {/* Image Cover */}
                <div className="relative aspect-16/10 w-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                  <img
                    src={exp.imageUrl}
                    alt={exp.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
                    <Badge classification={exp.dataClassification} />

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => handleShare(e, exp)}
                        className="p-2 rounded-full bg-stone-900/60 hover:bg-stone-900/90 text-white backdrop-blur-md transition-colors"
                        title="Share experience"
                      >
                        {copiedId === exp.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Share2 className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleSave(exp.id);
                        }}
                        className={`p-2 rounded-full backdrop-blur-md transition-colors ${
                          isSaved
                            ? 'bg-red-500 text-white'
                            : 'bg-stone-900/60 text-white hover:bg-stone-900/90'
                        }`}
                        title={isSaved ? 'Saved' : 'Save'}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Bottom Image Overlay Details */}
                  <div className="absolute bottom-3 inset-x-3 text-white">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-stone-900/70 text-indigo-300 backdrop-blur-sm">
                        {exp.experienceType || exp.category}
                      </span>
                      {exp.intensity && (
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md backdrop-blur-sm ${
                            exp.intensity === 'Easy'
                              ? 'bg-emerald-900/70 text-emerald-200'
                              : exp.intensity === 'Moderate'
                              ? 'bg-amber-900/70 text-amber-200'
                              : 'bg-red-900/70 text-red-200'
                          }`}
                        >
                          {exp.intensity} Intensity
                        </span>
                      )}
                    </div>
                    <h2 className="text-base font-bold leading-snug line-clamp-1">{exp.title}</h2>
                    <p className="text-xs text-stone-300 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-[#D9531E]" />
                      <span>
                        {exp.destinationName}, {exp.location.state}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <p className="text-xs text-stone-600 dark:text-stone-300 line-clamp-2 leading-relaxed">
                    {exp.description}
                  </p>

                  {/* Metadata Chips: Duration, Cost, Provider */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100 dark:border-stone-800 text-[11px]">
                    <div className="flex items-center gap-1.5 text-stone-600 dark:text-stone-300">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      <span>{durationStr}</span>
                    </div>

                    <div className="flex items-center gap-1.5 justify-end font-bold text-stone-900 dark:text-stone-100">
                      <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                      <span>
                        {exp.approxPriceInr === 0 ? 'Free' : `₹${exp.approxPriceInr.toLocaleString()}`}
                      </span>
                      <span className="text-[10px] text-stone-400 font-normal">/ person</span>
                    </div>
                  </div>

                  {/* Provider & Verified Source */}
                  <div className="flex items-center justify-between text-[11px] pt-1 text-stone-500">
                    <div className="flex items-center gap-1 truncate max-w-[200px]" title={exp.source.sourceName}>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="truncate">{exp.source.sourceName}</span>
                    </div>

                    {exp.matchScore && (
                      <span className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                        <Sparkles className="w-3 h-3" />
                        {exp.matchScore}% Match
                      </span>
                    )}
                  </div>

                  {/* Action Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectExperience(exp);
                    }}
                    className="w-full mt-2 py-2 px-3 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-stone-800 dark:text-stone-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>View Itinerary & Booking Info</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
