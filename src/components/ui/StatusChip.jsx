import classNames from '../../utils/classNames.js';

const STATUS_TONES = {
  draft: 'draft',
  awaiting: 'awaiting',
  submitted: 'awaiting',
  approved: 'approved',
  rejected: 'rejected',
  reviewed: 'reviewed',
};

const STATUS_LABELS = {
  draft: 'Draft',
  awaiting: 'Awaiting Review',
  submitted: 'Submitted',
  approved: 'Approved',
  rejected: 'Rejected',
  reviewed: 'Reviewed',
};

const normalizeKey = (value) => (typeof value === 'string' ? value.toLowerCase() : undefined);

const StatusChip = ({ status, tone, label, className = '', children, ...props }) => {
  const key = normalizeKey(status);
  const resolvedTone = tone ?? (key ? STATUS_TONES[key] : undefined) ?? 'awaiting';
  const content = label ?? (key ? STATUS_LABELS[key] : undefined) ?? children ?? status;

  return (
    <span className={classNames('status-chip', `status-chip--${resolvedTone}`, className)} {...props}>
      {content}
    </span>
  );
};

export default StatusChip;
