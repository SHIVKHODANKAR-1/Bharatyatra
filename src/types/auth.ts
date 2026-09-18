import { UserRole } from './index';

export type LanguageCode = 'en' | 'hi' | 'mr';

export type TravelInterest =
  | 'nature'
  | 'history'
  | 'heritage'
  | 'food'
  | 'adventure'
  | 'shopping'
  | 'spiritual'
  | 'beaches'
  | 'mountains'
  | 'wildlife'
  | 'art'
  | 'photography'
  | 'nightlife'
  | 'family'
  | 'culture'
  | 'wellness'
  | 'festivals';

export type BudgetTier = 'budget' | 'moderate' | 'premium' | 'luxury' | 'custom';

export type TravelDuration = 'one_day' | 'weekend' | 'three_to_five_days' | 'one_week' | 'more_than_week';

export type TravelParty = 'solo' | 'couple' | 'family' | 'friends' | 'group' | 'business';

export type TravelPace = 'relaxed' | 'balanced' | 'packed';

export type TravelStyle =
  | 'cultural'
  | 'adventure'
  | 'leisure'
  | 'pilgrimage'
  | 'nature'
  | 'heritage'
  | 'wildlife';

export type AccessibilityPreference =
  | 'less_walking'
  | 'wheelchair_friendly'
  | 'accessible_transport'
  | 'senior_friendly'
  | 'family_friendly';

export interface UserPreferences {
  language: LanguageCode;
  selectedCity: string;
  useCurrentLocation: boolean;
  latitude?: number;
  longitude?: number;
  interests: TravelInterest[];
  budget: BudgetTier;
  customBudgetMin?: number;
  customBudgetMax?: number;
  duration: TravelDuration;
  party: TravelParty;
  pace: TravelPace;
  accessibility: AccessibilityPreference[];
  travelStyle?: TravelStyle;
  preferredDistanceKm?: number;
  foodPreferences?: string[];
  adventureLevel?: 'low' | 'moderate' | 'high';
  destinationTypes?: string[];
  weatherAwareRecommendations: boolean;
  onboardingCompleted: boolean;
  onboardingStep: number;
}

export interface User {
  id: string;
  uid?: string; // Compatibility alias
  fullName: string;
  displayName?: string; // Compatibility alias
  email: string;
  phone?: string;
  role: UserRole;
  avatarUrl?: string;
  photoURL?: string; // Compatibility alias
  isGuest: boolean;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  token: string;
  user: User;
  expiresAt: string;
}

export interface LoginCredentials {
  identifier: string; // Email or phone
  password?: string;
  rememberMe?: boolean;
}

export interface SignupData {
  fullName: string;
  email: string;
  phone: string;
  password?: string;
  termsAccepted: boolean;
  referralCode?: string;
}

export interface OtpVerificationState {
  target: string; // phone or email
  type: 'phone' | 'email';
  timerSeconds: number;
  attempts: number;
  isVerified: boolean;
}
