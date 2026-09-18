import { DataClassification } from './index';

export type BookingStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Cancelled'
  | 'Completed'
  | 'Refunded'
  | 'Failed';

export type PaymentStatus =
  | 'Unpaid'
  | 'Payment Pending'
  | 'Paid'
  | 'Failed'
  | 'Refunded'
  | 'Partially Refunded';

export type PaymentMethod =
  | 'Demo UPI (GPay/PhonePe)'
  | 'Demo NetBanking'
  | 'Demo Credit/Debit Card'
  | 'Pay at Venue / Cash';

export interface RefundRequest {
  id: string;
  requestedAt: string;
  reason: string;
  amountInr: number;
  status: 'Pending' | 'Approved' | 'Processed' | 'Rejected';
  processedAt?: string;
  adminNotes?: string;
}

export interface Booking {
  id: string; // e.g. "BY-BK-89421"
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  itemType: 'experience' | 'event';
  itemId: string;
  itemTitle: string;
  itemImageUrl: string;
  providerId?: string;
  providerName?: string;
  city: string;
  state: string;
  bookingDate: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "05:30 AM - 08:00 AM"
  travelersCount: number;
  travelerNames?: string[];
  basePriceInr: number;
  taxAndFeesInr: number;
  totalAmountInr: number;
  currency: 'INR';
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  meetingPoint?: string;
  cancellationPolicy?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  refundRequest?: RefundRequest;
  providerContact?: {
    name: string;
    phone: string;
    email: string;
  };
  notes?: string;
  dataClassification: DataClassification;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewResponse {
  providerName: string;
  text: string;
  respondedAt: string;
}

export interface TravelerReview {
  id: string;
  itemType: 'experience' | 'event' | 'destination' | 'provider';
  itemId: string;
  itemTitle: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  bookingId?: string;
  isVerifiedBooking: boolean;
  rating: number; // 1 - 5
  title: string;
  comment: string;
  images?: string[];
  tags: string[];
  providerResponse?: ReviewResponse;
  isReported: boolean;
  reportReason?: string;
  status: 'Published' | 'Hidden' | 'Under Review';
  moderationReason?: string;
  createdAt: string;
  updatedAt?: string;
}

export type NotificationType =
  | 'booking_confirmation'
  | 'booking_cancellation'
  | 'booking_status_update'
  | 'provider_approval'
  | 'provider_rejection'
  | 'event_reminder'
  | 'trip_reminder'
  | 'review_reminder'
  | 'review_response'
  | 'refund_update'
  | 'new_recommendation'
  | 'system_announcement'
  | 'system_alert';

export type NotificationCategory = 'all' | 'bookings' | 'trips' | 'events' | 'recommendations' | 'system';

export interface NotificationPreferences {
  bookingUpdates: boolean;
  tripReminders: boolean;
  eventAlerts: boolean;
  recommendations: boolean;
  marketingEmails: boolean;
  inAppAlerts: boolean;
  browserPush: boolean;
}

export interface AppNotification {
  id: string;
  userId: string; // or 'all'
  roleTarget?: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionTab?: string;
  actionId?: string;
  category?: NotificationCategory;
}

export type SupportRequestStatus =
  | 'Open'
  | 'In Progress'
  | 'Waiting for User'
  | 'Resolved'
  | 'Closed';

export type SupportCategory =
  | 'Quality Issue'
  | 'Safety Concern'
  | 'Inaccurate Information'
  | 'Payment Issue'
  | 'Harassment'
  | 'Cancellation Dispute'
  | 'Provider Onboarding'
  | 'Other';

export interface SupportTicket {
  id: string; // e.g. "SUP-1042"
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  targetType: 'experience' | 'provider' | 'review' | 'event' | 'general';
  targetId?: string;
  targetTitle?: string;
  category: SupportCategory;
  subject: string;
  description: string;
  status: SupportRequestStatus;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  resolutionNotes?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}
