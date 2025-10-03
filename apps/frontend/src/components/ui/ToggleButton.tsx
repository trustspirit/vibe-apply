import { forwardRef, ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';
import './ToggleButton.scss';

interface ToggleButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'type'> {
  checked?: boolean;
  onChange?: (value: boolean) => void;
  labelOn?: string;
  labelOff?: string;
  confirmOnMessage?: string;
  disabled?: boolean;
}

const ToggleButton = forwardRef<HTMLButtonElement, ToggleButtonProps>(
  (
    { checked = false, onChange, labelOn = 'On', labelOff = 'Off', className = '', confirmOnMessage, disabled = false, ...rest },
    ref
  ) => {
    const handleClick = () => {
      if (disabled) {
        return;
      }
      const nextValue = !checked;
      if (nextValue && confirmOnMessage && !window.confirm(confirmOnMessage)) {
        return;
      }
      onChange?.(nextValue);
    };

    return (
      <button
        type='button'
        className={clsx('toggle-button', checked && 'toggle-button--on', disabled && 'is-disabled', className)}
        aria-pressed={checked}
        onClick={handleClick}
        ref={ref}
        disabled={disabled}
        {...rest}
      >
        <span className='toggle-button__track' aria-hidden>
          <span className='toggle-button__thumb' />
        </span>
        <span className='toggle-button__status'>{checked ? labelOn : labelOff}</span>
      </button>
    );
  }
);

ToggleButton.displayName = 'ToggleButton';

export default ToggleButton;
