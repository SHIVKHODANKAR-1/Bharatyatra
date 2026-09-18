import React, { useState } from 'react';
import {
  X,
  MapPin,
  Clock,
  Calendar,
  Ticket,
  ShieldCheck,
  Heart,
  Share2,
  Navigation,
  ExternalLink,
  AlertTriangle,
  Info,
  CheckCircle2,
  CloudSun,
  Plus,
  BookOpen,
} from 'lucide-react';
import { SeasonalEvent } from '../../types/travel';
import { Badge } from '../common/Badge';
import { BookingModal } from '../booking/BookingModal';
import { ReviewsSection } from '../reviews/ReviewsSection';

interface EventDetailModalProps {
  event: SeasonalEvent | null;
  isOpen: boolean;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onAddToTrip?: (event: SeasonalEvent) => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  isOpen,
  onClose,
  isSaved,
  onToggleSave,
  onAddToTrip,
}) => {
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  if (!isOpen || !event) return null;

  const gallery =
    event.galleryImages && event.galleryImages.length > 0
      ? [event.imageUrl, ...event.galleryImages]
      : [event.imageUrl];

  const handleDirections = () => {
    const query = encodeURIComponent(
      `${event.name}, ${event.location?.address || `${event.city || event.destinationName}, ${event.state}`}`
    );
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

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
        {/* Sticky Actions Bar */}
        <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
          {copiedLink && (
            <span className="px-3 py-1 rounded-full bg-stone-900/90 text-emerald-400 text-xs font-semibold border border-stone-700 shadow-md">
              Link copied!
            </span>
          )}

          <button
            type="button"
            onClick={handleDirections}
            className="p-2.5 rounded-full bg-stone-900/70 hover:bg-stone-900 text-white backdrop-blur-md transition-colors"
            title="Directions"
          >
            <Navigation className="w-4 h-4 text-rose-400" />
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="p-2.5 rounded-full bg-stone-900/70 hover:bg-stone-900 text-white backdrop-blur-md transition-colors"
            title="Share event"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onToggleSave(event.id)}
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
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto flex-1 divide-y divide-stone-200 dark:divide-stone-800">
          {/* SECTION 1: Hero Banner & Gallery */}
          <div className="relative">
            <div className="relative aspect-21/9 sm:aspect-16/7 w-full bg-stone-900 overflow-hidden">
              <img
                src={gallery[activeGalleryIndex] || event.imageUrl}
                alt={event.name}
                className="w-full h-full object-cover transition-all duration-300"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />

              {/* Badges on Hero */}
              <div className="absolute bottom-6 inset-x-6 text-white z-10">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge classification={event.dataClassification} />
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/30 text-rose-200 font-semibold backdrop-blur-sm border border-rose-400/30">
                    {event.category}
                  </span>
                  {event.tentative && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-900/80 text-amber-200 backdrop-blur-sm">
                      Tentative Dates
                    </span>
                  )}
                </div>

                <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">{event.name}</h1>
                <p className="text-xs sm:text-sm text-stone-300 mt-1 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#D9531E]" />
                  <span>
                    {event.location?.address || `${event.city || event.destinationName}, ${event.state}`}
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
                        ? 'border-rose-500 scale-105 shadow-md'
                        : 'border-stone-700 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Dates, Ticket & Booking Bar */}
            <div className="p-4 sm:p-6 bg-white dark:bg-stone-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs text-stone-400">Festival Dates & Timing</div>
                <div className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-rose-500" />
                  <span>{event.startDateApprox || event.startDate}</span>
                  {event.endDate && <span> – {event.endDateApprox || event.endDate}</span>}
                </div>
                <div className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{event.time || 'Daily festival schedule'}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-[#D9531E] hover:bg-[#B45309] text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Ticket className="w-4 h-4" />
                  <span>Reserve Passes</span>
                </button>

                {event.ticketInfo?.bookingUrl && (
                  <a
                    href={event.ticketInfo.bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <span>External Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}

                {onAddToTrip && (
                  <button
                    type="button"
                    onClick={() => onAddToTrip(event)}
                    className="px-4 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add to Trip</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 2: Description & Key Highlights */}
          <div className="p-6 space-y-4">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-stone-400 mb-1.5">
                About the Event
              </h2>
              <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
                {event.description}
              </p>
            </div>

            {/* Disclaimer on Dates if Tentative */}
            {event.uncertaintyDisclaimer && (
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Notice on Festival Dates:</strong> {event.uncertaintyDisclaimer}
                </div>
              </div>
            )}

            {/* Highlights */}
            {event.highlights && event.highlights.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
                  Key Festival Highlights
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {event.highlights.map((high, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 flex items-center gap-2.5 text-xs text-stone-700 dark:text-stone-300"
                    >
                      <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>{high}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SECTION 3: Full Event Program / Schedule */}
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-stone-400">
                Official Program Schedule
              </h3>
              <span className="text-[11px] text-stone-400">
                Organizer: {event.organizer || 'State Tourism Department'}
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-start gap-3 text-xs">
                <div className="font-bold text-rose-600 shrink-0 w-24">Morning Slot</div>
                <div>
                  <div className="font-bold text-stone-900 dark:text-stone-100">
                    Sacred Invocations & Cultural Procession
                  </div>
                  <p className="text-stone-500 mt-0.5">
                    Traditional instrument fanfare, ceremonial blessings, and opening of regional handicraft pavilions.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-start gap-3 text-xs">
                <div className="font-bold text-rose-600 shrink-0 w-24">Afternoon Slot</div>
                <div>
                  <div className="font-bold text-stone-900 dark:text-stone-100">
                    Folk Performances & Indigenous Competitions
                  </div>
                  <p className="text-stone-500 mt-0.5">
                    Traditional dance forms, local artisan workshops, and food fair tastings.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-start gap-3 text-xs">
                <div className="font-bold text-rose-600 shrink-0 w-24">Evening Gala</div>
                <div>
                  <div className="font-bold text-stone-900 dark:text-stone-100">
                    Grand Evening Aarti, Light Show & Live Concerts
                  </div>
                  <p className="text-stone-500 mt-0.5">
                    Main attraction: illuminating diyas or stage musical performances under night skies.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: Venue Map & Directions */}
          <div className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-stone-400">
                Venue Map & Navigation
              </h3>
              <button
                type="button"
                onClick={handleDirections}
                className="text-xs text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1 hover:underline"
              >
                <span>Open in Maps</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <div className="font-bold text-stone-900 dark:text-stone-100">
                  {event.location?.address || `${event.destinationName} Main Grounds`}
                </div>
                <div className="text-stone-500 mt-0.5">
                  Geo-coordinates: {event.location?.latitude?.toFixed(4)},{' '}
                  {event.location?.longitude?.toFixed(4)}
                </div>
              </div>

              <button
                type="button"
                onClick={handleDirections}
                className="px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-rose-100 transition-colors"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Get Route</span>
              </button>
            </div>
          </div>

          {/* SECTION 5: Entry Rules, Weather Precautions, & Official Source */}
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Entry rules */}
            <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-500" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200">
                  Entry Rules & Guidelines
                </h4>
              </div>
              <ul className="space-y-1.5 text-xs text-stone-600 dark:text-stone-300">
                <li>• Valid government photo identification mandatory for security check.</li>
                <li>• Metal detector and bag scanning queues at all pavilion entrances.</li>
                <li>• No outside food or plastic disposables permitted within festival grounds.</li>
                <li>• Commercial photography requires pre-registered accreditation pass.</li>
              </ul>
            </div>

            {/* Weather precautions & Official Source */}
            <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <CloudSun className="w-4 h-4 text-amber-500" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200">
                    Weather Precautions
                  </h4>
                </div>
                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                  Evenings can become chilly along open riverbanks and valley amphitheatres. Carry light
                  woolens or windcheaters.
                </p>
              </div>

              <div className="pt-2 border-t border-stone-100 dark:border-stone-800 space-y-1 text-[11px]">
                <div className="flex items-center gap-1.5 text-stone-800 dark:text-stone-200 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Official Source:</span>
                </div>
                <div className="text-stone-500">
                  {event.officialSource?.name || event.source.sourceName}
                </div>
                <div className="text-stone-400 text-[10px]">
                  Verified date: {event.lastUpdatedDate || 'August 2026'}
                </div>
              </div>
            </div>
          </div>

          {/* Festival Attendee Reviews & Ratings */}
          <div className="p-6">
            <ReviewsSection
              itemId={event.id}
              itemTitle={event.name}
              itemType="event"
            />
          </div>
        </div>
      </div>

      {/* Booking Checkout Modal for Event Passes */}
      {isBookingModalOpen && (
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          item={{
            id: event.id,
            itemType: 'event',
            title: event.name,
            destinationName: event.city || event.destinationName || 'India',
            approxPriceInr: event.ticketInfo?.priceInr || 250,
            imageUrl: event.imageUrl,
            providerId: 'prov_varanasi_heritage',
            providerName: event.officialSource?.name || 'Department of Tourism & Cultural Affairs',
          }}
          onBookingSuccess={(booking) => {
            setIsBookingModalOpen(false);
          }}
        />
      )}
    </div>
  );
};
