import { RecommendationCandidate, ScoringBreakdown } from '../types/recommendation';

export interface ScoredCandidateItem {
  candidate: RecommendationCandidate;
  score: number;
  breakdown: ScoringBreakdown;
  matchedReasons: string[];
}

export class DiversityService {
  /**
   * Apply diversity adjustments to ranked candidates to ensure varied geography,
   * category types, budget tiers, and blend in qualified hidden gems.
   */
  public static diversify(
    items: ScoredCandidateItem[],
    limit: number = 20
  ): ScoredCandidateItem[] {
    if (items.length <= limit) {
      return [...items].sort((a, b) => b.score - a.score);
    }

    const selected: ScoredCandidateItem[] = [];
    const remaining = [...items].sort((a, b) => b.score - a.score);

    const categoryCounts: Record<string, number> = {};
    const stateCounts: Record<string, number> = {};
    const typeCounts: Record<string, number> = {};

    // 1. Pick the absolute highest match first
    if (remaining.length > 0) {
      const top = remaining.shift()!;
      selected.push(top);
      categoryCounts[top.candidate.category] = 1;
      stateCounts[top.candidate.location.state] = 1;
      typeCounts[top.candidate.itemType] = 1;
    }

    // 2. Iterate and select with diversity penalties for over-represented buckets
    while (selected.length < limit && remaining.length > 0) {
      let bestIdx = 0;
      let bestAdjustedScore = -Infinity;

      for (let i = 0; i < remaining.length; i++) {
        const item = remaining[i];
        const cat = item.candidate.category;
        const state = item.candidate.location.state;
        const itemType = item.candidate.itemType;

        const catPenalty = (categoryCounts[cat] || 0) * 4;
        const statePenalty = (stateCounts[state] || 0) * 3;
        const typePenalty = (typeCounts[itemType] || 0) * 2;

        // Hidden gems get a modest novelty boost if not too frequent
        const noveltyBoost =
          item.candidate.itemType === 'hidden_gem' && (typeCounts['hidden_gem'] || 0) < 3 ? 3 : 0;

        const adjustedScore = item.score - catPenalty - statePenalty - typePenalty + noveltyBoost;

        if (adjustedScore > bestAdjustedScore) {
          bestAdjustedScore = adjustedScore;
          bestIdx = i;
        }
      }

      const [chosen] = remaining.splice(bestIdx, 1);
      selected.push(chosen);

      categoryCounts[chosen.candidate.category] = (categoryCounts[chosen.candidate.category] || 0) + 1;
      stateCounts[chosen.candidate.location.state] = (stateCounts[chosen.candidate.location.state] || 0) + 1;
      typeCounts[chosen.candidate.itemType] = (typeCounts[chosen.candidate.itemType] || 0) + 1;
    }

    return selected;
  }
}
