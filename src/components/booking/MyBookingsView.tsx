import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, Printer, XCircle, Phone, Mail, CheckCircle2, AlertCircle, MessageSquare, ShieldCheck, ChevronRight, FileText, ArrowRight } from 'lucide-react';
import { Booking } from '../../types/booking';
import { BookingService } from '../../services/bookingService';
import { PaymentService } from '../../services/paymentService';
import { Button } from '../common/Button';
import { BookingVoucherModal } from './BookingVoucherModal';
import { WriteReviewModal } from '../reviews/WriteReviewModal';
import { ReportModal } from '../support/ReportModal';
import { useAuth } from '../../context/AuthContext';

interface MyBookingsViewProps {
  onNavigateToExplore?: () => void;
  onExploreMore?: () => void;
}

export const MyBookingsView: React.FC<MyBookingsViewProps> = ({ onNavigateToExplore, onExploreMore }) => {
  const { currentUser } = useAuth();
  const handleExplore = onExploreMore || onNavigateToExplore;

  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'cancelled' | 'all'>('upcoming');
  const [bookingsData, setBookingsData] = useState<{
    all: Booking[];
    upcoming: Booking[];
    past: Booking[];
    cancelled: Booking[];
  }>({ all: [], upcoming: [], past: [], cancelled: [] });

  // Modal states
  const [selectedVoucher, setSelectedVoucher] = useState<Booking | null>(null);
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);
  const [cancellationReason, setCancellationReason] = useState<string>('Change in travel dates');
  const [isCancelling, setIsCancelling] = useState<boolean>(false);
  const [cancelFeedback, setCancelFeedback] = useState<string | null>(null);

  const [contactingProvider, setContactingProvider] = useState<Booking | null>(null);
  const [reviewingBooking, setReviewingBooking] = useState<Booking | null>(null);
  const [reportingBooking, setReportingBooking] = useState<Booking | null>(null);

  const loadBookings = () => {
    const userId = currentUser?.id || currentUser?.uid || 'usr_demo_traveler';
    const data = BookingService.getUserBookings(userId);
    setBookingsData(data);
  };

  useEffect(() => {
    loadBookings();
  }, [currentUser]);

  const activeList =
    activeTab === 'upcoming'
      ? bookingsData.upcoming
      : activeTab === 'past'
      ? bookingsData.past
      : activeTab === 'cancelled'
      ? bookingsData.cancelled
      : bookingsData.all;

  const handleCancelBooking = async () => {
    if (!cancellingBooking) return;
    setIsCancelling(true);
    try {
      const res = BookingService.cancelBooking(cancellingBooking.id, cancellationReason);
      if (res.success) {
        setCancelFeedback(
          res.refundAmountInr && res.refundAmountInr > 0
            ? `Booking cancelled. A refund of ₹${res.refundAmountInr.toLocaleString('en-IN')} has been initiated.`
            : 'Booking cancelled successfully.'
        );
        loadBookings();
        setTimeout(() => {
          setCancellingBooking(null);
          setCancelFeedback(null);
        }, 1800);
      }
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-stone-100 tracking-tight">
            My Travel Bookings
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Manage your verified reservations, download printable travel vouchers, and connect with hosts.
          </p>
        </div>

        {onNavigateToExplore && (
          <Button
            variant="primary"
            onClick={onNavigateToExplore}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="text-xs self-start sm:self-auto"
          >
            Explore More Experiences
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 dark:border-stone-800 gap-2 sm:gap-6 text-xs sm:text-sm font-semibold">
        {(
          [
            { key: 'upcoming', label: 'Upcoming', count: bookingsData.upcoming.length },
            { key: 'past', label: 'Completed / Past', count: bookingsData.past.length },
            { key: 'cancelled', label: 'Cancelled', count: bookingsData.cancelled.length },
            { key: 'all', label: 'All History', count: bookingsData.all.length },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`pb-3 px-2 sm:px-3 relative flex items-center gap-1.5 transition-colors ${
              activeTab === t.key
                ? 'text-[#D9531E] font-bold border-b-2 border-[#D9531E]'
                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <span>{t.label}</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                activeTab === t.key
                  ? 'bg-[#D9531E]/10 text-[#D9531E]'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-500'
              }`}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {activeList.length === 0 ? (
        <div className="text-center py-16 p-8 rounded-3xl bg-stone-50 dark:bg-stone-900 border border-dashed border-stone-200 dark:border-stone-800 space-y-4">
          <Calendar className="w-12 h-12 text-stone-300 dark:text-stone-700 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-stone-800 dark:text-stone-200">
              No {activeTab} bookings found
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Ready to immerse yourself in India's cultural tapestry? Reserve dawn Vedic boat rides, artisan workshops, and sacred heritage tours.
            </p>
          </div>
          {onNavigateToExplore && (
            <Button
              variant="outline"
              size="sm"
              onClick={onNavigateToExplore}
              className="text-xs"
            >
              Discover Experiences
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {activeList.map((b) => (
            <div
              key={b.id}
              className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-md transition-shadow flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
            >
              {/* Left Details */}
              <div className="flex flex-col sm:flex-row gap-5 items-start flex-1 min-w-0">
                <img
                  src={b.itemImageUrl}
                  alt={b.itemTitle}
                  className="w-full sm:w-36 h-28 rounded-2xl object-cover shrink-0 border border-stone-100 dark:border-stone-800"
                />

                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-stone-400 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-md">
                      {b.id}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        b.bookingStatus === 'Confirmed'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : b.bookingStatus === 'Completed'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                          : 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-800'
                      }`}
                    >
                      {b.bookingStatus}
                    </span>
                    <span className="text-[10px] text-stone-500 font-medium">
                      Payment: <strong className="text-stone-700 dark:text-stone-300">{b.paymentStatus}</strong>
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 leading-snug">
                    {b.itemTitle}
                  </h3>

                  <div className="flex flex-wrap gap-y-1 gap-x-4 text-xs text-stone-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#D9531E]" />
                      <strong className="text-stone-800 dark:text-stone-200">{b.bookingDate}</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#D9531E]" />
                      <span>{b.timeSlot.split('(')[0].trim()}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-[#D9531E]" />
                      <span>{b.travelersCount} Guest{b.travelersCount > 1 ? 's' : ''}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#D9531E]" />
                      <span>{b.city}</span>
                    </span>
                  </div>

                  <div className="text-[11px] text-stone-500">
                    Host:{' '}
                    <span className="font-semibold text-stone-800 dark:text-stone-200">
                      {b.providerName || 'Local Cultural Guild'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Fare & Action Buttons */}
              <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between w-full lg:w-auto gap-4 border-t lg:border-t-0 pt-4 lg:pt-0 border-stone-100 dark:border-stone-800">
                <div className="text-left lg:text-right">
                  <div className="text-[11px] text-stone-400">Total Price</div>
                  <div className="text-lg font-black text-stone-900 dark:text-stone-100">
                    ₹{b.totalAmountInr.toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedVoucher(b)}
                    leftIcon={<Printer className="w-3.5 h-3.5" />}
                    className="text-xs"
                  >
                    Voucher
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setContactingProvider(b)}
                    leftIcon={<Phone className="w-3.5 h-3.5" />}
                    className="text-xs"
                  >
                    Contact Host
                  </Button>

                  {/* Cancel Button if Confirmed/Upcoming */}
                  {b.bookingStatus === 'Confirmed' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCancellingBooking(b)}
                      leftIcon={<XCircle className="w-3.5 h-3.5 text-red-500" />}
                      className="text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 border-red-200 dark:border-red-900"
                    >
                      Cancel
                    </Button>
                  )}

                  {/* Review Button if Completed or Confirmed */}
                  {(b.bookingStatus === 'Completed' || b.bookingStatus === 'Confirmed') && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setReviewingBooking(b)}
                      leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
                      className="text-xs"
                    >
                      Review
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Voucher Modal */}
      {selectedVoucher && (
        <BookingVoucherModal
          booking={selectedVoucher}
          isOpen={Boolean(selectedVoucher)}
          onClose={() => setSelectedVoucher(null)}
        />
      )}

      {/* Cancellation Dialog */}
      {cancellingBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl p-6 space-y-4 shadow-2xl border border-stone-200 dark:border-stone-800 text-xs">
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500" />
              <span>Cancel Reservation</span>
            </h3>

            {cancelFeedback ? (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-center font-bold">
                {cancelFeedback}
              </div>
            ) : (
              <>
                <p className="text-stone-600 dark:text-stone-300">
                  Are you sure you want to cancel booking <strong className="font-mono">{cancellingBooking.id}</strong> for <strong className="text-stone-900 dark:text-stone-100">{cancellingBooking.itemTitle}</strong>?
                </p>

                {/* Live Refund Eligibility Box */}
                {(() => {
                  const check = PaymentService.checkRefundEligibility(
                    cancellingBooking.bookingDate,
                    cancellingBooking.totalAmountInr
                  );
                  return (
                    <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 space-y-1">
                      <div className="font-bold text-stone-800 dark:text-stone-200">
                        Estimated Refund: ₹{check.eligibleAmountInr.toLocaleString('en-IN')} ({check.refundPercent}%)
                      </div>
                      <p className="text-[11px] text-stone-500">{check.reason}</p>
                    </div>
                  );
                })()}

                <div className="space-y-1">
                  <label className="font-bold text-stone-700 dark:text-stone-300">
                    Reason for cancellation:
                  </label>
                  <select
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
                  >
                    <option value="Change in travel dates">Change in travel dates</option>
                    <option value="Weather / Transport disruption">Weather / Transport disruption</option>
                    <option value="Health or emergency issue">Health or emergency issue</option>
                    <option value="Found alternative plan">Found alternative plan</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1 text-xs"
                    onClick={() => setCancellingBooking(null)}
                    disabled={isCancelling}
                  >
                    Keep Booking
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-1 text-xs bg-red-600 hover:bg-red-700 text-white"
                    onClick={handleCancelBooking}
                    disabled={isCancelling}
                  >
                    {isCancelling ? 'Processing...' : 'Confirm Cancellation'}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Contact Host Modal */}
      {contactingProvider && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl p-6 space-y-4 shadow-2xl border border-stone-200 dark:border-stone-800 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-stone-200 dark:border-stone-800">
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#D9531E]" />
                <span>Host Coordination Details</span>
              </h3>
              <button
                onClick={() => setContactingProvider(null)}
                className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700 space-y-1">
                <div className="text-[10px] text-stone-400 font-bold uppercase">Host Organization</div>
                <div className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                  {contactingProvider.providerName}
                </div>
                <div className="text-stone-500 text-[11px]">
                  Representative: {contactingProvider.providerContact?.name || 'Local Guide Desk'}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700 space-y-1.5">
                <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
                  <Phone className="w-3.5 h-3.5 text-[#D9531E]" />
                  <span>{contactingProvider.providerContact?.phone || '+91 98390 12345'}</span>
                </div>
                <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
                  <Mail className="w-3.5 h-3.5 text-[#D9531E]" />
                  <span>{contactingProvider.providerContact?.email || 'contact@bharatguild.in'}</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700 space-y-1">
                <div className="text-[10px] text-stone-400 font-bold uppercase">Meeting Point Instructions</div>
                <p className="text-stone-600 dark:text-stone-300 text-[11px] leading-relaxed">
                  {contactingProvider.meetingPoint || 'Report directly to the check-in canopy 15 minutes before the start time.'}
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full text-xs"
              onClick={() => setContactingProvider(null)}
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewingBooking && (
        <WriteReviewModal
          isOpen={Boolean(reviewingBooking)}
          onClose={() => setReviewingBooking(null)}
          itemId={reviewingBooking.itemId}
          itemTitle={reviewingBooking.itemTitle}
          itemType={reviewingBooking.itemType}
          onReviewSubmitted={() => loadBookings()}
        />
      )}
    </div>
  );
};
