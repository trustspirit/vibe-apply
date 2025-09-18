import classNames from '../../utils/classNames.js';

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
}) => {
  if (!Array.isArray(items)) {
    return null;
  }

  const handleClick = (item) => {
    if (item.disabled) {
      return;
    }
    onChange?.(item.id, item);
  };

  return (
    <div className={classNames('tabs', className)} role="tablist" aria-label={ariaLabel}>
      {items.map((item) => {
        const isActive = item.id === activeId;
        const badgeContent = typeof getBadge === 'function' ? getBadge(item, isActive) : item.badge;
        const contentLabel = typeof getLabel === 'function' ? getLabel(item, isActive) : item.label;

        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={item.controls}
            className={classNames(tabClassName, isActive && activeTabClassName, item.disabled && 'is-disabled')}
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
