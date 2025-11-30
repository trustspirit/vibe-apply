import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import type { Application } from '@vibe-apply/shared';
import { ApplicationStatus, RecommendationStatus } from '@vibe-apply/shared';
import {
  Button,
  DetailsGrid,
  DetailsGridItem,
  DetailsNotes,
  StatusChip,
} from '@/components/ui';
import { getStakeLabel, getWardLabel } from '@/utils/stakeWardData';
import type { RecommendationMobileCardProps } from '../types';
import styles from '../LeaderRecommendations.module.scss';

export const RecommendationMobileCard = ({
  item,
  isEditingThis,
  getStatusLabel,
  onRecommendApplicant,
  onModify,
  onQuickSubmit,
  onCancelSubmission,
  onDelete,
}: RecommendationMobileCardProps) => {
  const { t } = useTranslation();

  if ('isApplication' in item && item.isApplication) {
    return (
      <article
        key={item.id}
        className={`${styles.reviewCard} ${styles.mobileCard}`}
      >
        <div className={styles.reviewCardHeader}>
          <div>
            <h2>{item.name}</h2>
            <p className={styles.reviewCardMeta}>
              {t('leader.recommendations.details.applicationSubmitted')}{' '}
              {new Date(item.createdAt).toLocaleString()}
            </p>
          </div>
          <StatusChip
            status={'status' in item ? item.status : ApplicationStatus.AWAITING}
            label={
              'status' in item ? getStatusLabel(item.status, true) : undefined
            }
          />
        </div>
        <DetailsGrid className={styles.reviewCardGrid}>
          <DetailsGridItem label={t('common.email')}>
            {item.email || t('admin.roles.nA')}
          </DetailsGridItem>
          <DetailsGridItem label={t('common.phone')}>
            {item.phone}
          </DetailsGridItem>
          <DetailsGridItem label={t('leader.recommendations.form.age')}>
            {item.age ?? t('admin.roles.nA')}
          </DetailsGridItem>
          <DetailsGridItem label={t('common.stake')}>
            {getStakeLabel(item.stake) || item.stake}
          </DetailsGridItem>
          <DetailsGridItem label={t('common.ward')}>
            {getWardLabel(item.stake, item.ward) || item.ward}
          </DetailsGridItem>
          <DetailsGridItem label={t('leader.recommendations.form.gender')}>
            {item.gender ?? t('admin.roles.nA')}
          </DetailsGridItem>
          {'servedMission' in item && item.servedMission !== undefined && (
            <DetailsGridItem
              label={t('leader.recommendations.form.servedMission')}
            >
              {item.servedMission ? t('common.yes') : t('common.no')}
            </DetailsGridItem>
          )}
        </DetailsGrid>
        {(() => {
          if ('isApplication' in item && item.isApplication) {
            const appStatus = item.status as unknown as ApplicationStatus;
            return appStatus !== ApplicationStatus.APPROVED;
          } else {
            const recStatus = item.status as unknown as RecommendationStatus;
            return recStatus !== RecommendationStatus.APPROVED;
          }
        })() && (
          <div className={styles.cardActions}>
            {(() => {
              if ('isApplication' in item && item.isApplication) {
                const hasRecommendation = item.hasRecommendation ?? false;
                return (
                  <Button
                    type='button'
                    variant='primary'
                    onClick={() => onRecommendApplicant(item as Application)}
                    disabled={hasRecommendation}
                    className={styles.btn}
                  >
                    {hasRecommendation
                      ? t('leader.recommendations.actions.recommended')
                      : t('leader.recommendations.actions.recommend')}
                  </Button>
                );
              }
              return null;
            })()}
          </div>
        )}
      </article>
    );
  }

  return (
    <article
      key={item.id}
      className={clsx(
        styles.reviewCard,
        styles.mobileCard,
        isEditingThis && styles.mobileCardEditing
      )}
    >
      <div className={styles.reviewCardHeader}>
        <div>
          <h2>{item.name}</h2>
          <p className={styles.reviewCardMeta}>
            {t('leader.recommendations.details.updated')}{' '}
            {new Date(item.updatedAt).toLocaleString()}
          </p>
        </div>
        {'status' in item && (
          <StatusChip
            status={item.status}
            label={getStatusLabel(item.status, false)}
          />
        )}
      </div>
      <div className={styles.reviewCardTags}>
        {!('isApplication' in item && item.isApplication) && (
          <>
            <span
              className={clsx(
                styles.reviewCardTag,
                styles.reviewCardTagRecommendation
              )}
            >
              {t('leader.recommendations.tags.recommended')}
            </span>
            {'hasApplication' in item && item.hasApplication && (
              <span
                className={clsx(
                  styles.reviewCardTag,
                  styles.reviewCardTagApplication
                )}
              >
                {t('leader.recommendations.tags.applied')}
              </span>
            )}
          </>
        )}
        {'isApplication' in item && item.isApplication && (
          <>
            <span
              className={clsx(
                styles.reviewCardTag,
                styles.reviewCardTagApplication
              )}
            >
              {t('leader.recommendations.tags.applied')}
            </span>
            {item.hasRecommendation && (
              <span
                className={clsx(
                  styles.reviewCardTag,
                  styles.reviewCardTagRecommendation
                )}
              >
                {t('leader.recommendations.tags.recommended')}
              </span>
            )}
          </>
        )}
      </div>
      <DetailsGrid className={styles.reviewCardGrid}>
        <DetailsGridItem label={t('common.email')}>
          {item.email || t('admin.roles.nA')}
        </DetailsGridItem>
        <DetailsGridItem label={t('common.phone')}>
          {item.phone}
        </DetailsGridItem>
        <DetailsGridItem label={t('leader.recommendations.form.age')}>
          {item.age ?? t('admin.roles.nA')}
        </DetailsGridItem>
        <DetailsGridItem label={t('common.stake')}>
          {getStakeLabel(item.stake) || item.stake}
        </DetailsGridItem>
        <DetailsGridItem label={t('common.ward')}>
          {getWardLabel(item.stake, item.ward) || item.ward}
        </DetailsGridItem>
        <DetailsGridItem label={t('leader.recommendations.form.gender')}>
          {item.gender ?? t('admin.roles.nA')}
        </DetailsGridItem>
        {'servedMission' in item && item.servedMission !== undefined && (
          <DetailsGridItem
            label={t('leader.recommendations.form.servedMission')}
          >
            {item.servedMission ? t('common.yes') : t('common.no')}
          </DetailsGridItem>
        )}
      </DetailsGrid>
      <DetailsNotes
        title={t('leader.recommendations.details.additionalInfo')}
        className={styles.reviewCardNotes}
      >
        {item.moreInfo || t('leader.recommendations.details.noAdditionalInfo')}
      </DetailsNotes>
      <div className={styles.cardActions}>
        {'canEdit' in item &&
        item.canEdit &&
        'canDelete' in item &&
        item.canDelete ? (
          <>
            <Button
              type='button'
              onClick={() => onModify(item.id)}
              className={styles.btn}
            >
              {t('leader.recommendations.actions.modify')}
            </Button>
            {'status' in item && item.status === RecommendationStatus.DRAFT ? (
              <Button
                type='button'
                variant='primary'
                onClick={() => onQuickSubmit(item.id)}
                className={styles.btn}
              >
                {t('leader.recommendations.actions.submit')}
              </Button>
            ) : (
              <Button
                type='button'
                onClick={() => onCancelSubmission(item.id)}
                className={styles.btn}
              >
                {t('leader.recommendations.actions.cancelSubmission')}
              </Button>
            )}
            <Button
              type='button'
              variant='danger'
              onClick={() => onDelete(item.id)}
              className={styles.btn}
            >
              {t('leader.recommendations.actions.delete')}
            </Button>
          </>
        ) : (
          <p className={styles.lockedMessage}>
            {t('leader.recommendations.details.lockedMessage')}
          </p>
        )}
      </div>
      {isEditingThis && (
        <p className={styles.mobileEditingNote}>
          {t('leader.recommendations.mobileEditingNote')}
        </p>
      )}
    </article>
  );
};
