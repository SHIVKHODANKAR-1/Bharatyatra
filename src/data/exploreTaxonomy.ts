export interface ExploreCategoryShortcut {
  id: string;
  name: string;
  iconName: string;
  tagline: string;
  count: number;
  featuredImage: string;
}

export const CATEGORY_SHORTCUTS: ExploreCategoryShortcut[] = [
  { id: 'nature', name: 'Nature', iconName: 'Trees', tagline: 'Lush valleys, wetlands & biosphere reserves', count: 64, featuredImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80' },
  { id: 'beaches', name: 'Beaches', iconName: 'Waves', tagline: 'Arabian Sea coves & Bay of Bengal horizons', count: 38, featuredImage: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80' },
  { id: 'mountains', name: 'Mountains', iconName: 'Mountain', tagline: 'Himalayan ridges & Western Ghats peaks', count: 52, featuredImage: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=600&q=80' },
  { id: 'wildlife', name: 'Wildlife', iconName: 'Compass', tagline: 'Bengal tiger reserves & rhino sanctuaries', count: 32, featuredImage: 'https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&w=600&q=80' },
  { id: 'heritage', name: 'Heritage', iconName: 'Landmark', tagline: 'UNESCO stone architecture & Mughal fortresses', count: 86, featuredImage: 'https://images.unsplash.com/photo-1600100397608-f010f443b794?auto=format&fit=crop&w=600&q=80' },
  { id: 'temples', name: 'Temples', iconName: 'Church', tagline: 'Sacred Dravidian gopurams & Nagara sanctums', count: 74, featuredImage: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80' },
  { id: 'spiritual', name: 'Spiritual', iconName: 'Flame', tagline: 'Riverside Ganga aartis & tranquil ashrams', count: 58, featuredImage: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=600&q=80' },
  { id: 'adventure', name: 'Adventure', iconName: 'Footprints', tagline: 'White-water rapids, high-altitude passes & scuba', count: 48, featuredImage: 'https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?auto=format&fit=crop&w=600&q=80' },
  { id: 'food', name: 'Food', iconName: 'Utensils', tagline: 'Old Delhi kebabs, Chettinad spices & coastal curries', count: 92, featuredImage: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80' },
  { id: 'shopping', name: 'Shopping', iconName: 'ShoppingBag', tagline: 'Zari silk bazaars, blue pottery & brassware', count: 45, featuredImage: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=600&q=80' },
  { id: 'nightlife', name: 'Nightlife', iconName: 'Moon', tagline: 'Sunset beach shacks, live indie gigs & night markets', count: 24, featuredImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80' },
  { id: 'family', name: 'Family', iconName: 'Users', tagline: 'Interactive science parks, tea trains & resorts', count: 60, featuredImage: 'https://images.unsplash.com/photo-1544717302-de2939b7ef71?auto=format&fit=crop&w=600&q=80' },
  { id: 'photography', name: 'Photography', iconName: 'Camera', tagline: 'Golden hour dunes, stepwells & vibrant bazaars', count: 70, featuredImage: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=600&q=80' },
  { id: 'wellness', name: 'Wellness', iconName: 'HeartPulse', tagline: 'Ayurvedic retreats, yoga ashrams & mineral springs', count: 35, featuredImage: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=600&q=80' },
  { id: 'festivals', name: 'Festivals', iconName: 'CalendarDays', tagline: 'Dev Deepawali, Hornbill & desert melodies', count: 30, featuredImage: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=600&q=80' },
  { id: 'museums', name: 'Museums', iconName: 'BookOpen', tagline: 'National archives, royal armories & textiles', count: 40, featuredImage: 'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?auto=format&fit=crop&w=600&q=80' },
  { id: 'art_culture', name: 'Art and Culture', iconName: 'Palette', tagline: 'Kathakali theater, Madhubani folk art & weaves', count: 55, featuredImage: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80' },
  { id: 'weekend_trips', name: 'Weekend Trips', iconName: 'Car', tagline: 'Short scenic escapes under 250 km from major hubs', count: 68, featuredImage: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80' },
  { id: 'budget_trips', name: 'Budget Trips', iconName: 'Coins', tagline: 'Backpacker circuits, free ghats & dharamshalas', count: 50, featuredImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80' },
  { id: 'luxury_travel', name: 'Luxury Travel', iconName: 'Crown', tagline: 'Palace suites, luxury private backwater cruises', count: 28, featuredImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80' },
  { id: 'road_trips', name: 'Road Trips', iconName: 'Map', tagline: 'Manali-Leh highway, Konkan coast & Golden Quadrilateral', count: 36, featuredImage: 'https://images.unsplash.com/photo-1470246973918-29a93221c455?auto=format&fit=crop&w=600&q=80' },
  { id: 'train_journeys', name: 'Train Journeys', iconName: 'Train', tagline: 'Nilgiri Mountain Railway & Kalka-Shimla toy train', count: 22, featuredImage: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80' },
];

export interface MoodOption {
  id: string;
  name: string;
  tagline: string;
  badge: string;
  bgGradient: string;
  iconName: string;
  relatedCategories: string[];
}

export const MOOD_DISCOVERY_OPTIONS: MoodOption[] = [
  { id: 'peaceful_escape', name: 'Peaceful Escape', tagline: 'Quiet pine forests, silent riverbanks & mist', badge: 'Serenity', bgGradient: 'from-emerald-600 to-teal-800', iconName: 'Feather', relatedCategories: ['nature', 'spiritual', 'wellness'] },
  { id: 'adventure_day', name: 'Adventure Day', tagline: 'River rapids, summit climbs & canopy walks', badge: 'Thrilling', bgGradient: 'from-amber-600 to-orange-800', iconName: 'Zap', relatedCategories: ['adventure', 'mountains'] },
  { id: 'romantic_getaway', name: 'Romantic Getaway', tagline: 'Lakeside palaces, private houseboat lagoons', badge: 'Intimate', bgGradient: 'from-rose-600 to-pink-800', iconName: 'Heart', relatedCategories: ['beaches', 'luxury_travel', 'nature'] },
  { id: 'family_fun', name: 'Family Fun', tagline: 'Heritage trains, wildlife safaris & safe resorts', badge: 'All Ages', bgGradient: 'from-blue-600 to-indigo-800', iconName: 'Smile', relatedCategories: ['family', 'heritage', 'wildlife'] },
  { id: 'spiritual_journey', name: 'Spiritual Journey', tagline: 'Ancient aartis, sacred bells & inner silence', badge: 'Devotional', bgGradient: 'from-orange-600 to-amber-700', iconName: 'Flame', relatedCategories: ['spiritual', 'temples'] },
  { id: 'food_hunt', name: 'Food Hunt', tagline: 'Secret street alleys, old bakeries & royal feasts', badge: 'Gastronomy', bgGradient: 'from-red-600 to-amber-800', iconName: 'Utensils', relatedCategories: ['food', 'shopping'] },
  { id: 'photography_trip', name: 'Photography Trip', tagline: 'Dramatic shadows in stepwells & golden dunes', badge: 'Visual Feast', bgGradient: 'from-purple-600 to-indigo-900', iconName: 'Camera', relatedCategories: ['photography', 'heritage', 'nature'] },
  { id: 'budget_escape', name: 'Budget Escape', tagline: 'Authentic local stays, street meals & free trails', badge: 'Pocket Friendly', bgGradient: 'from-cyan-600 to-blue-800', iconName: 'Coins', relatedCategories: ['budget_trips', 'nature'] },
  { id: 'luxury_retreat', name: 'Luxury Retreat', tagline: 'Royal heritage suites, private pools & spa bliss', badge: 'Opulent', bgGradient: 'from-yellow-600 to-amber-900', iconName: 'Crown', relatedCategories: ['luxury_travel', 'wellness'] },
  { id: 'cultural_experience', name: 'Cultural Experience', tagline: 'Tribal weaving, classical dances & rural fairs', badge: 'Immersion', bgGradient: 'from-violet-600 to-purple-800', iconName: 'Sparkles', relatedCategories: ['art_culture', 'festivals', 'heritage'] },
  { id: 'nature_reset', name: 'Nature Reset', tagline: 'Zero cellular network, pristine waterfalls & birds', badge: 'Digital Detox', bgGradient: 'from-green-600 to-emerald-900', iconName: 'Trees', relatedCategories: ['nature', 'wildlife'] },
  { id: 'weekend_recharge', name: 'Weekend Recharge', tagline: 'Leave Friday evening, return refreshed by Sunday', badge: 'Quick Trip', bgGradient: 'from-sky-600 to-cyan-800', iconName: 'Clock', relatedCategories: ['weekend_trips', 'mountains'] },
];

export interface DurationBracket {
  id: string;
  name: string;
  daysRange: string;
  idealFor: string;
}

export const DURATION_OPTIONS: DurationBracket[] = [
  { id: 'few_hours', name: 'Few Hours', daysRange: '2–4 Hours', idealFor: 'City monuments, food walks, boat rides' },
  { id: 'half_day', name: 'Half Day', daysRange: '4–6 Hours', idealFor: 'Fort trails, stepwells, craft villages' },
  { id: 'one_day', name: 'One Day', daysRange: 'Full Day', idealFor: 'Pilgrimage day trips, safari day excursions' },
  { id: 'weekend', name: 'Weekend', daysRange: '2–3 Days', idealFor: 'Hill station recharges, lake getaways' },
  { id: '3_5_days', name: '3–5 Days', daysRange: '3–5 Days', idealFor: 'Golden Triangle, Kerala backwaters circuit' },
  { id: 'one_week', name: 'One Week', daysRange: '6–8 Days', idealFor: 'Himachal circuit, Rajasthan royal trail' },
  { id: 'long_vacation', name: 'Long Vacation', daysRange: '9+ Days', idealFor: 'Ladakh expedition, Grand South India trail' },
];

export interface BudgetBracket {
  id: string;
  name: string;
  rangeInr: string;
  approxPerDay: number;
}

export const BUDGET_OPTIONS: BudgetBracket[] = [
  { id: 'free', name: 'Free', rangeInr: '₹0 (Public Ghats, Temples, Nature Trails)', approxPerDay: 0 },
  { id: 'under_500', name: 'Under ₹500', rangeInr: '< ₹500 / day', approxPerDay: 400 },
  { id: '500_2000', name: '₹500 – ₹2,000', rangeInr: '₹500 – ₹2,000 / day', approxPerDay: 1500 },
  { id: '2000_5000', name: '₹2,000 – ₹5,000', rangeInr: '₹2,000 – ₹5,000 / day', approxPerDay: 3500 },
  { id: '5000_10000', name: '₹5,000 – ₹10,000', rangeInr: '₹5,000 – ₹10,000 / day', approxPerDay: 7500 },
  { id: '10000_25000', name: '₹10,000 – ₹25,000', rangeInr: '₹10,000 – ₹25,000 / day', approxPerDay: 18000 },
  { id: 'premium', name: 'Premium (₹25k+)', rangeInr: '₹25,000+ / day', approxPerDay: 30000 },
  { id: 'custom', name: 'Custom Budget', rangeInr: 'Personalized Range', approxPerDay: 5000 },
];

export const TRAVEL_STYLES = [
  'Backpacking',
  'Budget',
  'Luxury',
  'Slow Travel',
  'Adventure',
  'Cultural',
  'Spiritual',
  'Food-focused',
  'Family',
  'Romantic',
  'Solo',
  'Photography',
  'Wellness',
  'Educational',
  'Road Trip',
  'Train Journey',
];

export const ACCESSIBILITY_OPTIONS = [
  'Wheelchair-friendly',
  'Step-free Access',
  'Accessible Washrooms',
  'Elder-friendly',
  'Low Walking Requirement',
  'Family with Infants',
  'Hearing Support',
  'Visual Accessibility',
  'Quiet Environment',
  'Medical Facility Nearby',
];

export const WEATHER_OPTIONS = [
  'Hot Weather Suitable',
  'Monsoon Suitable',
  'Winter Suitable',
  'Clear Weather Suitable',
  'Indoor-friendly',
  'Outdoor-friendly',
  'Weather-sensitive Activity',
];

export const CROWD_OPTIONS = [
  'Quiet',
  'Moderate',
  'Busy',
  'Festival Crowd',
  'Family-friendly',
  'Avoid Crowded Places',
];

export const FOOD_PREFERENCE_OPTIONS = [
  'Pure Veg',
  'Jain Friendly',
  'Street Food',
  'Halal Certified',
  'Coastal/Seafood',
  'Organic/Local Produce',
];

export const TRANSPORT_OPTIONS = [
  'Airport Nearby (< 60 km)',
  'Direct Railway Connectivity',
  'Highway / Scenic Road Trip',
  'Heritage Toy Train',
  'Walkable / Local Tuk-Tuk',
];

export const EXPERIENCE_INTENSITIES = [
  'Relaxed & Leisure',
  'Moderate Activity',
  'High Adrenaline / Challenging',
];
