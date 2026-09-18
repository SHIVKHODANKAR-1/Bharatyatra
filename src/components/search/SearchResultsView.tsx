import React, { useState, useEffect, useMemo } from 'react';
import {
  Grid,
  List,
  Map as MapIcon,
  SlidersHorizontal,
  ArrowUpDown,
  Search,
  RotateCcw,
  WifiOff,
  AlertCircle,
  Sparkles,
  MapPin,
  Compass,
  History,
  TrendingUp,
} from 'lucide-react';
import { UnifiedSearchItem, ExploreFilters, SortOption } from '../../types/travel';
import { UserPreferences } from '../../types/auth';
import { GlobalSearchBar } from './GlobalSearchBar';
import { SearchResultCard } from './SearchResultCard';
import { ActiveFilterChips } from '../filters/ActiveFilterChips';
import { FilterDrawer } from '../filters/FilterDrawer';
import { InteractiveMapDiscovery } from '../map/InteractiveMapDiscovery';
import { AddToTripModal } from '../modals/AddToTripModal';
import { FeedbackService } from '../../services/feedbackService';
import {
  getAllUnifiedItems,
  filterUnifiedItems,
  sortUnifiedItems,
} from '../../services/searchExploreService';

interface SearchResultsViewProps {
  initialQuery?: string;
  initialFilters?: Partial<ExploreFilters>;
  userCity?: string;
  userPreferences?: UserPreferences;
  onViewDetails?: (item: UnifiedSearchItem) => void;
  savedItemIds?: string[];
  onToggleSave?: (item: UnifiedSearchItem) => void;
  onAddToItinerary?: (item: UnifiedSearchItem) => void;
}

