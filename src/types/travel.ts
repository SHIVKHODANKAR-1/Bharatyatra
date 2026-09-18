import { DataClassification } from './index';
import { BudgetTier, TravelInterest } from './auth';

export interface SourceAttribution {
  sourceName: string;
  sourceUrl?: string;
  lastUpdated: string;
  license?: string;
  verifiedBy?: string;
  confidenceScore?: number; // 0-100
}

export interface GeoLocation {
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  address?: string;
}

export type VerificationLabelType =
  | 'Verified'
  | 'Verified Recently'
  | 'Estimated'
  | 'Needs Verification'
  | 'Information May Be Outdated'
  | 'Unavailable';

export interface ThingToDoItem {
  id: string;
  name: string;
  category: string;
  description: string;
  duration: string;
  estimatedCostInr: number;
  isFree?: boolean;
  location: string;
  openingStatus: 'Open Now' | 'Closed' | 'Information not verified';
  accessibilityStatus: string;
  verificationLabel: VerificationLabelType;
  source: SourceAttribution;
}

export interface FoodToTryItem {
  id: string;
  name: string;
  localName?: string;
  description: string;
  dishType: 'Sweet' | 'Savory' | 'Beverage' | 'Meal' | 'Snack' | 'Breakfast';
  dietaryPreference: string;
  estimatedPriceInr: number;
  isPriceEstimated: boolean;
  bestEateries: string[];
}

export interface HowToReachOption {
  mode: 'Road' | 'Train' | 'Bus' | 'Flight' | 'Local Taxi' | 'Rental Vehicle';
  startingLocation: string;
  destination: string;
  approxDuration: string;
  approxDistanceKm: number;
  transportType: string;
  estimatedCostInr: number;
  costRange: string;
  notes: string;
  dataFreshness: string;
  isLiveScheduleConnected: boolean; // Must be false to uphold "no live schedules unless API connected"
}

export interface LocalTransportItem {
  mode: string;
  typicalFare: string;
  practicalTips: string;
  availability: string;
  accessibilityNotes: string;
}

export interface DestinationFAQ {
  question: string;
  answer: string;
  sourceVerified: boolean;
}

export interface DestinationReview {
  id: string;
  author: string;
  city: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verifiedTraveler: boolean;
}

export interface Destination {
  id: string;
  slug: string;
  name: string;
  state: string;
  region: 'North' | 'South' | 'East' | 'West' | 'Central' | 'North-East';
  destinationType?: 'Heritage' | 'Nature' | 'Spiritual' | 'Hill Station' | 'Coastal' | 'Adventure' | 'Cultural' | 'Desert';
  tagline: string;
  description: string;
  imageUrl: string;
  galleryImages?: string[];
  thumbnailUrl: string;
  category: TravelInterest;
  secondaryCategories: TravelInterest[];
  location: GeoLocation;
  estimatedBudget: BudgetTier;
  approxCostPerDayInr: number;
  idealDurationDays: number;
  bestTimeToVisit: string;
  peakSeasonMonths: string[];
  dataClassification: DataClassification;
  source: SourceAttribution;
  highlights: string[];
  culturalTips?: string[];
  localFoods?: string[];
  accessibility?: {
    nearestAirport?: string;
    nearestRailway?: string;
  };
  ratingsSummary?: {
    average: number;
    count: number;
    source: string;
  };
  isFeatured?: boolean;
  isHiddenGem?: boolean;
  // Part 2B Detail Page Sections
  matchExplanation?: string;
  matchScore?: number;
  whyVisitReasons?: {
    title: string;
    explanation: string;
    dimension: 'interests' | 'budget' | 'duration' | 'group' | 'pace' | 'distance' | 'season' | 'accessibility';
    relevanceBadge: string;
  }[];
  thingsToDo?: ThingToDoItem[];
  foodToTry?: FoodToTryItem[];
  howToReach?: HowToReachOption[];
  localTransport?: LocalTransportItem[];
  accessibilityDetails?: {
    wheelchairRamps: string;
    brailleAudioGuides: string;
    stepCountCaution: string;
    accessibleTransit: string;
    isVerified: boolean;
  };
  safetyInfo?: {
    emergencyContacts: { service: string; number: string }[];
    womenTravelerTips: string[];
    nightSafetyLevel: string;
    healthAdvisories: string[];
    altitudeAdvisory?: string;
  };
  faqs?: DestinationFAQ[];
  reviews?: DestinationReview[];
  budgetBreakdown?: {
    stayPerNightInr: number;
    mealsPerDayInr: number;
    localTransitPerDayInr: number;
    sightseeingPerDayInr: number;
    miscDailyInr: number;
  };
}

