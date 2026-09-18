import {
  ScoredRecommendation,
  HardConstraints,
  ScoringWeights,
  DEFAULT_SCORING_WEIGHTS,
  UserBehaviorProfile,
} from '../types/recommendation';
import { UserPreferences } from '../types/auth';
import { CandidateService } from './candidateService';
import { HardConstraintFilterService } from './hardConstraintFilterService';
import { ScoringService } from './scoringService';
import { DiversityService, ScoredCandidateItem } from './diversityService';
import { ExplanationService } from './explanationService';
import { FeedbackService } from './feedbackService';

export interface RecommendationPipelineOptions {
  limit?: number;
  weights?: ScoringWeights;
  constraintsOverride?: Partial<HardConstraints>;
  currentSeason?: string;
  allowColdStartSuggestions?: boolean;
}

export class RecommendationService {
  /**
   * Run the full multi-stage recommendation pipeline
   */
  public static getRecommendations(
    preferences: UserPreferences,
    options: RecommendationPipelineOptions = {}
  ): ScoredRecommendation[] {
    const {
      limit = 12,
      weights = DEFAULT_SCORING_WEIGHTS,
      constraintsOverride = {},
      currentSeason = 'Autumn',
    } = options;

    // 1. User Context & Preference Profile
    const behavior: UserBehaviorProfile = FeedbackService.getProfile();

    // 2. Candidate Generation
    const allCandidates = CandidateService.generateCandidates(
      preferences.selectedCity || 'Nagpur',
      preferences.latitude,
      preferences.longitude
    );

    // 3. Hard Constraint Filtering
    const hardConstraints = HardConstraintFilterService.deriveConstraints(
      preferences,
      constraintsOverride
    );

    const { passed: eligibleCandidates } = HardConstraintFilterService.filterCandidates(
      allCandidates,
      hardConstraints
    );

    // Exclude explicitly rejected items unless undone
    const nonRejected = eligibleCandidates.filter(
      (c) =>
        !behavior.rejectedItemIds.includes(c.rawItem?.id || c.candidateId) &&
        !behavior.hiddenCategories.includes(c.category)
    );

    // 4. Feature Extraction & Personalized Scoring
    const scoredList: ScoredCandidateItem[] = nonRejected.map((candidate) => {
      const { finalScore, breakdown, matchedReasons } = ScoringService.scoreCandidate(
        candidate,
        preferences,
        behavior,
        weights,
        currentSeason
      );
      return {
        candidate,
        score: finalScore,
        breakdown,
        matchedReasons,
      };
    });

    // 5. Quality & Freshness Validation (Drop items marked Unavailable unless requested)
    const qualityValid = scoredList.filter(
      (item) => item.candidate.sourceInfo.verificationStatus !== 'Unavailable'
    );

    // 6. Diversity Adjustment
    const diversified = DiversityService.diversify(qualityValid, limit * 2);

    // 7. Explanation Generation & Recommendation Delivery
    const results: ScoredRecommendation[] = diversified.slice(0, limit).map(({ candidate, score, breakdown, matchedReasons }) => {
      const explanation = ExplanationService.generateExplanation(
        candidate,
        preferences,
        score,
        breakdown,
        matchedReasons
      );

      const rawId = candidate.rawItem?.id || candidate.candidateId;

      return {
        id: rawId,
        candidateId: candidate.candidateId,
        itemType: candidate.itemType,
        title: candidate.title,
        subtitle: candidate.subtitle || '',
        imageUrl: candidate.imageUrl,
        category: candidate.category,
        location: candidate.location,
        distanceKm: candidate.distanceKm,
        estimatedBudget: candidate.estimatedBudget,
        approximateCostInr: candidate.approximateCostInr,
        idealDuration: candidate.durationDays ? `${candidate.durationDays} Days` : `${candidate.durationHours || 4} Hours`,
        dataClassification: candidate.sourceInfo.dataClassification,
        source: explanation.source,
        verificationStatus: candidate.sourceInfo.verificationStatus,
        matchScore: score,
        explanation,
        isSaved: behavior.savedItemIds.includes(rawId),
        isLiked: behavior.likedItemIds.includes(rawId),
        rawItem: candidate.rawItem,
      };
    });

    return results;
  }

