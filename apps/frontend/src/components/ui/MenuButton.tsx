import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import Button from './Button.jsx';
import './MenuButton.scss';

const DEFAULT_ALIGNMENT = 'end';

const MenuButton = ({
  buttonLabel,
  items,
  onAction,
  className = '',
  buttonClassName = '',
  menuClassName = '',
  align = DEFAULT_ALIGNMENT,
  variant = 'default',
  disabled = false,
  icon,
  ariaLabel,
}) => {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleClickAway = (event) => {
      if (
        menuRef.current?.contains(event.target) ||
        buttonRef.current?.contains(event.target)
      ) {
        return;
      }
      setOpen(false);
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleClickAway);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickAway);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const handleToggle = () => {
    if (disabled) {
      return;
    }
    setOpen((prev) => !prev);
  };

  const handleSelect = (item, event) => {
    if (item.disabled) {
      event.preventDefault();
      return;
    }
    setOpen(false);
    item.onSelect?.(event, item);
    onAction?.(item, event);
  };

  if (!Array.isArray(items) || !items.length) {
    return null;
  }

  return (
    <div className={clsx('menu-button', className)}>
      <Button
        ref={buttonRef}
        type="button"
        variant={variant}
        className={clsx('menu-button__toggle', buttonClassName)}
        onClick={handleToggle}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={ariaLabel}
        disabled={disabled}
      >
        <span className="menu-button__label">{buttonLabel}</span>
        {icon ? <span className="menu-button__icon" aria-hidden>{icon}</span> : <span className="menu-button__caret" aria-hidden>▾</span>}
      </Button>
      {open ? (
        <ul
          ref={menuRef}
          className={clsx('menu-button__menu', `menu-button__menu--${align}`, menuClassName)}
          role="menu"
        >
          {items.map((item) => {
            if (item.type === 'separator' || item.type === 'divider') {
              return <li key={item.id ?? item.label} className="menu-button__separator" role="separator" />;
            }
            return (
              <li key={item.id ?? item.label} role="none">
                <button
                  type="button"
                  className={clsx('menu-button__item', item.disabled && 'is-disabled')}
                  role="menuitem"
                  onClick={(event) => handleSelect(item, event)}
                  disabled={item.disabled}
                >
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
};

export default MenuButton;
