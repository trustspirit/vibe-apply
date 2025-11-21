import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';
import styles from './SummaryCard.module.scss';

type SummaryCardVariant = 'primary' | 'warning' | 'accent' | 'success';

interface SummaryCardProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
  label: string;
  value: string | number;
  description?: string;
  variant?: SummaryCardVariant;
  clickable?: boolean;
}

const SummaryCard = forwardRef<HTMLButtonElement, SummaryCardProps>(
  (
    {
      icon,
      label,
      value,
      description,
      variant = 'primary',
      clickable = false,
      className,
      ...props
    },
    ref
  ) => {
    const content = (
      <>
        {icon && (
          <div className={styles.icon} aria-hidden>
            {icon}
          </div>
        )}
        <div className={styles.content}>
          <span className={styles.label}>{label}</span>
          <span className={styles.value}>{value}</span>
        </div>
        {description && <span className={styles.description}>{description}</span>}
      </>
    );

    if (clickable) {
      return (
        <button
          ref={ref}
          type='button'
          className={clsx(
            styles.summaryCard,
            styles[variant],
            styles.clickable,
            className
          )}
          {...props}
        >
          {content}
        </button>
      );
    }

    return (
      <div
        className={clsx(styles.summaryCard, styles[variant], className)}
      >
        {content}
      </div>
    );
  }
);

SummaryCard.displayName = 'SummaryCard';

export default SummaryCard;
