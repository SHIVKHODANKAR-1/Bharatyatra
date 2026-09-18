import { DataClassification } from './index';

export type ProviderVerificationStatus =
  | 'Pending'
  | 'Under Review'
  | 'Verified'
  | 'Rejected'
  | 'Suspended';

export type BusinessCategory =
  | 'Heritage Tours & Walks'
  | 'Adventure & Trekking'
  | 'Culinary & Cooking'
  | 'Spiritual & Pilgrimage'
  | 'Homestays & Stays'
  | 'Cultural Workshops & Arts'
  | 'Transport & Local Guiding'
  | 'Wildlife Safaris';

export interface ProviderBankDetails {
  accountHolderName?: string;
  bankName?: string;
  accountNumberMasked?: string;
  ifscCode?: string;
  payoutMethod?: 'NEFT/RTGS' | 'UPI' | 'Direct Transfer';
  upiId?: string;
}

export interface Provider {
  id: string;
  userId?: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  businessCategory: BusinessCategory;
  businessAddress: string;
  city: string;
  state: string;
  description: string;
  servicesOffered: string[];
  languagesSupported: string[];
  accessibilityOptions: string[];
  bankDetails: ProviderBankDetails;
  verificationStatus: ProviderVerificationStatus;
  rejectionReason?: string;
  suspendedReason?: string;
  rating: number;
  reviewsCount: number;
  profileCompletionPercentage: number;
  website?: string;
  establishedYear?: number;
  licenseNumber?: string;
  dataClassification: DataClassification;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderRegistrationFormData {
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  businessCategory: BusinessCategory;
  businessAddress: string;
  city: string;
  state: string;
  description: string;
  servicesOffered: string[];
  languagesSupported: string[];
  accessibilityOptions: string[];
  bankDetails?: ProviderBankDetails;
  licenseNumber?: string;
  establishedYear?: number;
}
