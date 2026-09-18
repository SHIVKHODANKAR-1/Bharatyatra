import { AppNotification, NotificationType, NotificationCategory, NotificationPreferences } from '../types/booking';
import { INITIAL_NOTIFICATIONS } from '../data/initialBookingsReviews';
import { BookingService } from './bookingService';
import { TripService } from './tripService';

const NOTIFICATIONS_STORAGE_KEY = 'bharat_yatra_notifications_v1';
const NOTIFICATION_PREFS_KEY = 'bharat_yatra_notification_prefs_v1';

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  bookingUpdates: true,
  tripReminders: true,
  eventAlerts: true,
  recommendations: true,
  marketingEmails: false,
  inAppAlerts: true,
  browserPush: false,
};

export class NotificationService {
  private static getStoredNotifications(): AppNotification[] {
    try {
      const data = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    return INITIAL_NOTIFICATIONS;
  }

  private static saveNotifications(list: AppNotification[]): void {
    try {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(list));
    } catch {
      // ignore
    }
  }

  public static getPreferences(userId?: string): NotificationPreferences {
    try {
      const data = localStorage.getItem(`${NOTIFICATION_PREFS_KEY}_${userId || 'default'}`);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    return DEFAULT_NOTIFICATION_PREFERENCES;
  }

  public static savePreferences(prefs: NotificationPreferences, userId?: string): void {
    try {
      localStorage.setItem(`${NOTIFICATION_PREFS_KEY}_${userId || 'default'}`, JSON.stringify(prefs));
    } catch {
      // ignore
    }
  }

  public static getNotificationsForUser(
    userId: string,
    role?: string,
    category?: NotificationCategory
  ): AppNotification[] {
    const all = this.getStoredNotifications();
    return all.filter((n) => {
      const userMatches = n.userId === 'all' || n.userId === userId || (role && n.roleTarget === role);
      if (!userMatches) return false;

      if (category && category !== 'all') {
        const itemCat = n.category || this.inferCategory(n.type);
        if (itemCat !== category) return false;
      }
      return true;
    });
  }

  public static inferCategory(type: NotificationType): NotificationCategory {
    if (['booking_confirmation', 'booking_cancellation', 'booking_status_update', 'refund_update'].includes(type)) {
      return 'bookings';
    }
    if (['trip_reminder'].includes(type)) {
      return 'trips';
    }
    if (['event_reminder'].includes(type)) {
      return 'events';
    }
    if (['new_recommendation'].includes(type)) {
      return 'recommendations';
    }
    return 'system';
  }

  public static getUnreadCount(userId: string, role?: string): number {
    return this.getNotificationsForUser(userId, role).filter((n) => !n.isRead).length;
  }

  public static addNotification(item: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>): AppNotification {
    const all = this.getStoredNotifications();
    const newNotif: AppNotification = {
      ...item,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: 'Just now',
      isRead: false,
      category: item.category || this.inferCategory(item.type),
    };
    const updated = [newNotif, ...all];
    this.saveNotifications(updated);
    return newNotif;
  }

  public static markAsRead(id: string): void {
    const all = this.getStoredNotifications();
    const updated = all.map((n) => (n.id === id ? { ...n, isRead: true } : n));
    this.saveNotifications(updated);
  }

  public static markAllAsRead(userId: string): void {
    const all = this.getStoredNotifications();
    const updated = all.map((n) => (n.userId === userId || n.userId === 'all' ? { ...n, isRead: true } : n));
    this.saveNotifications(updated);
  }

  public static deleteNotification(id: string): void {
    const all = this.getStoredNotifications();
    const filtered = all.filter((n) => n.id !== id);
    this.saveNotifications(filtered);
  }

  public static clearAll(userId: string): void {
    const all = this.getStoredNotifications();
    const filtered = all.filter((n) => n.userId !== userId && n.userId !== 'all');
    this.saveNotifications(filtered);
  }

  /**
   * Automated Reminder System:
   * Inspects user bookings and scheduled trips to generate timely reminders.
   */
  public static triggerReminderChecks(userId: string): void {
    if (!userId) return;
    const prefs = this.getPreferences(userId);
    const existing = this.getStoredNotifications();

    // 1. Upcoming booking reminders
    if (prefs.bookingUpdates) {
      const { upcoming } = BookingService.getUserBookings(userId);
      for (const b of upcoming) {
        const notifTitle = `Upcoming Booking: ${b.itemTitle}`;
        const alreadyNotified = existing.some((n) => n.userId === userId && n.title === notifTitle);
        if (!alreadyNotified) {
          this.addNotification({
            userId,
            type: 'booking_status_update',
            category: 'bookings',
            title: notifTitle,
            message: `Your booking for ${b.itemTitle} is scheduled on ${b.bookingDate}. Digital voucher is ready in My Bookings.`,
            actionTab: 'bookings',
            actionId: b.id,
          });
        }
      }
    }

    // 2. Active Trip Reminders
    if (prefs.tripReminders) {
      const trips = TripService.getTrips();
      for (const trip of trips) {
        const tripTitle = `Trip Reminder: ${trip.title}`;
        const alreadyNotified = existing.some((n) => n.userId === userId && n.title === tripTitle);
        if (!alreadyNotified) {
          this.addNotification({
            userId,
            type: 'trip_reminder',
            category: 'trips',
            title: tripTitle,
            message: `Your curated itinerary for ${trip.destination} has ${trip.days.length} planned days. Review your packing list and daily schedule.`,
            actionTab: 'trips',
            actionId: trip.id,
          });
        }
      }
    }
  }
}

