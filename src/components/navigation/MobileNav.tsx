import React from 'react';
import { Home, Compass, Map, Sparkles, User } from 'lucide-react';
import { useI18n } from '../../i18n/index';

interface MobileNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentTab, onSelectTab }) => {
  const { t } = useI18n();

  const tabs = [
    { id: 'home', label: t.nav.home, icon: Home },
    { id: 'explore', label: t.nav.explore, icon: Compass },
    { id: 'trips', label: t.nav.trips, icon: Map },
    { id: 'assistant', label: t.nav.assistant, icon: Sparkles, isAi: true },
    { id: 'profile', label: t.nav.profile, icon: User },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-t border-stone-200 dark:border-stone-800 pb-safe transition-colors shadow-lg"
      aria-label="Mobile Bottom Navigation"
    >
      <div className="grid grid-cols-5 h-16 max-w-md mx-auto items-center px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 h-full rounded-xl transition-all duration-150 active:scale-95 ${
                isActive
                  ? 'text-[#D9531E] font-bold'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.4px]' : 'stroke-[1.8px]'}`} />
                {tab.isAi && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#D9531E] animate-pulse" />
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight leading-none truncate max-w-[58px]">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
