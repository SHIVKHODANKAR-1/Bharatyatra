import React, { useState, useEffect } from 'react';
import {
  X,
  CalendarPlus,
  Check,
  AlertCircle,
  Plus,
  Clock,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { TripPlan, ItineraryActivity, ItineraryActivityType } from '../../types/travel';
import { TripService } from '../../services/tripService';
import { Button } from '../common/Button';
import { DataClassification } from '../../types/index';

interface AddToTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    id: string;
    title: string;
    category?: string;
    location?: { city: string; state: string } | string;
    approxPriceInr?: number;
    durationMinutes?: number;
    itemType?: 'destination' | 'experience' | 'food' | 'event';
  } | null;
  onTripUpdated?: (trip: TripPlan) => void;
}

export const AddToTripModal: React.FC<AddToTripModalProps> = ({
  isOpen,
  onClose,
  item,
  onTripUpdated,
}) => {
  const [trips, setTrips] = useState<TripPlan[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string>('');
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);
  const [timeSlot, setTimeSlot] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [activityType, setActivityType] = useState<ItineraryActivityType>('sightseeing');
  const [notes, setNotes] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );
  const [showCreateQuickTrip, setShowCreateQuickTrip] = useState(false);
  const [quickTripDest, setQuickTripDest] = useState('');

  useEffect(() => {
    if (isOpen) {
      const allTrips = TripService.getTrips();
      setTrips(allTrips);
      if (allTrips.length > 0) {
        setSelectedTripId(allTrips[0].id);
        setSelectedDayNumber(1);
      }
      setStatusMessage(null);
      setShowCreateQuickTrip(false);

      if (item) {
        if (item.itemType === 'food') {
          setActivityType('food');
          setTimeSlot('evening');
        } else if (item.itemType === 'experience') {
          setActivityType('experience');
          setTimeSlot('afternoon');
        } else if (item.itemType === 'event') {
          setActivityType('event');
          setTimeSlot('evening');
        } else {
          setActivityType('sightseeing');
          setTimeSlot('morning');
        }
      }
    }
  }, [isOpen, item]);

  if (!isOpen || !item) return null;

  const currentSelectedTrip = trips.find((t) => t.id === selectedTripId);
  const locationString =
    typeof item.location === 'object' && item.location !== null
      ? `${item.location.city}, ${item.location.state}`
      : typeof item.location === 'string'
      ? item.location
      : 'India';

  const handleCreateQuickTrip = () => {
    const dest = quickTripDest.trim() || locationString.split(',')[0].trim() || 'Varanasi';
    const today = new Date();
    const startDate = today.toISOString().split('T')[0];
    const endDateObj = new Date(today);
    endDateObj.setDate(today.getDate() + 2);
    const endDate = endDateObj.toISOString().split('T')[0];

    const result = TripService.createTrip({
      title: `${dest} Getaway`,
      destination: dest,
      startDate,
      endDate,
    });

    if (result.trip) {
      const updated = TripService.getTrips();
      setTrips(updated);
      setSelectedTripId(result.trip.id);
      setSelectedDayNumber(1);
      setShowCreateQuickTrip(false);
    }
  };

  const handleAdd = () => {
    if (!selectedTripId) {
      setStatusMessage({ type: 'error', text: 'Please select or create a trip first.' });
      return;
    }

    const activityData: Partial<ItineraryActivity> = {
      title: item.title,
      location: locationString,
      timeSlot,
      activityType,
      durationMinutes: item.durationMinutes || 90,
      estimatedCostInr: item.approxPriceInr || 0,
      notes: notes.trim(),
      itemReferenceId: item.id,
      itemType: item.itemType || 'destination',
      dataClassification: DataClassification.VERIFIED,
    };

    const { trip, error } = TripService.addActivityToTrip(
      selectedTripId,
      selectedDayNumber,
      activityData
    );

    if (error) {
      setStatusMessage({ type: 'error', text: error });
    } else if (trip) {
      setStatusMessage({
        type: 'success',
        text: `Added "${item.title}" to Day ${selectedDayNumber} of ${trip.title}!`,
      });
      if (onTripUpdated) onTripUpdated(trip);
      setTimeout(() => {
        onClose();
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/70 dark:bg-stone-900/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D9531E]/10 text-[#D9531E] flex items-center justify-center">
              <CalendarPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100">
                Add to Itinerary
              </h2>
              <p className="text-xs text-stone-500">
                Schedule this place into your personalized journey
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Item Preview Banner */}
        <div className="p-4 bg-[#D9531E]/5 dark:bg-[#D9531E]/10 border-b border-[#D9531E]/15 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#D9531E]">
              Selected Item
            </span>
            <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate">
              {item.title}
            </h4>
            <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-[#D9531E]" />
              <span className="truncate">{locationString}</span>
            </p>
          </div>
          {item.approxPriceInr !== undefined && (
            <span className="text-xs font-bold text-stone-700 dark:text-stone-300 shrink-0 px-2 py-1 bg-white dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700">
              {item.approxPriceInr === 0 ? 'Free' : `₹${item.approxPriceInr.toLocaleString('en-IN')}`}
            </span>
          )}
        </div>

        {/* Body Form */}
        <div className="p-5 space-y-4 text-xs">
          {statusMessage && (
            <div
              className={`p-3 rounded-2xl flex items-center gap-2 text-xs font-semibold ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <Check className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Select Trip */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold uppercase tracking-wider text-stone-500 text-[11px]">
                Target Trip
              </label>
              <button
                type="button"
                onClick={() => setShowCreateQuickTrip(!showCreateQuickTrip)}
                className="text-[#D9531E] hover:underline flex items-center gap-1 font-semibold"
              >
                <Plus className="w-3 h-3" />
                <span>Create New Trip</span>
              </button>
            </div>

            {showCreateQuickTrip ? (
              <div className="p-3 rounded-2xl border border-[#D9531E]/30 bg-stone-50 dark:bg-stone-800 space-y-2">
                <p className="text-stone-600 dark:text-stone-300 font-medium">
                  Create a fast 3-day itinerary:
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={quickTripDest}
                    onChange={(e) => setQuickTripDest(e.target.value)}
                    placeholder={`Destination (e.g. ${locationString.split(',')[0].trim()})`}
                    className="flex-1 p-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200"
                  />
                  <Button size="sm" variant="primary" onClick={handleCreateQuickTrip}>
                    Create
                  </Button>
                </div>
              </div>
            ) : (
              <select
                value={selectedTripId}
                onChange={(e) => {
                  setSelectedTripId(e.target.value);
                  setSelectedDayNumber(1);
                }}
                className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-medium text-xs focus:ring-1 focus:ring-[#D9531E]"
              >
                {trips.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} ({t.destination} • {t.days.length} Days)
                  </option>
                ))}
              </select>
            )}
          </div>

          {currentSelectedTrip && (
            <>
              {/* Select Day */}
              <div className="space-y-1.5">
                <label className="font-bold uppercase tracking-wider text-stone-500 text-[11px]">
                  Select Day
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                  {currentSelectedTrip.days.map((d) => {
                    const isSelected = selectedDayNumber === d.dayNumber;
                    return (
                      <button
                        key={d.dayNumber}
                        type="button"
                        onClick={() => setSelectedDayNumber(d.dayNumber)}
                        className={`p-2 rounded-xl border text-center font-bold transition-all ${
                          isSelected
                            ? 'border-[#D9531E] bg-[#D9531E] text-white shadow-xs'
                            : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                        }`}
                      >
                        <div>Day {d.dayNumber}</div>
                        <div className="text-[10px] opacity-80 font-normal">
                          {d.activities.length} items
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slot & Activity Type */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold uppercase tracking-wider text-stone-500 text-[11px]">
                    Time Slot
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-medium"
                  >
                    <option value="morning">🌅 Morning (8 AM - 12 PM)</option>
                    <option value="afternoon">☀️ Afternoon (12 PM - 4 PM)</option>
                    <option value="evening">🌙 Evening (4 PM - 9 PM)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold uppercase tracking-wider text-stone-500 text-[11px]">
                    Activity Type
                  </label>
                  <select
                    value={activityType}
                    onChange={(e) => setActivityType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-medium capitalize"
                  >
                    <option value="sightseeing">🏛️ Sightseeing</option>
                    <option value="experience">🧗 Experience</option>
                    <option value="food">🍽️ Food Stop</option>
                    <option value="event">🎉 Event</option>
                    <option value="free_time">⏳ Free Time</option>
                    <option value="notes">📝 Note</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="font-bold uppercase tracking-wider text-stone-500 text-[11px]">
                  Personal Traveler Notes (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Arrive before sunrise; wear walking shoes; bring camera"
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/70 flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleAdd}
            disabled={!selectedTripId}
            leftIcon={<CalendarPlus className="w-4 h-4" />}
          >
            Confirm & Add Activity
          </Button>
        </div>
      </div>
    </div>
  );
};
