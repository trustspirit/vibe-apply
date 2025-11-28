import { ReactNode } from 'react';
import styles from './DetailsGridItem.module.scss';

interface DetailsGridItemProps {
  label: string;
  children: ReactNode;
  className?: string;
}

export const DetailsGridItem = ({
  label,
  children,
  className,
}: DetailsGridItemProps) => {
  return (
    <div className={`${styles.detailsGridItem} ${className || ''}`}>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
};


