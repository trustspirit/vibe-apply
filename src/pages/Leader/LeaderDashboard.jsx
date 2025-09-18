import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { Button, ComboBox, StatusChip, TextField } from '../../components/ui';
import './LeaderDashboard.scss';

const emptyForm = {
  id: null,
  name: '',
  age: '',
  email: '',
  phone: '',
  gender: '',
  stake: '',
  ward: '',
  moreInfo: '',
};

const LeaderDashboard = () => {
  const { currentUser, leaderRecommendations, submitLeaderRecommendation } = useApp();
  const leaderId = currentUser?.id ?? null;

  const recommendations = useMemo(
    () =>
      leaderRecommendations
        .filter((recommendation) => recommendation.leaderId === leaderId)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [leaderRecommendations, leaderId],
  );

  const stats = useMemo(
    () => ({
      draft: recommendations.filter((recommendation) => recommendation.status === 'draft').length,
      submitted: recommendations.filter((recommendation) => recommendation.status === 'submitted').length,
    }),
    [recommendations],
  );

  const [selectedId, setSelectedId] = useState(null);
  const selectedRecommendation = selectedId
    ? recommendations.find((recommendation) => recommendation.id === selectedId) ?? null
    : null;

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (selectedId && !selectedRecommendation) {
      setSelectedId(null);
    }
  }, [selectedId, selectedRecommendation]);

  useEffect(() => {
    if (selectedRecommendation) {
      setForm({
        id: selectedRecommendation.id,
        name: selectedRecommendation.name,
        age: selectedRecommendation.age?.toString() ?? '',
        email: selectedRecommendation.email,
        phone: selectedRecommendation.phone,
        gender: selectedRecommendation.gender ?? '',
        stake: selectedRecommendation.stake,
        ward: selectedRecommendation.ward,
        moreInfo: selectedRecommendation.moreInfo ?? '',
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
    setFormError('');
  }, [selectedRecommendation]);

  const handleSelect = (recommendationId) => {
    setSelectedId((prev) => (prev === recommendationId ? null : recommendationId));
    setFeedback('');
    setFormError('');
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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
    if (feedback) {
      setFeedback('');
    }
  };

  const validateForm = () => {
    const nextErrors = {};
    const trimmedName = form.name.trim();
    const trimmedEmail = form.email.trim();
    const trimmedPhone = form.phone.trim();
    const trimmedStake = form.stake.trim();
    const trimmedWard = form.ward.trim();
    const normalizedAge = Number.parseInt(form.age, 10);
    const normalizedGender = form.gender === 'male' || form.gender === 'female' ? form.gender : '';

    if (!trimmedName) {
      nextErrors.name = 'Name is required.';
    }
    if (Number.isNaN(normalizedAge) || normalizedAge < 16 || normalizedAge > 120) {
      nextErrors.age = 'Age must be between 16 and 120.';
    }
    if (!trimmedEmail) {
      nextErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      nextErrors.email = 'Enter a valid email address.';
    }
    if (!trimmedPhone) {
      nextErrors.phone = 'Phone number is required.';
    }
    if (!trimmedStake) {
      nextErrors.stake = 'Stake is required.';
    }
    if (!trimmedWard) {
      nextErrors.ward = 'Ward is required.';
    }
    if (!normalizedGender) {
      nextErrors.gender = 'Select male or female.';
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

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!leaderId) {
      return;
    }

    const {
      nextErrors,
      normalizedAge,
      trimmedName,
      trimmedEmail,
      trimmedPhone,
      trimmedStake,
      trimmedWard,
      normalizedGender,
    } = validateForm();

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      setFormError('Please resolve the highlighted fields before submitting.');
      return;
    }

    submitLeaderRecommendation(leaderId, {
      id: form.id,
      status: 'submitted',
      name: trimmedName,
      age: normalizedAge,
      email: trimmedEmail,
      phone: trimmedPhone,
      gender: normalizedGender,
      stake: trimmedStake,
      ward: trimmedWard,
      moreInfo: form.moreInfo.trim(),
    });

    setFeedback('Recommendation submitted to the stake leaders.');
    setSelectedId(null);
    setForm(emptyForm);
    setErrors({});
  };

  const handleSaveDraft = () => {
    if (!leaderId) {
      return;
    }

    const normalizedAge = Number.parseInt(form.age, 10);

    submitLeaderRecommendation(leaderId, {
      id: form.id,
      status: 'draft',
      name: form.name.trim(),
      age: Number.isNaN(normalizedAge) ? null : normalizedAge,
      email: form.email.trim(),
      phone: form.phone.trim(),
      gender: form.gender,
      stake: form.stake.trim(),
      ward: form.ward.trim(),
      moreInfo: form.moreInfo.trim(),
    });

    setFeedback('Draft saved. You can revisit and submit whenever you are ready.');
    if (!form.id) {
      setSelectedId(null);
      setForm(emptyForm);
    }
  };

  const handleStartNew = () => {
    setSelectedId(null);
    setForm(emptyForm);
    setErrors({});
    setFormError('');
    setFeedback('');
  };

  return (
    <section className="leader-dashboard">
      <header className="leader-dashboard__header">
        <div>
          <h1 className="leader-dashboard__title">Leader Dashboard</h1>
          <p className="leader-dashboard__subtitle">
            Track your recommendations and submit applicants for consideration.
          </p>
        </div>
        <div className="leader-dashboard__stats">
          <div className="leader-dashboard__stat-card">
            <span className="leader-dashboard__stat-label">Drafts</span>
            <span className="leader-dashboard__stat-value">{stats.draft}</span>
          </div>
          <div className="leader-dashboard__stat-card">
            <span className="leader-dashboard__stat-label">Submitted</span>
            <span className="leader-dashboard__stat-value">{stats.submitted}</span>
          </div>
        </div>
      </header>

      <div className="leader-dashboard__layout">
        <aside className="leader-dashboard__list">
          <div className="leader-dashboard__list-header">
            <h2>Recommendations</h2>
            <Button type="button" variant="primary" onClick={handleStartNew}>
              New Recommendation
            </Button>
          </div>
          {recommendations.length ? (
            <ul>
              {recommendations.map((recommendation) => (
                <li key={recommendation.id}>
                  <button
                    type="button"
                    className={
                      recommendation.id === selectedId
                        ? 'leader-dashboard__list-item leader-dashboard__list-item--active'
                        : 'leader-dashboard__list-item'
                    }
                    onClick={() => handleSelect(recommendation.id)}
                  >
                    <div>
                      <span className="leader-dashboard__list-name">{recommendation.name}</span>
                      <span className="leader-dashboard__list-email">{recommendation.email}</span>
                    </div>
                    <StatusChip status={recommendation.status} />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="leader-dashboard__empty">You have not created any recommendations yet.</p>
          )}
        </aside>

        <div className="leader-dashboard__form-wrapper">
          <form className="leader-dashboard__form" onSubmit={handleSubmit}>
            {formError && <p className="leader-dashboard__alert leader-dashboard__alert--error">{formError}</p>}
            {feedback && <p className="leader-dashboard__alert">{feedback}</p>}
            <div className="leader-dashboard__grid">
              <TextField
                name="name"
                label="Applicant Name"
                value={form.name}
                onChange={handleFormChange}
                required
                error={errors.name}
              />
              <TextField
                name="age"
                label="Age"
                type="number"
                value={form.age}
                onChange={handleFormChange}
                required
                error={errors.age}
                min={16}
                max={120}
              />
              <TextField
                name="email"
                label="Email"
                type="email"
                value={form.email}
                onChange={handleFormChange}
                required
                error={errors.email}
              />
              <TextField
                name="phone"
                label="Phone"
                type="tel"
                value={form.phone}
                onChange={handleFormChange}
                required
                error={errors.phone}
              />
              <TextField
                name="stake"
                label="Stake"
                value={form.stake}
                onChange={handleFormChange}
                required
                error={errors.stake}
              />
              <TextField
                name="ward"
                label="Ward"
                value={form.ward}
                onChange={handleFormChange}
                required
                error={errors.ward}
              />
              <ComboBox
                name="gender"
                label="Gender"
                value={form.gender}
                onChange={handleFormChange}
                error={errors.gender}
                options={[
                  { value: '', label: 'Select gender', disabled: true },
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                ]}
                variant="input"
              />
            </div>
            <TextField
              name="moreInfo"
              label="Additional Information"
              value={form.moreInfo}
              onChange={handleFormChange}
              placeholder="Share any context or strengths that make this applicant a great fit."
              multiline
              rows={4}
              wrapperClassName="leader-dashboard__form-full"
              showRequiredIndicator={false}
            />
            <div className="leader-dashboard__actions">
              <Button type="submit" variant="primary">
                Submit Recommendation
              </Button>
              <Button type="button" onClick={handleSaveDraft}>
                Save Draft
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default LeaderDashboard;
