import type { Application, LeaderRecommendation } from '@vibe-apply/shared';

export interface RecommendationFormData {
  id: string | null;
  name: string;
  age: string;
  email: string;
  phone: string;
  gender: string;
  stake: string;
  ward: string;
  moreInfo: string;
  servedMission: boolean;
}

export interface ExtendedRecommendation extends LeaderRecommendation {
  hasApplication?: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export interface ExtendedApplication extends Application {
  isApplication: boolean;
  hasRecommendation?: boolean;
}

export type CombinedItem = ExtendedRecommendation | ExtendedApplication;

export interface ValidationErrors {
  name?: string;
  age?: string;
  email?: string;
  phone?: string;
  gender?: string;
  stake?: string;
  ward?: string;
  servedMission?: string;
  moreInfo?: string;
}

