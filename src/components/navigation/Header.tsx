import React, { useState, useEffect } from 'react';
import {
  MapPin, Globe, Moon, Sun, Bell, User as UserIcon, Compass, Sparkles, LogOut,
  ChevronDown, Check, Search, Ticket, Building2, Shield, Menu, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useOnboarding } from '../../context/OnboardingContext';
import { useTheme } from '../../context/ThemeContext';
import { useI18n } from '../../i18n/index';
import { LanguageCode } from '../../types/auth';
import { UserRole } from '../../types/index';
import { NotificationService } from '../../services/notificationService';
import { LocationModal } from './LocationModal';

interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenTestSuite?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, onSelectTab, onOpenTestSuite }) => {
  const { currentUser, userRole, isAuthenticated, logout, openAuthModal } = useAuth();
  const { preferences } = useOnboarding();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useI18n();

  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    const userId = currentUser?.id || currentUser?.uid || 'usr_demo_traveler';
    const count = NotificationService.getUnreadCount(
      userId,
      userRole
    );
    setUnreadNotifications(count);
  }, [currentUser, userRole, currentTab]);

  const languages: { code: LanguageCode; label: string; native: string }[] = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
    { code: 'mr', label: 'Marathi', native: 'मराठी' },
  ];

  const isAdminRole =
    userRole === UserRole.ADMIN ||
    userRole === UserRole.SUPER_ADMIN ||
    userRole === UserRole.MODERATOR ||
    userRole === UserRole.SUPPORT_AGENT;

  const navItems = [
    { id: 'home', label: t.nav.home },
    { id: 'explore', label: t.nav.explore },
    { id: 'trips', label: t.nav.trips },
    { id: 'assistant', label: t.nav.assistant, isAi: true },
    { id: 'bookings', label: 'Bookings', icon: Ticket },
    { id: 'provider', label: 'Host Portal', icon: Building2 },
    ...(isAdminRole ? [{ id: 'admin', label: 'Admin Desk', icon: Shield }] : []),
  ];

  const handleNavClick = (tabId: string) => {
    onSelectTab(tabId);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full h-16 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800 transition-colors">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand Logo & Location */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => onSelectTab('home')}
              className="flex items-center gap-2 text-left group focus-visible:outline-none shrink-0"
              aria-label="Bharat Yatra Home"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#D9531E] to-[#B45309] text-white flex items-center justify-center font-bold text-lg shadow-xs group-hover:scale-105 transition-transform shrink-0">
                <Compass className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="flex flex-col justify-center">
                <div className="font-black text-base sm:text-lg text-stone-900 dark:text-stone-100 tracking-tight leading-none flex items-center gap-1">
                  <span>{t.brand.name}</span>
                  <span className="hidden xs:inline-block text-[9px] px-1.5 py-0.2 rounded-full bg-[#D9531E]/10 text-[#D9531E] font-bold">
                    INDIA
                  </span>
                </div>
                <div className="hidden sm:block text-[10px] text-stone-500 dark:text-stone-400 font-medium leading-tight">
                  {t.brand.tagline}
                </div>
              </div>
            </button>

            {/* Location Selector */}
            <button
              type="button"
              onClick={() => setIsLocationOpen(true)}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200/70 dark:hover:bg-stone-700/70 text-xs font-medium text-stone-700 dark:text-stone-300 transition-colors shrink-0"
              title="Click to change your travel origin city"
            >
              <MapPin className="w-3.5 h-3.5 text-[#D9531E] shrink-0" />
              <span className="truncate max-w-[70px] xs:max-w-[100px] sm:max-w-[130px]">
                {preferences.selectedCity || 'Select City'}
              </span>
              <ChevronDown className="w-3 h-3 text-stone-400 shrink-0" />
            </button>
          </div>

          {/* Desktop Navigation Links (Only visible on wide desktop >= 1024px) */}
          <nav className="hidden xl:flex items-center gap-1 shrink-0">
            {navItems.map((item: any) => (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  currentTab === item.id
                    ? 'bg-[#D9531E]/10 text-[#D9531E] font-semibold dark:bg-[#D9531E]/20'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                {item.isAi && <Sparkles className="w-3.5 h-3.5 text-[#D9531E] shrink-0" />}
                {item.icon && <item.icon className="w-3.5 h-3.5 text-[#D9531E] shrink-0" />}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Quick Search Shortcut */}
            <button
              type="button"
              onClick={() => onSelectTab('explore')}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-[#D9531E]/10 hover:text-[#D9531E] transition-colors shrink-0"
              title="Global Search across India"
            >
              <Search className="w-3.5 h-3.5 text-[#D9531E] shrink-0" />
              <span className="hidden md:inline">Search</span>
            </button>

            {/* QA Test Runner Launcher */}
            {onOpenTestSuite && (
              <button
                onClick={onOpenTestSuite}
                className="hidden 2xl:flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0"
                title="Run integrated system test verification"
              >
                <span>QA Tests</span>
              </button>
            )}

            {/* Language Switcher */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors flex items-center gap-0.5 shrink-0"
                aria-label="Select Language"
              >
                <Globe className="w-4 h-4 shrink-0" />
                <span className="text-[11px] font-bold uppercase ml-0.5">{language}</span>
              </button>

              {isLangMenuOpen && (
                <div className="absolute right-0 mt-2 w-36 rounded-xl bg-white dark:bg-stone-900 shadow-xl border border-stone-200 dark:border-stone-800 py-1.5 z-50 animate-in fade-in zoom-in-95">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLanguage(l.code);
                        setIsLangMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3.5 py-2 text-xs text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                    >
                      <div className="text-left">
                        <div className="font-semibold">{l.native}</div>
                        <div className="text-[10px] text-stone-400">{l.label}</div>
                      </div>
                      {language === l.code && <Check className="w-3.5 h-3.5 text-[#D9531E] shrink-0" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dark / Light Mode Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors shrink-0"
              aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notifications */}
            <button
              type="button"
              onClick={() => onSelectTab('notifications')}
              className="relative p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors shrink-0"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifications > 0 && (
                <span className="absolute top-1 right-1 px-1.5 py-0.2 rounded-full bg-[#D9531E] text-white text-[9px] font-black leading-tight">
                  {unreadNotifications}
                </span>
              )}
            </button>

            {/* Profile Avatar / Menu */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center p-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                aria-label="User Profile Menu"
              >
                <div className="w-8 h-8 rounded-full bg-[#D9531E]/20 text-[#D9531E] font-bold text-xs flex items-center justify-center border border-[#D9531E]/30 shrink-0">
                  {currentUser?.fullName?.charAt(0) || 'U'}
                </div>
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white dark:bg-stone-900 shadow-xl border border-stone-200 dark:border-stone-800 py-2 z-50 animate-in fade-in zoom-in-95 text-xs">
                  <div className="px-4 py-2.5 border-b border-stone-100 dark:border-stone-800">
                    <p className="font-bold text-stone-900 dark:text-stone-100 truncate">
                      {currentUser?.fullName || 'Indian Explorer'}
                    </p>
                    <p className="text-[11px] text-stone-500 truncate">
                      {currentUser?.email || currentUser?.phone || 'traveler@bharat.in'}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold">
                        Role: {userRole}
                      </span>
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onSelectTab('bookings');
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center gap-2 text-stone-700 dark:text-stone-300"
                    >
                      <Ticket className="w-3.5 h-3.5 text-[#D9531E]" />
                      <span>My Bookings & Vouchers</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onSelectTab('provider');
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center gap-2 text-stone-700 dark:text-stone-300"
                    >
                      <Building2 className="w-3.5 h-3.5 text-[#D9531E]" />
                      <span>Host & Provider Hub</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onSelectTab('admin');
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center gap-2 text-stone-700 dark:text-stone-300"
                    >
                      <Shield className="w-3.5 h-3.5 text-[#D9531E]" />
                      <span>Tourism Admin Desk</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onSelectTab('profile');
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center gap-2 text-stone-700 dark:text-stone-300"
                    >
                      <UserIcon className="w-3.5 h-3.5" />
                      <span>Profile & Role Settings</span>
                    </button>
                  </div>

                  <div className="border-t border-stone-100 dark:border-stone-800 pt-1">
                    {isAuthenticated ? (
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Log Out</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          openAuthModal('login');
                        }}
                        className="w-full text-left px-4 py-2 text-[#D9531E] hover:bg-[#D9531E]/10 font-bold"
                      >
                        Sign In / Register
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile / Tablet Menu Button (Visible below xl breakpoint) */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="xl:hidden p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors shrink-0"
              aria-label="Open Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Collapsible Mobile / Tablet Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="xl:hidden border-t border-stone-200 dark:border-stone-800 bg-white/98 dark:bg-stone-900/98 backdrop-blur-xl shadow-xl px-4 py-4 space-y-2 animate-in slide-in-from-top-2">
            <div className="grid grid-cols-2 gap-2">
              {navItems.map((item: any) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
                    currentTab === item.id
                      ? 'bg-[#D9531E] text-white shadow-xs'
                      : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700'
                  }`}
                >
                  {item.isAi && <Sparkles className="w-4 h-4 shrink-0" />}
                  {item.icon && <item.icon className="w-4 h-4 shrink-0" />}
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </div>

            {onOpenTestSuite && (
              <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenTestSuite();
                  }}
                  className="w-full py-2 px-3 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-center gap-1.5"
                >
                  <span>Launch System QA Tests</span>
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      <LocationModal isOpen={isLocationOpen} onClose={() => setIsLocationOpen(false)} />
    </>
  );
};
