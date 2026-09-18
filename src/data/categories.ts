import { TravelInterest } from '../types/auth';

export interface CategoryInfo {
  id: TravelInterest;
  iconName: string;
  labelEn: string;
  labelHi: string;
  labelMr: string;
  count: number;
}

export const CATEGORIES: CategoryInfo[] = [
  { id: 'heritage', iconName: 'Landmark', labelEn: 'Heritage', labelHi: 'विरासत', labelMr: 'वारसा', count: 48 },
  { id: 'nature', iconName: 'Trees', labelEn: 'Nature', labelHi: 'प्रकृति', labelMr: 'निसर्ग', count: 62 },
  { id: 'spiritual', iconName: 'Flame', labelEn: 'Spiritual', labelHi: 'आध्यात्मिक', labelMr: 'अध्यात्म', count: 54 },
  { id: 'food', iconName: 'Utensils', labelEn: 'Food & Cuisine', labelHi: 'खान-पान', labelMr: 'खाद्यसंस्कृती', count: 70 },
  { id: 'mountains', iconName: 'Mountain', labelEn: 'Mountains', labelHi: 'पहाड़', labelMr: 'डोंगररांगा', count: 39 },
  { id: 'beaches', iconName: 'Waves', labelEn: 'Beaches', labelHi: 'समुद्र तट', labelMr: 'समुद्रकिनारे', count: 31 },
  { id: 'wildlife', iconName: 'Compass', labelEn: 'Wildlife', labelHi: 'वन्यजीव', labelMr: 'वन्यजीव', count: 28 },
  { id: 'adventure', iconName: 'Footprints', labelEn: 'Adventure', labelHi: 'रोमांच', labelMr: 'साहस', count: 45 },
  { id: 'culture', iconName: 'Sparkles', labelEn: 'Local Culture', labelHi: 'स्थानीय संस्कृति', labelMr: 'स्थानिक संस्कृती', count: 56 },
  { id: 'festivals', iconName: 'CalendarDays', labelEn: 'Festivals', labelHi: 'त्योहार', labelMr: 'उत्सव', count: 34 },
  { id: 'shopping', iconName: 'ShoppingBag', labelEn: 'Bazaars & Crafts', labelHi: 'बाज़ार व हस्तशिल्प', labelMr: 'बाजार आणि हस्तकला', count: 42 },
  { id: 'photography', iconName: 'Camera', labelEn: 'Photography', labelHi: 'फोटोग्राफी', labelMr: 'छायाचित्रण', count: 50 },
];

export interface MajorCity {
  name: string;
  state: string;
  latitude: number;
  longitude: number;
  popularAirportCode?: string;
}

export const MAJOR_INDIAN_CITIES: MajorCity[] = [
  { name: 'Nagpur', state: 'Maharashtra', latitude: 21.1458, longitude: 79.0882, popularAirportCode: 'NAG' },
  { name: 'Mumbai', state: 'Maharashtra', latitude: 19.0760, longitude: 72.8777, popularAirportCode: 'BOM' },
  { name: 'Delhi', state: 'Delhi NCR', latitude: 28.6139, longitude: 77.2090, popularAirportCode: 'DEL' },
  { name: 'Bengaluru', state: 'Karnataka', latitude: 12.9716, longitude: 77.5946, popularAirportCode: 'BLR' },
  { name: 'Jaipur', state: 'Rajasthan', latitude: 26.9124, longitude: 75.7873, popularAirportCode: 'JAI' },
  { name: 'Varanasi', state: 'Uttar Pradesh', latitude: 25.3176, longitude: 82.9739, popularAirportCode: 'VNS' },
  { name: 'Kochi', state: 'Kerala', latitude: 9.9312, longitude: 76.2673, popularAirportCode: 'COK' },
  { name: 'Pune', state: 'Maharashtra', latitude: 18.5204, longitude: 73.8567, popularAirportCode: 'PNQ' },
  { name: 'Kolkata', state: 'West Bengal', latitude: 22.5726, longitude: 88.3639, popularAirportCode: 'CCU' },
  { name: 'Hyderabad', state: 'Telangana', latitude: 17.3850, longitude: 78.4867, popularAirportCode: 'HYD' },
  { name: 'Chennai', state: 'Tamil Nadu', latitude: 13.0827, longitude: 80.2707, popularAirportCode: 'MAA' },
  { name: 'Guwahati', state: 'Assam', latitude: 26.1445, longitude: 91.7362, popularAirportCode: 'GAU' },
  { name: 'Shimla', state: 'Himachal Pradesh', latitude: 31.1048, longitude: 77.1734, popularAirportCode: 'SLV' },
  { name: 'Amritsar', state: 'Punjab', latitude: 31.6340, longitude: 74.8723, popularAirportCode: 'ATQ' },
  { name: 'Ahmedabad', state: 'Gujarat', latitude: 23.0225, longitude: 72.5714, popularAirportCode: 'AMD' },
  { name: 'Bhopal', state: 'Madhya Pradesh', latitude: 23.2599, longitude: 77.4126, popularAirportCode: 'BHO' },
];
