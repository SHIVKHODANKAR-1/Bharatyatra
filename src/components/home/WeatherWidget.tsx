import React, { useEffect, useState } from 'react';
import { CloudSun, Droplets, Wind, RefreshCw, AlertCircle, Sparkles, MapPin } from 'lucide-react';
import { WeatherSnapshot } from '../../types/travel';
import { fetchLiveWeather } from '../../services/weatherService';
import { Badge } from '../common/Badge';
import { WeatherSkeleton } from '../common/Skeleton';
import { useOnboarding } from '../../context/OnboardingContext';
import { useI18n } from '../../i18n/index';

export const WeatherWidget: React.FC = () => {
  const { preferences } = useOnboarding();
  const { t } = useI18n();

  const [weather, setWeather] = useState<WeatherSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadWeather = async () => {
    setIsLoading(true);
    const data = await fetchLiveWeather(
      preferences.selectedCity,
      preferences.latitude,
      preferences.longitude
    );
    setWeather(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadWeather();
  }, [preferences.selectedCity, preferences.latitude, preferences.longitude]);

  if (isLoading) {
    return <WeatherSkeleton />;
  }

  if (!weather || weather.isFallback) {
    return (
      <div className="rounded-2xl border border-stone-200 dark:border-stone-800 p-5 bg-white dark:bg-stone-900 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-400">
            <CloudSun className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-stone-800 dark:text-stone-200">
                {preferences.selectedCity} Weather
              </span>
              <Badge classification={weather?.dataClassification || 'UNAVAILABLE' as any} />
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              {t.weather.unavailableNotice}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={loadWeather}
          className="p-2 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          title="Retry live weather fetch"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-stone-200/80 dark:border-stone-800 p-5 bg-gradient-to-br from-white to-stone-50/50 dark:from-stone-900 dark:to-stone-900/80 shadow-xs transition-colors">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
        <div className="flex items-center gap-1.5 min-w-0">
          <MapPin className="w-3.5 h-3.5 text-[#D9531E] shrink-0" />
          <span className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
            Live Weather in {weather.city}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge classification={weather.dataClassification} />
          <button
            type="button"
            onClick={loadWeather}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
            title="Refresh current meteorological observation"
            aria-label="Refresh weather"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="text-3xl sm:text-4xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight shrink-0">
            {weather.temperatureC}°C
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-stone-800 dark:text-stone-200 truncate">
              {weather.condition}
            </div>
            <div className="text-xs text-stone-500 dark:text-stone-400 leading-snug">
              {weather.forecastSummary}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-stone-600 dark:text-stone-400 shrink-0">
          <div className="flex items-center gap-1.5">
            <Droplets className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span>Humidity: {weather.humidityPercent}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Wind className="w-3.5 h-3.5 text-teal-500 shrink-0" />
            <span>Wind: {weather.windSpeedKmh} km/h</span>
          </div>
        </div>
      </div>

      {/* Smart Travel Tip according to Weather */}
      <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
        <Sparkles className="w-4 h-4 text-[#D9531E] shrink-0 mt-0.5" />
        <div className="min-w-0">
          <span className="font-bold mr-1">Activity Recommendation ({weather.outdoorSuitability}):</span>
          <span>{weather.tip}</span>
        </div>
      </div>
    </div>
  );
};
