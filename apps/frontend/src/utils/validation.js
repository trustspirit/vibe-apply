export const validateEmail = (email) => {
  const trimmed = email.trim();
  if (!trimmed) {
    return 'Email is required.';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return 'Enter a valid email address.';
  }
  return '';
};

export const validateAge = (age) => {
  const normalizedAge = Number.parseInt(age, 10);
  if (Number.isNaN(normalizedAge)) {
    return 'Enter a valid age.';
  }
  if (normalizedAge < 16 || normalizedAge > 120) {
    return 'Age must be between 16 and 120.';
  }
  return '';
};

export const validateRequired = (value, fieldName) => {
  if (!value.trim()) {
    return `${fieldName} is required.`;
  }
  return '';
};

export const validateGender = (gender) => {
  if (gender !== 'male' && gender !== 'female') {
    return 'Select male or female.';
  }
  return '';
};

export const validatePhone = (phone) => {
  if (!phone.trim()) {
    return 'Phone number is required.';
  }
  return '';
};

export const STATUS_DISPLAY = {
  draft: { label: 'Draft', tone: 'draft' },
  awaiting: { label: 'Submitted', tone: 'awaiting' },
  approved: { label: 'Reviewed', tone: 'reviewed' },
  rejected: { label: 'Reviewed', tone: 'rejected' },
  pending: { label: 'Pending', tone: 'awaiting' },
};

export const getStatusDisplay = (status) => {
  return STATUS_DISPLAY[status] || { label: status, tone: 'draft' };
};
