/**
 * Shared types used across the application
 */

import type {
  Application,
  LeaderRecommendation,
  RecommendationComment,
} from '@vibe-apply/shared';

// Form-related types
export interface ValidationErrors {
  [key: string]: string;
}

export interface TabItem {
  id: string;
  label: string;
}

// Discriminated union types for better type safety
export interface ExtendedApplication extends Application {
  itemType: 'application';
  isApplication: true;
}

export interface ExtendedRecommendation extends LeaderRecommendation {
  itemType: 'recommendation';
  hasApplication?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

export type CombinedItem = ExtendedApplication | ExtendedRecommendation;

// Review item type for admin review
export interface ReviewItem {
  key: string;
  type: 'application' | 'recommendation';
  entityId: string;
  status: string;
  rawStatus: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  gender: string;
  stake: string;
  ward: string;
  moreInfo: string;
  comments?: RecommendationComment[];
  createdAt: string;
  updatedAt: string;
  hasRecommendation?: boolean;
  recommendationId?: string;
  hasApplication?: boolean;
  applicationId?: string;
}

// Status-related types
export interface StatusOption {
  value: string;
  label: string;
}

export interface StatusDisplayItem {
  label: string;
  tone: 'draft' | 'awaiting' | 'reviewed' | 'rejected';
}
