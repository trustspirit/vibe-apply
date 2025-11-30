import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { ApplicationStatus, RecommendationStatus } from '@vibe-apply/shared';
import { StatusChip } from '@/components/ui';
import { getStakeLabel, getWardLabel } from '@/utils/stakeWardData';
import type { RecommendationListItemProps } from '../types';
import styles from '../LeaderRecommendations.module.scss';

export const RecommendationListItem = ({
  item,
  isSelected,
  isActive,
  onSelect,
  getStatusLabel,
}: RecommendationListItemProps) => {
  const { t } = useTranslation();
  const listItemClassName = clsx(
    styles.listItem,
    (isSelected || isActive) && styles.listItemActive
  );

  const dateToShow = item.updatedAt || item.createdAt;

  return (
    <button
      type='button'
      className={listItemClassName}
      onClick={() => onSelect(item.id)}
      aria-current={isSelected ? 'true' : 'false'}
    >
      <div className={styles.listTop}>
        <span className={styles.listName}>{item.name}</span>
        {'isApplication' in item && item.isApplication ? (
          <StatusChip
            status={'status' in item ? item.status : ApplicationStatus.AWAITING}
            label={
              'status' in item ? getStatusLabel(item.status, true) : undefined
            }
          />
        ) : (
          <StatusChip
            status={'status' in item ? item.status : RecommendationStatus.DRAFT}
            label={
              'status' in item ? getStatusLabel(item.status, false) : undefined
            }
          />
        )}
      </div>
      <div className={styles.listBottom}>
        <span className={styles.listMeta}>
          {getStakeLabel(item.stake) || item.stake}
        </span>
        <span className={styles.listMeta}>
          {getWardLabel(item.stake, item.ward) || item.ward}
        </span>
        <span className={clsx(styles.listMeta, styles.listDate)}>
          {new Date(dateToShow).toLocaleDateString()}
        </span>
        <div className={styles.listTags}>
          {!('isApplication' in item && item.isApplication) && (
            <span
              className={clsx(styles.listTag, styles.listTagRecommendation)}
            >
              {t('leader.recommendations.tags.recommended')}
            </span>
          )}
          {'isApplication' in item && item.isApplication && (
            <>
              {item.hasRecommendation ? (
                <span
                  className={clsx(styles.listTag, styles.listTagRecommendation)}
                >
                  {t('leader.recommendations.tags.recommended')}
                </span>
              ) : (
                <span
                  className={clsx(styles.listTag, styles.listTagApplication)}
                >
                  {t('leader.recommendations.tags.applied')}
                </span>
              )}
            </>
          )}
          {!('isApplication' in item && item.isApplication) &&
            'hasApplication' in item &&
            item.hasApplication && (
              <span className={clsx(styles.listTag, styles.listTagApplication)}>
                {t('leader.recommendations.tags.applied')}
              </span>
            )}
        </div>
      </div>
    </button>
  );
};
