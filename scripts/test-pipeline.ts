import assert from 'node:assert';
import { SourceVerificationService } from '../src/services/sourceVerificationService';
import { HardConstraintFilterService } from '../src/services/hardConstraintFilterService';
import { ScoringService } from '../src/services/scoringService';
import { DiversityService } from '../src/services/diversityService';
import { ExplanationService } from '../src/services/explanationService';
import { FeedbackService } from '../src/services/feedbackService';
import { RecommendationService } from '../src/services/recommendationService';
import { RetrievalService } from '../src/services/retrievalService';
import { CandidateService } from '../src/services/candidateService';
import { UserPreferences } from '../src/types/auth';
import { RecommendationCandidate, DEFAULT_SCORING_WEIGHTS } from '../src/types/recommendation';
import { DataClassification } from '../src/types/index';

console.log('--- Starting Bharat Yatra Part 2C Test Suite ---');

const mockPrefs: UserPreferences = {
  language: 'en',
  selectedCity: 'Nagpur',
  useCurrentLocation: false,
  interests: ['heritage', 'nature', 'spiritual'],
  budget: 'moderate',
  duration: 'weekend',
  party: 'family',
  pace: 'balanced',
  accessibility: ['family_friendly'],
  weatherAwareRecommendations: true,
  onboardingCompleted: true,
  onboardingStep: 5,
};

// 1. Source Verification Tests
console.log('1. Testing Source Verification & Freshness Tiering...');
const freshLabel = SourceVerificationService.calculateFreshnessLabel(
  '2026-08-20',
  true,
  false
);
assert.strictEqual(freshLabel, 'Verified Recently', 'Recent verified item should have Verified Recently label');

const needsVerifLabel = SourceVerificationService.calculateFreshnessLabel(
  '2025-12-01',
  true,
  false
);
assert.strictEqual(needsVerifLabel, 'Needs Verification', 'Item verified ~280 days ago non-official should require verification');

const outdatedLabel = SourceVerificationService.calculateFreshnessLabel(
  '2024-01-01',
  true,
  false
);
assert.strictEqual(outdatedLabel, 'Information May Be Outdated', 'Item verified >365 days ago should be Information May Be Outdated');

const resolved = SourceVerificationService.resolveSourcePriority([
  {
    candidateId: 'c1',
    sourceType: 'community',
    sourceName: 'User Forum',
    verificationStatus: 'Estimated',
    lastVerifiedAt: '2026-08-01',
    dataClassification: DataClassification.USER_GENERATED,
    confidenceScore: 60,
  },
  {
    candidateId: 'c1',
    sourceType: 'official',
    sourceName: 'Archaeological Survey of India',
    verificationStatus: 'Verified',
    lastVerifiedAt: '2026-07-01',
    dataClassification: DataClassification.VERIFIED,
    confidenceScore: 98,
  },
]);
assert.strictEqual(resolved.preferredSource.sourceType, 'official', 'Official source must take priority over community');
console.log('✓ Source Verification tests passed');

// 2. Hard Constraint Filter Tests
console.log('2. Testing Hard Constraint Filtering...');
const candidates = CandidateService.generateCandidates(mockPrefs);
assert.ok(candidates.length > 5, 'Should generate more than 5 candidates');

const distConstraints = HardConstraintFilterService.deriveConstraints(mockPrefs, {
  maxDistanceKm: 600,
});
const filteredDistance = HardConstraintFilterService.filterCandidates(candidates, distConstraints);
for (const c of filteredDistance.passed) {
  assert.ok(c.distanceKm !== undefined && c.distanceKm <= 600, `Candidate ${c.title} distance ${c.distanceKm} should be <= 600km`);
}

const budgetConstraints = HardConstraintFilterService.deriveConstraints({
  ...mockPrefs,
  budget: 'budget',
}, {
  budgetCeiling: 'budget',
});
const filteredBudget = HardConstraintFilterService.filterCandidates(candidates, budgetConstraints);
for (const c of filteredBudget.passed) {
  assert.strictEqual(c.estimatedBudget, 'budget', 'Only budget items allowed when restricted to budget ceiling');
}
console.log('✓ Hard Constraint Filter tests passed');

