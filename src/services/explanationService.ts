import {
  RecommendationCandidate,
  RecommendationExplanationDetail,
  ScoringBreakdown,
} from '../types/recommendation';
import { UserPreferences } from '../types/auth';

export class ExplanationService {
  /**
   * Generates a clear, human-friendly explanation of why an item matches the user.
   * Deliberately avoids exposing raw weights or mathematical formulas to users.
   */
  public static generateExplanation(
    candidate: RecommendationCandidate,
    preferences: UserPreferences,
    score: number,
    breakdown: ScoringBreakdown,
    matchedReasons: string[]
  ): RecommendationExplanationDetail {
    const distText =
      candidate.distanceKm !== undefined
        ? candidate.distanceKm < 100
          ? `Day excursion (${Math.round(candidate.distanceKm)} km from ${preferences.selectedCity})`
          : `Within ${Math.round(candidate.distanceKm)} km from ${preferences.selectedCity}`
        : 'Across India';

    const budgetFitText =
      candidate.estimatedBudget === preferences.budget
        ? `Directly matches your ${preferences.budget} budget preference`
        : `Accessible within ${preferences.budget} travel range`;

    const partyFitText = `Ideal for ${preferences.party} voyages with supportive amenities`;
    const paceFitText = `Calibrated for a ${preferences.pace} travel tempo`;

    const seasonalFit =
      candidate.bestSeason && candidate.bestSeason.length > 0
        ? `Best experienced in ${candidate.bestSeason.slice(0, 3).join(', ')}`
        : 'Pleasant year-round visiting conditions';

    const crowdSuitability =
      candidate.itemType === 'hidden_gem'
        ? 'Low crowd density — peaceful cultural sanctuary'
        : 'Moderate visitor flow with scheduled viewing slots';

    return {
      overallMatchScore: score,
      matchedReasons,
      seasonalFit,
      crowdSuitability,
      distanceText: distText,
      budgetFitText,
      partyFitText,
      paceFitText,
      freshnessLabel: candidate.sourceInfo.verificationStatus,
      source: {
        sourceName: candidate.sourceInfo.sourceName,
        sourceUrl: candidate.sourceInfo.sourceUrl,
        lastUpdated: candidate.sourceInfo.lastVerifiedAt,
        confidenceScore: candidate.sourceInfo.confidenceScore,
        verifiedBy: candidate.sourceInfo.sourceType === 'official' ? 'Official Ministry / Board' : 'Bharat Yatra Editorial',
      },
      scoringBreakdown: breakdown,
    };
  }
}
