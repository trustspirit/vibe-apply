import { ReactNode } from 'react';
import clsx from 'clsx';

interface TabItem {
  id: string;
  label: string;
  badge?: ReactNode;
  disabled?: boolean;
  controls?: string;
}

interface TabsProps {
  items: TabItem[];
  activeId: string;
  onChange?: (id: string, item: TabItem) => void;
  className?: string;
  tabClassName?: string;
  activeTabClassName?: string;
  labelClassName?: string;
  badgeClassName?: string;
  getBadge?: (item: TabItem, isActive: boolean) => ReactNode;
  getLabel?: (item: TabItem, isActive: boolean) => ReactNode;
  ariaLabel?: string;
}

const Tabs = ({
  items,
  activeId,
  onChange,
  className = '',
  tabClassName = 'tabs__tab',
  activeTabClassName = 'tabs__tab--active',
  labelClassName = 'tabs__label',
  badgeClassName = 'tabs__badge',
  getBadge,
  getLabel,
  ariaLabel,
}: TabsProps) => {
  if (!Array.isArray(items)) {
    return null;
  }

  const handleClick = (item: TabItem) => {
    if (item.disabled) {
      return;
    }
    onChange?.(item.id, item);
  };

  return (
    <div className={clsx('tabs', className)} role='tablist' aria-label={ariaLabel}>
      {items.map((item) => {
        const isActive = item.id === activeId;
        const badgeContent = typeof getBadge === 'function' ? getBadge(item, isActive) : item.badge;
        const contentLabel = typeof getLabel === 'function' ? getLabel(item, isActive) : item.label;

        return (
          <button
            key={item.id}
            type='button'
            role='tab'
            aria-selected={isActive}
            aria-controls={item.controls}
            className={clsx(tabClassName, isActive && activeTabClassName, item.disabled && 'is-disabled')}
            onClick={() => handleClick(item)}
            disabled={item.disabled}
          >
            <span className={labelClassName}>{contentLabel}</span>
            {badgeContent !== undefined && badgeContent !== null ? (
              <span className={badgeClassName}>{badgeContent}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;
