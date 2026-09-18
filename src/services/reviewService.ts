import { TravelerReview } from '../types/booking';
import { INITIAL_REVIEWS } from '../data/initialBookingsReviews';
import { BookingService } from './bookingService';
import { NotificationService } from './notificationService';

const REVIEWS_STORAGE_KEY = 'bharat_yatra_reviews_v1';

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  distribution: { [star: number]: number };
}

export class ReviewService {
  private static getStoredReviews(): TravelerReview[] {
    try {
      const data = localStorage.getItem(REVIEWS_STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    return INITIAL_REVIEWS;
  }

  private static saveReviews(list: TravelerReview[]): void {
    try {
      localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(list));
    } catch {
      // ignore
    }
  }

  public static getAllReviews(): TravelerReview[] {
    return this.getStoredReviews();
  }

  public static getReviewsForItem(itemId: string, includeHidden = false): TravelerReview[] {
    const all = this.getStoredReviews();
    return all.filter((r) => {
      if (r.itemId !== itemId) return false;
      if (!includeHidden && r.status === 'Hidden') return false;
      return true;
    });
  }

  public static getReviewsStats(itemId: string): ReviewStats {
    const list = this.getReviewsForItem(itemId, false);
    const distribution: { [star: number]: number } = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    if (list.length === 0) {
      return { averageRating: 0, totalReviews: 0, distribution };
    }

    let sum = 0;
    list.forEach((r) => {
      sum += r.rating;
      const rounded = Math.min(5, Math.max(1, Math.round(r.rating)));
      distribution[rounded] = (distribution[rounded] || 0) + 1;
    });

    const averageRating = parseFloat((sum / list.length).toFixed(1));
    return { averageRating, totalReviews: list.length, distribution };
  }

  public static submitReview(
    data: {
      itemType: 'experience' | 'event' | 'destination' | 'provider';
      itemId: string;
      itemTitle: string;
      userId: string;
      userName: string;
      userAvatar?: string;
      rating: number;
      title: string;
      comment: string;
      images?: string[];
      tags?: string[];
    }
  ): { success: boolean; review?: TravelerReview; error?: string } {
    if (!data.rating || data.rating < 1 || data.rating > 5) {
      return { success: false, error: 'Rating must be between 1 and 5 stars.' };
    }
    if (!data.title || data.title.trim().length < 3) {
      return { success: false, error: 'Please enter a review headline.' };
    }
    if (!data.comment || data.comment.trim().length < 10) {
      return { success: false, error: 'Review comment must be at least 10 characters.' };
    }

    // Check if verified booking exists for this user and item
    const userBookings = BookingService.getUserBookings(data.userId).all;
    const matchingBooking = userBookings.find(
      (b) => b.itemId === data.itemId && (b.bookingStatus === 'Completed' || b.bookingStatus === 'Confirmed')
    );

    const isVerifiedBooking = Boolean(matchingBooking);

    const all = this.getStoredReviews();
    const id = `rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const newReview: TravelerReview = {
      id,
      itemType: data.itemType,
      itemId: data.itemId,
      itemTitle: data.itemTitle,
      userId: data.userId,
      userName: data.userName,
      userAvatar: data.userAvatar,
      bookingId: matchingBooking?.id,
      isVerifiedBooking,
      rating: data.rating,
      title: data.title.trim(),
      comment: data.comment.trim(),
      images: data.images || [],
      tags: data.tags || ['Traveler Experience'],
      isReported: false,
      status: 'Published',
      createdAt: new Date().toISOString(),
    };

    const updated = [newReview, ...all];
    this.saveReviews(updated);

    return { success: true, review: newReview };
  }

  public static reportReview(reviewId: string, reason: string): boolean {
    const all = this.getStoredReviews();
    const index = all.findIndex((r) => r.id === reviewId);
    if (index === -1) return false;

    all[index] = {
      ...all[index],
      isReported: true,
      reportReason: reason,
      status: 'Under Review',
      updatedAt: new Date().toISOString(),
    };
    this.saveReviews(all);

    NotificationService.addNotification({
      userId: 'all',
      roleTarget: 'MODERATOR',
      type: 'system_alert',
      title: 'Review Reported for Moderation',
      message: `Review on "${all[index].itemTitle}" was flagged: ${reason}`,
      actionTab: 'admin_dashboard',
    });

    return true;
  }

  public static addProviderResponse(
    reviewId: string,
    providerName: string,
    responseText: string
  ): TravelerReview | null {
    const all = this.getStoredReviews();
    const index = all.findIndex((r) => r.id === reviewId);
    if (index === -1) return null;

    const review = all[index];
    const updated: TravelerReview = {
      ...review,
      providerResponse: {
        providerName,
        text: responseText.trim(),
        respondedAt: new Date().toISOString(),
      },
      updatedAt: new Date().toISOString(),
    };

    all[index] = updated;
    this.saveReviews(all);

    NotificationService.addNotification({
      userId: review.userId,
      type: 'review_response',
      title: `${providerName} responded to your review`,
      message: `Your feedback on "${review.itemTitle}" received a reply.`,
      actionTab: 'explore',
    });

    return updated;
  }

  public static moderateReview(
    reviewId: string,
    newStatus: 'Published' | 'Hidden' | 'Under Review',
    moderationReason?: string
  ): TravelerReview | null {
    const all = this.getStoredReviews();
    const index = all.findIndex((r) => r.id === reviewId);
    if (index === -1) return null;

    const updated: TravelerReview = {
      ...all[index],
      status: newStatus,
      moderationReason: moderationReason || all[index].moderationReason,
      isReported: newStatus === 'Published' ? false : all[index].isReported,
      updatedAt: new Date().toISOString(),
    };

    all[index] = updated;
    this.saveReviews(all);
    return updated;
  }

  public static deleteReview(reviewId: string, userId?: string): boolean {
    const all = this.getStoredReviews();
    const filtered = all.filter((r) => {
      if (r.id !== reviewId) return true;
      if (userId && r.userId !== userId) return true; // not author
      return false;
    });

    if (filtered.length === all.length) return false;
    this.saveReviews(filtered);
    return true;
  }
}
