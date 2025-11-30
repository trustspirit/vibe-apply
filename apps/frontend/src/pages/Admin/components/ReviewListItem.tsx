import { StatusChip } from '@/components/ui';
import { ReviewItemTags } from '@/components';
import type { ReviewListItemProps } from '../types';
import styles from '../AdminReview.module.scss';

export const ReviewListItem = ({
  item,
  isSelected,
  onSelect,
  getStatusLabel,
  getStakeDisplay,
  getWardDisplay,
}: ReviewListItemProps) => {
  return (
    <button
      type='button'
      className={
        isSelected
          ? `${styles.listItem} ${styles.listItemActive}`
          : styles.listItem
      }
      onClick={() => onSelect(item.key)}
      aria-current={isSelected ? 'true' : 'false'}
    >
      <div className={styles.listTop}>
        <span className={styles.listName}>{item.name}</span>
        <StatusChip status={item.status} label={getStatusLabel(item.status)} />
      </div>
      <div className={styles.listBottom}>
        <span className={styles.listMeta}>{getStakeDisplay(item.stake)}</span>
        <span className={styles.listMeta}>
          {getWardDisplay(item.stake, item.ward)}
        </span>
        <span className={`${styles.listMeta} ${styles.listDate}`}>
          {new Date(item.createdAt).toLocaleDateString()}
        </span>
        <ReviewItemTags
          type={item.type}
          hasRecommendation={item.hasRecommendation}
          hasApplication={item.hasApplication}
        />
      </div>
    </button>
  );
};

