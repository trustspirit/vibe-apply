import clsx from 'clsx';
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
  return (
    <div className={styles.listTags}>
      {type === 'application' && (
        <>
          {hasRecommendation ? (
            <span
              className={clsx(styles.listTag, styles.listTagRecommendation)}
            >
              Recommended
            </span>
          ) : (
            <span className={clsx(styles.listTag, styles.listTagApplication)}>
              Applied
            </span>
          )}
        </>
      )}
      {type === 'recommendation' && (
        <>
          <span className={clsx(styles.listTag, styles.listTagRecommendation)}>
            Recommended
          </span>
          {hasApplication && (
            <span className={clsx(styles.listTag, styles.listTagApplication)}>
              Applied
            </span>
          )}
        </>
      )}
    </div>
  );
};
