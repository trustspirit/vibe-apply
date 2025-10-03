import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import {
  ApplicationMemo,
  CreateMemoDto,
  UpdateMemoDto,
  UserRole,
} from '@vibe-apply/shared';

@Injectable()
export class MemosService {
  constructor(private firebaseService: FirebaseService) {}

  async create(
    applicationId: string,
    userId: string,
    userName: string,
    userRole: UserRole,
    createMemoDto: CreateMemoDto,
  ): Promise<ApplicationMemo> {
    if (
      userRole !== UserRole.BISHOP &&
      userRole !== UserRole.STAKE_PRESIDENT
    ) {
      throw new ForbiddenException('Only bishops and stake presidents can create memos');
    }

    const applicationDoc = await this.firebaseService
      .getFirestore()
      .collection('applications')
      .doc(applicationId)
      .get();

    if (!applicationDoc.exists) {
      throw new NotFoundException('Application not found');
    }

    const timestamp = new Date().toISOString();
    const memoData = {
      applicationId,
      authorId: userId,
      authorName: userName,
      authorRole: userRole,
      content: createMemoDto.content,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const docRef = await this.firebaseService
      .getFirestore()
      .collection('memos')
      .add(memoData);

    return {
      id: docRef.id,
      ...memoData,
    };
  }

  async findByApplicationId(
    applicationId: string,
    userRole: UserRole,
  ): Promise<ApplicationMemo[]> {
    if (
      userRole !== UserRole.ADMIN &&
      userRole !== UserRole.SESSION_LEADER &&
      userRole !== UserRole.STAKE_PRESIDENT &&
      userRole !== UserRole.BISHOP
    ) {
      return [];
    }

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

  async findOne(id: string): Promise<ApplicationMemo> {
    const doc = await this.firebaseService
      .getFirestore()
      .collection('memos')
      .doc(id)
      .get();

    if (!doc.exists) {
      throw new NotFoundException('Memo not found');
    }

    const data = doc.data() as Record<string, unknown> | undefined;
    if (!data) {
      throw new NotFoundException('Memo data not found');
    }

    return {
      id: doc.id,
      ...data,
    } as ApplicationMemo;
  }

  async update(
    id: string,
    userId: string,
    updateMemoDto: UpdateMemoDto,
  ): Promise<ApplicationMemo> {
    const existing = await this.findOne(id);

    if (existing.authorId !== userId) {
      throw new ForbiddenException('You can only update your own memos');
    }

    const updateData = {
      content: updateMemoDto.content,
      updatedAt: new Date().toISOString(),
    };

    await this.firebaseService
      .getFirestore()
      .collection('memos')
      .doc(id)
      .update(updateData);

    return this.findOne(id);
  }

  async remove(id: string, userId: string): Promise<void> {
    const existing = await this.findOne(id);

    if (existing.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own memos');
    }

    await this.firebaseService
      .getFirestore()
      .collection('memos')
      .doc(id)
      .delete();
  }
}
