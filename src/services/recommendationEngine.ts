import { RecommendationItem, RecommendationExplanation } from '../types/travel';
import { UserPreferences, TravelInterest } from '../types/auth';
import { RecommendationService, RecommendationPipelineOptions } from './recommendationService';
import { ScoringWeights, DEFAULT_SCORING_WEIGHTS, ScoredRecommendation } from '../types/recommendation';
import { FeedbackService } from './feedbackService';

export { RecommendationService, FeedbackService, DEFAULT_SCORING_WEIGHTS };
export type { ScoringWeights, ScoredRecommendation };

/**
 * Compute recommendations using the full Part 2C pipeline:
 * User Context -> Preference Profile -> Candidate Generation -> Hard Constraint Filtering ->
 * Feature Extraction -> Personalized Scoring -> Quality Validation -> Freshness Validation ->
 * Diversity Adjustment -> Explanation Generation -> Feedback Integration
 */
export function computeRecommendations(
  preferences: UserPreferences,
  savedItemIds: Set<string> = new Set(),
  hiddenItemIds: Set<string> = new Set(),
  options: RecommendationPipelineOptions = {}
): RecommendationItem[] {
  const scored = RecommendationService.getRecommendations(preferences, {
    limit: 24,
    weights: options.weights || DEFAULT_SCORING_WEIGHTS,
    currentSeason: options.currentSeason || 'Autumn',
  });

  return scored
    .filter((s) => !hiddenItemIds.has(s.id))
    .map((s) => {
      const explanation: RecommendationExplanation = {
        overallMatchScore: s.matchScore,
        matchedInterests: s.explanation.matchedReasons,
        matchedBudget: s.explanation.budgetFitText,
        matchedPace: s.explanation.paceFitText,
        matchedParty: s.explanation.partyFitText,
        reasonText: `${s.explanation.matchedReasons.join(' • ')}. ${s.explanation.seasonalFit}.`,
        criteriaBreakdown: {
          interestWeight: s.explanation.scoringBreakdown?.interestScore || 25,
          budgetWeight: s.explanation.scoringBreakdown?.budgetScore || 15,
          distanceWeight: s.explanation.scoringBreakdown?.distanceScore || 10,
          seasonalityWeight: s.explanation.scoringBreakdown?.contextScore || 15,
        },
      };

      return {
        id: s.id,
        type: s.itemType as any,
        title: s.title,
        subtitle: s.subtitle,
        imageUrl: s.imageUrl,
        category: s.category as TravelInterest,
        location: s.location,
        estimatedBudget: s.estimatedBudget,
        idealDuration: s.idealDuration,
        dataClassification: s.dataClassification,
        source: s.source,
        matchScore: s.matchScore,
        explanation,
        isSaved: savedItemIds.has(s.id) || s.isSaved,
        isNotInterested: false,
      };
    });
}
