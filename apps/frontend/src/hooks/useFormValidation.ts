/**
 * Custom hook for managing form validation state and errors
 */

import { useState, useCallback } from 'react';
import type { ValidationErrors } from '@/types/shared';

export interface UseFormValidationReturn {
  errors: ValidationErrors;
  setErrors: React.Dispatch<React.SetStateAction<ValidationErrors>>;
  setFieldError: (field: string, error: string) => void;
  clearFieldError: (field: string) => void;
  clearAllErrors: () => void;
  hasErrors: boolean;
  getFieldError: (field: string) => string | undefined;
}

/**
 * Hook for managing form validation errors
 *
 * @example
 * const { errors, setFieldError, clearFieldError, hasErrors } = useFormValidation();
 *
 * // Set an error
 * setFieldError('email', 'Email is required');
 *
 * // Clear an error
 * clearFieldError('email');
 *
 * // Check if form has errors
 * if (hasErrors) {
 *   return;
 * }
 */
export function useFormValidation(): UseFormValidationReturn {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const setFieldError = useCallback((field: string, error: string) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  const getFieldError = useCallback(
    (field: string) => errors[field],
    [errors]
  );

  const hasErrors = Object.keys(errors).length > 0;

  return {
    errors,
    setErrors,
    setFieldError,
    clearFieldError,
    clearAllErrors,
    hasErrors,
    getFieldError,
  };
}

/**
 * Hook for managing form-level feedback messages (success/error)
 */
export interface UseFormFeedbackReturn {
  feedback: string;
  feedbackType: 'success' | 'error' | null;
  setFeedback: (message: string, type: 'success' | 'error') => void;
  clearFeedback: () => void;
}

export function useFormFeedback(): UseFormFeedbackReturn {
  const [feedback, setFeedbackState] = useState('');
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | null>(null);

  const setFeedback = useCallback((message: string, type: 'success' | 'error') => {
    setFeedbackState(message);
    setFeedbackType(type);
  }, []);

  const clearFeedback = useCallback(() => {
    setFeedbackState('');
    setFeedbackType(null);
  }, []);

  return {
    feedback,
    feedbackType,
    setFeedback,
    clearFeedback,
  };
}
