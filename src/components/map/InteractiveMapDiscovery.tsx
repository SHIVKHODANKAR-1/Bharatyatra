import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  MapPin,
  Navigation,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Compass,
  Sliders,
  Filter,
  X,
  Sparkles,
  ShieldCheck,
  Star,
  Bookmark,
  Share2,
  Eye,
  RotateCcw,
  List,
  Map as MapIcon,
  Columns,
  Search,
  Clock,
  Car,
  Train,
  Plane,
  AlertCircle,
  PlusCircle,
} from 'lucide-react';
import { UnifiedSearchItem } from '../../types/travel';
import { DataClassification } from '../../types/index';
import {
  getCityCoordinates,
  calculateHaversineDistanceKm,
  formatDistanceString,
  getRouteDistanceSummary,
  RouteDistanceSummary,
} from '../../services/geoService';

interface InteractiveMapDiscoveryProps {
  items: UnifiedSearchItem[];
  userCity?: string;
  selectedItem?: UnifiedSearchItem | null;
  onSelectItem: (item: UnifiedSearchItem | null) => void;
  onToggleSave?: (item: UnifiedSearchItem) => void;
  onAddToItinerary?: (item: UnifiedSearchItem) => void;
  savedItemIds?: string[];
  heightClass?: string;
  onViewDetails?: (item: UnifiedSearchItem) => void;
}

type LocationStatus = 'prompt' | 'requesting' | 'granted' | 'denied' | 'unavailable';
type MapLayoutMode = 'map_only' | 'split' | 'list_only';

