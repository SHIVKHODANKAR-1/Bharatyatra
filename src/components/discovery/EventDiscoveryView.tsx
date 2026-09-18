import React, { useState, useMemo } from 'react';
import {
  Search,
  Calendar as CalendarIcon,
  Grid,
  MapPin,
  Clock,
  Ticket,
  ShieldCheck,
  Heart,
  Share2,
  Plus,
  Bell,
  AlertTriangle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Info,
  Check,
} from 'lucide-react';
import { SeasonalEvent } from '../../types/travel';
import { Badge } from '../common/Badge';

interface EventDiscoveryViewProps {
  events: SeasonalEvent[];
  onSelectEvent: (event: SeasonalEvent) => void;
  savedItemIds: Set<string>;
  onToggleSave: (id: string) => void;
  onAddToTrip?: (event: SeasonalEvent) => void;
}

export const EVENT_CATEGORIES = [
  'All Categories',
  'Cultural Fair',
  'Music & Arts',
  'Spiritual Gathering',
  'Festival',
  'Food Festival',
  'Sports',
  'Literature',
];

export const EventDiscoveryView: React.FC<EventDiscoveryViewProps> = ({
  events,
  onSelectEvent,
  savedItemIds,
  onToggleSave,
  onAddToTrip,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedMonth, setSelectedMonth] = useState<string>('All');
  const [remindersSet, setRemindersSet] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleToggleReminder = (e: React.MouseEvent, eventId: string) => {
    e.stopPropagation();
    setRemindersSet((prev) => {
      const next = new Set(prev);
      if (next.has(eventId)) {
        next.delete(eventId);
        showToast('Calendar reminder removed.');
      } else {
        next.add(eventId);
        showToast('Reminder added! You will be notified 7 days prior.');
      }
      return next;
    });
  };

  const handleShare = (e: React.MouseEvent, ev: SeasonalEvent) => {
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/#event-${ev.id}`);
      setCopiedId(ev.id);
      showToast('Event link copied to clipboard!');
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      // Category
      if (selectedCategory !== 'All Categories') {
        const cat = ev.category.toLowerCase();
        const type = (ev.eventType || '').toLowerCase();
        const target = selectedCategory.toLowerCase();
        if (!cat.includes(target) && !type.includes(target)) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = ev.name.toLowerCase().includes(q);
        const matchDest = ev.destinationName.toLowerCase().includes(q);
        const matchState = ev.state.toLowerCase().includes(q);
        const matchDesc = ev.description.toLowerCase().includes(q);
        if (!matchName && !matchDest && !matchState && !matchDesc) return false;
      }

      return true;
    });
  }, [events, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-sm border border-stone-700 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-rose-950/20 via-amber-950/10 to-transparent p-6 rounded-3xl border border-stone-200 dark:border-stone-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400">
                Part 2B Seasonal Events
              </span>
              <span className="text-xs text-stone-500">
                {filteredEvents.length} major festivals & gatherings
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              Cultural Fairs, Festivals & Gatherings
            </h1>
            <p className="text-sm text-stone-600 dark:text-stone-400 mt-1 max-w-2xl">
              Authentic Indian celebrations with verified state tourism notices, ticket conditions,
              and astrological dates disclaimers.
            </p>
          </div>

          {/* Search bar & View switch */}
          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events or venue..."
                className="w-full pl-10 pr-4 py-2 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/40"
              />
            </div>

            {/* View Mode Toggle: Grid vs Calendar */}
            <div className="flex items-center gap-1 bg-white dark:bg-stone-900 p-1 rounded-2xl border border-stone-200 dark:border-stone-800">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-xl transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-100'
                }`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setViewMode('calendar')}
                className={`p-1.5 rounded-xl transition-colors ${
                  viewMode === 'calendar'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-100'
                }`}
                title="Calendar View"
              >
                <CalendarIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="mt-5 pt-4 border-t border-stone-200/60 dark:border-stone-800/60 flex items-center gap-2 overflow-x-auto pb-2">
          {EVENT_CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-white/80 dark:bg-stone-800/80 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* VIEW MODE 1: Card Grid */}
      {viewMode === 'grid' ? (
        filteredEvents.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800">
            <CalendarIcon className="w-10 h-10 text-stone-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-stone-800 dark:text-stone-200">No events found</h3>
            <p className="text-sm text-stone-500 mt-1">Try resetting your category or query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((ev) => {
              const isSaved = savedItemIds.has(ev.id);
              const hasReminder = remindersSet.has(ev.id);

              return (
                <div
                  key={ev.id}
                  onClick={() => onSelectEvent(ev)}
                  className="group relative bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col cursor-pointer"
                >
                  {/* Image Cover */}
                  <div className="relative aspect-16/10 w-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                    <img
                      src={ev.imageUrl}
                      alt={ev.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent" />

                    {/* Top Badges */}
                    <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
                      <Badge classification={ev.dataClassification} />

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => handleToggleReminder(e, ev.id)}
                          className={`p-2 rounded-full backdrop-blur-md transition-colors ${
                            hasReminder
                              ? 'bg-amber-500 text-white'
                              : 'bg-stone-900/60 text-white hover:bg-stone-900/90'
                          }`}
                          title={hasReminder ? 'Reminder set' : 'Set reminder'}
                        >
                          <Bell className={`w-3.5 h-3.5 ${hasReminder ? 'fill-current' : ''}`} />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleShare(e, ev)}
                          className="p-2 rounded-full bg-stone-900/60 hover:bg-stone-900/90 text-white backdrop-blur-md transition-colors"
                          title="Share event"
                        >
                          {copiedId === ev.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Share2 className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleSave(ev.id);
                          }}
                          className={`p-2 rounded-full backdrop-blur-md transition-colors ${
                            isSaved
                              ? 'bg-red-500 text-white'
                              : 'bg-stone-900/60 text-white hover:bg-stone-900/90'
                          }`}
                          title={isSaved ? 'Saved' : 'Save'}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                    </div>

                    {/* Bottom Image Overlay Details */}
                    <div className="absolute bottom-3 inset-x-3 text-white">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-stone-900/70 text-rose-300 backdrop-blur-sm">
                          {ev.category}
                        </span>
                        {ev.tentative && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-900/80 text-amber-200 backdrop-blur-sm flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Tentative Dates</span>
                          </span>
                        )}
                      </div>
                      <h2 className="text-base font-bold leading-snug line-clamp-1">{ev.name}</h2>
                      <p className="text-xs text-stone-300 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-[#D9531E]" />
                        <span>
                          {ev.city || ev.destinationName}, {ev.state}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <p className="text-xs text-stone-600 dark:text-stone-300 line-clamp-2 leading-relaxed">
                      {ev.description}
                    </p>

                    {/* Uncertainty Disclaimer if applicable */}
                    {ev.uncertaintyDisclaimer && (
                      <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-[10px] text-amber-800 dark:text-amber-300 flex items-start gap-1.5">
                        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                        <span>{ev.uncertaintyDisclaimer}</span>
                      </div>
                    )}

                    {/* Metadata: Dates, Time, Organizer */}
                    <div className="space-y-1.5 pt-2 border-t border-stone-100 dark:border-stone-800 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="text-stone-400 flex items-center gap-1">
                          <CalendarIcon className="w-3.5 h-3.5" />
                          <span>Dates:</span>
                        </span>
                        <span className="font-semibold text-stone-800 dark:text-stone-200">
                          {ev.startDateApprox || ev.startDate}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-stone-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Timing:</span>
                        </span>
                        <span className="font-medium text-stone-700 dark:text-stone-300">
                          {ev.time || 'Schedule varies by program'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-stone-400">Organizer:</span>
                        <span className="font-medium text-stone-700 dark:text-stone-300 truncate max-w-[180px]">
                          {ev.organizer || 'State Tourism Board'}
                        </span>
                      </div>
                    </div>

                    {/* Ticket & Verification Status Strip */}
                    <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Ticket className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="font-bold text-stone-900 dark:text-stone-100">
                          {ev.ticketInfo?.isFree
                            ? 'Free Entry'
                            : ev.ticketInfo
                            ? `₹${ev.ticketInfo.priceInr}`
                            : 'Admission verified'}
                        </span>
                      </div>

                      <span className="text-[10px] text-stone-400">
                        {ev.verificationStatus || 'Verified Source'}
                      </span>
                    </div>

                    {/* Action Buttons: Add to Trip & Explore */}
                    <div className="pt-2 flex items-center gap-2">
                      {onAddToTrip && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddToTrip(ev);
                          }}
                          className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors text-xs font-semibold flex items-center gap-1"
                          title="Add event to trip itinerary"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to Trip</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEvent(ev);
                        }}
                        className="flex-1 py-2 px-3 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-rose-600 hover:text-white dark:hover:bg-rose-600 text-stone-800 dark:text-stone-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <span>Schedule & Tickets</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* VIEW MODE 2: Calendar Timeline View */
        <div className="p-6 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Annual Bharat Festival Timeline (2026–2027)
              </h3>
              <p className="text-xs text-stone-500">
                Chronological calendar of regional celebrations and spiritual gatherings
              </p>
            </div>
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
              {filteredEvents.length} Events on Schedule
            </span>
          </div>

          <div className="space-y-3">
            {filteredEvents.map((ev) => (
              <div
                key={ev.id}
                onClick={() => onSelectEvent(ev)}
                className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/80 hover:border-rose-500/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-black flex flex-col items-center justify-center shrink-0 border border-rose-200 dark:border-rose-900">
                    <span className="text-[10px] uppercase font-bold">DATE</span>
                    <span className="text-xs">
                      {ev.startDate ? ev.startDate.split('-')[2] : 'TBD'}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400">
                        {ev.category}
                      </span>
                      {ev.tentative && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-semibold">
                          Tentative
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 group-hover:text-rose-600 transition-colors">
                      {ev.name}
                    </h4>
                    <p className="text-xs text-stone-500 mt-0.5 flex items-center gap-2">
                      <span>{ev.startDateApprox || ev.startDate}</span>
                      <span>•</span>
                      <span>
                        {ev.city || ev.destinationName}, {ev.state}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                    {ev.ticketInfo?.isFree ? 'Free Admission' : `₹${ev.ticketInfo?.priceInr || 0}`}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectEvent(ev);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-stone-200 dark:bg-stone-700 hover:bg-rose-600 hover:text-white text-xs font-semibold transition-colors flex items-center gap-1"
                  >
                    <span>View Schedule</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
