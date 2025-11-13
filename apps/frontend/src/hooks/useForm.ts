/**
 * Custom hook for managing form state
 */

import { useState, useCallback, type ChangeEvent } from 'react';

export interface UseFormOptions<T> {
  initialValues: T;
  onSubmit?: (values: T) => void | Promise<void>;
}

export interface UseFormReturn<T> {
  values: T;
  handleChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  setValues: React.Dispatch<React.SetStateAction<T>>;
  setFieldValue: (field: keyof T, value: string | number) => void;
  resetForm: () => void;
  isDirty: boolean;
  isSubmitting: boolean;
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * Hook for managing form state and common form operations
 *
 * @example
 * const { values, handleChange, handleSubmit } = useForm({
 *   initialValues: { email: '', password: '' },
 *   onSubmit: async (values) => {
 *     await login(values);
 *   }
 * });
 */
export function useForm<T extends Record<string, any>>({
  initialValues,
  onSubmit,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setIsDirty(true);
  }, []);

  const setFieldValue = useCallback((field: keyof T, value: string | number) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  }, []);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setIsDirty(false);
    setIsSubmitting(false);
  }, [initialValues]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (onSubmit) {
        setIsSubmitting(true);
        try {
          await onSubmit(values);
        } finally {
          setIsSubmitting(false);
        }
      }
    },
    [onSubmit, values]
  );

  return {
    values,
    handleChange,
    handleSubmit,
    setValues,
    setFieldValue,
    resetForm,
    isDirty,
    isSubmitting,
    setIsSubmitting,
  };
}
