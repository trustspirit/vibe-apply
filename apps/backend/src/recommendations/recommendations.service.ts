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
  RecommendationComment,
} from '@vibe-apply/shared';
import { RecommendationCommentsService } from '../recommendation-comments/recommendation-comments.service';

@Injectable()
export class RecommendationsService {
  constructor(
    private firebaseService: FirebaseService,
    private recommendationCommentsService: RecommendationCommentsService,
  ) {}

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

    const normalizedEmail = createRecommendationDto.email.toLowerCase();
    const normalizedName = createRecommendationDto.name.trim().toLowerCase();
    const normalizedStake = createRecommendationDto.stake.trim().toLowerCase();
    const normalizedWard = createRecommendationDto.ward.trim().toLowerCase();

    // Check for existing recommendation with same leaderId, email, name, stake, ward
    const existingRecommendations = await this.firebaseService
      .getFirestore()
      .collection('recommendations')
      .where('leaderId', '==', leaderId)
      .where('email', '==', normalizedEmail)
      .where('stake', '==', normalizedStake)
      .where('ward', '==', normalizedWard)
      .get();

    // Check if any existing recommendation matches the name as well
    const duplicateRecommendation = existingRecommendations.docs.find((doc) => {
      const data = doc.data();
      const existingName = (data.name as string)?.trim().toLowerCase();
      return existingName === normalizedName;
    });

    if (duplicateRecommendation) {
      throw new BadRequestException(
        'A recommendation for this applicant already exists',
      );
    }

    // Also check if there's already a recommendation linked to the same application
    // by checking if any application with matching email/name/stake/ward exists
    // and if there's already a recommendation with that linkedApplicationId
    const applicationsSnapshot = await this.firebaseService
      .getFirestore()
      .collection('applications')
      .where('email', '==', normalizedEmail)
      .where('stake', '==', normalizedStake)
      .where('ward', '==', normalizedWard)
      .get();

    for (const appDoc of applicationsSnapshot.docs) {
      const appData = appDoc.data();
      const appName = (appData.name as string)?.trim().toLowerCase();
      if (appName === normalizedName) {
        // Check if there's already a recommendation linked to this application
        const linkedRecommendations = await this.firebaseService
          .getFirestore()
          .collection('recommendations')
          .where('leaderId', '==', leaderId)
          .where('linkedApplicationId', '==', appDoc.id)
          .get();

        if (!linkedRecommendations.empty) {
          throw new BadRequestException(
            'A recommendation for this applicant already exists',
          );
        }
      }
    }

    const recommendationData = {
      ...createRecommendationDto,
      stake: normalizedStake,
      ward: normalizedWard,
      email: normalizedEmail,
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

    // Return the updated recommendation with linkedApplicationId
    const updatedDoc = await this.firebaseService
      .getFirestore()
      .collection('recommendations')
      .doc(docRef.id)
      .get();

    const updatedData = updatedDoc.data() as Record<string, unknown>;
    return {
      id: updatedDoc.id,
      ...updatedData,
    } as LeaderRecommendation;
  }

  private async linkMatchingApplication(
    recommendation: LeaderRecommendation,
  ): Promise<void> {
    const normalizedEmail = recommendation.email.toLowerCase();
    const normalizedName = recommendation.name.trim().toLowerCase();

    const applicationsSnapshot = await this.firebaseService
      .getFirestore()
      .collection('applications')
      .where('email', '==', normalizedEmail)
      .where('stake', '==', recommendation.stake)
      .where('ward', '==', recommendation.ward)
      .get();

    // Find application that matches email, stake, ward, AND name
    const matchingApplication = applicationsSnapshot.docs.find((doc) => {
      const data = doc.data();
      const applicationName = (data.name as string)?.trim().toLowerCase();
      return applicationName === normalizedName;
    });

    if (matchingApplication) {
      await this.firebaseService
        .getFirestore()
        .collection('recommendations')
        .doc(recommendation.id)
        .update({
          linkedApplicationId: matchingApplication.id,
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

  async findOne(
    id: string,
    userRole?: UserRole,
  ): Promise<LeaderRecommendation> {
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

    const comments =
      userRole === UserRole.ADMIN ||
      userRole === UserRole.SESSION_LEADER ||
      userRole === UserRole.STAKE_PRESIDENT ||
      userRole === UserRole.BISHOP
        ? await this.recommendationCommentsService.findByRecommendationId(
            id,
            userRole,
          )
        : [];

    return {
      id: doc.id,
      ...data,
    } as LeaderRecommendation;
  }

  async update(
    id: string,
    updateRecommendationDto: UpdateRecommendationDto,
    userRole?: UserRole,
  ): Promise<LeaderRecommendation> {
    const existing = await this.findOne(id, userRole);

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
      ...(updateRecommendationDto.stake && {
        stake: updateRecommendationDto.stake.trim().toLowerCase(),
      }),
      ...(updateRecommendationDto.ward && {
        ward: updateRecommendationDto.ward.trim().toLowerCase(),
      }),
      ...(updateRecommendationDto.email && {
        email: updateRecommendationDto.email.toLowerCase(),
      }),
      updatedAt: new Date().toISOString(),
    };

    await this.firebaseService
      .getFirestore()
      .collection('recommendations')
      .doc(id)
      .update(updateData);

    return this.findOne(id, userRole);
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
