import {
  FeedbackActionType,
  RecommendationFeedback,
  UserBehaviorProfile,
  CandidateItemType,
} from '../types/recommendation';

const STORAGE_KEY_FEEDBACK = 'bharat_yatra_feedback_history_v1';
const STORAGE_KEY_BEHAVIOR = 'bharat_yatra_user_behavior_v1';

export class FeedbackService {
  private static behavior: UserBehaviorProfile = {
    viewedItemIds: [],
    savedItemIds: [],
    likedItemIds: [],
    rejectedItemIds: [],
    hiddenCategories: [],
    alreadyVisitedIds: [],
    feedbackHistory: [],
    completedTripsCount: 0,
  };

  /**
   * Load stored profile from localStorage if available
   */
  public static init(): UserBehaviorProfile {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_BEHAVIOR);
      if (stored) {
        FeedbackService.behavior = { ...FeedbackService.behavior, ...JSON.parse(stored) };
      }
    } catch {
      // ignore
    }
    return FeedbackService.behavior;
  }

  /**
   * Get current behavior profile
   */
  public static getProfile(): UserBehaviorProfile {
    return FeedbackService.behavior;
  }

  public static getUserBehavior(): UserBehaviorProfile {
    return FeedbackService.behavior;
  }

  /**
   * Record a user feedback action
   */
  public static recordFeedback(
    targetId: string,
    targetType: CandidateItemType,
    action: FeedbackActionType,
    reason?: string,
    category?: string
  ): RecommendationFeedback {
    const feedback: RecommendationFeedback = {
      id: `fb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: 'user_current',
      targetId,
      targetType,
      action,
      reason,
      createdAt: new Date().toISOString(),
    };

    FeedbackService.behavior.feedbackHistory.push(feedback);

    switch (action) {
      case 'save':
        if (!FeedbackService.behavior.savedItemIds.includes(targetId)) {
          FeedbackService.behavior.savedItemIds.push(targetId);
        }
        break;

      case 'remove_save':
        FeedbackService.behavior.savedItemIds = FeedbackService.behavior.savedItemIds.filter(
          (id) => id !== targetId
        );
        break;

      case 'like':
        FeedbackService.behavior.dislikedItemIds = (
          FeedbackService.behavior.dislikedItemIds || []
        ).filter((id) => id !== targetId);
        if (!FeedbackService.behavior.likedItemIds.includes(targetId)) {
          FeedbackService.behavior.likedItemIds.push(targetId);
        }
        break;

      case 'dislike':
        FeedbackService.behavior.likedItemIds = FeedbackService.behavior.likedItemIds.filter(
          (id) => id !== targetId
        );
        if (!FeedbackService.behavior.dislikedItemIds) {
          FeedbackService.behavior.dislikedItemIds = [];
        }
        if (!FeedbackService.behavior.dislikedItemIds.includes(targetId)) {
          FeedbackService.behavior.dislikedItemIds.push(targetId);
        }
        if (!FeedbackService.behavior.rejectedItemIds.includes(targetId)) {
          FeedbackService.behavior.rejectedItemIds.push(targetId);
        }
        break;

      case 'not_interested':
      case 'too_expensive':
      case 'too_far':
      case 'not_accessible':
      case 'wrong_season':
      case 'wrong_travel_style':
        FeedbackService.behavior.likedItemIds = FeedbackService.behavior.likedItemIds.filter((id) => id !== targetId);
        if (!FeedbackService.behavior.rejectedItemIds.includes(targetId)) {
          FeedbackService.behavior.rejectedItemIds.push(targetId);
        }
        break;

      case 'hide_similar':
        if (!FeedbackService.behavior.rejectedItemIds.includes(targetId)) {
          FeedbackService.behavior.rejectedItemIds.push(targetId);
        }
        if (category && !FeedbackService.behavior.hiddenCategories.includes(category)) {
          FeedbackService.behavior.hiddenCategories.push(category);
        }
        break;

      case 'already_visited':
        if (!FeedbackService.behavior.alreadyVisitedIds.includes(targetId)) {
          FeedbackService.behavior.alreadyVisitedIds.push(targetId);
        }
        break;

      case 'undo':
        FeedbackService.behavior.savedItemIds = FeedbackService.behavior.savedItemIds.filter((id) => id !== targetId);
        FeedbackService.behavior.likedItemIds = FeedbackService.behavior.likedItemIds.filter((id) => id !== targetId);
        FeedbackService.behavior.dislikedItemIds = (FeedbackService.behavior.dislikedItemIds || []).filter((id) => id !== targetId);
        FeedbackService.behavior.rejectedItemIds = FeedbackService.behavior.rejectedItemIds.filter((id) => id !== targetId);
        FeedbackService.behavior.alreadyVisitedIds = FeedbackService.behavior.alreadyVisitedIds.filter((id) => id !== targetId);
        break;
    }

    FeedbackService.persist();
    return feedback;
  }

  /**
   * Track recent search query
   */
  public static recordSearch(query: string): void {
    const q = query.trim();
    if (!q) return;
    if (!FeedbackService.behavior.previousSearches) {
      FeedbackService.behavior.previousSearches = [];
    }
    FeedbackService.behavior.previousSearches = [
      q,
      ...FeedbackService.behavior.previousSearches.filter((item) => item.toLowerCase() !== q.toLowerCase()),
    ].slice(0, 15);
    FeedbackService.persist();
  }

  /**
   * Track viewed item
   */
  public static recordView(itemId: string): void {
    if (!itemId) return;
    if (!FeedbackService.behavior.viewedItemIds.includes(itemId)) {
      FeedbackService.behavior.viewedItemIds.unshift(itemId);
      if (FeedbackService.behavior.viewedItemIds.length > 30) {
        FeedbackService.behavior.viewedItemIds = FeedbackService.behavior.viewedItemIds.slice(0, 30);
      }
      FeedbackService.persist();
    }
  }

  private static lastSnapshotBeforeReset: UserBehaviorProfile | null = null;

  /**
   * Reset all personalization feedback to defaults
   */
  public static resetPersonalization(): void {
    FeedbackService.lastSnapshotBeforeReset = { ...FeedbackService.behavior };
    FeedbackService.behavior = {
      viewedItemIds: [],
      savedItemIds: [],
      likedItemIds: [],
      dislikedItemIds: [],
      rejectedItemIds: [],
      hiddenCategories: [],
      alreadyVisitedIds: [],
      previousSearches: [],
      feedbackHistory: [],
      completedTripsCount: 0,
    };
    FeedbackService.persist();
  }

  /**
   * Undo reset personalization
   */
  public static undoResetPersonalization(): boolean {
    if (FeedbackService.lastSnapshotBeforeReset) {
      FeedbackService.behavior = { ...FeedbackService.lastSnapshotBeforeReset };
      FeedbackService.lastSnapshotBeforeReset = null;
      FeedbackService.persist();
      return true;
    }
    return false;
  }

  /**
   * Persist to localStorage
   */
  private static persist(): void {
    try {
      localStorage.setItem(STORAGE_KEY_BEHAVIOR, JSON.stringify(FeedbackService.behavior));
    } catch {
      // ignore
    }
  }
}

// Auto-initialize on module import
FeedbackService.init();
