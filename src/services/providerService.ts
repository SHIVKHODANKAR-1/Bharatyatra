import { Provider, ProviderRegistrationFormData, ProviderVerificationStatus } from '../types/provider';
import { INITIAL_PROVIDERS } from '../data/providers';
import { DataClassification } from '../types/index';
import { NotificationService } from './notificationService';

const PROVIDERS_STORAGE_KEY = 'bharat_yatra_providers_v1';

export class ProviderService {
  private static getStoredProviders(): Provider[] {
    try {
      const data = localStorage.getItem(PROVIDERS_STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    return INITIAL_PROVIDERS;
  }

  private static saveProviders(list: Provider[]): void {
    try {
      localStorage.setItem(PROVIDERS_STORAGE_KEY, JSON.stringify(list));
    } catch {
      // ignore
    }
  }

  public static getAllProviders(): Provider[] {
    return this.getStoredProviders();
  }

  public static getProviderById(id: string): Provider | null {
    const list = this.getStoredProviders();
    return list.find((p) => p.id === id) || null;
  }

  public static getProviderByUserId(userId: string): Provider | null {
    const list = this.getStoredProviders();
    return list.find((p) => p.userId === userId) || null;
  }

  public static getVerifiedProviders(): Provider[] {
    return this.getStoredProviders().filter((p) => p.verificationStatus === 'Verified');
  }

  public static registerProvider(
    formData: ProviderRegistrationFormData,
    userId?: string
  ): { success: boolean; provider?: Provider; error?: string } {
    // Validations
    if (!formData.businessName || formData.businessName.trim().length < 3) {
      return { success: false, error: 'Business name must be at least 3 characters long.' };
    }
    if (!formData.ownerName || formData.ownerName.trim().length < 3) {
      return { success: false, error: 'Owner / representative name must be provided.' };
    }
    if (!formData.email || !formData.email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (!formData.phone || formData.phone.trim().length < 10) {
      return { success: false, error: 'Please enter a valid contact phone number with at least 10 digits.' };
    }
    if (!formData.city || !formData.state) {
      return { success: false, error: 'City and State are required for regional verification.' };
    }
    if (!formData.description || formData.description.trim().length < 20) {
      return { success: false, error: 'Please provide a clear description of your services (at least 20 characters).' };
    }

    const all = this.getStoredProviders();
    const id = `prov_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

    // Compute profile completion percentage
    let completion = 60;
    if (formData.servicesOffered && formData.servicesOffered.length > 0) completion += 10;
    if (formData.languagesSupported && formData.languagesSupported.length > 0) completion += 10;
    if (formData.accessibilityOptions && formData.accessibilityOptions.length > 0) completion += 10;
    if (formData.bankDetails?.accountHolderName || formData.bankDetails?.upiId) completion += 10;

    const newProvider: Provider = {
      id,
      userId: userId || `usr_${Date.now().toString(36)}`,
      businessName: formData.businessName.trim(),
      ownerName: formData.ownerName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      businessCategory: formData.businessCategory,
      businessAddress: formData.businessAddress.trim() || `${formData.city}, ${formData.state}`,
      city: formData.city.trim(),
      state: formData.state.trim(),
      description: formData.description.trim(),
      servicesOffered: formData.servicesOffered.length > 0 ? formData.servicesOffered : ['Heritage Guiding'],
      languagesSupported: formData.languagesSupported.length > 0 ? formData.languagesSupported : ['Hindi', 'English'],
      accessibilityOptions: formData.accessibilityOptions.length > 0 ? formData.accessibilityOptions : ['General assistance'],
      bankDetails: formData.bankDetails || {
        accountHolderName: formData.ownerName,
        payoutMethod: 'UPI',
        upiId: `${formData.phone.replace(/[^0-9]/g, '')}@upi`,
      },
      verificationStatus: 'Pending',
      rating: 5.0,
      reviewsCount: 0,
      profileCompletionPercentage: completion,
      licenseNumber: formData.licenseNumber || undefined,
      establishedYear: formData.establishedYear || new Date().getFullYear(),
      dataClassification: DataClassification.EXTERNAL_PROVIDER,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedList = [newProvider, ...all];
    this.saveProviders(updatedList);

    // Notification for admins & provider
    NotificationService.addNotification({
      userId: newProvider.id,
      roleTarget: 'PROVIDER',
      type: 'provider_approval',
      title: 'Application Submitted for Review',
      message: `Your registration for "${newProvider.businessName}" is received. Our state tourism desk will inspect documentation within 24-48 business hours.`,
      actionTab: 'provider_dashboard',
    });

    NotificationService.addNotification({
      userId: 'all',
      roleTarget: 'ADMIN',
      type: 'system_alert',
      title: 'New Provider Application Pending',
      message: `New provider "${newProvider.businessName}" (${newProvider.city}, ${newProvider.state}) submitted an onboarding application.`,
      actionTab: 'admin_dashboard',
    });

    return { success: true, provider: newProvider };
  }

  public static updateProvider(id: string, updates: Partial<Provider>): Provider | null {
    const all = this.getStoredProviders();
    const index = all.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const updated = {
      ...all[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    all[index] = updated;
    this.saveProviders(all);
    return updated;
  }

  public static setVerificationStatus(
    id: string,
    status: ProviderVerificationStatus,
    reason?: string
  ): Provider | null {
    const all = this.getStoredProviders();
    const index = all.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const provider = all[index];
    const updated: Provider = {
      ...provider,
      verificationStatus: status,
      rejectionReason: status === 'Rejected' ? reason || 'Incomplete documentation' : undefined,
      suspendedReason: status === 'Suspended' ? reason || 'Compliance review flagged' : undefined,
      dataClassification: status === 'Verified' ? DataClassification.VERIFIED : DataClassification.EXTERNAL_PROVIDER,
      updatedAt: new Date().toISOString(),
    };

    all[index] = updated;
    this.saveProviders(all);

    // Notify provider of status change
    NotificationService.addNotification({
      userId: provider.id,
      roleTarget: 'PROVIDER',
      type: status === 'Verified' ? 'provider_approval' : 'provider_rejection',
      title: status === 'Verified' ? 'Provider Account Verified' : `Status Updated: ${status}`,
      message:
        status === 'Verified'
          ? `Your business "${provider.businessName}" is now officially verified with Bharat Yatra Tourism Seal.`
          : `Verification status changed to ${status}. ${reason ? `Reason: ${reason}` : ''}`,
      actionTab: 'provider_dashboard',
    });

    return updated;
  }
}
