import { ReactNode } from 'react';
import styles from './SummaryItem.module.scss';

interface SummaryItemProps {
  label: string;
  children: ReactNode;
  className?: string;
}

export const SummaryItem = ({
  label,
  children,
  className,
}: SummaryItemProps) => {
  return (
    <div className={`${styles.summaryItem} ${className || ''}`}>
      <dt className={styles.summaryLabel}>{label}</dt>
      <dd className={styles.summaryValue}>{children}</dd>
    </div>
  );
};

