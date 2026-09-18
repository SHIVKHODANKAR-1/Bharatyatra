import React, { useState, useEffect } from 'react';
import { WifiOff, CheckCircle2 } from 'lucide-react';
import { useI18n } from '../../i18n/index';

export const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showReconnected, setShowReconnected] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 3000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline && !showReconnected) return null;

  if (showReconnected) {
    return (
      <div className="bg-emerald-600 text-white text-xs font-medium py-2 px-4 text-center flex items-center justify-center gap-2 transition-all">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>Connected back to Bharat Yatra live services.</span>
      </div>
    );
  }

  return (
    <div className="bg-amber-700 text-white text-xs font-medium py-2 px-4 text-center flex items-center justify-center gap-2">
      <WifiOff className="w-3.5 h-3.5 shrink-0" />
      <span>{t.common.offline}</span>
    </div>
  );
};
