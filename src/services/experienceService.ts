import { Experience } from '../types/travel';
import { TravelInterest, BudgetTier } from '../types/auth';
import { INITIAL_EXPERIENCES } from '../data/experiences';
import { DataClassification } from '../types/index';
import { NotificationService } from './notificationService';

export type ExperienceLifecycleStatus =
  | 'Draft'
  | 'Pending Approval'
  | 'Published'
  | 'Rejected'
  | 'Unpublished';

export interface ManagedExperience extends Experience {
  providerId?: string;
  providerName?: string;
  lifecycleStatus?: ExperienceLifecycleStatus;
  capacity?: number;
  availableDates?: string[];
  languages?: string[];
  suitableGroupType?: string[];
  moderationNotes?: string;
  publishedAt?: string;
}

const EXPERIENCES_STORAGE_KEY = 'bharat_yatra_managed_experiences_v1';

export class ExperienceService {
  private static getStoredExperiences(): ManagedExperience[] {
    try {
      const data = localStorage.getItem(EXPERIENCES_STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    // Seed initial experiences as Published and attach sample providerIds
    const seeded: ManagedExperience[] = INITIAL_EXPERIENCES.map((exp, idx) => {
      let providerId = 'prov_varanasi_heritage';
      let providerName = 'Kashi Heritage Walks & Vedic Boat Guild';
      if (exp.destinationName === 'Jaipur') {
        providerId = 'prov_jaipur_royal';
        providerName = 'Pink City Artisan Trails & Royal Haveli Collective';
      } else if (exp.destinationName === 'Hampi') {
        providerId = 'prov_hampi_boulders';
        providerName = 'Vijayanagara Cyclers & Heritage Explorers';
      } else if (exp.destinationName === 'Goa') {
        providerId = 'prov_goa_fado';
        providerName = 'Fontainhas Latin Quarter Walking & Fado Guild';
      }

      return {
        ...exp,
        providerId,
        providerName,
        lifecycleStatus: 'Published',
        capacity: 15 + (idx % 10),
        languages: ['Hindi', 'English'],
        suitableGroupType: ['Solo', 'Couples', 'Family', 'Friends'],
      };
    });
    return seeded;
  }

  private static saveExperiences(list: ManagedExperience[]): void {
    try {
      localStorage.setItem(EXPERIENCES_STORAGE_KEY, JSON.stringify(list));
    } catch {
      // ignore
    }
  }

  /**
   * Only returns experiences with 'Published' status for public traveler browsing
   */
  public static getPublishedExperiences(): ManagedExperience[] {
    return this.getStoredExperiences().filter(
      (e) => !e.lifecycleStatus || e.lifecycleStatus === 'Published'
    );
  }

  public static getAllExperiences(): ManagedExperience[] {
    return this.getStoredExperiences();
  }

  public static getExperienceById(id: string): ManagedExperience | null {
    return this.getStoredExperiences().find((e) => e.id === id) || null;
  }

  public static getExperiencesByProvider(providerId: string): ManagedExperience[] {
    return this.getStoredExperiences().filter((e) => e.providerId === providerId);
  }

  public static createExperience(
    data: Partial<ManagedExperience>,
    providerId?: string,
    providerName?: string,
    status: ExperienceLifecycleStatus = 'Draft'
  ): { success: boolean; experience?: ManagedExperience; error?: string } {
    if (!data.title || data.title.trim().length < 5) {
      return { success: false, error: 'Experience title must be at least 5 characters.' };
    }
    if (!data.destinationName) {
      return { success: false, error: 'Please specify the destination or city.' };
    }
    if (!data.description || data.description.trim().length < 20) {
      return { success: false, error: 'Description must be at least 20 characters.' };
    }
    if (typeof data.approxPriceInr !== 'number' || data.approxPriceInr < 0) {
      return { success: false, error: 'Please specify a valid price (or 0 for free).' };
    }

    const all = this.getStoredExperiences();
    const id = `exp_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

    const newExp: ManagedExperience = {
      id,
      title: data.title.trim(),
      experienceType: data.experienceType || 'Sightseeing',
      destinationId: data.destinationId || `dest_${data.destinationName.toLowerCase()}`,
      destinationName: data.destinationName.trim(),
      category: (data.category as TravelInterest) || 'heritage',
      description: data.description.trim(),
      imageUrl:
        data.imageUrl ||
        'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80',
      galleryImages: data.galleryImages || [],
      durationMinutes: data.durationMinutes || 120,
      approxPriceInr: data.approxPriceInr,
      budgetTier:
        data.approxPriceInr <= 500
          ? 'budget'
          : data.approxPriceInr <= 2500
          ? 'moderate'
          : data.approxPriceInr <= 7000
          ? 'premium'
          : 'luxury',
      location: data.location || {
        city: data.destinationName,
        state: 'India',
        latitude: 21.1458,
        longitude: 79.0882,
        address: data.meetingPoint || data.destinationName,
      },
      timingDetails: data.timingDetails || '09:00 AM – 12:00 PM',
      intensity: data.intensity || 'Easy',
      ageSuitability: data.ageSuitability || 'All age groups welcome',
      accessibilityStatus: data.accessibilityStatus || 'Accessible routes available on request',
      meetingPoint: data.meetingPoint || 'Central Landmark / City Center',
      cancellationPolicy:
        data.cancellationPolicy || 'Free cancellation up to 24 hours before activity time.',
      includedItems: data.includedItems || ['Guided walk', 'Informational commentary'],
      excludedItems: data.excludedItems || ['Personal purchases', 'Transport to venue'],
      whatToExpect: data.whatToExpect || ['Historical storytelling', 'Local cultural interaction'],
      requirements: data.requirements || ['Comfortable walking footwear', 'Drinking water'],
      dataClassification: DataClassification.EXTERNAL_PROVIDER,
      source: {
        sourceName: providerName || 'Verified Regional Partner',
        lastUpdated: new Date().toISOString().split('T')[0],
      },
      providerId,
      providerName,
      lifecycleStatus: status,
      capacity: data.capacity || 20,
      languages: data.languages || ['Hindi', 'English'],
      suitableGroupType: data.suitableGroupType || ['Solo', 'Couples', 'Family', 'Friends'],
    };

    const updatedList = [newExp, ...all];
    this.saveExperiences(updatedList);

    if (status === 'Pending Approval') {
      NotificationService.addNotification({
        userId: 'all',
        roleTarget: 'ADMIN',
        type: 'system_alert',
        title: 'New Experience Awaiting Review',
        message: `Experience "${newExp.title}" submitted by ${providerName || 'Provider'}.`,
        actionTab: 'admin_dashboard',
      });
    }

    return { success: true, experience: newExp };
  }

  public static updateExperience(
    id: string,
    updates: Partial<ManagedExperience>
  ): ManagedExperience | null {
    const all = this.getStoredExperiences();
    const index = all.findIndex((e) => e.id === id);
    if (index === -1) return null;

    const updated = {
      ...all[index],
      ...updates,
      source: {
        ...all[index].source,
        lastUpdated: new Date().toISOString().split('T')[0],
      },
    };
    all[index] = updated;
    this.saveExperiences(all);
    return updated;
  }

  public static setLifecycleStatus(
    id: string,
    status: ExperienceLifecycleStatus,
    notes?: string
  ): ManagedExperience | null {
    const all = this.getStoredExperiences();
    const index = all.findIndex((e) => e.id === id);
    if (index === -1) return null;

    const exp = all[index];
    const updated: ManagedExperience = {
      ...exp,
      lifecycleStatus: status,
      moderationNotes: notes || exp.moderationNotes,
      publishedAt: status === 'Published' ? new Date().toISOString() : exp.publishedAt,
      dataClassification:
        status === 'Published' ? DataClassification.VERIFIED : DataClassification.EXTERNAL_PROVIDER,
    };
    all[index] = updated;
    this.saveExperiences(all);

    if (exp.providerId) {
      NotificationService.addNotification({
        userId: exp.providerId,
        roleTarget: 'PROVIDER',
        type: status === 'Published' ? 'provider_approval' : 'system_alert',
        title: `Experience Status: ${status}`,
        message: `Your experience "${exp.title}" is now ${status}. ${notes ? `Notes: ${notes}` : ''}`,
        actionTab: 'provider_dashboard',
      });
    }

    return updated;
  }

  public static deleteExperience(id: string): boolean {
    const all = this.getStoredExperiences();
    const filtered = all.filter((e) => e.id !== id);
    if (filtered.length === all.length) return false;
    this.saveExperiences(filtered);
    return true;
  }
}
