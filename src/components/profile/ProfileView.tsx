import React, { useState } from 'react';
import {
  User,
  Shield,
  RotateCcw,
  Sparkles,
  Sliders,
  Check,
  Globe,
  MapPin,
  LogOut,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useOnboarding } from '../../context/OnboardingContext';
import { useI18n } from '../../i18n/index';
import { UserRole } from '../../types/index';
import { Button } from '../common/Button';
import { TravelInterest, BudgetTier, TravelParty, TravelPace } from '../../types/auth';

export const ProfileView: React.FC = () => {
  const { currentUser, userRole, switchRoleForDemo, logout, isAuthenticated } = useAuth();
  const {
    preferences,
    updatePreferences,
    openOnboarding,
    resetPersonalization,
    undoReset,
    canUndoReset,
  } = useOnboarding();
  const { t, language, setLanguage } = useI18n();

  const [savedSuccess, setSavedSuccess] = useState(false);

  const roles: { role: UserRole; label: string; desc: string }[] = [
    { role: UserRole.TRAVELER, label: 'Traveler', desc: 'Standard explorer discovering India' },
    { role: UserRole.PROVIDER, label: 'Experience Host / Provider', desc: 'Can list heritage walks, homestays and tours' },
    { role: UserRole.ADMIN, label: 'Regional Tourism Admin', desc: 'Can verify listings and review editorial facts' },
    { role: UserRole.SUPER_ADMIN, label: 'Super Admin', desc: 'Full administrative access and system telemetry' },
  ];

  const handleInterestToggle = (interest: TravelInterest) => {
    const current = preferences.interests;
    const next = current.includes(interest)
      ? current.filter((i) => i !== interest)
      : [...current, interest];
    updatePreferences({ interests: next });
    showSavedNotification();
  };

  const showSavedNotification = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const allInterests: { id: TravelInterest; label: string }[] = [
    { id: 'heritage', label: 'Heritage & Forts' },
    { id: 'nature', label: 'Nature & Forests' },
    { id: 'spiritual', label: 'Spiritual & Temples' },
    { id: 'food', label: 'Culinary & Street Food' },
    { id: 'mountains', label: 'Himalayas & Hills' },
    { id: 'beaches', label: 'Coastal & Beaches' },
    { id: 'wildlife', label: 'Wildlife & Safaris' },
    { id: 'adventure', label: 'Trekking & Rafting' },
    { id: 'culture', label: 'Tribal Arts & Crafts' },
    { id: 'festivals', label: 'Festivals & Melas' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Top Profile Header */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#D9531E] to-[#B45309] text-white flex items-center justify-center font-extrabold text-2xl shadow-sm">
            {currentUser?.fullName?.charAt(0) || 'B'}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100">
              {currentUser?.fullName || 'Indian Explorer'}
            </h1>
            <p className="text-xs sm:text-sm text-stone-500">
              {currentUser?.email || currentUser?.phone || 'Guest Traveler Profile'}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold">
                Role: {userRole}
              </span>
              <span className="text-[11px] text-stone-400">
                • Origin: {preferences.selectedCity}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              leftIcon={<LogOut className="w-4 h-4" />}
            >
              Sign Out
            </Button>
          ) : (
            <Button variant="primary" size="sm" onClick={() => openOnboarding(1)}>
              Redo Survey
            </Button>
          )}
        </div>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-600 text-white text-xs font-semibold py-2 px-4 rounded-xl text-center flex items-center justify-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4" />
          <span>Personalization preferences updated instantly.</span>
        </div>
      )}

      {/* Role Switcher (Mandated by Section 10 & 16) */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 space-y-4 shadow-xs">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#D9531E]" />
          <div>
            <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
              Role-Based Access Control (Demo Sandbox)
            </h2>
            <p className="text-xs text-stone-500">
              Switch roles to inspect traveler, local provider, and admin verification capabilities.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {roles.map((r) => {
            const isCurrent = userRole === r.role;
            return (
              <button
                key={r.role}
                type="button"
                onClick={() => switchRoleForDemo(r.role)}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  isCurrent
                    ? 'border-[#D9531E] bg-[#D9531E]/5 text-[#D9531E] ring-1 ring-[#D9531E]'
                    : 'border-stone-200 dark:border-stone-800 hover:border-stone-400 text-stone-700 dark:text-stone-300'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold">{r.label}</span>
                  {isCurrent && <Check className="w-4 h-4 text-[#D9531E]" />}
                </div>
                <div className="text-[11px] text-stone-500 mt-0.5">{r.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Personalization Tuning Controls */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 space-y-6 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#D9531E]" />
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Personalized Algorithm Tuning
              </h2>
              <p className="text-xs text-stone-500">
                Adjust the weighted criteria powering your discovery feed and trip plans.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetPersonalization}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              className="text-xs text-stone-600 hover:text-red-600"
            >
              Reset
            </Button>
            {canUndoReset && (
              <Button
                variant="ghost"
                size="sm"
                onClick={undoReset}
                className="text-xs text-[#D9531E]"
              >
                Undo
              </Button>
            )}
          </div>
        </div>

        {/* Travel Interests Chips */}
        <div className="space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-stone-500">
            Active Travel Interests (Select all that apply)
          </div>
          <div className="flex flex-wrap gap-2">
            {allInterests.map((item) => {
              const isSelected = preferences.interests.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleInterestToggle(item.id)}
                  className={`text-xs px-3 py-1.5 rounded-full font-semibold border transition-all ${
                    isSelected
                      ? 'bg-[#D9531E] border-[#D9531E] text-white shadow-xs'
                      : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-stone-400'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Budget Preference */}
        <div className="space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-stone-500">
            Budget Tier
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(['budget', 'moderate', 'premium', 'luxury'] as BudgetTier[]).map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => {
                  updatePreferences({ budget: b });
                  showSavedNotification();
                }}
                className={`p-2.5 rounded-xl border text-center capitalize text-xs font-bold transition-all ${
                  preferences.budget === b
                    ? 'border-[#D9531E] bg-[#D9531E]/10 text-[#D9531E]'
                    : 'border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* Travel Pace */}
        <div className="space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-stone-500">
            Travel Pace
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(['relaxed', 'balanced', 'packed'] as TravelPace[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  updatePreferences({ pace: p });
                  showSavedNotification();
                }}
                className={`p-2.5 rounded-xl border text-center capitalize text-xs font-bold transition-all ${
                  preferences.pace === p
                    ? 'border-[#D9531E] bg-[#D9531E]/10 text-[#D9531E]'
                    : 'border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Travel Party */}
        <div className="space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-stone-500">
            Travel Party
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {(['solo', 'couple', 'family', 'friends', 'group', 'business'] as TravelParty[]).map(
              (pty) => (
                <button
                  key={pty}
                  type="button"
                  onClick={() => {
                    updatePreferences({ party: pty });
                    showSavedNotification();
                  }}
                  className={`p-2 rounded-xl border text-center capitalize text-xs font-bold transition-all ${
                    preferences.party === pty
                      ? 'border-[#D9531E] bg-[#D9531E]/10 text-[#D9531E]'
                      : 'border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  {pty}
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
