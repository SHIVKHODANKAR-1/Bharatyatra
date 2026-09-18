import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  Share2,
  Printer,
  CheckSquare,
  Sparkles,
  MapPin,
  Car,
  Wallet,
  Compass,
  ArrowRight,
  AlertTriangle,
  RotateCcw,
  Wand2,
  Download,
  Copy,
  Check,
  ChevronDown,
  Layers,
  X,
  PlusCircle,
} from 'lucide-react';
import { TripPlan, DayItinerary, ItineraryActivity, PackingItem, ItineraryActivityType } from '../../types/travel';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { DataClassification } from '../../types/index';
import { useOnboarding } from '../../context/OnboardingContext';
import { useAnalytics } from '../../context/AnalyticsContext';
import { useI18n } from '../../i18n/index';
import { TripService } from '../../services/tripService';

interface TripPlannerViewProps {
  initialDestinationName?: string;
  onExploreMore: () => void;
}

export const TripPlannerView: React.FC<TripPlannerViewProps> = ({
  initialDestinationName = 'Varanasi',
  onExploreMore,
}) => {
  const { preferences } = useOnboarding();
  const { trackEvent } = useAnalytics();
  const { t } = useI18n();

  const [allTrips, setAllTrips] = useState<TripPlan[]>([]);
  const [activeTrip, setActiveTrip] = useState<TripPlan | null>(null);
  const [activeTab, setActiveTab] = useState<'itinerary' | 'budget' | 'packing'>('itinerary');
  const [copied, setCopied] = useState(false);
  const [undoNotice, setUndoNotice] = useState<string | null>(null);

  // Modal / Creator states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTripDestination, setNewTripDestination] = useState(initialDestinationName);
  const [newTripDaysCount, setNewTripDaysCount] = useState(3);
  const [newTripParty, setNewTripParty] = useState<'solo' | 'couple' | 'family' | 'friends'>('solo');
  const [newTripPace, setNewTripPace] = useState<'relaxed' | 'balanced' | 'fast-paced'>('balanced');
  const [newTripBudgetTier, setNewTripBudgetTier] = useState<'budget' | 'moderate' | 'luxury'>('moderate');

  // Suggestion drawer state for a day
  const [suggestingDayNumber, setSuggestingDayNumber] = useState<number | null>(null);

  // Custom activity adder state
  const [addingDayNumber, setAddingDayNumber] = useState<number | null>(null);
  const [customTitle, setCustomTitle] = useState('');
  const [customLocation, setCustomLocation] = useState('');
  const [customTimeSlot, setCustomTimeSlot] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [customType, setCustomType] = useState<ItineraryActivityType>('sightseeing');
  const [customCost, setCustomCost] = useState('0');
  const [customDuration, setCustomDuration] = useState('90');

  // Custom packing item state
  const [newPackingItem, setNewPackingItem] = useState('');
  const [newPackingCategory, setNewPackingCategory] = useState('Essentials');

  // Load trips from TripService on mount
  useEffect(() => {
    const trips = TripService.getTrips();
    setAllTrips(trips);
    const active = TripService.getActiveTrip();
    if (active) {
      setActiveTrip(active);
    } else if (trips.length > 0) {
      setActiveTrip(trips[0]);
    }
  }, []);

  // Sync active trip switch
  const handleSelectTrip = (tripId: string) => {
    TripService.setActiveTripId(tripId);
    const selected = TripService.getTripById(tripId);
    if (selected) {
      setActiveTrip(selected);
      trackEvent('page_viewed', { page: 'trip_details', tripId });
    }
  };

  const refreshTrip = () => {
    if (!activeTrip) return;
    const refreshed = TripService.getTripById(activeTrip.id);
    if (refreshed) {
      setActiveTrip({ ...refreshed });
    }
    setAllTrips(TripService.getTrips());
  };

  // Create new trip
  const handleCreateNewTrip = (e: React.FormEvent) => {
    e.preventDefault();
    const dest = newTripDestination.trim() || 'Varanasi';
    const today = new Date();
    const startDate = today.toISOString().split('T')[0];
    const end = new Date(today);
    end.setDate(today.getDate() + (newTripDaysCount - 1));
    const endDate = end.toISOString().split('T')[0];

    const result = TripService.createTrip({
      title: `${dest} Cultural Itinerary`,
      destination: dest,
      startDate,
      endDate,
      party: newTripParty,
      pace: newTripPace,
      budgetTier: newTripBudgetTier,
      travelersCount: newTripParty === 'family' ? 4 : newTripParty === 'couple' ? 2 : 1,
    });

    if (result.trip) {
      setAllTrips(TripService.getTrips());
      setActiveTrip(result.trip);
      setShowCreateModal(false);
      trackEvent('trip_creation_started', { destination: dest, days: newTripDaysCount });
    }
  };

  // Activity Actions
  const handleToggleActivity = (dayNumber: number, actId: string) => {
    if (!activeTrip) return;
    TripService.toggleActivityCompleted(activeTrip.id, dayNumber, actId);
    trackEvent('trip_item_toggled', { tripId: activeTrip.id, dayNumber, actId });
    refreshTrip();
  };

  const handleRemoveActivity = (dayNumber: number, actId: string, actTitle: string) => {
    if (!activeTrip) return;
    const res = TripService.removeActivityFromTrip(activeTrip.id, dayNumber, actId);
    if (res.trip) {
      setActiveTrip({ ...res.trip });
      setUndoNotice(`Removed "${actTitle}"`);
      setTimeout(() => setUndoNotice(null), 5000);
    }
  };

  const handleUndoRemove = () => {
    const res = TripService.undoLastRemovedActivity();
    if (res.restored && res.trip) {
      setActiveTrip({ ...res.trip });
      setUndoNotice(null);
    }
  };

  const handleOptimizeRoute = (dayNumber: number) => {
    if (!activeTrip) return;
    const optimized = TripService.optimizeDayRoute(activeTrip.id, dayNumber);
    if (optimized) {
      setActiveTrip({ ...optimized });
      trackEvent('trip_item_toggled', { action: 'optimize', dayNumber });
    }
  };

  const handleAddCustomActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTrip || addingDayNumber === null || !customTitle.trim()) return;

    TripService.addActivityToTrip(activeTrip.id, addingDayNumber, {
      title: customTitle.trim(),
      location: customLocation.trim() || activeTrip.destination,
      timeSlot: customTimeSlot,
      activityType: customType,
      estimatedCostInr: parseInt(customCost, 10) || 0,
      durationMinutes: parseInt(customDuration, 10) || 90,
      dataClassification: DataClassification.VERIFIED,
    });

    setCustomTitle('');
    setCustomLocation('');
    setAddingDayNumber(null);
    refreshTrip();
  };

  const handleAddSuggestedActivity = (dayNumber: number, item: any) => {
    if (!activeTrip) return;
    TripService.addActivityToTrip(activeTrip.id, dayNumber, {
      title: item.title,
      location: item.location,
      timeSlot: item.timeSlot,
      activityType: item.itemType === 'food' ? 'food' : item.itemType === 'experience' ? 'experience' : 'sightseeing',
      estimatedCostInr: item.approxCostInr || 0,
      durationMinutes: item.durationMinutes || 90,
      itemReferenceId: item.id,
      itemType: item.itemType,
      dataClassification: DataClassification.VERIFIED,
    });
    setSuggestingDayNumber(null);
    refreshTrip();
  };

  // Packing Checklist
  const handleTogglePack = (id: string) => {
    if (!activeTrip) return;
    const updated = {
      ...activeTrip,
      packingList: activeTrip.packingList.map((p: PackingItem) =>
        p.id === id ? { ...p, isPacked: !p.isPacked } : p
      ),
    };
    setActiveTrip(updated);
    // Persist
    const all = TripService.getTrips().map((t) => (t.id === updated.id ? updated : t));
    try {
      localStorage.setItem('bharat_yatra_saved_trips_v1', JSON.stringify(all));
    } catch {
      // ignore
    }
  };

  const handleAddPackingItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTrip || !newPackingItem.trim()) return;
    const newItem: PackingItem = {
      id: `pk_${Date.now()}`,
      item: newPackingItem.trim(),
      isPacked: false,
      category: newPackingCategory,
    };
    const updated = {
      ...activeTrip,
      packingList: [...activeTrip.packingList, newItem],
    };
    setActiveTrip(updated);
    setNewPackingItem('');
    try {
      const all = TripService.getTrips().map((t) => (t.id === updated.id ? updated : t));
      localStorage.setItem('bharat_yatra_saved_trips_v1', JSON.stringify(all));
    } catch {
      // ignore
    }
  };

  // Export handlers
  const handleCopySummary = () => {
    if (!activeTrip) return;
    const summary = TripService.exportTripAsText(activeTrip);
    navigator.clipboard?.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    trackEvent('trip_exported', { format: 'clipboard', tripId: activeTrip.id });
  };

  const handlePrint = () => {
    window.print();
    trackEvent('trip_exported', { format: 'print_pdf', tripId: activeTrip?.id });
  };

  const handleDownloadTxt = () => {
    if (!activeTrip) return;
    const text = TripService.exportTripAsText(activeTrip);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeTrip.destination.toLowerCase()}_itinerary_bharat_yatra.txt`;
    link.click();
    URL.revokeObjectURL(url);
    trackEvent('trip_exported', { format: 'download_txt', tripId: activeTrip.id });
  };

  if (!activeTrip) {
    return (
      <div className="text-center py-20 space-y-4">
        <Sparkles className="w-10 h-10 text-[#D9531E] mx-auto animate-pulse" />
        <h2 className="text-xl font-bold">No active trip found</h2>
        <Button onClick={() => setShowCreateModal(true)}>Create Your First Itinerary</Button>
      </div>
    );
  }

  const budgetBreakdown = TripService.calculateBudgetBreakdown(activeTrip);
  const tripStats = TripService.getTripStats(activeTrip);
  const suggestions = TripService.getSuggestionsForTrip(activeTrip, preferences);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 print:p-0 print:max-w-none">
      {/* Undo Notification Banner */}
      {undoNotice && (
        <div className="fixed top-18 right-4 z-50 p-4 rounded-2xl bg-stone-900 text-white shadow-xl flex items-center gap-4 animate-in slide-in-from-top-4">
          <span className="text-xs font-medium">{undoNotice}</span>
          <button
            onClick={handleUndoRemove}
            className="px-2.5 py-1 rounded-lg bg-[#D9531E] hover:bg-[#b84214] text-xs font-bold transition-colors"
          >
            Undo
          </button>
        </div>
      )}

      {/* Top Controls: Switch Trips & Create New */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
            Your Trips ({allTrips.length}):
          </span>
          <select
            value={activeTrip.id}
            onChange={(e) => handleSelectTrip(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs font-bold text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-[#D9531E]"
          >
            {allTrips.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title} ({t.days.length} Days)
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setShowCreateModal(true)}
          >
            New Trip
          </Button>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Printer className="w-3.5 h-3.5" />}
            onClick={handlePrint}
            title="Print or Save as PDF"
          >
            Print / PDF
          </Button>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Download className="w-3.5 h-3.5" />}
            onClick={handleDownloadTxt}
            title="Download Summary File"
          >
            Download
          </Button>
          <Button
            size="sm"
            leftIcon={copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            onClick={handleCopySummary}
          >
            {copied ? 'Copied!' : 'Export Plan'}
          </Button>
        </div>
      </div>

      {/* Trip Header Card */}
      <div className="rounded-3xl bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white p-6 sm:p-8 relative overflow-hidden shadow-sm">
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-full bg-[#D9531E] font-bold">
              VERIFIED ITINERARY
            </span>
            <span className="text-xs text-stone-300 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {activeTrip.startDate} to {activeTrip.endDate}
            </span>
            <span className="text-xs text-stone-300 capitalize">
              • {activeTrip.party || 'Solo'} • {activeTrip.pace || 'Balanced'} pace • {activeTrip.budgetTier || 'Moderate'}
            </span>
          </div>

          <h1 className="text-xl sm:text-3xl font-black tracking-tight">{activeTrip.title}</h1>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-stone-800/80">
            <div className="flex items-center gap-4 text-xs sm:text-sm">
              <div>
                <div className="text-stone-400">Total Budget (Est.)</div>
                <div className="font-extrabold text-base text-emerald-400">
                  ₹{budgetBreakdown.totalCostInr.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-stone-400">
                  ~₹{budgetBreakdown.perPersonCostInr.toLocaleString('en-IN')}/traveler
                </div>
              </div>
              <div className="h-9 w-px bg-stone-700" />
              <div>
                <div className="text-stone-400">Scheduled Stops</div>
                <div className="font-extrabold text-base text-stone-100">
                  {tripStats.totalActivities} Stops
                </div>
                <div className="text-[10px] text-emerald-400">
                  {tripStats.completedActivities} Completed ({tripStats.progressPercent}%)
                </div>
              </div>
              <div className="h-9 w-px bg-stone-700 hidden sm:block" />
              <div className="hidden sm:block">
                <div className="text-stone-400">Destination</div>
                <div className="font-extrabold text-base text-stone-100 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#D9531E]" />
                  {activeTrip.destination}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-2 print:hidden">
        <button
          onClick={() => setActiveTab('itinerary')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 ${
            activeTab === 'itinerary'
              ? 'bg-[#D9531E]/10 text-[#D9531E] dark:bg-[#D9531E]/20'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
          }`}
        >
          <span>Day-by-Day Schedule</span>
          <span className="text-xs px-1.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
            {activeTrip.days.length}d
          </span>
        </button>
        <button
          onClick={() => setActiveTab('budget')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 ${
            activeTab === 'budget'
              ? 'bg-[#D9531E]/10 text-[#D9531E] dark:bg-[#D9531E]/20'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
          }`}
        >
          <span>Budget Breakdown</span>
          <span className="text-xs px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400">
            ₹{budgetBreakdown.totalCostInr.toLocaleString('en-IN')}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('packing')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 ${
            activeTab === 'packing'
              ? 'bg-[#D9531E]/10 text-[#D9531E] dark:bg-[#D9531E]/20'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
          }`}
        >
          <span>Cultural Packing Checklist</span>
          <span className="text-xs px-1.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
            {activeTrip.packingList.filter((p) => p.isPacked).length}/{activeTrip.packingList.length}
          </span>
        </button>
      </div>

      {/* TAB 1: ITINERARY */}
      {activeTab === 'itinerary' && (
        <div className="space-y-6">
          {activeTrip.days.map((day: DayItinerary) => {
            const conflicts = TripService.detectDayConflicts(day);

            return (
              <div
                key={day.dayNumber}
                className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden shadow-xs"
              >
                {/* Day Header with Route Optimization & Actions */}
                <div className="p-4 sm:p-5 bg-stone-50 dark:bg-stone-800/60 border-b border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-[#D9531E] uppercase">
                      Day {day.dayNumber} • {day.date}
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100">
                      {day.theme}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 print:hidden">
                    <button
                      onClick={() => handleOptimizeRoute(day.dayNumber)}
                      className="px-2.5 py-1 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-100 text-stone-700 dark:text-stone-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                      title="Sort activities sequentially from dawn/morning to dusk/evening"
                    >
                      <Wand2 className="w-3.5 h-3.5 text-[#D9531E]" />
                      <span>Optimize Route</span>
                    </button>
                    <button
                      onClick={() => setSuggestingDayNumber(suggestingDayNumber === day.dayNumber ? null : day.dayNumber)}
                      className="px-2.5 py-1 rounded-lg bg-[#D9531E]/10 hover:bg-[#D9531E]/20 text-[#D9531E] text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Suggestions</span>
                    </button>
                    <button
                      onClick={() => setAddingDayNumber(addingDayNumber === day.dayNumber ? null : day.dayNumber)}
                      className="p-1 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300"
                      title="Add Custom Activity"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Conflict Warnings (if any) */}
                {conflicts.length > 0 && (
                  <div className="px-4 py-2.5 bg-amber-50/80 dark:bg-amber-950/20 border-b border-amber-200/60 dark:border-amber-900/40 flex flex-col gap-1 text-xs text-amber-800 dark:text-amber-300">
                    {conflicts.map((c, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                        <span>{c.message}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Inline Suggestions Drawer for Day */}
                {suggestingDayNumber === day.dayNumber && (
                  <div className="p-4 bg-orange-50/50 dark:bg-stone-800/40 border-b border-stone-200 dark:border-stone-800 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-stone-700 dark:text-stone-300">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-[#D9531E]" />
                        <span>Recommended Additions for {activeTrip.destination}</span>
                      </span>
                      <button
                        onClick={() => setSuggestingDayNumber(null)}
                        className="text-stone-400 hover:text-stone-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                      {suggestions.slice(0, 6).map((s) => (
                        <div
                          key={s.id}
                          className="p-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex flex-col justify-between gap-2 shadow-2xs"
                        >
                          <div>
                            <div className="flex items-center justify-between text-[10px] text-stone-400 mb-1">
                              <span className="uppercase font-bold text-[#D9531E]">{s.timeSlot}</span>
                              <span>₹{s.approxCostInr}</span>
                            </div>
                            <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 line-clamp-1">
                              {s.title}
                            </h4>
                            <p className="text-[11px] text-stone-500 line-clamp-1">{s.reason}</p>
                          </div>
                          <button
                            onClick={() => handleAddSuggestedActivity(day.dayNumber, s)}
                            className="w-full py-1 rounded-lg bg-stone-100 hover:bg-[#D9531E] hover:text-white dark:bg-stone-800 dark:hover:bg-[#D9531E] text-stone-700 dark:text-stone-300 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
                          >
                            <PlusCircle className="w-3 h-3" />
                            <span>Add to Day {day.dayNumber}</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Inline Custom Activity Form */}
                {addingDayNumber === day.dayNumber && (
                  <form
                    onSubmit={handleAddCustomActivity}
                    className="p-4 bg-stone-50 dark:bg-stone-800/80 border-b border-stone-200 dark:border-stone-800 space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span>Add Custom Stop on Day {day.dayNumber}</span>
                      <button
                        type="button"
                        onClick={() => setAddingDayNumber(null)}
                        className="text-stone-400 hover:text-stone-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-stone-500 mb-1">
                          Activity Title *
                        </label>
                        <input
                          type="text"
                          required
                          value={customTitle}
                          onChange={(e) => setCustomTitle(e.target.value)}
                          placeholder="e.g., Manikarnika Ghat Sunset Walk"
                          className="w-full px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-500 mb-1">
                          Location
                        </label>
                        <input
                          type="text"
                          value={customLocation}
                          onChange={(e) => setCustomLocation(e.target.value)}
                          placeholder="e.g., Chowk, Varanasi"
                          className="w-full px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-500 mb-1">
                          Time Slot
                        </label>
                        <select
                          value={customTimeSlot}
                          onChange={(e) => setCustomTimeSlot(e.target.value as any)}
                          className="w-full px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900"
                        >
                          <option value="morning">Morning</option>
                          <option value="afternoon">Afternoon</option>
                          <option value="evening">Evening</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-500 mb-1">
                          Est. Cost (₹)
                        </label>
                        <input
                          type="number"
                          value={customCost}
                          onChange={(e) => setCustomCost(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-500 mb-1">
                          Duration (Mins)
                        </label>
                        <input
                          type="number"
                          value={customDuration}
                          onChange={(e) => setCustomDuration(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setAddingDayNumber(null)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" size="sm">
                        Save Stop
                      </Button>
                    </div>
                  </form>
                )}

                {/* Day Activities List */}
                <div className="divide-y divide-stone-100 dark:divide-stone-800">
                  {day.activities.length === 0 ? (
                    <div className="p-8 text-center text-xs text-stone-400">
                      No stops scheduled yet for this day. Click &ldquo;Suggestions&rdquo; or &ldquo;+&rdquo; above to add activities.
                    </div>
                  ) : (
                    day.activities.map((activity: ItineraryActivity) => (
                      <div
                        key={activity.id}
                        className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                          activity.isCompleted
                            ? 'bg-stone-50/70 dark:bg-stone-900/40 opacity-75'
                            : 'hover:bg-stone-50/50 dark:hover:bg-stone-800/30'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={activity.isCompleted}
                            onChange={() => handleToggleActivity(day.dayNumber, activity.id)}
                            className="mt-1 w-4 h-4 rounded text-[#D9531E] focus:ring-[#D9531E] cursor-pointer print:hidden"
                            title={activity.isCompleted ? 'Mark incomplete' : 'Mark completed'}
                          />
                          <span className="text-xs px-2 py-1 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 font-mono capitalize">
                            {activity.timeSlot}
                          </span>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4
                                className={`text-sm font-bold ${
                                  activity.isCompleted
                                    ? 'line-through text-stone-400'
                                    : 'text-stone-900 dark:text-stone-100'
                                }`}
                              >
                                {activity.title}
                              </h4>
                              <Badge classification={activity.dataClassification} />
                            </div>
                            <div className="flex items-center gap-3 text-xs text-stone-500">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-[#D9531E]" />
                                {activity.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {activity.durationMinutes} mins
                              </span>
                              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                {activity.estimatedCostInr > 0
                                  ? `₹${activity.estimatedCostInr}`
                                  : 'Free entry'}
                              </span>
                            </div>
                            {activity.notes && (
                              <p className="text-xs text-stone-600 dark:text-stone-400 italic">
                                💡 {activity.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center print:hidden">
                          <button
                            onClick={() => handleRemoveActivity(day.dayNumber, activity.id, activity.title)}
                            className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                            title="Remove stop"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}

          <div className="text-center pt-2 print:hidden">
            <Button
              variant="outline"
              onClick={onExploreMore}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add More Verified Sights from Discovery
            </Button>
          </div>
        </div>
      )}

      {/* TAB 2: BUDGET BREAKDOWN */}
      {activeTab === 'budget' && (
        <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
              Estimated Trip Expenses (Per Traveler: ₹{budgetBreakdown.perPersonCostInr.toLocaleString('en-IN')})
            </h3>
            <p className="text-xs text-stone-500">
              Transparent, realistic averages computed based on {activeTrip.budgetTier || 'moderate'} tier rates, duration ({activeTrip.days.length} days), and party size ({activeTrip.travelersCount || 1} travelers).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/80 dark:border-stone-800 flex justify-between items-center">
              <div>
                <div className="text-xs text-stone-500 font-medium">Boutique Stay & Homestays</div>
                <div className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  ₹{budgetBreakdown.stayCostInr.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-stone-400">
                  {Math.max(1, activeTrip.days.length - 1)} Nights
                </div>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300">
                {budgetBreakdown.breakdownPercent.stay}%
              </span>
            </div>

            <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/80 dark:border-stone-800 flex justify-between items-center">
              <div>
                <div className="text-xs text-stone-500 font-medium">Local Transit & Cabs</div>
                <div className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  ₹{budgetBreakdown.transitCostInr.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-stone-400">Pre-booked AC Cabs / Auto</div>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300">
                {budgetBreakdown.breakdownPercent.transit}%
              </span>
            </div>

            <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/80 dark:border-stone-800 flex justify-between items-center">
              <div>
                <div className="text-xs text-stone-500 font-medium">Authentic Dining & Food</div>
                <div className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  ₹{budgetBreakdown.foodCostInr.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-stone-400">Regional specialties & thalis</div>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300">
                {budgetBreakdown.breakdownPercent.food}%
              </span>
            </div>

            <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/80 dark:border-stone-800 flex justify-between items-center">
              <div>
                <div className="text-xs text-stone-500 font-medium">Entry Permits, Boat & Guides</div>
                <div className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  ₹{budgetBreakdown.activitiesCostInr.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-stone-400">Calculated from scheduled stops</div>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300">
                {budgetBreakdown.breakdownPercent.activities}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PACKING CHECKLIST */}
      {activeTab === 'packing' && (
        <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 space-y-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
              Cultural & Climate Packing Essentials
            </h3>
            <p className="text-xs text-stone-500">
              Customized for {activeTrip.destination} weather, temple etiquette, and terrain.
            </p>
          </div>

          <div className="space-y-2">
            {activeTrip.packingList.map((item: PackingItem) => (
              <label
                key={item.id}
                className="flex items-center justify-between p-3 rounded-xl border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={item.isPacked}
                    onChange={() => handleTogglePack(item.id)}
                    className="w-4 h-4 rounded text-[#D9531E] focus:ring-[#D9531E]"
                  />
                  <span
                    className={`text-sm ${
                      item.isPacked
                        ? 'line-through text-stone-400'
                        : 'text-stone-800 dark:text-stone-200 font-medium'
                    }`}
                  >
                    {item.item}
                  </span>
                </div>
                <span className="text-xs text-stone-400">{item.category}</span>
              </label>
            ))}
          </div>

          {/* Add Custom Packing Item */}
          <form onSubmit={handleAddPackingItem} className="pt-2 flex gap-2">
            <input
              type="text"
              value={newPackingItem}
              onChange={(e) => setNewPackingItem(e.target.value)}
              placeholder="Add custom packing item (e.g., Power Bank, Woolen Shawl)..."
              className="flex-1 px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs"
            />
            <Button type="submit" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Add
            </Button>
          </form>
        </div>
      )}

      {/* CREATE NEW TRIP MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                Plan a New Bharat Itinerary
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewTrip} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Destination City / Region *
                </label>
                <input
                  type="text"
                  required
                  value={newTripDestination}
                  onChange={(e) => setNewTripDestination(e.target.value)}
                  placeholder="e.g. Hampi, Munnar, Varanasi, Amritsar"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Duration (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="14"
                    value={newTripDaysCount}
                    onChange={(e) => setNewTripDaysCount(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Budget Tier
                  </label>
                  <select
                    value={newTripBudgetTier}
                    onChange={(e) => setNewTripBudgetTier(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900"
                  >
                    <option value="budget">Budget (Homestays & Thalis)</option>
                    <option value="moderate">Moderate (Heritage 3-star)</option>
                    <option value="luxury">Luxury (Palace hotels)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Party Type
                  </label>
                  <select
                    value={newTripParty}
                    onChange={(e) => setNewTripParty(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900"
                  >
                    <option value="solo">Solo</option>
                    <option value="couple">Couple</option>
                    <option value="family">Family</option>
                    <option value="friends">Friends</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Travel Pace
                  </label>
                  <select
                    value={newTripPace}
                    onChange={(e) => setNewTripPace(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900"
                  >
                    <option value="relaxed">Relaxed</option>
                    <option value="balanced">Balanced</option>
                    <option value="fast-paced">Fast-Paced</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Generate Itinerary
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
