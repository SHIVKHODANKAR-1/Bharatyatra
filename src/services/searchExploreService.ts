import {
  UnifiedSearchItem,
  ExploreFilters,
  SortOption,
  RecommendationItem,
  Destination,
  Experience,
  TouristAttraction,
  FoodPlace,
  StayPlace,
  SeasonalEvent,
} from '../types/travel';
import { UserPreferences } from '../types/auth';
import { DataClassification } from '../types/index';
import { INITIAL_DESTINATIONS } from '../data/destinations';
import { INITIAL_HIDDEN_GEMS } from '../data/hiddenGems';
import { INITIAL_EXPERIENCES } from '../data/experiences';
import { INITIAL_ATTRACTIONS } from '../data/attractions';
import { INITIAL_FOOD_PLACES } from '../data/foodPlaces';
import { INITIAL_STAYS } from '../data/stays';
import { INITIAL_SEASONAL_EVENTS } from '../data/events';
import { calculateHaversineDistanceKm, getCityCoordinates } from './geoService';

const RECENT_SEARCHES_KEY = 'bharat_yatra_recent_searches';
const FILTER_PRESETS_KEY = 'bharat_yatra_filter_presets';

export interface FilterPreset {
  id: string;
  name: string;
  filters: ExploreFilters;
  createdAt: string;
}

export const TRENDING_SEARCHES = [
  'Varanasi Ganga Aarti',
  'Monsoon in Munnar',
  'Hampi ruins Karnataka',
  'Spiti Valley road trip',
  'Jaipur street food',
  'Golden Temple Langar',
  'Ajanta Ellora caves',
  'Meenakshi Temple gopuram',
  'Rann of Kutch festival',
  'Quiet beaches Goa',
];

/**
 * Builds unified searchable records from all data sources with distance relative to user origin
 */
