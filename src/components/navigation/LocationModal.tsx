import React, { useState } from 'react';
import { MapPin, Navigation, Check, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { MAJOR_INDIAN_CITIES, MajorCity } from '../../data/categories';
import { useOnboarding } from '../../context/OnboardingContext';
import { useAnalytics } from '../../context/AnalyticsContext';
import { useI18n } from '../../i18n/index';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({ isOpen, onClose }) => {
  const { preferences, updatePreferences } = useOnboarding();
  const { trackEvent } = useAnalytics();
  const { t } = useI18n();

  const [isLocating, setIsLocating] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  const filteredCities = MAJOR_INDIAN_CITIES.filter(
    (c) =>
      c.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.state.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const handleSelectCity = (city: MajorCity) => {
    updatePreferences({
      selectedCity: city.name,
      latitude: city.latitude,
      longitude: city.longitude,
      useCurrentLocation: false,
    });
    trackEvent('category_selected', { city: city.name, state: city.state });
    onClose();
  };

  const handleUseGps = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        // Find closest city from MAJOR_INDIAN_CITIES
        const userLat = pos.coords.latitude;
        const userLon = pos.coords.longitude;

        let closestCity = MAJOR_INDIAN_CITIES[0];
        let minDistance = Number.MAX_VALUE;

        MAJOR_INDIAN_CITIES.forEach((c) => {
          const d = Math.hypot(c.latitude - userLat, c.longitude - userLon);
          if (d < minDistance) {
            minDistance = d;
            closestCity = c;
          }
        });

        updatePreferences({
          selectedCity: closestCity.name,
          latitude: userLat,
          longitude: userLon,
          useCurrentLocation: true,
        });

        trackEvent('permission_accepted', { permission: 'geolocation', closestCity: closestCity.name });
        onClose();
      },
      (err) => {
        setIsLocating(false);
        setGpsError('Location access was denied or timed out. Please choose your city manually.');
        trackEvent('permission_denied', { permission: 'geolocation', error: err.message });
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t.search.selectLocation}
      description={t.search.locationNotice}
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* GPS Option */}
        <Button
          variant="outline"
          onClick={handleUseGps}
          isLoading={isLocating}
          leftIcon={<Navigation className="w-4 h-4 text-[#D9531E]" />}
          className="w-full justify-start text-stone-800 dark:text-stone-200 border-dashed hover:border-[#D9531E]"
        >
          {t.search.useGps}
        </Button>

        {gpsError && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl text-xs text-amber-800 dark:text-amber-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{gpsError}</span>
          </div>
        )}

        {/* City Filter */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search Indian city or state..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/60 px-3.5 py-2 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#D9531E]"
          />
        </div>

        {/* Cities Grid */}
        <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
          {filteredCities.map((c) => {
            const isSelected = preferences.selectedCity === c.name;
            return (
              <button
                key={c.name}
                type="button"
                onClick={() => handleSelectCity(c)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-sm transition-colors ${
                  isSelected
                    ? 'bg-[#D9531E]/10 text-[#D9531E] font-semibold'
                    : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
                }`}
              >
                <div className="flex items-center gap-2.5 text-left">
                  <MapPin className={`w-4 h-4 ${isSelected ? 'text-[#D9531E]' : 'text-stone-400'}`} />
                  <div>
                    <div className="leading-tight">{c.name}</div>
                    <div className="text-[11px] text-stone-400 font-normal">{c.state}</div>
                  </div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-[#D9531E]" />}
              </button>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};
