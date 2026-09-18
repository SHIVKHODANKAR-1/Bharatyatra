import { TripPlan, DayItinerary, ItineraryActivity, ItineraryActivityType } from '../types/travel';
import { UserPreferences, BudgetTier } from '../types/auth';
import { DataClassification } from '../types/index';
import { INITIAL_DESTINATIONS } from '../data/destinations';
import { INITIAL_EXPERIENCES } from '../data/experiences';
import { INITIAL_FOOD_PLACES } from '../data/foodPlaces';
import { INITIAL_EVENTS } from '../data/events';

const STORAGE_KEY_TRIPS = 'bharat_yatra_saved_trips_v1';
const STORAGE_KEY_ACTIVE_TRIP = 'bharat_yatra_active_trip_id_v1';

export interface TripValidationResult {
  isValid: boolean;
  errors: {
    title?: string;
    destination?: string;
    startDate?: string;
    endDate?: string;
    travelersCount?: string;
  };
}

export class TripService {
  private static trips: TripPlan[] = [];
  private static activeTripId: string | null = null;
  private static lastRemovedActivity: {
    tripId: string;
    dayNumber: number;
    activity: ItineraryActivity;
  } | null = null;

  /**
   * Initialize trips from localStorage or seed initial sample trip
   */
  public static init(): TripPlan[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_TRIPS);
      if (stored) {
        TripService.trips = JSON.parse(stored);
      }
      const storedActive = localStorage.getItem(STORAGE_KEY_ACTIVE_TRIP);
      if (storedActive && TripService.trips.some((t) => t.id === storedActive)) {
        TripService.activeTripId = storedActive;
      } else if (TripService.trips.length > 0) {
        TripService.activeTripId = TripService.trips[0].id;
      }
    } catch {
      // fallback
    }

    if (TripService.trips.length === 0) {
      TripService.trips = [TripService.createDefaultSampleTrip()];
      TripService.activeTripId = TripService.trips[0].id;
      TripService.persist();
    }

    return TripService.trips;
  }

  /**
   * Persist trips to localStorage
   */
  private static persist(): void {
    try {
      localStorage.setItem(STORAGE_KEY_TRIPS, JSON.stringify(TripService.trips));
      if (TripService.activeTripId) {
        localStorage.setItem(STORAGE_KEY_ACTIVE_TRIP, TripService.activeTripId);
      }
    } catch {
      // storage quota or private mode
    }
  }

  /**
   * Get all trips
   */
  public static getTrips(): TripPlan[] {
    if (TripService.trips.length === 0) {
      TripService.init();
    }
    return [...TripService.trips];
  }

  /**
   * Get active trip
   */
  public static getActiveTrip(): TripPlan | null {
    if (TripService.trips.length === 0) {
      TripService.init();
    }
    const found = TripService.trips.find((t) => t.id === TripService.activeTripId);
    return found || TripService.trips[0] || null;
  }

  /**
   * Set active trip ID
   */
  public static setActiveTripId(tripId: string): void {
    TripService.activeTripId = tripId;
    TripService.persist();
  }

  /**
   * Get trip by ID
   */
  public static getTripById(tripId: string): TripPlan | null {
    return TripService.trips.find((t) => t.id === tripId) || null;
  }

  /**
   * Validate trip creation inputs
   */
  public static validateTrip(data: Partial<TripPlan>): TripValidationResult {
    const errors: TripValidationResult['errors'] = {};

    if (!data.destination || data.destination.trim().length === 0) {
      errors.destination = 'Destination is required.';
    }

    if (!data.startDate) {
      errors.startDate = 'Start date is required.';
    }

    if (!data.endDate) {
      errors.endDate = 'End date is required.';
    }

    if (data.startDate && data.endDate) {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      if (isNaN(start.getTime())) {
        errors.startDate = 'Invalid start date format.';
      }
      if (isNaN(end.getTime())) {
        errors.endDate = 'Invalid end date format.';
      }
      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end < start) {
        errors.endDate = 'End date cannot be before start date.';
      }
    }

    if (data.travelersCount !== undefined && data.travelersCount <= 0) {
      errors.travelersCount = 'Number of travelers must be at least 1.';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * Calculate days count between two ISO date strings
   */
  public static calculateDaysCount(startDateStr: string, endDateStr: string): number {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 3;
    const diffMs = end.getTime() - start.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, Math.min(30, diffDays));
  }

  /**
   * Create a new trip with empty days
   */
  public static createTrip(
    params: {
      title?: string;
      destination: string;
      startDate: string;
      endDate: string;
      budgetTier?: BudgetTier;
      budgetTotalInr?: number;
      travelersCount?: number;
      travelStyle?: string;
      interests?: string[];
      pace?: string;
      party?: string;
      notes?: string;
    },
    preferences?: UserPreferences
  ): { trip?: TripPlan; errors?: TripValidationResult['errors'] } {
    const validation = TripService.validateTrip(params);
    if (!validation.isValid) {
      return { errors: validation.errors };
    }

    const daysCount = TripService.calculateDaysCount(params.startDate, params.endDate);
    const days: DayItinerary[] = [];

    const startObj = new Date(params.startDate);
    for (let i = 1; i <= daysCount; i++) {
      const d = new Date(startObj);
      d.setDate(startObj.getDate() + (i - 1));
      const dateStr = d.toISOString().split('T')[0];

      let theme = `Day ${i}: Arrival & Local Exploration`;
      if (i === 2) theme = `Day 2: Heritage & Historic Landmarks`;
      else if (i === 3) theme = `Day 3: Culinary & Cultural Immersion`;
      else if (i > 3) theme = `Day ${i}: Excursions & Scenic Trails`;

      days.push({
        dayNumber: i,
        date: dateStr,
        theme,
        activities: [],
      });
    }

    const id = `trip_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newTrip: TripPlan = {
      id,
      title: params.title?.trim() || `${params.destination} Exploration`,
      destination: params.destination.trim(),
      startDate: params.startDate,
      endDate: params.endDate,
      budgetTier: params.budgetTier || preferences?.budget || 'moderate',
      budgetTotalInr: params.budgetTotalInr || 15000,
      travelersCount: params.travelersCount || 1,
      travelStyle: params.travelStyle || preferences?.travelStyle || 'cultural',
      interests: params.interests || preferences?.interests || ['heritage', 'food'],
      pace: params.pace || preferences?.pace || 'balanced',
      party: params.party || preferences?.party || 'solo',
      days,
      packingList: TripService.generateDefaultPackingList(params.destination),
      notes: params.notes || '',
      isCompleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    TripService.trips.unshift(newTrip);
    TripService.activeTripId = id;
    TripService.persist();

    return { trip: newTrip };
  }

  /**
   * Update trip metadata
   */
  public static updateTrip(id: string, updates: Partial<TripPlan>): TripPlan | null {
    const idx = TripService.trips.findIndex((t) => t.id === id);
    if (idx === -1) return null;

    TripService.trips[idx] = {
      ...TripService.trips[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    TripService.persist();
    return TripService.trips[idx];
  }

  /**
   * Duplicate a trip
   */
  public static duplicateTrip(id: string): TripPlan | null {
    const original = TripService.getTripById(id);
    if (!original) return null;

    const newId = `trip_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const duplicated: TripPlan = {
      ...JSON.parse(JSON.stringify(original)),
      id: newId,
      title: `${original.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isCompleted: false,
    };

    TripService.trips.unshift(duplicated);
    TripService.activeTripId = newId;
    TripService.persist();
    return duplicated;
  }

  /**
   * Delete a trip
   */
  public static deleteTrip(id: string): boolean {
    const initialLen = TripService.trips.length;
    TripService.trips = TripService.trips.filter((t) => t.id !== id);
    if (TripService.trips.length < initialLen) {
      if (TripService.activeTripId === id) {
        TripService.activeTripId = TripService.trips[0]?.id || null;
      }
      TripService.persist();
      return true;
    }
    return false;
  }

  /**
   * Add activity to a specific day in a trip
   * Prevents accidental duplicates.
   */
  public static addActivityToTrip(
    tripId: string,
    dayNumber: number,
    activityData: Partial<ItineraryActivity>
  ): { trip: TripPlan | null; error?: string; activity?: ItineraryActivity } {
    const trip = TripService.getTripById(tripId);
    if (!trip) return { trip: null, error: 'Trip not found.' };

    const day = trip.days.find((d) => d.dayNumber === dayNumber);
    if (!day) return { trip, error: `Day ${dayNumber} does not exist in this trip.` };

    // Duplicate detection: check for identical title or itemReferenceId
    const isDuplicate = day.activities.some(
      (a) =>
        (activityData.itemReferenceId && a.itemReferenceId === activityData.itemReferenceId) ||
        a.title.trim().toLowerCase() === (activityData.title || '').trim().toLowerCase()
    );

    if (isDuplicate) {
      return {
        trip,
        error: `"${activityData.title}" is already scheduled on Day ${dayNumber}.`,
      };
    }

    const newActivity: ItineraryActivity = {
      id: activityData.id || `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timeSlot: activityData.timeSlot || 'morning',
      activityType: activityData.activityType || 'sightseeing',
      title: activityData.title || 'New Activity',
      location: activityData.location || trip.destination,
      durationMinutes: activityData.durationMinutes || 90,
      estimatedCostInr: activityData.estimatedCostInr || 0,
      notes: activityData.notes || '',
      isCompleted: false,
      itemReferenceId: activityData.itemReferenceId,
      itemType: activityData.itemType || 'destination',
      dataClassification: activityData.dataClassification || DataClassification.VERIFIED,
    };

    day.activities.push(newActivity);
    trip.updatedAt = new Date().toISOString();
    TripService.persist();

    return { trip, activity: newActivity };
  }

  /**
   * Remove activity from a day, storing it in lastRemovedActivity for undo
   */
  public static removeActivityFromTrip(
    tripId: string,
    dayNumber: number,
    activityId: string
  ): { trip: TripPlan | null; removedActivity: ItineraryActivity | null } {
    const trip = TripService.getTripById(tripId);
    if (!trip) return { trip: null, removedActivity: null };

    const day = trip.days.find((d) => d.dayNumber === dayNumber);
    if (!day) return { trip, removedActivity: null };

    const targetIdx = day.activities.findIndex((a) => a.id === activityId);
    if (targetIdx === -1) return { trip, removedActivity: null };

    const [removed] = day.activities.splice(targetIdx, 1);
    TripService.lastRemovedActivity = {
      tripId,
      dayNumber,
      activity: removed,
    };

    trip.updatedAt = new Date().toISOString();
    TripService.persist();

    return { trip, removedActivity: removed };
  }

  /**
   * Undo the last removed activity
   */
  public static undoLastRemovedActivity(): { trip: TripPlan | null; restored: boolean } {
    if (!TripService.lastRemovedActivity) return { trip: null, restored: false };

    const { tripId, dayNumber, activity } = TripService.lastRemovedActivity;
    const trip = TripService.getTripById(tripId);
    if (!trip) return { trip: null, restored: false };

    const day = trip.days.find((d) => d.dayNumber === dayNumber);
    if (!day) return { trip, restored: false };

    day.activities.push(activity);
    trip.updatedAt = new Date().toISOString();
    TripService.lastRemovedActivity = null;
    TripService.persist();

    return { trip, restored: true };
  }

  /**
   * Move an activity from one day to another
   */
  public static moveActivityToDay(
    tripId: string,
    fromDayNumber: number,
    toDayNumber: number,
    activityId: string
  ): TripPlan | null {
    const trip = TripService.getTripById(tripId);
    if (!trip) return null;

    const fromDay = trip.days.find((d) => d.dayNumber === fromDayNumber);
    const toDay = trip.days.find((d) => d.dayNumber === toDayNumber);
    if (!fromDay || !toDay) return trip;

    const actIdx = fromDay.activities.findIndex((a) => a.id === activityId);
    if (actIdx === -1) return trip;

    const [act] = fromDay.activities.splice(actIdx, 1);
    toDay.activities.push(act);

    trip.updatedAt = new Date().toISOString();
    TripService.persist();
    return trip;
  }

  /**
   * Reorder activities in a day
   */
  public static reorderActivities(
    tripId: string,
    dayNumber: number,
    reordered: ItineraryActivity[]
  ): TripPlan | null {
    const trip = TripService.getTripById(tripId);
    if (!trip) return null;

    const day = trip.days.find((d) => d.dayNumber === dayNumber);
    if (!day) return trip;

    day.activities = reordered;
    trip.updatedAt = new Date().toISOString();
    TripService.persist();
    return trip;
  }

  /**
   * Toggle activity completed status
   */
  public static toggleActivityCompleted(
    tripId: string,
    dayNumber: number,
    activityId: string
  ): TripPlan | null {
    const trip = TripService.getTripById(tripId);
    if (!trip) return null;

    const day = trip.days.find((d) => d.dayNumber === dayNumber);
    if (!day) return trip;

    const act = day.activities.find((a) => a.id === activityId);
    if (act) {
      act.isCompleted = !act.isCompleted;
      trip.updatedAt = new Date().toISOString();
      TripService.persist();
    }
    return trip;
  }

  /**
   * Edit activity details (notes, duration, timeSlot, cost)
   */
  public static editActivity(
    tripId: string,
    dayNumber: number,
    activityId: string,
    updates: Partial<ItineraryActivity>
  ): TripPlan | null {
    const trip = TripService.getTripById(tripId);
    if (!trip) return null;

    const day = trip.days.find((d) => d.dayNumber === dayNumber);
    if (!day) return trip;

    const actIdx = day.activities.findIndex((a) => a.id === activityId);
    if (actIdx !== -1) {
      day.activities[actIdx] = {
        ...day.activities[actIdx],
        ...updates,
      };
      trip.updatedAt = new Date().toISOString();
      TripService.persist();
    }
    return trip;
  }

  /**
   * Compute trip statistics (completion %, total estimated cost, activity count)
   */
  public static getTripStats(trip: TripPlan): {
    totalActivities: number;
    completedActivities: number;
    progressPercent: number;
    totalEstimatedCostInr: number;
  } {
    let totalActivities = 0;
    let completedActivities = 0;
    let totalEstimatedCostInr = 0;

    trip.days.forEach((day) => {
      day.activities.forEach((act) => {
        totalActivities++;
        if (act.isCompleted) completedActivities++;
        totalEstimatedCostInr += act.estimatedCostInr || 0;
      });
    });

    const progressPercent =
      totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0;

    return {
      totalActivities,
      completedActivities,
      progressPercent,
      totalEstimatedCostInr,
    };
  }

  /**
   * Detect scheduling conflicts, slot overload, and pacing issues for a day
   */
  public static detectDayConflicts(day: DayItinerary): Array<{
    slot: string;
    type: 'overload' | 'pacing' | 'timing';
    message: string;
    severity: 'warning' | 'info';
  }> {
    const conflicts: Array<{
      slot: string;
      type: 'overload' | 'pacing' | 'timing';
      message: string;
      severity: 'warning' | 'info';
    }> = [];

    const slotCounts: Record<string, number> = { morning: 0, afternoon: 0, evening: 0 };
    let totalMinutes = 0;

    day.activities.forEach((act) => {
      const slot = act.timeSlot || 'morning';
      slotCounts[slot] = (slotCounts[slot] || 0) + 1;
      totalMinutes += act.durationMinutes || 90;
    });

    Object.entries(slotCounts).forEach(([slot, count]) => {
      if (count >= 3) {
        conflicts.push({
          slot,
          type: 'overload',
          message: `${slot.charAt(0).toUpperCase() + slot.slice(1)} has ${count} activities. Consider rebalancing to prevent rushed travel.`,
          severity: count > 3 ? 'warning' : 'info',
        });
      }
    });

    if (totalMinutes > 480) {
      conflicts.push({
        slot: 'day',
        type: 'timing',
        message: `Day schedules ~${Math.round(totalMinutes / 60)} hrs of activities. Allows very little buffer for traffic & rest.`,
        severity: 'warning',
      });
    }

    return conflicts;
  }

  /**
   * Optimize sequence of activities within a day (morning -> afternoon -> evening with sensible pacing)
   */
  public static optimizeDayRoute(tripId: string, dayNumber: number): TripPlan | null {
    const trip = TripService.getTripById(tripId);
    if (!trip) return null;

    const day = trip.days.find((d) => d.dayNumber === dayNumber);
    if (!day) return trip;

    const slotWeight: Record<string, number> = { morning: 1, afternoon: 2, evening: 3 };
    const typeWeight: Record<string, number> = {
      sightseeing: 1,
      experience: 2,
      food: 3,
      shopping: 4,
      rest: 5,
      event: 6,
      travel: 7,
      free_time: 8,
    };

    day.activities.sort((a, b) => {
      const slotDiff = (slotWeight[a.timeSlot] || 2) - (slotWeight[b.timeSlot] || 2);
      if (slotDiff !== 0) return slotDiff;
      const weightA = a.activityType ? typeWeight[a.activityType] || 5 : 5;
      const weightB = b.activityType ? typeWeight[b.activityType] || 5 : 5;
      return weightA - weightB;
    });

    trip.updatedAt = new Date().toISOString();
    TripService.persist();
    return trip;
  }

  /**
   * Calculate realistic, comprehensive budget breakdown
   */
  public static calculateBudgetBreakdown(trip: TripPlan): {
    stayCostInr: number;
    transitCostInr: number;
    foodCostInr: number;
    activitiesCostInr: number;
    totalCostInr: number;
    perPersonCostInr: number;
    breakdownPercent: { stay: number; transit: number; food: number; activities: number };
  } {
    const numDays = Math.max(1, trip.days.length);
    const travelers = Math.max(1, trip.travelersCount || 1);
    const tier = trip.budgetTier || 'moderate';

    // Tier daily rates per room / person
    const stayPerNight = tier === 'budget' ? 1400 : tier === 'luxury' ? 7500 : 3200;
    const foodPerPersonDay = tier === 'budget' ? 500 : tier === 'luxury' ? 2200 : 1000;
    const transitPerDay = tier === 'budget' ? 400 : tier === 'luxury' ? 2400 : 1200;

    const rooms = Math.ceil(travelers / 2);
    const stayCostInr = stayPerNight * Math.max(1, numDays - 1) * rooms;
    const transitCostInr = transitPerDay * numDays;
    const foodCostInr = foodPerPersonDay * travelers * numDays;

    let activitiesCostInr = 0;
    trip.days.forEach((day) => {
      day.activities.forEach((act) => {
        activitiesCostInr += (act.estimatedCostInr || 0) * travelers;
      });
    });

    const totalCostInr = stayCostInr + transitCostInr + foodCostInr + activitiesCostInr;
    const perPersonCostInr = Math.round(totalCostInr / travelers);

    const safeTotal = Math.max(1, totalCostInr);
    const breakdownPercent = {
      stay: Math.round((stayCostInr / safeTotal) * 100),
      transit: Math.round((transitCostInr / safeTotal) * 100),
      food: Math.round((foodCostInr / safeTotal) * 100),
      activities: Math.round((activitiesCostInr / safeTotal) * 100),
    };

    return {
      stayCostInr,
      transitCostInr,
      foodCostInr,
      activitiesCostInr,
      totalCostInr,
      perPersonCostInr,
      breakdownPercent,
    };
  }

  /**
   * Export itinerary as readable plain text summary
   */
  public static exportTripAsText(trip: TripPlan): string {
    const stats = TripService.getTripStats(trip);
    const budget = TripService.calculateBudgetBreakdown(trip);

    let text = `=================================================\n`;
    text += `BHARAT YATRA ITINERARY: ${trip.title.toUpperCase()}\n`;
    text += `Destination: ${trip.destination}\n`;
    text += `Dates: ${trip.startDate} to ${trip.endDate} (${trip.days.length} Days)\n`;
    text += `Party: ${trip.party || 'Solo'} (${trip.travelersCount || 1} Travelers) | Pace: ${trip.pace || 'Balanced'}\n`;
    text += `Estimated Total: ₹${budget.totalCostInr.toLocaleString('en-IN')} (₹${budget.perPersonCostInr.toLocaleString('en-IN')}/person)\n`;
    text += `=================================================\n\n`;

    trip.days.forEach((day) => {
      text += `--- DAY ${day.dayNumber}: ${day.theme.toUpperCase()} (${day.date}) ---\n`;
      if (day.activities.length === 0) {
        text += `  (Free day for spontaneous exploration)\n`;
      } else {
        day.activities.forEach((act, idx) => {
          text += `  ${idx + 1}. [${act.timeSlot.toUpperCase()}] ${act.title}\n`;
          text += `     Location: ${act.location} | Duration: ${act.durationMinutes} mins\n`;
          text += `     Cost: ${act.estimatedCostInr ? `₹${act.estimatedCostInr}` : 'Free Entry'}\n`;
          if (act.notes) text += `     Note: ${act.notes}\n`;
        });
      }
      text += `\n`;
    });

    text += `--- BUDGET BREAKDOWN ---\n`;
    text += `  - Stay: ₹${budget.stayCostInr.toLocaleString('en-IN')} (${budget.breakdownPercent.stay}%)\n`;
    text += `  - Transit: ₹${budget.transitCostInr.toLocaleString('en-IN')} (${budget.breakdownPercent.transit}%)\n`;
    text += `  - Food: ₹${budget.foodCostInr.toLocaleString('en-IN')} (${budget.breakdownPercent.food}%)\n`;
    text += `  - Entry/Activities: ₹${budget.activitiesCostInr.toLocaleString('en-IN')} (${budget.breakdownPercent.activities}%)\n\n`;

    text += `--- PACKING ESSENTIALS ---\n`;
    trip.packingList.forEach((p) => {
      text += `  [${p.isPacked ? 'X' : ' '}] ${p.item} (${p.category})\n`;
    });

    text += `\nGenerated via Bharat Yatra - India's Cultural AI Travel Guide\n`;
    return text;
  }

  /**
   * Generate personalized planning suggestions based on destination and preferences
   */
  public static getSuggestionsForTrip(
    trip: TripPlan,
    preferences: UserPreferences
  ): Array<{
    id: string;
    title: string;
    category: string;
    location: string;
    approxCostInr: number;
    durationMinutes: number;
    reason: string;
    itemType: 'destination' | 'experience' | 'food' | 'event';
    timeSlot: 'morning' | 'afternoon' | 'evening';
  }> {
    const destName = trip.destination.toLowerCase();
    const suggestions: Array<any> = [];

    // 1. Matched Attractions from Destinations
    const matchingDests = INITIAL_DESTINATIONS.filter(
      (d) =>
        d.name.toLowerCase().includes(destName) ||
        d.location.city.toLowerCase().includes(destName) ||
        d.location.state.toLowerCase().includes(destName)
    );

    matchingDests.forEach((d) => {
      suggestions.push({
        id: `sug_dest_${d.id}`,
        title: d.name,
        category: d.category,
        location: `${d.location.city}, ${d.location.state}`,
        approxCostInr:
          d.estimatedBudget === 'budget' ? 250 : d.estimatedBudget === 'luxury' ? 2500 : 800,
        durationMinutes: 120,
        reason: `Iconic landmark in ${trip.destination}`,
        itemType: 'destination',
        timeSlot: 'morning',
      });
    });

    // 2. Matched Experiences
    const matchingExps = INITIAL_EXPERIENCES.filter(
      (e) =>
        e.destinationName.toLowerCase().includes(destName) ||
        e.location.city.toLowerCase().includes(destName)
    );

    matchingExps.forEach((e) => {
      suggestions.push({
        id: `sug_exp_${e.id}`,
        title: e.title,
        category: e.category,
        location: `${e.location.city}, ${e.location.state}`,
        approxCostInr: e.approxPriceInr || 500,
        durationMinutes: e.durationMinutes || 120,
        reason: `Authentic verified experience: ${e.description.slice(0, 60)}...`,
        itemType: 'experience',
        timeSlot: 'afternoon',
      });
    });

    // 3. Matched Food places
    const matchingFood = INITIAL_FOOD_PLACES.filter(
      (f) =>
        f.location.city.toLowerCase().includes(destName) ||
        f.location.state.toLowerCase().includes(destName)
    );

    matchingFood.forEach((f) => {
      suggestions.push({
        id: `sug_food_${f.id}`,
        title: `${f.name} (${f.cuisineType} Dining)`,
        category: 'Food',
        location: `${f.location.city}, ${f.location.state}`,
        approxCostInr: Math.round((f.priceForTwoInr || 600) / 2),
        durationMinutes: 75,
        reason: `Signature dishes: ${f.specialtyDishes.slice(0, 2).join(', ')}`,
        itemType: 'food',
        timeSlot: 'evening',
      });
    });

    // 4. Matched Events
    const matchingEvents = INITIAL_EVENTS.filter(
      (ev) =>
        ev.destinationName.toLowerCase().includes(destName) ||
        ev.state.toLowerCase().includes(destName)
    );

    matchingEvents.forEach((ev) => {
      suggestions.push({
        id: `sug_ev_${ev.id}`,
        title: ev.name,
        category: ev.category,
        location: `${ev.destinationName}, ${ev.state}`,
        approxCostInr: ev.ticketInfo?.priceInr || 0,
        durationMinutes: 150,
        reason: `Seasonal festival highlight`,
        itemType: 'event',
        timeSlot: 'evening',
      });
    });

    // Fallback if very few matches for rare destinations
    if (suggestions.length < 3) {
      suggestions.push(
        {
          id: `sug_gen_walk`,
          title: `Old Town Heritage & Bazaar Walk in ${trip.destination}`,
          category: 'Heritage',
          location: trip.destination,
          approxCostInr: 300,
          durationMinutes: 90,
          reason: 'Recommended local orientation walk',
          itemType: 'experience',
          timeSlot: 'morning',
        },
        {
          id: `sug_gen_thali`,
          title: `Traditional Regional Thali Tasting in ${trip.destination}`,
          category: 'Food',
          location: trip.destination,
          approxCostInr: 450,
          durationMinutes: 60,
          reason: 'Authentic local cuisine recommendation',
          itemType: 'food',
          timeSlot: 'afternoon',
        },
        {
          id: `sug_gen_sunset`,
          title: `Sunset Vantage Point & Cultural Photography`,
          category: 'Photography',
          location: trip.destination,
          approxCostInr: 0,
          durationMinutes: 75,
          reason: 'Golden hour vantage point',
          itemType: 'sightseeing',
          timeSlot: 'evening',
        }
      );
    }

    return suggestions;
  }

  /**
   * Helper default packing list
   */
  private static generateDefaultPackingList(destination: string) {
    return [
      { id: 'p1', item: 'Official Government ID (Aadhaar / Passport / Voter ID)', isPacked: true, category: 'Documents' },
      { id: 'p2', item: 'Modest cotton clothing suitable for temple visits', isPacked: false, category: 'Clothing' },
      { id: 'p3', item: 'Comfortable walking / trekking shoes', isPacked: false, category: 'Footwear' },
      { id: 'p4', item: 'Refillable insulated water flask', isPacked: false, category: 'Essentials' },
      { id: 'p5', item: 'Personal first-aid & motion sickness medication', isPacked: false, category: 'Health' },
      { id: 'p6', item: 'UPI-enabled smartphone & portable power bank', isPacked: false, category: 'Electronics' },
    ];
  }

  /**
   * Initial sample trip seed
   */
  private static createDefaultSampleTrip(): TripPlan {
    return {
      id: 'trip_varanasi_heritage_sample',
      title: 'Spiritual Varanasi & Sarnath Cultural Journey',
      destination: 'Varanasi',
      startDate: '2026-10-15',
      endDate: '2026-10-17',
      budgetTier: 'moderate',
      budgetTotalInr: 18000,
      travelersCount: 2,
      travelStyle: 'cultural',
      interests: ['spiritual', 'heritage', 'food'],
      pace: 'balanced',
      party: 'couple',
      days: [
        {
          dayNumber: 1,
          date: '2026-10-15',
          theme: 'Ghats & Sacred Ganga River Experience',
          activities: [
            {
              id: 'v1',
              timeSlot: 'morning',
              activityType: 'experience',
              title: 'Subah-e-Banaras Dawn Boat Ride at Assi Ghat',
              location: 'Assi Ghat, Varanasi',
              durationMinutes: 120,
              estimatedCostInr: 800,
              notes: 'Arrive by 5:15 AM for classical ragas and aarti',
              isCompleted: true,
              dataClassification: DataClassification.VERIFIED,
            },
            {
              id: 'v2',
              timeSlot: 'afternoon',
              activityType: 'food',
              title: 'Kachori Sabzi & Jalebi Tasting at Ram Bhandar',
              location: 'Thatheri Bazaar, Varanasi',
              durationMinutes: 60,
              estimatedCostInr: 250,
              notes: 'Traditional breakfast served on fresh sal leaf dona',
              isCompleted: false,
              dataClassification: DataClassification.VERIFIED,
            },
            {
              id: 'v3',
              timeSlot: 'evening',
              activityType: 'sightseeing',
              title: 'Grand Ganga Aarti at Dashashwamedh Ghat',
              location: 'Dashashwamedh Ghat, Varanasi',
              durationMinutes: 90,
              estimatedCostInr: 0,
              notes: 'Find seating by 6:00 PM on boats or upper steps',
              isCompleted: false,
              dataClassification: DataClassification.VERIFIED,
            },
          ],
        },
        {
          dayNumber: 2,
          date: '2026-10-16',
          theme: 'Buddhist Heritage in Sarnath & Silk Weaving',
          activities: [
            {
              id: 'v4',
              timeSlot: 'morning',
              activityType: 'sightseeing',
              title: 'Dhamek Stupa & Archaeological Museum Visit',
              location: 'Sarnath, Uttar Pradesh',
              durationMinutes: 150,
              estimatedCostInr: 300,
              notes: 'Official ASI ticket counter at entrance',
              isCompleted: false,
              dataClassification: DataClassification.VERIFIED,
            },
            {
              id: 'v5',
              timeSlot: 'afternoon',
              activityType: 'experience',
              title: 'Master Weaver Banarasi Silk Loom Workshop',
              location: 'Pilikothi, Varanasi',
              durationMinutes: 90,
              estimatedCostInr: 500,
              notes: 'Direct interaction with third-generation handloom artisans',
              isCompleted: false,
              dataClassification: DataClassification.VERIFIED,
            },
            {
              id: 'v6',
              timeSlot: 'evening',
              activityType: 'food',
              title: 'Malaiyo & Banarasi Paan Street Safari',
              location: 'Godowlia Chowk, Varanasi',
              durationMinutes: 60,
              estimatedCostInr: 200,
              notes: 'Winter-special saffron milk froth froth delight',
              isCompleted: false,
              dataClassification: DataClassification.VERIFIED,
            },
          ],
        },
        {
          dayNumber: 3,
          date: '2026-10-17',
          theme: 'Ancient Alleys & Departure Souvenirs',
          activities: [
            {
              id: 'v7',
              timeSlot: 'morning',
              activityType: 'sightseeing',
              title: 'Kashi Vishwanath Corridor & Kal Bhairav Temple',
              location: 'Chowk, Varanasi',
              durationMinutes: 120,
              estimatedCostInr: 0,
              notes: 'Carry physical ID card for security check',
              isCompleted: false,
              dataClassification: DataClassification.VERIFIED,
            },
            {
              id: 'v8',
              timeSlot: 'afternoon',
              activityType: 'free_time',
              title: 'Brass Handicrafts & Wooden Toy Souvenir Shopping',
              location: 'Kashmiri Gali & Vishwanath Gali',
              durationMinutes: 90,
              estimatedCostInr: 1500,
              notes: 'GI tagged Varanasi wooden toys and brass bells',
              isCompleted: false,
              dataClassification: DataClassification.VERIFIED,
            },
          ],
        },
      ],
      packingList: TripService.generateDefaultPackingList('Varanasi'),
      notes: 'Remember to remove shoes before entering temple premises and observe photography restrictions.',
      isCompleted: false,
      createdAt: '2026-09-15T10:00:00.000Z',
      updatedAt: '2026-09-17T12:00:00.000Z',
    };
  }
}

// Auto-initialize on import
TripService.init();
