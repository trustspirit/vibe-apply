import { Injectable, NotFoundException } from '@nestjs/common';
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

    return {
      id: docRef.id,
      ...applicationData,
    };
  }

  async findAll(): Promise<Application[]> {
    const applicationsSnapshot = await this.firebaseService
      .getFirestore()
      .collection('applications')
      .orderBy('createdAt', 'desc')
      .get();

    return applicationsSnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as Application,
    );
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
    return {
      id: doc.id,
      ...doc.data(),
    } as Application;
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
    const updateData = {
      ...updateApplicationDto,
      updatedAt: new Date().toISOString(),
    };

    await this.firebaseService
      .getFirestore()
      .collection('applications')
      .doc(id)
      .update(updateData);

    return this.findOne(id);
  }

  async updateStatus(
    id: string,
    status: ApplicationStatus,
  ): Promise<Application> {
    return this.update(id, { status });
  }

  async remove(id: string): Promise<void> {
    await this.firebaseService
      .getFirestore()
      .collection('applications')
      .doc(id)
      .delete();
  }
}
