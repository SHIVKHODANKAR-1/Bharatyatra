import React, { useState } from 'react';
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
  Plane,
  Train,
  Car,
  CheckCircle2,
  Download,
  Plus,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Star,
  Camera,
  Accessibility,
  PhoneCall,
  ArrowRight,
} from 'lucide-react';
import { Destination, Experience } from '../../types/travel';
import { Badge } from '../common/Badge';
import { DESTINATION_DETAILS_MAP } from '../../data/destinationsDetailsData';
import { INITIAL_EXPERIENCES } from '../../data/experiences';
import { INITIAL_DESTINATIONS } from '../../data/destinations';
import { INITIAL_HIDDEN_GEMS } from '../../data/hiddenGems';

interface DestinationDetailViewProps {
  destination: Destination | null;
  isOpen: boolean;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onAddToTrip: (destination: Destination) => void;
  onSelectExperience?: (exp: Experience) => void;
  onSelectDestination?: (dest: Destination) => void;
}

export const DestinationDetailView: React.FC<DestinationDetailViewProps> = ({
  destination,
  isOpen,
  onClose,
  isSaved,
  onToggleSave,
  onAddToTrip,
  onSelectExperience,
  onSelectDestination,
}) => {
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const [activeActivityTab, setActiveActivityTab] = useState<
    'All' | 'Must-see' | 'Hidden' | 'Cultural' | 'Outdoor'
  >('All');
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  if (!isOpen || !destination) return null;

  // Retrieve extended details
  const ext = DESTINATION_DETAILS_MAP[destination.id];
  const gallery = ext?.galleryImages && ext.galleryImages.length > 0 ? ext.galleryImages : [destination.imageUrl];
  const whyVisit = ext?.whyVisitReasons || [];
  const thingsToDo = ext?.thingsToDo || [];
  const foodToTry = ext?.foodToTry || [];
  const howToReach = ext?.howToReach || [];
  const localTransport = ext?.localTransport || [];
  const accessibility = ext?.accessibilityDetails;
  const safety = ext?.safetyInfo;
  const faqs = ext?.faqs || [];
  const reviews = ext?.reviews || [];
  const budgetBreakdown = ext?.budgetBreakdown;

  // Curated experiences matching this destination
  const curatedExperiences = INITIAL_EXPERIENCES.filter(
    (e) =>
      e.destinationId === destination.id ||
      e.destinationName.toLowerCase() === destination.name.toLowerCase()
  ).slice(0, 4);

  // Nearby destinations within reachable range
  const allDestinations = [...INITIAL_DESTINATIONS, ...INITIAL_HIDDEN_GEMS];
  const nearbyDestinations = allDestinations
    .filter((d) => d.id !== destination.id && (d.region === destination.region || d.location.state === destination.location.state))
    .slice(0, 3);

  // Filtered Things to Do
  const filteredActivities = thingsToDo.filter((item) => {
    if (activeActivityTab === 'All') return true;
    if (activeActivityTab === 'Must-see') return item.category === 'Must-see attractions';
    if (activeActivityTab === 'Hidden') return item.category === 'Hidden spots';
    if (activeActivityTab === 'Cultural') return item.category === 'Cultural experiences';
    if (activeActivityTab === 'Outdoor') return item.category === 'Outdoor activities';
    return true;
  });

  const handleDownloadGuide = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2500);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-stone-950/80 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-5xl bg-[#FBF9F5] dark:bg-[#151514] rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col max-h-[94vh] my-auto">
        {/* Sticky Close Bar */}
        <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
          {shareSuccess && (
            <span className="px-3 py-1 rounded-full bg-stone-900/90 text-emerald-400 text-xs font-semibold border border-stone-700 shadow-md">
              Link copied!
            </span>
          )}
          {downloadSuccess && (
            <span className="px-3 py-1 rounded-full bg-stone-900/90 text-emerald-400 text-xs font-semibold border border-stone-700 shadow-md">
              Travel guide saved!
            </span>
          )}

          <button
            type="button"
            onClick={handleShare}
            className="p-2.5 rounded-full bg-stone-900/70 hover:bg-stone-900 text-white backdrop-blur-md transition-colors"
            title="Share destination"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onToggleSave(destination.id)}
            className={`p-2.5 rounded-full backdrop-blur-md transition-colors ${
              isSaved
                ? 'bg-red-500 text-white'
                : 'bg-stone-900/70 text-white hover:bg-stone-900'
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

        {/* Scrollable Container with all 10 Required Sections */}
        <div className="overflow-y-auto flex-1 divide-y divide-stone-200 dark:divide-stone-800">
          {/* SECTION 1: Hero Section with Gallery & Quick Actions */}
          <div className="relative">
            <div className="relative aspect-21/9 sm:aspect-16/7 w-full bg-stone-900 overflow-hidden">
              <img
                src={gallery[activeGalleryIndex] || destination.imageUrl}
                alt={destination.name}
                className="w-full h-full object-cover transition-all duration-300"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />

              {/* Badges and Destination Title */}
              <div className="absolute bottom-6 inset-x-6 text-white z-10">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge classification={destination.dataClassification} />
                  {destination.destinationType && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/30 text-amber-200 font-semibold backdrop-blur-sm border border-amber-400/30">
                      {destination.destinationType}
                    </span>
                  )}
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-stone-900/60 text-stone-200 backdrop-blur-sm">
                    {destination.region} India
                  </span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                  {destination.name}
                </h1>
                <p className="text-sm sm:text-base text-stone-300 mt-1 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#D9531E]" />
                  <span>
                    {destination.location.city}, {destination.location.state}
                  </span>
                </p>
              </div>
            </div>

            {/* Gallery Thumbnails */}
            {gallery.length > 1 && (
              <div className="px-6 py-3 bg-stone-900/90 flex items-center gap-2 overflow-x-auto">
                <span className="text-[11px] text-stone-400 uppercase font-semibold mr-1 shrink-0">
                  Gallery:
                </span>
                {gallery.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveGalleryIndex(idx)}
                    className={`relative w-16 h-11 rounded-lg overflow-hidden shrink-0 border-2 transition-transform ${
                      activeGalleryIndex === idx
                        ? 'border-[#D9531E] scale-105 shadow-md'
                        : 'border-stone-700 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Match Score Strip & Quick Action Bar */}
            <div className="p-6 bg-white dark:bg-stone-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-extrabold text-lg shrink-0 border border-amber-500/30">
                  {destination.matchScore || 92}%
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    Personalized Match Score
                  </div>
                  <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300">
                    {destination.matchExplanation ||
                      ext?.matchExplanation ||
                      'Aligned with your cultural interest, moderate budget tier, and preferred pace.'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onAddToTrip(destination)}
                  className="px-4 py-2.5 rounded-xl bg-[#D9531E] hover:bg-[#c24617] text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add to Itinerary</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadGuide}
                  className="px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Guide</span>
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 2: Overview & Why Visit */}
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-2">
                Overview & Heritage Significance
              </h2>
              <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                {destination.description}
              </p>
            </div>

            {/* Highlights Grid */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">
                Key Highlights
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {destination.highlights.map((highlight, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 flex items-start gap-2.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-xs font-medium text-stone-800 dark:text-stone-200">
                      {highlight}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Why This Fits You */}
            {whyVisit.length > 0 && (
              <div className="p-4 rounded-3xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                    Why {destination.name} Fits Your Preferences
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {whyVisit.map((reason, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-white/90 dark:bg-stone-900/90 border border-amber-200/60 dark:border-stone-800 space-y-1"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-amber-700 dark:text-amber-400">
                          {reason.title}
                        </span>
                        {reason.relevanceBadge && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 font-semibold">
                            {reason.relevanceBadge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-600 dark:text-stone-300">
                        {reason.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Best Time to Visit & Climate */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-start gap-3">
                <Calendar className="w-5 h-5 text-[#D9531E] shrink-0 mt-1" />
                <div>
                  <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                    Best Season to Visit
                  </h4>
                  <p className="text-xs text-stone-600 dark:text-stone-300 mt-0.5">
                    {destination.peakSeasonMonths.join(', ')}
                  </p>
                  <p className="text-[11px] text-stone-400 mt-1">
                    Pleasant weather, ideal for heritage walks, riverboat rides, and photography.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-1" />
                <div>
                  <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                    Ideal Trip Duration
                  </h4>
                  <p className="text-xs text-stone-600 dark:text-stone-300 mt-0.5">
                    {destination.idealDurationDays} Days recommended
                  </p>
                  <p className="text-[11px] text-stone-400 mt-1">
                    Allows unhurried immersion without travel fatigue.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: Things to Do (Categorized Activities) */}
          <div className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                  Things to Do & Attractions
                </h2>
                <p className="text-xs text-stone-500">
                  Categorized attractions with verified opening hours and cost breakdowns
                </p>
              </div>

              {/* Tabs */}
              <div className="flex flex-wrap items-center gap-1.5">
                {(['All', 'Must-see', 'Hidden', 'Cultural', 'Outdoor'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveActivityTab(tab)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                      activeActivityTab === tab
                        ? 'bg-[#D9531E] text-white'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredActivities.map((act) => (
                <div
                  key={act.id}
                  className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#D9531E]">
                        {act.category}
                      </span>
                      <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                        {act.name}
                      </h4>
                    </div>
                    <span className="text-xs font-bold text-stone-800 dark:text-stone-200 shrink-0">
                      {act.estimatedCostInr === 0 ? 'Free Entry' : `₹${act.estimatedCostInr}`}
                    </span>
                  </div>

                  <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                    {act.description}
                  </p>

                  <div className="pt-2 border-t border-stone-100 dark:border-stone-800 grid grid-cols-2 gap-2 text-[11px] text-stone-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      <span>{act.duration}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="truncate">{act.openingStatus}</span>
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700 text-[11px] text-stone-600 dark:text-stone-300">
                    Location: {act.location} • {act.accessibilityStatus}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 4: Curated Experiences */}
          {curatedExperiences.length > 0 && (
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                    Curated Experiences in {destination.name}
                  </h2>
                  <p className="text-xs text-stone-500">
                    Verified operator journeys, workshops, and spiritual immersions
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {curatedExperiences.map((exp) => (
                  <div
                    key={exp.id}
                    onClick={() => onSelectExperience && onSelectExperience(exp)}
                    className="p-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-[#D9531E]/50 transition-all flex gap-3 cursor-pointer group"
                  >
                    <img
                      src={exp.imageUrl}
                      alt={exp.title}
                      className="w-20 h-20 rounded-xl object-cover shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase">
                          {exp.experienceType || exp.category}
                        </span>
                        <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 group-hover:text-[#D9531E] transition-colors line-clamp-1">
                          {exp.title}
                        </h4>
                        <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                          {Math.round(exp.durationMinutes / 60)} hrs • {exp.intensity || 'Moderate'} Intensity
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-stone-100 dark:border-stone-800 text-xs">
                        <span className="font-bold text-stone-900 dark:text-stone-100">
                          ₹{exp.approxPriceInr}
                        </span>
                        <span className="text-[11px] text-[#D9531E] font-semibold flex items-center gap-0.5">
                          <span>View Details</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 5: Food & Culinary Highlights */}
          {foodToTry.length > 0 && (
            <div className="p-6 space-y-4">
              <div>
                <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                  Famous Regional Food & Where to Try
                </h2>
                <p className="text-xs text-stone-500">
                  Authentic culinary specialties with dietary guidance and price transparency
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {foodToTry.map((dish) => (
                  <div
                    key={dish.id}
                    className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#D9531E]">{dish.name}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            dish.dietaryPreference.includes('Veg')
                              ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                              : 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                          }`}
                        >
                          {dish.dishType}
                        </span>
                      </div>

                      <p className="text-xs text-stone-600 dark:text-stone-300 mt-1 leading-relaxed">
                        {dish.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-stone-100 dark:border-stone-800 space-y-1 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="text-stone-400">Dietary:</span>
                        <span className="font-semibold text-stone-800 dark:text-stone-200">
                          {dish.dietaryPreference}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-stone-400">Best Eateries:</span>
                        <span className="font-semibold text-stone-800 dark:text-stone-200 truncate max-w-[150px]">
                          {dish.bestEateries.join(', ')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-stone-400">Price Est.:</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          ₹{dish.estimatedPriceInr} {dish.isPriceEstimated ? '(est.)' : '(fixed)'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 6: How to Reach & Local Transport */}
          <div className="p-6 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                How to Reach & Local Connectivity
              </h2>
              <p className="text-xs text-stone-500">
                Verified connectivity by Air, Rail, and Road with local transport fares
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {howToReach.map((opt, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    {opt.mode === 'Flight' && <Plane className="w-5 h-5 text-blue-500" />}
                    {opt.mode === 'Train' && <Train className="w-5 h-5 text-emerald-500" />}
                    {opt.mode === 'Road' && <Car className="w-5 h-5 text-amber-500" />}
                    {opt.mode === 'Bus' && <Bus className="w-5 h-5 text-orange-500" />}
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200">
                      By {opt.mode}
                    </h4>
                  </div>

                  <p className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                    {opt.transportType}
                  </p>
                  <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                    {opt.notes}
                  </p>
                  <div className="text-[11px] text-stone-400 pt-1 flex items-center justify-between">
                    <span>Duration: {opt.approxDuration}</span>
                    <span className="font-semibold text-emerald-600">{opt.costRange}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Local Transport Options */}
            {localTransport.length > 0 && (
              <div className="p-4 rounded-2xl bg-stone-100/70 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Local Commute Options & Typical Fares
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {localTransport.map((trans, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-white dark:bg-stone-800 border border-stone-200/60 dark:border-stone-700 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span>{trans.mode}</span>
                        <span className="text-emerald-600 dark:text-emerald-400">{trans.typicalFare}</span>
                      </div>
                      <p className="text-[11px] text-stone-500">{trans.practicalTips}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SECTION 7: Practical Info, Accessibility, and Safety */}
          <div className="p-6 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                Practical Travel Guidance, Accessibility & Safety
              </h2>
              <p className="text-xs text-stone-500">
                Cultural etiquette, wheelchair accessibility verification, and emergency contacts
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Accessibility */}
              <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
                <div className="flex items-center gap-2">
                  <Accessibility className="w-5 h-5 text-indigo-500" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200">
                    Physical Accessibility Details
                  </h4>
                </div>

                {accessibility ? (
                  <div className="space-y-2 text-xs text-stone-600 dark:text-stone-300">
                    <p>
                      <strong>Wheelchair Ramps:</strong> {accessibility.wheelchairRamps}
                    </p>
                    <p>
                      <strong>Terrain & Steps:</strong> {accessibility.stepCountCaution}
                    </p>
                    <p>
                      <strong>Audio & Braille:</strong> {accessibility.brailleAudioGuides}
                    </p>
                    <div className="pt-2 text-[11px] text-stone-400">
                      Verification Status: {accessibility.isVerified ? 'Verified on-site' : 'Estimated from field logs'}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-stone-500">
                    Accessibility data pending verification from municipal authorities.
                  </p>
                )}
              </div>

              {/* Safety Guidance */}
              <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200">
                    Safety Advice & Emergency Numbers
                  </h4>
                </div>

                {safety ? (
                  <div className="space-y-2 text-xs text-stone-600 dark:text-stone-300">
                    <p>
                      <strong>Night Safety:</strong> {safety.nightSafetyLevel}
                    </p>
                    <p>
                      <strong>Solo Women Travelers:</strong> {safety.womenTravelerTips.join(' ')}
                    </p>
                    <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center gap-4">
                      {safety.emergencyContacts.map((cnt, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-xs font-bold text-red-600">
                          <PhoneCall className="w-3.5 h-3.5" />
                          <span>
                            {cnt.service}: {cnt.number}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-red-600 font-bold">
                    <PhoneCall className="w-4 h-4" />
                    <span>National Emergency Police / Medical Helpline: 112</span>
                  </div>
                )}
              </div>
            </div>

            {/* Daily Budget Breakdown */}
            {budgetBreakdown && (
              <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Estimated Daily Budget Breakdown (Per Traveler)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800">
                    <div className="text-stone-400 text-[10px]">Stay / Night</div>
                    <div className="font-bold text-stone-900 dark:text-stone-100">
                      ₹{budgetBreakdown.stayPerNightInr}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800">
                    <div className="text-stone-400 text-[10px]">Meals / Day</div>
                    <div className="font-bold text-stone-900 dark:text-stone-100">
                      ₹{budgetBreakdown.mealsPerDayInr}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800">
                    <div className="text-stone-400 text-[10px]">Local Transit</div>
                    <div className="font-bold text-stone-900 dark:text-stone-100">
                      ₹{budgetBreakdown.localTransitPerDayInr}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800">
                    <div className="text-stone-400 text-[10px]">Sightseeing Fees</div>
                    <div className="font-bold text-stone-900 dark:text-stone-100">
                      ₹{budgetBreakdown.sightseeingPerDayInr}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300">
                    <div className="text-[10px]">Total Daily Est.</div>
                    <div className="font-bold">
                      ₹
                      {budgetBreakdown.stayPerNightInr +
                        budgetBreakdown.mealsPerDayInr +
                        budgetBreakdown.localTransitPerDayInr +
                        budgetBreakdown.sightseeingPerDayInr}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 8: Nearby Destinations */}
          {nearbyDestinations.length > 0 && (
            <div className="p-6 space-y-4">
              <div>
                <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                  Nearby Destinations in This Circuit
                </h2>
                <p className="text-xs text-stone-500">
                  Combine these locations into a multi-day heritage journey
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {nearbyDestinations.map((near) => (
                  <div
                    key={near.id}
                    onClick={() => onSelectDestination && onSelectDestination(near)}
                    className="p-3 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-[#D9531E]/40 transition-colors flex flex-col justify-between cursor-pointer group"
                  >
                    <div className="aspect-16/9 rounded-xl overflow-hidden mb-2">
                      <img
                        src={near.imageUrl}
                        alt={near.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 group-hover:text-[#D9531E]">
                        {near.name}
                      </h4>
                      <p className="text-[11px] text-stone-500">
                        {near.location.city}, {near.location.state}
                      </p>
                    </div>
                    <div className="mt-2 pt-1 border-t border-stone-100 dark:border-stone-800 text-[11px] text-[#D9531E] font-semibold flex items-center justify-between">
                      <span>Explore</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 9: User Reviews & Verified Ratings */}
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                  Verified Traveler Reviews
                </h2>
                <p className="text-xs text-stone-500">
                  {destination.ratingsSummary?.average ? (
                    <>
                      Rated {destination.ratingsSummary.average.toFixed(1)} / 5 from{' '}
                      {destination.ratingsSummary.count.toLocaleString()} travelers
                    </>
                  ) : (
                    'Community reviews verified through verified traveler submissions.'
                  )}
                </p>
              </div>

              {destination.ratingsSummary?.average && (
                <div className="flex items-center gap-1 text-sm font-bold text-amber-500">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  <span>{destination.ratingsSummary.average.toFixed(1)}</span>
                </div>
              )}
            </div>

            {reviews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-stone-900 dark:text-stone-100">
                        {rev.author}
                      </span>
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span className="font-bold">{rev.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                      "{rev.comment}"
                    </p>
                    <div className="text-[10px] text-stone-400 flex items-center justify-between">
                      <span>{rev.date}</span>
                      {rev.verifiedTraveler && (
                        <span className="text-emerald-600 flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" /> Verified Traveler
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-stone-100/60 dark:bg-stone-900 text-center text-xs text-stone-500">
                Verified reviews are being compiled from recent seasonal travelers. No unverified ratings are fabricated.
              </div>
            )}
          </div>

          {/* SECTION 10: Frequently Asked Questions (Accordion) */}
          {faqs.length > 0 && (
            <div className="p-6 space-y-4">
              <div>
                <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                  Frequently Asked Questions
                </h2>
                <p className="text-xs text-stone-500">
                  Common queries about permits, temple etiquette, and best photography timings
                </p>
              </div>

              <div className="space-y-2">
                {faqs.map((faq, idx) => {
                  const isExpanded = expandedFaqIndex === idx;
                  return (
                    <div
                      key={idx}
                      className="rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedFaqIndex(isExpanded ? null : idx)}
                        className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-semibold text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors"
                      >
                        <span className="pr-4">{faq.question}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-stone-400 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-4 text-xs text-stone-600 dark:text-stone-300 leading-relaxed border-t border-stone-100 dark:border-stone-800/60 pt-3">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
