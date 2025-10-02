import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import {
  LeaderRecommendation,
  CreateRecommendationDto,
  UpdateRecommendationDto,
  RecommendationStatus,
} from '@vibe-apply/shared';

@Injectable()
export class RecommendationsService {
  constructor(private firebaseService: FirebaseService) {}

  async create(
    leaderId: string,
    createRecommendationDto: CreateRecommendationDto,
  ): Promise<LeaderRecommendation> {
    const timestamp = new Date().toISOString();
    const status = createRecommendationDto.status || RecommendationStatus.DRAFT;

    const recommendationData = {
      ...createRecommendationDto,
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

  async findAll(): Promise<LeaderRecommendation[]> {
    const recommendationsSnapshot = await this.firebaseService
      .getFirestore()
      .collection('recommendations')
      .orderBy('createdAt', 'desc')
      .get();

    return recommendationsSnapshot.docs
      .filter((doc) => {
        const data = doc.data();
        return data.status !== RecommendationStatus.DRAFT;
      })
      .map((doc) => {
        const data = doc.data();
        const status = data.status as RecommendationStatus;
        const canModify = status !== RecommendationStatus.APPROVED && status !== RecommendationStatus.REJECTED;
        
        return {
          id: doc.id,
          ...data,
          canEdit: canModify,
          canDelete: canModify,
        } as any;
      });
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
        const canModify = status !== RecommendationStatus.APPROVED && status !== RecommendationStatus.REJECTED;
        
        return {
          id: doc.id,
          ...data,
          status: status,
          canEdit: canModify,
          canDelete: canModify,
        } as any;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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
    
    if (existing.status === RecommendationStatus.APPROVED || existing.status === RecommendationStatus.REJECTED) {
      throw new BadRequestException('Cannot modify a recommendation that has been reviewed');
    }

    const updateData = {
      ...updateRecommendationDto,
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
    return this.update(id, { status });
  }

  async remove(id: string): Promise<void> {
    const existing = await this.findOne(id);
    
    if (existing.status === RecommendationStatus.APPROVED || existing.status === RecommendationStatus.REJECTED) {
      throw new BadRequestException('Cannot delete a recommendation that has been reviewed');
    }

    await this.firebaseService
      .getFirestore()
      .collection('recommendations')
      .doc(id)
      .delete();
  }
}