export function getAllUnifiedItems(userCity: string = 'Nagpur'): UnifiedSearchItem[] {
  const originCoords = getCityCoordinates(userCity);
  const items: UnifiedSearchItem[] = [];

  // 1. Destinations & Hidden Gems
  const allDests = [...INITIAL_DESTINATIONS, ...INITIAL_HIDDEN_GEMS];
  for (const dest of allDests) {
    const dist = calculateHaversineDistanceKm(
      originCoords.latitude,
      originCoords.longitude,
      dest.location.latitude,
      dest.location.longitude
    );

    items.push({
      id: dest.id,
      type: 'destination',
      name: dest.name,
      subtitle: dest.tagline,
      category: dest.category,
      location: dest.location,
      imageUrl: dest.imageUrl,
      description: dest.description,
      distanceKm: dist,
      estimatedBudget: dest.estimatedBudget,
      approxPriceInr: dest.approxCostPerDayInr,
      suggestedDuration: `${dest.idealDurationDays} Days`,
      durationMinutes: dest.idealDurationDays * 24 * 60,
      rating: dest.ratingsSummary?.average || 4.7,
      ratingCount: dest.ratingsSummary?.count || 1200,
      isOpenNow: true,
      openingHoursVerified: false, // Natural places don't have gate hours
      accessibilityFeatures: ['Accessibility information not verified.'],
      accessibilityVerified: false,
      travelStyles: ['Cultural', 'Slow Travel', 'Photography', dest.isHiddenGem ? 'Backpacking' : 'Family'],
      weatherSuitability: ['Winter Suitable', 'Clear Weather Suitable'],
      crowdLevel: dest.isHiddenGem ? 'Quiet' : 'Busy',
      dataClassification: dest.dataClassification,
      source: dest.source,
      lastUpdatedDate: dest.source?.lastUpdated || '2026-08-01',
      isHiddenGem: dest.isHiddenGem,
    });
  }

  // 2. Tourist Attractions
  for (const attr of INITIAL_ATTRACTIONS) {
    const dist = calculateHaversineDistanceKm(
      originCoords.latitude,
      originCoords.longitude,
      attr.location.latitude,
      attr.location.longitude
    );

    items.push({
      id: attr.id,
      type: 'attraction',
      name: attr.name,
      subtitle: `${attr.destinationName} • Entry: ${attr.isFree ? 'Free' : `₹${attr.entryFeeInr}`}`,
      category: attr.category,
      location: attr.location,
      imageUrl: attr.imageUrl,
      description: attr.description,
      distanceKm: dist,
      estimatedBudget: attr.isFree ? 'free' : 'under_500',
      approxPriceInr: attr.entryFeeInr,
      suggestedDuration: 'Half Day',
      durationMinutes: 180,
      rating: attr.ratingsSummary?.average || 4.8,
      ratingCount: attr.ratingsSummary?.count || 3400,
      isOpenNow: attr.isOpenNow,
      openingHoursVerified: attr.openingHoursVerified,
      accessibilityFeatures: attr.accessibilityFeatures || ['Accessibility information not verified.'],
      accessibilityVerified: attr.accessibilityVerified,
      travelStyles: ['Cultural', 'Heritage', 'Family', 'Photography'],
      weatherSuitability: attr.weatherSuitability || ['Clear Weather Suitable'],
      crowdLevel: attr.crowdLevel || 'Moderate',
      dataClassification: attr.dataClassification,
      source: attr.source,
      lastUpdatedDate: attr.lastUpdatedDate,
    });
  }

  // 3. Experiences & Activities
  for (const exp of INITIAL_EXPERIENCES) {
    const dist = calculateHaversineDistanceKm(
      originCoords.latitude,
      originCoords.longitude,
      exp.location.latitude,
      exp.location.longitude
    );

    items.push({
      id: exp.id,
      type: exp.category === 'adventure' ? 'activity' : 'experience',
      name: exp.title,
      subtitle: `${exp.destinationName} • ${exp.timingDetails || ''}`,
      category: exp.category,
      location: exp.location,
      imageUrl: exp.imageUrl,
      description: exp.description,
      distanceKm: dist,
      estimatedBudget: exp.budgetTier,
      approxPriceInr: exp.approxPriceInr,
      suggestedDuration: `${Math.round(exp.durationMinutes / 60)} Hours`,
      durationMinutes: exp.durationMinutes,
      rating: 4.8,
      ratingCount: 840,
      isOpenNow: exp.isOpenNow,
      openingHoursVerified: true,
      accessibilityFeatures: exp.accessibilityFeatures || ['Accessibility information not verified.'],
      accessibilityVerified: Boolean(exp.accessibilityFeatures?.length),
      travelStyles: [exp.category === 'adventure' ? 'Adventure' : 'Cultural', 'Solo', 'Family'],
      weatherSuitability: ['Clear Weather Suitable'],
      crowdLevel: 'Moderate',
      dataClassification: exp.dataClassification,
      source: exp.source,
      lastUpdatedDate: exp.source?.lastUpdated || '2026-08-10',
    });
  }

  // 4. Food Places
  for (const food of INITIAL_FOOD_PLACES) {
    const dist = calculateHaversineDistanceKm(
      originCoords.latitude,
      originCoords.longitude,
      food.location.latitude,
      food.location.longitude
    );

    items.push({
      id: food.id,
      type: 'food',
      name: food.name,
      subtitle: `${food.cuisineType} • ₹${food.priceForTwoInr} for two`,
      category: 'food',
      location: food.location,
      imageUrl: food.imageUrl,
      description: `Famous for: ${food.specialtyDishes.join(', ')}. Dietary: ${food.dietaryPreference}.`,
      distanceKm: dist,
      estimatedBudget: food.budgetTier,
      approxPriceInr: food.priceForTwoInr,
      suggestedDuration: 'Few Hours',
      durationMinutes: 90,
      rating: food.ratingsSummary?.average || 4.7,
      ratingCount: food.ratingsSummary?.count || 2100,
      isOpenNow: food.isOpenNow,
      openingHoursVerified: food.openingHoursVerified,
      accessibilityFeatures: ['Accessibility information not verified.'],
      accessibilityVerified: false,
      travelStyles: ['Food-focused', 'Cultural', 'Backpacking', 'Family'],
      weatherSuitability: ['Indoor-friendly'],
      crowdLevel: 'Busy',
      dataClassification: food.dataClassification,
      source: food.source,
      lastUpdatedDate: food.lastUpdatedDate,
    });
  }

  // 5. Stays / Hotels
  for (const stay of INITIAL_STAYS) {
    const dist = calculateHaversineDistanceKm(
      originCoords.latitude,
      originCoords.longitude,
      stay.location.latitude,
      stay.location.longitude
    );

    items.push({
      id: stay.id,
      type: 'stay',
      name: stay.name,
      subtitle: `${stay.stayType} • ₹${stay.pricePerNightInr.toLocaleString('en-IN')}/night`,
      category: 'heritage',
      location: stay.location,
      imageUrl: stay.imageUrl,
      description: `${stay.description} Amenities: ${stay.amenities.slice(0, 3).join(', ')}.`,
      distanceKm: dist,
      estimatedBudget: stay.budgetTier,
      approxPriceInr: stay.pricePerNightInr,
      suggestedDuration: 'Weekend',
      durationMinutes: 48 * 60,
      rating: stay.ratingsSummary?.average || 4.8,
      ratingCount: stay.ratingsSummary?.count || 620,
      isOpenNow: true,
      openingHoursVerified: true,
      accessibilityFeatures: stay.accessibilityFeatures || ['Accessibility information not verified.'],
      accessibilityVerified: stay.accessibilityVerified,
      travelStyles: [stay.budgetTier === 'luxury' ? 'Luxury' : 'Backpacking', 'Romantic', 'Slow Travel'],
      weatherSuitability: ['Indoor-friendly', 'All Year'],
      crowdLevel: 'Quiet',
      dataClassification: stay.dataClassification,
      source: stay.source,
      lastUpdatedDate: stay.lastUpdatedDate,
    });
  }

  // 6. Seasonal Events
  for (const evt of INITIAL_SEASONAL_EVENTS) {
    const destCoords = getCityCoordinates(evt.destinationName);
    const dist = calculateHaversineDistanceKm(
      originCoords.latitude,
      originCoords.longitude,
      destCoords.latitude,
      destCoords.longitude
    );

    items.push({
      id: evt.id,
      type: 'event',
      name: evt.name,
      subtitle: `${evt.destinationName}, ${evt.state} • ${evt.startDateApprox}`,
      category: 'festivals',
      location: {
        city: evt.destinationName,
        state: evt.state,
        latitude: destCoords.latitude,
        longitude: destCoords.longitude,
        address: `${evt.destinationName}, ${evt.state}`,
      },
      imageUrl: evt.imageUrl,
      description: `${evt.description} ${evt.dateUncertain ? `[${evt.uncertaintyDisclaimer || 'Date subject to lunar calendar'}]` : ''}`,
      distanceKm: dist,
      estimatedBudget: 'moderate',
      approxPriceInr: 2000,
      suggestedDuration: 'Weekend',
      durationMinutes: 36 * 60,
      rating: 4.9,
      ratingCount: 1540,
      isOpenNow: false, // seasonal event
      openingHoursVerified: false,
      accessibilityFeatures: ['Accessibility information not verified.'],
      accessibilityVerified: false,
      travelStyles: ['Cultural', 'Photography', 'Festivals'],
      weatherSuitability: ['Winter Suitable'],
      crowdLevel: 'Festival Crowd',
      dataClassification: evt.dataClassification,
      source: evt.source,
      lastUpdatedDate: evt.source?.lastUpdated || '2026-08-01',
    });
  }

  return items;
}

