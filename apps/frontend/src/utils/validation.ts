import {
  AGE_MIN,
  AGE_MAX,
  AGE_ERROR_MESSAGE,
  EMAIL_REGEX,
  EMAIL_REQUIRED_ERROR,
  EMAIL_INVALID_ERROR,
  PHONE_REQUIRED_ERROR,
  VALID_GENDERS,
  GENDER_ERROR_MESSAGE,
} from './validationConstants';
import type { StatusDisplayItem } from '@/types/shared';

export const validateEmail = (email: string): string => {
  const trimmed = email.trim();
  if (!trimmed) {
    return EMAIL_REQUIRED_ERROR;
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return EMAIL_INVALID_ERROR;
  }
  return '';
};

export const validateAge = (age: string | number, t?: (key: string) => string): string => {
  const normalizedAge = Number.parseInt(String(age), 10);
  if (Number.isNaN(normalizedAge)) {
    return t ? t('validation.invalidAge') : 'Enter a valid age.';
  }
  if (normalizedAge < AGE_MIN || normalizedAge > AGE_MAX) {
    return AGE_ERROR_MESSAGE;
  }
  return '';
};

export const validateRequired = (value: string, fieldName: string, t?: (key: string, options?: { field?: string }) => string): string => {
  if (!value.trim()) {
    return t ? t('validation.requiredWithField', { field: fieldName }) : `${fieldName} is required.`;
  }
  return '';
};

export const validateGender = (gender: string): string => {
  if (!VALID_GENDERS.includes(gender as typeof VALID_GENDERS[number])) {
    return GENDER_ERROR_MESSAGE;
  }
  return '';
};

export const validatePhone = (phone: string): string => {
  if (!phone.trim()) {
    return PHONE_REQUIRED_ERROR;
  }
  return '';
};

export const STATUS_DISPLAY: Record<string, StatusDisplayItem> = {
  draft: { label: 'Draft', tone: 'draft' },
  awaiting: { label: 'Submitted', tone: 'awaiting' },
  approved: { label: 'Reviewed', tone: 'reviewed' },
  rejected: { label: 'Reviewed', tone: 'rejected' },
  pending: { label: 'Pending', tone: 'awaiting' },
};

export const getStatusDisplay = (status: string): StatusDisplayItem => {
  return STATUS_DISPLAY[status] || { label: status, tone: 'draft' };
};
