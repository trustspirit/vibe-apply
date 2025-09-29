import { Injectable, NotFoundException } from '@nestjs/common';
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

    return {
      id: docRef.id,
      ...recommendationData,
    };
  }

  async findAll(): Promise<LeaderRecommendation[]> {
    const recommendationsSnapshot = await this.firebaseService
      .getFirestore()
      .collection('recommendations')
      .orderBy('createdAt', 'desc')
      .get();

    return recommendationsSnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as LeaderRecommendation,
    );
  }

  async findByLeaderId(leaderId: string): Promise<LeaderRecommendation[]> {
    const recommendationsSnapshot = await this.firebaseService
      .getFirestore()
      .collection('recommendations')
      .where('leaderId', '==', leaderId)
      .orderBy('createdAt', 'desc')
      .get();

    return recommendationsSnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as LeaderRecommendation,
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
    await this.firebaseService
      .getFirestore()
      .collection('recommendations')
      .doc(id)
      .delete();
  }
}
