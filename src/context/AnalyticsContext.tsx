import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AnalyticsService, AnalyticsRecord, PlatformEventType } from '../services/analyticsService';

export type AnalyticsEventType = PlatformEventType;
export type AnalyticsEvent = AnalyticsRecord;

interface AnalyticsContextType {
  trackEvent: (type: AnalyticsEventType | string, payload?: Record<string, unknown>) => void;
  recentEvents: AnalyticsEvent[];
  clearEvents: () => void;
  isOptedOut: boolean;
  setOptOut: (optOut: boolean) => void;
  exportAnalytics: () => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [recentEvents, setRecentEvents] = useState<AnalyticsEvent[]>(() => AnalyticsService.getEvents().slice(0, 50));
  const [isOptedOut, setIsOptedOutState] = useState<boolean>(() => AnalyticsService.isOptedOut());

  const setOptOut = useCallback((val: boolean) => {
    AnalyticsService.setOptOut(val);
    setIsOptedOutState(val);
  }, []);

  const trackEvent = useCallback((type: AnalyticsEventType | string, payload?: Record<string, unknown>) => {
    const record = AnalyticsService.track(type, payload);
    if (record) {
      setRecentEvents((prev) => [record, ...prev].slice(0, 50));
    }
  }, []);

  const clearEvents = useCallback(() => {
    AnalyticsService.clear();
    setRecentEvents([]);
  }, []);

  const exportAnalytics = useCallback(() => {
    const dataStr = AnalyticsService.exportJSON();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bharat_yatra_analytics_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, []);

  useEffect(() => {
    trackEvent('app_opened', { platform: 'web', version: '1.0.0' });
  }, [trackEvent]);

  return (
    <AnalyticsContext.Provider
      value={{
        trackEvent,
        recentEvents,
        clearEvents,
        isOptedOut,
        setOptOut,
        exportAnalytics,
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = (): AnalyticsContextType => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

