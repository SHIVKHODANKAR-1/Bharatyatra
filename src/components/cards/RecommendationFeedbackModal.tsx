import React, { useState } from 'react';
import {
  X,
  ThumbsDown,
  Heart,
  EyeOff,
  CheckCircle,
  Ban,
  Compass,
  DollarSign,
  MapPin,
  Accessibility,
  CloudSun,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { FeedbackActionType } from '../../types/recommendation';
import { RecommendationItem } from '../../types/travel';
import { Button } from '../common/Button';

interface RecommendationFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: RecommendationItem | null;
  onFeedbackSubmit: (action: FeedbackActionType, reason?: string) => void;
  onResetPersonalization?: () => void;
}

export const RecommendationFeedbackModal: React.FC<RecommendationFeedbackModalProps> = ({
  isOpen,
  onClose,
  item,
  onFeedbackSubmit,
  onResetPersonalization,
}) => {
  const [submittedAction, setSubmittedAction] = useState<FeedbackActionType | null>(null);

  if (!isOpen || !item) return null;

  const handleAction = (action: FeedbackActionType, reason: string) => {
    setSubmittedAction(action);
    onFeedbackSubmit(action, reason);
    setTimeout(() => {
      setSubmittedAction(null);
      onClose();
    }, 900);
  };

  const feedbackOptions: {
    action: FeedbackActionType;
    label: string;
    description: string;
    icon: React.ReactNode;
    color: string;
  }[] = [
    {
      action: 'already_visited',
      label: 'Already Visited',
      description: 'I have already experienced this destination',
      icon: <CheckCircle className="w-4 h-4 text-blue-500" />,
      color: 'hover:border-blue-300 dark:hover:border-blue-700',
    },
    {
      action: 'too_expensive',
      label: 'Too Expensive',
      description: 'Beyond my current travel budget expectations',
      icon: <DollarSign className="w-4 h-4 text-amber-500" />,
      color: 'hover:border-amber-300 dark:hover:border-amber-700',
    },
    {
      action: 'too_far',
      label: 'Too Far Away',
      description: 'Requires more travel time/distance than preferred',
      icon: <MapPin className="w-4 h-4 text-purple-500" />,
      color: 'hover:border-purple-300 dark:hover:border-purple-700',
    },
    {
      action: 'not_accessible',
      label: 'Not Accessible',
      description: 'Lacks required wheelchair ramps or senior amenities',
      icon: <Accessibility className="w-4 h-4 text-rose-500" />,
      color: 'hover:border-rose-300 dark:hover:border-rose-700',
    },
    {
      action: 'wrong_season',
      label: 'Wrong Season',
      description: 'Not suitable for my upcoming travel dates',
      icon: <CloudSun className="w-4 h-4 text-sky-500" />,
      color: 'hover:border-sky-300 dark:hover:border-sky-700',
    },
    {
      action: 'wrong_travel_style',
      label: 'Wrong Travel Style',
      description: 'Does not match my group or preferred pace',
      icon: <Compass className="w-4 h-4 text-emerald-500" />,
      color: 'hover:border-emerald-300 dark:hover:border-emerald-700',
    },
    {
      action: 'hide_similar',
      label: 'Hide Similar Places',
      description: `Show fewer ${item.category} recommendations`,
      icon: <Ban className="w-4 h-4 text-orange-500" />,
      color: 'hover:border-orange-300 dark:hover:border-orange-700',
    },
    {
      action: 'not_interested',
      label: 'Not Interested',
      description: 'Simply not interested in this recommendation',
      icon: <EyeOff className="w-4 h-4 text-stone-500" />,
      color: 'hover:border-stone-400 dark:hover:border-stone-600',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
              Refine Recommendation
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 truncate max-w-xs sm:max-w-sm">
              Tuning suggestions for "{item.title}"
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success Banner */}
        {submittedAction && (
          <div className="p-3 bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2 justify-center">
            <CheckCircle className="w-4 h-4" />
            <span>Preferences updated! Re-ranking future recommendations...</span>
          </div>
        )}

        {/* Options Grid */}
        <div className="p-5 max-h-[60vh] overflow-y-auto space-y-2">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">
            Why is this recommendation not a fit?
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {feedbackOptions.map((opt) => (
              <button
                key={opt.action}
                type="button"
                onClick={() => handleAction(opt.action, opt.label)}
                className={`flex items-start gap-3 p-3 text-left rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 hover:bg-white dark:hover:bg-stone-800 transition-all ${opt.color}`}
              >
                <div className="p-2 rounded-xl bg-white dark:bg-stone-900 shadow-xs shrink-0 mt-0.5">
                  {opt.icon}
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                    {opt.label}
                  </div>
                  <div className="text-[11px] text-stone-500 dark:text-stone-400 leading-tight mt-0.5">
                    {opt.description}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Quick Positive Actions */}
          <div className="pt-4 mt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
            <button
              type="button"
              onClick={() => handleAction('like', 'Loved this recommendation')}
              className="flex items-center gap-1.5 text-xs text-[#D9531E] font-semibold hover:underline"
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Like this style</span>
            </button>

            {onResetPersonalization && (
              <button
                type="button"
                onClick={() => {
                  onResetPersonalization();
                  onClose();
                }}
                className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-red-500 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Personalization</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
