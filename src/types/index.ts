/**
 * Bharat Yatra — Core Data Types & Enums
 * Architecture strictly follows Section 6 & 7 of the specification.
 */

export enum DataClassification {
  VERIFIED = 'VERIFIED',
  USER_GENERATED = 'USER_GENERATED',
  AI_GENERATED = 'AI_GENERATED',
  EXTERNAL_PROVIDER = 'EXTERNAL_PROVIDER',
  LIVE = 'LIVE',
  SCHEDULED = 'SCHEDULED',
  ESTIMATED = 'ESTIMATED',
  STALE = 'STALE',
  UNAVAILABLE = 'UNAVAILABLE',
  MOCK_DEVELOPMENT_ONLY = 'MOCK_DEVELOPMENT_ONLY',
}

export enum UserRole {
  TRAVELER = 'TRAVELER',
  PROVIDER = 'PROVIDER',
  PROVIDER_STAFF = 'PROVIDER_STAFF',
  MODERATOR = 'MODERATOR',
  SUPPORT_AGENT = 'SUPPORT_AGENT',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export type Permission =
  | 'view_content'
  | 'create_trip'
  | 'save_items'
  | 'post_review'
  | 'manage_provider_profile'
  | 'manage_experiences'
  | 'moderate_content'
  | 'view_analytics'
  | 'manage_users'
  | 'system_admin';

export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  resource: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  description: string;
}
