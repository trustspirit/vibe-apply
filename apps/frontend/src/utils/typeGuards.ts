/**
 * Type guards for runtime type checking with TypeScript
 */

import type { Application, LeaderRecommendation } from '@vibe-apply/shared';
import { RecommendationStatus, Gender } from '@vibe-apply/shared';
import type { CombinedItem, ExtendedApplication, ExtendedRecommendation } from '@/types/shared';
import { ITEM_TYPES } from '@/utils/constants';

/**
 * Type guard to check if an item is an Application
 */
export function isApplication(item: CombinedItem | Application | LeaderRecommendation): item is ExtendedApplication | Application {
  return 'isApplication' in item ? item.isApplication === true : !('status' in item && (item.status === RecommendationStatus.DRAFT || item.status === RecommendationStatus.SUBMITTED));
}

/**
 * Type guard to check if an item is a LeaderRecommendation
 */
export function isRecommendation(item: CombinedItem | Application | LeaderRecommendation): item is ExtendedRecommendation | LeaderRecommendation {
  return !isApplication(item);
}

/**
 * Type guard to check if an item is an ExtendedApplication (with itemType discriminator)
 */
export function isExtendedApplication(item: CombinedItem): item is ExtendedApplication {
  return item.itemType === ITEM_TYPES.APPLICATION;
}

/**
 * Type guard to check if an item is an ExtendedRecommendation (with itemType discriminator)
 */
export function isExtendedRecommendation(item: CombinedItem): item is ExtendedRecommendation {
  return item.itemType === ITEM_TYPES.RECOMMENDATION;
}

/**
 * Type guard to check if a value is a valid status
 */
export function isValidStatus(status: string): status is 'draft' | 'awaiting' | 'submitted' | 'approved' | 'rejected' | 'pending' {
  return ['draft', 'awaiting', 'submitted', 'approved', 'rejected', 'pending'].includes(status);
}

/**
 * Type guard to check if a value is a valid gender
 */
export function isValidGender(gender: string): gender is 'male' | 'female' {
  return gender === Gender.MALE || gender === Gender.FEMALE;
}