export type ExperienceDiscoveryType =
  | 'Sightseeing'
  | 'Trekking'
  | 'Wildlife Safari'
  | 'Local Food Walk'
  | 'Cooking Class'
  | 'Museum Visit'
  | 'Temple Visit'
  | 'Heritage Walk'
  | 'Adventure Sports'
  | 'Water Activities'
  | 'Photography Tour'
  | 'Cultural Workshop'
  | 'Festival Participation'
  | 'Village Experience'
  | 'Shopping Tour'
  | 'Wellness Activity'
  | 'Night Market'
  | 'Family Activity';

export interface ExperienceReview {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
}

export interface Experience {
  id: string;
  title: string;
  experienceType?: ExperienceDiscoveryType;
  destinationId: string;
  destinationName: string;
  category: TravelInterest;
  description: string;
  imageUrl: string;
  galleryImages?: string[];
  durationMinutes: number;
  approxPriceInr: number;
  budgetTier: BudgetTier;
  location: GeoLocation;
  distanceKm?: number; // calculated relative to user's selected location
  isOpenNow?: boolean;
  timingDetails?: string;
  dataClassification: DataClassification;
  source: SourceAttribution;
  matchScore?: number; // 0-100% personalized match
  matchReasons?: string[];
  accessibilityFeatures?: string[];
  
  // Section 5 & 6 Experience Discovery & Details fields
  intensity?: 'Easy' | 'Moderate' | 'Challenging' | 'Rugged';
  ageSuitability?: string;
  accessibilityStatus?: string;
  availabilityStatus?: 'Available Today' | 'Seasonal' | 'Requires Advance Permit' | 'Limited Slots' | 'Unavailable Today';
  whatToExpect?: string[];
  meetingPoint?: string;
  includedItems?: string[];
  excludedItems?: string[];
  requirements?: string[];
  ageRestrictions?: string;
  weatherDependency?: string;
  openingSchedule?: string;
  bookingInfo?: string;
  cancellationPolicy?: string;
  reviews?: ExperienceReview[];
  relatedExperienceIds?: string[];
}

export interface TouristAttraction {
  id: string;
  name: string;
  destinationName: string;
  category: string;
  description: string;
  imageUrl: string;
  location: GeoLocation;
  distanceKm?: number;
  entryFeeInr: number;
  isFree?: boolean;
  timings?: string;
  isOpenNow?: boolean;
  openingHoursVerified: boolean; // Only show "Open Now" when true!
  accessibilityFeatures?: string[];
  accessibilityVerified?: boolean;
  weatherSuitability?: string[];
  crowdLevel?: 'Quiet' | 'Moderate' | 'Busy';
  ratingsSummary?: { average: number; count: number };
  dataClassification: DataClassification;
  source: SourceAttribution;
  lastUpdatedDate: string;
}

export type FoodCategory =
  | 'Street Food'
  | 'Regional Cuisine'
  | 'Vegetarian'
  | 'Non-vegetarian'
  | 'Vegan'
  | 'Jain Food'
  | 'Halal Food'
  | 'Sweets'
  | 'Breakfast'
  | 'Thali'
  | 'Cafés'
  | 'Fine Dining'
  | 'Local Specialties'
  | 'Budget Food'
  | 'Night Food Markets';

export interface FoodSignatureDish {
  name: string;
  priceInr: number;
  isPriceEstimated: boolean; // clearly distinguish estimated vs verified prices
  description?: string;
  isVegetarian?: boolean;
}

export interface FoodReview {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
}

export interface FoodOpeningHours {
  day: string;
  hours: string;
  isVerified: boolean;
}

