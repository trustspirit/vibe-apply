import React from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import type { Application } from '@vibe-apply/shared';
import { ApplicationStatus, RecommendationStatus } from '@vibe-apply/shared';
import {
  Alert,
  Button,
  DetailsGrid,
  DetailsGridItem,
  DetailsNotes,
  StatusChip,
} from '@/components/ui';
import { RecommendationComments } from './RecommendationComments';
import { getStakeLabel, getWardLabel } from '@/utils/stakeWardData';
import type { RecommendationDetailsProps } from '../types';
import styles from '../LeaderRecommendations.module.scss';

export const RecommendationDetails = ({
  selectedItem,
  isEditing,
  currentUserId,
  getStatusLabel,
  onRecommendApplicant,
  onModify,
  onQuickSubmit,
  onCancelSubmission,
  onDelete,
  onError,
  renderForm,
  formError,
}: RecommendationDetailsProps) => {
  const { t } = useTranslation();

  if (isEditing) {
    return (
      <div className={`${styles.detailsCard} ${styles.formCard}`}>
        {renderForm()}
      </div>
    );
  }

  if (!selectedItem) {
    return (
      <div className={styles.placeholder}>
        {t('leader.recommendations.details.selectRecommendation')}
      </div>
    );
  }

  if ('isApplication' in selectedItem && selectedItem.isApplication) {
    return (
      <div className={styles.detailsCard}>
        {formError && (
          <Alert variant='error' className={`${styles.alert} ${styles.alertError}`}>
            {formError}
          </Alert>
        )}
        <header className={styles.detailsHeader}>
          <div className={styles.detailsInfo}>
            <div className={styles.detailsHeading}>
              <h2>{selectedItem.name}</h2>
            </div>
            <p className={styles.detailsMeta}>
              {t('leader.recommendations.details.applicationSubmitted')}{' '}
              {new Date(selectedItem.createdAt).toLocaleString()}
            </p>
          </div>
          <StatusChip
            status={
              'status' in selectedItem
                ? selectedItem.status
                : ApplicationStatus.AWAITING
            }
            label={
              'status' in selectedItem
                ? getStatusLabel(selectedItem.status, true)
                : undefined
            }
          />
        </header>
        <DetailsGrid>
          <DetailsGridItem label={t('common.email')}>
            {selectedItem.email}
          </DetailsGridItem>
          <DetailsGridItem label={t('common.phone')}>
            {selectedItem.phone}
          </DetailsGridItem>
          <DetailsGridItem label={t('leader.recommendations.form.age')}>
            {selectedItem.age ?? t('admin.roles.nA')}
          </DetailsGridItem>
          <DetailsGridItem label={t('common.stake')}>
            {getStakeLabel(selectedItem.stake) || selectedItem.stake}
          </DetailsGridItem>
          <DetailsGridItem label={t('common.ward')}>
            {getWardLabel(selectedItem.stake, selectedItem.ward) ||
              selectedItem.ward}
          </DetailsGridItem>
          <DetailsGridItem label={t('leader.recommendations.form.gender')}>
            {selectedItem.gender ?? t('admin.roles.nA')}
          </DetailsGridItem>
          {'servedMission' in selectedItem &&
            selectedItem.servedMission !== undefined && (
              <DetailsGridItem
                label={t('leader.recommendations.form.servedMission')}
              >
                {selectedItem.servedMission
                  ? t('common.yes')
                  : t('common.no')}
              </DetailsGridItem>
            )}
        </DetailsGrid>
        <RecommendationComments
          applicationId={selectedItem.id}
          currentUserId={currentUserId}
          onError={onError}
        />
        {(() => {
          if (
            'isApplication' in selectedItem &&
            selectedItem.isApplication
          ) {
            const appStatus =
              selectedItem.status as unknown as ApplicationStatus;
            return appStatus !== ApplicationStatus.APPROVED;
          } else {
            const recStatus =
              selectedItem.status as unknown as RecommendationStatus;
            return recStatus !== RecommendationStatus.APPROVED;
          }
        })() && (
          <div className={styles.detailActions}>
            {(() => {
              if (
                'isApplication' in selectedItem &&
                selectedItem.isApplication
              ) {
                const hasRecommendation =
                  selectedItem.hasRecommendation ?? false;
                if (hasRecommendation) {
                  return (
                    <Button
                      type='button'
                      variant='primary'
                      disabled
                      className={styles.btn}
                    >
                      {t('leader.recommendations.actions.recommended')}
                    </Button>
                  );
                }
                return (
                  <Button
                    type='button'
                    variant='primary'
                    onClick={() =>
                      onRecommendApplicant(selectedItem as Application)
                    }
                    className={styles.btn}
                  >
                    {t('leader.recommendations.actions.recommend')}
                  </Button>
                );
              }
              return null;
            })()}
          </div>
        )}
      </div>
    );
  }

  const updatedLabel = `${t('leader.recommendations.details.updated')} ${new Date(selectedItem.updatedAt).toLocaleString()}`;
  const canModify =
    'canEdit' in selectedItem &&
    selectedItem.canEdit &&
    'canDelete' in selectedItem &&
    selectedItem.canDelete;

  return (
    <div className={styles.detailsCard}>
      <header className={styles.detailsHeader}>
        <div className={styles.detailsInfo}>
          <div className={styles.detailsHeading}>
            <h2>{selectedItem.name}</h2>
            <div className={styles.detailsTags}>
              {!(
                'isApplication' in selectedItem &&
                selectedItem.isApplication
              ) && (
                <>
                  <span
                    className={clsx(
                      styles.detailsTag,
                      styles.detailsTagRecommendation
                    )}
                  >
                    {t('leader.recommendations.tags.recommended')}
                  </span>
                  {'hasApplication' in selectedItem &&
                    selectedItem.hasApplication && (
                      <span
                        className={clsx(
                          styles.detailsTag,
                          styles.detailsTagApplication
                        )}
                      >
                        {t('leader.recommendations.tags.applied')}
                      </span>
                    )}
                </>
              )}
              {'isApplication' in selectedItem &&
                selectedItem.isApplication && (
                  <>
                    <span
                      className={clsx(
                        styles.detailsTag,
                        styles.detailsTagApplication
                      )}
                    >
                      {t('leader.recommendations.tags.applied')}
                    </span>
                    {selectedItem.hasRecommendation && (
                      <span
                        className={clsx(
                          styles.detailsTag,
                          styles.detailsTagRecommendation
                        )}
                      >
                        {t('leader.recommendations.tags.recommended')}
                      </span>
                    )}
                  </>
                )}
            </div>
          </div>
          <p className={styles.detailsMeta}>{updatedLabel}</p>
        </div>
        {'status' in selectedItem && selectedItem.status && (
          <StatusChip
            status={selectedItem.status}
            label={getStatusLabel(selectedItem.status, false)}
          />
        )}
      </header>
      <DetailsGrid>
        <DetailsGridItem label={t('common.email')}>
          {selectedItem.email || t('admin.roles.nA')}
        </DetailsGridItem>
        <DetailsGridItem label={t('common.phone')}>
          {selectedItem.phone}
        </DetailsGridItem>
        <DetailsGridItem label={t('leader.recommendations.form.age')}>
          {selectedItem.age ?? t('admin.roles.nA')}
        </DetailsGridItem>
        <DetailsGridItem label={t('common.stake')}>
          {getStakeLabel(selectedItem.stake) || selectedItem.stake}
        </DetailsGridItem>
        <DetailsGridItem label={t('common.ward')}>
          {getWardLabel(selectedItem.stake, selectedItem.ward) ||
            selectedItem.ward}
        </DetailsGridItem>
        <DetailsGridItem label={t('leader.recommendations.form.gender')}>
          {selectedItem.gender ?? t('admin.roles.nA')}
        </DetailsGridItem>
        {'servedMission' in selectedItem &&
          selectedItem.servedMission !== undefined && (
            <DetailsGridItem
              label={t('leader.recommendations.form.servedMission')}
            >
              {selectedItem.servedMission
                ? t('common.yes')
                : t('common.no')}
            </DetailsGridItem>
          )}
      </DetailsGrid>
      <DetailsNotes
        title={t('leader.recommendations.details.additionalInfo')}
      >
        {selectedItem.moreInfo ||
          t('leader.recommendations.details.noAdditionalInfo')}
      </DetailsNotes>
      {!('isApplication' in selectedItem) && (
        <RecommendationComments
          recommendationId={selectedItem.id}
          currentUserId={currentUserId}
          onError={onError}
        />
      )}
      <div className={styles.detailActions}>
        {canModify && (
          <>
            <Button
              type='button'
              onClick={() => onModify(selectedItem.id)}
              className={styles.btn}
            >
              {t('leader.recommendations.actions.modify')}
            </Button>
            {'status' in selectedItem &&
            selectedItem.status === RecommendationStatus.DRAFT ? (
              <Button
                type='button'
                variant='primary'
                onClick={() => onQuickSubmit(selectedItem.id)}
                className={styles.btn}
              >
                {t('leader.recommendations.actions.submit')}
              </Button>
            ) : (
              <Button
                type='button'
                onClick={() => onCancelSubmission(selectedItem.id)}
                className={styles.btn}
              >
                {t('leader.recommendations.actions.cancelSubmission')}
              </Button>
            )}
            <Button
              type='button'
              variant='danger'
              onClick={() => onDelete(selectedItem.id)}
              className={styles.btn}
            >
              {t('leader.recommendations.actions.delete')}
            </Button>
          </>
        )}
        {!canModify && (
          <p className={styles.lockedMessage}>
            {t('leader.recommendations.details.lockedMessage')}
          </p>
        )}
      </div>
    </div>
  );
};

