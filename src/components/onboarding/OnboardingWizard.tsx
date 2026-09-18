import React from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Globe,
  MapPin,
  Heart,
  Wallet,
  Clock,
  Users,
  Compass,
  Accessibility,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useOnboarding } from '../../context/OnboardingContext';
import { useI18n } from '../../i18n/index';
import { useAnalytics } from '../../context/AnalyticsContext';
import { Button } from '../common/Button';
import { TravelInterest, BudgetTier, TravelDuration, TravelParty, TravelPace, AccessibilityPreference, LanguageCode } from '../../types/auth';
import { MAJOR_INDIAN_CITIES } from '../../data/categories';

export const OnboardingWizard: React.FC = () => {
  const {
    preferences,
    updatePreferences,
    nextStep,
    prevStep,
    completeOnboarding,
    skipOnboarding,
    isOnboardingOpen,
    closeOnboarding,
  } = useOnboarding();

  const { language, setLanguage, t } = useI18n();
  const { trackEvent } = useAnalytics();

  if (!isOnboardingOpen) return null;

  const currentStep = preferences.onboardingStep;

  const handleInterestToggle = (interest: TravelInterest) => {
    const current = preferences.interests;
    const next = current.includes(interest)
      ? current.filter((i) => i !== interest)
      : [...current, interest];
    updatePreferences({ interests: next });
  };

  const handleAccessibilityToggle = (pref: AccessibilityPreference) => {
    const current = preferences.accessibility;
    const next = current.includes(pref)
      ? current.filter((p) => p !== pref)
      : [...current, pref];
    updatePreferences({ accessibility: next });
  };

  const handleNext = () => {
    trackEvent('onboarding_step_completed', { step: currentStep });
    if (currentStep === 10) {
      completeOnboarding();
    } else {
      nextStep();
    }
  };

  const handleSkip = () => {
    trackEvent('onboarding_skipped', { step: currentStep });
    skipOnboarding();
  };

  const interestOptions: { id: TravelInterest; label: string; icon: string }[] = [
    { id: 'heritage', label: 'Heritage & Forts', icon: '🏰' },
    { id: 'nature', label: 'Nature & Forests', icon: '🌲' },
    { id: 'spiritual', label: 'Spiritual & Temples', icon: '🕉️' },
    { id: 'food', label: 'Culinary & Street Food', icon: '🍲' },
    { id: 'mountains', label: 'Himalayas & Ghats', icon: '⛰️' },
    { id: 'beaches', label: 'Coastal & Beaches', icon: '🏖️' },
    { id: 'wildlife', label: 'Wildlife & Safaris', icon: '🐅' },
    { id: 'adventure', label: 'Trekking & Rafting', icon: '🧗' },
    { id: 'culture', label: 'Local Tribes & Arts', icon: '🎭' },
    { id: 'festivals', label: 'Festivals & Melas', icon: '🪔' },
    { id: 'shopping', label: 'Artisan Bazaars', icon: '🛍️' },
    { id: 'photography', label: 'Landscape Photography', icon: '📸' },
    { id: 'history', label: 'Ancient Archaeology', icon: '🏛️' },
    { id: 'family', label: 'Family Play & Parks', icon: '🎡' },
    { id: 'nightlife', label: 'Cafes & Night Bazaars', icon: '☕' },
  ];

  const budgetOptions: { id: BudgetTier; label: string; desc: string; approx: string }[] = [
    { id: 'budget', label: 'Budget Traveler', desc: 'Hostels, dhabas, local trains and buses', approx: '₹1,000 – ₹2,000 / day' },
    { id: 'moderate', label: 'Moderate Explorer', desc: 'Boutique homestays, AC travel, local guided walks', approx: '₹2,500 – ₹5,000 / day' },
    { id: 'premium', label: 'Premium Leisure', desc: 'Heritage havelis, private cabs, experiential tours', approx: '₹5,500 – ₹12,000 / day' },
    { id: 'luxury', label: 'Palace Luxury', desc: 'Royal palace hotels, luxury trains, bespoke curators', approx: '₹15,000+ / day' },
  ];

  const durationOptions: { id: TravelDuration; label: string; desc: string }[] = [
    { id: 'one_day', label: 'One Day', desc: 'Same-day sunrise to sunset day trips' },
    { id: 'weekend', label: 'Weekend Trip', desc: '2 to 3 days quick recharge getaway' },
    { id: 'three_to_five_days', label: '3 to 5 Days', desc: 'Balanced circuit exploring 1-2 destinations' },
    { id: 'one_week', label: 'One Week', desc: '7 days in-depth state or mountain road trip' },
    { id: 'more_than_week', label: 'More than a Week', desc: 'Deep multi-region cultural expedition' },
  ];

  const partyOptions: { id: TravelParty; label: string; icon: string }[] = [
    { id: 'solo', label: 'Solo Traveler', icon: '🎒' },
    { id: 'couple', label: 'Couple / Partners', icon: '💑' },
    { id: 'family', label: 'Family with Kids', icon: '👨‍👩‍👧‍👦' },
    { id: 'friends', label: 'Friends Squad', icon: '🏕️' },
    { id: 'group', label: 'Large Group / Tour', icon: '🚌' },
    { id: 'business', label: 'Bleisure / Work Trip', icon: '💼' },
  ];

  const paceOptions: { id: TravelPace; label: string; desc: string; icon: string }[] = [
    { id: 'relaxed', label: 'Relaxed & Unhurried', desc: '1 or 2 sites per day with generous leisure and tea time', icon: '☕' },
    { id: 'balanced', label: 'Balanced Rhythm', desc: 'Morning exploration, afternoon rest, sunset vantage', icon: '⚖️' },
    { id: 'packed', label: 'Action-Packed', desc: 'Maximum sightseeing, early dawn starts, multiple spots', icon: '⚡' },
  ];

  const accessibilityOptions: { id: AccessibilityPreference; label: string; desc: string }[] = [
    { id: 'less_walking', label: 'Less Walking / Minimal Steps', desc: 'Short walks from car drops, avoiding steep climbs' },
    { id: 'wheelchair_friendly', label: 'Wheelchair Accessible Routes', desc: 'Ramps, step-free access, and paved pathways' },
    { id: 'accessible_transport', label: 'Accessible Vehicles & Cabs', desc: 'Low-floor vehicles and assistance boarding' },
    { id: 'senior_friendly', label: 'Senior-Friendly Pace & Facilities', desc: 'Shaded rest benches, clean amenities, mild terrain' },
    { id: 'family_friendly', label: 'Child & Stroller Friendly', desc: 'Family rooms, stroller paths, safe railings' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/70 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Traveler Onboarding Survey"
    >
      <div className="relative w-full max-w-2xl bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 p-6 sm:p-8 flex flex-col max-h-[90vh]">
        {/* Top Header: Progress & Close/Skip */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#D9531E] uppercase tracking-wider">
              {t.onboarding.step} {currentStep} {t.onboarding.of} 10
            </span>
          </div>

          <div className="flex items-center gap-3">
            {currentStep < 10 && (
              <button
                type="button"
                onClick={handleSkip}
                className="text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
              >
                {t.common.skip}
              </button>
            )}
            <button
              type="button"
              onClick={closeOnboarding}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-stone-100 dark:bg-stone-800 h-1.5 rounded-full overflow-hidden my-3">
          <div
            className="bg-[#D9531E] h-full transition-all duration-300 rounded-full"
            style={{ width: `${(currentStep / 10) * 100}%` }}
          />
        </div>

        {/* Dynamic Step Content */}
        <div className="flex-1 overflow-y-auto py-3 space-y-5 pr-1">
          {/* STEP 1 — Welcome */}
          {currentStep === 1 && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-[#D9531E]/10 text-[#D9531E] flex items-center justify-center mx-auto shadow-sm">
                <Sparkles className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100">
                  {t.onboarding.welcomeTitle}
                </h2>
                <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                  {t.onboarding.welcomeDesc}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/80 dark:border-stone-700/80 max-w-md mx-auto text-left text-xs text-stone-600 dark:text-stone-300 space-y-1.5">
                <div className="font-semibold text-stone-800 dark:text-stone-200">
                  Our Non-Negotiable Transparency Pledge:
                </div>
                <div>• Zero fake sponsored rankings or inflated tourist traps.</div>
                <div>• Honest weather, timing, and travel accessibility data.</div>
                <div>• Respectful Indian cultural and ecological guidelines.</div>
              </div>
            </div>
          )}

          {/* STEP 2 — Language */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100">
                  {t.onboarding.langTitle}
                </h2>
                <p className="text-xs sm:text-sm text-stone-500">{t.onboarding.langDesc}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { code: 'en' as LanguageCode, label: 'English', desc: 'Default Interface' },
                  { code: 'hi' as LanguageCode, label: 'हिन्दी (Hindi)', desc: 'देवनागरी इंटरफेस' },
                  { code: 'mr' as LanguageCode, label: 'मराठी (Marathi)', desc: 'स्थानिक भाषा' },
                ].map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => {
                      setLanguage(l.code);
                      updatePreferences({ language: l.code });
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      language === l.code
                        ? 'border-[#D9531E] bg-[#D9531E]/5 text-[#D9531E] ring-2 ring-[#D9531E]/20'
                        : 'border-stone-200 dark:border-stone-800 hover:border-stone-400'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-base">{l.label}</span>
                      {language === l.code && <Check className="w-4 h-4 text-[#D9531E]" />}
                    </div>
                    <div className="text-xs text-stone-500 mt-1">{l.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3 — Location */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100">
                  {t.onboarding.locationTitle}
                </h2>
                <p className="text-xs sm:text-sm text-stone-500">{t.onboarding.locationDesc}</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto pr-1">
                {MAJOR_INDIAN_CITIES.map((c) => {
                  const isSelected = preferences.selectedCity === c.name;
                  return (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() =>
                        updatePreferences({
                          selectedCity: c.name,
                          latitude: c.latitude,
                          longitude: c.longitude,
                        })
                      }
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-[#D9531E] bg-[#D9531E]/10 text-[#D9531E] font-semibold'
                          : 'border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      <div className="text-sm font-medium">{c.name}</div>
                      <div className="text-[11px] text-stone-400">{c.state}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4 — Interests */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100">
                  {t.onboarding.interestsTitle}
                </h2>
                <p className="text-xs sm:text-sm text-stone-500">{t.onboarding.interestsDesc}</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
                {interestOptions.map((item) => {
                  const isSelected = preferences.interests.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleInterestToggle(item.id)}
                      className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-[#D9531E] bg-[#D9531E]/10 text-[#D9531E] ring-1 ring-[#D9531E]'
                          : 'border-stone-200 dark:border-stone-800 hover:border-stone-400 text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{item.icon}</span>
                        <span className="text-xs font-semibold">{item.label}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#D9531E]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5 — Budget */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100">
                  {t.onboarding.budgetTitle}
                </h2>
                <p className="text-xs sm:text-sm text-stone-500">{t.onboarding.budgetDesc}</p>
              </div>
              <div className="space-y-2.5">
                {budgetOptions.map((b) => {
                  const isSelected = preferences.budget === b.id;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => updatePreferences({ budget: b.id })}
                      className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-[#D9531E] bg-[#D9531E]/10 ring-1 ring-[#D9531E]'
                          : 'border-stone-200 dark:border-stone-800 hover:border-stone-400'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-sm text-stone-900 dark:text-stone-100">
                          {b.label}
                        </div>
                        <div className="text-xs text-stone-500">{b.desc}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold px-2 py-1 rounded bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                          {b.approx}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 6 — Travel Duration */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100">
                  {t.onboarding.durationTitle}
                </h2>
                <p className="text-xs sm:text-sm text-stone-500">{t.onboarding.durationDesc}</p>
              </div>
              <div className="space-y-2.5">
                {durationOptions.map((d) => {
                  const isSelected = preferences.duration === d.id;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => updatePreferences({ duration: d.id })}
                      className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-[#D9531E] bg-[#D9531E]/10 ring-1 ring-[#D9531E]'
                          : 'border-stone-200 dark:border-stone-800 hover:border-stone-400'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-sm text-stone-900 dark:text-stone-100">
                          {d.label}
                        </div>
                        <div className="text-xs text-stone-500">{d.desc}</div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-[#D9531E]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 7 — Travel Party */}
          {currentStep === 7 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100">
                  {t.onboarding.partyTitle}
                </h2>
                <p className="text-xs sm:text-sm text-stone-500">{t.onboarding.partyDesc}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {partyOptions.map((p) => {
                  const isSelected = preferences.party === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => updatePreferences({ party: p.id })}
                      className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-[#D9531E] bg-[#D9531E]/10 ring-1 ring-[#D9531E]'
                          : 'border-stone-200 dark:border-stone-800 hover:border-stone-400'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{p.icon}</span>
                        <span className="font-semibold text-sm text-stone-900 dark:text-stone-100">
                          {p.label}
                        </span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-[#D9531E]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 8 — Travel Pace */}
          {currentStep === 8 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100">
                  {t.onboarding.paceTitle}
                </h2>
                <p className="text-xs sm:text-sm text-stone-500">{t.onboarding.paceDesc}</p>
              </div>
              <div className="space-y-3">
                {paceOptions.map((p) => {
                  const isSelected = preferences.pace === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => updatePreferences({ pace: p.id })}
                      className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-[#D9531E] bg-[#D9531E]/10 ring-1 ring-[#D9531E]'
                          : 'border-stone-200 dark:border-stone-800 hover:border-stone-400'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{p.icon}</span>
                        <div>
                          <div className="font-bold text-sm text-stone-900 dark:text-stone-100">
                            {p.label}
                          </div>
                          <div className="text-xs text-stone-500">{p.desc}</div>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-[#D9531E]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 9 — Accessibility */}
          {currentStep === 9 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100">
                  {t.onboarding.accessibilityTitle}
                </h2>
                <p className="text-xs sm:text-sm text-stone-500">{t.onboarding.accessibilityDesc}</p>
              </div>
              <div className="space-y-2.5">
                {accessibilityOptions.map((acc) => {
                  const isSelected = preferences.accessibility.includes(acc.id);
                  return (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => handleAccessibilityToggle(acc.id)}
                      className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-[#D9531E] bg-[#D9531E]/10 ring-1 ring-[#D9531E]'
                          : 'border-stone-200 dark:border-stone-800 hover:border-stone-400'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-sm text-stone-900 dark:text-stone-100">
                          {acc.label}
                        </div>
                        <div className="text-xs text-stone-500">{acc.desc}</div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                          isSelected
                            ? 'bg-[#D9531E] border-[#D9531E] text-white'
                            : 'border-stone-300 dark:border-stone-700'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 10 — Completion */}
          {currentStep === 10 && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h2 className="text-2xl font-black text-stone-900 dark:text-stone-100">
                  {t.onboarding.completeTitle}
                </h2>
                <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                  {t.onboarding.completeDesc}
                </p>
              </div>

              {/* Preferences Summary Card */}
              <div className="max-w-md mx-auto p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-stone-500">Starting City:</span>
                  <span className="font-semibold text-stone-800 dark:text-stone-200">{preferences.selectedCity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Interests Selected:</span>
                  <span className="font-semibold text-stone-800 dark:text-stone-200">{preferences.interests.join(', ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Budget Tier:</span>
                  <span className="font-semibold capitalize text-stone-800 dark:text-stone-200">{preferences.budget}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Travel Pace:</span>
                  <span className="font-semibold capitalize text-stone-800 dark:text-stone-200">{preferences.pace}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-3">
          {currentStep > 1 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={prevStep}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              {t.common.back}
            </Button>
          ) : (
            <div />
          )}

          <Button
            variant="primary"
            size="md"
            onClick={handleNext}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            {currentStep === 10 ? t.onboarding.finishCta : t.common.next}
          </Button>
        </div>
      </div>
    </div>
  );
};
