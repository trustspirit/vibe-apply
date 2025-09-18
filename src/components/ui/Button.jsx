import { forwardRef } from 'react';

const VARIANT_CLASSNAMES = {
  default: '',
  primary: 'btn--primary',
  danger: 'btn--danger',
};

const classNames = (...values) => values.filter(Boolean).join(' ');

const Button = forwardRef(({ variant = 'default', className = '', type = 'button', ...props }, ref) => {
  const variantClass = VARIANT_CLASSNAMES[variant] ?? variant;
  const combinedClassName = classNames('btn', variantClass, className);

  return <button ref={ref} type={type} className={combinedClassName} {...props} />;
});

Button.displayName = 'Button';

export default Button;
