import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { I18nProvider } from './i18n/index';
import { AnalyticsProvider } from './context/AnalyticsContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OnboardingProvider, useOnboarding } from './context/OnboardingContext';

import { Header } from './components/navigation/Header';
import { MobileNav } from './components/navigation/MobileNav';
import { OfflineBanner } from './components/common/OfflineBanner';
import { SplashScreen } from './components/auth/SplashScreen';

import { HomeDashboard } from './components/home/HomeDashboard';
import { ExploreView } from './components/explore/ExploreView';
import { TripPlannerView } from './components/planner/TripPlannerView';
import { AiAssistantView } from './components/assistant/AiAssistantView';
import { SavedPlacesView } from './components/saved/SavedPlacesView';
import { ProfileView } from './components/profile/ProfileView';
import { MyBookingsView } from './components/booking/MyBookingsView';
import { ProviderHubView } from './components/provider/ProviderHubView';
import { AdminPortalView } from './components/admin/AdminPortalView';
import { NotificationsView } from './components/notifications/NotificationsView';

import { OnboardingWizard } from './components/onboarding/OnboardingWizard';
import { WhyThisPickedDrawer } from './components/cards/WhyThisPickedDrawer';
import { DestinationDetailView } from './components/discovery/DestinationDetailView';
import { TestSuiteModal } from './components/common/TestSuiteModal';

import { LoginModal } from './components/auth/LoginModal';
import { SignupModal } from './components/auth/SignupModal';
import { OtpModal } from './components/auth/OtpModal';
import { ForgotPasswordModal } from './components/auth/ForgotPasswordModal';

import { Destination, RecommendationItem } from './types/travel';
import { INITIAL_DESTINATIONS } from './data/destinations';
import { INITIAL_HIDDEN_GEMS } from './data/hiddenGems';

const SAVED_STORAGE_KEY = 'bharat_yatra_saved_items';

