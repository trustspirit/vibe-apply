import { useTranslation } from 'react-i18next';
import type { ReviewCommentsProps } from '../types';
import styles from '../AdminReview.module.scss';

export const ReviewComments = ({
  comments,
  className,
}: ReviewCommentsProps) => {
  const { t } = useTranslation();

  if (!comments || comments.length === 0) {
    return null;
  }

  return (
    <div className={className || styles.notes}>
      <h3>{t('admin.review.leaderComment')}</h3>
      {comments.map((comment) => (
        <div key={comment.id} className={styles.commentItem}>
          <div className={styles.commentHeader}>
            <span className={styles.commentAuthor}>
              {comment.authorName} ({comment.authorRole})
            </span>
            <span className={styles.commentDate}>
              {new Date(comment.createdAt).toLocaleDateString()}
            </span>
          </div>
          <p className={styles.commentContent}>{comment.content}</p>
        </div>
      ))}
    </div>
  );
};

