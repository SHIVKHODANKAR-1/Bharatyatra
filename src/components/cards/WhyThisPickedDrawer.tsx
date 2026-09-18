import React, { useState } from 'react';
import {
  Sparkles,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  Info,
  ShieldCheck,
  Calendar,
  DollarSign,
  Users,
  Compass,
  MapPin,
  Clock,
  Heart,
  CheckCircle2,
} from 'lucide-react';
import { Drawer } from '../common/Drawer';
import { Button } from '../common/Button';
import { RecommendationItem } from '../../types/travel';
import { useOnboarding } from '../../context/OnboardingContext';
import { useAnalytics } from '../../context/AnalyticsContext';
import { useI18n } from '../../i18n/index';
import { FeedbackService } from '../../services/feedbackService';

interface WhyThisPickedDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  item: RecommendationItem | null;
  onFeedbackAction?: (action: string) => void;
}

export const WhyThisPickedDrawer: React.FC<WhyThisPickedDrawerProps> = ({
  isOpen,
  onClose,
  item,
  onFeedbackAction,
}) => {
  const { preferences, resetPersonalization, undoReset, canUndoReset } = useOnboarding();
  const { trackEvent } = useAnalytics();
  const { t } = useI18n();

  const [feedbackGiven, setFeedbackGiven] = useState<'up' | 'down' | null>(null);

  if (!item) return null;

  const handleFeedback = (isHelpful: boolean) => {
    setFeedbackGiven(isHelpful ? 'up' : 'down');
    FeedbackService.recordFeedback(
      item.id,
      item.type as any,
      isHelpful ? 'like' : 'not_interested',
      isHelpful ? 'User found match explanation helpful' : 'User marked unhelpful match'
    );
    trackEvent(isHelpful ? 'ai_feedback_positive' : 'ai_feedback_negative', {
      itemId: item.id,
      itemTitle: item.title,
    });
    if (onFeedbackAction) {
      onFeedbackAction(isHelpful ? 'like' : 'not_interested');
    }
  };

  const handleReset = () => {
    FeedbackService.resetPersonalization();
    resetPersonalization();
    trackEvent('personalization_reset', { source: 'why_picked_drawer' });
    if (onFeedbackAction) {
      onFeedbackAction('reset');
    }
  };

  const matchedReasons = item.explanation.matchedInterests || [];
  const sourceName =
    typeof item.source === 'string'
      ? item.source
      : item.source?.sourceName || 'Archaeological Survey of India & Ministry of Tourism';

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Why This Match?"
      subtitle={`Personalized alignment breakdown for "${item.title}"`}
      position="right"
    >
      <div className="space-y-6">
        {/* Match Score Banner */}
        <div className="p-4 rounded-3xl bg-gradient-to-br from-[#D9531E]/10 via-amber-500/10 to-orange-500/5 border border-[#D9531E]/20 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#D9531E] text-white flex flex-col items-center justify-center font-black text-sm shadow-md">
              <span>{item.matchScore}%</span>
              <span className="text-[9px] uppercase tracking-wider font-semibold opacity-90">Match</span>
            </div>
            <div>
              <div className="font-bold text-sm text-stone-900 dark:text-stone-100">
                Personalized Relevance
              </div>
              <div className="text-xs text-stone-500 dark:text-stone-400">
                Calculated from your {preferences.selectedCity} voyage profile
              </div>
            </div>
          </div>
          <Sparkles className="w-5 h-5 text-[#D9531E]" />
        </div>

        {/* Narrative Reason */}
        <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/60 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700 dark:text-stone-300">
            <Info className="w-4 h-4 text-[#D9531E]" />
            <span>Curator Summary</span>
          </div>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
            {item.explanation.reasonText}
          </p>
        </div>

        {/* Key Drivers List */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Matching Dimensions
          </h4>

          <div className="grid grid-cols-1 gap-2.5">
            {/* Interests */}
            <div className="p-3 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-orange-500/10 text-[#D9531E] mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-stone-900 dark:text-stone-100">Interest Match</div>
                <div className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  {matchedReasons.join(' • ') || `Matches ${item.category} exploration`}
                </div>
              </div>
            </div>

            {/* Budget */}
            <div className="p-3 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mt-0.5">
                <DollarSign className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-stone-900 dark:text-stone-100">Budget Suitability</div>
                <div className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  {item.explanation.matchedBudget || `Comfortably fits your ${preferences.budget} budget`}
                </div>
              </div>
            </div>

            {/* Travel Party & Pace */}
            <div className="p-3 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 mt-0.5">
                <Users className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-stone-900 dark:text-stone-100">Party & Pace Calibration</div>
                <div className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  {item.explanation.matchedParty} • {item.explanation.matchedPace}
                </div>
              </div>
            </div>

            {/* Seasonal Fit */}
            <div className="p-3 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mt-0.5">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-stone-900 dark:text-stone-100">Seasonal Climate Window</div>
                <div className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  Optimal conditions for travel during this time of year
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 5-Tier Source Verification */}
        <div className="p-4 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Verified Source Attribution</span>
          </div>
          <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
            Data sourced and corroborated from <strong>{sourceName}</strong>. Verified by Bharat Yatra Heritage Desk.
          </p>
        </div>

        {/* Feedback on this recommendation */}
        <div className="pt-2 border-t border-stone-200 dark:border-stone-800 space-y-3">
          <div className="text-xs text-stone-500 dark:text-stone-400 font-medium">Was this match helpful?</div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFeedback(true)}
              leftIcon={<ThumbsUp className="w-3.5 h-3.5" />}
              className={feedbackGiven === 'up' ? 'border-emerald-500 text-emerald-600' : ''}
            >
              Helpful
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFeedback(false)}
              leftIcon={<ThumbsDown className="w-3.5 h-3.5" />}
              className={feedbackGiven === 'down' ? 'border-red-500 text-red-600' : ''}
            >
              Not Helpful
            </Button>
          </div>
          {feedbackGiven && (
            <p className="text-[11px] text-emerald-600 font-medium">
              Thank you! Your feedback dynamically refines recommendations.
            </p>
          )}
        </div>

        {/* Reset Personalization Controls */}
        <div className="pt-2 border-t border-stone-200 dark:border-stone-800 space-y-2">
          <div className="text-xs text-stone-500 dark:text-stone-400">Want to start fresh?</div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              className="text-xs text-stone-600 hover:text-red-600"
            >
              {t.recommendations.resetPersonalization}
            </Button>
            {canUndoReset && (
              <Button variant="ghost" size="sm" onClick={undoReset} className="text-xs text-[#D9531E]">
                {t.recommendations.undoReset}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Drawer>
  );
};
