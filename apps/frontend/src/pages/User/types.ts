import type { ApplicationStatus } from '@vibe-apply/shared';

export interface ApplicationForm {
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

export interface ValidationErrors {
  [key: string]: string;
}

export interface UseApplicationFormOptions {
  currentUser: {
    id: string;
    name?: string;
    email?: string;
    stake?: string;
    ward?: string;
  } | null;
  existingApplication:
    | {
        name: string;
        age?: number | null;
        email: string;
        phone: string;
        gender?: string;
        stake: string;
        ward: string;
        moreInfo?: string;
        servedMission?: boolean;
        status: ApplicationStatus;
      }
    | undefined;
  isInitializing: boolean;
  t: (key: string) => string;
}

export interface ApplicationOverviewProps {
  application: {
    name: string;
    age?: number | null;
    email: string;
    phone: string;
    stake: string;
    ward: string;
    moreInfo?: string;
    servedMission?: boolean;
    status: ApplicationStatus;
  };
  isEditable: boolean;
  onEdit: () => void;
}
