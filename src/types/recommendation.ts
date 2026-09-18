import { DataClassification } from './index';
import { BudgetTier, TravelInterest, TravelDuration, TravelParty, TravelPace, AccessibilityPreference, UserPreferences } from './auth';
import { GeoLocation, SourceAttribution, VerificationLabelType, Destination, Experience, FoodPlace, SeasonalEvent } from './travel';

export type CandidateSourceType =
  | 'official'
  | 'verified_provider'
  | 'partner_api'
  | 'internal_database'
  | 'community';

export interface CandidateSourceInfo {
  candidateId: string;
  sourceType: CandidateSourceType;
  sourceName: string;
  sourceUrl?: string;
  verificationStatus: VerificationLabelType;
  lastVerifiedAt: string;
  dataClassification: DataClassification;
  confidenceScore: number; // 0-100
}

export type CandidateItemType = 'destination' | 'experience' | 'food' | 'event' | 'hidden_gem' | 'attraction';

export interface RecommendationCandidate {
  candidateId: string;
  itemType: CandidateItemType;
  title: string;
  subtitle?: string;
  category: string;
  secondaryCategories?: string[];
  location: GeoLocation;
  distanceKm?: number;
  estimatedBudget: BudgetTier;
  approximateCostInr?: number;
  durationHours?: number;
  durationDays?: number;
  imageUrl: string;
  sourceInfo: CandidateSourceInfo;
  isAvailable: boolean;
  isIndoor?: boolean;
  bestSeason?: string[];
  weatherSuitability?: string[];
  accessibilityFeatures?: string[];
  partySuitability?: TravelParty[];
  rawItem: Destination | Experience | FoodPlace | SeasonalEvent | any;
}

export interface HardConstraints {
  budgetCeiling?: BudgetTier;
  maxCostInr?: number;
  accessibilityRequirements?: AccessibilityPreference[];
  requireWheelchair?: boolean;
  seniorFriendlyOnly?: boolean;
  maxDistanceKm?: number;
  minDurationDays?: number;
  maxDurationDays?: number;
  partySuitability?: TravelParty[];
  foodPreference?: string;
  onlyVerified?: boolean;
  allowUnavailable?: boolean;
  selectedCategories?: string[];
}

export interface ScoringWeights {
  interestWeight: number; // default 25
  budgetWeight: number; // default 15
  timeWeight: number; // default 15
  distanceWeight: number; // default 10
  availabilityWeight: number; // default 10
  qualityWeight: number; // default 10
  behaviorWeight: number; // default 5
  contextWeight: number; // default 5
  diversityWeight: number; // default 5
}

export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  interestWeight: 25,
  budgetWeight: 15,
  timeWeight: 15,
  distanceWeight: 10,
  availabilityWeight: 10,
  qualityWeight: 10,
  behaviorWeight: 5,
  contextWeight: 5,
  diversityWeight: 5,
};

export interface ScoringBreakdown {
  interestScore: number;
  budgetScore: number;
  timeScore: number;
  distanceScore: number;
  availabilityScore: number;
  qualityScore: number;
  behaviorScore: number;
  contextScore: number;
  diversityScore: number;
  finalScore: number; // 0 to 100
}

export interface RecommendationExplanationDetail {
  overallMatchScore: number; // 0 to 100
  matchedReasons: string[];
  seasonalFit: string;
  crowdSuitability: string;
  distanceText: string;
  budgetFitText: string;
  partyFitText: string;
  paceFitText: string;
  freshnessLabel: VerificationLabelType;
  source: SourceAttribution;
  scoringBreakdown?: ScoringBreakdown;
}

export interface ScoredRecommendation {
  id: string;
  candidateId: string;
  itemType: CandidateItemType;
  title: string;
  subtitle: string;
  imageUrl: string;
  category: string;
  location: GeoLocation;
  distanceKm?: number;
  estimatedBudget: BudgetTier;
  approximateCostInr?: number;
  idealDuration: string;
  dataClassification: DataClassification;
  source: SourceAttribution;
  verificationStatus: VerificationLabelType;
  matchScore: number; // 0 to 100 percentage
  explanation: RecommendationExplanationDetail;
  isSaved?: boolean;
  isLiked?: boolean;
  rawItem: any;
}

export type FeedbackActionType =
  | 'save'
  | 'remove_save'
  | 'like'
  | 'dislike'
  | 'not_interested'
  | 'hide_similar'
  | 'already_visited'
  | 'too_expensive'
  | 'too_far'
  | 'not_accessible'
  | 'wrong_season'
  | 'wrong_travel_style'
  | 'undo';

export interface RecommendationFeedback {
  id: string;
  userId: string;
  targetId: string;
  targetType: CandidateItemType;
  action: FeedbackActionType;
  reason?: string;
  createdAt: string;
}

export interface UserBehaviorProfile {
  viewedItemIds: string[];
  savedItemIds: string[];
  likedItemIds: string[];
  dislikedItemIds?: string[];
  rejectedItemIds: string[];
  hiddenCategories: string[];
  alreadyVisitedIds: string[];
  previousSearches?: string[];
  feedbackHistory: RecommendationFeedback[];
  completedTripsCount: number;
  activeItineraryContext?: {
    destinationName?: string;
    days?: number;
    dates?: string;
    budgetTotalInr?: number;
  };
}

export type AssistantQueryIntent =
  | 'Destination Discovery'
  | 'Activity Discovery'
  | 'Food Discovery'
  | 'Event Discovery'
  | 'Itinerary Planning'
  | 'Budget Planning'
  | 'Route Planning'
  | 'Comparison'
  | 'Weather Query'
  | 'Nearby Search'
  | 'Booking Question'
  | 'Accessibility Question'
  | 'General Travel Information'
  | 'Unsupported Request';

export interface AssistantEntityExtraction {
  destination?: string;
  originCity?: string;
  activity?: string;
  cuisine?: string;
  durationDays?: number;
  budgetTier?: BudgetTier;
  season?: string;
  party?: TravelParty;
  pace?: TravelPace;
  accessibility?: AccessibilityPreference;
}

export interface AssistantCardPayload {
  type:
    | 'destination'
    | 'experience'
    | 'food'
    | 'event'
    | 'budget_summary'
    | 'itinerary_preview'
    | 'route_summary'
    | 'clarification'
    | 'comparison';
  title?: string;
  data: any;
}

export interface ClarifyingQuestionPayload {
  question: string;
  options: string[];
  contextKey: string;
}

export interface AssistantChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  intent?: AssistantQueryIntent;
  entities?: AssistantEntityExtraction;
  sources?: SourceAttribution[];
  citations?: string[];
  classification?: DataClassification;
  cardPayloads?: AssistantCardPayload[];
  clarifyingQuestion?: ClarifyingQuestionPayload;
  feedback?: 'positive' | 'negative';
  isError?: boolean;
  isFallback?: boolean;
  warningNote?: string;
}

export interface ConversationalMemoryContext {
  currentTrip?: {
    destination?: string;
    startDate?: string;
    endDate?: string;
    days?: number;
    budgetInr?: number;
  };
  selectedDates?: string;
  budget?: string;
  destination?: string;
  groupType?: string;
  activePreferences?: Partial<UserPreferences>;
  clarificationState?: Record<string, string>;
}
