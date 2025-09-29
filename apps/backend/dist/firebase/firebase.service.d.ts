import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
export declare class FirebaseService {
    private configService;
    private readonly firestore;
    private readonly auth;
    constructor(configService: ConfigService);
    getFirestore(): admin.firestore.Firestore;
    getAuth(): admin.auth.Auth;
    createUser(email: string, password: string, displayName?: string): Promise<admin.auth.UserRecord>;
    verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken>;
    deleteUser(uid: string): Promise<void>;
}