export const SearchResultsView: React.FC<SearchResultsViewProps> = ({
  initialQuery = '',
  initialFilters,
  userCity = 'Nagpur',
  userPreferences,
  onViewDetails,
  savedItemIds = [],
  onToggleSave,
  onAddToItinerary,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<ExploreFilters>({
    searchQuery: initialQuery,
    locationScope: 'all_india',
    budgetBrackets: [],
    durations: [],
    travelStyles: [],
    categories: [],
    groupTypes: [],
    accessibility: [],
    weather: [],
    season: [],
    crowdLevel: [],
    foodPreferences: [],
    transportTypes: [],
    experienceIntensity: [],
    hiddenGemsOnly: false,
    onlyOpenNow: false,
    ...initialFilters,
  });

  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showMap, setShowMap] = useState<boolean>(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [selectedMapItem, setSelectedMapItem] = useState<UnifiedSearchItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [tripModalItem, setTripModalItem] = useState<any | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches
  useEffect(() => {
    const profile = FeedbackService.getProfile();
    setRecentSearches(profile.previousSearches || []);
  }, [searchQuery]);

  // Sync online/offline listener
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update query when initialQuery prop changes
  useEffect(() => {
    if (initialQuery !== searchQuery) {
      setSearchQuery(initialQuery);
      setFilters((prev) => ({ ...prev, searchQuery: initialQuery }));
      if (initialQuery.trim()) {
        FeedbackService.recordSearch(initialQuery);
      }
    }
  }, [initialQuery]);

  const handleSearchSubmit = (query: string) => {
    setSearchQuery(query);
    setFilters((prev) => ({ ...prev, searchQuery: query }));
    if (query.trim()) {
      FeedbackService.recordSearch(query);
      const profile = FeedbackService.getProfile();
      setRecentSearches(profile.previousSearches || []);
    }
  };

  const handleAddItemToTrip = (item: UnifiedSearchItem) => {
    if (onAddToItinerary) {
      onAddToItinerary(item);
    } else {
      setTripModalItem({
        id: item.id,
        title: item.name,
        location: item.location,
        approxPriceInr: item.approxPriceInr || 0,
        durationMinutes: 90,
        itemType: item.type === 'food' ? 'food' : item.type === 'experience' ? 'experience' : 'destination',
      });
    }
  };

  // Load and filter unified items
  const allItems = useMemo(() => {
    return getAllUnifiedItems(userCity);
  }, [userCity]);

  const filteredItems = useMemo(() => {
    const currentFilters: ExploreFilters = { ...filters, searchQuery };
    const filtered = filterUnifiedItems(allItems, currentFilters, userPreferences);
    return sortUnifiedItems(filtered, sortBy, userPreferences);
  }, [allItems, filters, searchQuery, sortBy, userPreferences]);

  const handleQuerySubmit = (q: string) => {
    setSearchQuery(q);
    setFilters((prev) => ({ ...prev, searchQuery: q }));
  };

  const handleRemoveFilter = (key: keyof ExploreFilters, value?: string) => {
    setFilters((prev) => {
      if (key === 'searchQuery') {
        setSearchQuery('');
        return { ...prev, searchQuery: '' };
      }
      if (key === 'locationScope') {
        return { ...prev, locationScope: 'all_india', customRadiusKm: undefined };
      }
      if (key === 'onlyOpenNow' || key === 'hiddenGemsOnly') {
        return { ...prev, [key]: false };
      }
      if (key === 'minRating') {
        return { ...prev, minRating: 0 };
      }
      const arr = (prev[key] as string[]) || [];
      if (value) {
        return { ...prev, [key]: arr.filter((x) => x !== value) };
      }
      return { ...prev, [key]: [] };
    });
  };

  const handleClearAll = () => {
    setSearchQuery('');
    setFilters({
      searchQuery: '',
      locationScope: 'all_india',
      budgetBrackets: [],
      durations: [],
      travelStyles: [],
      categories: [],
      groupTypes: [],
      accessibility: [],
      weather: [],
      season: [],
      crowdLevel: [],
      foodPreferences: [],
      transportTypes: [],
      experienceIntensity: [],
      hiddenGemsOnly: false,
      onlyOpenNow: false,
    });
  };

  const activeFilterCount =
    (filters.locationScope !== 'all_india' ? 1 : 0) +
    filters.budgetBrackets.length +
    filters.durations.length +
    filters.travelStyles.length +
    filters.categories.length +
    filters.accessibility.length +
    filters.weather.length +
    filters.crowdLevel.length +
    (filters.minRating ? 1 : 0) +
    (filters.onlyOpenNow ? 1 : 0) +
    (filters.hiddenGemsOnly ? 1 : 0);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-6 animate-fadeIn">
      {/* Offline Status Warning */}
      {isOffline && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center gap-3 text-amber-700 dark:text-amber-300 text-xs font-medium">
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>You are currently offline. Viewing cached travel intelligence and local guides.</span>
        </div>
      )}

      {/* Global Search Header */}
      <div className="space-y-3">
        <GlobalSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onSearchSubmit={handleSearchSubmit}
          onOpenFilters={() => setIsFilterDrawerOpen(true)}
          activeFilterCount={activeFilterCount}
          placeholder="Search destinations, monuments, street food, palace stays, road trips..."
        />

        {/* Recent Searches Pills */}
        {recentSearches.length > 0 && !searchQuery && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs text-stone-500">
            <span className="flex items-center gap-1 font-semibold text-stone-400 shrink-0">
              <History className="w-3.5 h-3.5" />
              <span>Recent:</span>
            </span>
            {recentSearches.slice(0, 5).map((term, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSearchSubmit(term)}
                className="px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-[#D9531E]/10 hover:text-[#D9531E] text-stone-700 dark:text-stone-300 transition-colors shrink-0"
              >
                {term}
              </button>
            ))}
          </div>
        )}

        {/* Active Filter Chips */}
        <ActiveFilterChips
          filters={{ ...filters, searchQuery }}
          onRemoveFilter={handleRemoveFilter}
          onClearAll={handleClearAll}
          currentCity={userCity}
        />
      </div>

      {/* Controls Bar: Total Results, Sort, View Toggle, Map Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-stone-900 dark:text-stone-100">
            {filteredItems.length} Places & Experiences Found
          </span>
          {searchQuery && (
            <span className="text-xs text-stone-500">
              for <strong className="text-stone-800 dark:text-stone-200">"{searchQuery}"</strong>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          {/* Map View Toggle */}
          <button
            type="button"
            onClick={() => setShowMap(!showMap)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              showMap
                ? 'bg-[#D9531E] border-[#D9531E] text-white shadow-xs'
                : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-50'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>{showMap ? 'Hide Map' : 'Show Map'}</span>
          </button>

          {/* Sort Dropdown */}
          <div className="relative flex items-center gap-1.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-stone-700 dark:text-stone-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-transparent border-none outline-none font-medium cursor-pointer"
            >
              <option value="relevance">Relevance</option>
              <option value="match">Personal Match %</option>
              <option value="distance">Distance (Nearest First)</option>
              <option value="budget_asc">Budget: Low to High</option>
              <option value="budget_desc">Budget: High to Low</option>
              <option value="duration">Duration (Shortest)</option>
              <option value="rating">Top Rated</option>
              <option value="freshness">Recently Updated</option>
            </select>
          </div>

          {/* Grid / List Switcher */}
          <div className="hidden sm:flex items-center bg-stone-100 dark:bg-stone-800 p-1 rounded-xl border border-stone-200 dark:border-stone-700">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-stone-700 text-[#D9531E] shadow-2xs'
                  : 'text-stone-400 hover:text-stone-700'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-stone-700 text-[#D9531E] shadow-2xs'
                  : 'text-stone-400 hover:text-stone-700'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Layout (Split Map / List or Full Grid) */}
      {showMap ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Results List */}
          <div className="lg:col-span-5 space-y-4 max-h-[750px] overflow-y-auto pr-1">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onMouseEnter={() => setSelectedMapItem(item)}
                className={`rounded-2xl transition-all ${
                  selectedMapItem?.id === item.id ? 'ring-2 ring-[#D9531E]' : ''
                }`}
              >
                  <SearchResultCard
                  item={item}
                  userCity={userCity}
                  isSaved={savedItemIds.includes(item.id)}
                  onToggleSave={onToggleSave}
                  onViewDetails={onViewDetails}
                  onAddToItinerary={handleAddItemToTrip}
                  viewMode="list"
                />
              </div>
            ))}
          </div>

          {/* Right Column: Sticky Interactive Map */}
          <div className="lg:col-span-7 sticky top-20">
            <InteractiveMapDiscovery
              items={filteredItems}
              userCity={userCity}
              selectedItem={selectedMapItem}
              onSelectItem={setSelectedMapItem}
              onToggleSave={onToggleSave}
              savedItemIds={savedItemIds}
              heightClass="h-[750px]"
              onViewDetails={onViewDetails}
            />
          </div>
        </div>
      ) : (
        /* Regular Results Grid / List */
        <div>
          {filteredItems.length === 0 ? (
            /* No Results State */
            <div className="p-8 sm:p-12 text-center rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-6 max-w-lg mx-auto my-8 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-[#D9531E] flex items-center justify-center mx-auto">
                <Search className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                  No places match "{searchQuery || 'your criteria'}"
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Try broadening your distance radius, adjusting budget filters, or clearing specific travel styles.
                </p>
              </div>

              {/* Broaden Search Suggestions */}
              <div className="space-y-2 text-xs">
                <div className="font-semibold text-stone-700 dark:text-stone-300">
                  Try broadening your search:
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFilters((prev) => ({ ...prev, locationScope: 'all_india' }));
                    }}
                    className="px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-[#D9531E]/10 hover:text-[#D9531E] text-stone-700 dark:text-stone-300 transition-colors"
                  >
                    🗺️ All India Scope
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFilters((prev) => ({ ...prev, budgetBrackets: [] }));
                    }}
                    className="px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-[#D9531E]/10 hover:text-[#D9531E] text-stone-700 dark:text-stone-300 transition-colors"
                  >
                    💰 Any Budget
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFilters((prev) => ({ ...prev, travelStyles: [] }));
                    }}
                    className="px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-[#D9531E]/10 hover:text-[#D9531E] text-stone-700 dark:text-stone-300 transition-colors"
                  >
                    ✨ Any Travel Style
                  </button>
                </div>
              </div>

              {/* Popular Alternative Destinations */}
              <div className="space-y-2 text-xs pt-2 border-t border-stone-200 dark:border-stone-800">
                <div className="flex items-center justify-center gap-1 font-semibold text-stone-700 dark:text-stone-300">
                  <TrendingUp className="w-3.5 h-3.5 text-[#D9531E]" />
                  <span>Popular Destinations:</span>
                </div>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {['Varanasi', 'Jaipur', 'Hampi', 'Udaipur', 'Munnar', 'Leh Ladakh', 'Goa'].map((dest) => (
                    <button
                      key={dest}
                      type="button"
                      onClick={() => handleSearchSubmit(dest)}
                      className="px-2.5 py-1 rounded-lg border border-stone-200 dark:border-stone-700 hover:border-[#D9531E] hover:text-[#D9531E] text-stone-600 dark:text-stone-400 transition-colors"
                    >
                      {dest}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="px-4 py-2 rounded-xl bg-[#D9531E] hover:bg-[#B45309] text-white text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            </div>
          ) : (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'
                  : 'space-y-4 max-w-4xl mx-auto'
              }
            >
              {filteredItems.map((item) => (
                <SearchResultCard
                  key={item.id}
                  item={item}
                  userCity={userCity}
                  isSaved={savedItemIds.includes(item.id)}
                  onToggleSave={onToggleSave}
                  onViewDetails={onViewDetails}
                  onAddToItinerary={handleAddItemToTrip}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Advanced Filter Drawer Modal */}
      <FilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        filters={filters}
        onApplyFilters={(newFilters) => setFilters(newFilters)}
        onResetFilters={handleClearAll}
        currentCity={userCity}
      />

      {/* Add To Trip Itinerary Modal */}
      <AddToTripModal
        isOpen={!!tripModalItem}
        onClose={() => setTripModalItem(null)}
        item={tripModalItem}
      />
    </div>
  );
};
