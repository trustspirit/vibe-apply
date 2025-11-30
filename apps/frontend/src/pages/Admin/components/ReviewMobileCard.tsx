import { ComboBox } from '@/components/ui';
import { ReviewComments } from './ReviewComments';
import type { ReviewMobileCardProps } from '../types';
import styles from '../AdminReview.module.scss';

export const ReviewMobileCard = ({
  item,
  statusOptions,
  onStatusChange,
  getStakeDisplay,
  getWardDisplay,
  t,
}: ReviewMobileCardProps) => {
  return (
    <article className={styles.reviewCard}>
      <div className={styles.reviewCardHeader}>
        <div>
          <h2>{item.name}</h2>
          <p className={styles.reviewCardMeta}>
            {t('admin.review.submitted')}{' '}
            {new Date(item.createdAt).toLocaleString()}
          </p>
        </div>
        <ComboBox
          name={`mobile-status-${item.key}`}
          label={t('admin.review.statusLabel')}
          value={item.status}
          onChange={(event) => onStatusChange(item.key, event.target.value)}
          options={statusOptions}
          tone={item.status}
          wrapperClassName={styles.reviewCardStatus}
          labelClassName={styles.reviewCardStatusLabel}
          ariaLabel={t('admin.review.updateStatus', {
            name: item.name,
          })}
        />
      </div>

      <div className={styles.reviewCardTags}>
        {item.type === 'application' && (
          <>
            {item.hasRecommendation ? (
              <span
                className={`${styles.reviewCardTag} ${styles.reviewCardTagRecommendation}`}
              >
                {t('admin.review.tags.recommended')}
              </span>
            ) : (
              <span
                className={`${styles.reviewCardTag} ${styles.reviewCardTagApplication}`}
              >
                {t('admin.review.tags.applied')}
              </span>
            )}
          </>
        )}
        {item.type === 'recommendation' && (
          <>
            <span
              className={`${styles.reviewCardTag} ${styles.reviewCardTagRecommendation}`}
            >
              {t('admin.review.tags.recommended')}
            </span>
            {item.hasApplication && (
              <span
                className={`${styles.reviewCardTag} ${styles.reviewCardTagApplication}`}
              >
                {t('admin.review.tags.applied')}
              </span>
            )}
          </>
        )}
      </div>

      <dl className={styles.reviewCardGrid}>
        <div>
          <dt>{t('common.email')}</dt>
          <dd>{item.email}</dd>
        </div>
        <div>
          <dt>{t('common.phone')}</dt>
          <dd>{item.phone}</dd>
        </div>
        <div>
          <dt>{t('admin.review.age')}</dt>
          <dd>{item.age ?? t('admin.roles.nA')}</dd>
        </div>
        <div>
          <dt>{t('common.stake')}</dt>
          <dd>{getStakeDisplay(item.stake)}</dd>
        </div>
        <div>
          <dt>{t('common.ward')}</dt>
          <dd>{getWardDisplay(item.stake, item.ward)}</dd>
        </div>
        <div>
          <dt>{t('admin.review.gender')}</dt>
          <dd>{item.gender ?? t('admin.roles.nA')}</dd>
        </div>
      </dl>

      <div className={styles.reviewCardNotes}>
        <h3>{t('admin.review.additionalInfo')}</h3>
        <p>{item.moreInfo || t('admin.review.noAdditionalInfo')}</p>
      </div>

      {item.type === 'recommendation' && item.comments && (
        <ReviewComments
          comments={item.comments}
          className={styles.reviewCardNotes}
        />
      )}
    </article>
  );
};

