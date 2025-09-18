import { forwardRef } from 'react';
import classNames from '../../utils/classNames.js';

const ComboBox = forwardRef(
  (
    {
      id,
      name,
      label,
      options = [],
      children,
      value,
      tone,
      required = false,
      showRequiredIndicator = required,
      error,
      helperText,
      wrapperClassName = '',
      selectClassName = '',
      labelClassName = 'field-label',
      requiredClassName = 'field-required',
      variant = 'combo',
      ariaLabel,
      ...rest
    },
    ref
  ) => {
    const fieldId = id ?? name;
    const describedBy = [];
    if (helperText) {
      describedBy.push(`${fieldId}-helper`);
    }
    if (error) {
      describedBy.push(`${fieldId}-error`);
    }

    const { className: controlClassName, ...controlProps } = rest;
    const controlledValue = value ?? '';
    const resolvedTone =
      tone ??
      (typeof controlledValue === 'string' && controlledValue
        ? controlledValue
        : undefined);
    const toneClass = variant === 'combo' && resolvedTone ? `combo--${resolvedTone}` : '';
    const baseClass = variant === 'combo' ? 'combo' : '';

    return (
      <label
        className={classNames(wrapperClassName, error && 'field--error')}
        htmlFor={fieldId}
      >
        {label && (
          <span className={labelClassName}>
            {label}
            {showRequiredIndicator ? (
              <span className={requiredClassName} aria-hidden='true'>
                *
              </span>
            ) : null}
          </span>
        )}
        <select
          {...controlProps}
          id={fieldId}
          name={name}
          ref={ref}
          value={controlledValue}
          className={classNames(baseClass, toneClass, controlClassName, selectClassName)}
          aria-invalid={Boolean(error)}
          aria-label={ariaLabel}
          aria-describedby={describedBy.length ? describedBy.join(' ') : undefined}
          required={required}
        >
          {options.length
            ? options.map((option) => (
                <option
                  key={option.value ?? option.label}
                  value={option.value}
                  disabled={option.disabled}
                  hidden={option.hidden}
                >
                  {option.label}
                </option>
              ))
            : children}
        </select>
        {helperText && !error ? (
          <span id={`${fieldId}-helper`} className='form-help'>
            {helperText}
          </span>
        ) : null}
        {error ? (
          <span id={`${fieldId}-error`} className='form-error'>
            {error}
          </span>
        ) : null}
      </label>
    );
  }
);

ComboBox.displayName = 'ComboBox';

export default ComboBox;
