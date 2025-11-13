export const validateEmail = (email: string): string => {
  const trimmed = email.trim();
  if (!trimmed) {
    return 'Email is required.';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return 'Enter a valid email address.';
  }
  return '';
};

export const validateAge = (age: string | number): string => {
  const normalizedAge = Number.parseInt(String(age), 10);
  if (Number.isNaN(normalizedAge)) {
    return 'Enter a valid age.';
  }
  if (normalizedAge < 16 || normalizedAge > 120) {
    return 'Age must be between 16 and 120.';
  }
  return '';
};

export const validateRequired = (value: string, fieldName: string): string => {
  if (!value.trim()) {
    return `${fieldName} is required.`;
  }
  return '';
};

export const validateGender = (gender: string): string => {
  if (gender !== 'male' && gender !== 'female') {
    return 'Select male or female.';
  }
  return '';
};

export const validatePhone = (phone: string): string => {
  if (!phone.trim()) {
    return 'Phone number is required.';
  }
  return '';
};

type StatusTone = 'draft' | 'awaiting' | 'reviewed' | 'rejected';

interface StatusDisplayItem {
  label: string;
  tone: StatusTone;
}

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
