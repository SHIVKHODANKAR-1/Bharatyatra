import {
  RecommendationCandidate,
  ScoringWeights,
  DEFAULT_SCORING_WEIGHTS,
  ScoringBreakdown,
  UserBehaviorProfile,
} from '../types/recommendation';
import { UserPreferences } from '../types/auth';
import { FeedbackService } from './feedbackService';

export class ScoringService {
  /**
   * Score a candidate against user preferences, behavior, context and configurable weights.
   */
  public static scoreCandidate(
    candidate: RecommendationCandidate,
    preferences: UserPreferences,
    behavior: UserBehaviorProfile = FeedbackService.getUserBehavior(),
    weights: ScoringWeights = DEFAULT_SCORING_WEIGHTS,
    currentSeason: string = 'Autumn'
  ): { finalScore: number; breakdown: ScoringBreakdown; matchedReasons: string[] } {
    const matchedReasons: string[] = [];

    // 1. Interest Score (0 to 1)
    let interestScore = 0.35; // base compatibility
    const userInterests = preferences.interests || [];
    const isDirectMatch = userInterests.includes(candidate.category as any);
    const isSecondaryMatch = candidate.secondaryCategories?.some((cat) =>
      userInterests.includes(cat as any)
    );

    if (isDirectMatch) {
      interestScore = 1.0;
      matchedReasons.push(`Matches your interest in ${candidate.category}`);
    } else if (isSecondaryMatch) {
      interestScore = 0.85;
      matchedReasons.push(`Relates to your cultural interest preferences`);
    } else {
      // General affinity
      interestScore = 0.45;
    }

    // 2. Budget Score (0 to 1)
    let budgetScore = 0.6;
    if (preferences.budget === candidate.estimatedBudget) {
      budgetScore = 1.0;
      matchedReasons.push(`Fits your ${preferences.budget} budget tier`);
    } else if (preferences.budget === 'luxury' || preferences.budget === 'premium') {
      budgetScore = 0.9;
      matchedReasons.push(`Within comfortable financial allowance`);
    } else if (preferences.budget === 'moderate' && candidate.estimatedBudget === 'budget') {
      budgetScore = 0.95;
      matchedReasons.push(`Great value within moderate budget`);
    } else {
      budgetScore = 0.5;
    }

    // 3. Time / Duration Score (0 to 1)
    let timeScore = 0.65;
    const prefDurationDays =
      preferences.duration === 'one_day'
        ? 1
        : preferences.duration === 'weekend'
        ? 2.5
        : preferences.duration === 'three_to_five_days'
        ? 4
        : preferences.duration === 'one_week'
        ? 7
        : 14;

    const candDurationDays = candidate.durationDays || 2;
    const durationRatio = Math.min(prefDurationDays, candDurationDays) / Math.max(prefDurationDays, candDurationDays);
    timeScore = Math.max(0.4, durationRatio);
    if (timeScore >= 0.8) {
      matchedReasons.push(`Suitable for your ${preferences.duration.replace(/_/g, ' ')} window`);
    }

    // 4. Distance Score (0 to 1)
    let distanceScore = 0.7;
    const dist = candidate.distanceKm ?? 600;
    if (dist <= 150) {
      distanceScore = 1.0;
      matchedReasons.push(`Close to ${preferences.selectedCity} (under 150 km)`);
    } else if (dist <= 350) {
      distanceScore = 0.9;
      matchedReasons.push(`Convenient road/rail trip (${Math.round(dist)} km away)`);
    } else if (dist <= 750) {
      distanceScore = 0.75;
    } else if (dist <= 1500) {
      distanceScore = 0.6;
    } else {
      distanceScore = 0.45;
    }

    // 5. Availability Score (0 to 1)
    let availabilityScore = candidate.isAvailable ? 1.0 : 0.2;

    // 6. Quality & Freshness Score (0 to 1)
    let qualityScore = 0.7;
    const confidence = candidate.sourceInfo.confidenceScore || 85;
    const isRecentlyVerified = candidate.sourceInfo.verificationStatus === 'Verified Recently';
    qualityScore = (confidence / 100) * (isRecentlyVerified ? 1.0 : 0.92);

    // 7. Past Behavior Score (0 to 1)
    let behaviorScore = 0.5;
    const rawId = candidate.rawItem?.id;
    const cid = candidate.candidateId;
    const isRejected = (rawId && behavior?.rejectedItemIds?.includes(rawId)) || (cid && behavior?.rejectedItemIds?.includes(cid));
    const isSaved = (rawId && behavior?.savedItemIds?.includes(rawId)) || (cid && behavior?.savedItemIds?.includes(cid));
    const isLiked = (rawId && behavior?.likedItemIds?.includes(rawId)) || (cid && behavior?.likedItemIds?.includes(cid));
    const isViewed = (rawId && behavior?.viewedItemIds?.includes(rawId)) || (cid && behavior?.viewedItemIds?.includes(cid));

    if (isRejected) {
      behaviorScore = 0.05;
    } else if (isSaved) {
      behaviorScore = 0.95;
      matchedReasons.push(`Similar to places you saved`);
    } else if (isLiked) {
      behaviorScore = 1.0;
    } else if (isViewed) {
      behaviorScore = 0.75;
    }

    // 8. Current Context Score (Weather & Season) (0 to 1)
    let contextScore = 0.6;
    const bestSeasons = candidate.bestSeason || [];
    const isSeasonFit = bestSeasons.length === 0 || bestSeasons.some((s) => s.toLowerCase().includes('autumn') || s.toLowerCase().includes('winter') || s.toLowerCase().includes('october') || s.toLowerCase().includes('september'));
    if (isSeasonFit) {
      contextScore = 0.95;
      matchedReasons.push(`Excellent seasonal timing for September/October`);
    } else {
      contextScore = 0.6;
    }

    // 9. Diversity & Discovery Bonus (0 to 1)
    let diversityScore = 0.5;
    if (candidate.itemType === 'hidden_gem') {
      diversityScore = 0.9;
      matchedReasons.push(`Unspoiled off-beat destination offering peaceful immersion`);
    } else if (candidate.itemType === 'experience') {
      diversityScore = 0.85;
    } else if (candidate.itemType === 'food') {
      diversityScore = 0.8;
    } else {
      diversityScore = 0.65;
    }

    // Calculate weighted sum
    const totalWeight =
      weights.interestWeight +
      weights.budgetWeight +
      weights.timeWeight +
      weights.distanceWeight +
      weights.availabilityWeight +
      weights.qualityWeight +
      weights.behaviorWeight +
      weights.contextWeight +
      weights.diversityWeight;

    const weightedScore =
      interestScore * weights.interestWeight +
      budgetScore * weights.budgetWeight +
      timeScore * weights.timeWeight +
      distanceScore * weights.distanceWeight +
      availabilityScore * weights.availabilityWeight +
      qualityScore * weights.qualityWeight +
      behaviorScore * weights.behaviorWeight +
      contextScore * weights.contextWeight +
      diversityScore * weights.diversityWeight;

    const normalizedScore = totalWeight > 0 ? (weightedScore / totalWeight) * 100 : 70;
    // Bound realistically between 60% and 98% (avoid fake 100% certainty)
    const finalScore = Math.round(Math.min(98, Math.max(55, normalizedScore)));

    const breakdown: ScoringBreakdown = {
      interestScore: Math.round(interestScore * 100),
      budgetScore: Math.round(budgetScore * 100),
      timeScore: Math.round(timeScore * 100),
      distanceScore: Math.round(distanceScore * 100),
      availabilityScore: Math.round(availabilityScore * 100),
      qualityScore: Math.round(qualityScore * 100),
      behaviorScore: Math.round(behaviorScore * 100),
      contextScore: Math.round(contextScore * 100),
      diversityScore: Math.round(diversityScore * 100),
      finalScore,
    };

    return {
      finalScore,
      breakdown,
      matchedReasons: matchedReasons.length > 0 ? matchedReasons : ['Aligns with your cultural travel preferences'],
    };
  }
}
