import { ReactNode } from 'react';
import styles from './DetailsNotes.module.scss';

interface DetailsNotesProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export const DetailsNotes = ({
  title,
  children,
  className,
}: DetailsNotesProps) => {
  return (
    <div className={`${styles.detailsNotes} ${className || ''}`}>
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
};


