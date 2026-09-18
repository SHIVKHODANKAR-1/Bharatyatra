import React, { useState, useMemo } from 'react';
import {
  Compass,
  MapPin,
  Sparkles,
  SlidersHorizontal,
  Map as MapIcon,
  ArrowRight,
  Star,
  Clock,
  Coins,
  ShieldCheck,
  Heart,
  Users,
  ChevronRight,
  Zap,
  Feather,
  Utensils,
  Mountain,
  Waves,
  Landmark,
  Church,
  Camera,
  Crown,
  Search,
  Grid,
  Filter,
  Flame,
  Calendar,
  Layers,
  MapPin as MapPinIcon,
  Tag,
  CalendarDays,
} from 'lucide-react';
import {
  RecommendationItem,
  Destination,
  UnifiedSearchItem,
  ExploreFilters,
  Experience,
  FoodPlace,
  SeasonalEvent,
} from '../../types/travel';
import { useOnboarding } from '../../context/OnboardingContext';
import { useI18n } from '../../i18n/index';
import {
  CATEGORY_SHORTCUTS,
  MOOD_DISCOVERY_OPTIONS,
  DURATION_OPTIONS,
  BUDGET_OPTIONS,
  ExploreCategoryShortcut,
  MoodOption,
} from '../../data/exploreTaxonomy';
import { INITIAL_SEASONAL_EVENTS } from '../../data/events';
import { INITIAL_DESTINATIONS } from '../../data/destinations';
import { INITIAL_HIDDEN_GEMS } from '../../data/hiddenGems';
import { INITIAL_EXPERIENCES } from '../../data/experiences';
import { INITIAL_FOOD_PLACES } from '../../data/foodPlaces';
import { SearchResultsView } from '../search/SearchResultsView';
import { InteractiveMapDiscovery } from '../map/InteractiveMapDiscovery';
import { SearchResultCard } from '../search/SearchResultCard';
import { getAllUnifiedItems } from '../../services/searchExploreService';

import { DestinationListingView } from '../discovery/DestinationListingView';
import { DestinationDetailView } from '../discovery/DestinationDetailView';
import { ExperienceDiscoveryView } from '../discovery/ExperienceDiscoveryView';
import { ExperienceDetailModal } from '../discovery/ExperienceDetailModal';
import { FoodDiscoveryView } from '../discovery/FoodDiscoveryView';
import { FoodDetailModal } from '../discovery/FoodDetailModal';
import { EventDiscoveryView } from '../discovery/EventDiscoveryView';
import { EventDetailModal } from '../discovery/EventDetailModal';

interface ExploreViewProps {
  onSelectDestination: (dest: Destination) => void;
  onExplain: (item: RecommendationItem) => void;
  onPlanTrip: (item: RecommendationItem) => void;
  savedItemIds: Set<string>;
  onToggleSave: (id: string) => void;
}

export type ExploreMode =
  | 'curated'
  | 'destinations'
  | 'experiences'
  | 'food'
  | 'events'
  | 'search'
  | 'map';

