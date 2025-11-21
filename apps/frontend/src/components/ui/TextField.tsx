import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';
import styles from './TextField.module.scss';

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

    const { className: controlClassName, ...controlProps } = rest;
    const Control = multiline ? 'textarea' : 'input';

    return (
      <label className={clsx(styles.formControl, error && styles.formControlError, wrapperClassName)} htmlFor={fieldId}>
        {label && (
          <span className={clsx(styles.fieldLabel, labelClassName)}>
            {label}
            {showRequiredIndicator ? (
              <span className={clsx(styles.fieldRequired, requiredClassName)} aria-hidden='true'>
                *
              </span>
            ) : null}
          </span>
        )}
        <Control
          {...(controlProps as unknown as InputHTMLAttributes<HTMLInputElement> & TextareaHTMLAttributes<HTMLTextAreaElement>)}
          id={fieldId}
          name={name}
          type={multiline ? undefined : type}
          ref={ref as unknown as React.Ref<HTMLInputElement & HTMLTextAreaElement>}
          rows={multiline ? rows : undefined}
          className={clsx(
            multiline ? styles.textarea : styles.input,
            error && styles.inputError,
            controlClassName as string,
            inputClassName
          )}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy.length ? describedBy.join(' ') : undefined}
          required={required}
        />
        {helperText && !error ? (
          <span id={`${fieldId}-helper`} className={styles.formHelp}>
            {helperText}
          </span>
        ) : null}
        {error ? (
          <span id={`${fieldId}-error`} className={styles.formError}>
            {error}
          </span>
        ) : null}
      </label>
    );
  }
);

TextField.displayName = 'TextField';

export default TextField;
