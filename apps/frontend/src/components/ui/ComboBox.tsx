import { forwardRef, SelectHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';
import styles from './ComboBox.module.scss';

interface ComboBoxOption {
  value: string;
  label: string;
  disabled?: boolean;
  hidden?: boolean;
}

interface ComboBoxProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className'> {
  id?: string;
  name?: string;
  label?: string;
  options?: ComboBoxOption[];
  children?: ReactNode;
  value?: string;
  tone?: string;
  required?: boolean;
  showRequiredIndicator?: boolean;
  error?: string;
  helperText?: string;
  wrapperClassName?: string;
  selectClassName?: string;
  labelClassName?: string;
  requiredClassName?: string;
  variant?: 'combo' | 'default';
  ariaLabel?: string;
  className?: string;
}

const ComboBox = forwardRef<HTMLSelectElement, ComboBoxProps>(
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
      labelClassName = '',
      requiredClassName = '',
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
    const toneClassMap: Record<string, string> = {
      awaiting: styles.comboAwaiting,
      approved: styles.comboApproved,
      rejected: styles.comboRejected,
      draft: styles.comboDraft,
      admin: styles.comboAdmin,
      leader: styles.comboLeader,
      stakePresident: styles.comboStakePresident,
      bishop: styles.comboBishop,
      sessionLeader: styles.comboSessionLeader,
      applicant: styles.comboApplicant,
    };
    const toneClass =
      variant === 'combo' && resolvedTone && toneClassMap[resolvedTone]
        ? toneClassMap[resolvedTone]
        : '';
    const baseClass = variant === 'combo' ? styles.combo : styles.select;

    return (
      <label
        className={clsx(
          styles.formControl,
          error && styles.formControlError,
          wrapperClassName
        )}
        htmlFor={fieldId}
      >
        {label && (
          <span className={clsx(styles.fieldLabel, labelClassName)}>
            {label}
            {showRequiredIndicator ? (
              <span
                className={clsx(styles.fieldRequired, requiredClassName)}
                aria-hidden='true'
              >
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
          className={clsx(
            baseClass,
            toneClass,
            controlClassName,
            selectClassName
          )}
          aria-invalid={Boolean(error)}
          aria-label={ariaLabel}
          aria-describedby={
            describedBy.length ? describedBy.join(' ') : undefined
          }
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

ComboBox.displayName = 'ComboBox';

export default ComboBox;
