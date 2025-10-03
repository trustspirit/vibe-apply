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
  UserRole,
} from '@vibe-apply/shared';

@Injectable()
export class ApplicationsService {
  constructor(private firebaseService: FirebaseService) {}

  async checkExistingRecommendation(
    email: string,
    stake: string,
    ward: string,
  ): Promise<boolean> {
    const normalizedEmail = email.toLowerCase();
    const normalizedStake = stake.trim().toLowerCase();
    const normalizedWard = ward.trim().toLowerCase();

    const existingRecommendation = await this.firebaseService
      .getFirestore()
      .collection('recommendations')
      .where('email', '==', normalizedEmail)
      .where('stake', '==', normalizedStake)
      .where('ward', '==', normalizedWard)
      .limit(1)
      .get();

    return !existingRecommendation.empty;
  }

  async create(
    userId: string,
    createApplicationDto: CreateApplicationDto,
  ): Promise<Application> {
    const normalizedEmail = createApplicationDto.email.toLowerCase();
    const normalizedStake = createApplicationDto.stake.trim().toLowerCase();
    const normalizedWard = createApplicationDto.ward.trim().toLowerCase();

    const hasRecommendation = await this.checkExistingRecommendation(
      normalizedEmail,
      normalizedStake,
      normalizedWard,
    );

    if (hasRecommendation) {
      throw new BadRequestException(
        'You have already been recommended by your leader. Please contact your bishop or stake president.',
      );
    }

    const timestamp = new Date().toISOString();
    const status = createApplicationDto.status || ApplicationStatus.AWAITING;

    const applicationData = {
      ...createApplicationDto,
      stake: normalizedStake,
      ward: normalizedWard,
      email: normalizedEmail,
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

    return application;
  }

  async findAll(
    userRole?: string,
    userWard?: string,
    userStake?: string,
  ): Promise<Application[]> {
    const baseQuery = this.firebaseService
      .getFirestore()
      .collection('applications');

    let query: FirebaseFirestore.Query;

    if (userRole === UserRole.BISHOP && userWard) {
      query = baseQuery.where('ward', '==', userWard.toLowerCase());
    } else if (userRole === UserRole.STAKE_PRESIDENT && userStake) {
      query = baseQuery.where('stake', '==', userStake.toLowerCase());
    } else {
      query = baseQuery.orderBy('createdAt', 'desc');
    }

    const applicationsSnapshot = await query.get();

    const applications = await Promise.all(
      applicationsSnapshot.docs.map(async (doc) => {
        const data = doc.data() as Record<string, unknown>;
        const status = data.status as ApplicationStatus;
        const canModify =
          status !== ApplicationStatus.APPROVED &&
          status !== ApplicationStatus.REJECTED;

        const memos =
          userRole &&
          [
            UserRole.ADMIN,
            UserRole.SESSION_LEADER,
            UserRole.STAKE_PRESIDENT,
            UserRole.BISHOP,
          ].includes(userRole as UserRole)
            ? await this.getMemos(doc.id)
            : undefined;

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
          memos,
        } as Application & { canEdit: boolean; canDelete: boolean };
      }),
    );

    if (userRole === UserRole.BISHOP || userRole === UserRole.STAKE_PRESIDENT) {
      applications.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }

    return applications;
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
    const data = doc.data() as Record<string, unknown>;
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

  async findOne(id: string, userRole?: UserRole): Promise<Application> {
    const doc = await this.firebaseService
      .getFirestore()
      .collection('applications')
      .doc(id)
      .get();

    if (!doc.exists) {
      throw new NotFoundException('Application not found');
    }

    const data = doc.data() as Record<string, unknown> | undefined;
    if (!data) {
      throw new NotFoundException('Application data not found');
    }

    const memos =
      userRole &&
      [
        UserRole.ADMIN,
        UserRole.SESSION_LEADER,
        UserRole.STAKE_PRESIDENT,
        UserRole.BISHOP,
      ].includes(userRole)
        ? await this.getMemos(id)
        : undefined;

    return {
      id: doc.id,
      ...data,
      memos,
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
      ...(updateApplicationDto.stake && { stake: updateApplicationDto.stake.trim().toLowerCase() }),
      ...(updateApplicationDto.ward && { ward: updateApplicationDto.ward.trim().toLowerCase() }),
      ...(updateApplicationDto.email && { email: updateApplicationDto.email.toLowerCase() }),
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
      const recommendationData = recommendationDoc.data() as Record<
        string,
        unknown
      >;
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

  private async getMemos(applicationId: string) {
    const memosSnapshot = await this.firebaseService
      .getFirestore()
      .collection('memos')
      .where('applicationId', '==', applicationId)
      .orderBy('createdAt', 'desc')
      .get();

    return memosSnapshot.docs.map((doc) => {
      const data = doc.data() as Record<string, unknown>;
      return {
        id: doc.id,
        applicationId: data.applicationId as string,
        authorId: data.authorId as string,
        authorName: data.authorName as string,
        authorRole: data.authorRole as UserRole,
        content: data.content as string,
        createdAt: data.createdAt as string,
        updatedAt: data.updatedAt as string,
      };
    });
  }
}
