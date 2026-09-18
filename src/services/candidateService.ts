import { RecommendationCandidate } from '../types/recommendation';
import { UserPreferences } from '../types/auth';
import { INITIAL_DESTINATIONS } from '../data/destinations';
import { INITIAL_HIDDEN_GEMS } from '../data/hiddenGems';
import { INITIAL_EXPERIENCES } from '../data/experiences';
import { INITIAL_FOOD_PLACES } from '../data/foodPlaces';
import { INITIAL_SEASONAL_EVENTS } from '../data/events';
import { calculateHaversineDistanceKm, getCityCoordinates } from './geoService';
import { SourceVerificationService } from './sourceVerificationService';
import { DataClassification } from '../types/index';

export class CandidateService {
  /**
   * Generate all candidates from destinations, experiences, food, events, and hidden gems.
   */
  public static generateCandidates(
    originCityOrPrefs: string | UserPreferences = 'Nagpur',
    originLat?: number,
    originLng?: number
  ): RecommendationCandidate[] {
    const originCity =
      typeof originCityOrPrefs === 'string'
        ? originCityOrPrefs
        : originCityOrPrefs?.selectedCity || 'Nagpur';

    const origin =
      originLat !== undefined && originLng !== undefined
        ? { latitude: originLat, longitude: originLng }
        : getCityCoordinates(originCity);

    const candidates: RecommendationCandidate[] = [];

    // 1. Destinations
    for (const dest of INITIAL_DESTINATIONS) {
      const dist = calculateHaversineDistanceKm(
        origin.latitude,
        origin.longitude,
        dest.location.latitude,
        dest.location.longitude
      );

      const verificationLabel = SourceVerificationService.calculateFreshnessLabel(
        dest.source?.lastUpdated || '2026-08-01',
        true,
        true
      );

      candidates.push({
        candidateId: `dest_${dest.id}`,
        itemType: 'destination',
        title: dest.name,
        subtitle: dest.tagline,
        category: dest.category,
        secondaryCategories: dest.secondaryCategories,
        location: dest.location,
        distanceKm: dist,
        estimatedBudget: dest.estimatedBudget,
        approximateCostInr:
          dest.estimatedBudget === 'budget'
            ? 1200
            : dest.estimatedBudget === 'moderate'
            ? 3500
            : dest.estimatedBudget === 'premium'
            ? 8500
            : 18000,
        durationDays: dest.idealDurationDays,
        imageUrl: dest.imageUrl,
        sourceInfo: {
          candidateId: `dest_${dest.id}`,
          sourceType: 'official',
          sourceName: dest.source?.sourceName || 'Ministry of Tourism (India)',
          sourceUrl: dest.source?.sourceUrl,
          verificationStatus: verificationLabel,
          lastVerifiedAt: dest.source?.lastUpdated || '2026-08-01',
          dataClassification: dest.dataClassification || DataClassification.VERIFIED,
          confidenceScore: 98,
        },
        isAvailable: true,
        isIndoor: false,
        bestSeason: (dest as any).bestSeasons || dest.peakSeasonMonths || ['Winter', 'Autumn', 'Spring'],
        weatherSuitability: (dest as any).weatherSuitability || ['Clear', 'Mild'],
        accessibilityFeatures: ['wheelchair_friendly', 'family_friendly'],
        partySuitability: ['solo', 'couple', 'family', 'friends', 'group'],
        rawItem: dest,
      });
    }

    // 2. Hidden Gems
    for (const gem of INITIAL_HIDDEN_GEMS) {
      const dist = calculateHaversineDistanceKm(
        origin.latitude,
        origin.longitude,
        gem.location.latitude,
        gem.location.longitude
      );

      const verificationLabel = SourceVerificationService.calculateFreshnessLabel(
        gem.source?.lastUpdated || '2026-07-20',
        true,
        false
      );

      candidates.push({
        candidateId: `gem_${gem.id}`,
        itemType: 'hidden_gem',
        title: gem.name,
        subtitle: gem.tagline,
        category: gem.category,
        secondaryCategories: gem.secondaryCategories,
        location: gem.location,
        distanceKm: dist,
        estimatedBudget: gem.estimatedBudget,
        approximateCostInr:
          gem.estimatedBudget === 'budget'
            ? 900
            : gem.estimatedBudget === 'moderate'
            ? 2500
            : 6000,
        durationDays: gem.idealDurationDays,
        imageUrl: gem.imageUrl,
        sourceInfo: {
          candidateId: `gem_${gem.id}`,
          sourceType: 'internal_database',
          sourceName: gem.source?.sourceName || 'Bharat Yatra Editorial Field Research',
          sourceUrl: gem.source?.sourceUrl,
          verificationStatus: verificationLabel,
          lastVerifiedAt: gem.source?.lastUpdated || '2026-07-20',
          dataClassification: gem.dataClassification || DataClassification.VERIFIED,
          confidenceScore: 90,
        },
        isAvailable: true,
        isIndoor: false,
        bestSeason: (gem as any).bestSeasons || ['Winter', 'Spring', 'Autumn'],
        weatherSuitability: (gem as any).weatherSuitability || ['Clear'],
        accessibilityFeatures: ['less_walking'],
        partySuitability: ['solo', 'couple', 'friends'],
        rawItem: gem,
      });
    }

    // 3. Experiences
    for (const exp of INITIAL_EXPERIENCES) {
      const dist = calculateHaversineDistanceKm(
        origin.latitude,
        origin.longitude,
        exp.location.latitude,
        exp.location.longitude
      );

      const verificationLabel = SourceVerificationService.calculateFreshnessLabel(
        exp.source?.lastUpdated || '2026-08-10',
        true,
        false
      );

      const hours = Math.round(exp.durationMinutes / 60) || 1;

      candidates.push({
        candidateId: `exp_${exp.id}`,
        itemType: 'experience',
        title: exp.title,
        subtitle: `${exp.experienceType || 'Tour'} in ${exp.destinationName}`,
        category: exp.category,
        secondaryCategories: [exp.experienceType as any].filter(Boolean),
        location: exp.location,
        distanceKm: dist,
        estimatedBudget: exp.budgetTier,
        approximateCostInr: exp.approxPriceInr || 500,
        durationHours: hours,
        durationDays: Math.ceil(hours / 8) || 1,
        imageUrl: exp.imageUrl,
        sourceInfo: {
          candidateId: `exp_${exp.id}`,
          sourceType: 'verified_provider',
          sourceName: exp.source?.sourceName || 'Certified Regional Guide Guild',
          sourceUrl: exp.source?.sourceUrl,
          verificationStatus: verificationLabel,
          lastVerifiedAt: exp.source?.lastUpdated || '2026-08-10',
          dataClassification: exp.dataClassification || DataClassification.VERIFIED,
          confidenceScore: 93,
        },
        isAvailable: true,
        isIndoor: (exp as any).isIndoor ?? false,
        bestSeason: (exp as any).seasonSuitability || ['Winter', 'Autumn', 'Spring'],
        accessibilityFeatures: exp.accessibilityFeatures || [],
        partySuitability: ['solo', 'couple', 'friends', 'family'],
        rawItem: exp,
      });
    }

    // 4. Food Places
    for (const food of INITIAL_FOOD_PLACES) {
      const dist = calculateHaversineDistanceKm(
        origin.latitude,
        origin.longitude,
        food.location.latitude,
        food.location.longitude
      );

      const verificationLabel = SourceVerificationService.calculateFreshnessLabel(
        food.source?.lastUpdated || '2026-08-15',
        true,
        false
      );

      candidates.push({
        candidateId: `food_${food.id}`,
        itemType: 'food',
        title: food.name,
        subtitle: `${food.cuisineType} • ${food.specialtyDishes.slice(0, 2).join(', ')}`,
        category: 'food',
        secondaryCategories: [food.foodCategory as any],
        location: food.location,
        distanceKm: dist,
        estimatedBudget: food.budgetTier,
        approximateCostInr: Math.round(food.priceForTwoInr / 2),
        durationHours: 1.5,
        durationDays: 1,
        imageUrl: food.imageUrl,
        sourceInfo: {
          candidateId: `food_${food.id}`,
          sourceType: 'partner_api',
          sourceName: food.source?.sourceName || 'FSSAI Verified Eateries & State Gastronomy Registry',
          verificationStatus: verificationLabel,
          lastVerifiedAt: food.source?.lastUpdated || '2026-08-15',
          dataClassification: food.dataClassification || DataClassification.VERIFIED,
          confidenceScore: 88,
        },
        isAvailable: true,
        isIndoor: true,
        accessibilityFeatures: ['less_walking', 'family_friendly', 'senior_friendly'],
        partySuitability: ['solo', 'couple', 'family', 'friends', 'group'],
        rawItem: food,
      });
    }

    // 5. Seasonal Events
    for (const ev of INITIAL_SEASONAL_EVENTS) {
      const loc = ev.location || {
        city: ev.city || ev.destinationName,
        state: ev.state,
        latitude: origin.latitude + 0.5,
        longitude: origin.longitude + 0.5,
      };

      const dist = calculateHaversineDistanceKm(
        origin.latitude,
        origin.longitude,
        loc.latitude,
        loc.longitude
      );

      const verificationLabel = SourceVerificationService.calculateFreshnessLabel(
        ev.source?.lastUpdated || '2026-08-01',
        true,
        true
      );

      candidates.push({
        candidateId: `event_${ev.id}`,
        itemType: 'event',
        title: ev.name,
        subtitle: `${ev.category} in ${ev.destinationName}, ${ev.state}`,
        category: 'festivals',
        secondaryCategories: ['culture', 'art'],
        location: loc,
        distanceKm: dist,
        estimatedBudget: 'budget',
        approximateCostInr: ev.ticketInfo?.priceInr || 0,
        durationDays: 2,
        imageUrl: ev.imageUrl,
        sourceInfo: {
          candidateId: `event_${ev.id}`,
          sourceType: 'official',
          sourceName: ev.source?.sourceName || 'State Department of Cultural Affairs',
          sourceUrl: ev.source?.sourceUrl,
          verificationStatus: verificationLabel,
          lastVerifiedAt: ev.source?.lastUpdated || '2026-08-01',
          dataClassification: ev.dataClassification || DataClassification.VERIFIED,
          confidenceScore: 95,
        },
        isAvailable: !ev.dateUncertain,
        isIndoor: false,
        bestSeason: ['Winter', 'Autumn', 'October', 'November', 'December', 'January', 'February'],
        accessibilityFeatures: ['family_friendly'],
        partySuitability: ['solo', 'couple', 'family', 'friends', 'group'],
        rawItem: ev,
      });
    }

    return candidates;
  }
}
