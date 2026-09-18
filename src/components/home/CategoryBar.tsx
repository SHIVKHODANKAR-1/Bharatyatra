import React from 'react';
import { CATEGORIES } from '../../data/categories';
import { useAnalytics } from '../../context/AnalyticsContext';

interface CategoryBarProps {
  selectedCategory: string | null;
  onSelectCategory: (categoryKey: string | null) => void;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const { trackEvent } = useAnalytics();

  const handleSelect = (key: string | null) => {
    onSelectCategory(key);
    trackEvent('category_selected', { category: key || 'all' });
  };

  return (
    <div className="w-full overflow-x-auto no-scrollbar scrollbar-none py-1 -mx-1 px-1 touch-pan-x">
      <div className="flex items-center gap-2.5 min-w-max pb-1">
        {/* "All" button */}
        <button
          type="button"
          onClick={() => handleSelect(null)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all select-none whitespace-nowrap shrink-0 min-h-[38px] ${
            selectedCategory === null
              ? 'bg-[#D9531E] text-white shadow-xs'
              : 'bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
          }`}
        >
          <span>🇮🇳</span>
          <span>All Highlights</span>
        </button>

        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleSelect(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all select-none whitespace-nowrap shrink-0 min-h-[38px] ${
                isSelected
                  ? 'bg-[#D9531E] text-white shadow-xs'
                  : 'bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
              }`}
            >
              <span>{cat.labelEn}</span>
              <span className="text-[10px] opacity-75 font-normal">({cat.count})</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
