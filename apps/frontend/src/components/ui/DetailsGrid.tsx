import { ReactNode } from 'react';
import styles from './DetailsGrid.module.scss';

interface DetailsGridProps {
  children: ReactNode;
  className?: string;
}

export const DetailsGrid = ({ children, className }: DetailsGridProps) => {
  return (
    <dl className={`${styles.detailsGrid} ${className || ''}`}>
      {children}
    </dl>
  );
};

