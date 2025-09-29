import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService {
  private readonly firestore: admin.firestore.Firestore;
  private readonly auth: admin.auth.Auth;

  constructor(private configService: ConfigService) {
    const serviceAccountKey = this.configService.get<string>(
      'FIREBASE_SERVICE_ACCOUNT_KEY',
    );

    if (serviceAccountKey) {
      const serviceAccount = JSON.parse(serviceAccountKey) as {
        project_id: string;
        [key: string]: any;
      };

      admin.initializeApp({
        credential: admin.credential.cert(
          serviceAccount as admin.ServiceAccount,
        ),
        projectId: serviceAccount.project_id,
      });
    } else {
      admin.initializeApp();
    }

    this.firestore = admin.firestore();
    this.auth = admin.auth();
  }

  getFirestore(): admin.firestore.Firestore {
    return this.firestore;
  }

  getAuth(): admin.auth.Auth {
    return this.auth;
  }

  async createUser(
    email: string,
    password: string,
    displayName?: string,
  ): Promise<admin.auth.UserRecord> {
    return this.auth.createUser({
      email,
      password,
      displayName,
    });
  }

  async verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
    return this.auth.verifyIdToken(idToken);
  }

  async deleteUser(uid: string): Promise<void> {
    return this.auth.deleteUser(uid);
  }
}
