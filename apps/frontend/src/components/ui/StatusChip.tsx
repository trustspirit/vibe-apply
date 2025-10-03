import { HTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

const STATUS_TONES = {
  draft: 'draft',
  awaiting: 'awaiting',
  submitted: 'awaiting',
  approved: 'approved',
  rejected: 'rejected',
  reviewed: 'reviewed',
} as const;

const STATUS_LABELS = {
  draft: 'Draft',
  awaiting: 'Awaiting',
  submitted: 'Awaiting',
  approved: 'Approved',
  rejected: 'Rejected',
  reviewed: 'Reviewed',
} as const;

type StatusKey = keyof typeof STATUS_TONES;
type ToneValue = 'draft' | 'awaiting' | 'approved' | 'rejected' | 'reviewed' | 'admin' | 'leader' | 'applicant';

const normalizeKey = (value: unknown): StatusKey | undefined =>
  typeof value === 'string' ? (value.toLowerCase() as StatusKey) : undefined;

interface StatusChipProps extends HTMLAttributes<HTMLSpanElement> {
  status?: string;
  tone?: ToneValue;
  label?: string;
  children?: ReactNode;
}

const StatusChip = ({ status, tone, label, className = '', children, ...props }: StatusChipProps) => {
  const key = normalizeKey(status);
  const resolvedTone = tone ?? (key ? STATUS_TONES[key] : undefined) ?? 'awaiting';
  const content = label ?? (key ? STATUS_LABELS[key] : undefined) ?? children ?? status;

  return (
    <span className={clsx('status-chip', `status-chip--${resolvedTone}`, className)} {...props}>
      {content}
    </span>
  );
};

export default StatusChip;
