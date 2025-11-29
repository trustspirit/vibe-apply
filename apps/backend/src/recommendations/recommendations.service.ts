import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import {
  LeaderRecommendation,
  CreateRecommendationDto,
  UpdateRecommendationDto,
  RecommendationStatus,
  UserRole,
} from '@vibe-apply/shared';

@Injectable()
export class RecommendationsService {
  constructor(private firebaseService: FirebaseService) {}

  async getUserData(userId: string): Promise<{
    email?: string;
    stake?: string;
    ward?: string;
  }> {
    const userDoc = await this.firebaseService
      .getFirestore()
      .collection('users')
      .doc(userId)
      .get();

    const data = userDoc.data() as Record<string, unknown> | undefined;
    if (!data) {
      return {};
    }

    return {
      email: data.email as string | undefined,
      stake: data.stake as string | undefined,
      ward: data.ward as string | undefined,
    };
  }

  async create(
    leaderId: string,
    createRecommendationDto: CreateRecommendationDto,
  ): Promise<LeaderRecommendation> {
    const timestamp = new Date().toISOString();
    const status = createRecommendationDto.status || RecommendationStatus.DRAFT;

    const recommendationData = {
      ...createRecommendationDto,
      stake: createRecommendationDto.stake.trim().toLowerCase(),
      ward: createRecommendationDto.ward.trim().toLowerCase(),
      email: createRecommendationDto.email.toLowerCase(),
      moreInfo: createRecommendationDto.moreInfo || '',
      leaderId,
      status,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const docRef = await this.firebaseService
      .getFirestore()
      .collection('recommendations')
      .add(recommendationData);

    const recommendation = {
      id: docRef.id,
      ...recommendationData,
    };

    await this.linkMatchingApplication(recommendation);

    return recommendation;
  }

  private async linkMatchingApplication(
    recommendation: LeaderRecommendation,
  ): Promise<void> {
    const applicationsSnapshot = await this.firebaseService
      .getFirestore()
      .collection('applications')
      .where('email', '==', recommendation.email.toLowerCase())
      .where('stake', '==', recommendation.stake)
      .where('ward', '==', recommendation.ward)
      .get();

    if (!applicationsSnapshot.empty) {
      const applicationDoc = applicationsSnapshot.docs[0];
      await this.firebaseService
        .getFirestore()
        .collection('recommendations')
        .doc(recommendation.id)
        .update({
          linkedApplicationId: applicationDoc.id,
          updatedAt: new Date().toISOString(),
        });
    }
  }

  async findAll(
    userRole?: string,
    userWard?: string,
    userStake?: string,
  ): Promise<LeaderRecommendation[]> {
    const baseQuery = this.firebaseService
      .getFirestore()
      .collection('recommendations');

    let query: FirebaseFirestore.Query;

    if (userRole === UserRole.BISHOP && userWard) {
      query = baseQuery.where('ward', '==', userWard.toLowerCase());
    } else if (userRole === UserRole.STAKE_PRESIDENT && userStake) {
      query = baseQuery.where('stake', '==', userStake.toLowerCase());
    } else {
      query = baseQuery.orderBy('createdAt', 'desc');
    }

    const recommendationsSnapshot = await query.get();

    const recommendations = recommendationsSnapshot.docs
      .filter((doc) => {
        const data = doc.data();
        return data.status !== RecommendationStatus.DRAFT;
      })
      .map((doc) => {
        const data = doc.data();
        const status = data.status as RecommendationStatus;
        const canModify =
          status !== RecommendationStatus.APPROVED &&
          status !== RecommendationStatus.REJECTED;

        return {
          id: doc.id,
          ...data,
          canEdit: canModify,
          canDelete: canModify,
        } as unknown as LeaderRecommendation;
      });

    if (userRole === UserRole.BISHOP || userRole === UserRole.STAKE_PRESIDENT) {
      recommendations.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }

    return recommendations;
  }

  async findByLeaderId(leaderId: string): Promise<LeaderRecommendation[]> {
    const recommendationsSnapshot = await this.firebaseService
      .getFirestore()
      .collection('recommendations')
      .where('leaderId', '==', leaderId)
      .get();

    return recommendationsSnapshot.docs
      .map((doc) => {
        const data = doc.data();
        const status = data.status as RecommendationStatus;
        const canModify =
          status !== RecommendationStatus.APPROVED &&
          status !== RecommendationStatus.REJECTED;

        return {
          id: doc.id,
          ...data,
          status: status,
          canEdit: canModify,
          canDelete: canModify,
        } as unknown as LeaderRecommendation;
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }

  async findOne(id: string): Promise<LeaderRecommendation> {
    const doc = await this.firebaseService
      .getFirestore()
      .collection('recommendations')
      .doc(id)
      .get();

    if (!doc.exists) {
      throw new NotFoundException('Recommendation not found');
    }

    const data = doc.data();
    if (!data) {
      throw new NotFoundException('Recommendation data not found');
    }

    return {
      id: doc.id,
      ...data,
    } as LeaderRecommendation;
  }

  async update(
    id: string,
    updateRecommendationDto: UpdateRecommendationDto,
  ): Promise<LeaderRecommendation> {
    const existing = await this.findOne(id);

    if (
      existing.status === RecommendationStatus.APPROVED ||
      existing.status === RecommendationStatus.REJECTED
    ) {
      throw new BadRequestException(
        'Cannot modify a recommendation that has been reviewed',
      );
    }

    const updateData = {
      ...updateRecommendationDto,
      ...(updateRecommendationDto.stake && { stake: updateRecommendationDto.stake.trim().toLowerCase() }),
      ...(updateRecommendationDto.ward && { ward: updateRecommendationDto.ward.trim().toLowerCase() }),
      ...(updateRecommendationDto.email && { email: updateRecommendationDto.email.toLowerCase() }),
      updatedAt: new Date().toISOString(),
    };

    await this.firebaseService
      .getFirestore()
      .collection('recommendations')
      .doc(id)
      .update(updateData);

    return this.findOne(id);
  }

  async updateStatus(
    id: string,
    status: RecommendationStatus,
  ): Promise<LeaderRecommendation> {
    const existing = await this.findOne(id);

    const updateData = {
      status,
      updatedAt: new Date().toISOString(),
    };

    await this.firebaseService
      .getFirestore()
      .collection('recommendations')
      .doc(id)
      .update(updateData);

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const existing = await this.findOne(id);

    if (
      existing.status === RecommendationStatus.APPROVED ||
      existing.status === RecommendationStatus.REJECTED
    ) {
      throw new BadRequestException(
        'Cannot delete a recommendation that has been reviewed',
      );
    }

    await this.firebaseService
      .getFirestore()
      .collection('recommendations')
      .doc(id)
      .delete();
  }
}
