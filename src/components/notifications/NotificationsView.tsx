import React, { useState, useEffect } from 'react';
import {
  Bell,
  Check,
  Trash2,
  Calendar,
  AlertCircle,
  Sparkles,
  MessageSquare,
  ShieldCheck,
  ArrowRight,
  SlidersHorizontal,
  X,
  Compass,
  Tag,
  Info,
} from 'lucide-react';
import { AppNotification, NotificationCategory, NotificationPreferences } from '../../types/booking';
import { NotificationService } from '../../services/notificationService';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';

interface NotificationsViewProps {
  onNavigateTab?: (tab: string, id?: string) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({ onNavigateTab }) => {
  const { currentUser, userRole } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [activeCategory, setActiveCategory] = useState<NotificationCategory>('all');
  const [isPrefsOpen, setIsPrefsOpen] = useState<boolean>(false);
  const [prefs, setPrefs] = useState<NotificationPreferences>(() =>
    NotificationService.getPreferences(currentUser?.id || currentUser?.uid)
  );

  const getUserId = () => currentUser?.id || currentUser?.uid || 'usr_demo_traveler';

  const loadNotifications = () => {
    // Automatically trigger upcoming reminder check on load
    NotificationService.triggerReminderChecks(getUserId());
    const list = NotificationService.getNotificationsForUser(
      getUserId(),
      userRole,
      activeCategory
    );
    setNotifications(list);
  };

  useEffect(() => {
    loadNotifications();
  }, [currentUser, userRole, activeCategory]);

  const handleMarkAsRead = (id: string) => {
    NotificationService.markAsRead(id);
    loadNotifications();
  };

  const handleMarkAllAsRead = () => {
    NotificationService.markAllAsRead(getUserId());
    loadNotifications();
  };

  const handleDelete = (id: string) => {
    NotificationService.deleteNotification(id);
    loadNotifications();
  };

  const handleClearAll = () => {
    NotificationService.clearAll(getUserId());
    loadNotifications();
  };

  const handleSavePref = (key: keyof NotificationPreferences, val: boolean) => {
    const updated = { ...prefs, [key]: val };
    setPrefs(updated);
    NotificationService.savePreferences(updated, getUserId());
  };

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'booking_confirmation':
      case 'booking_status_update':
        return <Calendar className="w-4 h-4 text-[#D9531E]" />;
      case 'trip_reminder':
        return <Compass className="w-4 h-4 text-teal-600" />;
      case 'event_reminder':
        return <Calendar className="w-4 h-4 text-rose-600" />;
      case 'provider_approval':
        return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
      case 'review_response':
      case 'review_reminder':
        return <MessageSquare className="w-4 h-4 text-blue-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Bell className="w-6 h-6 text-[#D9531E]" />
            <span>Platform Notifications</span>
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Real-time updates on your reservations, host confirmations, trip reminders, and cultural advisories.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPrefsOpen(true)}
            leftIcon={<SlidersHorizontal className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            Preferences
          </Button>

          {notifications.some((n) => !n.isRead) && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              leftIcon={<Check className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Mark all read
            </Button>
          )}

          {notifications.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              leftIcon={<Trash2 className="w-3.5 h-3.5 text-stone-400" />}
              className="text-xs text-stone-500 hover:text-red-600"
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
        {[
          { id: 'all', label: 'All Alerts' },
          { id: 'bookings', label: 'Bookings' },
          { id: 'trips', label: 'Trip Reminders' },
          { id: 'events', label: 'Events' },
          { id: 'recommendations', label: 'Discoveries' },
          { id: 'system', label: 'System' },
        ].map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id as NotificationCategory)}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
              activeCategory === cat.id
                ? 'bg-[#D9531E] text-white shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* List */}
      {notifications.length === 0 ? (
        <div className="text-center py-16 p-8 rounded-3xl bg-stone-50 dark:bg-stone-900 border border-dashed border-stone-200 dark:border-stone-800 space-y-2 text-xs text-stone-400">
          <Bell className="w-10 h-10 mx-auto text-stone-300 dark:text-stone-700" />
          <p className="font-bold text-stone-700 dark:text-stone-300">All caught up!</p>
          <p>No notifications in the {activeCategory === 'all' ? 'inbox' : activeCategory} category.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 text-xs ${
                n.isRead
                  ? 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 opacity-85'
                  : 'bg-[#D9531E]/5 dark:bg-[#D9531E]/10 border-[#D9531E]/30'
              }`}
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-white dark:bg-stone-800 shadow-sm border border-stone-200 dark:border-stone-700 flex items-center justify-center shrink-0 mt-0.5">
                  {getIcon(n.type)}
                </div>

                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-stone-100 dark:bg-stone-800 text-stone-500">
                      {n.category || NotificationService.inferCategory(n.type)}
                    </span>
                    <h4 className="font-bold text-stone-900 dark:text-stone-100">{n.title}</h4>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-[#D9531E] shrink-0" />
                    )}
                  </div>
                  <p className="text-stone-600 dark:text-stone-300 leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-stone-400 block">{n.timestamp}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {!n.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(n.id)}
                    title="Mark read"
                    className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  onClick={() => handleDelete(n.id)}
                  title="Delete alert"
                  className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                {n.actionTab && onNavigateTab && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleMarkAsRead(n.id);
                      onNavigateTab(n.actionTab!, n.actionId);
                    }}
                    rightIcon={<ArrowRight className="w-3 h-3" />}
                    className="text-[11px] py-1 px-2.5 ml-1"
                  >
                    View
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Notification Preferences Modal */}
      {isPrefsOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-5">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-[#D9531E]" />
                <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
                  Notification Preferences
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPrefsOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-500">
              Control the notification channels and reminder alerts you receive across Bharat Yatra.
            </p>

            <div className="space-y-3 text-xs">
              {[
                {
                  key: 'bookingUpdates',
                  label: 'Booking Status & Confirmations',
                  desc: 'Vouchers, cancellations, and host confirmations',
                },
                {
                  key: 'tripReminders',
                  label: 'Trip Departure Reminders',
                  desc: 'Reminders 48h and 24h prior to planned itineraries',
                },
                {
                  key: 'eventAlerts',
                  label: 'Festival & Seasonal Alerts',
                  desc: 'Upcoming local melas, darshan timings, and dance festivals',
                },
                {
                  key: 'recommendations',
                  label: 'AI Recommendation Updates',
                  desc: 'Personalized offbeat gems matched to your profile',
                },
                {
                  key: 'marketingEmails',
                  label: 'Curated Tourism Bulletins',
                  desc: 'State tourism highlights and heritage conservation news',
                },
                {
                  key: 'inAppAlerts',
                  label: 'In-App Banner Notifications',
                  desc: 'Show real-time toast banners while using the platform',
                },
              ].map((item) => {
                const k = item.key as keyof NotificationPreferences;
                const isEnabled = prefs[k];
                return (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-3 rounded-2xl border border-stone-200 dark:border-stone-800"
                  >
                    <div>
                      <div className="font-bold text-stone-900 dark:text-stone-100">{item.label}</div>
                      <div className="text-[11px] text-stone-500">{item.desc}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSavePref(k, !isEnabled)}
                      className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                        isEnabled ? 'bg-[#D9531E]' : 'bg-stone-300 dark:bg-stone-700'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          isEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsPrefsOpen(false)}
                className="w-full sm:w-auto"
              >
                Save Preferences
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

