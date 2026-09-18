import React from 'react';
import {
  X,
  MapPin,
  Clock,
  Wallet,
  Calendar,
  ShieldCheck,
  Heart,
  Share2,
  Compass,
  Utensils,
  AlertCircle,
  Bus,
  CheckCircle2,
} from 'lucide-react';
import { Destination } from '../../types/travel';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { useI18n } from '../../i18n/index';

interface DestinationDetailModalProps {
  destination: Destination | null;
  isOpen: boolean;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onAddToTrip: (destination: Destination) => void;
}

export const DestinationDetailModal: React.FC<DestinationDetailModalProps> = ({
  destination,
  isOpen,
  onClose,
  isSaved,
  onToggleSave,
  onAddToTrip,
}) => {
  const { t } = useI18n();

  if (!isOpen || !destination) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/70 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-3xl bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Hero Image Section */}
        <div className="relative aspect-21/9 w-full bg-stone-900 overflow-hidden shrink-0">
          <img
            src={destination.imageUrl}
            alt={destination.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />

          {/* Top Actions */}
          <div className="absolute top-4 inset-x-4 flex items-center justify-between z-10">
            <Badge classification={destination.dataClassification} />

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onToggleSave(destination.id)}
                className={`p-2.5 rounded-full backdrop-blur-md transition-colors ${
                  isSaved
                    ? 'bg-red-500 text-white'
                    : 'bg-stone-900/60 text-white hover:bg-stone-900/80'
                }`}
                aria-label="Save"
              >
                <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-2.5 rounded-full bg-stone-900/60 text-white hover:bg-stone-900/80 backdrop-blur-md"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Bottom Title Overlay */}
          <div className="absolute bottom-4 inset-x-4 text-white">
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-300">
              <MapPin className="w-3.5 h-3.5 text-[#D9531E]" />
              <span>{destination.location.city}, {destination.location.state}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-0.5">
              {destination.name}
            </h2>
            <p className="text-xs sm:text-sm text-stone-200 opacity-90 line-clamp-1">
              {destination.tagline}
            </p>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/80 dark:border-stone-800">
              <div className="text-[11px] text-stone-500 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#D9531E]" />
                <span>Best Season</span>
              </div>
              <div className="text-xs font-bold text-stone-800 dark:text-stone-200 mt-1">
                {destination.bestTimeToVisit}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/80 dark:border-stone-800">
              <div className="text-[11px] text-stone-500 flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#D9531E]" />
                <span>Ideal Duration</span>
              </div>
              <div className="text-xs font-bold text-stone-800 dark:text-stone-200 mt-1">
                {destination.idealDurationDays} Days
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/80 dark:border-stone-800">
              <div className="text-[11px] text-stone-500 flex items-center gap-1">
                <Wallet className="w-3 h-3 text-[#D9531E]" />
                <span>Estimated Budget</span>
              </div>
              <div className="text-xs font-bold capitalize text-stone-800 dark:text-stone-200 mt-1">
                {destination.estimatedBudget}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/80 dark:border-stone-800">
              <div className="text-[11px] text-stone-500 flex items-center gap-1">
                <Bus className="w-3 h-3 text-[#D9531E]" />
                <span>Transit</span>
              </div>
              <div className="text-xs font-bold text-stone-800 dark:text-stone-200 mt-1 truncate">
                {destination.accessibility?.nearestAirport || `${destination.location.city} Station`}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500">
              About This Destination
            </h3>
            <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
              {destination.description}
            </p>
          </div>

          {/* Highlights & Curated Sights */}
          <div className="space-y-2.5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500">
              Signature Highlights
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {destination.highlights.map((h, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 text-xs font-medium text-stone-800 dark:text-stone-200"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#166534] shrink-0" />
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cultural Etiquette & Local Wisdom */}
          {destination.culturalTips && destination.culturalTips.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-200">
                <AlertCircle className="w-4 h-4 text-[#D9531E]" />
                <span>Cultural Etiquette & Respectful Travel Tips</span>
              </div>
              <ul className="text-xs text-amber-800 dark:text-amber-300 space-y-1 pl-4 list-disc">
                {destination.culturalTips.map((tip: string, idx: number) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Local Flavors to Savor */}
          {destination.localFoods && destination.localFoods.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-500">
                <Utensils className="w-3.5 h-3.5 text-[#D9531E]" />
                <span>Signature Culinary Delicacies</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {destination.localFoods.map((food: string, idx: number) => (
                  <span
                    key={idx}
                    className="text-xs px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium"
                  >
                    🍲 {food}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Verification Origin */}
          <div className="pt-2 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Source: {destination.source.sourceName}</span>
            </span>
            <span>Reviewed {new Date(destination.source.lastUpdated).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/90 flex items-center justify-between gap-3 shrink-0">
          <Button
            variant="outline"
            size="md"
            onClick={() => onToggleSave(destination.id)}
            leftIcon={<Heart className={`w-4 h-4 ${isSaved ? 'text-red-500 fill-current' : ''}`} />}
          >
            {isSaved ? 'Saved' : 'Save for Later'}
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => {
              onAddToTrip(destination);
              onClose();
            }}
            className="flex-1 sm:flex-initial"
            leftIcon={<Compass className="w-4 h-4" />}
          >
            Add to Itinerary
          </Button>
        </div>
      </div>
    </div>
  );
};
