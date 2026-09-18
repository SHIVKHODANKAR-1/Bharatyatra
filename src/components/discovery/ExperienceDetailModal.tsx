import React, { useState } from 'react';
import {
  X,
  MapPin,
  Clock,
  Wallet,
  ShieldCheck,
  Heart,
  Share2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Star,
  Sparkles,
  Calendar,
  Send,
  Check,
  Plus,
  Ticket,
} from 'lucide-react';
import { Experience, Destination } from '../../types/travel';
import { Badge } from '../common/Badge';
import { BookingModal } from '../booking/BookingModal';
import { ReviewsSection } from '../reviews/ReviewsSection';

interface ExperienceDetailModalProps {
  experience: Experience | null;
  isOpen: boolean;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onAddToTrip?: (exp: Experience) => void;
}

export const ExperienceDetailModal: React.FC<ExperienceDetailModalProps> = ({
  experience,
  isOpen,
  onClose,
  isSaved,
  onToggleSave,
  onAddToTrip,
}) => {
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  if (!isOpen || !experience) return null;

  const gallery =
    experience.galleryImages && experience.galleryImages.length > 0
      ? [experience.imageUrl, ...experience.galleryImages]
      : [experience.imageUrl];

  const durationHrs = Math.floor(experience.durationMinutes / 60);
  const durationMins = experience.durationMinutes % 60;
  const durationStr =
    durationHrs > 0
      ? `${durationHrs}h ${durationMins > 0 ? `${durationMins}m` : ''}`
      : `${durationMins}m`;

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-stone-950/80 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-4xl bg-[#FBF9F5] dark:bg-[#151514] rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col max-h-[94vh] my-auto">
        {/* Sticky Actions */}
        <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
          {copiedLink && (
            <span className="px-3 py-1 rounded-full bg-stone-900/90 text-emerald-400 text-xs font-semibold border border-stone-700 shadow-md">
              Link copied!
            </span>
          )}

          <button
            type="button"
            onClick={handleShare}
            className="p-2.5 rounded-full bg-stone-900/70 hover:bg-stone-900 text-white backdrop-blur-md transition-colors"
            title="Share experience"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onToggleSave(experience.id)}
            className={`p-2.5 rounded-full backdrop-blur-md transition-colors ${
              isSaved ? 'bg-red-500 text-white' : 'bg-stone-900/70 text-white hover:bg-stone-900'
            }`}
            title={isSaved ? 'Saved' : 'Save'}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-full bg-stone-900/70 hover:bg-stone-900 text-white backdrop-blur-md transition-colors"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto flex-1 divide-y divide-stone-200 dark:divide-stone-800">
          {/* Hero Banner & Gallery */}
          <div className="relative">
            <div className="relative aspect-21/9 sm:aspect-16/8 w-full bg-stone-900 overflow-hidden">
              <img
                src={gallery[activeGalleryIndex] || experience.imageUrl}
                alt={experience.title}
                className="w-full h-full object-cover transition-all duration-300"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />

              {/* Badges on Hero */}
              <div className="absolute bottom-6 inset-x-6 text-white z-10">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge classification={experience.dataClassification} />
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 font-semibold backdrop-blur-sm border border-indigo-400/30">
                    {experience.experienceType || experience.category}
                  </span>
                  {experience.intensity && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-stone-900/70 text-stone-200 backdrop-blur-sm">
                      {experience.intensity} Intensity
                    </span>
                  )}
                </div>

                <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">
                  {experience.title}
                </h1>
                <p className="text-xs sm:text-sm text-stone-300 mt-1 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#D9531E]" />
                  <span>
                    {experience.destinationName}, {experience.location.state}
                  </span>
                </p>
              </div>
            </div>

            {/* Gallery Thumbnails */}
            {gallery.length > 1 && (
              <div className="px-6 py-2.5 bg-stone-900/90 flex items-center gap-2 overflow-x-auto">
                <span className="text-[11px] text-stone-400 uppercase font-semibold mr-1 shrink-0">
                  Photos:
                </span>
                {gallery.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveGalleryIndex(idx)}
                    className={`relative w-14 h-10 rounded-lg overflow-hidden shrink-0 border-2 transition-transform ${
                      activeGalleryIndex === idx
                        ? 'border-indigo-500 scale-105 shadow-md'
                        : 'border-stone-700 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Quick Price & Action bar */}
            <div className="p-4 sm:p-6 bg-white dark:bg-stone-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs text-stone-400">Estimated Cost</div>
                <div className="text-xl font-black text-stone-900 dark:text-stone-100 flex items-center gap-1">
                  <span>
                    {experience.approxPriceInr === 0 ? 'Free' : `₹${experience.approxPriceInr.toLocaleString()}`}
                  </span>
                  <span className="text-xs text-stone-500 font-normal">/ traveler</span>
                </div>
                <div className="text-xs text-stone-500 mt-0.5">Duration: {durationStr}</div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-[#D9531E] hover:bg-[#B45309] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Ticket className="w-4 h-4" />
                  <span>Book Experience</span>
                </button>

                {onAddToTrip && (
                  <button
                    type="button"
                    onClick={() => onAddToTrip(experience)}
                    className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add to Trip</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Description & What to Expect (Itinerary) */}
          <div className="p-6 space-y-4">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-stone-400 mb-1.5">
                Overview
              </h3>
              <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
                {experience.description}
              </p>
            </div>

            {/* Itinerary / What to Expect */}
            {experience.whatToExpect && experience.whatToExpect.length > 0 && (
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-stone-400 mb-2">
                  What You'll Experience
                </h3>
                <div className="space-y-2">
                  {experience.whatToExpect.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 flex items-start gap-3 text-xs text-stone-700 dark:text-stone-300"
                    >
                      <span className="w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-[10px] shrink-0">
                        {idx + 1}
                      </span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Included vs Excluded */}
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Included */}
            <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
                <span>What's Included</span>
              </div>
              <ul className="space-y-1.5 text-xs text-stone-600 dark:text-stone-300">
                {(experience.includedItems || ['Local registered guide', 'Standard safety gear']).map(
                  (inc, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span>{inc}</span>
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Excluded */}
            <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-red-500">
                <XCircle className="w-4 h-4" />
                <span>What's Excluded</span>
              </div>
              <ul className="space-y-1.5 text-xs text-stone-600 dark:text-stone-300">
                {(experience.excludedItems || ['Personal expenses & tips', 'Hotel transit']).map(
                  (exc, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                      <span>{exc}</span>
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>

          {/* Equipment / Requirements, Age & Fitness */}
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Equipment & Preparation Needed
              </h4>
              <ul className="space-y-1 text-xs text-stone-700 dark:text-stone-300">
                {(experience.requirements || ['Comfortable walking shoes', 'Valid photo ID']).map(
                  (req, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#D9531E] font-bold">•</span>
                      <span>{req}</span>
                    </li>
                  )
                )}
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Age & Fitness Suitability
              </h4>
              <p className="text-xs text-stone-700 dark:text-stone-300">
                {experience.ageSuitability || 'Suitable for all ages with reasonable walking stamina.'}
              </p>
              {experience.ageRestrictions && (
                <p className="text-[11px] text-amber-700 dark:text-amber-400">
                  Restriction note: {experience.ageRestrictions}
                </p>
              )}
            </div>
          </div>

          {/* Operator, Booking Condition, Cancellation Policy, & Safety Notes */}
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Verified Operator info */}
              <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200">
                    Verified Operator / Source
                  </h4>
                </div>
                <p className="text-xs font-bold text-stone-900 dark:text-stone-100">
                  {experience.source.sourceName}
                </p>
                <div className="text-[11px] text-stone-500">
                  {experience.source.verifiedBy
                    ? `Verified by: ${experience.source.verifiedBy}`
                    : 'Source confidence verified by state tourism desk'}
                </div>
                <div className="text-[10px] text-stone-400">
                  Last updated: {experience.source.lastUpdated || 'August 2026'}
                </div>
              </div>

              {/* Cancellation policy */}
              <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2">
                <div className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-500" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200">
                    Booking & Cancellation
                  </h4>
                </div>
                <p className="text-xs text-stone-600 dark:text-stone-300">
                  {experience.cancellationPolicy ||
                    'Standard state tourism policy: Free cancellation up to 24 hours prior to activity start.'}
                </p>
                <div className="text-[11px] text-stone-400">
                  Meeting Point: {experience.meetingPoint || 'Central Tourist Helpdesk'}
                </div>
              </div>
            </div>

            {/* Safety notes & Weather */}
            {experience.weatherDependency && (
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <div>
                  <strong>Weather & Safety Caution:</strong> {experience.weatherDependency}
                </div>
              </div>
            )}
          </div>

          {/* Verified Traveler Reviews & Ratings Breakdown */}
          <div className="p-6">
            <ReviewsSection
              itemId={experience.id}
              itemTitle={experience.title}
              itemType="experience"
            />
          </div>
        </div>
      </div>

      {/* Booking Checkout Modal */}
      {isBookingModalOpen && (
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          item={{
            id: experience.id,
            itemType: 'experience',
            title: experience.title,
            destinationName: experience.location?.city || experience.destinationName || 'India',
            approxPriceInr: experience.approxPriceInr,
            imageUrl: experience.imageUrl,
            providerId: 'prov_varanasi_heritage',
            providerName: experience.source?.sourceName || 'Certified Heritage Guild',
          }}
          onBookingSuccess={(booking) => {
            setIsBookingModalOpen(false);
          }}
        />
      )}
    </div>
  );
};
