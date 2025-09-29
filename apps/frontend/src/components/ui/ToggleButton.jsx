import { forwardRef } from 'react';
import classNames from '../../utils/classNames.js';
import './ToggleButton.scss';

const ToggleButton = forwardRef(
  (
    {
      checked = false,
      onChange,
      labelOn = 'On',
      labelOff = 'Off',
      className = '',
      confirmOnMessage,
      disabled = false,
      ...rest
    },
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
        className={classNames(
          'toggle-button',
          checked && 'toggle-button--on',
          disabled && 'is-disabled',
          className
        )}
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
