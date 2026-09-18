import React from 'react';
import { X, RotateCcw } from 'lucide-react';
import { ExploreFilters } from '../../types/travel';
import { BUDGET_OPTIONS, DURATION_OPTIONS } from '../../data/exploreTaxonomy';

interface ActiveFilterChipsProps {
  filters: ExploreFilters;
  onRemoveFilter: (key: keyof ExploreFilters, value?: string) => void;
  onClearAll: () => void;
  currentCity?: string;
}

export const ActiveFilterChips: React.FC<ActiveFilterChipsProps> = ({
  filters,
  onRemoveFilter,
  onClearAll,
  currentCity = 'Nagpur',
}) => {
  const chips: { key: keyof ExploreFilters; value?: string; label: string }[] = [];

  if (filters.searchQuery?.trim()) {
    chips.push({ key: 'searchQuery', label: `Search: "${filters.searchQuery}"` });
  }

  if (filters.locationScope && filters.locationScope !== 'all_india') {
    if (filters.locationScope === 'selected_city') {
      chips.push({ key: 'locationScope', label: `City: ${currentCity}` });
    } else if (filters.locationScope === 'custom_radius' && filters.customRadiusKm) {
      chips.push({ key: 'locationScope', label: `Within ${filters.customRadiusKm} km` });
    }
  }

  filters.budgetBrackets?.forEach((b) => {
    const found = BUDGET_OPTIONS.find((opt) => opt.id === b);
    chips.push({ key: 'budgetBrackets', value: b, label: found ? found.name : b });
  });

  filters.durations?.forEach((d) => {
    const found = DURATION_OPTIONS.find((opt) => opt.id === d);
    chips.push({ key: 'durations', value: d, label: found ? found.name : d });
  });

  filters.categories?.forEach((c) => {
    chips.push({ key: 'categories', value: c, label: `Category: ${c}` });
  });

  filters.travelStyles?.forEach((s) => {
    chips.push({ key: 'travelStyles', value: s, label: `Style: ${s}` });
  });

  filters.accessibility?.forEach((a) => {
    chips.push({ key: 'accessibility', value: a, label: `Access: ${a}` });
  });

  filters.weather?.forEach((w) => {
    chips.push({ key: 'weather', value: w, label: `Weather: ${w}` });
  });

  filters.crowdLevel?.forEach((c) => {
    chips.push({ key: 'crowdLevel', value: c, label: `Crowd: ${c}` });
  });

  if (filters.minRating && filters.minRating > 0) {
    chips.push({ key: 'minRating', label: `Rating: ${filters.minRating}+ ★` });
  }

  if (filters.onlyOpenNow) {
    chips.push({ key: 'onlyOpenNow', label: 'Verified Open Now' });
  }

  if (filters.hiddenGemsOnly) {
    chips.push({ key: 'hiddenGemsOnly', label: '💎 Hidden Gems' });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 py-2">
      <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
        Active Filters ({chips.length}):
      </span>
      {chips.map((chip, idx) => (
        <span
          key={`${chip.key}-${chip.value || idx}`}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 shadow-2xs group transition-all"
        >
          <span>{chip.label}</span>
          <button
            type="button"
            onClick={() => onRemoveFilter(chip.key, chip.value)}
            className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-100 rounded-full p-0.5 hover:bg-stone-200 dark:hover:bg-stone-700"
            aria-label={`Remove filter ${chip.label}`}
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="inline-flex items-center gap-1 text-xs font-semibold text-[#D9531E] hover:underline px-2 py-1"
      >
        <RotateCcw className="w-3 h-3" />
        <span>Clear All</span>
      </button>
    </div>
  );
};
