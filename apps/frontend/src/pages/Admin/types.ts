import type { Application, LeaderRecommendation } from '@vibe-apply/shared';
import type { ReviewItem, StatusOption, TabItem } from '@/types';

export interface UseAdminReviewDataOptions {
  applications: Application[];
  leaderRecommendations: LeaderRecommendation[];
  activeTab: string;
  showTodayOnly: boolean;
  todayTimestamp: number;
}

export interface UseAdminReviewStateOptions {
  locationState: { initialTab?: string; focus?: string } | null;
  tabs: TabItem[];
}

export interface UseAdminReviewHandlersOptions {
  reviewItems: ReviewItem[];
  selectedItem: ReviewItem | null;
  updateApplicationStatus: (id: string, status: string) => Promise<void>;
  updateLeaderRecommendationStatus: (
    id: string,
    status: string
  ) => Promise<void>;
  setStatusSelection: (status: string | null) => void;
  setSelectedId: (id: string | null) => void;
  approvedApplications: Application[];
}

export interface ReviewListItemProps {
  item: ReviewItem;
  isSelected: boolean;
  onSelect: (key: string) => void;
  getStatusLabel: (status: string) => string | undefined;
  getStakeDisplay: (stake: string) => string;
  getWardDisplay: (stake: string, ward: string) => string;
}

export interface ReviewDetailsProps {
  selectedItem: ReviewItem;
  statusSelection: string | null;
  statusOptions: StatusOption[];
  onStatusChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  getStakeDisplay: (stake: string) => string;
  getWardDisplay: (stake: string, ward: string) => string;
  t: (key: string, params?: Record<string, unknown>) => string;
}

export interface ReviewMobileCardProps {
  item: ReviewItem;
  statusOptions: StatusOption[];
  onStatusChange: (key: string, status: string) => void;
  getStakeDisplay: (stake: string) => string;
  getWardDisplay: (stake: string, ward: string) => string;
  t: (key: string, params?: Record<string, unknown>) => string;
}

export interface ReviewCommentsProps {
  comments: Array<{
    id: string;
    authorName: string;
    authorRole: string;
    content: string;
    createdAt: string;
  }>;
  className?: string;
}

