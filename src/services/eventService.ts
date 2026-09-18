import { SeasonalEvent } from '../types/travel';
import { INITIAL_SEASONAL_EVENTS } from '../data/events';
import { DataClassification } from '../types/index';
import { NotificationService } from './notificationService';

export type EventApprovalStatus =
  | 'Draft'
  | 'Pending Approval'
  | 'Published'
  | 'Cancelled'
  | 'Completed'
  | 'Rejected';

export interface ManagedEvent extends SeasonalEvent {
  providerId?: string;
  approvalStatus?: EventApprovalStatus;
  startTime?: string;
  endTime?: string;
  capacity?: number;
  registeredCount?: number;
  ticketPriceInr?: number;
  isFamilyFriendly?: boolean;
  isCultural?: boolean;
  isMusic?: boolean;
  isFood?: boolean;
  isAdventure?: boolean;
  isFestival?: boolean;
  isEducational?: boolean;
}

const EVENTS_STORAGE_KEY = 'bharat_yatra_managed_events_v1';

export class EventService {
  private static getStoredEvents(): ManagedEvent[] {
    try {
      const data = localStorage.getItem(EVENTS_STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    const seeded: ManagedEvent[] = INITIAL_SEASONAL_EVENTS.map((evt, i) => {
      let providerId = 'prov_varanasi_heritage';
      if (evt.destinationName === 'Jaipur') providerId = 'prov_jaipur_royal';
      if (evt.destinationName === 'Hampi') providerId = 'prov_hampi_boulders';
      if (evt.destinationName === 'Goa') providerId = 'prov_goa_fado';

      return {
        ...evt,
        providerId,
        approvalStatus: 'Published',
        startTime: evt.time?.split('–')[0]?.trim() || '05:00 PM',
        endTime: evt.time?.split('–')[1]?.trim() || '10:00 PM',
        capacity: 500 + i * 200,
        registeredCount: 42 + i * 15,
        ticketPriceInr: evt.ticketInfo?.priceInr || 0,
        isFamilyFriendly: true,
        isCultural: true,
        isFestival: evt.category === 'Festival' || evt.category === 'Spiritual Gathering',
        isMusic: evt.category === 'Music & Arts' || evt.name.includes('Dance') || evt.name.includes('Music'),
        isFood: evt.name.includes('Food') || evt.name.includes('Fair'),
        isAdventure: evt.category === 'Nature & Seasonal',
        isEducational: true,
      };
    });
    return seeded;
  }

  private static saveEvents(list: ManagedEvent[]): void {
    try {
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(list));
    } catch {
      // ignore
    }
  }

  public static getPublishedEvents(): ManagedEvent[] {
    return this.getStoredEvents().filter((e) => !e.approvalStatus || e.approvalStatus === 'Published');
  }

  public static getAllEvents(): ManagedEvent[] {
    return this.getStoredEvents();
  }

  public static getEventById(id: string): ManagedEvent | null {
    return this.getStoredEvents().find((e) => e.id === id) || null;
  }

  public static getEventsByProvider(providerId: string): ManagedEvent[] {
    return this.getStoredEvents().filter((e) => e.providerId === providerId);
  }

  public static createEvent(
    data: Partial<ManagedEvent>,
    providerId?: string,
    organizerName?: string,
    status: EventApprovalStatus = 'Draft'
  ): { success: boolean; event?: ManagedEvent; error?: string } {
    if (!data.name || data.name.trim().length < 4) {
      return { success: false, error: 'Event title must be at least 4 characters long.' };
    }
    if (!data.destinationName) {
      return { success: false, error: 'Please specify the host city/destination.' };
    }
    if (!data.startDate) {
      return { success: false, error: 'Event start date is required.' };
    }

    const all = this.getStoredEvents();
    const id = `evt_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

    const newEvent: ManagedEvent = {
      id,
      name: data.name.trim(),
      eventName: data.name.trim(),
      destinationName: data.destinationName.trim(),
      city: data.destinationName.trim(),
      state: data.state || 'India',
      category: data.category || 'Cultural Fair',
      description: data.description?.trim() || 'Curated Indian cultural gathering.',
      imageUrl:
        data.imageUrl ||
        'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80',
      galleryImages: data.galleryImages || [],
      startDateApprox: data.startDate,
      endDateApprox: data.endDate || data.startDate,
      startDate: data.startDate,
      endDate: data.endDate || data.startDate,
      startTime: data.startTime || '10:00 AM',
      endTime: data.endTime || '08:00 PM',
      time: `${data.startTime || '10:00 AM'} – ${data.endTime || '08:00 PM'}`,
      organizer: organizerName || data.organizer || 'Registered Regional Host',
      dateUncertain: false,
      ticketInfo: {
        type: (data.ticketPriceInr || 0) > 0 ? 'Paid Entry Ticket' : 'Free Entry Pass',
        priceInr: data.ticketPriceInr || 0,
        isFree: (data.ticketPriceInr || 0) === 0,
        bookingStatus: (data.ticketPriceInr || 0) > 0 ? 'Paid Tickets' : 'Free Entry',
      },
      verificationStatus: 'Verified',
      dataClassification: DataClassification.SCHEDULED,
      source: {
        sourceName: organizerName || 'Bharat Yatra Event Guild',
        lastUpdated: new Date().toISOString().split('T')[0],
      },
      highlights: data.highlights || ['Live folk performances', 'Local artisan stalls'],
      providerId,
      approvalStatus: status,
      capacity: data.capacity || 200,
      registeredCount: 0,
      ticketPriceInr: data.ticketPriceInr || 0,
      isFamilyFriendly: data.isFamilyFriendly ?? true,
      isCultural: data.isCultural ?? true,
      isFestival: data.isFestival ?? false,
      isMusic: data.isMusic ?? false,
      isFood: data.isFood ?? false,
      isAdventure: data.isAdventure ?? false,
      isEducational: data.isEducational ?? true,
    };

    const updated = [newEvent, ...all];
    this.saveEvents(updated);

    if (status === 'Pending Approval') {
      NotificationService.addNotification({
        userId: 'all',
        roleTarget: 'ADMIN',
        type: 'system_alert',
        title: 'New Event Awaiting Approval',
        message: `Event "${newEvent.name}" in ${newEvent.destinationName} submitted for review.`,
        actionTab: 'admin_dashboard',
      });
    }

    return { success: true, event: newEvent };
  }

  public static updateEvent(id: string, updates: Partial<ManagedEvent>): ManagedEvent | null {
    const all = this.getStoredEvents();
    const index = all.findIndex((e) => e.id === id);
    if (index === -1) return null;

    const updated = {
      ...all[index],
      ...updates,
    };
    all[index] = updated;
    this.saveEvents(all);
    return updated;
  }

  public static setApprovalStatus(
    id: string,
    status: EventApprovalStatus
  ): ManagedEvent | null {
    const all = this.getStoredEvents();
    const index = all.findIndex((e) => e.id === id);
    if (index === -1) return null;

    const evt = all[index];
    const updated: ManagedEvent = {
      ...evt,
      approvalStatus: status,
    };
    all[index] = updated;
    this.saveEvents(all);

    if (evt.providerId) {
      NotificationService.addNotification({
        userId: evt.providerId,
        roleTarget: 'PROVIDER',
        type: status === 'Published' ? 'provider_approval' : 'system_alert',
        title: `Event Status Updated: ${status}`,
        message: `Your event "${evt.name}" status has been set to ${status}.`,
        actionTab: 'provider_dashboard',
      });
    }

    return updated;
  }

  public static cancelEvent(id: string, reason?: string): ManagedEvent | null {
    return this.setApprovalStatus(id, 'Cancelled');
  }
}
