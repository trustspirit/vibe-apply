import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import {
  Application,
  CreateApplicationDto,
  UpdateApplicationDto,
  ApplicationStatus,
} from '@vibe-apply/shared';

@Injectable()
export class ApplicationsService {
  constructor(private firebaseService: FirebaseService) {}

  async create(
    userId: string,
    createApplicationDto: CreateApplicationDto,
  ): Promise<Application> {
    const timestamp = new Date().toISOString();
    const status = createApplicationDto.status || ApplicationStatus.AWAITING;

    const applicationData = {
      ...createApplicationDto,
      moreInfo: createApplicationDto.moreInfo || '',
      userId,
      status,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const docRef = await this.firebaseService
      .getFirestore()
      .collection('applications')
      .add(applicationData);

    const application = {
      id: docRef.id,
      ...applicationData,
    };

    await this.linkMatchingRecommendation(application);

    return application;
  }

  private async linkMatchingRecommendation(
    application: Application,
  ): Promise<void> {
    const recommendationsSnapshot = await this.firebaseService
      .getFirestore()
      .collection('recommendations')
      .where('email', '==', application.email.toLowerCase())
      .where('stake', '==', application.stake)
      .where('ward', '==', application.ward)
      .get();

    if (!recommendationsSnapshot.empty) {
      const recommendationDoc = recommendationsSnapshot.docs[0];
      await this.firebaseService
        .getFirestore()
        .collection('recommendations')
        .doc(recommendationDoc.id)
        .update({
          linkedApplicationId: application.id,
          updatedAt: new Date().toISOString(),
        });
    }
  }

  async findAll(): Promise<Application[]> {
    const applicationsSnapshot = await this.firebaseService
      .getFirestore()
      .collection('applications')
      .orderBy('createdAt', 'desc')
      .get();

    return applicationsSnapshot.docs.map((doc) => {
      const data = doc.data();
      const status = data.status as ApplicationStatus;
      const canModify =
        status !== ApplicationStatus.APPROVED &&
        status !== ApplicationStatus.REJECTED;

      return {
        id: doc.id,
        userId: data.userId as string,
        name: data.name as string,
        age: data.age as number,
        email: data.email as string,
        phone: data.phone as string,
        stake: data.stake as string,
        ward: data.ward as string,
        gender: data.gender as string,
        moreInfo: data.moreInfo as string,
        status: status,
        createdAt: data.createdAt as string,
        updatedAt: data.updatedAt as string,
        canEdit: canModify,
        canDelete: canModify,
      } as Application & { canEdit: boolean; canDelete: boolean };
    });
  }

  async findByUserId(userId: string): Promise<Application | null> {
    const applicationsSnapshot = await this.firebaseService
      .getFirestore()
      .collection('applications')
      .where('userId', '==', userId)
      .limit(1)
      .get();

    if (applicationsSnapshot.empty) {
      return null;
    }

    const doc = applicationsSnapshot.docs[0];
    const data = doc.data();
    const status = data.status as ApplicationStatus;
    const canModify =
      status !== ApplicationStatus.APPROVED &&
      status !== ApplicationStatus.REJECTED;

    return {
      id: doc.id,
      userId: data.userId as string,
      name: data.name as string,
      age: data.age as number,
      email: data.email as string,
      phone: data.phone as string,
      stake: data.stake as string,
      ward: data.ward as string,
      gender: data.gender as string,
      moreInfo: data.moreInfo as string,
      status: status,
      createdAt: data.createdAt as string,
      updatedAt: data.updatedAt as string,
      canEdit: canModify,
      canDelete: canModify,
    } as Application & { canEdit: boolean; canDelete: boolean };
  }

  async findOne(id: string): Promise<Application> {
    const doc = await this.firebaseService
      .getFirestore()
      .collection('applications')
      .doc(id)
      .get();

    if (!doc.exists) {
      throw new NotFoundException('Application not found');
    }

    const data = doc.data();
    if (!data) {
      throw new NotFoundException('Application data not found');
    }

    return {
      id: doc.id,
      ...data,
    } as Application;
  }

  async update(
    id: string,
    updateApplicationDto: UpdateApplicationDto,
  ): Promise<Application> {
    const existing = await this.findOne(id);

    if (
      existing.status === ApplicationStatus.APPROVED ||
      existing.status === ApplicationStatus.REJECTED
    ) {
      throw new BadRequestException(
        'Cannot modify an application that has been reviewed',
      );
    }

    const updateData = {
      ...updateApplicationDto,
      updatedAt: new Date().toISOString(),
    };

    await this.firebaseService
      .getFirestore()
      .collection('applications')
      .doc(id)
      .update(updateData);

    const updated = await this.findOne(id);

    const emailChanged =
      updateApplicationDto.email &&
      updateApplicationDto.email !== existing.email;
    const stakeChanged =
      updateApplicationDto.stake &&
      updateApplicationDto.stake !== existing.stake;
    const wardChanged =
      updateApplicationDto.ward && updateApplicationDto.ward !== existing.ward;

    if (emailChanged || stakeChanged || wardChanged) {
      await this.relinkRecommendation(updated);
    }

    return updated;
  }

  private async relinkRecommendation(application: Application): Promise<void> {
    const recommendationsSnapshot = await this.firebaseService
      .getFirestore()
      .collection('recommendations')
      .where('linkedApplicationId', '==', application.id)
      .get();

    if (!recommendationsSnapshot.empty) {
      const recommendationDoc = recommendationsSnapshot.docs[0];
      const recommendationData = recommendationDoc.data();
      const email = recommendationData.email as string | undefined;
      const stake = recommendationData.stake as string;
      const ward = recommendationData.ward as string;

      if (
        email?.toLowerCase() !== application.email.toLowerCase() ||
        stake !== application.stake ||
        ward !== application.ward
      ) {
        await this.firebaseService
          .getFirestore()
          .collection('recommendations')
          .doc(recommendationDoc.id)
          .update({
            linkedApplicationId: null,
            updatedAt: new Date().toISOString(),
          });
      }
    }

    await this.linkMatchingRecommendation(application);
  }

  async updateStatus(
    id: string,
    status: ApplicationStatus,
  ): Promise<Application> {
    return this.update(id, { status });
  }

  async remove(id: string): Promise<void> {
    const existing = await this.findOne(id);

    if (
      existing.status === ApplicationStatus.APPROVED ||
      existing.status === ApplicationStatus.REJECTED
    ) {
      throw new BadRequestException(
        'Cannot delete an application that has been reviewed',
      );
    }

    await this.firebaseService
      .getFirestore()
      .collection('applications')
      .doc(id)
      .delete();
  }
}
