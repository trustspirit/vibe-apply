import type { Application, LeaderRecommendation } from '@vibe-apply/shared';
import { RecommendationStatus } from '@vibe-apply/shared';
import type React from 'react';
import type { ChangeEvent, FormEvent } from 'react';

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

export interface UseRecommendationFormOptions {
  currentFormId: string | null | undefined;
  currentUser: {
    id: string;
    stake?: string;
    ward?: string;
    role?: string;
  } | null;
  recommendations: Array<{ id: string; [key: string]: any }>;
  t: (key: string) => string;
}

export interface UseRecommendationDataOptions {
  recommendations: Array<{
    id: string;
    leaderId?: string;
    linkedApplicationId?: string;
    email: string;
    name: string;
    stake: string;
    ward: string;
    status: RecommendationStatus;
    updatedAt: string;
    createdAt: string;
    [key: string]: any;
  }>;
  applications: Application[];
  currentUser: { id: string; stake?: string } | null;
  activeTab: string;
  selectedId: string | null;
  currentFormId: string | null | undefined;
}

export interface UseRecommendationHandlersOptions {
  leaderId: string | null;
  recommendations: Array<{
    id: string;
    status: RecommendationStatus;
    [key: string]: any;
  }>;
  combinedItems: CombinedItem[];
  form: RecommendationFormData;
  validateForm: () => {
    nextErrors: Record<string, string>;
    normalizedAge: number;
    trimmedName: string;
    trimmedEmail: string;
    trimmedPhone: string;
    trimmedStake: string;
    trimmedWard: string;
    normalizedGender: string;
  };
  submitLeaderRecommendation: (
    leaderId: string,
    data: {
      id: string | null;
      name: string;
      age: number | null;
      email: string;
      phone: string;
      gender: string;
      stake: string;
      ward: string;
      moreInfo: string;
      servedMission: boolean;
      status?: RecommendationStatus;
    }
  ) => Promise<{ id: string } | undefined>;
  deleteLeaderRecommendation: (
    leaderId: string,
    recommendationId: string
  ) => Promise<void>;
  refetchRecommendations: () => Promise<void>;
  refetchApplications: () => Promise<void>;
  setCurrentFormId: (id: string | null | undefined) => void;
  setSelectedId: (id: string | null) => void;
  setEditingOriginStatus: (status: RecommendationStatus | null) => void;
  setErrors: (
    errors:
      | Record<string, string>
      | ((prev: Record<string, string>) => Record<string, string>)
  ) => void;
  setFormError: (error: string) => void;
  setFeedback: (feedback: string) => void;
  currentFormId: string | null | undefined;
  selectedId: string | null;
  t: (key: string, params?: any) => string;
}

export interface RecommendationDetailsProps {
  selectedItem: CombinedItem | null;
  isEditing: boolean;
  currentUserId?: string | null;
  getStatusLabel: (status: string, isApplication: boolean) => string | undefined;
  onRecommendApplicant: (application: Application) => void;
  onModify: (id: string) => void;
  onQuickSubmit: (id: string) => void;
  onCancelSubmission: (id: string) => void;
  onDelete: (id: string) => void;
  onError: (error: string) => void;
  renderForm: () => React.ReactElement;
}

export interface RecommendationFormProps {
  form: RecommendationFormData;
  errors: ValidationErrors;
  formError: string;
  editingOriginStatus: RecommendationStatus | null;
  variant?: 'desktop' | 'mobile';
  currentUserRole?: string;
  onFormChange: (
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  onStakeChange: (stake: string) => void;
  onWardChange: (ward: string) => void;
  onServedMissionChange: (value: boolean) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onSaveDraft: () => void;
  onCancel: () => void;
}

export interface RecommendationMobileCardProps {
  item: CombinedItem;
  isEditingThis: boolean;
  currentFormId: string | null | undefined;
  getStatusLabel: (
    status: string,
    isApplication: boolean
  ) => string | undefined;
  onRecommendApplicant: (application: Application) => void;
  onModify: (id: string) => void;
  onQuickSubmit: (id: string) => void;
  onCancelSubmission: (id: string) => void;
  onDelete: (id: string) => void;
}

export interface RecommendationListItemProps {
  item: CombinedItem;
  isSelected: boolean;
  isActive: boolean;
  onSelect: (id: string) => void;
  getStatusLabel: (status: string, isApplication: boolean) => string | undefined;
}

export interface RecommendationCommentsProps {
  recommendationId: string;
  currentUserId?: string;
  onError: (error: string) => void;
}

