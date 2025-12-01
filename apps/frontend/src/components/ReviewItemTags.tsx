import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { ITEM_TYPES, type ItemType } from '@/utils/constants';
import styles from './ReviewItemTags.module.scss';

interface ReviewItemTagsProps {
  type: ItemType;
  hasRecommendation?: boolean;
  hasApplication?: boolean;
}

/**
 * ReviewItemTags component displays status tags for review items
 * Shows whether an item is an application, recommendation, or both
 */
export const ReviewItemTags = ({
  type,
  hasRecommendation = false,
  hasApplication = false,
}: ReviewItemTagsProps) => {
  const { t } = useTranslation();

  return (
    <div className={styles.listTags}>
      {type === ITEM_TYPES.APPLICATION && (
        <>
          {hasRecommendation ? (
            <span
              className={clsx(styles.listTag, styles.listTagRecommendation)}
            >
              {t('admin.review.tags.recommended')}
            </span>
          ) : (
            <span className={clsx(styles.listTag, styles.listTagApplication)}>
              {t('admin.review.tags.applied')}
            </span>
          )}
        </>
      )}
      {type === ITEM_TYPES.RECOMMENDATION && (
        <>
          <span className={clsx(styles.listTag, styles.listTagRecommendation)}>
            {t('admin.review.tags.recommended')}
          </span>
          {hasApplication && (
            <span className={clsx(styles.listTag, styles.listTagApplication)}>
              {t('admin.review.tags.applied')}
            </span>
          )}
        </>
      )}
    </div>
  );
};