  /**
   * Section: "Because You Liked" - Based on user's liked or saved items
   */
  public static getBecauseYouLiked(
    preferences: UserPreferences,
    limit: number = 6
  ): ScoredRecommendation[] {
    const behavior = FeedbackService.getProfile();
    const likedOrSaved = [...behavior.likedItemIds, ...behavior.savedItemIds];
    const all = RecommendationService.getRecommendations(preferences, { limit: 24 });

    if (likedOrSaved.length > 0) {
      // Find categories of liked items
      const likedCategories = all
        .filter((item) => likedOrSaved.includes(item.id))
        .map((item) => item.category);

      const similar = all.filter(
        (item) =>
          !likedOrSaved.includes(item.id) &&
          (likedCategories.includes(item.category) || item.matchScore >= 80)
      );
      if (similar.length > 0) {
        return similar.slice(0, limit);
      }
    }

    // Fallback: high match score items
    return all.slice(0, limit);
  }

  /**
   * Section: "Based on Your Interests" - Specifically filtered to active user interests
   */
  public static getBasedOnInterests(
    preferences: UserPreferences,
    limit: number = 6
  ): ScoredRecommendation[] {
    const all = RecommendationService.getRecommendations(preferences, { limit: 25 });
    const userInterests = preferences.interests || [];

    const interestMatched = all.filter(
      (item) =>
        userInterests.includes(item.category as any) ||
        item.explanation.matchedReasons.some((r) =>
          userInterests.some((ui) => r.toLowerCase().includes(ui.toLowerCase()))
        )
    );

    return (interestMatched.length >= 3 ? interestMatched : all).slice(0, limit);
  }

  /**
   * Section: "Hidden Gems" - Lesser known, high quality gems
   */
  public static getHiddenGems(
    preferences: UserPreferences,
    limit: number = 6
  ): ScoredRecommendation[] {
    const all = RecommendationService.getRecommendations(preferences, { limit: 30 });
    const gems = all.filter(
      (item) =>
        item.itemType === 'hidden_gem' ||
        (item.rawItem && (item.rawItem.isHiddenGem || item.rawItem.tagline?.toLowerCase().includes('hidden')))
    );
    return (gems.length >= 2 ? gems : all.filter((i) => i.matchScore >= 75)).slice(0, limit);
  }

  /**
   * Section: "Trending Near You" - Closer distance (< 400km)
   */
  public static getTrendingNearYou(
    preferences: UserPreferences,
    limit: number = 6
  ): ScoredRecommendation[] {
    const all = RecommendationService.getRecommendations(preferences, { limit: 30 });
    const near = all.filter((item) => item.distanceKm !== undefined && item.distanceKm <= 450);
    const sorted = near.sort((a, b) => (a.distanceKm || 999) - (b.distanceKm || 999));
    return (sorted.length >= 2 ? sorted : all).slice(0, limit);
  }

  /**
   * Section: "Suggested for Your Budget" - Strict match to user budget tier
   */
  public static getSuggestedForBudget(
    preferences: UserPreferences,
    limit: number = 6
  ): ScoredRecommendation[] {
    const all = RecommendationService.getRecommendations(preferences, { limit: 25 });
    const budgetMatches = all.filter((item) => item.estimatedBudget === preferences.budget);
    return (budgetMatches.length >= 2 ? budgetMatches : all).slice(0, limit);
  }

  /**
   * Section: "Recommended for Your Travel Style" - Matches pace & party style
   */
  public static getRecommendedForTravelStyle(
    preferences: UserPreferences,
    limit: number = 6
  ): ScoredRecommendation[] {
    const all = RecommendationService.getRecommendations(preferences, { limit: 25 });
    return all
      .filter((item) => item.matchScore >= 80)
      .slice(0, limit);
  }

  /**
   * Section: "Recently Viewed / Continue Exploring"
   */
  public static getRecentlyViewed(
    preferences: UserPreferences,
    limit: number = 6
  ): ScoredRecommendation[] {
    const behavior = FeedbackService.getProfile();
    const all = RecommendationService.getRecommendations(preferences, { limit: 35 });
    const viewed = all.filter((item) => behavior.viewedItemIds.includes(item.id));
    return viewed.slice(0, limit);
  }

  /**
   * Section: "Similar Experiences" to a given item
   */
  public static getSimilarExperiences(
    targetCategory: string,
    preferences: UserPreferences,
    limit: number = 4
  ): ScoredRecommendation[] {
    const all = RecommendationService.getRecommendations(preferences, { limit: 25 });
    const similar = all.filter((item) => item.category.toLowerCase() === targetCategory.toLowerCase());
    return (similar.length > 0 ? similar : all).slice(0, limit);
  }
}
