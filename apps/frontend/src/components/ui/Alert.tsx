import { forwardRef, HTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';
import styles from './Alert.module.scss';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  children: ReactNode;
}

const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ variant = 'info', className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(styles.alert, styles[variant], className)}
        role='alert'
        {...props}
      >
        {children}
      </div>
    );
  }
);

Alert.displayName = 'Alert';

export default Alert;
