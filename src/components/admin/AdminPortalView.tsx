import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, ShieldCheck, Users, Building2, Calendar, MapPin, CheckCircle2,
  XCircle, AlertTriangle, MessageSquare, Flag, RefreshCw, Eye, EyeOff, FileText,
  CreditCard, Search, ChevronRight, Check, X, Shield, ArrowUpRight
} from 'lucide-react';
import { ProviderService } from '../../services/providerService';
import { ExperienceService, ManagedExperience } from '../../services/experienceService';
import { EventService, ManagedEvent } from '../../services/eventService';
import { BookingService } from '../../services/bookingService';
import { ReviewService } from '../../services/reviewService';
import { SupportService } from '../../services/supportService';
import { Provider } from '../../types/provider';
import { Booking, TravelerReview, SupportTicket } from '../../types/booking';
import { UserRole } from '../../types/index';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';

export const AdminPortalView: React.FC = () => {
  const { userRole, switchRoleForDemo } = useAuth();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'providers' | 'experiences' | 'events' | 'bookings' | 'reviews' | 'support' | 'roles'
  >('overview');

  // Datasets
  const [providers, setProviders] = useState<Provider[]>([]);
  const [experiences, setExperiences] = useState<ManagedExperience[]>([]);
  const [events, setEvents] = useState<ManagedEvent[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<TravelerReview[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  // Action dialogs
  const [statusActionProvider, setStatusActionProvider] = useState<{
    id: string;
    action: 'Verified' | 'Rejected' | 'Suspended';
    reason: string;
  } | null>(null);

  const [moderatingReview, setModeratingReview] = useState<{
    id: string;
    action: 'Published' | 'Hidden';
    reason: string;
  } | null>(null);

  const [ticketResolution, setTicketResolution] = useState<{
    id: string;
    status: 'In Progress' | 'Resolved' | 'Closed';
    notes: string;
  } | null>(null);

  const loadAllData = () => {
    setProviders(ProviderService.getAllProviders());
    setExperiences(ExperienceService.getAllExperiences());
    setEvents(EventService.getAllEvents());
    setBookings(BookingService.getAllBookings());
    setReviews(ReviewService.getAllReviews());
    setTickets(SupportService.getAllTickets());
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Compute Metrics
  const totalUsers = 1248; // Platform traveler count demo
  const activeProviders = providers.filter((p) => p.verificationStatus === 'Verified').length;
  const pendingProviders = providers.filter((p) => p.verificationStatus === 'Pending' || p.verificationStatus === 'Under Review').length;
  const publishedExperiences = experiences.filter((e) => e.lifecycleStatus === 'Published').length;
  const pendingExperiences = experiences.filter((e) => e.lifecycleStatus === 'Pending Approval').length;
  const upcomingEvents = events.filter((e) => e.approvalStatus === 'Published').length;
  const totalBookings = bookings.length;
  const cancelledBookings = bookings.filter((b) => b.bookingStatus === 'Cancelled' || b.bookingStatus === 'Refunded').length;
  const reportedReviews = reviews.filter((r) => r.isReported || r.status === 'Under Review').length;
  const openTickets = tickets.filter((t) => t.status === 'Open' || t.status === 'In Progress').length;

  const handleProviderVerification = () => {
    if (!statusActionProvider) return;
    ProviderService.setVerificationStatus(
      statusActionProvider.id,
      statusActionProvider.action,
      statusActionProvider.reason
    );
    setStatusActionProvider(null);
    loadAllData();
  };

  const handleReviewModeration = () => {
    if (!moderatingReview) return;
    ReviewService.moderateReview(
      moderatingReview.id,
      moderatingReview.action,
      moderatingReview.reason
    );
    setModeratingReview(null);
    loadAllData();
  };

  const handleTicketResolution = () => {
    if (!ticketResolution) return;
    SupportService.updateTicketStatus(
      ticketResolution.id,
      ticketResolution.status,
      ticketResolution.notes
    );
    setTicketResolution(null);
    loadAllData();
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-3xl bg-stone-900 text-stone-100 shadow-xl border border-stone-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#D9531E] text-white flex items-center justify-center font-bold">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                Government & Tourism Board Admin Console
              </h1>
              <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Live Governance Desk
              </span>
            </div>
            <p className="text-xs text-stone-400">
              National compliance, regional provider certification, and traveler safety oversight.
            </p>
          </div>
        </div>

        {/* Demo Role Switcher Reminder */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-stone-400">Current Role:</span>
          <span className="font-bold text-[#D9531E] bg-[#D9531E]/10 px-2.5 py-1 rounded-xl border border-[#D9531E]/30">
            {userRole}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={loadAllData}
            leftIcon={<RefreshCw className="w-3 h-3" />}
            className="text-xs text-stone-300 border-stone-700 hover:bg-stone-800"
          >
            Sync State
          </Button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-1">
          <span className="text-[10px] font-bold text-stone-400 uppercase">Travelers</span>
          <div className="text-lg font-black text-stone-900 dark:text-stone-100">{totalUsers}</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-1">
          <span className="text-[10px] font-bold text-stone-400 uppercase">Verified Hosts</span>
          <div className="text-lg font-black text-emerald-600">{activeProviders}</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-1">
          <span className="text-[10px] font-bold text-amber-500 uppercase">Pending Audits</span>
          <div className="text-lg font-black text-amber-500">{pendingProviders + pendingExperiences}</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-1">
          <span className="text-[10px] font-bold text-stone-400 uppercase">Experiences</span>
          <div className="text-lg font-black text-stone-900 dark:text-stone-100">{publishedExperiences}</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-1">
          <span className="text-[10px] font-bold text-stone-400 uppercase">Live Events</span>
          <div className="text-lg font-black text-stone-900 dark:text-stone-100">{upcomingEvents}</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-1">
          <span className="text-[10px] font-bold text-stone-400 uppercase">Total Bookings</span>
          <div className="text-lg font-black text-[#D9531E]">{totalBookings}</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-1">
          <span className="text-[10px] font-bold text-red-500 uppercase">Flagged Reviews</span>
          <div className="text-lg font-black text-red-500">{reportedReviews}</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-1">
          <span className="text-[10px] font-bold text-blue-500 uppercase">Open Cases</span>
          <div className="text-lg font-black text-blue-500">{openTickets}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 dark:border-stone-800 gap-3 sm:gap-6 text-xs sm:text-sm font-semibold overflow-x-auto">
        {(
          [
            { key: 'overview', label: 'Console Overview' },
            { key: 'providers', label: `Providers & Verification (${providers.length})` },
            { key: 'experiences', label: `Experiences (${experiences.length})` },
            { key: 'events', label: `Events (${events.length})` },
            { key: 'bookings', label: `Bookings & Refunds (${bookings.length})` },
            { key: 'reviews', label: `Review Moderation (${reportedReviews} flagged)` },
            { key: 'support', label: `Support Tickets (${tickets.length})` },
            { key: 'roles', label: 'RBAC & Roles' },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`pb-3 px-1 whitespace-nowrap transition-colors ${
              activeTab === t.key
                ? 'text-[#D9531E] font-bold border-b-2 border-[#D9531E]'
                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* SECTION: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Provider Applications */}
          <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#D9531E]" />
                <span>Pending Provider Onboarding Audits</span>
              </h3>
              <button
                onClick={() => setActiveTab('providers')}
                className="text-xs text-[#D9531E] font-semibold hover:underline"
              >
                View all
              </button>
            </div>

            {providers.filter((p) => p.verificationStatus === 'Pending' || p.verificationStatus === 'Under Review').length === 0 ? (
              <p className="text-xs text-stone-400 py-4">All provider applications are up to date.</p>
            ) : (
              <div className="space-y-3">
                {providers
                  .filter((p) => p.verificationStatus === 'Pending' || p.verificationStatus === 'Under Review')
                  .map((p) => (
                    <div
                      key={p.id}
                      className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold text-stone-900 dark:text-stone-100">
                          {p.businessName}
                        </div>
                        <div className="text-stone-500 text-[11px]">
                          {p.city}, {p.state} • {p.businessCategory}
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        <Button
                          variant="primary"
                          size="sm"
                          className="text-[11px] py-1 px-2.5"
                          onClick={() => {
                            ProviderService.setVerificationStatus(p.id, 'Verified');
                            loadAllData();
                          }}
                        >
                          Approve Seal
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Pending Experiences Clearances */}
          <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#D9531E]" />
                <span>Pending Experience Moderation</span>
              </h3>
              <button
                onClick={() => setActiveTab('experiences')}
                className="text-xs text-[#D9531E] font-semibold hover:underline"
              >
                View all
              </button>
            </div>

            {experiences.filter((e) => e.lifecycleStatus === 'Pending Approval').length === 0 ? (
              <p className="text-xs text-stone-400 py-4">No experiences awaiting moderation.</p>
            ) : (
              <div className="space-y-3">
                {experiences
                  .filter((e) => e.lifecycleStatus === 'Pending Approval')
                  .map((e) => (
                    <div
                      key={e.id}
                      className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold text-stone-900 dark:text-stone-100 truncate max-w-xs">
                          {e.title}
                        </div>
                        <div className="text-stone-500 text-[11px]">
                          {e.destinationName} • ₹{e.approxPriceInr} • By {e.providerName || 'Provider'}
                        </div>
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        className="text-[11px] py-1 px-2.5"
                        onClick={() => {
                          ExperienceService.setLifecycleStatus(e.id, 'Published');
                          loadAllData();
                        }}
                      >
                        Publish Live
                      </Button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION: PROVIDERS */}
      {activeTab === 'providers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Registered Host Guilds & Operators
              </h3>
              <p className="text-xs text-stone-500">
                Grant, inspect, or revoke official Bharat Yatra Tourism Badges.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {providers.map((p) => (
              <div
                key={p.id}
                className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                      {p.businessName}
                    </h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        p.verificationStatus === 'Verified'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : p.verificationStatus === 'Pending'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                          : 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                      }`}
                    >
                      {p.verificationStatus}
                    </span>
                    <span className="font-mono text-stone-400 text-[10px]">ID: {p.id}</span>
                  </div>

                  <div className="text-stone-600 dark:text-stone-400 space-y-0.5">
                    <div>
                      Contact: <strong>{p.ownerName}</strong> ({p.email} • {p.phone})
                    </div>
                    <div>
                      Location: <strong>{p.city}, {p.state}</strong> • Category: <strong>{p.businessCategory}</strong>
                    </div>
                    <div>
                      License: <span className="font-mono">{p.licenseNumber || 'Under Audit'}</span> • Rating: {p.rating} ★ ({p.reviewsCount} reviews)
                    </div>
                  </div>

                  <p className="text-stone-500 italic text-[11px] line-clamp-1">
                    "{p.description}"
                  </p>
                </div>

                <div className="flex items-center gap-2 border-t lg:border-t-0 pt-3 lg:pt-0">
                  {p.verificationStatus !== 'Verified' && (
                    <Button
                      variant="primary"
                      size="sm"
                      className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => {
                        ProviderService.setVerificationStatus(p.id, 'Verified');
                        loadAllData();
                      }}
                    >
                      Verify & Grant Seal
                    </Button>
                  )}

                  {p.verificationStatus !== 'Suspended' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs text-red-600 border-red-200 dark:border-red-900 hover:bg-red-50"
                      onClick={() => {
                        const reason = prompt('Specify suspension or compliance reason:');
                        if (reason) {
                          ProviderService.setVerificationStatus(p.id, 'Suspended', reason);
                          loadAllData();
                        }
                      }}
                    >
                      Suspend
                    </Button>
                  )}

                  {p.verificationStatus === 'Suspended' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs text-emerald-600"
                      onClick={() => {
                        ProviderService.setVerificationStatus(p.id, 'Verified');
                        loadAllData();
                      }}
                    >
                      Restore Provider
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION: EXPERIENCES */}
      {activeTab === 'experiences' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
              National Experience Registry
            </h3>
            <span className="text-xs text-stone-500">{experiences.length} total experiences</span>
          </div>

          <div className="space-y-3">
            {experiences.map((exp) => (
              <div
                key={exp.id}
                className="p-4 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        exp.lifecycleStatus === 'Published'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}
                    >
                      {exp.lifecycleStatus || 'Published'}
                    </span>
                    <h4 className="font-bold text-stone-900 dark:text-stone-100">{exp.title}</h4>
                  </div>
                  <div className="text-stone-500">
                    {exp.destinationName} • Price: ₹{exp.approxPriceInr} • Provider: {exp.providerName || 'Direct'}
                  </div>
                </div>

                <div className="flex gap-2">
                  {exp.lifecycleStatus !== 'Published' ? (
                    <Button
                      variant="primary"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        ExperienceService.setLifecycleStatus(exp.id, 'Published');
                        loadAllData();
                      }}
                    >
                      Approve & Publish
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        ExperienceService.setLifecycleStatus(exp.id, 'Unpublished');
                        loadAllData();
                      }}
                    >
                      Unpublish
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs text-red-500 hover:bg-red-50"
                    onClick={() => {
                      if (confirm(`Remove "${exp.title}"?`)) {
                        ExperienceService.deleteExperience(exp.id);
                        loadAllData();
                      }
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION: BOOKINGS & REFUNDS */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
              Platform Transactions & Settlements
            </h3>
            <span className="text-xs text-stone-500">{bookings.length} reservations</span>
          </div>

          <div className="space-y-3">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="p-4 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[10px] text-stone-400">{b.id}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        b.bookingStatus === 'Confirmed'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : b.bookingStatus === 'Completed'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                          : 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                      }`}
                    >
                      {b.bookingStatus}
                    </span>
                    <span className="text-stone-500">
                      Payment: <strong className="text-stone-800 dark:text-stone-200">{b.paymentStatus}</strong>
                    </span>
                  </div>

                  <h4 className="font-bold text-stone-900 dark:text-stone-100">{b.itemTitle}</h4>
                  <div className="text-stone-500">
                    Traveler: {b.userName} • Date: {b.bookingDate} • {b.travelersCount} Guests • Total: ₹{b.totalAmountInr}
                  </div>
                  {b.refundRequest && (
                    <div className="text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-xl border border-amber-200 dark:border-amber-800">
                      Refund Requested: ₹{b.refundRequest.amountInr} ({b.refundRequest.status}) • Reason: {b.refundRequest.reason}
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-sm font-black text-stone-900 dark:text-stone-100">
                    ₹{b.totalAmountInr}
                  </span>
                  <div className="text-[10px] text-stone-400">{b.paymentMethod || 'Demo Gateway'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION: REVIEW MODERATION */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Review Moderation Queue
              </h3>
              <p className="text-xs text-stone-500">
                Flagged reviews are hidden from public discovery until cleared.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-4 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900 dark:text-stone-100">{rev.userName}</span>
                    <span className="text-amber-500 font-bold">{rev.rating} ★</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        rev.status === 'Published'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                      }`}
                    >
                      {rev.status}
                    </span>
                    {rev.isReported && (
                      <span className="text-[10px] font-bold text-red-600 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-full border border-red-200 dark:border-red-800">
                        Reported Flag
                      </span>
                    )}
                  </div>

                  <div className="text-stone-800 dark:text-stone-200 font-semibold">{rev.title}</div>
                  <p className="text-stone-600 dark:text-stone-400">{rev.comment}</p>
                  {rev.reportReason && (
                    <div className="text-[11px] text-red-600 dark:text-red-400">
                      Flag Reason: {rev.reportReason}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {rev.status === 'Published' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs text-red-600 hover:bg-red-50"
                      onClick={() => {
                        ReviewService.moderateReview(rev.id, 'Hidden', 'Content violation');
                        loadAllData();
                      }}
                    >
                      Hide Review
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        ReviewService.moderateReview(rev.id, 'Published', 'Approved by moderator');
                        loadAllData();
                      }}
                    >
                      Restore / Approve
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION: SUPPORT TICKETS */}
      {activeTab === 'support' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
              User Support & Reporting Center
            </h3>
            <span className="text-xs text-stone-500">{tickets.length} inquiries logged</span>
          </div>

          <div className="space-y-3">
            {tickets.map((t) => (
              <div
                key={t.id}
                className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-stone-400 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded">
                      {t.id}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        t.status === 'Resolved'
                          ? 'bg-emerald-100 text-emerald-700'
                          : t.status === 'In Progress'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {t.status}
                    </span>
                    <span className="text-stone-400">Category: <strong>{t.category}</strong></span>
                  </div>
                  <span className="text-stone-400 text-[10px]">
                    {new Date(t.createdAt).toLocaleDateString('en-IN')}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-stone-900 dark:text-stone-100 text-sm">{t.subject}</h4>
                  <p className="text-stone-600 dark:text-stone-400 mt-1">{t.description}</p>
                </div>

                <div className="text-[11px] text-stone-500">
                  User: <strong>{t.userName}</strong> ({t.userEmail}) • Target: {t.targetTitle || t.targetType}
                </div>

                {t.resolutionNotes && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 text-[11px]">
                    Resolution: {t.resolutionNotes}
                  </div>
                )}

                <div className="flex gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                  {t.status !== 'Resolved' && (
                    <Button
                      variant="primary"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        const notes = prompt('Enter resolution summary for user:');
                        if (notes) {
                          SupportService.updateTicketStatus(t.id, 'Resolved', notes);
                          loadAllData();
                        }
                      }}
                    >
                      Resolve Case
                    </Button>
                  )}
                  {t.status === 'Open' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        SupportService.updateTicketStatus(t.id, 'In Progress');
                        loadAllData();
                      }}
                    >
                      Mark In Progress
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION: ROLES & RBAC */}
      {activeTab === 'roles' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-6 text-xs">
          <div>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
              Role-Based Access Control (RBAC) Architecture
            </h3>
            <p className="text-stone-500">
              Current roles supported across the platform with runtime testing switchers:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(
              [
                { role: UserRole.TRAVELER, desc: 'Public traveler: discovery, booking, review submission, booking voucher management.' },
                { role: UserRole.PROVIDER, desc: 'Registered Host Guild: experience & event creation, booking acceptance, review replies.' },
                { role: UserRole.MODERATOR, desc: 'Review & content inspector: flags, disputes, content screening.' },
                { role: UserRole.SUPPORT_AGENT, desc: 'Customer desk: ticket resolution, booking assistance.' },
                { role: UserRole.ADMIN, desc: 'Regional admin: provider verification, experience publishing, refund processing.' },
                { role: UserRole.SUPER_ADMIN, desc: 'Full authority: national system settings, registry audit, user management.' },
              ] as const
            ).map((item) => (
              <div
                key={item.role}
                className={`p-4 rounded-2xl border space-y-2 transition-all ${
                  userRole === item.role
                    ? 'border-[#D9531E] bg-[#D9531E]/5'
                    : 'border-stone-200 dark:border-stone-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900 dark:text-stone-100">{item.role}</span>
                  {userRole === item.role ? (
                    <span className="text-[10px] font-bold text-[#D9531E]">Active</span>
                  ) : (
                    <button
                      onClick={() => switchRoleForDemo && switchRoleForDemo(item.role)}
                      className="text-[11px] text-[#D9531E] font-semibold hover:underline"
                    >
                      Switch to
                    </button>
                  )}
                </div>
                <p className="text-stone-500 text-[11px] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
