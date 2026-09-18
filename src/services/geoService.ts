import { MAJOR_INDIAN_CITIES, MajorCity } from '../data/categories';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Computes exact Haversine distance in kilometers between two geo coordinates.
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10;
}

/**
 * Resolves coordinates for a known city name or defaults to Central India (Nagpur).
 */
export function getCityCoordinates(cityName?: string): Coordinates {
  const clean = typeof cityName === 'string' ? cityName.trim().toLowerCase() : 'nagpur';
  const match = MAJOR_INDIAN_CITIES.find(
    (c) => c.name.toLowerCase() === clean
  );
  if (match) {
    return { latitude: match.latitude, longitude: match.longitude };
  }

  // Fallback coordinates for key tourism centers
  const fallbackMap: Record<string, Coordinates> = {
    agra: { latitude: 27.1767, longitude: 78.0081 },
    madurai: { latitude: 9.9252, longitude: 78.1198 },
    puri: { latitude: 19.8135, longitude: 85.8312 },
    mysuru: { latitude: 12.2958, longitude: 76.6394 },
    munnar: { latitude: 10.0889, longitude: 77.0595 },
    rishikesh: { latitude: 30.0869, longitude: 78.2676 },
    hampi: { latitude: 15.3350, longitude: 76.4600 },
    leh: { latitude: 34.1526, longitude: 77.5771 },
    spiti: { latitude: 32.2276, longitude: 78.0710 },
    goa: { latitude: 15.2993, longitude: 74.1240 },
    cherrapunji: { latitude: 25.2677, longitude: 91.7324 },
    nagpur: { latitude: 21.1458, longitude: 79.0882 },
  };

  return fallbackMap[clean] || { latitude: 21.1458, longitude: 79.0882 };
}

/**
 * Returns formatted distance string from origin coordinates
 */
export function formatDistanceString(distanceKm?: number, originName?: string): string {
  if (distanceKm === undefined || distanceKm === null) return '';
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m away`;
  }
  if (distanceKm < 10) {
    return `${distanceKm.toFixed(1)} km away`;
  }
  return `${Math.round(distanceKm)} km ${originName ? `from ${originName}` : 'away'}`;
}

export interface TravelTimeEstimate {
  mode: 'road' | 'rail' | 'air';
  label: string;
  approxDurationFormatted: string;
  approxHours: number;
  isFeasible: boolean;
  notes: string;
}

export interface RouteDistanceSummary {
  distanceKm: number;
  formattedDistance: string;
  estimates: TravelTimeEstimate[];
  disclaimer: string;
}

/**
 * Estimates approximate travel durations based on typical Indian transit speeds.
 * Note: Non-live estimation provided for trip planning, not turn-by-turn navigation.
 */
export function calculateTravelEstimates(distanceKm: number): TravelTimeEstimate[] {
  if (distanceKm <= 0) {
    return [];
  }

  const results: TravelTimeEstimate[] = [];

  // Road transit (assuming avg 50 km/h accounting for highways, tolls, and terrain)
  const roadHours = Math.max(0.5, distanceKm / 50);
  const roadHrs = Math.floor(roadHours);
  const roadMins = Math.round((roadHours - roadHrs) * 60);
  const roadDuration = roadHrs > 0 ? `${roadHrs}h ${roadMins > 0 ? `${roadMins}m` : ''}` : `${roadMins}m`;

  results.push({
    mode: 'road',
    label: 'Road / Taxi / Bus',
    approxDurationFormatted: roadDuration.trim(),
    approxHours: Math.round(roadHours * 10) / 10,
    isFeasible: distanceKm < 1200,
    notes: distanceKm > 600 ? 'Long drive; consider overnight halts or sleeper bus' : 'Convenient for state transport or private car',
  });

  // Rail transit (assuming avg 65 km/h express train + 1 hr station buffer)
  if (distanceKm > 40) {
    const railHours = (distanceKm / 65) + 0.8;
    const railHrs = Math.floor(railHours);
    const railMins = Math.round((railHours - railHrs) * 60);
    const railDuration = `${railHrs}h ${railMins > 0 ? `${railMins}m` : ''}`;

    results.push({
      mode: 'rail',
      label: 'Indian Railways Express',
      approxDurationFormatted: railDuration.trim(),
      approxHours: Math.round(railHours * 10) / 10,
      isFeasible: true,
      notes: 'Check IRCTC availability; Vande Bharat or Rajdhani / Shatabdi routes may be faster',
    });
  }

  // Air transit (feasible for > 350 km, assuming flight time + 2.5 hr check-in/airport transit)
  if (distanceKm >= 350) {
    const flightAirHours = distanceKm / 650;
    const totalDoorToDoor = flightAirHours + 2.5;
    const flightHrs = Math.floor(totalDoorToDoor);
    const flightMins = Math.round((totalDoorToDoor - flightHrs) * 60);

    results.push({
      mode: 'air',
      label: 'Domestic Flight',
      approxDurationFormatted: `${flightHrs}h ${flightMins > 0 ? `${flightMins}m` : ''}`.trim(),
      approxHours: Math.round(totalDoorToDoor * 10) / 10,
      isFeasible: true,
      notes: 'Direct flight where tier-1/2 airports connect; check nearest civil enclave',
    });
  }

  return results;
}

/**
 * Computes full route summary between two geo points
 */
export function getRouteDistanceSummary(
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number
): RouteDistanceSummary {
  const distKm = calculateHaversineDistanceKm(originLat, originLng, destLat, destLng);
  return {
    distanceKm: distKm,
    formattedDistance: formatDistanceString(distKm),
    estimates: calculateTravelEstimates(distKm),
    disclaimer: 'Estimates are modeled on typical transit averages. Live navigation, traffic, ghat delays, and seasonal train schedules may alter actual transit time.',
  };
}
