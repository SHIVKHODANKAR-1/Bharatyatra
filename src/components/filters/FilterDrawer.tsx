import React, { useState } from 'react';
import {
  X,
  RotateCcw,
  Check,
  Bookmark,
  ChevronDown,
  ChevronUp,
  MapPin,
  Sliders,
  DollarSign,
  Clock,
  Compass,
  Accessibility,
  CloudSun,
  Users,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { ExploreFilters } from '../../types/travel';
import {
  CATEGORY_SHORTCUTS,
  TRAVEL_STYLES,
  ACCESSIBILITY_OPTIONS,
  WEATHER_OPTIONS,
  CROWD_OPTIONS,
  FOOD_PREFERENCE_OPTIONS,
  TRANSPORT_OPTIONS,
  EXPERIENCE_INTENSITIES,
  DURATION_OPTIONS,
  BUDGET_OPTIONS,
} from '../../data/exploreTaxonomy';
import { getSavedFilterPresets, saveFilterPreset, FilterPreset } from '../../services/searchExploreService';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: ExploreFilters;
  onApplyFilters: (filters: ExploreFilters) => void;
  onResetFilters: () => void;
  currentCity?: string;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  filters: initialFilters,
  onApplyFilters,
  onResetFilters,
  currentCity = 'Nagpur',
}) => {
  const [localFilters, setLocalFilters] = useState<ExploreFilters>(initialFilters);
  const [activeSection, setActiveSection] = useState<string | null>('location');
  const [presetName, setPresetName] = useState('');
  const [showSavePreset, setShowSavePreset] = useState(false);
  const [savedPresets, setSavedPresets] = useState<FilterPreset[]>(getSavedFilterPresets());

  if (!isOpen) return null;

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const toggleArrayItem = (key: keyof ExploreFilters, item: string) => {
    setLocalFilters((prev) => {
      const arr = (prev[key] as string[]) || [];
      const exists = arr.includes(item);
      const updated = exists ? arr.filter((x) => x !== item) : [...arr, item];
      return { ...prev, [key]: updated };
    });
  };

  const handleSavePreset = () => {
    if (!presetName.trim()) return;
    const updated = saveFilterPreset(presetName, localFilters);
    setSavedPresets(updated);
    setPresetName('');
    setShowSavePreset(false);
  };

  const handleApplyPreset = (preset: FilterPreset) => {
    setLocalFilters(preset.filters);
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    const emptyFilters: ExploreFilters = {
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
    };
    setLocalFilters(emptyFilters);
    onResetFilters();
  };

  const activeFilterCount =
    (localFilters.locationScope !== 'all_india' ? 1 : 0) +
    localFilters.budgetBrackets.length +
    localFilters.durations.length +
    localFilters.travelStyles.length +
    localFilters.categories.length +
    localFilters.accessibility.length +
    localFilters.weather.length +
    localFilters.crowdLevel.length +
    localFilters.foodPreferences.length +
    localFilters.transportTypes.length +
    localFilters.experienceIntensity.length +
    (localFilters.minRating ? 1 : 0) +
    (localFilters.onlyOpenNow ? 1 : 0) +
    (localFilters.hiddenGemsOnly ? 1 : 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-900/60 backdrop-blur-xs flex justify-end animate-fadeIn">
      <div className="w-full max-w-xl bg-white dark:bg-stone-900 h-full shadow-2xl flex flex-col border-l border-stone-200 dark:border-stone-800 transition-colors">
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/80 dark:bg-stone-900/80">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#D9531E]" />
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
              Advanced Travel Filters
            </h2>
            {activeFilterCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-[#D9531E] text-white text-xs font-bold">
                {activeFilterCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
            aria-label="Close Filter Drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Filters Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Preset Quick Loader */}
          {savedPresets.length > 0 && (
            <div className="p-3 rounded-xl bg-stone-100 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-800">
              <div className="text-xs font-semibold text-stone-500 dark:text-stone-400 mb-2 flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 text-[#D9531E]" />
                <span>Saved Filter Presets</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {savedPresets.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="px-2.5 py-1 text-xs rounded-lg bg-white dark:bg-stone-700 hover:bg-[#D9531E]/10 hover:text-[#D9531E] border border-stone-200 dark:border-stone-600 transition-colors"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 1. Location & Radius Filter */}
          <div className="border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('location')}
              className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800/50 flex items-center justify-between text-left font-semibold text-sm"
            >
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#D9531E]" />
                <span>Location & Travel Distance</span>
              </span>
              {activeSection === 'location' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {activeSection === 'location' && (
              <div className="p-4 space-y-3 bg-white dark:bg-stone-900">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'all_india', label: 'Anywhere in India' },
                    { id: 'selected_city', label: `Near ${currentCity}` },
                    { id: 'custom_radius', label: 'Distance Radius' },
                  ].map((scope) => (
                    <button
                      key={scope.id}
                      type="button"
                      onClick={() => setLocalFilters({ ...localFilters, locationScope: scope.id as any })}
                      className={`p-2.5 rounded-lg border text-left font-medium transition-all ${
                        localFilters.locationScope === scope.id
                          ? 'border-[#D9531E] bg-[#D9531E]/10 text-[#D9531E] font-bold'
                          : 'border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800'
                      }`}
                    >
                      {scope.label}
                    </button>
                  ))}
                </div>

                {localFilters.locationScope === 'custom_radius' && (
                  <div className="pt-2 space-y-2">
                    <div className="flex justify-between text-xs font-medium text-stone-600 dark:text-stone-400">
                      <span>Maximum Radius</span>
                      <span className="font-bold text-[#D9531E]">{localFilters.customRadiusKm || 100} km</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="1000"
                      step="5"
                      value={localFilters.customRadiusKm || 100}
                      onChange={(e) => setLocalFilters({ ...localFilters, customRadiusKm: Number(e.target.value) })}
                      className="w-full accent-[#D9531E] cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-stone-400">
                      <span>5 km</span>
                      <span>50 km</span>
                      <span>200 km</span>
                      <span>500 km</span>
                      <span>1000 km</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2. Budget Filter */}
          <div className="border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('budget')}
              className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800/50 flex items-center justify-between text-left font-semibold text-sm"
            >
              <span className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>Budget & Expense Bracket</span>
              </span>
              {activeSection === 'budget' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {activeSection === 'budget' && (
              <div className="p-4 grid grid-cols-2 gap-2 bg-white dark:bg-stone-900">
                {BUDGET_OPTIONS.map((opt) => {
                  const isSelected = localFilters.budgetBrackets.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => toggleArrayItem('budgetBrackets', opt.id)}
                      className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold'
                          : 'border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800'
                      }`}
                    >
                      <div className="font-semibold">{opt.name}</div>
                      <div className="text-[10px] text-stone-400 truncate">{opt.rangeInr}</div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. Duration Filter */}
          <div className="border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('duration')}
              className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800/50 flex items-center justify-between text-left font-semibold text-sm"
            >
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Trip Duration</span>
              </span>
              {activeSection === 'duration' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {activeSection === 'duration' && (
              <div className="p-4 grid grid-cols-2 gap-2 bg-white dark:bg-stone-900">
                {DURATION_OPTIONS.map((dur) => {
                  const isSelected = localFilters.durations.includes(dur.id);
                  return (
                    <button
                      key={dur.id}
                      type="button"
                      onClick={() => toggleArrayItem('durations', dur.id)}
                      className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold'
                          : 'border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800'
                      }`}
                    >
                      <div className="font-semibold">{dur.name}</div>
                      <div className="text-[10px] text-stone-400 truncate">{dur.daysRange}</div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 4. Travel Styles */}
          <div className="border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('styles')}
              className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800/50 flex items-center justify-between text-left font-semibold text-sm"
            >
              <span className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-amber-600" />
                <span>Travel Style ({TRAVEL_STYLES.length})</span>
              </span>
              {activeSection === 'styles' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {activeSection === 'styles' && (
              <div className="p-4 flex flex-wrap gap-1.5 bg-white dark:bg-stone-900">
                {TRAVEL_STYLES.map((style) => {
                  const isSelected = localFilters.travelStyles.includes(style);
                  return (
                    <button
                      key={style}
                      type="button"
                      onClick={() => toggleArrayItem('travelStyles', style)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-amber-600 text-white font-semibold'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
                      }`}
                    >
                      {style}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 5. Accessibility Filters (Strict Requirement) */}
          <div className="border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('accessibility')}
              className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800/50 flex items-center justify-between text-left font-semibold text-sm"
            >
              <span className="flex items-center gap-2">
                <Accessibility className="w-4 h-4 text-purple-600" />
                <span>Accessibility & Special Assistance</span>
              </span>
              {activeSection === 'accessibility' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {activeSection === 'accessibility' && (
              <div className="p-4 space-y-2.5 bg-white dark:bg-stone-900">
                <p className="text-[11px] text-stone-500 italic mb-1">
                  Note: If verified ramp/wheelchair information is unavailable for a site, the system displays: “Accessibility information not verified.”
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ACCESSIBILITY_OPTIONS.map((opt) => {
                    const isSelected = localFilters.accessibility.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => toggleArrayItem('accessibility', opt)}
                        className={`p-2 rounded-lg border text-left text-xs flex items-center gap-2 transition-all ${
                          isSelected
                            ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-bold'
                            : 'border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800'
                        }`}
                      >
                        <div className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-purple-600 border-purple-600 text-white' : 'border-stone-300'
                        }`}>
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                        <span className="truncate">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 6. Weather & Climate Suitability */}
          <div className="border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('weather')}
              className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800/50 flex items-center justify-between text-left font-semibold text-sm"
            >
              <span className="flex items-center gap-2">
                <CloudSun className="w-4 h-4 text-sky-600" />
                <span>Weather & Season Suitability</span>
              </span>
              {activeSection === 'weather' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {activeSection === 'weather' && (
              <div className="p-4 flex flex-wrap gap-1.5 bg-white dark:bg-stone-900">
                {WEATHER_OPTIONS.map((w) => {
                  const isSelected = localFilters.weather.includes(w);
                  return (
                    <button
                      key={w}
                      type="button"
                      onClick={() => toggleArrayItem('weather', w)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-sky-600 text-white font-semibold'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
                      }`}
                    >
                      {w}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 7. Crowd Level */}
          <div className="border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('crowd')}
              className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800/50 flex items-center justify-between text-left font-semibold text-sm"
            >
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-600" />
                <span>Crowd Density</span>
              </span>
              {activeSection === 'crowd' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {activeSection === 'crowd' && (
              <div className="p-4 flex flex-wrap gap-1.5 bg-white dark:bg-stone-900">
                {CROWD_OPTIONS.map((c) => {
                  const isSelected = localFilters.crowdLevel.includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleArrayItem('crowdLevel', c)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-teal-600 text-white font-semibold'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
                      }`}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 8. Additional Toggles: Verified Open Now & Hidden Gems */}
          <div className="space-y-2 p-3 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800">
            <label className="flex items-center justify-between text-xs cursor-pointer select-none">
              <span className="font-semibold text-stone-800 dark:text-stone-200">
                Only Verified "Open Now" Places
              </span>
              <input
                type="checkbox"
                checked={localFilters.onlyOpenNow || false}
                onChange={(e) => setLocalFilters({ ...localFilters, onlyOpenNow: e.target.checked })}
                className="w-4 h-4 accent-[#D9531E] rounded"
              />
            </label>
            <p className="text-[10px] text-stone-400">
              Rule enforced: Will strictly suppress items whose opening hours have not been officially verified by local tourism boards.
            </p>

            <div className="pt-2 border-t border-stone-200 dark:border-stone-700">
              <label className="flex items-center justify-between text-xs cursor-pointer select-none">
                <span className="font-semibold text-amber-600 flex items-center gap-1.5">
                  <span>💎</span>
                  <span>Hidden Gems & Offbeat Spots Only</span>
                </span>
                <input
                  type="checkbox"
                  checked={localFilters.hiddenGemsOnly || false}
                  onChange={(e) => setLocalFilters({ ...localFilters, hiddenGemsOnly: e.target.checked })}
                  className="w-4 h-4 accent-amber-600 rounded"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/90 flex flex-col gap-2.5">
          {showSavePreset ? (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Name this filter preset..."
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
              />
              <button
                type="button"
                onClick={handleSavePreset}
                className="px-3 py-1.5 bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-900 text-xs font-semibold rounded-lg"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setShowSavePreset(false)}
                className="px-2 py-1.5 text-xs text-stone-500"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 font-medium"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All</span>
              </button>
              <button
                type="button"
                onClick={() => setShowSavePreset(true)}
                className="flex items-center gap-1 text-xs text-[#D9531E] hover:underline font-medium"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Save As Preset</span>
              </button>
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 text-xs font-semibold hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="flex-2 py-2.5 rounded-xl bg-[#D9531E] hover:bg-[#B45309] text-white text-xs font-bold shadow-sm transition-all"
            >
              Apply Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