const AppContent: React.FC = () => {
  const { authModalType, openAuthModal, closeAuthModal } = useAuth();
  const { preferences, isOnboardingOpen, openOnboarding } = useOnboarding();

  const [currentTab, setCurrentTab] = useState<string>('home');
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [isTestSuiteOpen, setIsTestSuiteOpen] = useState<boolean>(false);

  // Active modals and sheets
  const [activeDestination, setActiveDestination] = useState<Destination | null>(null);
  const [explainingItem, setExplainingItem] = useState<RecommendationItem | null>(null);
  const [activeTripDestination, setActiveTripDestination] = useState<string>('Varanasi');

  // Saved items state
  const [savedItemIds, setSavedItemIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(SAVED_STORAGE_KEY);
      if (saved) return new Set(JSON.parse(saved));
    } catch {
      // fallback
    }
    return new Set(['dest_varanasi_ghats', 'dest_spiti_valley']);
  });

  useEffect(() => {
    try {
      localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(Array.from(savedItemIds)));
    } catch {
      // ignore
    }
  }, [savedItemIds]);

  const handleToggleSave = (id: string) => {
    setSavedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handlePlanTrip = (item: RecommendationItem) => {
    setActiveTripDestination(item.title);
    setCurrentTab('trips');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Convert saved IDs to RecommendationItems for the Saved Places view
  const savedRecommendationItems: RecommendationItem[] = Array.from(savedItemIds).map((id) => {
    const dest =
      INITIAL_DESTINATIONS.find((d) => d.id === id) ||
      INITIAL_HIDDEN_GEMS.find((g) => g.id === id);

    if (dest) {
      return {
        id: dest.id,
        type: 'destination',
        title: dest.name,
        subtitle: dest.tagline,
        imageUrl: dest.imageUrl,
        category: dest.category,
        location: dest.location,
        estimatedBudget: dest.estimatedBudget,
        idealDuration: `${dest.idealDurationDays} Days`,
        dataClassification: dest.dataClassification,
        source: dest.source,
        matchScore: 90,
        explanation: {
          overallMatchScore: 90,
          matchedInterests: [dest.category],
          matchedBudget: `Compatible with ${dest.estimatedBudget}`,
          matchedPace: 'Balanced',
          matchedParty: 'All travelers',
          reasonText: `Saved in your personal travel collection.`,
          criteriaBreakdown: { interestWeight: 40, budgetWeight: 25, distanceWeight: 15, seasonalityWeight: 20 },
        },
        isSaved: true,
        isNotInterested: false,
      };
    }

    return {
      id,
      type: 'destination',
      title: 'Curated Heritage Site',
      subtitle: 'Verified Indian Travel Destination',
      imageUrl: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80',
      category: 'heritage',
      location: { city: 'Nagpur', state: 'Maharashtra', latitude: 21.1458, longitude: 79.0882 },
      estimatedBudget: 'moderate',
      idealDuration: '2 Days',
      dataClassification: 'VERIFIED' as any,
      source: { sourceName: 'Bharat Yatra Archives', lastUpdated: '2026-08-01' },
      matchScore: 85,
      explanation: {
        overallMatchScore: 85,
        matchedInterests: ['heritage'],
        matchedBudget: 'Moderate',
        matchedPace: 'Balanced',
        matchedParty: 'Solo',
        reasonText: 'Saved place',
        criteriaBreakdown: { interestWeight: 40, budgetWeight: 25, distanceWeight: 15, seasonalityWeight: 20 },
      },
      isSaved: true,
      isNotInterested: false,
    };
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] dark:bg-[#121211] text-stone-900 dark:text-stone-100 font-sans selection:bg-[#D9531E]/20 transition-colors">
      {/* Splash Screen */}
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} durationMs={1200} />}

      {/* Offline Status Notification */}
      <OfflineBanner />

      {/* Navigation Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenTestSuite={() => setIsTestSuiteOpen(true)}
      />

      {/* Main Content View Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 md:pb-12">
        {currentTab === 'home' && (
          <HomeDashboard
            onSelectDestination={(dest) => setActiveDestination(dest)}
            onExplain={(item) => setExplainingItem(item)}
            onPlanTrip={handlePlanTrip}
            savedItemIds={savedItemIds}
            onToggleSave={handleToggleSave}
            onViewAllExplore={() => setCurrentTab('explore')}
          />
        )}

        {currentTab === 'explore' && (
          <ExploreView
            onSelectDestination={(dest) => setActiveDestination(dest)}
            onExplain={(item) => setExplainingItem(item)}
            onPlanTrip={handlePlanTrip}
            savedItemIds={savedItemIds}
            onToggleSave={handleToggleSave}
          />
        )}

        {currentTab === 'trips' && (
          <TripPlannerView
            initialDestinationName={activeTripDestination}
            onExploreMore={() => setCurrentTab('explore')}
          />
        )}

        {currentTab === 'assistant' && (
          <AiAssistantView
            onSelectDestination={(dest) => setActiveDestination(dest)}
            savedItemIds={savedItemIds}
            onToggleSave={handleToggleSave}
            onExploreSimilar={() => setCurrentTab('explore')}
          />
        )}

        {currentTab === 'saved' && (
          <SavedPlacesView
            savedItems={savedRecommendationItems}
            onRemove={handleToggleSave}
            onSelect={(item) => {
              const dest =
                INITIAL_DESTINATIONS.find((d) => d.id === item.id) ||
                INITIAL_HIDDEN_GEMS.find((g) => g.id === item.id);
              if (dest) setActiveDestination(dest);
            }}
            onExploreMore={() => setCurrentTab('explore')}
          />
        )}

        {currentTab === 'profile' && <ProfileView />}

        {currentTab === 'bookings' && (
          <MyBookingsView
            onExploreMore={() => {
              setCurrentTab('explore');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentTab === 'provider' && <ProviderHubView />}

        {currentTab === 'admin' && <AdminPortalView />}

        {currentTab === 'notifications' && <NotificationsView />}
      </main>

      {/* Mobile Bottom Navigation (Visible on mobile screens) */}
      <MobileNav
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Onboarding Survey Wizard */}
      <OnboardingWizard />

      {/* Why This Was Picked For You Explainability Drawer */}
      <WhyThisPickedDrawer
        isOpen={explainingItem !== null}
        onClose={() => setExplainingItem(null)}
        item={explainingItem}
      />

      {/* Destination Detailed View Modal (Part 2B - 10 sections) */}
      <DestinationDetailView
        destination={activeDestination}
        isOpen={activeDestination !== null}
        onClose={() => setActiveDestination(null)}
        isSaved={activeDestination ? savedItemIds.has(activeDestination.id) : false}
        onToggleSave={handleToggleSave}
        onAddToTrip={(dest) => handlePlanTrip({
          id: dest.id,
          type: 'destination',
          title: dest.name,
          subtitle: dest.tagline,
          imageUrl: dest.imageUrl,
          category: dest.category,
          location: dest.location,
          estimatedBudget: dest.estimatedBudget,
          idealDuration: `${dest.idealDurationDays} Days`,
          dataClassification: dest.dataClassification,
          source: dest.source,
          matchScore: 90,
          explanation: {
            overallMatchScore: 90,
            matchedInterests: [dest.category],
            matchedBudget: `Compatible with ${dest.estimatedBudget}`,
            matchedPace: 'Balanced',
            matchedParty: 'All travelers',
            reasonText: dest.tagline,
            criteriaBreakdown: { interestWeight: 40, budgetWeight: 25, distanceWeight: 15, seasonalityWeight: 20 },
          },
          isSaved: savedItemIds.has(dest.id),
          isNotInterested: false,
        })}
        onSelectDestination={(dest) => setActiveDestination(dest)}
      />

      {/* Automated QA Test Suite Modal */}
      <TestSuiteModal
        isOpen={isTestSuiteOpen}
        onClose={() => setIsTestSuiteOpen(false)}
      />

      {/* Authentication Modals */}
      <LoginModal
        isOpen={authModalType === 'login'}
        onClose={closeAuthModal}
        onSwitchToSignup={() => openAuthModal('signup')}
        onSwitchToForgot={() => openAuthModal('forgot')}
      />

      <SignupModal
        isOpen={authModalType === 'signup'}
        onClose={closeAuthModal}
        onSwitchToLogin={() => openAuthModal('login')}
      />

      <OtpModal
        isOpen={authModalType === 'otp'}
        onClose={closeAuthModal}
      />

      <ForgotPasswordModal
        isOpen={authModalType === 'forgot' || authModalType === 'reset'}
        onClose={closeAuthModal}
        onSwitchToLogin={() => openAuthModal('login')}
      />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AnalyticsProvider>
          <AuthProvider>
            <OnboardingProvider>
              <AppContent />
            </OnboardingProvider>
          </AuthProvider>
        </AnalyticsProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
