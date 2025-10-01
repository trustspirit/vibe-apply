import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { Button, ComboBox, StatusChip, TextField } from '../../components/ui';
import './UserApplication.scss';

const emptyForm = {
  name: '',
  age: '',
  email: '',
  phone: '',
  gender: '',
  stake: '',
  ward: '',
  moreInfo: '',
};

const STATUS_DISPLAY = {
  draft: { label: 'Draft', tone: 'draft' },
  awaiting: { label: 'Submitted', tone: 'awaiting' },
  approved: { label: 'Reviewed', tone: 'reviewed' },
  rejected: { label: 'Reviewed', tone: 'reviewed' },
};

const UserApplication = () => {
  const { applications, currentUser, submitApplication } = useApp();
  const existingApplication = useMemo(
    () =>
      applications.find(
        (application) => application.userId === currentUser?.id
      ),
    [applications, currentUser?.id]
  );

  const isEditable =
    !existingApplication ||
    !['approved', 'rejected'].includes(existingApplication.status);

  const [form, setForm] = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(
    () => !existingApplication || existingApplication.status === 'draft'
  );
  const [feedback, setFeedback] = useState('');
  const [formError, setFormError] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
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
      });
    } else if (currentUser) {
      setForm((prev) => ({
        ...prev,
        name: currentUser.name,
        email: currentUser.email,
      }));
    }
  }, [existingApplication, currentUser]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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
    const validationErrors = {};
    const trimmedName = form.name.trim();
    const trimmedEmail = form.email.trim();
    const trimmedPhone = form.phone.trim();
    const trimmedStake = form.stake.trim();
    const trimmedWard = form.ward.trim();
    const normalizedGender =
      form.gender === 'male' || form.gender === 'female' ? form.gender : '';
    const normalizedAge = Number.parseInt(form.age, 10);

    if (!trimmedName) {
      validationErrors.name = 'Name is required.';
    }

    if (Number.isNaN(normalizedAge)) {
      validationErrors.age = 'Enter a valid age.';
    } else if (normalizedAge < 16 || normalizedAge > 120) {
      validationErrors.age = 'Age must be between 16 and 120.';
    }

    if (!trimmedEmail) {
      validationErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      validationErrors.email = 'Enter a valid email address.';
    }

    if (!trimmedPhone) {
      validationErrors.phone = 'Phone number is required.';
    }

    if (!trimmedStake) {
      validationErrors.stake = 'Stake is required.';
    }

    if (!trimmedWard) {
      validationErrors.ward = 'Ward is required.';
    }

    if (!normalizedGender) {
      validationErrors.gender = 'Select male or female.';
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

  const handleSubmitApplication = (event) => {
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
      setFormError('Please fix the highlighted fields before submitting.');
      return;
    }

    submitApplication(currentUser.id, {
      name: trimmedName,
      age: normalizedAge,
      email: trimmedEmail,
      phone: trimmedPhone,
      gender: normalizedGender,
      stake: trimmedStake,
      ward: trimmedWard,
      moreInfo: form.moreInfo.trim(),
      status: 'awaiting',
    });

    setErrors({});
    setFeedback('Your application has been submitted and is awaiting review.');
    setIsEditing(false);
  };

  const handleSaveDraft = () => {
    if (!currentUser) {
      return;
    }

    setFeedback('');
    setFormError('');
    setErrors({});

    const normalizedAge = Number.parseInt(form.age, 10);

    submitApplication(currentUser.id, {
      name: form.name.trim(),
      age: Number.isNaN(normalizedAge) ? null : normalizedAge,
      email: form.email.trim(),
      phone: form.phone.trim(),
      gender:
        form.gender === 'male' || form.gender === 'female' ? form.gender : '',
      stake: form.stake.trim(),
      ward: form.ward.trim(),
      moreInfo: form.moreInfo.trim(),
      status: 'draft',
    });

    setFeedback(
      'Draft saved. You can return anytime to complete and submit your application.'
    );
  };

  return (
    <section className='application'>
      <header className='application__header'>
        <h1 className='application__title'>Application</h1>
        <p className='application__subtitle'>
          {existingApplication
            ? existingApplication.status === 'draft'
              ? 'Your draft is saved. Complete the required fields and submit when you are ready.'
              : isEditable
                ? 'You can update your submission while it is being reviewed.'
                : 'Your submission is locked while a decision is finalized.'
            : 'Start your application to be considered.'}
        </p>
      </header>

      {formError && (
        <p className='application__feedback application__feedback--error'>
          {formError}
        </p>
      )}
      {feedback && <p className='application__feedback'>{feedback}</p>}

      {existingApplication && !isEditing && (
        <div className='application__summary'>
          <h2 className='application__summary-title'>Submission Overview</h2>
          {existingApplication.status === 'draft' && (
            <p className='application__draft-note'>
              This application is saved as a draft. Submit it when the required
              fields are complete.
            </p>
          )}
          <dl>
            <div>
              <dt>Status</dt>
              <dd>
                {(() => {
                  const display = STATUS_DISPLAY[
                    existingApplication.status
                  ] ?? {
                    label: existingApplication.status,
                    tone: existingApplication.status,
                  };
                  return (
                    <StatusChip
                      status={existingApplication.status}
                      tone={display.tone}
                      label={display.label}
                    />
                  );
                })()}
              </dd>
            </div>
            <div>
              <dt>Name</dt>
              <dd>{existingApplication.name}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{existingApplication.email}</dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>{existingApplication.phone}</dd>
            </div>
            <div>
              <dt>Age</dt>
              <dd>{existingApplication.age ?? 'N/A'}</dd>
            </div>
            <div>
              <dt>Stake</dt>
              <dd>{existingApplication.stake}</dd>
            </div>
            <div>
              <dt>Ward</dt>
              <dd>{existingApplication.ward}</dd>
            </div>
            <div>
              <dt>Additional Information</dt>
              <dd>
                {existingApplication.moreInfo ||
                  'No additional details provided.'}
              </dd>
            </div>
          </dl>
          {isEditable ? (
            <Button
              type='button'
              variant='primary'
              onClick={() => setIsEditing(true)}
            >
              Edit Submission
            </Button>
          ) : (
            <p className='application__locked'>
              Edits are unavailable because your submission is being finalized.
            </p>
          )}
        </div>
      )}

      {isEditing && isEditable && (
        <form className='application__form' onSubmit={handleSubmitApplication}>
          <div className='form-grid'>
            <TextField
              name='name'
              label='Name'
              value={form.name}
              onChange={handleChange}
              required
              error={errors.name}
            />
            <TextField
              name='age'
              label='Age'
              type='number'
              value={form.age}
              onChange={handleChange}
              required
              error={errors.age}
              min={16}
              max={120}
            />
            <TextField
              name='email'
              label='Email'
              type='email'
              value={form.email}
              onChange={handleChange}
              required
              error={errors.email}
            />
            <TextField
              name='phone'
              label='Phone'
              type='tel'
              value={form.phone}
              onChange={handleChange}
              required
              error={errors.phone}
            />
            <TextField
              name='stake'
              label='Stake'
              value={form.stake}
              onChange={handleChange}
              required
              error={errors.stake}
            />
            <TextField
              name='ward'
              label='Ward'
              value={form.ward}
              onChange={handleChange}
              required
              error={errors.ward}
            />
            <ComboBox
              name='gender'
              label='Gender (optional)'
              value={form.gender}
              onChange={handleChange}
              showRequiredIndicator={false}
              error={errors.gender}
              variant='input'
              options={[
                { value: '', label: 'Select gender', disabled: true },
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
              ]}
            />
          </div>
          <TextField
            name='moreInfo'
            label='Additional Information'
            value={form.moreInfo}
            onChange={handleChange}
            placeholder='Share any relevant experience or context.'
            multiline
            rows={4}
            wrapperClassName='form-full'
            showRequiredIndicator={false}
          />
          <div className='application__form-actions'>
            <Button type='submit' variant='primary'>
              Submit Application
            </Button>
            <Button type='button' onClick={handleSaveDraft}>
              Save Draft
            </Button>
            {existingApplication && (
              <Button
                type='button'
                variant='danger'
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      )}

      {!existingApplication && !isEditing && (
        <div className='application__start'>
          <Button
            type='button'
            variant='primary'
            onClick={() => setIsEditing(true)}
          >
            Start Application
          </Button>
        </div>
      )}
    </section>
  );
};

export default UserApplication;
