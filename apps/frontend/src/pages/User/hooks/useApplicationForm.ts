import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import { ApplicationStatus } from '@vibe-apply/shared';
import { useApp } from '@/context/AppContext';
import { applicationsApi } from '@/services/api';
import {
  validateEmail,
  validateAge,
  validateRequired,
  validateGender,
  validatePhone,
} from '@/utils/validation';
import { formatPhoneNumber } from '@/utils/phoneFormatter';
import type {
  ApplicationForm,
  ValidationErrors,
  UseApplicationFormOptions,
} from '../types';

const emptyForm: ApplicationForm = {
  name: '',
  age: '',
  email: '',
  phone: '',
  gender: '',
  stake: '',
  ward: '',
  moreInfo: '',
  servedMission: false,
};

export const useApplicationForm = ({
  currentUser,
  existingApplication,
  isInitializing,
  t,
}: UseApplicationFormOptions) => {
  const { submitApplication, refetchApplications } = useApp();
  const [form, setForm] = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [formError, setFormError] = useState('');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [hasRecommendation, setHasRecommendation] = useState(false);
  const [isCheckingRecommendation, setIsCheckingRecommendation] =
    useState(true);

  useEffect(() => {
    const checkRecommendation = async () => {
      if (isInitializing || !currentUser || existingApplication) {
        setIsCheckingRecommendation(false);
        return;
      }

      try {
        const result = await applicationsApi.checkRecommendation();
        setHasRecommendation(result.hasRecommendation);
      } catch {
        setHasRecommendation(false);
      } finally {
        setIsCheckingRecommendation(false);
      }
    };

    checkRecommendation();
  }, [isInitializing, currentUser, existingApplication]);

  useEffect(() => {
    if (isInitializing || !currentUser) {
      return;
    }

    if (existingApplication) {
      setForm({
        name: existingApplication.name,
        age: existingApplication.age?.toString() ?? '',
        email: existingApplication.email,
        phone: existingApplication.phone,
        gender:
          existingApplication.gender === 'male' ||
          existingApplication.gender === 'female'
            ? existingApplication.gender
            : '',
        stake: existingApplication.stake,
        ward: existingApplication.ward,
        moreInfo: existingApplication.moreInfo ?? '',
        servedMission: existingApplication.servedMission ?? false,
      });
      setIsEditing(existingApplication.status === ApplicationStatus.DRAFT);
    } else if (currentUser) {
      setForm((prev) => ({
        ...prev,
        name: currentUser.name || '',
        email: currentUser.email || '',
        stake: currentUser.stake || '',
        ward: currentUser.ward || '',
      }));
      setIsEditing(true);
    }
  }, [existingApplication, currentUser, isInitializing]);

  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;
    const formattedValue = name === 'phone' ? formatPhoneNumber(value) : value;
    setForm((prev) => ({ ...prev, [name]: formattedValue }));
    setErrors((prev) => {
      if (!prev[name]) {
        return prev;
      }
      const next = { ...prev };
      delete next[name];
      return next;
    });
    if (formError) {
      setFormError('');
    }
    if (feedback) {
      setFeedback('');
    }
  };

  const validateForm = () => {
    const validationErrors: ValidationErrors = {};
    const trimmedName = form.name.trim();
    const trimmedEmail = form.email.trim();
    const trimmedPhone = form.phone.trim();
    const trimmedStake = form.stake.trim();
    const trimmedWard = form.ward.trim();
    const normalizedGender =
      form.gender === 'male' || form.gender === 'female' ? form.gender : '';
    const normalizedAge = Number.parseInt(form.age, 10);

    const nameError = validateRequired(
      form.name,
      t('application.form.name'),
      t
    );
    if (nameError) {
      validationErrors.name = nameError;
    }

    const ageError = validateAge(form.age, t);
    if (ageError) {
      validationErrors.age = ageError;
    }

    const emailError = validateEmail(form.email);
    if (emailError) {
      validationErrors.email = emailError;
    }

    const phoneError = validatePhone(form.phone);
    if (phoneError) {
      validationErrors.phone = phoneError;
    }

    const stakeError = validateRequired(form.stake, t('common.stake'), t);
    if (stakeError) {
      validationErrors.stake = stakeError;
    }

    const wardError = validateRequired(form.ward, t('common.ward'), t);
    if (wardError) {
      validationErrors.ward = wardError;
    }

    const genderError = validateGender(form.gender);
    if (genderError) {
      validationErrors.gender = genderError;
    }

    return {
      validationErrors,
      normalizedAge,
      trimmedName,
      trimmedEmail,
      trimmedPhone,
      trimmedStake,
      trimmedWard,
      normalizedGender,
    };
  };

  const handleSubmitApplication = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    if (!currentUser) {
      return;
    }

    setFeedback('');
    setFormError('');

    const {
      validationErrors,
      normalizedAge,
      trimmedName,
      trimmedEmail,
      trimmedPhone,
      trimmedStake,
      trimmedWard,
      normalizedGender,
    } = validateForm();

    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      setFormError(t('application.messages.fixFields'));
      return;
    }

    try {
      await submitApplication(currentUser.id, {
        name: trimmedName,
        age: normalizedAge,
        email: trimmedEmail,
        phone: trimmedPhone,
        gender: normalizedGender,
        stake: trimmedStake,
        ward: trimmedWard,
        moreInfo: form.moreInfo.trim(),
        servedMission: form.servedMission,
      });
      setErrors({});
      setFeedback(t('application.messages.submitted'));
      setIsEditing(false);
      await refetchApplications();
    } catch (error) {
      setFormError(
        (error as Error).message || t('application.messages.failedToSubmit')
      );
    }
  };

  const handleSaveDraft = async () => {
    if (!currentUser) {
      return;
    }

    setFeedback('');
    setFormError('');
    setErrors({});

    const normalizedAge = Number.parseInt(form.age, 10);

    try {
      await submitApplication(currentUser.id, {
        name: form.name.trim(),
        age: Number.isNaN(normalizedAge) ? null : normalizedAge,
        email: form.email.trim(),
        phone: form.phone.trim(),
        gender:
          form.gender === 'male' || form.gender === 'female' ? form.gender : '',
        stake: form.stake.trim(),
        ward: form.ward.trim(),
        moreInfo: form.moreInfo.trim(),
        servedMission: form.servedMission,
      });
      setFeedback(t('application.messages.draftSavedWithSubmitReminder'));
    } catch (error) {
      setFormError(
        (error as Error).message || t('application.messages.failedToSave')
      );
    }
  };

  return {
    form,
    setForm,
    isEditing,
    setIsEditing,
    feedback,
    formError,
    errors,
    hasRecommendation,
    isCheckingRecommendation,
    handleChange,
    handleSubmitApplication,
    handleSaveDraft,
  };
};