/**
 * Filter items with multi-dimensional criteria
 */
export function filterUnifiedItems(
  items: UnifiedSearchItem[],
  filters: ExploreFilters,
  userPreferences?: UserPreferences
): UnifiedSearchItem[] {
  return items.filter((item) => {
    // Hidden gems toggle
    if (filters.hiddenGemsOnly && !item.isHiddenGem) {
      return false;
    }

    // Search query match
    if (filters.searchQuery?.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      const matchName = item.name.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchCity = item.location.city.toLowerCase().includes(q);
      const matchState = item.location.state.toLowerCase().includes(q);
      const matchCategory = item.category.toLowerCase().includes(q);
      const matchType = item.type.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchCity && !matchState && !matchCategory && !matchType) {
        return false;
      }
    }

    // Categories filter
    if (filters.categories && filters.categories.length > 0) {
      const matchesCategory = filters.categories.some(
        (cat) =>
          cat.toLowerCase() === item.category.toLowerCase() ||
          cat.toLowerCase() === item.type.toLowerCase()
      );
      if (!matchesCategory) return false;
    }

    // Location Scope
    if (filters.locationScope === 'selected_city' && userPreferences?.selectedCity) {
      if (item.location.city.toLowerCase() !== userPreferences.selectedCity.toLowerCase()) {
        return false;
      }
    } else if (filters.locationScope === 'custom_radius' && filters.customRadiusKm) {
      if ((item.distanceKm ?? 9999) > filters.customRadiusKm) {
        return false;
      }
    }

    // Distance threshold if explicitly provided
    if (filters.customRadiusKm && filters.customRadiusKm > 0) {
      if ((item.distanceKm ?? 9999) > filters.customRadiusKm) {
        return false;
      }
    }

    // Budget Brackets filter
    if (filters.budgetBrackets && filters.budgetBrackets.length > 0) {
      const matchesBudget = filters.budgetBrackets.some((b) => {
        const price = item.approxPriceInr ?? 0;
        if (b === 'free') return price === 0 || item.estimatedBudget === 'free';
        if (b === 'under_500') return price > 0 && price <= 500;
        if (b === '500_2000') return price > 500 && price <= 2000;
        if (b === '2000_5000') return price > 2000 && price <= 5000;
        if (b === '5000_10000') return price > 5000 && price <= 10000;
        if (b === '10000_25000') return price > 10000 && price <= 25000;
        if (b === 'premium') return price > 25000 || item.estimatedBudget === 'luxury';
        return true;
      });
      if (!matchesBudget) return false;
    }

    // Travel Styles
    if (filters.travelStyles && filters.travelStyles.length > 0) {
      const hasStyle = filters.travelStyles.some((s) =>
        item.travelStyles?.some((ts) => ts.toLowerCase() === s.toLowerCase())
      );
      if (!hasStyle) return false;
    }

    // Accessibility filter
    if (filters.accessibility && filters.accessibility.length > 0) {
      const hasAcc = filters.accessibility.every((accReq) =>
        item.accessibilityFeatures?.some((feat) =>
          feat.toLowerCase().includes(accReq.toLowerCase().replace('-', ' '))
        )
      );
      if (!hasAcc) return false;
    }

    // Weather suitability
    if (filters.weather && filters.weather.length > 0) {
      const hasWeather = filters.weather.some((w) =>
        item.weatherSuitability?.some((iw) => iw.toLowerCase() === w.toLowerCase())
      );
      if (!hasWeather) return false;
    }

    // Crowd level
    if (filters.crowdLevel && filters.crowdLevel.length > 0) {
      if (!item.crowdLevel || !filters.crowdLevel.includes(item.crowdLevel)) {
        return false;
      }
    }

    // Min Rating
    if (filters.minRating && filters.minRating > 0) {
      if ((item.rating ?? 0) < filters.minRating) {
        return false;
      }
    }

    // Open Now rule: Do not show "Open Now" unless opening hours are verified!
    if (filters.onlyOpenNow) {
      if (!item.openingHoursVerified || !item.isOpenNow) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Sorts unified search items according to criteria
 */
export function sortUnifiedItems(
  items: UnifiedSearchItem[],
  sortBy: SortOption,
  userPreferences?: UserPreferences
): UnifiedSearchItem[] {
  const cloned = [...items];

  switch (sortBy) {
    case 'distance':
      return cloned.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));

    case 'budget_asc':
      return cloned.sort((a, b) => (a.approxPriceInr ?? 0) - (b.approxPriceInr ?? 0));

    case 'budget_desc':
      return cloned.sort((a, b) => (b.approxPriceInr ?? 0) - (a.approxPriceInr ?? 0));

    case 'duration':
      return cloned.sort((a, b) => (a.durationMinutes ?? 0) - (b.durationMinutes ?? 0));

    case 'rating':
      return cloned.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

    case 'freshness':
      return cloned.sort(
        (a, b) => new Date(b.lastUpdatedDate).getTime() - new Date(a.lastUpdatedDate).getTime()
      );

    case 'match':
      // Personalized match scoring
      return cloned.sort((a, b) => {
        const scoreA = calculateItemMatchScore(a, userPreferences);
        const scoreB = calculateItemMatchScore(b, userPreferences);
        return scoreB - scoreA;
      });

    case 'relevance':
    default:
      // Multi-factor relevance: verified items + rating + distance proximity
      return cloned.sort((a, b) => {
        const aVerified = a.dataClassification === DataClassification.VERIFIED ? 20 : 0;
        const bVerified = b.dataClassification === DataClassification.VERIFIED ? 20 : 0;
        const aScore = (a.rating ?? 4) * 15 + aVerified - Math.min((a.distanceKm ?? 1000) / 50, 20);
        const bScore = (b.rating ?? 4) * 15 + bVerified - Math.min((b.distanceKm ?? 1000) / 50, 20);
        return bScore - aScore;
      });
  }
}

/**
 * Calculates a 0-100 personal match score for any unified item
 */
export function calculateItemMatchScore(
  item: UnifiedSearchItem,
  preferences?: UserPreferences
): number {
  if (!preferences) return Math.round(75 + (item.rating ?? 4) * 4);

  let score = 55;
  if (preferences.interests?.some((i) => i.toLowerCase() === item.category.toLowerCase())) {
    score += 25;
  }
  if (item.travelStyles?.some((s) => preferences.interests?.includes(s.toLowerCase() as any))) {
    score += 10;
  }
  if (item.estimatedBudget === preferences.budget) {
    score += 10;
  }
  return Math.min(score, 99);
}

/**
 * Manages Recent Searches in localStorage
 */
export function getRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    return raw ? JSON.parse(raw) : ['Varanasi', 'Hampi', 'Monsoon in Munnar', 'Amer Fort'];
  } catch {
    return ['Varanasi', 'Hampi'];
  }
}

