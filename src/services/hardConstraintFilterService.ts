import { RecommendationCandidate, HardConstraints } from '../types/recommendation';
import { UserPreferences } from '../types/auth';

export class HardConstraintFilterService {
  /**
   * Derive default hard constraints from user profile and explicit overrides
   */
  public static deriveConstraints(
    preferences: UserPreferences,
    overrides?: Partial<HardConstraints>
  ): HardConstraints {
    const maxDays =
      preferences.duration === 'one_day'
        ? 1.5
        : preferences.duration === 'weekend'
        ? 3.5
        : preferences.duration === 'three_to_five_days'
        ? 5.5
        : preferences.duration === 'one_week'
        ? 8
        : 30;

    const requireWheelchair = preferences.accessibility?.includes('wheelchair_friendly');
    const seniorFriendlyOnly = preferences.accessibility?.includes('senior_friendly');

    return {
      budgetCeiling: preferences.budget,
      maxCostInr: preferences.customBudgetMax,
      requireWheelchair,
      seniorFriendlyOnly,
      maxDurationDays: maxDays,
      partySuitability: [preferences.party],
      allowUnavailable: false,
      onlyVerified: false,
      ...overrides,
    };
  }

  /**
   * Filter candidate items against hard constraints
   */
  public static filterCandidates(
    candidates: RecommendationCandidate[],
    constraints: HardConstraints
  ): { passed: RecommendationCandidate[]; filteredCount: number } {
    let filteredCount = 0;

    const passed = candidates.filter((candidate) => {
      // 1. Missing Critical Information Filter
      if (!candidate.candidateId || !candidate.title || !candidate.location || !candidate.category) {
        filteredCount++;
        return false;
      }

      // 2. Availability Filter
      if (!constraints.allowUnavailable && !candidate.isAvailable) {
        filteredCount++;
        return false;
      }

      // 3. Stale / Outdated Filter if onlyVerified requested
      if (constraints.onlyVerified && candidate.sourceInfo.verificationStatus === 'Information May Be Outdated') {
        filteredCount++;
        return false;
      }

      // 4. Geographic Radius Filter
      if (constraints.maxDistanceKm !== undefined && candidate.distanceKm !== undefined) {
        if (candidate.distanceKm > constraints.maxDistanceKm) {
          filteredCount++;
          return false;
        }
      }

      // 5. Duration Compatibility Filter
      if (constraints.maxDurationDays !== undefined && candidate.durationDays !== undefined) {
        if (candidate.durationDays > constraints.maxDurationDays) {
          filteredCount++;
          return false;
        }
      }

      // 6. Budget Ceiling Filter
      if (constraints.budgetCeiling === 'budget') {
        // If strict budget, exclude moderate, premium and luxury tier items
        if (candidate.estimatedBudget !== 'budget') {
          filteredCount++;
          return false;
        }
      } else if (constraints.budgetCeiling === 'moderate') {
        // If moderate ceiling, exclude premium and luxury
        if (candidate.estimatedBudget === 'luxury' || candidate.estimatedBudget === 'premium') {
          filteredCount++;
          return false;
        }
      } else if (constraints.budgetCeiling === 'premium') {
        // If premium ceiling, exclude luxury
        if (candidate.estimatedBudget === 'luxury') {
          filteredCount++;
          return false;
        }
      }

      // 7. Max Cost Inr
      if (constraints.maxCostInr !== undefined && candidate.approximateCostInr !== undefined) {
        if (candidate.approximateCostInr > constraints.maxCostInr) {
          filteredCount++;
          return false;
        }
      }

      // 8. Accessibility Requirements
      if (constraints.requireWheelchair) {
        const hasWheelchair = candidate.accessibilityFeatures?.includes('wheelchair_friendly');
        // If destination doesn't explicitly guarantee wheelchair access, check if it is not marked severe terrain
        if (candidate.itemType === 'experience' && !hasWheelchair) {
          filteredCount++;
          return false;
        }
      }

      if (constraints.seniorFriendlyOnly) {
        // For seniors, avoid intense high-altitude treks or rough activities
        if (candidate.category === 'adventure' && candidate.rawItem?.intensity === 'Strenuous') {
          filteredCount++;
          return false;
        }
      }

      // 9. Party Suitability
      if (constraints.partySuitability && constraints.partySuitability.length > 0) {
        const userParty = constraints.partySuitability[0];
        if (userParty === 'family') {
          // Exclude extreme nightlife or unsuitable adult activities
          if (candidate.category === 'nightlife') {
            filteredCount++;
            return false;
          }
        }
      }

      return true;
    });

    return { passed, filteredCount };
  }
}
