import React, { useMemo, useState } from 'react';
import {
  Sparkles,
  Sliders,
  MapPin,
  Calendar,
  Compass,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Heart,
  Gem,
} from 'lucide-react';
import { RecommendationItem, Destination } from '../../types/travel';
import { DataClassification } from '../../types/index';
import { computeRecommendations } from '../../services/recommendationEngine';
import { RecommendationCard } from '../cards/RecommendationCard';
import { WeatherWidget } from './WeatherWidget';
import { CategoryBar } from './CategoryBar';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { EmptyState } from '../common/EmptyState';
import { RecommendationFeedbackModal } from '../cards/RecommendationFeedbackModal';
import { FeedbackService } from '../../services/feedbackService';
import { FeedbackActionType } from '../../types/recommendation';
import { INITIAL_DESTINATIONS } from '../../data/destinations';
import { INITIAL_HIDDEN_GEMS } from '../../data/hiddenGems';
import { INITIAL_SEASONAL_EVENTS } from '../../data/events';
import { useOnboarding } from '../../context/OnboardingContext';
import { useI18n } from '../../i18n/index';

interface HomeDashboardProps {
  onSelectDestination: (dest: Destination) => void;
  onExplain: (item: RecommendationItem) => void;
  onPlanTrip: (item: RecommendationItem) => void;
  savedItemIds: Set<string>;
  onToggleSave: (id: string) => void;
  onViewAllExplore: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  onSelectDestination,
  onExplain,
  onPlanTrip,
  savedItemIds,
  onToggleSave,
  onViewAllExplore,
}) => {
  const { preferences, openOnboarding, resetPersonalization } = useOnboarding();
  const { t } = useI18n();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [hiddenItemIds, setHiddenItemIds] = useState<Set<string>>(new Set());
  const [feedbackModalItem, setFeedbackModalItem] = useState<RecommendationItem | null>(null);

  // Compute dynamic personalized recommendations
  const allRecommendations = useMemo(() => {
    return computeRecommendations(preferences, savedItemIds, hiddenItemIds);
  }, [preferences, savedItemIds, hiddenItemIds]);

  const filteredRecommendations = useMemo(() => {
    if (!selectedCategory) return allRecommendations;
    return allRecommendations.filter((item) => item.category === selectedCategory);
  }, [allRecommendations, selectedCategory]);

  const handleNotInterested = (id: string) => {
    FeedbackService.recordFeedback(id, 'destination', 'not_interested', 'User marked not interested');
    setHiddenItemIds((prev) => new Set(prev).add(id));
  };

  const handleFeedbackSubmit = (action: FeedbackActionType, reason?: string) => {
    if (!feedbackModalItem) return;
    FeedbackService.recordFeedback(
      feedbackModalItem.id,
      feedbackModalItem.type as any,
      action,
      reason,
      feedbackModalItem.category
    );
    if (action !== 'save' && action !== 'like') {
      setHiddenItemIds((prev) => new Set(prev).add(feedbackModalItem.id));
    } else if (action === 'save') {
      onToggleSave(feedbackModalItem.id);
    }
  };

  const getDestinationObject = (item: RecommendationItem): Destination | undefined => {
    return (
      INITIAL_DESTINATIONS.find((d) => d.id === item.id) ||
      INITIAL_HIDDEN_GEMS.find((g) => g.id === item.id)
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto pb-16 w-full">
      {/* Personalized Greeting & Weather Widget Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch w-full">
        {/* Left Welcome Hero */}
        <div className="lg:col-span-7 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-5 sm:p-7 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-bold tracking-wider uppercase text-[#D9531E] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>Personalized For You • {preferences.selectedCity}</span>
            </span>

            <button
              type="button"
              onClick={() => openOnboarding(1)}
              className="text-xs font-semibold text-stone-500 hover:text-[#D9531E] flex items-center gap-1 transition-colors ml-auto sm:ml-0"
            >
              <Sliders className="w-3.5 h-3.5 shrink-0" />
              <span>Edit Travel Profile</span>
            </button>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-stone-900 dark:text-stone-100 tracking-tight leading-tight">
              {t.recommendations.title}
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-2 leading-relaxed">
              Tailored based on your interest in{' '}
              <strong className="text-stone-700 dark:text-stone-300">
                {preferences.interests.join(', ')}
              </strong>
              , with a <span className="capitalize font-semibold">{preferences.budget}</span> budget and{' '}
              <span className="capitalize font-semibold">{preferences.pace}</span> pace.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium">
              📍 Origin: {preferences.selectedCity}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium capitalize">
              ⏱️ {preferences.duration.replace(/_/g, ' ')}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium capitalize">
              👥 {preferences.party}
            </span>
          </div>
        </div>

        {/* Right Live Weather Widget */}
        <div className="lg:col-span-5 flex flex-col justify-stretch">
          <WeatherWidget />
        </div>
      </div>

      {/* Category Horizontal Filter Bar */}
      <div className="space-y-2">
        <CategoryBar
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </div>

      {/* Main Recommended Highlights Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100">
              {selectedCategory ? `${selectedCategory.toUpperCase()} Highlights` : t.recommendations.topPicks}
            </h2>
            <Badge classification={allRecommendations[0]?.dataClassification || 'VERIFIED' as any} />
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onViewAllExplore}
            className="text-xs font-semibold text-[#D9531E]"
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            {t.recommendations.viewAll}
          </Button>
        </div>

        {filteredRecommendations.length === 0 ? (
          <EmptyState
            icon="compass"
            title="No places match this category yet"
            description="Clear your filter or re-tune your interests in profile to discover more places."
            actionLabel="Show All Places"
            onAction={() => setSelectedCategory(null)}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecommendations.slice(0, 6).map((item) => (
              <RecommendationCard
                key={item.id}
                item={item}
                onSave={onToggleSave}
                onNotInterested={handleNotInterested}
                onExplain={onExplain}
                onSelect={(it) => {
                  const dest = getDestinationObject(it);
                  if (dest) onSelectDestination(dest);
                }}
                onPlanTrip={onPlanTrip}
                onOpenFeedbackModal={(it) => setFeedbackModalItem(it)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Hidden Gems of India */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Gem className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100">
                Hidden Gems of India
              </h2>
              <p className="text-xs text-stone-500">
                Lesser-known marvels, serene valleys, and untouched heritage sanctuaries
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onViewAllExplore}
            className="text-xs font-semibold text-[#D9531E]"
          >
            Explore All Gems
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {INITIAL_HIDDEN_GEMS.slice(0, 3).map((gem) => {
            const asRecItem: RecommendationItem = {
              id: gem.id,
              type: 'hidden_gem',
              title: gem.name,
              subtitle: gem.tagline,
              imageUrl: gem.imageUrl,
              category: gem.category,
              location: gem.location,
              estimatedBudget: gem.estimatedBudget,
              idealDuration: `${gem.idealDurationDays} Days`,
              dataClassification: gem.dataClassification,
              source: gem.source,
              matchScore: 92,
              explanation: {
                overallMatchScore: 92,
                matchedInterests: [gem.category],
                matchedBudget: `Compatible with ${gem.estimatedBudget}`,
                matchedPace: 'Relaxed',
                matchedParty: 'Quiet explorers',
                reasonText: `${gem.name} is an exquisite hidden sanctuary offering peaceful cultural immersion away from high tourist footfall.`,
                criteriaBreakdown: { interestWeight: 40, budgetWeight: 25, distanceWeight: 15, seasonalityWeight: 20 },
              },
              isSaved: savedItemIds.has(gem.id),
              isNotInterested: false,
            };

            return (
              <RecommendationCard
                key={gem.id}
                item={asRecItem}
                onSave={onToggleSave}
                onNotInterested={handleNotInterested}
                onExplain={onExplain}
                onSelect={() => onSelectDestination(gem)}
                onPlanTrip={onPlanTrip}
                onOpenFeedbackModal={(it) => setFeedbackModalItem(it)}
              />
            );
          })}
        </div>
      </div>

      {/* Section 3: Upcoming Cultural Festivals & Melas */}
      <div className="bg-stone-50 dark:bg-stone-800/40 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 sm:p-7 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#D9531E]" />
            <div>
              <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                Seasonal Festivals & Cultural Melas
              </h2>
              <p className="text-xs text-stone-500">
                Traditional celebrations, classical dance festivals, and harvest gatherings
              </p>
            </div>
          </div>
          <Badge classification={DataClassification.SCHEDULED} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {INITIAL_SEASONAL_EVENTS.slice(0, 4).map((ev) => (
            <div
              key={ev.id}
              className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-4 space-y-2.5 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-[#D9531E] uppercase">
                  {ev.startDateApprox}
                </span>
                <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 leading-snug">
                  {ev.name}
                </h4>
                <div className="flex items-center gap-1 text-xs text-stone-500">
                  <MapPin className="w-3 h-3" />
                  <span>{ev.destinationName}, {ev.state}</span>
                </div>
                <p className="text-xs text-stone-500 line-clamp-2">{ev.description}</p>
              </div>

              <div className="pt-2 border-t border-stone-100 dark:border-stone-800 text-[11px] text-emerald-600 font-semibold">
                {ev.category}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trust & Transparency Pledge Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/20 via-stone-900/10 to-amber-950/20 border border-emerald-800/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600/10 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
              The Bharat Yatra Data Trust Standard
            </h4>
            <p className="text-xs text-stone-600 dark:text-stone-400 max-w-2xl leading-relaxed">
              Every heritage site, temple protocol, and timing on Bharat Yatra is cross-verified with official records from the Archaeological Survey of India (ASI) and State Tourism Boards. No fake sponsored rankings, ever.
            </p>
          </div>
        </div>
      </div>

      {/* Explicit Recommendation Feedback Modal */}
      <RecommendationFeedbackModal
        isOpen={!!feedbackModalItem}
        onClose={() => setFeedbackModalItem(null)}
        item={feedbackModalItem}
        onFeedbackSubmit={handleFeedbackSubmit}
        onResetPersonalization={resetPersonalization}
      />
    </div>
  );
};
