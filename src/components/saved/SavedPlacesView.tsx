import React from 'react';
import { Heart, Compass, Trash2, ArrowRight } from 'lucide-react';
import { RecommendationItem } from '../../types/travel';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { EmptyState } from '../common/EmptyState';
import { useI18n } from '../../i18n/index';

interface SavedPlacesViewProps {
  savedItems: RecommendationItem[];
  onRemove: (id: string) => void;
  onSelect: (item: RecommendationItem) => void;
  onExploreMore: () => void;
}

export const SavedPlacesView: React.FC<SavedPlacesViewProps> = ({
  savedItems,
  onRemove,
  onSelect,
  onExploreMore,
}) => {
  const { t } = useI18n();

  if (savedItems.length === 0) {
    return (
      <div className="py-12 max-w-xl mx-auto">
        <EmptyState
          icon="bookmark"
          title={t.saved.emptyTitle}
          description={t.saved.emptyDesc}
          actionLabel={t.saved.explorePlaces}
          onAction={onExploreMore}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100">
            {t.saved.title}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            {savedItems.length} destinations and experiences saved for your upcoming journeys
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {savedItems.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-16/9 w-full bg-stone-100 dark:bg-stone-800">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3">
                  <Badge classification={item.dataClassification} />
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(item.id)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-stone-900/60 hover:bg-stone-900/80 text-white backdrop-blur-md"
                  title="Remove from saved"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-4 space-y-2">
                <div className="text-xs text-stone-500 font-medium">
                  {item.location.city}, {item.location.state}
                </div>
                <h3
                  onClick={() => onSelect(item)}
                  className="text-base font-bold text-stone-900 dark:text-stone-100 hover:text-[#D9531E] cursor-pointer line-clamp-1"
                >
                  {item.title}
                </h3>
                <p className="text-xs text-stone-500 line-clamp-2">{item.subtitle}</p>
              </div>
            </div>

            <div className="p-4 pt-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSelect(item)}
                className="w-full text-xs"
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                View Details
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
