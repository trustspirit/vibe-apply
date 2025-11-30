import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, TextField } from '@/components/ui';
import { recommendationCommentsApi } from '@/services/api';
import type { RecommendationComment } from '@vibe-apply/shared';
import type { RecommendationCommentsProps } from '../types';
import styles from '../LeaderRecommendations.module.scss';

export const RecommendationComments = ({
  recommendationId,
  currentUserId,
  onError,
}: RecommendationCommentsProps) => {
  const { t } = useTranslation();
  const [comments, setComments] = useState<RecommendationComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentContent, setEditingCommentContent] = useState('');
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  useEffect(() => {
    const loadComments = async () => {
      setIsLoadingComments(true);
      try {
        const fetchedComments =
          await recommendationCommentsApi.getAll(recommendationId);
        setComments(fetchedComments);
      } catch (error) {
        onError(
          (error as Error).message ||
            t('leader.recommendations.messages.failedToLoadComments')
        );
      } finally {
        setIsLoadingComments(false);
      }
    };

    if (recommendationId) {
      loadComments();
    }
  }, [recommendationId, onError, t]);

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      return;
    }

    try {
      const newCommentData = await recommendationCommentsApi.create(
        recommendationId,
        newComment.trim()
      );
      setComments((prev) => [newCommentData, ...prev]);
      setNewComment('');
    } catch (error) {
      onError(
        (error as Error).message ||
          t('leader.recommendations.messages.failedToAddComment')
      );
    }
  };

  const handleStartEditComment = (commentId: string) => {
    const comment = comments.find((c) => c.id === commentId);
    if (comment && comment.authorId === currentUserId) {
      setEditingCommentId(commentId);
      setEditingCommentContent(comment.content);
    }
  };

  const handleCancelEditComment = () => {
    setEditingCommentId(null);
    setEditingCommentContent('');
  };

  const handleUpdateComment = async (commentId: string) => {
    if (!editingCommentContent.trim()) {
      return;
    }

    try {
      const updatedComment = await recommendationCommentsApi.update(
        commentId,
        editingCommentContent.trim()
      );
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? updatedComment : c))
      );
      setEditingCommentId(null);
      setEditingCommentContent('');
    } catch (error) {
      onError(
        (error as Error).message ||
          t('leader.recommendations.messages.failedToUpdateComment')
      );
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    const comment = comments.find((c) => c.id === commentId);
    if (!comment || comment.authorId !== currentUserId) {
      return;
    }

    if (
      !window.confirm(t('leader.recommendations.messages.confirmDeleteComment'))
    ) {
      return;
    }

    try {
      await recommendationCommentsApi.delete(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (error) {
      onError(
        (error as Error).message ||
          t('leader.recommendations.messages.failedToDeleteComment')
      );
    }
  };

  return (
    <div className={styles.commentsSection}>
      <h3 className={styles.commentsTitle}>
        {t('leader.recommendations.form.leaderComment')}
      </h3>
      {isLoadingComments ? (
        <p className={styles.commentsLoading}>{t('common.loading')}</p>
      ) : (
        <>
          {comments.length > 0 && (
            <div className={styles.commentsList}>
              {comments.map((comment) => (
                <div key={comment.id} className={styles.commentItem}>
                  {editingCommentId === comment.id ? (
                    <div className={styles.commentEdit}>
                      <TextField
                        value={editingCommentContent}
                        onChange={(e) =>
                          setEditingCommentContent(e.target.value)
                        }
                        multiline
                        rows={3}
                        wrapperClassName={styles.commentEditField}
                      />
                      <div className={styles.commentEditActions}>
                        <Button
                          type='button'
                          variant='primary'
                          onClick={() => handleUpdateComment(comment.id)}
                          className={styles.btnSmall}
                        >
                          {t('common.save')}
                        </Button>
                        <Button
                          type='button'
                          onClick={handleCancelEditComment}
                          className={styles.btnSmall}
                        >
                          {t('common.cancel')}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className={styles.commentHeader}>
                        <div className={styles.commentHeaderInfo}>
                          <span className={styles.commentAuthor}>
                            {comment.authorName}
                          </span>
                          <span className={styles.commentDate}>
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {comment.authorId === currentUserId && (
                          <div className={styles.commentActions}>
                            <Button
                              type='button'
                              variant='text'
                              onClick={() => handleStartEditComment(comment.id)}
                              className={styles.btnText}
                            >
                              {t('common.edit')}
                            </Button>
                            <Button
                              type='button'
                              variant='text'
                              onClick={() => handleDeleteComment(comment.id)}
                              className={styles.btnText}
                            >
                              {t('common.delete')}
                            </Button>
                          </div>
                        )}
                      </div>
                      <p className={styles.commentContent}>{comment.content}</p>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
          <div className={styles.commentAdd}>
            <TextField
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={t(
                'leader.recommendations.form.leaderCommentPlaceholder'
              )}
              multiline
              rows={3}
              wrapperClassName={styles.commentAddField}
            />
            <Button
              type='button'
              variant='primary'
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              className={styles.btnSmall}
            >
              {t('common.add')}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
