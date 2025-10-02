import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react';
import classNames from '../../utils/classNames';

interface BaseTextFieldProps {
  id?: string;
  name?: string;
  label?: string;
  type?: string;
  required?: boolean;
  showRequiredIndicator?: boolean;
  error?: string;
  helperText?: ReactNode;
  wrapperClassName?: string;
  inputClassName?: string;
  labelClassName?: string;
  requiredClassName?: string;
  multiline?: boolean;
  rows?: number;
}

type TextFieldProps = BaseTextFieldProps &
  (Omit<InputHTMLAttributes<HTMLInputElement>, keyof BaseTextFieldProps> | Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, keyof BaseTextFieldProps>);

const TextField = forwardRef<HTMLInputElement | HTMLTextAreaElement, TextFieldProps>(
  (
    {
      id,
      name,
      label,
      type = 'text',
      required = false,
      showRequiredIndicator = required,
      error,
      helperText,
      wrapperClassName = '',
      inputClassName = '',
      labelClassName = 'field-label',
      requiredClassName = 'field-required',
      multiline = false,
      rows = 4,
      ...rest
    },
    ref
  ) => {
    const fieldId = id ?? name;
    const describedBy: string[] = [];
    if (helperText) {
      describedBy.push(`${fieldId}-helper`);
    }
    if (error) {
      describedBy.push(`${fieldId}-error`);
    }

    const { className: controlClassName, ...controlProps } = rest as Record<string, unknown>;
    const Control = multiline ? 'textarea' : 'input';

    return (
      <label className={classNames('form-control', wrapperClassName, error && 'field--error')} htmlFor={fieldId}>
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
        <Control
          {...(controlProps as any)}
          id={fieldId}
          name={name}
          type={multiline ? undefined : type}
          ref={ref as any}
          rows={multiline ? rows : undefined}
          className={classNames(controlClassName as string, inputClassName, error && 'input--error')}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy.length ? describedBy.join(' ') : undefined}
          required={required}
        />
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

TextField.displayName = 'TextField';

export default TextField;
