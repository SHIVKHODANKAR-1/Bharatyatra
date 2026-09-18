import React, { useState } from 'react';
import { X, Calendar, Clock, Users, ShieldCheck, CreditCard, CheckCircle2, AlertCircle, Sparkles, MapPin, ChevronRight, ArrowLeft } from 'lucide-react';
import { PaymentMethod, Booking } from '../../types/booking';
import { PaymentService } from '../../services/paymentService';
import { BookingService } from '../../services/bookingService';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { BookingVoucherModal } from './BookingVoucherModal';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    id: string;
    title: string;
    itemType: 'experience' | 'event';
    destinationName: string;
    imageUrl: string;
    approxPriceInr: number;
    providerId?: string;
    providerName?: string;
    meetingPoint?: string;
    timingDetails?: string;
    state?: string;
  } | null;
  onBookingSuccess?: (booking: Booking) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  item,
  onBookingSuccess,
}) => {
  const { currentUser } = useAuth();

  // Booking Flow Steps: 1 = Details & Schedule, 2 = Travelers & Contact, 3 = Payment & Confirmation
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const defaultDate = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(defaultDate);
  const [selectedSlot, setSelectedSlot] = useState<string>('06:00 AM – 08:30 AM (Morning Slot)');
  const [travelersCount, setTravelersCount] = useState<number>(2);

  // Traveler Details
  const [fullName, setFullName] = useState<string>(currentUser?.fullName || currentUser?.displayName || 'Aarav Sharma');
  const [email, setEmail] = useState<string>(currentUser?.email || 'aarav.sharma@example.com');
  const [phone, setPhone] = useState<string>('+91 98201 12345');
  const [specialRequests, setSpecialRequests] = useState<string>('');

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Demo UPI (GPay/PhonePe)');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Completed Booking State
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [showVoucher, setShowVoucher] = useState<boolean>(false);

  if (!isOpen || !item) return null;

  const priceBreakdown = PaymentService.calculatePrice(item.approxPriceInr, travelersCount);

  const availableSlots = [
    '05:30 AM – 08:00 AM (Sunrise / Morning Glory)',
    '09:30 AM – 12:00 PM (Mid-Morning Heritage Walk)',
    '04:30 PM – 07:00 PM (Sunset / Twilight Aarti)',
  ];

  const handleNextToTravelers = () => {
    if (!selectedDate) {
      setErrorMessage('Please select an activity date.');
      return;
    }
    setErrorMessage(null);
    setStep(2);
  };

  const handleNextToPayment = () => {
    if (!fullName || fullName.trim().length < 2) {
      setErrorMessage('Please enter traveler full name.');
      return;
    }
    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!phone || phone.trim().length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }
    setErrorMessage(null);
    setStep(3);
  };

  const handleConfirmAndPay = async () => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const result = await BookingService.createBooking({
        userId: currentUser?.id || currentUser?.uid || 'usr_demo_traveler',
        userName: fullName,
        userEmail: email,
        userPhone: phone,
        itemType: item.itemType,
        itemId: item.id,
        itemTitle: item.title,
        itemImageUrl: item.imageUrl,
        providerId: item.providerId || 'prov_varanasi_heritage',
        providerName: item.providerName || 'Kashi Heritage Walks & Vedic Boat Guild',
        city: item.destinationName,
        state: item.state || 'India',
        bookingDate: selectedDate,
        timeSlot: selectedSlot,
        travelersCount,
        travelerNames: [fullName],
        basePricePerPersonInr: item.approxPriceInr,
        paymentMethod,
        meetingPoint: item.meetingPoint,
        notes: specialRequests,
      });

      if (result.success && result.booking) {
        setConfirmedBooking(result.booking);
        if (onBookingSuccess) onBookingSuccess(result.booking);
      } else {
        setErrorMessage(result.error || 'Failed to finalize booking.');
      }
    } catch {
      setErrorMessage('An unexpected error occurred during booking. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/80 backdrop-blur-md overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        <div className="relative w-full max-w-xl bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col my-auto animate-in fade-in zoom-in-95">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D9531E]" />
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                {confirmedBooking ? 'Booking Confirmed' : `Reserve ${item.itemType === 'experience' ? 'Experience' : 'Event Pass'}`}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Stepper (Only when not yet confirmed) */}
          {!confirmedBooking && (
            <div className="flex border-b border-stone-200 dark:border-stone-800 px-6 py-2.5 bg-stone-100/50 dark:bg-stone-800/30 text-xs font-medium text-stone-500">
              <div className={`flex items-center gap-1.5 ${step === 1 ? 'text-[#D9531E] font-bold' : ''}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 1 ? 'bg-[#D9531E] text-white' : 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300'}`}>1</span>
                <span>Date & Slot</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 mx-2 text-stone-400 self-center" />
              <div className={`flex items-center gap-1.5 ${step === 2 ? 'text-[#D9531E] font-bold' : ''}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 2 ? 'bg-[#D9531E] text-white' : 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300'}`}>2</span>
                <span>Travelers</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 mx-2 text-stone-400 self-center" />
              <div className={`flex items-center gap-1.5 ${step === 3 ? 'text-[#D9531E] font-bold' : ''}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 3 ? 'bg-[#D9531E] text-white' : 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300'}`}>3</span>
                <span>Checkout</span>
              </div>
            </div>
          )}

          {/* Body Content */}
          <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-start gap-2 text-xs text-red-700 dark:text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* CONFIRMED STATE */}
            {confirmedBooking ? (
              <div className="text-center space-y-5 py-4">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 rounded-full flex items-center justify-center mx-auto text-emerald-600 border border-emerald-300 dark:border-emerald-700 animate-in zoom-in">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-mono font-bold text-stone-400">
                    REFERENCE: {confirmedBooking.id}
                  </span>
                  <h3 className="text-xl font-black text-stone-900 dark:text-stone-100">
                    Booking Successfully Confirmed!
                  </h3>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">
                    A confirmation voucher has been generated. Your spot has been secured with the verified local host.
                  </p>
                </div>

                {/* Summary card */}
                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-800 text-left text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Activity:</span>
                    <span className="font-bold text-stone-900 dark:text-stone-100 text-right max-w-[240px] truncate">{confirmedBooking.itemTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Date & Slot:</span>
                    <span className="font-semibold text-stone-800 dark:text-stone-200">{confirmedBooking.bookingDate} ({confirmedBooking.timeSlot.split('(')[0].trim()})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Guests:</span>
                    <span className="font-semibold text-stone-800 dark:text-stone-200">{confirmedBooking.travelersCount} Traveler{confirmedBooking.travelersCount > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Amount Paid:</span>
                    <span className="font-bold text-[#D9531E]">₹{confirmedBooking.totalAmountInr.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1 text-xs"
                    onClick={() => setShowVoucher(true)}
                  >
                    View / Print Voucher
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-1 text-xs"
                    onClick={onClose}
                  >
                    Done & Return
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* STEP 1: Date, Slot & Travelers */}
                {step === 1 && (
                  <div className="space-y-4">
                    {/* Item preview */}
                    <div className="flex gap-3 p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800 items-center">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-16 h-14 rounded-xl object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-stone-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#D9531E]" />
                          <span>{item.destinationName}</span>
                        </p>
                        <p className="text-[11px] font-bold text-[#D9531E]">
                          {item.approxPriceInr === 0 ? 'Free Entry' : `₹${item.approxPriceInr.toLocaleString('en-IN')} / person`}
                        </p>
                      </div>
                    </div>

                    {/* Date Picker */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#D9531E]" />
                        <span>Select Date</span>
                      </label>
                      <input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#D9531E]"
                      />
                    </div>

                    {/* Slot Picker */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#D9531E]" />
                        <span>Select Preferred Timing Slot</span>
                      </label>
                      <div className="space-y-2">
                        {availableSlots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedSlot(slot)}
                            className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-xs flex items-center justify-between transition-colors ${
                              selectedSlot === slot
                                ? 'border-[#D9531E] bg-[#D9531E]/5 text-[#D9531E] font-semibold'
                                : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 text-stone-700 dark:text-stone-300'
                            }`}
                          >
                            <span>{slot}</span>
                            {selectedSlot === slot && <CheckCircle2 className="w-4 h-4 text-[#D9531E]" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Travelers Count */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-[#D9531E]" />
                          <span>Number of Travelers</span>
                        </span>
                        <span className="text-[11px] text-stone-500 font-normal">Max 10 per reservation</span>
                      </label>
                      <div className="flex items-center gap-3">
                        {[1, 2, 3, 4, 5, 6].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setTravelersCount(num)}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${
                              travelersCount === num
                                ? 'bg-[#D9531E] text-white border-[#D9531E]'
                                : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-stone-400'
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button
                        variant="primary"
                        className="w-full text-xs"
                        onClick={handleNextToTravelers}
                      >
                        Continue to Traveler Details
                      </Button>
                    </div>
                  </div>
                )}

                {/* STEP 2: Traveler Details */}
                {step === 2 && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                        Primary Contact Details
                      </h4>
                      <p className="text-[11px] text-stone-500">
                        Voucher and coordination instructions will be dispatched to this contact.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] font-semibold text-stone-700 dark:text-stone-300">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Aarav Sharma"
                          className="w-full mt-1 px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#D9531E]"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-stone-700 dark:text-stone-300">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="aarav@example.com"
                          className="w-full mt-1 px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#D9531E]"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-stone-700 dark:text-stone-300">
                          Mobile Phone (WhatsApp enabled) *
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 98201 12345"
                          className="w-full mt-1 px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#D9531E]"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-stone-700 dark:text-stone-300">
                          Special Requests / Dietary / Accessibility (Optional)
                        </label>
                        <textarea
                          rows={2}
                          value={specialRequests}
                          onChange={(e) => setSpecialRequests(e.target.value)}
                          placeholder="Wheelchair assistance, dietary preferences, or specific sunrise requests..."
                          className="w-full mt-1 px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#D9531E]"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        className="text-xs"
                        onClick={() => setStep(1)}
                        leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
                      >
                        Back
                      </Button>
                      <Button
                        variant="primary"
                        className="flex-1 text-xs"
                        onClick={handleNextToPayment}
                      >
                        Proceed to Payment & Review
                      </Button>
                    </div>
                  </div>
                )}

                {/* STEP 3: Payment & Pricing Breakdown */}
                {step === 3 && (
                  <div className="space-y-4">
                    {/* Demo Environment Notice */}
                    <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 flex items-start gap-2.5">
                      <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div className="text-xs text-amber-800 dark:text-amber-200 space-y-0.5">
                        <div className="font-bold">DEMO SIMULATION SANDBOX</div>
                        <p className="text-[11px] leading-relaxed">
                          Live production gateway is currently not linked to private bank keys. No actual credit card or bank funds will be charged. All bookings test the real transaction state machine safely.
                        </p>
                      </div>
                    </div>

                    {/* Price Breakdown */}
                    <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800 space-y-2 text-xs">
                      <div className="font-bold text-stone-900 dark:text-stone-100 pb-1 border-b border-stone-200 dark:border-stone-700">
                        Fare Summary ({travelersCount} Guest{travelersCount > 1 ? 's' : ''})
                      </div>
                      <div className="flex justify-between text-stone-600 dark:text-stone-400">
                        <span>Base Price (₹{priceBreakdown.basePriceInr} × {travelersCount}):</span>
                        <span>₹{priceBreakdown.subtotalInr.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-stone-600 dark:text-stone-400">
                        <span>GST ({priceBreakdown.gstRatePercent}% Tourism Tax):</span>
                        <span>₹{priceBreakdown.gstAmountInr.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-stone-600 dark:text-stone-400">
                        <span>Conservation & Platform Fee:</span>
                        <span>₹{priceBreakdown.platformFeeInr.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between font-black text-sm text-stone-900 dark:text-stone-100 pt-2 border-t border-stone-200 dark:border-stone-700">
                        <span>Total Payable:</span>
                        <span className="text-[#D9531E]">₹{priceBreakdown.totalAmountInr.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    {/* Select Payment Method */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-[#D9531E]" />
                        <span>Select Demo Payment Option</span>
                      </label>
                      {(
                        [
                          'Demo UPI (GPay/PhonePe)',
                          'Demo NetBanking',
                          'Demo Credit/Debit Card',
                          'Pay at Venue / Cash',
                        ] as PaymentMethod[]
                      ).map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setPaymentMethod(method)}
                          className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-xs flex items-center justify-between transition-colors ${
                            paymentMethod === method
                              ? 'border-[#D9531E] bg-[#D9531E]/5 text-[#D9531E] font-semibold'
                              : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 text-stone-700 dark:text-stone-300'
                          }`}
                        >
                          <span>{method}</span>
                          {paymentMethod === method && <CheckCircle2 className="w-4 h-4 text-[#D9531E]" />}
                        </button>
                      ))}
                    </div>

                    {/* Policy info */}
                    <p className="text-[11px] text-stone-500">
                      Free cancellation up to 24 hours before activity time. You agree to host safety and heritage conservation guidelines.
                    </p>

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        className="text-xs"
                        onClick={() => setStep(2)}
                        disabled={isProcessing}
                        leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
                      >
                        Back
                      </Button>
                      <Button
                        variant="primary"
                        className="flex-1 text-xs"
                        onClick={handleConfirmAndPay}
                        disabled={isProcessing}
                      >
                        {isProcessing
                          ? 'Simulating Gateway Transaction...'
                          : `Confirm & Complete (₹${priceBreakdown.totalAmountInr.toLocaleString('en-IN')})`}
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Voucher modal if triggered */}
      {confirmedBooking && (
        <BookingVoucherModal
          booking={confirmedBooking}
          isOpen={showVoucher}
          onClose={() => setShowVoucher(false)}
        />
      )}
    </>
  );
};
