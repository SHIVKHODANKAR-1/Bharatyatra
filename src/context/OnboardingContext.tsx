import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserPreferences, TravelInterest, BudgetTier, TravelDuration, TravelParty, TravelPace, AccessibilityPreference, LanguageCode } from '../types/auth';

const DEFAULT_PREFERENCES: UserPreferences = {
  language: 'en',
  selectedCity: 'Nagpur', // Zero-mile marker center of India as thoughtful default
  useCurrentLocation: false,
  latitude: 21.1458,
  longitude: 79.0882,
  interests: ['heritage', 'nature', 'food'],
  budget: 'moderate',
  duration: 'weekend',
  party: 'solo',
  pace: 'balanced',
  accessibility: [],
  weatherAwareRecommendations: true,
  onboardingCompleted: false,
  onboardingStep: 1,
};

const STORAGE_KEY = 'bharat_yatra_preferences';

interface OnboardingContextType {
  preferences: UserPreferences;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  completeOnboarding: () => void;
  skipOnboarding: () => void;
  resetPersonalization: () => void;
  undoReset: () => void;
  canUndoReset: boolean;
  isOnboardingOpen: boolean;
  openOnboarding: (step?: number) => void;
  closeOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) };
      }
    } catch {
      // fallback
    }
    return DEFAULT_PREFERENCES;
  });

  const [previousPreferences, setPreviousPreferences] = useState<UserPreferences | null>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch {
      // ignore
    }
  }, [preferences]);

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...updates }));
  };

  const setStep = (step: number) => {
    setPreferences((prev) => ({ ...prev, onboardingStep: Math.min(Math.max(step, 1), 10) }));
  };

  const nextStep = () => {
    setPreferences((prev) => {
      const next = prev.onboardingStep + 1;
      if (next > 10) {
        return { ...prev, onboardingCompleted: true };
      }
      return { ...prev, onboardingStep: next };
    });
  };

  const prevStep = () => {
    setPreferences((prev) => ({
      ...prev,
      onboardingStep: Math.max(prev.onboardingStep - 1, 1),
    }));
  };

  const completeOnboarding = () => {
    setPreferences((prev) => ({ ...prev, onboardingCompleted: true, onboardingStep: 10 }));
    setIsOnboardingOpen(false);
  };

  const skipOnboarding = () => {
    setPreferences((prev) => ({ ...prev, onboardingCompleted: true }));
    setIsOnboardingOpen(false);
  };

  const resetPersonalization = () => {
    setPreviousPreferences(preferences);
    setPreferences({
      ...DEFAULT_PREFERENCES,
      selectedCity: preferences.selectedCity,
      language: preferences.language,
      onboardingCompleted: true,
      onboardingStep: 1,
    });
  };

  const undoReset = () => {
    if (previousPreferences) {
      setPreferences(previousPreferences);
      setPreviousPreferences(null);
    }
  };

  const openOnboarding = (step = 1) => {
    setStep(step);
    setIsOnboardingOpen(true);
  };

  const closeOnboarding = () => {
    setIsOnboardingOpen(false);
  };

  return (
    <OnboardingContext.Provider
      value={{
        preferences,
        updatePreferences,
        setStep,
        nextStep,
        prevStep,
        completeOnboarding,
        skipOnboarding,
        resetPersonalization,
        undoReset,
        canUndoReset: previousPreferences !== null,
        isOnboardingOpen,
        openOnboarding,
        closeOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = (): OnboardingContextType => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
