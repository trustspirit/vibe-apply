/**
 * Validation constants used across the application
 */

// Age validation
export const AGE_MIN = 16;
export const AGE_MAX = 120;
export const AGE_ERROR_MESSAGE = `Age must be between ${AGE_MIN} and ${AGE_MAX}.`;

// Password validation
export const PASSWORD_MIN_LENGTH = 6;
export const PASSWORD_MIN_LENGTH_ERROR = `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;

// Email validation
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const EMAIL_REQUIRED_ERROR = 'Email is required.';
export const EMAIL_INVALID_ERROR = 'Enter a valid email address.';

// Phone validation
export const PHONE_REQUIRED_ERROR = 'Phone number is required.';

// Gender validation
export const VALID_GENDERS = ['male', 'female'] as const;
export const GENDER_ERROR_MESSAGE = 'Select male or female.';

// Date utilities
export const resetTimeToMidnight = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};