export interface FoodPlace {
  id: string;
  name: string;
  destinationName: string;
  cuisineType: string;
  foodCategory?: FoodCategory;
  specialtyDishes: string[];
  signatureDishesDetailed?: FoodSignatureDish[];
  dietaryPreference: 'Pure Veg' | 'Vegetarian' | 'Non-Veg & Veg' | 'Jain Options Available' | 'Vegan' | 'Halal';
  dietaryOptions?: string[]; // e.g. ['Pure Veg', 'No Onion No Garlic on request']
  dietaryCertificationVerified?: boolean; // Do not claim certification without verified information!
  priceForTwoInr: number;
  isPriceEstimated?: boolean; // Clearly distinguish estimated vs verified
  priceRange?: string; // e.g. '₹150 - ₹300 per person'
  budgetTier: BudgetTier;
  imageUrl: string;
  galleryImages?: string[];
  location: GeoLocation;
  distanceKm?: number;
  timings?: string;
  openingHoursDetailed?: FoodOpeningHours[];
  isOpenNow?: boolean;
  openingHoursVerified: boolean;
  ratingsSummary?: { average: number; count: number };
  dataClassification: DataClassification;
  source: SourceAttribution;
  lastUpdatedDate: string;
  directions?: string;
  reviews?: FoodReview[];
  nearbyFoodPlaceIds?: string[];
}

export interface StayPlace {
  id: string;
  name: string;
  stayType: 'Heritage Haveli' | 'Homestay' | 'Eco Lodge' | 'Boutique Hotel' | 'Backpacker Hostel' | 'Resort';
  destinationName: string;
  description: string;
  pricePerNightInr: number;
  budgetTier: BudgetTier;
  imageUrl: string;
  location: GeoLocation;
  distanceKm?: number;
  amenities: string[];
  accessibilityFeatures?: string[];
  accessibilityVerified?: boolean;
  ratingsSummary?: { average: number; count: number };
  dataClassification: DataClassification;
  source: SourceAttribution;
  lastUpdatedDate: string;
}

export type SearchItemType =
  | 'destination'
  | 'city'
  | 'state'
  | 'attraction'
  | 'experience'
  | 'food'
  | 'event'
  | 'stay'
  | 'activity';

export interface UnifiedSearchItem {
  id: string;
  type: SearchItemType;
  name: string;
  subtitle?: string;
  category: string;
  location: GeoLocation;
  imageUrl: string;
  description: string;
  distanceKm?: number;
  matchScore?: number;
  matchReasons?: string[];
  estimatedBudget?: string;
  approxPriceInr?: number;
  suggestedDuration?: string;
  durationMinutes?: number;
  rating?: number;
  ratingCount?: number;
  isOpenNow?: boolean;
  openingHoursVerified?: boolean;
  accessibilityFeatures?: string[];
  accessibilityVerified?: boolean;
  travelStyles?: string[];
  weatherSuitability?: string[];
  crowdLevel?: string;
  dataClassification: DataClassification;
  source: SourceAttribution;
  lastUpdatedDate: string;
  isSaved?: boolean;
  isHiddenGem?: boolean;
}

export interface ExploreFilters {
  searchQuery?: string;
  locationScope: 'current' | 'selected_city' | 'selected_state' | 'all_india' | 'custom_radius';
  customRadiusKm?: number;
  budgetBrackets: string[]; // 'free', 'under_500', '500_2000', '2000_5000', '5000_10000', '10000_25000', 'premium', 'custom'
  durations: string[]; // 'few_hours', 'half_day', 'one_day', 'weekend', '3_5_days', 'one_week', 'long_vacation'
  travelStyles: string[];
  categories: string[];
  groupTypes: string[];
  accessibility: string[];
  weather: string[];
  season: string[];
  crowdLevel: string[];
  minRating?: number;
  onlyOpenNow?: boolean;
  foodPreferences: string[];
  transportTypes: string[];
  experienceIntensity: string[];
  hiddenGemsOnly?: boolean;
}

export type SortOption =
  | 'relevance'
  | 'match'
  | 'distance'
  | 'budget_asc'
  | 'budget_desc'
  | 'duration'
  | 'rating'
  | 'freshness';

export interface EventTicketInfo {
  type: string;
  priceInr: number;
  isFree: boolean;
  bookingStatus: 'Free Entry' | 'Pass Required at Venue' | 'Online Registration' | 'Paid Tickets' | 'Information not verified';
  bookingUrl?: string;
}

