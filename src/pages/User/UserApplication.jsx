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

const UserApplication = () => {
  const { applications, currentUser, submitApplication } = useApp();
  const existingApplication = useMemo(
    () => applications.find((application) => application.userId === currentUser?.id),
    [applications, currentUser?.id],
  );

  const isEditable = !existingApplication || !['approved', 'rejected'].includes(existingApplication.status);

  const [form, setForm] = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(!existingApplication);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (existingApplication) {
      setForm({
        name: existingApplication.name,
        age: existingApplication.age?.toString() ?? '',
        email: existingApplication.email,
        phone: existingApplication.phone,
        gender: existingApplication.gender ?? '',
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
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setFeedback('');

    const normalizedAge = Number.parseInt(form.age, 10);

    submitApplication(currentUser.id, {
      name: form.name.trim(),
      age: Number.isNaN(normalizedAge) ? null : normalizedAge,
      email: form.email.trim(),
      phone: form.phone.trim(),
      gender: form.gender || 'other',
      stake: form.stake.trim(),
      ward: form.ward.trim(),
      moreInfo: form.moreInfo.trim(),
    });

    setFeedback('Your application has been saved. You can revisit it at any time before it is finalized.');
    setIsEditing(false);
  };

  return (
    <section className="application">
      <header className="application__header">
        <h1 className="application__title">Application</h1>
        <p className="application__subtitle">
          {existingApplication
            ? isEditable
              ? 'You can update your submission while it is being reviewed.'
              : 'Your submission is locked while a decision is finalized.'
            : 'Start your application to be considered.'}
        </p>
      </header>

      {feedback && <p className="application__feedback">{feedback}</p>}

      {existingApplication && !isEditing && (
        <div className="application__summary">
          <h2 className="application__summary-title">Submission Overview</h2>
          <dl>
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
        <form className="application__form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              Name
              <input type="text" name="name" value={form.name} onChange={handleChange} required />
            </label>
            <label>
              Age
              <input type="number" name="age" value={form.age} onChange={handleChange} required min={16} max={120} />
            </label>
            <label>
              Email
              <input type="email" name="email" value={form.email} onChange={handleChange} required />
            </label>
            <label>
              Phone
              <input type="tel" name="phone" value={form.phone} onChange={handleChange} required />
            </label>
            <label>
              Stake
              <input type="text" name="stake" value={form.stake} onChange={handleChange} required />
            </label>
            <label>
              Ward
              <input type="text" name="ward" value={form.ward} onChange={handleChange} required />
            </label>
            <label>
              Gender (optional)
              <select name="gender" value={form.gender} onChange={handleChange}>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Prefer not to say</option>
              </select>
            </label>
          </div>
          <label className="form-full">
            Additional Information
            <textarea name="moreInfo" value={form.moreInfo} onChange={handleChange} rows={4} placeholder="Share any relevant experience or context." />
          </label>
          <div className="application__form-actions">
            <button type="submit" className="btn btn--primary">
              Save Application
            </button>
            {existingApplication && (
              <button type="button" className="btn" onClick={() => setIsEditing(false)}>
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