// 3. Scoring & Diversity Tests
console.log('3. Testing Scoring Engine & Diversity Adjustments...');
const behavior = FeedbackService.getUserBehavior();
const scoredResults = candidates.slice(0, 10).map((c) => {
  const res = ScoringService.scoreCandidate(c, mockPrefs, behavior, DEFAULT_SCORING_WEIGHTS, 'Autumn');
  return {
    candidate: c,
    score: res.finalScore,
    breakdown: res.breakdown,
    matchedReasons: res.matchedReasons,
  };
});

for (const s of scoredResults) {
  assert.ok(s.score >= 0 && s.score <= 100, `Score ${s.score} should be within 0-100`);
  assert.ok(s.breakdown.interestScore >= 0, 'Interest score should be computed');
}

// Full RecommendationService pipeline test
const fullPipelineRecs = RecommendationService.getRecommendations(mockPrefs, { limit: 12 });
assert.ok(fullPipelineRecs.length > 0, 'Pipeline should produce recommendations');
assert.ok(fullPipelineRecs[0].matchScore >= fullPipelineRecs[fullPipelineRecs.length - 1].matchScore, 'Should be sorted by matchScore');
console.log('✓ Scoring and Diversity tests passed');

// 4. Feedback Integration Tests
console.log('4. Testing User Feedback Integration...');
FeedbackService.resetPersonalization();
const originalItem = candidates[0];
const originalScore = ScoringService.scoreCandidate(originalItem, mockPrefs, FeedbackService.getUserBehavior(), DEFAULT_SCORING_WEIGHTS, 'Autumn').finalScore;

FeedbackService.recordFeedback(originalItem.candidateId, originalItem.itemType, 'like');
const boostedScore = ScoringService.scoreCandidate(originalItem, mockPrefs, FeedbackService.getUserBehavior(), DEFAULT_SCORING_WEIGHTS, 'Autumn').finalScore;
assert.ok(boostedScore >= originalScore, 'Positive feedback should maintain or boost score');

FeedbackService.recordFeedback(originalItem.candidateId, originalItem.itemType, 'too_expensive');
const penalizedScore = ScoringService.scoreCandidate(originalItem, mockPrefs, FeedbackService.getUserBehavior(), DEFAULT_SCORING_WEIGHTS, 'Autumn').finalScore;
assert.ok(penalizedScore < boostedScore, 'Negative feedback should lower score');
console.log('✓ Feedback Integration tests passed');

// 5. RAG Retrieval & Booking Disclaimer Tests
console.log('5. Testing Assistant RAG & Booking Inquiry Grounding...');
const bookingQuery = 'Please book 2 tickets for Taj Mahal right now';
const bookingResult = RetrievalService.processQuery(bookingQuery, mockPrefs);
assert.strictEqual(bookingResult.intent, 'Booking Question', 'Intent should be Booking Question');
assert.ok(bookingResult.warningNote, 'Booking inquiry must contain warning note');
assert.ok(
  bookingResult.responseText.includes('Archaeological Survey of India') ||
  bookingResult.responseText.includes('booking'),
  'Should provide guidance on official ticket portals'
);

const comparisonQuery = 'Compare Varanasi and Jaipur';
const comparisonResult = RetrievalService.processQuery(comparisonQuery, mockPrefs);
assert.strictEqual(comparisonResult.intent, 'Comparison', 'Intent should be Comparison');
assert.ok(comparisonResult.cardPayloads && comparisonResult.cardPayloads.length > 0, 'Comparison should return card payloads');

const clarificationQuery = 'I want to travel somewhere nice';
const clarificationResult = RetrievalService.processQuery(clarificationQuery, mockPrefs);
assert.ok(
  clarificationResult.clarifyingQuestion !== undefined,
  'Ambiguous query must trigger a clarifying question'
);
console.log('✓ Assistant RAG & Safety tests passed');

console.log('🎉 ALL BHARAT YATRA PART 2C TESTS PASSED SUCCESSFULLY! 🎉');
