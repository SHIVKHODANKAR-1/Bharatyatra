import React, { useState, useMemo } from 'react';
import {
  Search,
  Utensils,
  MapPin,
  Clock,
  Wallet,
  ShieldCheck,
  Heart,
  Navigation,
  Check,
  Info,
  ArrowRight,
  Star,
  Sparkles,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { FoodPlace, FoodCategory } from '../../types/travel';
import { Badge } from '../common/Badge';

interface FoodDiscoveryViewProps {
  foodPlaces: FoodPlace[];
  onSelectFoodPlace: (food: FoodPlace) => void;
  savedItemIds: Set<string>;
  onToggleSave: (id: string) => void;
}

export const FOOD_CATEGORIES = [
  'All Cuisines',
  'Street Food',
  'Regional Cuisine',
  'Vegetarian',
  'Non-vegetarian',
  'Vegan',
  'Jain Food',
  'Halal Food',
  'Sweets',
  'Breakfast',
  'Thali',
  'Cafés',
  'Fine Dining',
  'Local Specialties',
  'Budget Food',
  'Night Food Markets',
];

export const FoodDiscoveryView: React.FC<FoodDiscoveryViewProps> = ({
  foodPlaces,
  onSelectFoodPlace,
  savedItemIds,
  onToggleSave,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Cuisines');
  const [selectedDietary, setSelectedDietary] = useState('All');
  const [selectedBudget, setSelectedBudget] = useState('All');
  const [sortBy, setSortBy] = useState<'rating' | 'priceAsc' | 'priceDesc'>('rating');
  const [copiedDirectionsId, setCopiedDirectionsId] = useState<string | null>(null);

  const handleOpenDirections = (e: React.MouseEvent, place: FoodPlace) => {
    e.stopPropagation();
    const query = encodeURIComponent(
      `${place.name}, ${place.location.address || place.location.city}`
    );
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const filteredPlaces = useMemo(() => {
    return foodPlaces
      .filter((place) => {
        // Category
        if (selectedCategory !== 'All Cuisines') {
          const matchCat = place.foodCategory === selectedCategory;
          const matchCuisine = place.cuisineType.toLowerCase().includes(selectedCategory.toLowerCase());
          const matchDietary = place.dietaryPreference.toLowerCase().includes(selectedCategory.toLowerCase());
          if (!matchCat && !matchCuisine && !matchDietary) return false;
        }

        // Dietary
        if (selectedDietary !== 'All') {
          if (selectedDietary === 'Pure Veg' && !place.dietaryPreference.includes('Pure Veg')) {
            return false;
          }
          if (
            selectedDietary === 'Jain Friendly' &&
            !place.dietaryOptions?.some((o) => o.toLowerCase().includes('jain') || o.toLowerCase().includes('garlic'))
          ) {
            return false;
          }
          if (
            selectedDietary === 'Halal' &&
            !place.dietaryPreference.includes('Halal') &&
            !place.dietaryOptions?.some((o) => o.toLowerCase().includes('halal'))
          ) {
            return false;
          }
          if (
            selectedDietary === 'Vegan' &&
            !place.dietaryPreference.includes('Vegan') &&
            !place.dietaryOptions?.some((o) => o.toLowerCase().includes('vegan'))
          ) {
            return false;
          }
        }

        // Budget tier
        if (selectedBudget !== 'All') {
          if (selectedBudget === 'budget' && place.budgetTier !== 'budget') return false;
          if (selectedBudget === 'moderate' && place.budgetTier !== 'moderate') return false;
          if (selectedBudget === 'luxury' && place.budgetTier !== 'luxury') return false;
        }

        // Search text
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = place.name.toLowerCase().includes(q);
          const matchCuisine = place.cuisineType.toLowerCase().includes(q);
          const matchCity = place.destinationName.toLowerCase().includes(q);
          const matchDish = place.specialtyDishes.some((d) => d.toLowerCase().includes(q));
          if (!matchName && !matchCuisine && !matchCity && !matchDish) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') {
          return (b.ratingsSummary?.average || 0) - (a.ratingsSummary?.average || 0);
        }
        if (sortBy === 'priceAsc') {
          return a.priceForTwoInr - b.priceForTwoInr;
        }
        if (sortBy === 'priceDesc') {
          return b.priceForTwoInr - a.priceForTwoInr;
        }
        return 0;
      });
  }, [foodPlaces, selectedCategory, selectedDietary, selectedBudget, searchQuery, sortBy]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Search */}
      <div className="bg-gradient-to-r from-orange-950/20 via-amber-950/10 to-transparent p-6 rounded-3xl border border-stone-200 dark:border-stone-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-600 dark:text-orange-400">
                Part 2B Culinary
              </span>
              <span className="text-xs text-stone-500">
                {filteredPlaces.length} verified culinary places
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              Culinary Heritage & Food Trail
            </h1>
            <p className="text-sm text-stone-600 dark:text-stone-400 mt-1 max-w-2xl">
              Authentic regional dining, legendary street chaat stalls, and historic sweetmakers with
              verified hours and transparent dietary specifications.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search food stalls, dishes, city..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="mt-5 pt-4 border-t border-stone-200/60 dark:border-stone-800/60 flex items-center gap-2 overflow-x-auto pb-2">
          {FOOD_CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'bg-white/80 dark:bg-stone-800/80 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Secondary Filters: Dietary, Budget, Sort */}
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
          {/* Dietary Tabs */}
          <div className="flex items-center gap-1 bg-white dark:bg-stone-900 p-1 rounded-xl border border-stone-200 dark:border-stone-800">
            <span className="text-[11px] text-stone-400 px-2 font-medium">Dietary:</span>
            {['All', 'Pure Veg', 'Jain Friendly', 'Halal', 'Vegan'].map((diet) => (
              <button
                key={diet}
                onClick={() => setSelectedDietary(diet)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                  selectedDietary === diet
                    ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                {diet}
              </button>
            ))}
          </div>

          {/* Budget filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-stone-500">Tier:</span>
            <select
              value={selectedBudget}
              onChange={(e) => setSelectedBudget(e.target.value)}
              aria-label="Filter food places by price tier"
              className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 focus:outline-none"
            >
              <option value="All">All Tiers</option>
              <option value="budget">Budget (Under ₹300 for two)</option>
              <option value="moderate">Moderate (₹300 - ₹800)</option>
              <option value="luxury">Fine Dining (₹800+)</option>
            </select>
          </div>

          {/* Sort selector */}
          <div className="ml-auto flex items-center gap-1.5">
            <span className="text-stone-500">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              aria-label="Sort food places by"
              className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 focus:outline-none"
            >
              <option value="rating">Highest Verified Rating</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Food Places */}
      {filteredPlaces.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800">
          <Utensils className="w-10 h-10 text-stone-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-stone-800 dark:text-stone-200">No eateries found</h3>
          <p className="text-sm text-stone-500 mt-1">Try resetting the cuisine or dietary preference filters.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All Cuisines');
              setSelectedDietary('All');
              setSelectedBudget('All');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-orange-600 text-white text-xs font-semibold hover:bg-orange-700 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlaces.map((place) => {
            const isSaved = savedItemIds.has(place.id);
            const signatureDish =
              place.signatureDishesDetailed?.[0]?.name ||
              place.specialtyDishes?.[0] ||
              'Local Specialty';

            return (
              <div
                key={place.id}
                onClick={() => onSelectFoodPlace(place)}
                className="group relative bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col cursor-pointer"
              >
                {/* Image Cover */}
                <div className="relative aspect-16/10 w-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                  <img
                    src={place.imageUrl}
                    alt={place.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
                    <Badge classification={place.dataClassification} />

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => handleOpenDirections(e, place)}
                        className="p-2 rounded-full bg-stone-900/60 hover:bg-stone-900/90 text-white backdrop-blur-md transition-colors"
                        title="Get directions on Maps"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleSave(place.id);
                        }}
                        className={`p-2 rounded-full backdrop-blur-md transition-colors ${
                          isSaved
                            ? 'bg-red-500 text-white'
                            : 'bg-stone-900/60 text-white hover:bg-stone-900/90'
                        }`}
                        title={isSaved ? 'Saved' : 'Save'}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Bottom Image Overlay Details */}
                  <div className="absolute bottom-3 inset-x-3 text-white">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-stone-900/70 text-orange-300 backdrop-blur-sm">
                        {place.cuisineType}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-md backdrop-blur-sm ${
                          place.dietaryPreference.includes('Pure Veg')
                            ? 'bg-emerald-900/70 text-emerald-200'
                            : 'bg-amber-900/70 text-amber-200'
                        }`}
                      >
                        {place.dietaryPreference}
                      </span>
                    </div>
                    <h2 className="text-base font-bold leading-snug line-clamp-1">{place.name}</h2>
                    <p className="text-xs text-stone-300 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-[#D9531E]" />
                      <span className="truncate">
                        {place.location.address || `${place.destinationName}, ${place.location.state}`}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  {/* Signature Dish Pill */}
                  <div className="p-2.5 rounded-2xl bg-orange-500/10 dark:bg-orange-500/15 border border-orange-200/60 dark:border-orange-800/40">
                    <div className="text-[10px] uppercase font-bold text-orange-700 dark:text-orange-400">
                      Must Try Signature Dish:
                    </div>
                    <div className="text-xs font-bold text-stone-800 dark:text-stone-200 mt-0.5 line-clamp-1">
                      {signatureDish}
                    </div>
                  </div>

                  {/* Metadata Chips: Price Range, Hours, Rating */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-stone-100 dark:border-stone-800 text-[11px]">
                    <div className="flex flex-col">
                      <span className="text-stone-400 text-[10px]">Price Range</span>
                      <span className="font-bold text-stone-800 dark:text-stone-200">
                        {place.priceRange || `₹${place.priceForTwoInr} for two`}
                      </span>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="text-stone-400 text-[10px]">Verified Hours</span>
                      <div className="flex items-center gap-1 font-semibold text-stone-700 dark:text-stone-300">
                        <Clock className="w-3 h-3 text-stone-400" />
                        <span className="truncate max-w-[120px]">{place.timings || '10 AM – 10 PM'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Rating & Action Buttons */}
                  <div className="pt-2 flex items-center justify-between border-t border-stone-100 dark:border-stone-800">
                    <div className="flex items-center gap-1.5">
                      {place.ratingsSummary?.average ? (
                        <>
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                            {place.ratingsSummary.average.toFixed(1)}
                          </span>
                          <span className="text-[10px] text-stone-400">
                            ({place.ratingsSummary.count.toLocaleString()})
                          </span>
                        </>
                      ) : (
                        <span className="text-[10px] text-stone-400">Community verified</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => handleOpenDirections(e, place)}
                        className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-orange-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-medium transition-colors flex items-center gap-1"
                        title="Get directions"
                      >
                        <Navigation className="w-3 h-3 text-orange-600" />
                        <span>Directions</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectFoodPlace(place);
                        }}
                        className="py-2 px-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold transition-colors flex items-center gap-1"
                      >
                        <span>Menu & Info</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