export interface SeasonalEvent {
  id: string;
  name: string;
  eventName?: string;
  eventType?: string;
  destinationName: string;
  state: string;
  city?: string;
  location?: GeoLocation;
  category: 'Festival' | 'Cultural Fair' | 'Music & Arts' | 'Nature & Seasonal' | 'Spiritual Gathering';
  description: string;
  imageUrl: string;
  galleryImages?: string[];
  startDateApprox: string;
  endDateApprox: string;
  startDate?: string;
  endDate?: string;
  time?: string;
  organizer?: string;
  dateUncertain: boolean;
  tentative?: boolean;
  uncertaintyDisclaimer?: string;
  ticketInfo?: EventTicketInfo;
  officialSource?: {
    name: string;
    url?: string;
    verified: boolean;
  };
  verificationStatus?: VerificationLabelType;
  lastUpdatedDate?: string;
  dataClassification: DataClassification;
  source: SourceAttribution;
  highlights: string[];
}

export interface WeatherSnapshot {
  city: string;
  temperatureC: number;
  condition: string;
  humidityPercent: number;
  windSpeedKmh: number;
  precipitationProbability: number;
  uvIndex?: number;
  forecastSummary: string;
  outdoorSuitability: 'Excellent' | 'Favorable' | 'Challenging' | 'Indoor Preferred';
  tip: string;
  timestamp: string;
  dataClassification: DataClassification;
  source: string;
  isFallback?: boolean;
}

export interface RecommendationExplanation {
  overallMatchScore: number;
  matchedInterests: string[];
  matchedBudget: string;
  matchedPace: string;
  matchedParty: string;
  reasonText: string;
  criteriaBreakdown: {
    interestWeight: number;
    budgetWeight: number;
    distanceWeight: number;
    seasonalityWeight: number;
  };
}

export interface RecommendationItem {
  id: string;
  type: 'destination' | 'experience' | 'hidden_gem';
  title: string;
  subtitle: string;
  imageUrl: string;
  category: TravelInterest;
  location: GeoLocation;
  estimatedBudget: BudgetTier;
  idealDuration: string;
  distanceKm?: number;
  dataClassification: DataClassification;
  source: SourceAttribution;
  matchScore: number;
  explanation: RecommendationExplanation;
  isSaved?: boolean;
  isNotInterested?: boolean;
}

export interface SavedItem {
  id: string;
  userId: string;
  itemId: string;
  itemType: 'destination' | 'experience' | 'event';
  title: string;
  imageUrl: string;
  city: string;
  category: string;
  savedAt: string;
}

export interface Trip {
  id: string;
  userId: string;
  title: string;
  destinationName: string;
  startDate: string;
  endDate: string;
  daysCount: number;
  budgetTier: BudgetTier;
  party: string;
  progressPercent: number;
  status: 'planning' | 'confirmed' | 'completed';
  nextAction: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssistantMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  dataClassification?: DataClassification;
  citations?: string[];
  suggestedFollowUps?: string[];
}

export type ItineraryActivityType =
  | 'sightseeing'
  | 'experience'
  | 'food'
  | 'event'
  | 'free_time'
  | 'notes';

export interface ItineraryActivity {
  id: string;
  timeSlot: 'morning' | 'afternoon' | 'evening';
  activityType?: ItineraryActivityType;
  title: string;
  location: string;
  durationMinutes: number;
  estimatedCostInr: number;
  notes?: string;
  isCompleted?: boolean;
  itemReferenceId?: string;
  itemType?: 'destination' | 'experience' | 'food' | 'event';
  dataClassification: DataClassification;
}

export interface DayItinerary {
  dayNumber: number;
  date: string;
  theme: string;
  activities: ItineraryActivity[];
}

export interface PackingItem {
  id: string;
  item: string;
  isPacked: boolean;
  category: string;
}

export interface TripPlan {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  pace: string;
  party: string;
  travelersCount?: number;
  travelStyle?: string;
  interests?: string[];
  budgetTier?: BudgetTier;
  budgetTotalInr: number;
  days: DayItinerary[];
  packingList: PackingItem[];
  notes?: string;
  isCompleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

