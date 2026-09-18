import React from 'react';
import { X, Printer, QrCode, MapPin, Calendar, Clock, Users, ShieldCheck, Phone, Mail, FileText, CheckCircle2 } from 'lucide-react';
import { Booking } from '../../types/booking';
import { Button } from '../common/Button';

interface BookingVoucherModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BookingVoucherModal: React.FC<BookingVoucherModalProps> = ({ booking, isOpen, onClose }) => {
  if (!isOpen || !booking) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/80 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-2xl bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col my-auto animate-in fade-in zoom-in-95">
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#D9531E] text-white flex items-center justify-center font-bold text-xs">
              BY
            </div>
            <div>
              <h3 className="text-sm font-black text-stone-900 dark:text-stone-100 tracking-tight">
                BHARAT YATRA TRAVEL VOUCHER
              </h3>
              <p className="text-[10px] text-stone-500 font-mono">
                Booking Reference: {booking.id}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              leftIcon={<Printer className="w-3.5 h-3.5" />}
              className="text-xs print:hidden"
            >
              Print / PDF
            </Button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors print:hidden"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Voucher Printable Content */}
        <div className="p-6 sm:p-8 space-y-6 text-stone-900 dark:text-stone-100 print:p-0">
          {/* Status banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  Confirmed Reservation
                </div>
                <div className="text-[11px] text-emerald-700/80 dark:text-emerald-400">
                  Payment: {booking.paymentStatus} via {booking.paymentMethod || 'Online Gateway'}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-stone-500">Total Paid</div>
              <div className="text-base font-black text-stone-900 dark:text-stone-100">
                ₹{booking.totalAmountInr.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Activity Info */}
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            <img
              src={booking.itemImageUrl}
              alt={booking.itemTitle}
              className="w-full sm:w-36 h-28 rounded-2xl object-cover border border-stone-200 dark:border-stone-800"
            />
            <div className="space-y-1.5 flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#D9531E] bg-[#D9531E]/10 px-2 py-0.5 rounded-full">
                {booking.itemType === 'experience' ? 'Verified Experience' : 'Cultural Event'}
              </span>
              <h4 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 leading-snug">
                {booking.itemTitle}
              </h4>
              <p className="text-xs text-stone-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#D9531E]" />
                <span>{booking.city}, {booking.state}</span>
              </p>
              <p className="text-xs text-stone-600 dark:text-stone-400">
                Hosted by: <strong className="text-stone-900 dark:text-stone-200">{booking.providerName || 'Registered Local Guild'}</strong>
              </p>
            </div>
          </div>

          {/* Schedule & Travelers Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800 text-xs">
            <div className="space-y-0.5">
              <span className="text-stone-400 flex items-center gap-1 text-[11px]">
                <Calendar className="w-3 h-3 text-[#D9531E]" /> Date
              </span>
              <div className="font-bold text-stone-800 dark:text-stone-200">
                {booking.bookingDate}
              </div>
            </div>

            <div className="space-y-0.5">
              <span className="text-stone-400 flex items-center gap-1 text-[11px]">
                <Clock className="w-3 h-3 text-[#D9531E]" /> Slot / Time
              </span>
              <div className="font-bold text-stone-800 dark:text-stone-200 truncate">
                {booking.timeSlot}
              </div>
            </div>

            <div className="space-y-0.5">
              <span className="text-stone-400 flex items-center gap-1 text-[11px]">
                <Users className="w-3 h-3 text-[#D9531E]" /> Guests
              </span>
              <div className="font-bold text-stone-800 dark:text-stone-200">
                {booking.travelersCount} Person{booking.travelersCount > 1 ? 's' : ''}
              </div>
            </div>

            <div className="space-y-0.5">
              <span className="text-stone-400 flex items-center gap-1 text-[11px]">
                <ShieldCheck className="w-3 h-3 text-emerald-500" /> Pass Status
              </span>
              <div className="font-bold text-emerald-600 dark:text-emerald-400">
                Valid at Venue
              </div>
            </div>
          </div>

          {/* Meeting Point Instructions */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800 space-y-1.5">
            <div className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#D9531E]" />
              <span>Meeting Point & Arrival Guidelines</span>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              {booking.meetingPoint || 'Report directly to the venue check-in desk 15 minutes prior to scheduled start time.'}
            </p>
            {booking.notes && (
              <p className="text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-xl mt-2 border border-amber-200 dark:border-amber-800">
                Note: {booking.notes}
              </p>
            )}
          </div>

          {/* Primary Traveler & Provider Contact Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 space-y-1">
              <div className="font-bold text-stone-500 text-[11px]">Primary Traveler Details</div>
              <div className="font-semibold text-stone-900 dark:text-stone-100">{booking.userName}</div>
              <div className="text-stone-500 text-[11px]">{booking.userPhone} • {booking.userEmail}</div>
            </div>

            <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 space-y-1">
              <div className="font-bold text-stone-500 text-[11px]">Host Contact Details</div>
              <div className="font-semibold text-stone-900 dark:text-stone-100">
                {booking.providerContact?.name || booking.providerName}
              </div>
              <div className="text-stone-500 text-[11px]">
                {booking.providerContact?.phone || '+91 98390 12345'}
              </div>
            </div>
          </div>

          {/* QR Code Verification Simulation & Legal Note */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-dashed border-stone-200 dark:border-stone-800">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-stone-100 dark:bg-stone-800 rounded-xl flex items-center justify-center p-2 border border-stone-300 dark:border-stone-700">
                <QrCode className="w-12 h-12 text-stone-800 dark:text-stone-200" />
              </div>
              <div className="text-[11px] text-stone-500">
                <p className="font-bold text-stone-700 dark:text-stone-300">Scan at Venue Gate</p>
                <p>Digital badge verified against Bharat Yatra registry</p>
                <p className="text-[10px] font-mono text-stone-400">ID: {booking.id}</p>
              </div>
            </div>

            <div className="text-center sm:text-right text-[10px] text-stone-400 space-y-0.5">
              <p>Issued on: {new Date(booking.createdAt).toLocaleDateString('en-IN')}</p>
              <p>Government Tourism Partner Network • Bharat Yatra</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
