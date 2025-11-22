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
      const decodedKey = Buffer.from(serviceAccountKey, 'base64').toString(
        'utf8',
      );

      const serviceAccount = JSON.parse(decodedKey) as {
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

  async verifyPassword(
    email: string,
    password: string,
  ): Promise<admin.auth.DecodedIdToken> {
    const apiKey = this.configService.get<string>('FIREBASE_WEB_API_KEY');
    if (!apiKey) {
      throw new Error('FIREBASE_WEB_API_KEY is not configured');
    }

    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true,
        }),
      },
    );

    if (!response.ok) {
      const error = await response.json();
      if (error.error?.message === 'INVALID_PASSWORD') {
        throw new Error('Invalid password');
      }
      if (error.error?.message === 'EMAIL_NOT_FOUND') {
        throw new Error('Email not found');
      }
      throw new Error(error.error?.message || 'Authentication failed');
    }

    const data = await response.json();
    const idToken = data.idToken;

    return this.auth.verifyIdToken(idToken);
  }
}
