import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import styles from './ReviewItemTags.module.scss';

interface ReviewItemTagsProps {
  type: 'application' | 'recommendation';
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
      {type === 'application' && (
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
      {type === 'recommendation' && (
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
