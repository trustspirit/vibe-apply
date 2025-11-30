import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import {
  LeaderRecommendation,
  CreateRecommendationDto,
  UpdateRecommendationDto,
  RecommendationStatus,
  UserRole,
} from '@vibe-apply/shared';
import { RecommendationCommentsService } from '../recommendation-comments/recommendation-comments.service';

@Injectable()
export class RecommendationsService {
  private readonly logger = new Logger(RecommendationsService.name);

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

    const stake = data.stake as string | undefined;
    const ward = data.ward as string | undefined;

    const result = {
      email: data.email as string | undefined,
      stake: stake ? stake.trim().toLowerCase() : undefined,
      ward: ward ? ward.trim().toLowerCase() : undefined,
    };

    return result;
  }

  async create(
    leaderId: string,
    createRecommendationDto: CreateRecommendationDto,
  ): Promise<LeaderRecommendation> {
    const timestamp = new Date().toISOString();
    const status = createRecommendationDto.status || RecommendationStatus.DRAFT;

    const normalizedEmail = createRecommendationDto.email
      ? createRecommendationDto.email.toLowerCase()
      : undefined;
    const normalizedName = (createRecommendationDto.name || '')
      .trim()
      .toLowerCase();
    const normalizedStake = (createRecommendationDto.stake || '')
      .trim()
      .toLowerCase();
    const normalizedWard = (createRecommendationDto.ward || '')
      .trim()
      .toLowerCase();

    if (normalizedEmail) {
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
      const duplicateRecommendation = existingRecommendations.docs.find(
        (doc) => {
          const data = doc.data();
          const existingName = (data.name as string)?.trim().toLowerCase();
          return existingName === normalizedName;
        },
      );

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
    }

    const recommendationData: Record<string, unknown> = {
      ...createRecommendationDto,
      stake: normalizedStake,
      ward: normalizedWard,
      moreInfo: createRecommendationDto.moreInfo || '',
      leaderId,
      status,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    if (normalizedEmail) {
      recommendationData.email = normalizedEmail;
    }

    const docRef = await this.firebaseService
      .getFirestore()
      .collection('recommendations')
      .add(recommendationData);

    const recommendation = {
      id: docRef.id,
      ...recommendationData,
    } as LeaderRecommendation;

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
    if (!recommendation.email) {
      return;
    }

    const normalizedEmail = recommendation.email.toLowerCase();
    const normalizedName = recommendation.name.trim().toLowerCase();
    const normalizedStake = recommendation.stake.trim().toLowerCase();
    const normalizedWard = recommendation.ward.trim().toLowerCase();

    const applicationsSnapshot = await this.firebaseService
      .getFirestore()
      .collection('applications')
      .where('email', '==', normalizedEmail)
      .where('stake', '==', normalizedStake)
      .where('ward', '==', normalizedWard)
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
    } else if (userRole === UserRole.STAKE_PRESIDENT) {
      if (!userStake) {
        return [];
      }
      const normalizedStake = userStake.trim().toLowerCase();
      query = baseQuery.where('stake', '==', normalizedStake);
    } else {
      query = baseQuery.orderBy('createdAt', 'desc');
    }

    const recommendationsSnapshot = await query.get();

    const recommendations = recommendationsSnapshot.docs.map((doc) => {
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

    const recommendations = recommendationsSnapshot.docs
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

    const draftCount = recommendations.filter(
      (rec) => rec.status === RecommendationStatus.DRAFT,
    ).length;
    this.logger.log(
      `[findByLeaderId] leaderId=${leaderId}, total=${recommendations.length}, draft=${draftCount}, statuses=${recommendations.map((r) => r.status).join(',')}`,
    );

    return recommendations;
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
      comments,
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
    await this.findOne(id);

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
