import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
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

const RequiredIndicator = () => (
  <span className="field-required" aria-hidden="true">
    *
  </span>
);

const UserApplication = () => {
  const { applications, currentUser, submitApplication } = useApp();
  const existingApplication = useMemo(
    () => applications.find((application) => application.userId === currentUser?.id),
    [applications, currentUser?.id],
  );

  const isEditable = !existingApplication || !['approved', 'rejected'].includes(existingApplication.status);

  const [form, setForm] = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(() => !existingApplication || existingApplication.status === 'draft');
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
          existingApplication.gender === 'male' || existingApplication.gender === 'female'
            ? existingApplication.gender
            : '',
        stake: existingApplication.stake,
        ward: existingApplication.ward,
        moreInfo: existingApplication.moreInfo ?? '',
      });
    } else if (currentUser) {
      setForm((prev) => ({ ...prev, name: currentUser.name, email: currentUser.email }));
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
    const normalizedGender = form.gender === 'male' || form.gender === 'female' ? form.gender : '';
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
      gender: form.gender === 'male' || form.gender === 'female' ? form.gender : '',
      stake: form.stake.trim(),
      ward: form.ward.trim(),
      moreInfo: form.moreInfo.trim(),
      status: 'draft',
    });

    setFeedback('Draft saved. You can return anytime to complete and submit your application.');
  };

  return (
    <section className="application">
      <header className="application__header">
        <h1 className="application__title">Application</h1>
        <p className="application__subtitle">
          {existingApplication ? (
            existingApplication.status === 'draft'
              ? 'Your draft is saved. Complete the required fields and submit when you are ready.'
              : isEditable
                ? 'You can update your submission while it is being reviewed.'
                : 'Your submission is locked while a decision is finalized.'
          ) : (
            'Start your application to be considered.'
          )}
        </p>
      </header>

      {formError && <p className="application__feedback application__feedback--error">{formError}</p>}
      {feedback && <p className="application__feedback">{feedback}</p>}

      {existingApplication && !isEditing && (
        <div className="application__summary">
          <h2 className="application__summary-title">Submission Overview</h2>
          {existingApplication.status === 'draft' && (
            <p className="application__draft-note">
              This application is saved as a draft. Submit it when the required fields are complete.
            </p>
          )}
          <dl>
            <div>
              <dt>Status</dt>
              <dd>
                {(() => {
                  const display = STATUS_DISPLAY[existingApplication.status] ?? {
                    label: existingApplication.status,
                    tone: existingApplication.status,
                  };
                  return (
                    <span className={`status-chip status-chip--${display.tone}`}>
                      {display.label}
                    </span>
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
              <dd>{existingApplication.moreInfo || 'No additional details provided.'}</dd>
            </div>
          </dl>
          {isEditable ? (
            <button type="button" className="btn btn--primary" onClick={() => setIsEditing(true)}>
              Edit Submission
            </button>
          ) : (
            <p className="application__locked">Edits are unavailable because your submission is being finalized.</p>
          )}
        </div>
      )}

      {isEditing && isEditable && (
        <form className="application__form" onSubmit={handleSubmitApplication}>
          <div className="form-grid">
            <label className={errors.name ? 'field--error' : ''}>
              <span className="field-label">
                Name
                <RequiredIndicator />
              </span>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className={errors.name ? 'input--error' : ''}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? 'application-name-error' : undefined}
              />
              {errors.name && (
                <span id="application-name-error" className="form-error">
                  {errors.name}
                </span>
              )}
            </label>
            <label className={errors.age ? 'field--error' : ''}>
              <span className="field-label">
                Age
                <RequiredIndicator />
              </span>
              <input
                type="number"
                name="age"
                value={form.age}
                onChange={handleChange}
                min={16}
                max={120}
                className={errors.age ? 'input--error' : ''}
                aria-invalid={Boolean(errors.age)}
                aria-describedby={errors.age ? 'application-age-error' : undefined}
              />
              {errors.age && (
                <span id="application-age-error" className="form-error">
                  {errors.age}
                </span>
              )}
            </label>
            <label className={errors.email ? 'field--error' : ''}>
              <span className="field-label">
                Email
                <RequiredIndicator />
              </span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className={errors.email ? 'input--error' : ''}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'application-email-error' : undefined}
              />
              {errors.email && (
                <span id="application-email-error" className="form-error">
                  {errors.email}
                </span>
              )}
            </label>
            <label className={errors.phone ? 'field--error' : ''}>
              <span className="field-label">
                Phone
                <RequiredIndicator />
              </span>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className={errors.phone ? 'input--error' : ''}
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? 'application-phone-error' : undefined}
              />
              {errors.phone && (
                <span id="application-phone-error" className="form-error">
                  {errors.phone}
                </span>
              )}
            </label>
            <label className={errors.stake ? 'field--error' : ''}>
              <span className="field-label">
                Stake
                <RequiredIndicator />
              </span>
              <input
                type="text"
                name="stake"
                value={form.stake}
                onChange={handleChange}
                className={errors.stake ? 'input--error' : ''}
                aria-invalid={Boolean(errors.stake)}
                aria-describedby={errors.stake ? 'application-stake-error' : undefined}
              />
              {errors.stake && (
                <span id="application-stake-error" className="form-error">
                  {errors.stake}
                </span>
              )}
            </label>
            <label className={errors.ward ? 'field--error' : ''}>
              <span className="field-label">
                Ward
                <RequiredIndicator />
              </span>
              <input
                type="text"
                name="ward"
                value={form.ward}
                onChange={handleChange}
                className={errors.ward ? 'input--error' : ''}
                aria-invalid={Boolean(errors.ward)}
                aria-describedby={errors.ward ? 'application-ward-error' : undefined}
              />
              {errors.ward && (
                <span id="application-ward-error" className="form-error">
                  {errors.ward}
                </span>
              )}
            </label>
            <label className={errors.gender ? 'field--error' : ''}>
              <span className="field-label">
                Gender
                <RequiredIndicator />
              </span>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className={errors.gender ? 'input--error' : ''}
                aria-invalid={Boolean(errors.gender)}
                aria-describedby={errors.gender ? 'application-gender-error' : undefined}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              {errors.gender && (
                <span id="application-gender-error" className="form-error">
                  {errors.gender}
                </span>
              )}
            </label>
          </div>
          <label className={`form-full${errors.moreInfo ? ' field--error' : ''}`}>
            Additional Information
            <textarea
              name="moreInfo"
              value={form.moreInfo}
              onChange={handleChange}
              rows={4}
              placeholder="Share any relevant experience or context."
            />
          </label>
          <div className="application__form-actions">
            <button type="submit" className="btn btn--primary">
              Submit Application
            </button>
            <button type="button" className="btn" onClick={handleSaveDraft}>
              Save Draft
            </button>
            {existingApplication && (
              <button type="button" className="btn btn--danger" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {!existingApplication && !isEditing && (
        <div className="application__start">
          <button type="button" className="btn btn--primary" onClick={() => setIsEditing(true)}>
            Start Application
          </button>
        </div>
      )}
    </section>
  );
};

export default UserApplication;
