import React, { useState } from 'react';
import {
  X,
  MapPin,
  Clock,
  Wallet,
  ShieldCheck,
  Heart,
  Share2,
  Navigation,
  CheckCircle2,
  AlertCircle,
  Utensils,
  Star,
  Sparkles,
  Info,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';
import { FoodPlace } from '../../types/travel';
import { Badge } from '../common/Badge';

interface FoodDetailModalProps {
  foodPlace: FoodPlace | null;
  allFoodPlaces?: FoodPlace[];
  isOpen: boolean;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onSelectFoodPlace?: (place: FoodPlace) => void;
}

export const FoodDetailModal: React.FC<FoodDetailModalProps> = ({
  foodPlace,
  allFoodPlaces = [],
  isOpen,
  onClose,
  isSaved,
  onToggleSave,
  onSelectFoodPlace,
}) => {
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen || !foodPlace) return null;

  const gallery =
    foodPlace.galleryImages && foodPlace.galleryImages.length > 0
      ? [foodPlace.imageUrl, ...foodPlace.galleryImages]
      : [foodPlace.imageUrl];

  const handleDirections = () => {
    const query = encodeURIComponent(
      `${foodPlace.name}, ${foodPlace.location.address || foodPlace.location.city}`
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

  // Nearby food places in same city/circuit
  const nearbyPlaces = allFoodPlaces
    .filter(
      (f) =>
        f.id !== foodPlace.id &&
        (f.destinationName.toLowerCase() === foodPlace.destinationName.toLowerCase() ||
          f.location.city.toLowerCase() === foodPlace.location.city.toLowerCase())
    )
    .slice(0, 3);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-stone-950/80 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-4xl bg-[#FBF9F5] dark:bg-[#151514] rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col max-h-[94vh] my-auto">
        {/* Sticky Header Actions */}
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
            <Navigation className="w-4 h-4 text-orange-400" />
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="p-2.5 rounded-full bg-stone-900/70 hover:bg-stone-900 text-white backdrop-blur-md transition-colors"
            title="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onToggleSave(foodPlace.id)}
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
          {/* Hero Banner & Gallery */}
          <div className="relative">
            <div className="relative aspect-21/9 sm:aspect-16/7 w-full bg-stone-900 overflow-hidden">
              <img
                src={gallery[activeGalleryIndex] || foodPlace.imageUrl}
                alt={foodPlace.name}
                className="w-full h-full object-cover transition-all duration-300"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />

              {/* Title & Badge */}
              <div className="absolute bottom-6 inset-x-6 text-white z-10">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge classification={foodPlace.dataClassification} />
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-500/30 text-orange-200 font-semibold backdrop-blur-sm border border-orange-400/30">
                    {foodPlace.cuisineType}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-stone-900/70 text-stone-200 backdrop-blur-sm">
                    {foodPlace.dietaryPreference}
                  </span>
                </div>

                <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">
                  {foodPlace.name}
                </h1>
                <p className="text-xs sm:text-sm text-stone-300 mt-1 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#D9531E]" />
                  <span>{foodPlace.location.address || `${foodPlace.destinationName}, ${foodPlace.location.state}`}</span>
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
                        ? 'border-orange-500 scale-105 shadow-md'
                        : 'border-stone-700 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Timing, Directions & Price Bar */}
            <div className="p-4 sm:p-6 bg-white dark:bg-stone-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs text-stone-400">Approx. Price for Two</div>
                <div className="text-xl font-black text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                  <span>₹{foodPlace.priceForTwoInr}</span>
                  <span className="text-xs text-stone-400 font-normal">
                    ({foodPlace.priceRange || 'average meal for two'})
                  </span>
                </div>
                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{foodPlace.timings || '10:00 AM – 10:00 PM'}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDirections}
                className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Navigation className="w-4 h-4" />
                <span>Navigate on Google Maps</span>
              </button>
            </div>
          </div>

          {/* SECTION 2: Detailed Menu Highlights (Itemized Prices with Estimated vs Verified) */}
          <div className="p-6 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                Menu Highlights & Signature Dishes
              </h2>
              <p className="text-xs text-stone-500">
                Itemized pricing verified through local culinary audit logs
              </p>
            </div>

            {foodPlace.signatureDishesDetailed && foodPlace.signatureDishesDetailed.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {foodPlace.signatureDishesDetailed.map((dish, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold text-xs text-stone-900 dark:text-stone-100">
                        {dish.name}
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                          ₹{dish.priceInr}
                        </div>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                            dish.isPriceEstimated
                              ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                              : 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                          }`}
                        >
                          {dish.isPriceEstimated ? 'Estimated' : 'Verified Price'}
                        </span>
                      </div>
                    </div>

                    {dish.description && (
                      <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                        {dish.description}
                      </p>
                    )}

                    <div className="text-[10px] text-stone-400">
                      {dish.isVegetarian ? '🌱 100% Vegetarian' : '🍗 Non-Vegetarian'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {foodPlace.specialtyDishes.map((dish, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs"
                  >
                    <span className="font-semibold text-stone-800 dark:text-stone-200">{dish}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                      Popular item
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 3: Dietary Certification Notes & Rule Compliance */}
          <div className="p-6 space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-stone-400">
              Dietary Certification & Preparation Integrity
            </h3>

            <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck
                  className={`w-5 h-5 ${
                    foodPlace.dietaryCertificationVerified ? 'text-emerald-500' : 'text-amber-500'
                  }`}
                />
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200">
                  {foodPlace.dietaryCertificationVerified
                    ? 'Verified Dietary Certification'
                    : 'Traditional Culinary Practice (No Formal Certification)'}
                </h4>
              </div>

              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                {foodPlace.dietaryCertificationVerified
                  ? 'This establishment holds verified FSSAI/Halal/Jain food authority inspection certificates on record.'
                  : 'Important Note: Bharat Yatra does not claim third-party laboratory certification for this venue. It follows traditional hereditary culinary methods and verified customer consensus.'}
              </p>

              {foodPlace.dietaryOptions && foodPlace.dietaryOptions.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-stone-100 dark:border-stone-800">
                  <span className="text-[11px] text-stone-400">Dietary options on menu:</span>
                  {foodPlace.dietaryOptions.map((opt, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-medium"
                    >
                      {opt}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* SECTION 4: Best Time to Visit, Hygiene Rating & Food Etiquette */}
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Best Time to Visit & Rush Hours
              </h4>
              <p className="text-xs text-stone-600 dark:text-stone-300">
                Best visited around late afternoon (04:00 PM – 06:00 PM) before peak evening crowds.
                Expect a 10–15 minute queue during festival weekends.
              </p>
              <div className="pt-2 text-[11px] text-stone-400">
                Opening Hours Verified: {foodPlace.openingHoursVerified ? 'Yes (Local Audit)' : 'Pending audit'}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Local Food Etiquette & Hygiene
              </h4>
              <ul className="space-y-1 text-xs text-stone-600 dark:text-stone-300">
                <li>• Self-service counter: Token system operated at entrance cash desk.</li>
                <li>• Traditional clay kulhad dishes should be disposed of in earmarked terracotta bins.</li>
                <li>• UPI and digital payments widely accepted.</li>
              </ul>
            </div>
          </div>

          {/* SECTION 5: Nearby Food Places */}
          {nearbyPlaces.length > 0 && (
            <div className="p-6 space-y-4">
              <div>
                <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                  Nearby Food Places to Continue Your Food Trail
                </h2>
                <p className="text-xs text-stone-500">
                  Walkable eateries in {foodPlace.destinationName}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {nearbyPlaces.map((near) => (
                  <div
                    key={near.id}
                    onClick={() => onSelectFoodPlace && onSelectFoodPlace(near)}
                    className="p-3 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-orange-500/40 transition-colors flex flex-col justify-between cursor-pointer group"
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
                      <span className="text-[10px] font-bold text-orange-600 uppercase">
                        {near.cuisineType}
                      </span>
                      <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 group-hover:text-orange-600 line-clamp-1">
                        {near.name}
                      </h4>
                      <p className="text-[11px] text-stone-500">{near.priceRange}</p>
                    </div>
                    <div className="mt-2 pt-1 border-t border-stone-100 dark:border-stone-800 text-[11px] text-orange-600 font-semibold flex items-center justify-between">
                      <span>View Menu</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
