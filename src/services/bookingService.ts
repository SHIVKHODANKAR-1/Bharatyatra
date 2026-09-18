import { Booking, BookingStatus, PaymentMethod, PaymentStatus } from '../types/booking';
import { INITIAL_BOOKINGS } from '../data/initialBookingsReviews';
import { DataClassification } from '../types/index';
import { PaymentService } from './paymentService';
import { NotificationService } from './notificationService';

const BOOKINGS_STORAGE_KEY = 'bharat_yatra_bookings_v1';

export interface CreateBookingRequest {
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
  timeSlot: string;
  travelersCount: number;
  travelerNames?: string[];
  basePricePerPersonInr: number;
  paymentMethod: PaymentMethod;
  meetingPoint?: string;
  notes?: string;
}

export class BookingService {
  private static getStoredBookings(): Booking[] {
    try {
      const data = localStorage.getItem(BOOKINGS_STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    return INITIAL_BOOKINGS;
  }

  private static saveBookings(list: Booking[]): void {
    try {
      localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(list));
    } catch {
      // ignore
    }
  }

  public static getAllBookings(): Booking[] {
    return this.getStoredBookings();
  }

  public static getBookingById(id: string): Booking | null {
    return this.getStoredBookings().find((b) => b.id === id) || null;
  }

  public static getUserBookings(userId: string): {
    all: Booking[];
    upcoming: Booking[];
    past: Booking[];
    cancelled: Booking[];
  } {
    const all = this.getStoredBookings().filter(
      (b) => b.userId === userId || userId === 'usr_demo_traveler'
    );
    const today = new Date().toISOString().split('T')[0];

    const upcoming = all.filter(
      (b) => b.bookingDate >= today && (b.bookingStatus === 'Confirmed' || b.bookingStatus === 'Pending')
    );
    const past = all.filter(
      (b) => b.bookingStatus === 'Completed' || (b.bookingDate < today && b.bookingStatus !== 'Cancelled')
    );
    const cancelled = all.filter(
      (b) => b.bookingStatus === 'Cancelled' || b.bookingStatus === 'Refunded'
    );

    return { all, upcoming, past, cancelled };
  }

  public static getProviderBookings(providerId: string): Booking[] {
    return this.getStoredBookings().filter((b) => b.providerId === providerId);
  }

  public static async createBooking(
    req: CreateBookingRequest
  ): Promise<{ success: boolean; booking?: Booking; error?: string }> {
    if (!req.bookingDate) {
      return { success: false, error: 'Please select a valid booking date.' };
    }
    if (!req.travelersCount || req.travelersCount < 1) {
      return { success: false, error: 'At least 1 traveler must be included.' };
    }
    if (!req.userName || req.userName.trim().length < 2) {
      return { success: false, error: 'Please enter primary traveler full name.' };
    }
    if (!req.userEmail || !req.userEmail.includes('@')) {
      return { success: false, error: 'A valid email address is required for booking confirmation.' };
    }
    if (!req.userPhone || req.userPhone.trim().length < 10) {
      return { success: false, error: 'A valid 10-digit mobile number is required.' };
    }

    const priceCalc = PaymentService.calculatePrice(req.basePricePerPersonInr, req.travelersCount);

    // Process payment simulation
    const payResult = await PaymentService.processMockPayment(
      priceCalc.totalAmountInr,
      req.paymentMethod
    );

    if (!payResult.success) {
      return { success: false, error: payResult.message || 'Payment simulation failed.' };
    }

    const all = this.getStoredBookings();
    const id = `BY-BK-${Math.floor(10000 + Math.random() * 90000)}`;

    const newBooking: Booking = {
      id,
      userId: req.userId,
      userName: req.userName.trim(),
      userEmail: req.userEmail.trim(),
      userPhone: req.userPhone.trim(),
      itemType: req.itemType,
      itemId: req.itemId,
      itemTitle: req.itemTitle,
      itemImageUrl: req.itemImageUrl,
      providerId: req.providerId || 'prov_varanasi_heritage',
      providerName: req.providerName || 'Verified Heritage Partner',
      city: req.city,
      state: req.state,
      bookingDate: req.bookingDate,
      timeSlot: req.timeSlot,
      travelersCount: req.travelersCount,
      travelerNames: req.travelerNames || [req.userName],
      basePriceInr: priceCalc.subtotalInr,
      taxAndFeesInr: priceCalc.gstAmountInr + priceCalc.platformFeeInr,
      totalAmountInr: priceCalc.totalAmountInr,
      currency: 'INR',
      bookingStatus: 'Confirmed',
      paymentStatus: payResult.paymentStatus,
      paymentMethod: req.paymentMethod,
      meetingPoint: req.meetingPoint || 'Central meeting location specified by provider',
      cancellationPolicy: 'Free cancellation up to 24 hours prior to activity slot.',
      providerContact: {
        name: req.providerName || 'Host Representative',
        phone: '+91 98390 12345',
        email: 'help@bharatyatra.in',
      },
      notes: req.notes,
      dataClassification: DataClassification.VERIFIED,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [newBooking, ...all];
    this.saveBookings(updated);

    // Emit notifications
    NotificationService.addNotification({
      userId: req.userId,
      type: 'booking_confirmation',
      title: `Booking Confirmed: ${newBooking.itemTitle}`,
      message: `Ref ${newBooking.id} for ${newBooking.travelersCount} travelers on ${newBooking.bookingDate} (${newBooking.timeSlot}) is confirmed!`,
      actionTab: 'my_bookings',
      actionId: newBooking.id,
    });

    if (newBooking.providerId) {
      NotificationService.addNotification({
        userId: newBooking.providerId,
        roleTarget: 'PROVIDER',
        type: 'booking_status_update',
        title: 'New Booking Received',
        message: `New booking for "${newBooking.itemTitle}" (${newBooking.travelersCount} guest${newBooking.travelersCount > 1 ? 's' : ''}) on ${newBooking.bookingDate}.`,
        actionTab: 'provider_dashboard',
      });
    }

    return { success: true, booking: newBooking };
  }

  public static cancelBooking(
    id: string,
    reason: string
  ): { success: boolean; booking?: Booking; refundAmountInr?: number; error?: string } {
    const all = this.getStoredBookings();
    const index = all.findIndex((b) => b.id === id);
    if (index === -1) return { success: false, error: 'Booking not found.' };

    const booking = all[index];
    if (booking.bookingStatus === 'Cancelled') {
      return { success: false, error: 'This booking is already cancelled.' };
    }

    const refundCheck = PaymentService.checkRefundEligibility(booking.bookingDate, booking.totalAmountInr);

    const updated: Booking = {
      ...booking,
      bookingStatus: 'Cancelled',
      paymentStatus: refundCheck.eligibleAmountInr > 0 ? 'Refunded' : booking.paymentStatus,
      cancellationReason: reason.trim() || 'Cancelled by user request',
      cancelledAt: new Date().toISOString(),
      refundRequest: {
        id: `ref_${Date.now().toString(36)}`,
        requestedAt: new Date().toISOString(),
        reason: reason.trim() || 'User cancellation',
        amountInr: refundCheck.eligibleAmountInr,
        status: refundCheck.eligibleAmountInr > 0 ? 'Processed' : 'Rejected',
        processedAt: new Date().toISOString(),
        adminNotes: refundCheck.reason,
      },
      updatedAt: new Date().toISOString(),
    };

    all[index] = updated;
    this.saveBookings(all);

    NotificationService.addNotification({
      userId: booking.userId,
      type: 'booking_cancellation',
      title: `Booking Cancelled: ${booking.itemTitle}`,
      message: `Reservation ${booking.id} cancelled. ${refundCheck.reason}`,
      actionTab: 'my_bookings',
      actionId: booking.id,
    });

    return { success: true, booking: updated, refundAmountInr: refundCheck.eligibleAmountInr };
  }

  public static providerUpdateStatus(
    bookingId: string,
    newStatus: BookingStatus,
    reason?: string
  ): Booking | null {
    const all = this.getStoredBookings();
    const index = all.findIndex((b) => b.id === bookingId);
    if (index === -1) return null;

    const b = all[index];
    const updated: Booking = {
      ...b,
      bookingStatus: newStatus,
      cancellationReason: newStatus === 'Cancelled' ? reason : b.cancellationReason,
      updatedAt: new Date().toISOString(),
    };
    all[index] = updated;
    this.saveBookings(all);

    NotificationService.addNotification({
      userId: b.userId,
      type: 'booking_status_update',
      title: `Booking ${newStatus}: ${b.itemTitle}`,
      message: `Your booking status was updated to ${newStatus} by the verified provider. ${reason ? `Reason: ${reason}` : ''}`,
      actionTab: 'my_bookings',
      actionId: b.id,
    });

    return updated;
  }
}