export function saveRecentSearch(query: string): void {
  if (!query || query.trim().length < 2) return;
  try {
    const recents = getRecentSearches().filter((q) => q.toLowerCase() !== query.toLowerCase());
    recents.unshift(query.trim());
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recents.slice(0, 10)));
  } catch {
    // ignore
  }
}

export function removeRecentSearch(query: string): string[] {
  try {
    const recents = getRecentSearches().filter((q) => q.toLowerCase() !== query.toLowerCase());
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recents));
    return recents;
  } catch {
    return [];
  }
}

export function clearRecentSearches(): void {
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch {
    // ignore
  }
}

/**
 * Filter Presets Management
 */
export function getSavedFilterPresets(): FilterPreset[] {
  try {
    const raw = localStorage.getItem(FILTER_PRESETS_KEY);
    return raw
      ? JSON.parse(raw)
      : [
          {
            id: 'preset_budget_weekend',
            name: 'Weekend Budget Explorer',
            filters: {
              locationScope: 'all_india',
              budgetBrackets: ['under_500', '500_2000'],
              durations: ['weekend'],
              travelStyles: ['Budget', 'Backpacking'],
              categories: [],
              groupTypes: [],
              accessibility: [],
              weather: [],
              season: [],
              crowdLevel: [],
              foodPreferences: [],
              transportTypes: [],
              experienceIntensity: [],
            },
            createdAt: '2026-08-01',
          },
        ];
  } catch {
    return [];
  }
}

export function saveFilterPreset(name: string, filters: ExploreFilters): FilterPreset[] {
  try {
    const existing = getSavedFilterPresets();
    const newPreset: FilterPreset = {
      id: `preset_${Date.now()}`,
      name: name.trim() || 'My Travel Filter',
      filters,
      createdAt: new Date().toISOString().split('T')[0],
    };
    const updated = [newPreset, ...existing].slice(0, 8);
    localStorage.setItem(FILTER_PRESETS_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}
