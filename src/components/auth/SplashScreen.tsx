import React, { useEffect, useState } from 'react';
import { Compass } from 'lucide-react';
import { useI18n } from '../../i18n/index';

interface SplashScreenProps {
  onComplete: () => void;
  durationMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete, durationMs = 1500 }) => {
  const { t } = useI18n();
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFadingOut(true);
    }, durationMs - 400);

    const endTimer = setTimeout(() => {
      onComplete();
    }, durationMs);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(endTimer);
    };
  }, [durationMs, onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FBF9F5] dark:bg-[#141413] transition-opacity duration-300 ${
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      role="status"
      aria-label="Loading Bharat Yatra"
    >
      <div className="flex flex-col items-center text-center p-6 space-y-4 max-w-sm">
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#D9531E] via-[#B45309] to-[#166534] flex items-center justify-center text-white shadow-xl shadow-[#D9531E]/20 animate-pulse">
            <Compass className="w-10 h-10 animate-spin" style={{ animationDuration: '4s' }} />
          </div>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-black tracking-tight text-stone-900 dark:text-stone-100">
            {t.brand.name}
          </h1>
          <p className="text-xs font-semibold text-[#D9531E] uppercase tracking-wider">
            {t.brand.tagline}
          </p>
        </div>

        <div className="w-28 h-1 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden mt-4">
          <div className="h-full bg-[#D9531E] rounded-full animate-pulse w-3/4" />
        </div>

        <p className="text-[11px] text-stone-400 dark:text-stone-500 pt-2">
          Personalized Indian Travel Discovery
        </p>
      </div>
    </div>
  );
};
