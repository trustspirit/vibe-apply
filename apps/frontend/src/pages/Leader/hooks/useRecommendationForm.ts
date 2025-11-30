import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import { RecommendationStatus } from '@vibe-apply/shared';
import { USER_ROLES } from '@/utils/constants';
import { formatPhoneNumber } from '@/utils/phoneFormatter';
import {
  AGE_MIN,
  AGE_MAX,
  AGE_ERROR_MESSAGE,
} from '@/utils/validationConstants';
import {
  findStakeValueByText,
  findWardValueByText,
} from '@/utils/stakeWardData';
import type {
  RecommendationFormData,
  ValidationErrors,
  UseRecommendationFormOptions,
} from '../types';

const emptyForm: RecommendationFormData = {
  id: null,
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

export const useRecommendationForm = ({
  currentFormId,
  currentUser,
  recommendations,
  t,
}: UseRecommendationFormOptions) => {
  const [form, setForm] = useState<RecommendationFormData>(emptyForm);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [formError, setFormError] = useState('');
  const [editingOriginStatus, setEditingOriginStatus] =
    useState<RecommendationStatus | null>(null);

  useEffect(() => {
    if (currentFormId === undefined) {
      setForm(emptyForm);
      setErrors({});
      setFormError('');
      setEditingOriginStatus(null);
      return;
    }

    if (currentFormId === null) {
      const initialWard =
        currentUser?.role === USER_ROLES.BISHOP ||
        currentUser?.role === USER_ROLES.APPLICANT
          ? currentUser?.ward || ''
          : '';
      setForm({
        ...emptyForm,
        stake: currentUser?.stake || '',
        ward: initialWard,
      });
      setErrors({});
      setFormError('');
      setEditingOriginStatus(null);
      return;
    }

    const recommendation = recommendations.find(
      (item) => item.id === currentFormId
    );
    if (recommendation) {
      const normalizedStake =
        findStakeValueByText(recommendation.stake) || recommendation.stake;
      const normalizedWard = normalizedStake
        ? findWardValueByText(normalizedStake, recommendation.ward) ||
          recommendation.ward
        : recommendation.ward;

      setForm({
        id: recommendation.id,
        name: recommendation.name,
        age: recommendation.age?.toString() ?? '',
        email: recommendation.email,
        phone: recommendation.phone,
        gender: recommendation.gender ?? '',
        stake: normalizedStake,
        ward: normalizedWard,
        moreInfo: recommendation.moreInfo ?? '',
        servedMission: recommendation.servedMission ?? false,
      });
      setErrors({});
      setFormError('');
    }
  }, [currentFormId, recommendations, currentUser]);

  const handleFormChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;
    const formattedValue = name === 'phone' ? formatPhoneNumber(value) : value;
    setForm((prev) => ({ ...prev, [name]: formattedValue }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
    if (formError) {
      setFormError('');
    }
  };

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};
    const trimmedName = (form.name || '').trim();
    const trimmedEmail = (form.email || '').trim();
    const trimmedPhone = (form.phone || '').trim();
    const trimmedStake = (form.stake || '').trim();
    const trimmedWard = (form.ward || '').trim();
    const normalizedAge = Number.parseInt(form.age, 10);
    const normalizedGender =
      form.gender === 'male' || form.gender === 'female' ? form.gender : '';

    if (!trimmedName) {
      nextErrors.name = t('leader.recommendations.validation.nameRequired');
    }
    if (
      Number.isNaN(normalizedAge) ||
      normalizedAge < AGE_MIN ||
      normalizedAge > AGE_MAX
    ) {
      nextErrors.age = AGE_ERROR_MESSAGE;
    }
    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      nextErrors.email = t('leader.recommendations.validation.emailInvalid');
    }
    if (!trimmedPhone) {
      nextErrors.phone = t('leader.recommendations.validation.phoneRequired');
    }
    if (!trimmedStake) {
      nextErrors.stake = t('leader.recommendations.validation.stakeRequired');
    }
    if (!trimmedWard) {
      nextErrors.ward = t('leader.recommendations.validation.wardRequired');
    }

    return {
      nextErrors,
      normalizedAge,
      trimmedName,
      trimmedEmail,
      trimmedPhone,
      trimmedStake,
      trimmedWard,
      normalizedGender,
    };
  };

  return {
    form,
    setForm,
    errors,
    setErrors,
    formError,
    setFormError,
    editingOriginStatus,
    setEditingOriginStatus,
    handleFormChange,
    validateForm,
  };
};
