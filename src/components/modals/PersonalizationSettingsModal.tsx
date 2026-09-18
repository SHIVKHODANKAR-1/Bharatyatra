import React, { useState } from 'react';
import {
  X,
  Sliders,
  RotateCcw,
  Check,
  AlertTriangle,
  Compass,
  Utensils,
  MapPin,
  Users,
  Accessibility,
  Wallet,
  Sparkles,
  Heart,
} from 'lucide-react';
import { useOnboarding } from '../../context/OnboardingContext';
import { Button } from '../common/Button';
import {
  TravelInterest,
  BudgetTier,
  TravelParty,
  TravelStyle,
  AccessibilityPreference,
} from '../../types/auth';

interface PersonalizationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPreferencesUpdated?: () => void;
}

export const PersonalizationSettingsModal: React.FC<PersonalizationSettingsModalProps> = ({
  isOpen,
  onClose,
  onPreferencesUpdated,
}) => {
  const { preferences, updatePreferences, resetPersonalization, undoReset, canUndoReset } =
    useOnboarding();

  const [savedNotice, setSavedNotice] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'interests' | 'style' | 'diet' | 'logistics' | 'accessibility'
  >('interests');

  if (!isOpen) return null;

  const showNotification = () => {
    setSavedNotice(true);
    if (onPreferencesUpdated) onPreferencesUpdated();
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleInterestToggle = (interest: TravelInterest) => {
    const current = preferences.interests || [];
    const next = current.includes(interest)
      ? current.filter((i) => i !== interest)
      : [...current, interest];
    updatePreferences({ interests: next });
    showNotification();
  };

  const handleFoodToggle = (food: string) => {
    const current = preferences.foodPreferences || [];
    const next = current.includes(food)
      ? current.filter((f) => f !== food)
      : [...current, food];
    updatePreferences({ foodPreferences: next });
    showNotification();
  };

  const handleAccessibilityToggle = (acc: AccessibilityPreference) => {
    const current = preferences.accessibility || [];
    const next = current.includes(acc)
      ? current.filter((a) => a !== acc)
      : [...current, acc];
    updatePreferences({ accessibility: next });
    showNotification();
  };

  const allInterests: { id: TravelInterest; label: string; icon: string }[] = [
    { id: 'heritage', label: 'Heritage & Forts', icon: '🏛️' },
    { id: 'nature', label: 'Nature & Forests', icon: '🌿' },
    { id: 'spiritual', label: 'Spiritual & Temples', icon: '🪔' },
    { id: 'food', label: 'Culinary & Street Food', icon: '🍛' },
    { id: 'mountains', label: 'Himalayas & Hills', icon: '⛰️' },
    { id: 'beaches', label: 'Coastal & Beaches', icon: '🏖️' },
    { id: 'wildlife', label: 'Wildlife & Safaris', icon: '🐅' },
    { id: 'adventure', label: 'Trekking & Rafting', icon: '🧗' },
    { id: 'culture', label: 'Tribal Arts & Crafts', icon: '🎨' },
    { id: 'festivals', label: 'Festivals & Melas', icon: '🎉' },
    { id: 'photography', label: 'Photography', icon: '📷' },
    { id: 'wellness', label: 'Ayurveda & Yoga', icon: '🧘' },
  ];

  const travelStyles: { id: TravelStyle; label: string; desc: string }[] = [
    { id: 'cultural', label: 'Cultural & Historic', desc: 'Focus on history, architecture & living traditions' },
    { id: 'adventure', label: 'Adventure & Active', desc: 'Trekking, sports and outdoor explorations' },
    { id: 'leisure', label: 'Leisure & Slow Travel', desc: 'Relaxed pacing with scenic comfort' },
    { id: 'pilgrimage', label: 'Pilgrimage & Sacred', desc: 'Spiritual routes, ghats and temple ceremonies' },
    { id: 'nature', label: 'Eco-Nature & Wilderness', desc: 'Forests, waterfalls and national parks' },
  ];

  const foodOptions = [
    { id: 'veg', label: 'Vegetarian' },
    { id: 'pure_veg', label: 'Pure Veg / Satvik' },
    { id: 'jain', label: 'Jain Friendly' },
    { id: 'street_food', label: 'Street Food Explorer' },
    { id: 'local_delicacies', label: 'Regional Specialties' },
    { id: 'halal', label: 'Halal Certified' },
    { id: 'non_veg', label: 'Non-Vegetarian' },
    { id: 'coastal_seafood', label: 'Coastal Seafood' },
  ];

  const accessibilityOptions: { id: AccessibilityPreference; label: string; desc: string }[] = [
    { id: 'less_walking', label: 'Minimal Walking Required', desc: 'Vehicle drop-off proximity to main spots' },
    { id: 'wheelchair_friendly', label: 'Wheelchair Friendly', desc: 'Ramps, step-free access and broad paths' },
    { id: 'senior_friendly', label: 'Senior Friendly', desc: 'Rest benches, shaded pathways & gentle steps' },
    { id: 'family_friendly', label: 'Family & Stroller Friendly', desc: 'Child safe, stroller navigable, clean amenities' },
    { id: 'accessible_transport', label: 'Accessible Transit', desc: 'Direct battery rickshaw or golf cart shuttles' },
  ];

  const distances = [
    { val: 150, label: '< 150 km (Day Outing)' },
    { val: 350, label: '< 350 km (Weekend Trip)' },
    { val: 750, label: '< 750 km (Overnight Journey)' },
    { val: 2000, label: 'Anywhere in India' },
  ];

  const budgets: { id: BudgetTier; label: string; desc: string }[] = [
    { id: 'budget', label: 'Budget', desc: 'Dormitories, trains & local thalis (~₹1,200/day)' },
    { id: 'moderate', label: 'Moderate', desc: '3-star hotels, AC transport & verified dining (~₹3,500/day)' },
    { id: 'premium', label: 'Premium', desc: 'Heritage resorts, private cabs & curated guides (~₹7,500/day)' },
    { id: 'luxury', label: 'Luxury', desc: 'Palace hotels, bespoke chauffeurs (~₹15,000+/day)' },
  ];

  const parties: { id: TravelParty; label: string }[] = [
    { id: 'solo', label: 'Solo Traveler' },
    { id: 'couple', label: 'Couple' },
    { id: 'family', label: 'Family with Kids' },
    { id: 'friends', label: 'Friends Group' },
    { id: 'group', label: 'Tour Group' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/70 dark:bg-stone-900/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D9531E]/10 text-[#D9531E] flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                Personalization Settings
              </h2>
              <p className="text-xs text-stone-500">
                Tune the AI discovery algorithm to your travel style and needs
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-stone-200 dark:border-stone-800 bg-stone-100/50 dark:bg-stone-800/40 p-1 gap-1 text-xs font-semibold">
          {[
            { id: 'interests', label: 'Interests & Style', icon: Compass },
            { id: 'logistics', label: 'Budget & Group', icon: Wallet },
            { id: 'diet', label: 'Food & Dining', icon: Utensils },
            { id: 'accessibility', label: 'Accessibility', icon: Accessibility },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-2 px-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                  isActive
                    ? 'bg-white dark:bg-stone-800 text-[#D9531E] shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="p-5 overflow-y-auto flex-1 space-y-6">
          {savedNotice && (
            <div className="bg-emerald-600 text-white text-xs font-semibold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 animate-in fade-in">
              <Check className="w-4 h-4" />
              <span>Saved! Recommendations update in real-time.</span>
            </div>
          )}

          {/* TAB 1: Interests & Style */}
          {activeTab === 'interests' && (
            <div className="space-y-5">
              {/* Interests */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Travel Interests (Choose all that inspire you)
                </label>
                <div className="flex flex-wrap gap-2">
                  {allInterests.map((item) => {
                    const isSelected = (preferences.interests || []).includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleInterestToggle(item.id)}
                        className={`text-xs px-3 py-1.5 rounded-xl font-medium border flex items-center gap-1.5 transition-all ${
                          isSelected
                            ? 'bg-[#D9531E] border-[#D9531E] text-white shadow-xs'
                            : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-stone-400'
                        }`}
                      >
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Travel Style */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Primary Travel Style
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {travelStyles.map((style) => {
                    const isSelected = (preferences.travelStyle || 'cultural') === style.id;
                    return (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => {
                          updatePreferences({ travelStyle: style.id });
                          showNotification();
                        }}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? 'border-[#D9531E] bg-[#D9531E]/5 text-[#D9531E] ring-1 ring-[#D9531E]'
                            : 'border-stone-200 dark:border-stone-800 hover:border-stone-400 text-stone-700 dark:text-stone-300'
                        }`}
                      >
                        <div className="flex justify-between items-center text-xs font-bold">
                          <span>{style.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#D9531E]" />}
                        </div>
                        <p className="text-[11px] text-stone-500 mt-1">{style.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Preferred Distance */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Preferred Travel Distance from {preferences.selectedCity}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {distances.map((d) => {
                    const isSelected = (preferences.preferredDistanceKm || 750) === d.val;
                    return (
                      <button
                        key={d.val}
                        type="button"
                        onClick={() => {
                          updatePreferences({ preferredDistanceKm: d.val });
                          showNotification();
                        }}
                        className={`p-2.5 rounded-xl border text-center text-xs font-semibold transition-all ${
                          isSelected
                            ? 'border-[#D9531E] bg-[#D9531E]/10 text-[#D9531E]'
                            : 'border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300'
                        }`}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Logistics & Budget */}
          {activeTab === 'logistics' && (
            <div className="space-y-5">
              {/* Budget */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Budget Allowance
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {budgets.map((b) => {
                    const isSelected = preferences.budget === b.id;
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => {
                          updatePreferences({ budget: b.id });
                          showNotification();
                        }}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? 'border-[#D9531E] bg-[#D9531E]/5 text-[#D9531E] ring-1 ring-[#D9531E]'
                            : 'border-stone-200 dark:border-stone-800 hover:border-stone-400 text-stone-700 dark:text-stone-300'
                        }`}
                      >
                        <div className="flex justify-between items-center text-xs font-bold">
                          <span>{b.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#D9531E]" />}
                        </div>
                        <p className="text-[11px] text-stone-500 mt-1">{b.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Travel Group */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Travel Party
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {parties.map((p) => {
                    const isSelected = preferences.party === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          updatePreferences({ party: p.id });
                          showNotification();
                        }}
                        className={`p-2.5 rounded-xl border text-center text-xs font-semibold transition-all ${
                          isSelected
                            ? 'border-[#D9531E] bg-[#D9531E]/10 text-[#D9531E]'
                            : 'border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300'
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Food & Dining */}
          {activeTab === 'diet' && (
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Dietary & Culinary Preferences
              </label>
              <p className="text-xs text-stone-500">
                Filters restaurant and street food recommendations to align with your food ethics and cravings.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {foodOptions.map((f) => {
                  const isSelected = (preferences.foodPreferences || []).includes(f.id);
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => handleFoodToggle(f.id)}
                      className={`p-2.5 rounded-xl border text-center text-xs font-semibold transition-all ${
                        isSelected
                          ? 'border-[#D9531E] bg-[#D9531E] text-white shadow-xs'
                          : 'border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:border-stone-400'
                      }`}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: Accessibility */}
          {activeTab === 'accessibility' && (
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Mobility & Accessibility Standards
              </label>
              <div className="space-y-2.5">
                {accessibilityOptions.map((acc) => {
                  const isSelected = (preferences.accessibility || []).includes(acc.id);
                  return (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => handleAccessibilityToggle(acc.id)}
                      className={`w-full p-3 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'border-[#D9531E] bg-[#D9531E]/5 text-[#D9531E] ring-1 ring-[#D9531E]'
                          : 'border-stone-200 dark:border-stone-800 hover:border-stone-400 text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span>{acc.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#D9531E]" />}
                      </div>
                      <p className="text-[11px] text-stone-500 mt-1">{acc.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer with Reset All & Confirm */}
        <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset all personalization preferences to default values?')) {
                  resetPersonalization();
                  showNotification();
                }
              }}
              className="text-xs text-stone-500 hover:text-red-600 flex items-center gap-1 font-medium transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Personalization</span>
            </button>
            {canUndoReset && (
              <button
                type="button"
                onClick={() => {
                  undoReset();
                  showNotification();
                }}
                className="text-xs text-[#D9531E] font-medium underline"
              >
                Undo Reset
              </button>
            )}
          </div>

          <Button variant="primary" size="sm" onClick={onClose}>
            Apply & Close
          </Button>
        </div>
      </div>
    </div>
  );
};
