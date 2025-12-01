import { ComboBox, DetailsGrid, DetailsGridItem, DetailsNotes } from '@/components/ui';
import { ApplicationStatus } from '@vibe-apply/shared';
import { ITEM_TYPES } from '@/utils/constants';
import { ReviewComments } from './ReviewComments';
import type { ReviewDetailsProps } from '../types';
import styles from '../AdminReview.module.scss';

export const ReviewDetails = ({
  selectedItem,
  statusSelection,
  statusOptions,
  onStatusChange,
  getStakeDisplay,
  getWardDisplay,
  t,
}: ReviewDetailsProps) => {
  const currentStatus = statusSelection ?? selectedItem.status;
  const statusSelectId = `review-status-${selectedItem.key}`;

  return (
    <div className={styles.detailsCard}>
      <header className={styles.detailsHeader}>
        <div className={styles.detailsInfo}>
          <div className={styles.detailsHeading}>
            <h2>{selectedItem.name}</h2>
            <div className={styles.detailsTags}>
              {selectedItem.type === ITEM_TYPES.APPLICATION && (
                <>
                  {selectedItem.hasRecommendation ? (
                    <span
                      className={`${styles.detailsTag} ${styles.detailsTagRecommendation}`}
                    >
                      {t('admin.review.tags.recommended')}
                    </span>
                  ) : (
                    <span
                      className={`${styles.detailsTag} ${styles.detailsTagApplication}`}
                    >
                      {t('admin.review.tags.applied')}
                    </span>
                  )}
                </>
              )}
              {selectedItem.type === ITEM_TYPES.RECOMMENDATION && (
                <>
                  <span
                    className={`${styles.detailsTag} ${styles.detailsTagRecommendation}`}
                  >
                    {t('admin.review.tags.recommended')}
                  </span>
                  {selectedItem.hasApplication && (
                    <span
                      className={`${styles.detailsTag} ${styles.detailsTagApplication}`}
                    >
                      {t('admin.review.tags.applied')}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
          <p className={styles.detailsMeta}>
            {t('admin.review.submitted')}{' '}
            {new Date(selectedItem.createdAt).toLocaleString()}
          </p>
        </div>

        <div className={styles.statusControl}>
          <ComboBox
            id={statusSelectId}
            name='status'
            label={t('admin.review.statusLabel')}
            value={currentStatus ?? ApplicationStatus.AWAITING}
            onChange={onStatusChange}
            tone={currentStatus ?? ApplicationStatus.AWAITING}
            options={statusOptions}
            wrapperClassName={styles.statusLabel}
            labelClassName={styles.statusText}
          />
          <span className={styles.statusHint}>
            {t('admin.review.statusHint')}
          </span>
        </div>
      </header>

      <DetailsGrid className={styles.grid}>
        <DetailsGridItem label={t('common.email')}>
          {selectedItem.email}
        </DetailsGridItem>
        <DetailsGridItem label={t('common.phone')}>
          {selectedItem.phone}
        </DetailsGridItem>
        <DetailsGridItem label={t('admin.review.age')}>
          {selectedItem.age ?? t('admin.roles.nA')}
        </DetailsGridItem>
        <DetailsGridItem label={t('common.stake')}>
          {getStakeDisplay(selectedItem.stake)}
        </DetailsGridItem>
        <DetailsGridItem label={t('common.ward')}>
          {getWardDisplay(selectedItem.stake, selectedItem.ward)}
        </DetailsGridItem>
        <DetailsGridItem label={t('admin.review.gender')}>
          {selectedItem.gender ?? t('admin.roles.nA')}
        </DetailsGridItem>
      </DetailsGrid>

      <DetailsNotes
        title={t('admin.review.additionalInfo')}
        className={styles.notes}
      >
        {selectedItem.moreInfo || t('admin.review.noAdditionalInfo')}
      </DetailsNotes>

      {selectedItem.type === ITEM_TYPES.RECOMMENDATION && selectedItem.comments && (
        <ReviewComments
          comments={selectedItem.comments}
          className={styles.notes}
        />
      )}
    </div>
  );
};

