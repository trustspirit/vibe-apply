/**
 * Form-related constants and options used across the application
 */

import { Gender } from '@vibe-apply/shared';

export interface GenderOption {
  value: string;
  label: string;
  disabled?: boolean;
}

// Gender options for form select fields
export const GENDER_OPTIONS: GenderOption[] = [
  { value: '', label: 'Select gender', disabled: true },
  { value: Gender.MALE, label: 'Male' },
  { value: Gender.FEMALE, label: 'Female' },
];

// Confirmation messages
export const CONFIRMATION_MESSAGES = {
  DELETE_RECOMMENDATION: 'Are you sure you want to delete this recommendation? This action cannot be undone.',
  CANCEL_SUBMISSION: 'Cancel submission and move this recommendation back to draft? You can edit and resubmit it later.',
  DELETE_APPLICATION: 'Are you sure you want to delete this application? This action cannot be undone.',
} as const;
