import { forwardRef, ButtonHTMLAttributes } from 'react';
import classNames from '../../utils/classNames';

const VARIANT_CLASSNAMES = {
  default: '',
  primary: 'btn--primary',
  danger: 'btn--danger',
} as const;

type ButtonVariant = keyof typeof VARIANT_CLASSNAMES | string;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'default', className = '', type = 'button', ...props }, ref) => {
    const variantClass =
      variant in VARIANT_CLASSNAMES ? VARIANT_CLASSNAMES[variant as keyof typeof VARIANT_CLASSNAMES] : variant;
    const combinedClassName = classNames('btn', variantClass, className);

    return <button ref={ref} type={type} className={combinedClassName} {...props} />;
  }
);

Button.displayName = 'Button';

export default Button;
