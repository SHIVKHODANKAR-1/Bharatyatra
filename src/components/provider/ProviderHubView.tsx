import React, { useState, useEffect } from 'react';
import {
  Building2, ShieldCheck, ShieldAlert, Clock, CheckCircle2, AlertCircle, Plus,
  Edit, Trash2, Calendar, Users, Star, IndianRupee, Eye, EyeOff, MessageSquare,
  Sparkles, Check, ChevronRight, Filter, AlertTriangle, Send, RefreshCw
} from 'lucide-react';
import { Provider, BusinessCategory, ProviderVerificationStatus, ProviderRegistrationFormData } from '../../types/provider';
import { ProviderService } from '../../services/providerService';
import { ExperienceService, ManagedExperience, ExperienceLifecycleStatus } from '../../services/experienceService';
import { EventService, ManagedEvent } from '../../services/eventService';
import { BookingService } from '../../services/bookingService';
import { ReviewService } from '../../services/reviewService';
import { Booking, TravelerReview } from '../../types/booking';
import { UserRole } from '../../types/index';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';

export const ProviderHubView: React.FC = () => {
  const { currentUser, userRole, switchRoleForDemo } = useAuth();

  // Selected Provider ID (defaults to 'prov_varanasi_heritage' or the one associated with user)
  const [currentProvider, setCurrentProvider] = useState<Provider | null>(null);
  const [allProviders, setAllProviders] = useState<Provider[]>([]);

  // Sub-tabs in dashboard
  const [activeTab, setActiveTab] = useState<'overview' | 'experiences' | 'events' | 'bookings' | 'reviews' | 'profile'>('overview');

  // Registration form state (for travelers/unregistered users)
  const [showRegForm, setShowRegForm] = useState<boolean>(false);
  const [regForm, setRegForm] = useState<ProviderRegistrationFormData>({
    businessName: '',
    ownerName: currentUser?.fullName || currentUser?.displayName || '',
    email: currentUser?.email || '',
    phone: '',
    businessCategory: 'Heritage Tours & Walks',
    businessAddress: '',
    city: '',
    state: '',
    description: '',
    servicesOffered: ['Heritage Walking Tours', 'Dawn Boat Rides'],
    languagesSupported: ['Hindi', 'English'],
    accessibilityOptions: ['Assisted guide support'],
    bankDetails: {
      accountHolderName: '',
      bankName: '',
      payoutMethod: 'UPI',
      upiId: '',
    },
  });
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<boolean>(false);

  // Experience creation/edit modal state
  const [isExpModalOpen, setIsExpModalOpen] = useState<boolean>(false);
  const [editingExp, setEditingExp] = useState<ManagedExperience | null>(null);
  const [expFormData, setExpFormData] = useState({
    title: '',
    destinationName: '',
    approxPriceInr: 500,
    durationMinutes: 120,
    category: 'heritage',
    description: '',
    meetingPoint: '',
    capacity: 15,
  });

  // Event creation modal state
  const [isEventModalOpen, setIsEventModalOpen] = useState<boolean>(false);
  const [eventFormData, setEventFormData] = useState({
    name: '',
    destinationName: '',
    startDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
    startTime: '05:00 PM',
    endTime: '08:30 PM',
    ticketPriceInr: 0,
    capacity: 200,
    category: 'Cultural Fair',
    description: '',
  });

  // Host review reply state
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>('');

  // Provider's Data
  const [providerExperiences, setProviderExperiences] = useState<ManagedExperience[]>([]);
  const [providerEvents, setProviderEvents] = useState<ManagedEvent[]>([]);
  const [providerBookings, setProviderBookings] = useState<Booking[]>([]);
  const [providerReviews, setProviderReviews] = useState<TravelerReview[]>([]);

  const loadProviderData = () => {
    const list = ProviderService.getAllProviders();
    setAllProviders(list);

    // If current user is a provider or has one selected, load it
    let prov = currentProvider;
    if (!prov && list.length > 0) {
      prov = list[0]; // defaults to Varanasi Guild for demo
      setCurrentProvider(prov);
    }

    if (prov) {
      const exps = ExperienceService.getExperiencesByProvider(prov.id);
      setProviderExperiences(exps);
      const evts = EventService.getEventsByProvider(prov.id);
      setProviderEvents(evts);
      const bks = BookingService.getProviderBookings(prov.id);
      setProviderBookings(bks);
      const revs = ReviewService.getAllReviews().filter(
        (r) => exps.some((e) => e.id === r.itemId) || r.itemTitle.includes(prov!.city)
      );
      setProviderReviews(revs);
    }
  };

  useEffect(() => {
    loadProviderData();
  }, [currentProvider?.id]);

  const handleProviderSelect = (p: Provider) => {
    setCurrentProvider(p);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    const userId = currentUser?.id || currentUser?.uid;
    const result = ProviderService.registerProvider(regForm, userId);
    if (result.success && result.provider) {
      setRegSuccess(true);
      setCurrentProvider(result.provider);
      setShowRegForm(false);
      loadProviderData();
      if (switchRoleForDemo) switchRoleForDemo(UserRole.PROVIDER);
    } else {
      setRegError(result.error || 'Failed to submit provider registration.');
    }
  };

  const handleSaveExperience = () => {
    if (!currentProvider) return;
    if (editingExp) {
      ExperienceService.updateExperience(editingExp.id, {
        title: expFormData.title,
        destinationName: expFormData.destinationName,
        approxPriceInr: Number(expFormData.approxPriceInr),
        durationMinutes: Number(expFormData.durationMinutes),
        category: expFormData.category as any,
        description: expFormData.description,
        meetingPoint: expFormData.meetingPoint,
        capacity: Number(expFormData.capacity),
      });
    } else {
      ExperienceService.createExperience(
        {
          title: expFormData.title,
          destinationName: expFormData.destinationName,
          approxPriceInr: Number(expFormData.approxPriceInr),
          durationMinutes: Number(expFormData.durationMinutes),
          category: expFormData.category as any,
          description: expFormData.description,
          meetingPoint: expFormData.meetingPoint,
          capacity: Number(expFormData.capacity),
        },
        currentProvider.id,
        currentProvider.businessName,
        'Pending Approval'
      );
    }
    setIsExpModalOpen(false);
    setEditingExp(null);
    loadProviderData();
  };

  const handleSaveEvent = () => {
    if (!currentProvider) return;
    EventService.createEvent(
      {
        name: eventFormData.name,
        destinationName: eventFormData.destinationName,
        startDate: eventFormData.startDate,
        startTime: eventFormData.startTime,
        endTime: eventFormData.endTime,
        ticketPriceInr: Number(eventFormData.ticketPriceInr),
        capacity: Number(eventFormData.capacity),
        category: eventFormData.category as any,
        description: eventFormData.description,
      },
      currentProvider.id,
      currentProvider.businessName,
      'Pending Approval'
    );
    setIsEventModalOpen(false);
    loadProviderData();
  };

  const handleSendReply = (reviewId: string) => {
    if (!replyText.trim() || !currentProvider) return;
    ReviewService.addProviderResponse(reviewId, currentProvider.businessName, replyText);
    setReplyingReviewId(null);
    setReplyText('');
    loadProviderData();
  };

  // Metrics
  const totalEarnings = providerBookings
    .filter((b) => b.paymentStatus === 'Paid')
    .reduce((sum, b) => sum + b.totalAmountInr, 0);

  const publishedCount = providerExperiences.filter((e) => e.lifecycleStatus === 'Published').length;
  const pendingCount = providerExperiences.filter((e) => e.lifecycleStatus === 'Pending Approval').length;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
      {/* Top Banner & Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#D9531E]/10 text-[#D9531E] flex items-center justify-center font-bold">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100">
                Provider Business Portal
              </h1>
              {currentProvider && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    currentProvider.verificationStatus === 'Verified'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : currentProvider.verificationStatus === 'Pending'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                      : 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                  }`}
                >
                  {currentProvider.verificationStatus}
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500">
              Manage experiences, events, incoming guest reservations, and traveler feedback.
            </p>
          </div>
        </div>

        {/* Demo Switch Provider Dropdown & Register Button */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-stone-500">
            <span>Viewing Provider:</span>
            <select
              value={currentProvider?.id || ''}
              onChange={(e) => {
                const found = allProviders.find((p) => p.id === e.target.value);
                if (found) handleProviderSelect(found);
              }}
              className="px-2.5 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs font-semibold text-stone-900 dark:text-stone-100"
            >
              {allProviders.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.businessName} ({p.city}) — [{p.verificationStatus}]
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRegForm(!showRegForm)}
            className="text-xs"
          >
            {showRegForm ? 'Close Form' : 'Register New Guild'}
          </Button>
        </div>
      </div>

      {/* Registration Form Modal / Panel */}
      {showRegForm && (
        <div className="p-6 rounded-3xl bg-stone-50 dark:bg-stone-800/40 border border-[#D9531E]/30 space-y-5 animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-700">
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D9531E]" />
                <span>Onboard as a Verified Cultural Experience Host</span>
              </h2>
              <p className="text-xs text-stone-500">
                Join India's curated national travel ecosystem. All listings undergo state tourism guidelines review.
              </p>
            </div>
            <button
              onClick={() => setShowRegForm(false)}
              className="text-xs text-stone-400 hover:text-stone-600"
            >
              ✕
            </button>
          </div>

          {regError && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{regError}</span>
            </div>
          )}

          <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-stone-700 dark:text-stone-300">
                  Business / Guild Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kashi Vedic Boat Guild"
                  value={regForm.businessName}
                  onChange={(e) => setRegForm({ ...regForm, businessName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700 dark:text-stone-300">
                  Owner / Representative Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pandit Rameshwar Shastri"
                  value={regForm.ownerName}
                  onChange={(e) => setRegForm({ ...regForm, ownerName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700 dark:text-stone-300">
                  Business Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="host@bharatguild.in"
                  value={regForm.email}
                  onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700 dark:text-stone-300">
                  Contact Phone (10 digits) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98390 12345"
                  value={regForm.phone}
                  onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700 dark:text-stone-300">
                  Category *
                </label>
                <select
                  value={regForm.businessCategory}
                  onChange={(e) => setRegForm({ ...regForm, businessCategory: e.target.value as BusinessCategory })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
                >
                  <option value="Heritage Tours & Walks">Heritage Tours & Walks</option>
                  <option value="Cultural Workshops & Arts">Cultural Workshops & Arts</option>
                  <option value="Adventure & Trekking">Adventure & Trekking</option>
                  <option value="Culinary & Cooking">Culinary & Cooking</option>
                  <option value="Spiritual & Pilgrimage">Spiritual & Pilgrimage</option>
                  <option value="Transport & Local Guiding">Transport & Local Guiding</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700 dark:text-stone-300">
                  City & State *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="City (e.g. Varanasi)"
                    value={regForm.city}
                    onChange={(e) => setRegForm({ ...regForm, city: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
                  />
                  <input
                    type="text"
                    required
                    placeholder="State"
                    value={regForm.state}
                    onChange={(e) => setRegForm({ ...regForm, state: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700 dark:text-stone-300">
                Experience & Organization Description (min 20 chars) *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Describe your heritage guiding credentials, lineage, or specialized crafts..."
                value={regForm.description}
                onChange={(e) => setRegForm({ ...regForm, description: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
              />
            </div>

            {/* Payout Details Placeholder */}
            <div className="p-4 rounded-2xl bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 space-y-2">
              <div className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <IndianRupee className="w-4 h-4 text-emerald-600" />
                <span>Direct Payout Information (Simulated Demo Account)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="UPI ID (e.g. host@upi)"
                  value={regForm.bankDetails?.upiId || ''}
                  onChange={(e) =>
                    setRegForm({
                      ...regForm,
                      bankDetails: { ...regForm.bankDetails, upiId: e.target.value },
                    })
                  }
                  className="px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
                />
                <input
                  type="text"
                  placeholder="Bank Name (e.g. SBI, HDFC)"
                  value={regForm.bankDetails?.bankName || ''}
                  onChange={(e) =>
                    setRegForm({
                      ...regForm,
                      bankDetails: { ...regForm.bankDetails, bankName: e.target.value },
                    })
                  }
                  className="px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                type="button"
                className="text-xs"
                onClick={() => setShowRegForm(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit" className="text-xs">
                Submit Registration for Verification
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Verification Status Banner */}
      {currentProvider && (
        <div
          className={`p-4 sm:p-5 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            currentProvider.verificationStatus === 'Verified'
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
              : currentProvider.verificationStatus === 'Pending'
              ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-100'
              : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100'
          }`}
        >
          <div className="flex items-center gap-3">
            {currentProvider.verificationStatus === 'Verified' ? (
              <ShieldCheck className="w-8 h-8 text-emerald-600 shrink-0" />
            ) : currentProvider.verificationStatus === 'Pending' ? (
              <Clock className="w-8 h-8 text-amber-600 shrink-0" />
            ) : (
              <ShieldAlert className="w-8 h-8 text-red-600 shrink-0" />
            )}
            <div>
              <div className="text-xs font-black uppercase tracking-wider">
                Verification Status: {currentProvider.verificationStatus}
              </div>
              <p className="text-xs opacity-90 leading-relaxed">
                {currentProvider.verificationStatus === 'Verified'
                  ? 'Your guild holds the official Bharat Yatra Heritage Seal. Published experiences are live to all global travelers.'
                  : currentProvider.verificationStatus === 'Pending'
                  ? 'Your profile is awaiting tourism authority badge inspection. Experiences remain unlisted until verified.'
                  : `Account restricted: ${currentProvider.rejectionReason || currentProvider.suspendedReason || 'Compliance audit needed'}`}
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[11px] opacity-75 font-mono">
              Profile: {currentProvider.profileCompletionPercentage}% Complete
            </span>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-stone-500">Active Experiences</span>
          <div className="text-2xl font-black text-stone-900 dark:text-stone-100">
            {providerExperiences.length}
          </div>
          <div className="text-[10px] text-emerald-600 font-bold">
            {publishedCount} Published • {pendingCount} Pending
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-stone-500">Reservations</span>
          <div className="text-2xl font-black text-stone-900 dark:text-stone-100">
            {providerBookings.length}
          </div>
          <div className="text-[10px] text-stone-400">
            {providerBookings.filter((b) => b.bookingStatus === 'Confirmed').length} Upcoming
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-stone-500">Host Rating</span>
          <div className="text-2xl font-black text-stone-900 dark:text-stone-100 flex items-center gap-1">
            <span>{currentProvider?.rating || 4.9}</span>
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
          </div>
          <div className="text-[10px] text-stone-400">
            {providerReviews.length} traveler reviews
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-stone-500">Gross Settlement</span>
          <div className="text-2xl font-black text-[#D9531E]">
            ₹{totalEarnings.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-stone-400">Direct Host Payouts</div>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex border-b border-stone-200 dark:border-stone-800 gap-3 sm:gap-6 text-xs sm:text-sm font-semibold overflow-x-auto">
        {(
          [
            { key: 'overview', label: 'Dashboard Overview' },
            { key: 'experiences', label: `Experiences (${providerExperiences.length})` },
            { key: 'events', label: `Cultural Events (${providerEvents.length})` },
            { key: 'bookings', label: `Guest Bookings (${providerBookings.length})` },
            { key: 'reviews', label: `Traveler Reviews (${providerReviews.length})` },
            { key: 'profile', label: 'Guild Profile & Bank' },
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

      {/* TAB CONTENT: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Actions Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D9531E]" />
                <span>Host Operations Quick Actions</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <Button
                  variant="primary"
                  onClick={() => {
                    setEditingExp(null);
                    setExpFormData({
                      title: '',
                      destinationName: currentProvider?.city || '',
                      approxPriceInr: 600,
                      durationMinutes: 120,
                      category: 'heritage',
                      description: '',
                      meetingPoint: '',
                      capacity: 15,
                    });
                    setIsExpModalOpen(true);
                  }}
                  leftIcon={<Plus className="w-4 h-4" />}
                  className="w-full justify-start text-xs"
                >
                  Create New Experience
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    setEventFormData({
                      name: '',
                      destinationName: currentProvider?.city || '',
                      startDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
                      startTime: '05:00 PM',
                      endTime: '08:30 PM',
                      ticketPriceInr: 0,
                      capacity: 100,
                      category: 'Cultural Fair',
                      description: '',
                    });
                    setIsEventModalOpen(true);
                  }}
                  leftIcon={<Plus className="w-4 h-4" />}
                  className="w-full justify-start text-xs"
                >
                  Create Seasonal Event
                </Button>
              </div>

              {/* Status summary */}
              <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800 space-y-1.5 text-xs">
                <div className="font-bold text-stone-800 dark:text-stone-200">
                  Publication Safety Protocol
                </div>
                <p className="text-stone-500 text-[11px] leading-relaxed">
                  Experiences created by verified providers automatically enter the queue for regional safety clearance and price fair-practice auditing.
                </p>
              </div>
            </div>

            {/* Recent Incoming Bookings */}
            <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  Recent Guest Reservations
                </h3>
                <button
                  onClick={() => setActiveTab('bookings')}
                  className="text-xs text-[#D9531E] font-semibold hover:underline"
                >
                  View all ({providerBookings.length})
                </button>
              </div>

              {providerBookings.length === 0 ? (
                <div className="text-center py-8 text-xs text-stone-400">
                  No reservations received yet.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {providerBookings.slice(0, 3).map((b) => (
                    <div
                      key={b.id}
                      className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold text-stone-900 dark:text-stone-100">
                          {b.userName} • {b.travelersCount} Guest{b.travelersCount > 1 ? 's' : ''}
                        </div>
                        <div className="text-[11px] text-stone-500">
                          {b.bookingDate} ({b.timeSlot.split('(')[0].trim()})
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-stone-900 dark:text-stone-100">
                          ₹{b.totalAmountInr}
                        </div>
                        <span className="text-[10px] text-emerald-600 font-bold">
                          {b.bookingStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: EXPERIENCES */}
      {activeTab === 'experiences' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Managed Experiences & Tours
              </h3>
              <p className="text-xs text-stone-500">
                Only published experiences appear to travelers in search and discovery.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setEditingExp(null);
                setExpFormData({
                  title: '',
                  destinationName: currentProvider?.city || '',
                  approxPriceInr: 600,
                  durationMinutes: 120,
                  category: 'heritage',
                  description: '',
                  meetingPoint: '',
                  capacity: 15,
                });
                setIsExpModalOpen(true);
              }}
              leftIcon={<Plus className="w-4 h-4" />}
              className="text-xs"
            >
              Add New Experience
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {providerExperiences.map((exp) => (
              <div
                key={exp.id}
                className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        exp.lifecycleStatus === 'Published'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : exp.lifecycleStatus === 'Pending Approval'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                          : 'bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
                      }`}
                    >
                      {exp.lifecycleStatus || 'Published'}
                    </span>
                    <span className="text-xs font-bold text-[#D9531E]">
                      ₹{exp.approxPriceInr} / person
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 leading-snug">
                    {exp.title}
                  </h4>
                  <p className="text-xs text-stone-500 line-clamp-2">
                    {exp.description}
                  </p>

                  <div className="text-[11px] text-stone-400 space-y-0.5 pt-1">
                    <div>Destination: <strong>{exp.destinationName}</strong></div>
                    <div>Capacity: <strong>{exp.capacity || 15} guests per slot</strong></div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-stone-800">
                  <div className="flex gap-2">
                    {exp.lifecycleStatus === 'Published' ? (
                      <button
                        onClick={() => {
                          ExperienceService.setLifecycleStatus(exp.id, 'Unpublished');
                          loadProviderData();
                        }}
                        className="text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 flex items-center gap-1"
                      >
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Unpublish</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          ExperienceService.setLifecycleStatus(exp.id, 'Published');
                          loadProviderData();
                        }}
                        className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1 font-bold"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Publish Live</span>
                      </button>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingExp(exp);
                        setExpFormData({
                          title: exp.title,
                          destinationName: exp.destinationName,
                          approxPriceInr: exp.approxPriceInr,
                          durationMinutes: exp.durationMinutes,
                          category: exp.category,
                          description: exp.description,
                          meetingPoint: exp.meetingPoint || '',
                          capacity: exp.capacity || 15,
                        });
                        setIsExpModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete experience "${exp.title}"?`)) {
                          ExperienceService.deleteExperience(exp.id);
                          loadProviderData();
                        }
                      }}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: EVENTS */}
      {activeTab === 'events' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Cultural Events & Festivals
              </h3>
              <p className="text-xs text-stone-500">
                Host temple aartis, classical music evenings, and regional food fairs.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setEventFormData({
                  name: '',
                  destinationName: currentProvider?.city || '',
                  startDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
                  startTime: '05:00 PM',
                  endTime: '08:30 PM',
                  ticketPriceInr: 0,
                  capacity: 200,
                  category: 'Cultural Fair',
                  description: '',
                });
                setIsEventModalOpen(true);
              }}
              leftIcon={<Plus className="w-4 h-4" />}
              className="text-xs"
            >
              Add New Event
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {providerEvents.map((evt) => (
              <div
                key={evt.id}
                className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      evt.approvalStatus === 'Published'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                    }`}
                  >
                    {evt.approvalStatus || 'Published'}
                  </span>
                  <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                    {evt.ticketPriceInr === 0 ? 'Free Entry' : `₹${evt.ticketPriceInr} Pass`}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  {evt.name}
                </h4>
                <div className="text-xs text-stone-500 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-[#D9531E]" />
                  <span>{evt.startDate} • {evt.startTime} to {evt.endTime}</span>
                </div>
                <p className="text-xs text-stone-500 line-clamp-2">
                  {evt.description}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800 text-xs">
                  <span className="text-stone-400">
                    Capacity: {evt.capacity} registered
                  </span>
                  {evt.approvalStatus !== 'Cancelled' && (
                    <button
                      onClick={() => {
                        EventService.cancelEvent(evt.id);
                        loadProviderData();
                      }}
                      className="text-red-500 hover:underline font-semibold"
                    >
                      Cancel Event
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: BOOKINGS */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
              Incoming Guest Bookings
            </h3>
            <span className="text-xs text-stone-500">
              {providerBookings.length} total reservations
            </span>
          </div>

          {providerBookings.length === 0 ? (
            <div className="text-center py-12 p-6 rounded-3xl bg-stone-50 dark:bg-stone-800/30 text-xs text-stone-400">
              No guest reservations recorded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {providerBookings.map((b) => (
                <div
                  key={b.id}
                  className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-stone-400 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded">
                        {b.id}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          b.bookingStatus === 'Confirmed'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                            : b.bookingStatus === 'Completed'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                            : 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300'
                        }`}
                      >
                        {b.bookingStatus}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                      {b.itemTitle}
                    </h4>

                    <div className="text-xs text-stone-600 dark:text-stone-400 space-y-0.5">
                      <div>Guest: <strong>{b.userName}</strong> ({b.userPhone} • {b.userEmail})</div>
                      <div>Date & Slot: <strong>{b.bookingDate}</strong> • {b.timeSlot}</div>
                      <div>Party Size: <strong>{b.travelersCount} traveler(s)</strong></div>
                    </div>
                  </div>

                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-2 sm:pt-0">
                    <div className="text-left sm:text-right">
                      <div className="text-[10px] text-stone-400">Total Settlement</div>
                      <div className="text-base font-black text-[#D9531E]">
                        ₹{b.totalAmountInr}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      {b.bookingStatus === 'Confirmed' && (
                        <>
                          <button
                            onClick={() => {
                              BookingService.providerUpdateStatus(b.id, 'Completed');
                              loadProviderData();
                            }}
                            className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                          >
                            Mark Completed
                          </button>
                          <button
                            onClick={() => {
                              const r = prompt('Reason for cancellation:');
                              if (r) {
                                BookingService.providerUpdateStatus(b.id, 'Cancelled', r);
                                loadProviderData();
                              }
                            }}
                            className="px-2.5 py-1 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold"
                          >
                            Decline / Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: REVIEWS */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Customer Reviews & Feedback
              </h3>
              <p className="text-xs text-stone-500">
                Build trust by actively responding to guest compliments and inquiries.
              </p>
            </div>
          </div>

          {providerReviews.length === 0 ? (
            <div className="text-center py-12 p-6 rounded-3xl bg-stone-50 dark:bg-stone-800/30 text-xs text-stone-400">
              No customer reviews submitted yet.
            </div>
          ) : (
            <div className="space-y-4">
              {providerReviews.map((r) => (
                <div
                  key={r.id}
                  className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-stone-900 dark:text-stone-100">
                          {r.userName}
                        </span>
                        {r.isVerifiedBooking && (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                            Verified Guest
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-stone-400">{r.itemTitle}</div>
                    </div>

                    <div className="flex items-center text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= r.rating ? 'fill-amber-400' : 'text-stone-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <h5 className="font-bold text-stone-900 dark:text-stone-100">{r.title}</h5>
                    <p className="text-stone-600 dark:text-stone-300">{r.comment}</p>
                  </div>

                  {/* Existing Response */}
                  {r.providerResponse ? (
                    <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border-l-2 border-[#D9531E] text-xs space-y-1">
                      <div className="font-bold text-[11px] text-stone-800 dark:text-stone-200">
                        Your Guild Response:
                      </div>
                      <p className="text-stone-600 dark:text-stone-300 italic text-[11px]">
                        "{r.providerResponse.text}"
                      </p>
                    </div>
                  ) : (
                    <div>
                      {replyingReviewId === r.id ? (
                        <div className="space-y-2 pt-2">
                          <textarea
                            rows={2}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Type respectful host reply..."
                            className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
                          />
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={() => setReplyingReviewId(null)}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              className="text-xs"
                              onClick={() => handleSendReply(r.id)}
                            >
                              Post Response
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setReplyingReviewId(r.id);
                            setReplyText('');
                          }}
                          className="text-xs text-[#D9531E] font-bold hover:underline flex items-center gap-1"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Reply as Host</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: PROFILE */}
      {activeTab === 'profile' && currentProvider && (
        <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-6 text-xs">
          <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800">
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Guild Business Details
              </h3>
              <p className="text-stone-500">
                Official registry identification and bank settlement accounts.
              </p>
            </div>
            <span className="font-mono text-stone-400">ID: {currentProvider.id}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-stone-400 font-semibold">Registered Entity</span>
              <p className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                {currentProvider.businessName}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-stone-400 font-semibold">Authorized Representative</span>
              <p className="font-bold text-stone-900 dark:text-stone-100">
                {currentProvider.ownerName}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-stone-400 font-semibold">Contact Email</span>
              <p className="text-stone-800 dark:text-stone-200">{currentProvider.email}</p>
            </div>

            <div className="space-y-1">
              <span className="text-stone-400 font-semibold">Contact Phone</span>
              <p className="text-stone-800 dark:text-stone-200">{currentProvider.phone}</p>
            </div>

            <div className="space-y-1">
              <span className="text-stone-400 font-semibold">Base Address</span>
              <p className="text-stone-800 dark:text-stone-200">
                {currentProvider.businessAddress}, {currentProvider.city}, {currentProvider.state}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-stone-400 font-semibold">Official License No.</span>
              <p className="font-mono text-stone-800 dark:text-stone-200">
                {currentProvider.licenseNumber || 'PENDING-AUDIT-2026'}
              </p>
            </div>
          </div>

          {/* Bank details card */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800 space-y-2">
            <h4 className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
              <IndianRupee className="w-4 h-4 text-emerald-600" />
              <span>Settlement Account (Demo Sandbox)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-[10px] text-stone-400">Account Holder</span>
                <p className="font-semibold">{currentProvider.bankDetails.accountHolderName || currentProvider.ownerName}</p>
              </div>
              <div>
                <span className="text-[10px] text-stone-400">Bank / Payout</span>
                <p className="font-semibold">{currentProvider.bankDetails.bankName || 'Direct UPI Settlement'}</p>
              </div>
              <div>
                <span className="text-[10px] text-stone-400">Account / UPI</span>
                <p className="font-mono">{currentProvider.bankDetails.upiId || currentProvider.bankDetails.accountNumberMasked || 'host@upi'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE/EDIT EXPERIENCE MODAL */}
      {isExpModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg bg-white dark:bg-stone-900 rounded-3xl p-6 space-y-4 shadow-2xl border border-stone-200 dark:border-stone-800 text-xs">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
              {editingExp ? 'Edit Experience' : 'Create New Cultural Experience'}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="font-semibold text-stone-700 dark:text-stone-300">
                  Experience Title *
                </label>
                <input
                  type="text"
                  value={expFormData.title}
                  onChange={(e) => setExpFormData({ ...expFormData, title: e.target.value })}
                  placeholder="e.g. Dawn Heritage Boat Row & Vedic Chanting"
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 dark:text-stone-300">
                    City / Destination *
                  </label>
                  <input
                    type="text"
                    value={expFormData.destinationName}
                    onChange={(e) => setExpFormData({ ...expFormData, destinationName: e.target.value })}
                    placeholder="Varanasi, Jaipur, Hampi..."
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 dark:text-stone-300">
                    Price per Person (₹) *
                  </label>
                  <input
                    type="number"
                    value={expFormData.approxPriceInr}
                    onChange={(e) => setExpFormData({ ...expFormData, approxPriceInr: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 dark:text-stone-300">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    value={expFormData.durationMinutes}
                    onChange={(e) => setExpFormData({ ...expFormData, durationMinutes: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 dark:text-stone-300">
                    Max Group Capacity
                  </label>
                  <input
                    type="number"
                    value={expFormData.capacity}
                    onChange={(e) => setExpFormData({ ...expFormData, capacity: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-700 dark:text-stone-300">
                  Meeting Point Landmark *
                </label>
                <input
                  type="text"
                  value={expFormData.meetingPoint}
                  onChange={(e) => setExpFormData({ ...expFormData, meetingPoint: e.target.value })}
                  placeholder="e.g. Subah-e-Banaras Canopy, Assi Ghat steps"
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 dark:text-stone-300">
                  Detailed Experience Description *
                </label>
                <textarea
                  rows={3}
                  value={expFormData.description}
                  onChange={(e) => setExpFormData({ ...expFormData, description: e.target.value })}
                  placeholder="Historical context, route, inclusions..."
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                className="text-xs"
                onClick={() => setIsExpModalOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" className="text-xs" onClick={handleSaveExperience}>
                {editingExp ? 'Update Experience' : 'Submit for Clearance'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE EVENT MODAL */}
      {isEventModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg bg-white dark:bg-stone-900 rounded-3xl p-6 space-y-4 shadow-2xl border border-stone-200 dark:border-stone-800 text-xs">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
              Create Seasonal Event / Festival
            </h3>

            <div className="space-y-3">
              <div>
                <label className="font-semibold text-stone-700 dark:text-stone-300">
                  Event Name *
                </label>
                <input
                  type="text"
                  value={eventFormData.name}
                  onChange={(e) => setEventFormData({ ...eventFormData, name: e.target.value })}
                  placeholder="e.g. Assi Ghat Kartik Purnima Deep Utsav"
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 dark:text-stone-300">
                    Host City *
                  </label>
                  <input
                    type="text"
                    value={eventFormData.destinationName}
                    onChange={(e) => setEventFormData({ ...eventFormData, destinationName: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 dark:text-stone-300">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    value={eventFormData.startDate}
                    onChange={(e) => setEventFormData({ ...eventFormData, startDate: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 dark:text-stone-300">
                    Ticket Price (₹ - 0 for Free)
                  </label>
                  <input
                    type="number"
                    value={eventFormData.ticketPriceInr}
                    onChange={(e) => setEventFormData({ ...eventFormData, ticketPriceInr: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 dark:text-stone-300">
                    Guest Capacity
                  </label>
                  <input
                    type="number"
                    value={eventFormData.capacity}
                    onChange={(e) => setEventFormData({ ...eventFormData, capacity: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-700 dark:text-stone-300">
                  Event Description
                </label>
                <textarea
                  rows={3}
                  value={eventFormData.description}
                  onChange={(e) => setEventFormData({ ...eventFormData, description: e.target.value })}
                  placeholder="Highlights, schedule, attire recommendations..."
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                className="text-xs"
                onClick={() => setIsEventModalOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" className="text-xs" onClick={handleSaveEvent}>
                Submit Event
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
