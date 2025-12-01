import { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { RecommendationComments } from './RecommendationComments';
import styles from '../LeaderRecommendations.module.scss';

interface CommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  recommendationId?: string;
  applicationId?: string;
  currentUserId?: string;
  onError: (error: string) => void;
}

export const CommentsModal = ({
  isOpen,
  onClose,
  recommendationId,
  applicationId,
  currentUserId,
  onError,
}: CommentsModalProps) => {
  const { t } = useTranslation();

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const modalContent = (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      className={styles.modalOverlay}
      onClick={onClose}
    >
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={t('leader.recommendations.form.leaderComment')}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {t('leader.recommendations.form.leaderComment')}
          </h2>
          <button
            type='button'
            className={styles.modalClose}
            onClick={onClose}
            aria-label={t('common.close')}
          >
            ×
          </button>
        </div>
        <div className={styles.modalBody}>
          <RecommendationComments
            recommendationId={recommendationId}
            applicationId={applicationId}
            currentUserId={currentUserId}
            onError={onError}
          />
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

