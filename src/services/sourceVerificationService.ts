import { VerificationLabelType, SourceAttribution } from '../types/travel';
import { CandidateSourceType, CandidateSourceInfo } from '../types/recommendation';
import { DataClassification } from '../types/index';

/**
 * 5-tier Source Priority:
 * 1. Official government or tourism source (ASI, Ministry of Tourism, State Tourism)
 * 2. Verified provider source (licensed guides, registered heritage hotels, certified operators)
 * 3. Trusted partner API (State road transport, official ticketing portals)
 * 4. Verified internal database (Bharat Yatra editorial field verifications)
 * 5. Moderated community content
 */
export const SOURCE_TIER_PRIORITY: Record<CandidateSourceType, number> = {
  official: 1,
  verified_provider: 2,
  partner_api: 3,
  internal_database: 4,
  community: 5,
};

export class SourceVerificationService {
  /**
   * Determine verification label based on last verified date and freshness
   */
  public static calculateFreshnessLabel(
    lastVerifiedDateStr?: string,
    isAvailable: boolean = true,
    isOfficial: boolean = false
  ): VerificationLabelType {
    if (!isAvailable) {
      return 'Unavailable';
    }

    if (!lastVerifiedDateStr) {
      return 'Needs Verification';
    }

    try {
      const verifiedTime = new Date(lastVerifiedDateStr).getTime();
      const now = new Date('2026-09-17T00:00:00Z').getTime(); // Current app timeline
      const diffDays = (now - verifiedTime) / (1000 * 60 * 60 * 24);

      if (diffDays <= 45) {
        return 'Verified Recently';
      } else if (diffDays <= 180) {
        return 'Verified';
      } else if (diffDays <= 365) {
        return isOfficial ? 'Verified' : 'Needs Verification';
      } else {
        return 'Information May Be Outdated';
      }
    } catch {
      return 'Needs Verification';
    }
  }

  /**
   * Resolve source priority when combining multiple sources
   */
  public static resolveSourcePriority(
    sources: CandidateSourceInfo[]
  ): { preferredSource: CandidateSourceInfo; hasConflict: boolean; conflictNote?: string } {
    if (sources.length === 0) {
      return {
        preferredSource: {
          candidateId: 'unknown',
          sourceType: 'internal_database',
          sourceName: 'Bharat Yatra Editorial Curations',
          verificationStatus: 'Estimated',
          lastVerifiedAt: '2026-06-01',
          dataClassification: DataClassification.VERIFIED,
          confidenceScore: 70,
        },
        hasConflict: false,
      };
    }

    // Sort by tier priority (1 is highest), then by recency
    const sorted = [...sources].sort((a, b) => {
      const priorityDiff = SOURCE_TIER_PRIORITY[a.sourceType] - SOURCE_TIER_PRIORITY[b.sourceType];
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.lastVerifiedAt).getTime() - new Date(a.lastVerifiedAt).getTime();
    });

    const preferred = sorted[0];
    const hasConflict =
      sorted.length > 1 &&
      sorted.some(
        (s) => s.verificationStatus === 'Unavailable' && preferred.verificationStatus !== 'Unavailable'
      );

    return {
      preferredSource: preferred,
      hasConflict,
      conflictNote: hasConflict
        ? 'Secondary sources report conflicting seasonal operational schedules. Please verify with local authorities before visiting.'
        : undefined,
    };
  }

  /**
   * Standardize source attribution
   */
  public static createAttribution(
    sourceName: string,
    sourceType: CandidateSourceType,
    lastVerified: string = '2026-08-15',
    url?: string
  ): SourceAttribution {
    return {
      sourceName,
      sourceUrl: url,
      lastUpdated: lastVerified,
      confidenceScore: sourceType === 'official' ? 98 : sourceType === 'verified_provider' ? 92 : 85,
      verifiedBy: sourceType === 'official' ? 'Government Ministry / Board' : 'Bharat Yatra Verification Desk',
    };
  }
}
