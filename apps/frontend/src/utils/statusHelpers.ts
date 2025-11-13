/**
 * Status normalization and mapping utilities
 */

import type { RecommendationStatus } from '@vibe-apply/shared';

/**
 * Normalizes recommendation status from 'submitted' to 'awaiting' for display
 */
export const normalizeRecommendationStatus = (status: RecommendationStatus): string => {
  if (status === 'submitted') {
    return 'awaiting';
  }
  return status;
};

/**
 * Remaps status back to recommendation status (awaiting -> submitted)
 */
export const remapStatusForRecommendation = (status: string): RecommendationStatus => {
  if (status === 'awaiting') {
    return 'submitted' as RecommendationStatus;
  }
  return status as RecommendationStatus;
};