export const ExploreView: React.FC<ExploreViewProps> = ({
  onSelectDestination,
  onExplain,
  onPlanTrip,
  savedItemIds,
  onToggleSave,
}) => {
  const { preferences } = useOnboarding();
  const { t } = useI18n();
  const userCity = preferences.selectedCity || 'Nagpur';

  // Primary Explore Navigation Mode
  const [activeMode, setActiveMode] = useState<ExploreMode>('curated');
  const [activeSearchQuery, setActiveSearchQuery] = useState('');
  const [appliedFilters, setAppliedFilters] = useState<Partial<ExploreFilters>>({});
  const [selectedMapItem, setSelectedMapItem] = useState<UnifiedSearchItem | null>(null);

  // Active Detail Modals for Part 2B
  const [detailDestination, setDetailDestination] = useState<Destination | null>(null);
  const [detailExperience, setDetailExperience] = useState<Experience | null>(null);
  const [detailFoodPlace, setDetailFoodPlace] = useState<FoodPlace | null>(null);
  const [detailEvent, setDetailEvent] = useState<SeasonalEvent | null>(null);

  // Load unified searchable items
  const allItems = useMemo(() => {
    return getAllUnifiedItems(userCity);
  }, [userCity]);

  // Section items
  const popularNearby = useMemo(() => {
    return allItems
      .filter((i) => (i.distanceKm ?? 9999) <= 450)
      .sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999))
      .slice(0, 4);
  }, [allItems]);

  const hiddenGems = useMemo(() => {
    return allItems.filter((i) => i.isHiddenGem).slice(0, 4);
  }, [allItems]);

  const foodHighlights = useMemo(() => {
    return allItems.filter((i) => i.type === 'food').slice(0, 4);
  }, [allItems]);

  const adventureActivities = useMemo(() => {
    return allItems.filter((i) => i.category === 'adventure' || i.category === 'mountains').slice(0, 4);
  }, [allItems]);

  const culturalExperiences = useMemo(() => {
    return allItems
      .filter((i) => i.type === 'experience' || i.category === 'heritage' || i.category === 'spiritual')
      .slice(0, 4);
  }, [allItems]);

  const weekendTrips = useMemo(() => {
    return allItems
      .filter((i) => (i.distanceKm ?? 9999) <= 300 || i.suggestedDuration?.includes('Weekend') || i.suggestedDuration?.includes('2'))
      .slice(0, 4);
  }, [allItems]);

  // Handler to jump to Search Results with pre-applied filter
  const handleSelectCategory = (cat: ExploreCategoryShortcut) => {
    setAppliedFilters({ categories: [cat.id] });
    setActiveSearchQuery('');
    setActiveMode('search');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectMood = (mood: MoodOption) => {
    setAppliedFilters({ categories: mood.relatedCategories });
    setActiveSearchQuery(mood.name);
    setActiveMode('search');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectDuration = (durationId: string) => {
    setAppliedFilters({ durations: [durationId] });
    setActiveMode('search');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectBudget = (budgetId: string) => {
    setAppliedFilters({ budgetBrackets: [budgetId] });
    setActiveMode('search');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewDetails = (item: UnifiedSearchItem) => {
    // If it's a destination or hidden gem, view its detail modal
    const dest =
      INITIAL_DESTINATIONS.find((d) => d.id === item.id) ||
      INITIAL_HIDDEN_GEMS.find((g) => g.id === item.id);
    if (dest) {
      onSelectDestination(dest);
    } else {
      // For attractions/food/stays, create synthetic destination structure for preview
      const syntheticDest: Destination = {
        id: item.id,
        slug: item.id,
        name: item.name,
        state: item.location.state,
        tagline: item.subtitle || item.name,
        description: item.description,
        imageUrl: item.imageUrl,
        thumbnailUrl: item.imageUrl,
        category: item.category as any,
        secondaryCategories: [],
        location: item.location,
        estimatedBudget: (item.estimatedBudget as any) || 'moderate',
        approxCostPerDayInr: item.approxPriceInr || 2000,
        idealDurationDays: item.durationMinutes ? Math.max(1, Math.round(item.durationMinutes / (24 * 60))) : 2,
        bestTimeToVisit: 'October to March',
        peakSeasonMonths: ['October', 'November', 'December', 'January', 'February', 'March'],
        region: 'Central',
        highlights: [item.subtitle || item.name, item.description],
        ratingsSummary: {
          average: item.rating || 4.8,
          count: item.ratingCount || 1000,
          source: item.source?.sourceName || 'Bharat Yatra Desk',
        },
        dataClassification: item.dataClassification,
        source: item.source || { sourceName: 'Bharat Yatra Official Desk', lastUpdated: '2026-08-01' },
      };
      onSelectDestination(syntheticDest);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 animate-fadeIn">
      {/* Top Header & Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#D9531E]/10 text-[#D9531E] font-bold text-xs flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>Exploring from {userCity}</span>
            </span>
            <span className="text-xs text-stone-400">• Real Haversine Distances</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
            Explore Incredible Bharat
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-2xl">
            Unifying 22 cultural verticals, 12 mood escapes, verified monuments, authentic culinary landmarks, and interactive geospatial discovery across India.
          </p>
        </div>

        {/* Mode Selector Pill */}
        <div className="flex items-center flex-wrap gap-1 bg-stone-100 dark:bg-stone-800 p-1.5 rounded-2xl border border-stone-200 dark:border-stone-700 self-start md:self-auto shrink-0 shadow-xs">
          <button
            type="button"
            onClick={() => setActiveMode('curated')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeMode === 'curated'
                ? 'bg-white dark:bg-stone-900 text-[#D9531E] shadow-2xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Curated Guides</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('destinations')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeMode === 'destinations'
                ? 'bg-white dark:bg-stone-900 text-[#D9531E] shadow-2xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            <Landmark className="w-3.5 h-3.5" />
            <span>Destinations</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('experiences')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeMode === 'experiences'
                ? 'bg-white dark:bg-stone-900 text-indigo-600 shadow-2xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Experiences</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('food')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeMode === 'food'
                ? 'bg-white dark:bg-stone-900 text-orange-600 shadow-2xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Food Trail</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('events')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeMode === 'events'
                ? 'bg-white dark:bg-stone-900 text-rose-600 shadow-2xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Fairs & Events</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('search')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeMode === 'search'
                ? 'bg-white dark:bg-stone-900 text-[#D9531E] shadow-2xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search & Filter</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('map')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeMode === 'map'
                ? 'bg-white dark:bg-stone-900 text-[#D9531E] shadow-2xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Map</span>
          </button>
        </div>
      </div>

      {/* MODE: DESTINATIONS LISTING (PART 2B) */}
      {activeMode === 'destinations' && (
        <DestinationListingView
          destinations={INITIAL_DESTINATIONS}
          onSelectDestination={(dest: Destination) => setDetailDestination(dest)}
          savedItemIds={savedItemIds}
          onToggleSave={onToggleSave}
          onAddToTrip={(dest: Destination) => {
            onPlanTrip({
              id: dest.id,
              type: 'destination',
              title: dest.name,
              subtitle: dest.tagline,
              imageUrl: dest.imageUrl,
              category: dest.category,
              location: dest.location,
              estimatedBudget: dest.estimatedBudget,
              idealDuration: `${dest.idealDurationDays} Days`,
              dataClassification: dest.dataClassification,
              source: dest.source,
              matchScore: 90,
              explanation: {
                overallMatchScore: 90,
                matchedInterests: [dest.category],
                matchedBudget: `Compatible with ${dest.estimatedBudget}`,
                matchedPace: 'Balanced',
                matchedParty: 'All travelers',
                reasonText: dest.tagline,
                criteriaBreakdown: { interestWeight: 40, budgetWeight: 25, distanceWeight: 15, seasonalityWeight: 20 },
              },
              isSaved: savedItemIds.has(dest.id),
              isNotInterested: false,
            });
          }}
        />
      )}

      {/* MODE: EXPERIENCES DISCOVERY (PART 2B) */}
      {activeMode === 'experiences' && (
        <ExperienceDiscoveryView
          experiences={INITIAL_EXPERIENCES}
          onSelectExperience={(exp: Experience) => setDetailExperience(exp)}
          savedItemIds={savedItemIds}
          onToggleSave={onToggleSave}
        />
      )}

      {/* MODE: FOOD DISCOVERY (PART 2B) */}
      {activeMode === 'food' && (
        <FoodDiscoveryView
          foodPlaces={INITIAL_FOOD_PLACES}
          onSelectFoodPlace={(food) => setDetailFoodPlace(food)}
          savedItemIds={savedItemIds}
          onToggleSave={onToggleSave}
        />
      )}

      {/* MODE: EVENT DISCOVERY (PART 2B) */}
      {activeMode === 'events' && (
        <EventDiscoveryView
          events={INITIAL_SEASONAL_EVENTS}
          onSelectEvent={(ev) => setDetailEvent(ev)}
          savedItemIds={savedItemIds}
          onToggleSave={onToggleSave}
          onAddToTrip={(ev) => {
            const dest = INITIAL_DESTINATIONS.find((d) => d.name.toLowerCase() === ev.destinationName.toLowerCase());
            if (dest) {
              onPlanTrip({
                id: dest.id,
                type: 'destination',
                title: dest.name,
                subtitle: dest.tagline,
                imageUrl: dest.imageUrl,
                category: dest.category,
                location: dest.location,
                estimatedBudget: dest.estimatedBudget,
                idealDuration: `${dest.idealDurationDays} Days`,
                dataClassification: dest.dataClassification,
                source: dest.source,
                matchScore: 95,
                explanation: {
                  overallMatchScore: 95,
                  matchedInterests: [ev.category],
                  matchedBudget: 'Flexible',
                  matchedPace: 'Festival visit',
                  matchedParty: 'All',
                  reasonText: `Trip planned for ${ev.name}`,
                  criteriaBreakdown: { interestWeight: 40, budgetWeight: 20, distanceWeight: 20, seasonalityWeight: 20 },
                },
                isSaved: savedItemIds.has(dest.id),
                isNotInterested: false,
              });
            }
          }}
        />
      )}

      {/* MODE 1: SEARCH & ADVANCED FILTERS */}
      {activeMode === 'search' && (
        <SearchResultsView
          initialQuery={activeSearchQuery}
          initialFilters={appliedFilters}
          userCity={userCity}
          userPreferences={preferences}
          onViewDetails={handleViewDetails}
          savedItemIds={Array.from(savedItemIds)}
          onToggleSave={(item) => onToggleSave(item.id)}
        />
      )}

      {/* MODE 2: INTERACTIVE FULL MAP DISCOVERY */}
      {activeMode === 'map' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <MapIcon className="w-5 h-5 text-[#D9531E]" />
              <span>Full Geographic Discovery Map</span>
            </h2>
            <button
              type="button"
              onClick={() => setActiveMode('curated')}
              className="text-xs text-[#D9531E] font-semibold hover:underline"
            >
              Back to Curated Explore
            </button>
          </div>
          <InteractiveMapDiscovery
            items={allItems}
            userCity={userCity}
            selectedItem={selectedMapItem}
            onSelectItem={setSelectedMapItem}
            onToggleSave={(item) => onToggleSave(item.id)}
            onAddToItinerary={(item) => {
              onPlanTrip({
                id: item.id,
                type: item.type === 'destination' ? 'destination' : 'experience',
                title: item.name,
                subtitle: item.subtitle || `${item.location.city}, ${item.location.state}`,
                imageUrl: item.imageUrl,
                category: 'heritage',
                location: item.location,
                estimatedBudget: 'moderate',
                idealDuration: '2 Days',
                dataClassification: item.dataClassification,
                source: item.source,
                matchScore: 90,
                explanation: {
                  overallMatchScore: 90,
                  matchedInterests: ['heritage'],
                  matchedBudget: 'Matched',
                  matchedPace: 'Balanced',
                  matchedParty: 'All',
                  reasonText: 'Selected from interactive geographic discovery map',
                  criteriaBreakdown: { interestWeight: 40, budgetWeight: 20, distanceWeight: 20, seasonalityWeight: 20 },
                },
                isSaved: savedItemIds.has(item.id),
                isNotInterested: false,
              });
            }}
            savedItemIds={Array.from(savedItemIds)}
            heightClass="h-[700px]"
            onViewDetails={handleViewDetails}
          />
        </div>
      )}

      {/* MODE 3: CURATED DISCOVERY DASHBOARD */}
      {activeMode === 'curated' && (
        <div className="space-y-12">
          {/* 1. Category Shortcuts (22 Categories) */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                  Explore by Category (22 Channels)
                </h2>
                <p className="text-xs text-stone-500">
                  From ancient rock architecture and spiritual ghats to wildlife safaris & high passes
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAppliedFilters({});
                  setActiveMode('search');
                }}
                className="text-xs font-semibold text-[#D9531E] hover:underline flex items-center gap-1"
              >
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Horizontal Scrollable Category Pills */}
            <div className="flex items-center gap-2.5 overflow-x-auto pb-2 pt-1 no-scrollbar">
              {CATEGORY_SHORTCUTS.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleSelectCategory(cat)}
                  className="group shrink-0 flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-[#D9531E] hover:shadow-xs transition-all text-left"
                >
                  <div className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-700 dark:text-stone-300 group-hover:bg-[#D9531E] group-hover:text-white transition-colors">
                    <span className="text-xs font-bold">{cat.name.slice(0, 2).toUpperCase()}</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-stone-900 dark:text-stone-100 whitespace-nowrap">
                      {cat.name}
                    </div>
                    <div className="text-[10px] text-stone-400 font-medium">
                      {cat.count} places
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* 2. Mood-Based Discovery (12 Moods) */}
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>Mood-Based Escapes (12 Journeys)</span>
              </h2>
              <p className="text-xs text-stone-500">
                Choose how you want to feel — curated itineraries matched with emotional travel states
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
              {MOOD_DISCOVERY_OPTIONS.map((mood) => (
                <div
                  key={mood.id}
                  onClick={() => handleSelectMood(mood)}
                  className={`relative rounded-2xl p-4 bg-gradient-to-br ${mood.bgGradient} text-white shadow-xs hover:shadow-md cursor-pointer group transition-all overflow-hidden flex flex-col justify-between min-h-[115px]`}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none transform translate-x-6 -translate-y-6" />

                  <div className="flex items-start justify-between gap-1">
                    <span className="px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-xs text-[10px] font-bold uppercase tracking-wider">
                      {mood.badge}
                    </span>
                    <ArrowRight className="w-4 h-4 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>

                  <div>
                    <h3 className="font-bold text-sm tracking-tight text-white leading-tight">
                      {mood.name}
                    </h3>
                    <p className="text-[11px] text-white/80 line-clamp-1 mt-0.5">
                      {mood.tagline}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 3. Trip Duration Shortcuts (7 Options) & Budget Brackets (8 Options) */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Durations */}
            <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  Filter by Available Duration
                </h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {DURATION_OPTIONS.map((dur) => (
                  <button
                    key={dur.id}
                    type="button"
                    onClick={() => handleSelectDuration(dur.id)}
                    className="p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 text-left transition-all group"
                  >
                    <div className="text-xs font-bold text-stone-800 dark:text-stone-200 group-hover:text-blue-600">
                      {dur.name}
                    </div>
                    <div className="text-[10px] text-stone-400 truncate mt-0.5">
                      {dur.daysRange}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Budgets */}
            <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  Filter by Expense Bracket (INR)
                </h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {BUDGET_OPTIONS.slice(0, 8).map((bud) => (
                  <button
                    key={bud.id}
                    type="button"
                    onClick={() => handleSelectBudget(bud.id)}
                    className="p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 text-left transition-all group"
                  >
                    <div className="text-xs font-bold text-stone-800 dark:text-stone-200 group-hover:text-emerald-600 truncate">
                      {bud.name}
                    </div>
                    <div className="text-[10px] text-stone-400 truncate mt-0.5">
                      {bud.approxPerDay > 0 ? `₹${bud.approxPerDay}/d` : 'Free'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* 4. Section: Popular Nearby (Distance Geocoded) */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#D9531E]" />
                  <span>Popular Near {userCity}</span>
                </h2>
                <p className="text-xs text-stone-500">
                  Top destinations and cultural landmarks sorted by real highway/air proximity
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAppliedFilters({ locationScope: 'custom_radius', customRadiusKm: 500 });
                  setActiveMode('search');
                }}
                className="text-xs font-semibold text-[#D9531E] hover:underline flex items-center gap-1"
              >
                <span>Explore nearby</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {popularNearby.map((item) => (
                <SearchResultCard
                  key={item.id}
                  item={item}
                  userCity={userCity}
                  isSaved={savedItemIds.has(item.id)}
                  onToggleSave={() => onToggleSave(item.id)}
                  onViewDetails={handleViewDetails}
                  viewMode="grid"
                />
              ))}
            </div>
          </section>

          {/* 5. Section: Hidden Gems & Offbeat Spots */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <span>💎</span>
                  <span>Curated Hidden Gems & Offbeat Wonders</span>
                </h2>
                <p className="text-xs text-stone-500">
                  Quiet villages, stepwells, living root bridges, and uncommercialized valleys
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAppliedFilters({ hiddenGemsOnly: true });
                  setActiveMode('search');
                }}
                className="text-xs font-semibold text-amber-600 hover:underline flex items-center gap-1"
              >
                <span>View all gems</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {hiddenGems.map((item) => (
                <SearchResultCard
                  key={item.id}
                  item={item}
                  userCity={userCity}
                  isSaved={savedItemIds.has(item.id)}
                  onToggleSave={() => onToggleSave(item.id)}
                  onViewDetails={handleViewDetails}
                  viewMode="grid"
                />
              ))}
            </div>
          </section>

          {/* 6. Section: Food Discovery & Iconic Culinary Heritage */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-amber-600" />
                  <span>Iconic Food & Culinary Trails</span>
                </h2>
                <p className="text-xs text-stone-500">
                  Verified historic tiffins, Awadhi kachoris, Old Delhi kebabs, and pure ghee sweets
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAppliedFilters({ categories: ['food'] });
                  setActiveMode('search');
                }}
                className="text-xs font-semibold text-[#D9531E] hover:underline flex items-center gap-1"
              >
                <span>All food places</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {foodHighlights.map((item) => (
                <SearchResultCard
                  key={item.id}
                  item={item}
                  userCity={userCity}
                  isSaved={savedItemIds.has(item.id)}
                  onToggleSave={() => onToggleSave(item.id)}
                  onViewDetails={handleViewDetails}
                  viewMode="grid"
                />
              ))}
            </div>
          </section>

          {/* 7. Section: Adventure Activities & High Passes */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Mountain className="w-5 h-5 text-teal-600" />
                  <span>Adventure & Mountain Circuits</span>
                </h2>
                <p className="text-xs text-stone-500">
                  Ganga rapids, high-altitude desert routes, scuba reefs, and canopy rainforests
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAppliedFilters({ categories: ['adventure'] });
                  setActiveMode('search');
                }}
                className="text-xs font-semibold text-teal-600 hover:underline flex items-center gap-1"
              >
                <span>Explore adventure</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {adventureActivities.map((item) => (
                <SearchResultCard
                  key={item.id}
                  item={item}
                  userCity={userCity}
                  isSaved={savedItemIds.has(item.id)}
                  onToggleSave={() => onToggleSave(item.id)}
                  onViewDetails={handleViewDetails}
                  viewMode="grid"
                />
              ))}
            </div>
          </section>

          {/* 8. Section: Cultural & Spiritual Experiences */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-[#D9531E]" />
                  <span>Spiritual Sanctums & Living Traditions</span>
                </h2>
                <p className="text-xs text-stone-500">
                  Ancient temple halls, sacred evening aartis, and thousand-pillar corridors
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAppliedFilters({ categories: ['spiritual'] });
                  setActiveMode('search');
                }}
                className="text-xs font-semibold text-[#D9531E] hover:underline flex items-center gap-1"
              >
                <span>View sanctums</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {culturalExperiences.map((item) => (
                <SearchResultCard
                  key={item.id}
                  item={item}
                  userCity={userCity}
                  isSaved={savedItemIds.has(item.id)}
                  onToggleSave={() => onToggleSave(item.id)}
                  onViewDetails={handleViewDetails}
                  viewMode="grid"
                />
              ))}
            </div>
          </section>

          {/* 9. Section: Seasonal Festivals & Melas */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-rose-600" />
                  <span>Seasonal Festivals & Cultural Celebrations</span>
                </h2>
                <p className="text-xs text-stone-500">
                  Dev Deepawali, Hornbill festival, Khajuraho dance festival, and desert melas
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {INITIAL_SEASONAL_EVENTS.slice(0, 2).map((ev) => (
                <div
                  key={ev.id}
                  className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs flex flex-col sm:flex-row"
                >
                  <div className="sm:w-2/5 aspect-16/10 sm:aspect-auto relative bg-stone-100 dark:bg-stone-800 shrink-0">
                    <img
                      src={ev.imageUrl}
                      alt={ev.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-stone-900/80 text-white text-[10px] font-bold">
                      {ev.category}
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <div className="text-xs font-bold text-[#D9531E] flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{ev.startDateApprox}</span>
                      </div>
                      <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100 mt-1">
                        {ev.name}
                      </h3>
                      <p className="text-xs text-stone-500">{ev.destinationName}, {ev.state}</p>
                      <p className="text-xs text-stone-600 dark:text-stone-300 line-clamp-2 mt-1">
                        {ev.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-400">
                      <span>Source: {ev.source.sourceName}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveSearchQuery(ev.name);
                          setActiveMode('search');
                        }}
                        className="font-semibold text-[#D9531E] hover:underline"
                      >
                        Find stays
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Part 2B Modals: Destination Detail (10 sections) */}
      <DestinationDetailView
        destination={detailDestination}
        isOpen={detailDestination !== null}
        onClose={() => setDetailDestination(null)}
        isSaved={detailDestination ? savedItemIds.has(detailDestination.id) : false}
        onToggleSave={onToggleSave}
        onAddToTrip={(dest: Destination) => {
          setDetailDestination(null);
          onPlanTrip({
            id: dest.id,
            type: 'destination',
            title: dest.name,
            subtitle: dest.tagline,
            imageUrl: dest.imageUrl,
            category: dest.category,
            location: dest.location,
            estimatedBudget: dest.estimatedBudget,
            idealDuration: `${dest.idealDurationDays} Days`,
            dataClassification: dest.dataClassification,
            source: dest.source,
            matchScore: 90,
            explanation: {
              overallMatchScore: 90,
              matchedInterests: [dest.category],
              matchedBudget: `Compatible with ${dest.estimatedBudget}`,
              matchedPace: 'Balanced',
              matchedParty: 'All travelers',
              reasonText: dest.tagline,
              criteriaBreakdown: { interestWeight: 40, budgetWeight: 25, distanceWeight: 15, seasonalityWeight: 20 },
            },
            isSaved: savedItemIds.has(dest.id),
            isNotInterested: false,
          });
        }}
        onSelectDestination={(dest: Destination) => setDetailDestination(dest)}
      />

      {/* Part 2B Modals: Experience Detail */}
      <ExperienceDetailModal
        experience={detailExperience}
        isOpen={detailExperience !== null}
        onClose={() => setDetailExperience(null)}
        isSaved={detailExperience ? savedItemIds.has(detailExperience.id) : false}
        onToggleSave={onToggleSave}
        onAddToTrip={(exp) => {
          setDetailExperience(null);
          const dest = INITIAL_DESTINATIONS.find((d) => d.name.toLowerCase() === exp.destinationName.toLowerCase());
          if (dest) {
            onPlanTrip({
              id: dest.id,
              type: 'destination',
              title: dest.name,
              subtitle: dest.tagline,
              imageUrl: dest.imageUrl,
              category: dest.category,
              location: dest.location,
              estimatedBudget: dest.estimatedBudget,
              idealDuration: `${dest.idealDurationDays} Days`,
              dataClassification: dest.dataClassification,
              source: dest.source,
              matchScore: 90,
              explanation: {
                overallMatchScore: 90,
                matchedInterests: [exp.category],
                matchedBudget: 'Curated',
                matchedPace: 'Activity-focused',
                matchedParty: 'All',
                reasonText: `Includes ${exp.title}`,
                criteriaBreakdown: { interestWeight: 40, budgetWeight: 25, distanceWeight: 15, seasonalityWeight: 20 },
              },
              isSaved: savedItemIds.has(dest.id),
              isNotInterested: false,
            });
          }
        }}
      />

      {/* Part 2B Modals: Food Place Detail */}
      <FoodDetailModal
        foodPlace={detailFoodPlace}
        allFoodPlaces={INITIAL_FOOD_PLACES}
        isOpen={detailFoodPlace !== null}
        onClose={() => setDetailFoodPlace(null)}
        isSaved={detailFoodPlace ? savedItemIds.has(detailFoodPlace.id) : false}
        onToggleSave={onToggleSave}
        onSelectFoodPlace={(f) => setDetailFoodPlace(f)}
      />

      {/* Part 2B Modals: Event Detail */}
      <EventDetailModal
        event={detailEvent}
        isOpen={detailEvent !== null}
        onClose={() => setDetailEvent(null)}
        isSaved={detailEvent ? savedItemIds.has(detailEvent.id) : false}
        onToggleSave={onToggleSave}
        onAddToTrip={(ev) => {
          setDetailEvent(null);
          const dest = INITIAL_DESTINATIONS.find((d) => d.name.toLowerCase() === ev.destinationName.toLowerCase());
          if (dest) {
            onPlanTrip({
              id: dest.id,
              type: 'destination',
              title: dest.name,
              subtitle: dest.tagline,
              imageUrl: dest.imageUrl,
              category: dest.category,
              location: dest.location,
              estimatedBudget: dest.estimatedBudget,
              idealDuration: `${dest.idealDurationDays} Days`,
              dataClassification: dest.dataClassification,
              source: dest.source,
              matchScore: 95,
              explanation: {
                overallMatchScore: 95,
                matchedInterests: [ev.category],
                matchedBudget: 'Flexible',
                matchedPace: 'Festival itinerary',
                matchedParty: 'All',
                reasonText: `Trip planned around ${ev.name}`,
                criteriaBreakdown: { interestWeight: 40, budgetWeight: 20, distanceWeight: 20, seasonalityWeight: 20 },
              },
              isSaved: savedItemIds.has(dest.id),
              isNotInterested: false,
            });
          }
        }}
      />
    </div>
  );
};
