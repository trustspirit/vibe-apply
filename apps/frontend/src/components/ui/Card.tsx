import { forwardRef, HTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';
import styles from './Card.module.scss';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  wide?: boolean;
  compact?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ wide = false, compact = false, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          styles.card,
          wide && styles.wide,
          compact && styles.compact,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const CardHeader = ({ className, children, ...props }: CardHeaderProps) => {
  return (
    <div className={clsx(styles.header, className)} {...props}>
      {children}
    </div>
  );
};

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
}

const CardTitle = ({ className, children, ...props }: CardTitleProps) => {
  return (
    <h2 className={clsx(styles.title, className)} {...props}>
      {children}
    </h2>
  );
};

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const CardContent = ({ className, children, ...props }: CardContentProps) => {
  return (
    <div className={clsx(styles.content, className)} {...props}>
      {children}
    </div>
  );
};

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const CardFooter = ({ className, children, ...props }: CardFooterProps) => {
  return (
    <div className={clsx(styles.footer, className)} {...props}>
      {children}
    </div>
  );
};

export { Card, CardHeader, CardTitle, CardContent, CardFooter };
export default Card;