export const InteractiveMapDiscovery: React.FC<InteractiveMapDiscoveryProps> = ({
  items,
  userCity = 'Nagpur',
  selectedItem,
  onSelectItem,
  onToggleSave,
  onAddToItinerary,
  savedItemIds = [],
  heightClass = 'h-[650px]',
  onViewDetails,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [layoutMode, setLayoutMode] = useState<MapLayoutMode>('map_only');
  const [activeRadiusKm, setActiveRadiusKm] = useState<number>(0); // 0 means all items
  const [activeTypeFilter, setActiveTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('prompt');
  const [locationErrorMsg, setLocationErrorMsg] = useState<string | null>(null);

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>(() => {
    const coords = getCityCoordinates(userCity);
    return { lat: coords.latitude, lng: coords.longitude };
  });

  // Acquire real GPS if user explicitly triggers or allows
  const requestCurrentLocation = () => {
    if (!('geolocation' in navigator)) {
      setLocationStatus('unavailable');
      setLocationErrorMsg('Geolocation is not supported by your browser.');
      return;
    }

    setLocationStatus('requesting');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationStatus('granted');
        setLocationErrorMsg(null);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([pos.coords.latitude, pos.coords.longitude], 11, { duration: 1.2 });
        }
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setLocationStatus('denied');
          setLocationErrorMsg('Location permission denied. Defaulting to selected base city.');
        } else {
          setLocationStatus('unavailable');
          setLocationErrorMsg('GPS position unavailable. Using default city coordinates.');
        }
        const fallback = getCityCoordinates(userCity);
        setUserLocation({ lat: fallback.latitude, lng: fallback.longitude });
      },
      { timeout: 8000, enableHighAccuracy: false }
    );
  };

  // Filter items by type, radius, and search text
  const filteredItems = items.filter((item) => {
    if (activeTypeFilter === 'saved') {
      if (!savedItemIds.includes(item.id)) return false;
    } else if (activeTypeFilter !== 'all' && item.type !== activeTypeFilter) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchCity = item.location.city.toLowerCase().includes(q);
      const matchState = item.location.state.toLowerCase().includes(q);
      if (!matchName && !matchCity && !matchState) return false;
    }

    if (activeRadiusKm > 0) {
      const dist = calculateHaversineDistanceKm(
        userLocation.lat,
        userLocation.lng,
        item.location.latitude,
        item.location.longitude
      );
      if (dist > activeRadiusKm) return false;
    }
    return true;
  });

  // Calculate route distance summary when an item is selected
  const routeSummary: RouteDistanceSummary | null = selectedItem
    ? getRouteDistanceSummary(
        userLocation.lat,
        userLocation.lng,
        selectedItem.location.latitude,
        selectedItem.location.longitude
      )
    : null;

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [userLocation.lat, userLocation.lng],
        zoom: 5,
        zoomControl: false,
        attributionControl: false,
      });

      // CartoDB Voyager tiles for clean high-contrast aesthetic
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      // Attribution
      L.control
        .attribution({
          position: 'bottomright',
          prefix: '<a href="https://leafletjs.com" target="_blank" rel="noreferrer">Leaflet</a> | © OpenStreetMap contributors',
        })
        .addTo(map);

      mapInstanceRef.current = map;
      markersLayerRef.current = L.layerGroup().addTo(map);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers when items or selection change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    // 1. Add User Location Radar Marker
    const userIcon = L.divIcon({
      className: 'user-radar-pin',
      html: `
        <div class="relative flex items-center justify-center w-8 h-8">
          <div class="absolute w-8 h-8 rounded-full bg-sky-500/30 animate-ping"></div>
          <div class="relative w-4 h-4 rounded-full bg-sky-600 border-2 border-white shadow-md flex items-center justify-center text-[8px] text-white font-bold">
            YOU
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    L.marker([userLocation.lat, userLocation.lng], { icon: userIcon, zIndexOffset: 1000 })
      .bindTooltip(`Your Location (${locationStatus === 'granted' ? 'GPS Active' : userCity})`, { direction: 'top' })
      .addTo(markersLayer);

    // 2. Add Place Markers
    const bounds = L.latLngBounds([userLocation.lat, userLocation.lng], [userLocation.lat, userLocation.lng]);

    filteredItems.forEach((item) => {
      const isSelected = selectedItem?.id === item.id;
      const isSaved = savedItemIds.includes(item.id);

      let pinColor = '#D9531E'; // default terracotta
      let pinEmoji = '📍';

      if (item.type === 'attraction') {
        pinColor = '#8B5CF6';
        pinEmoji = '🏛️';
      } else if (item.type === 'food') {
        pinColor = '#F59E0B';
        pinEmoji = '🍲';
      } else if (item.type === 'experience' || item.type === 'activity') {
        pinColor = '#0D9488';
        pinEmoji = '🧭';
      } else if (item.type === 'stay') {
        pinColor = '#2563EB';
        pinEmoji = '🏨';
      } else if (item.type === 'event') {
        pinColor = '#E11D48';
        pinEmoji = '🎪';
      }

      if (item.isHiddenGem) {
        pinColor = '#D97706';
        pinEmoji = '💎';
      }

      const markerHtml = `
        <div class="group/pin relative cursor-pointer transform transition-transform duration-200 ${
          isSelected ? 'scale-125 z-50' : 'hover:scale-115'
        }">
          <div style="background-color: ${pinColor};" class="w-8 h-8 rounded-full border-2 ${
            isSelected ? 'border-white ring-4 ring-[#D9531E]/40' : 'border-white'
          } shadow-md flex items-center justify-center text-white text-xs font-bold">
            ${pinEmoji}
          </div>
          ${
            isSaved
              ? '<div class="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-500 border border-white flex items-center justify-center text-[8px] text-white">★</div>'
              : ''
          }
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: markerHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([item.location.latitude, item.location.longitude], {
        icon: customIcon,
      });

      marker.on('click', () => {
        onSelectItem(item);
      });

      marker.bindTooltip(
        `<strong>${item.name}</strong><br/><span style="font-size: 10px; color: #666;">${item.location.city}, ${item.location.state}</span>`,
        { direction: 'top', offset: [0, -10] }
      );

      marker.addTo(markersLayer);
      bounds.extend([item.location.latitude, item.location.longitude]);
    });

    // If selected item exists, pan to it smoothly
    if (selectedItem) {
      map.flyTo([selectedItem.location.latitude, selectedItem.location.longitude], 10, {
        duration: 1.2,
      });
    } else if (filteredItems.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 11 });
    }
  }, [filteredItems, selectedItem, userLocation, savedItemIds, locationStatus, userCity]);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 9, { duration: 1 });
    }
  };

  return (
    <div className={`relative w-full ${heightClass} rounded-3xl overflow-hidden border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col`}>
      {/* Top Map Control & Search Bar */}
      <div className="absolute top-3 left-3 right-3 z-30 flex flex-col gap-2 pointer-events-none">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Search nearby and Type Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md p-1.5 rounded-2xl shadow-md border border-stone-200 dark:border-stone-800 pointer-events-auto">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-stone-100 dark:bg-stone-800 rounded-xl">
              <Search className="w-3.5 h-3.5 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search nearby places..."
                className="bg-transparent text-xs text-stone-800 dark:text-stone-200 focus:outline-none w-28 sm:w-36"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-stone-400 hover:text-stone-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {[
              { id: 'all', label: 'All Places' },
              { id: 'destination', label: 'Destinations' },
              { id: 'attraction', label: 'Attractions' },
              { id: 'experience', label: 'Experiences' },
              { id: 'food', label: 'Food' },
              { id: 'event', label: 'Events' },
              { id: 'saved', label: `Saved (${savedItemIds.length})` },
            ].map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setActiveTypeFilter(type.id)}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                  activeTypeFilter === type.id
                    ? 'bg-[#D9531E] text-white shadow-xs'
                    : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          {/* Radius Selector & View Mode Switcher */}
          <div className="flex items-center gap-2 pointer-events-auto">
            {/* Radius */}
            <div className="flex items-center gap-1 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md px-2 py-1.5 rounded-2xl shadow-md border border-stone-200 dark:border-stone-800">
              <span className="text-[11px] font-semibold text-stone-500 mr-1 hidden sm:inline">Radius:</span>
              {[
                { km: 0, label: 'All India' },
                { km: 50, label: '50 km' },
                { km: 150, label: '150 km' },
                { km: 350, label: '350 km' },
              ].map((rad) => (
                <button
                  key={rad.km}
                  type="button"
                  onClick={() => setActiveRadiusKm(rad.km)}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all ${
                    activeRadiusKm === rad.km
                      ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900'
                      : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100'
                  }`}
                >
                  {rad.label}
                </button>
              ))}
            </div>

            {/* Layout Mode Toggles */}
            <div className="flex items-center bg-white/95 dark:bg-stone-900/95 backdrop-blur-md p-1 rounded-2xl shadow-md border border-stone-200 dark:border-stone-800">
              <button
                type="button"
                onClick={() => setLayoutMode('map_only')}
                title="Map View"
                className={`p-1.5 rounded-xl text-xs font-bold transition-all ${
                  layoutMode === 'map_only'
                    ? 'bg-[#D9531E] text-white'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode('split')}
                title="Split Map + List"
                className={`p-1.5 rounded-xl text-xs font-bold transition-all ${
                  layoutMode === 'split'
                    ? 'bg-[#D9531E] text-white'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode('list_only')}
                title="List View"
                className={`p-1.5 rounded-xl text-xs font-bold transition-all ${
                  layoutMode === 'list_only'
                    ? 'bg-[#D9531E] text-white'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100'
                }`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Location Status Notice Banner (if denied or unavailable) */}
        {locationErrorMsg && (
          <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs backdrop-blur-md pointer-events-auto max-w-lg">
            <div className="flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>{locationErrorMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setLocationErrorMsg(null)}
              className="text-amber-700 hover:text-amber-900 dark:text-amber-300"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Floating Action Controls on Right */}
      <div className="absolute right-3 top-24 z-30 flex flex-col gap-2 pointer-events-auto">
        <button
          type="button"
          onClick={requestCurrentLocation}
          className={`p-2.5 rounded-2xl shadow-md border transition-colors flex items-center justify-center ${
            locationStatus === 'granted'
              ? 'bg-emerald-600 text-white border-emerald-700'
              : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-200 border-stone-200 dark:border-stone-800 hover:bg-stone-50'
          }`}
          title={locationStatus === 'granted' ? 'GPS Location Active' : 'Acquire Current GPS Location'}
        >
          <Navigation className={`w-4 h-4 ${locationStatus === 'granted' ? 'animate-pulse' : 'text-[#D9531E]'}`} />
        </button>

        <button
          type="button"
          onClick={handleRecenter}
          className="p-2.5 rounded-2xl bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-200 shadow-md border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
          title={`Center on base (${userCity})`}
        >
          <Compass className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.zoomIn();
            }
          }}
          className="p-2.5 rounded-2xl bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-200 shadow-md border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.zoomOut();
            }
          }}
          className="p-2.5 rounded-2xl bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-200 shadow-md border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>

      {/* Selected Item Preview & Travel Route Card on Bottom Left */}
      {selectedItem && layoutMode !== 'list_only' && (
        <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-30 bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 p-4 animate-fadeIn pointer-events-auto">
          <div className="flex gap-3.5">
            <img
              src={selectedItem.imageUrl}
              alt={selectedItem.name}
              className="w-20 h-20 rounded-2xl object-cover shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-1">
                <span className="px-2 py-0.5 rounded-md bg-[#D9531E]/10 text-[#D9531E] font-bold text-[10px] uppercase tracking-wider">
                  {selectedItem.type}
                </span>
                <button
                  type="button"
                  onClick={() => onSelectItem(null)}
                  className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 truncate mt-1">
                {selectedItem.name}
              </h4>

              <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-[#D9531E] shrink-0" />
                <span className="truncate">{selectedItem.location.city}, {selectedItem.location.state}</span>
              </p>

              <div className="flex items-center gap-2 mt-1.5 text-xs">
                {selectedItem.distanceKm !== undefined && (
                  <span className="font-semibold text-stone-700 dark:text-stone-300">
                    {formatDistanceString(selectedItem.distanceKm, userCity)}
                  </span>
                )}
                {selectedItem.rating && (
                  <span className="flex items-center gap-0.5 font-bold text-amber-500">
                    <Star className="w-3 h-3 fill-amber-500" />
                    <span>{selectedItem.rating.toFixed(1)}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Route & Distance Intelligence Module */}
          {routeSummary && routeSummary.estimates.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-stone-100 dark:border-stone-800">
              <div className="flex items-center justify-between text-[11px] font-semibold text-stone-500 mb-1.5">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#D9531E]" />
                  <span>Est. Travel Times ({routeSummary.formattedDistance}):</span>
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {routeSummary.estimates.slice(0, 3).map((est) => (
                  <div
                    key={est.mode}
                    className="p-1.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60 text-center"
                  >
                    <div className="flex items-center justify-center gap-1 text-[10px] text-stone-500">
                      {est.mode === 'road' && <Car className="w-3 h-3 text-stone-600" />}
                      {est.mode === 'rail' && <Train className="w-3 h-3 text-emerald-600" />}
                      {est.mode === 'air' && <Plane className="w-3 h-3 text-blue-600" />}
                      <span>{est.mode.toUpperCase()}</span>
                    </div>
                    <div className="text-xs font-bold text-stone-800 dark:text-stone-200 mt-0.5">
                      {est.approxDurationFormatted}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Row */}
          <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-stone-100 dark:border-stone-800">
            <div className="flex items-center gap-1.5">
              {onToggleSave && (
                <button
                  type="button"
                  onClick={() => onToggleSave(selectedItem)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-colors ${
                    savedItemIds.includes(selectedItem.id)
                      ? 'border-[#D9531E] bg-[#D9531E]/10 text-[#D9531E]'
                      : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50'
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${savedItemIds.includes(selectedItem.id) ? 'fill-[#D9531E]' : ''}`} />
                  <span>{savedItemIds.includes(selectedItem.id) ? 'Saved' : 'Save'}</span>
                </button>
              )}

              {onAddToItinerary && (
                <button
                  type="button"
                  onClick={() => onAddToItinerary(selectedItem)}
                  className="px-2.5 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-50 text-xs font-semibold flex items-center gap-1"
                  title="Add to Itinerary"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">Add to Trip</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => onViewDetails && onViewDetails(selectedItem)}
              className="px-4 py-1.5 rounded-xl bg-[#D9531E] hover:bg-[#B45309] text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Full Details</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Body: Map + Optional Split List View */}
      <div className="flex-1 w-full h-full flex overflow-hidden">
        {/* Leaflet Map Area */}
        {layoutMode !== 'list_only' && (
          <div
            className={`h-full transition-all duration-300 ${
              layoutMode === 'split' ? 'w-full md:w-3/5' : 'w-full'
            }`}
          >
            <div ref={mapContainerRef} className="w-full h-full z-10" />
          </div>
        )}

        {/* List View Side Panel */}
        {(layoutMode === 'split' || layoutMode === 'list_only') && (
          <div
            className={`h-full bg-white dark:bg-stone-900 border-l border-stone-200 dark:border-stone-800 overflow-y-auto p-4 space-y-3 z-20 ${
              layoutMode === 'split' ? 'w-full md:w-2/5' : 'w-full'
            }`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
              <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                {filteredItems.length} Places Found
              </span>
              <span className="text-[11px] text-stone-500">
                Click any place to preview on map
              </span>
            </div>

            {filteredItems.length === 0 ? (
              <div className="p-8 text-center text-stone-400">
                <MapPin className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs font-medium">No places match the selected filters or search radius.</p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTypeFilter('all');
                    setActiveRadiusKm(0);
                    setSearchQuery('');
                  }}
                  className="mt-3 text-xs font-bold text-[#D9531E] hover:underline"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectItem(item)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex gap-3 ${
                    selectedItem?.id === item.id
                      ? 'border-[#D9531E] bg-[#D9531E]/5 shadow-xs'
                      : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
                  }`}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-bold uppercase text-[#D9531E]">
                          {item.type}
                        </span>
                        {item.distanceKm !== undefined && (
                          <span className="text-[10px] font-semibold text-stone-400">
                            {formatDistanceString(item.distanceKm, userCity)}
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate mt-0.5">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-stone-500 truncate">
                        {item.location.city}, {item.location.state}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1">
                      {item.rating && (
                        <span className="flex items-center gap-0.5 font-bold text-amber-500">
                          <Star className="w-3 h-3 fill-amber-500" />
                          <span>{item.rating.toFixed(1)}</span>
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onViewDetails) onViewDetails(item);
                        }}
                        className="text-[#D9531E] font-semibold hover:underline"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

