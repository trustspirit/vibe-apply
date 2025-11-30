import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import {
  RecommendationComment,
  CreateRecommendationCommentDto,
  UpdateRecommendationCommentDto,
  UserRole,
} from '@vibe-apply/shared';

@Injectable()
export class RecommendationCommentsService {
  constructor(private firebaseService: FirebaseService) {}

  async create(
    recommendationId: string | undefined,
    applicationId: string | undefined,
    userId: string,
    userName: string,
    userRole: UserRole,
    createCommentDto: CreateRecommendationCommentDto,
  ): Promise<RecommendationComment> {
    if (
      userRole !== UserRole.BISHOP &&
      userRole !== UserRole.STAKE_PRESIDENT
    ) {
      throw new ForbiddenException(
        'Only bishops and stake presidents can create comments',
      );
    }

    if (recommendationId) {
      const recommendationDoc = await this.firebaseService
        .getFirestore()
        .collection('recommendations')
        .doc(recommendationId)
        .get();

      if (!recommendationDoc.exists) {
        throw new NotFoundException('Recommendation not found');
      }
    }

    if (applicationId) {
      const applicationDoc = await this.firebaseService
        .getFirestore()
        .collection('applications')
        .doc(applicationId)
        .get();

      if (!applicationDoc.exists) {
        throw new NotFoundException('Application not found');
      }
    }

    if (!recommendationId && !applicationId) {
      throw new BadRequestException(
        'Either recommendationId or applicationId must be provided',
      );
    }

    const timestamp = new Date().toISOString();
    const commentData: Record<string, unknown> = {
      authorId: userId,
      authorName: userName,
      authorRole: userRole,
      content: createCommentDto.content,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    if (recommendationId) {
      commentData.recommendationId = recommendationId;
    }
    if (applicationId) {
      commentData.applicationId = applicationId;
    }

    const docRef = await this.firebaseService
      .getFirestore()
      .collection('recommendation-comments')
      .add(commentData);

    return {
      id: docRef.id,
      ...commentData,
    } as RecommendationComment;
  }

  async findByRecommendationId(
    recommendationId: string,
    userRole: UserRole,
  ): Promise<RecommendationComment[]> {
    if (
      userRole !== UserRole.ADMIN &&
      userRole !== UserRole.SESSION_LEADER &&
      userRole !== UserRole.STAKE_PRESIDENT &&
      userRole !== UserRole.BISHOP
    ) {
      return [];
    }

    try {
      const commentsSnapshot = await this.firebaseService
        .getFirestore()
        .collection('recommendation-comments')
        .where('recommendationId', '==', recommendationId)
        .get();

      const comments = commentsSnapshot.docs.map((doc) => {
        const data = doc.data() as Record<string, unknown>;
        return {
          id: doc.id,
          recommendationId: data.recommendationId as string | undefined,
          applicationId: data.applicationId as string | undefined,
          authorId: data.authorId as string,
          authorName: data.authorName as string,
          authorRole: data.authorRole as UserRole,
          content: data.content as string,
          createdAt: data.createdAt as string,
          updatedAt: data.updatedAt as string,
        };
      });

      return comments.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    } catch (error) {
      return [];
    }
  }

  async findByApplicationId(
    applicationId: string,
    userRole: UserRole,
  ): Promise<RecommendationComment[]> {
    if (
      userRole !== UserRole.ADMIN &&
      userRole !== UserRole.SESSION_LEADER &&
      userRole !== UserRole.STAKE_PRESIDENT &&
      userRole !== UserRole.BISHOP
    ) {
      return [];
    }

    try {
      const commentsSnapshot = await this.firebaseService
        .getFirestore()
        .collection('recommendation-comments')
        .where('applicationId', '==', applicationId)
        .get();

      const comments = commentsSnapshot.docs.map((doc) => {
        const data = doc.data() as Record<string, unknown>;
        return {
          id: doc.id,
          recommendationId: data.recommendationId as string | undefined,
          applicationId: data.applicationId as string | undefined,
          authorId: data.authorId as string,
          authorName: data.authorName as string,
          authorRole: data.authorRole as UserRole,
          content: data.content as string,
          createdAt: data.createdAt as string,
          updatedAt: data.updatedAt as string,
        };
      });

      return comments.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    } catch (error) {
      return [];
    }
  }

  async findOne(id: string): Promise<RecommendationComment> {
    const doc = await this.firebaseService
      .getFirestore()
      .collection('recommendation-comments')
      .doc(id)
      .get();

    if (!doc.exists) {
      throw new NotFoundException('Comment not found');
    }

    const data = doc.data() as Record<string, unknown> | undefined;
    if (!data) {
      throw new NotFoundException('Comment data not found');
    }

    return {
      id: doc.id,
      ...data,
    } as RecommendationComment;
  }

  async update(
    id: string,
    userId: string,
    updateCommentDto: UpdateRecommendationCommentDto,
  ): Promise<RecommendationComment> {
    const existing = await this.findOne(id);

    if (existing.authorId !== userId) {
      throw new ForbiddenException('You can only update your own comments');
    }

    const updateData = {
      content: updateCommentDto.content,
      updatedAt: new Date().toISOString(),
    };

    await this.firebaseService
      .getFirestore()
      .collection('recommendation-comments')
      .doc(id)
      .update(updateData);

    return this.findOne(id);
  }

  async remove(id: string, userId: string): Promise<void> {
    const existing = await this.findOne(id);

    if (existing.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.firebaseService
      .getFirestore()
      .collection('recommendation-comments')
      .doc(id)
      .delete();
  }
}

