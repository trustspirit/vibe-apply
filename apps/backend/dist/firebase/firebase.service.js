"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const admin = __importStar(require("firebase-admin"));
let FirebaseService = class FirebaseService {
    configService;
    firestore;
    auth;
    constructor(configService) {
        this.configService = configService;
        const serviceAccountKey = JSON.stringify({
            type: 'service_account',
            project_id: 'application-56bde',
            private_key_id: 'ba74f5316da5e42a78c93f906a6059bf521ba6be',
            private_key: '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDIIyXuHammT6cE\nze6Y6aQ//I9lx8GhyXf45PUwhV/cCkWG6tLdS/+uh1d8xGz7Vk2JUq5Cqs882jXU\nNyqP0kiwu843VkMZm7/QlL6psP/dnP6hc/jRXqQYI6R2luFtyGxeAdY7uFpKuqK+\nRWo1VXaJ4Ie6xUpvud28QiwwjONHKr0Z/5lTLgLjkx+CnelriOvZvnY6xyQT97u2\nWOcswVDSroIWyyHaAm+nocctrnGqJZfnktmwM/B1xF/6M5NugGVAl5bKv5EOhFKo\nuH9N1jkDu/L6RODYqBbsMXfsDed9IP5P1psoUeh6KQP9+/CLBPnCBgSWo042mDRY\nGU1Bi/UDAgMBAAECggEALcypUe/00kvZD0bnCpQxE7mCwUpwu8rkiw8uMv/am3q4\nRXM4dQ7+wFxVf4Zd4Dh0PvAuU7BOA4F2Hw3OziHTo6oeu1ggu9wCDcP0S9Xm/7p9\nJMpqztLnH2UMrlzB0sMyVWL7OShrdT13n64362OW4F+DABFFAwNYREwqW6PqIO81\nuZKvJVQqYtJ/JxjlhYZ268IcmikisvItljpnY0Y9DQ7ecYcwAVuQPkxX658tU3IN\nqw4PArJ/jpviYo9jIFuDb8MuU0d8p7CyvNQt/fFESGaKLieFsbShftF9oNiv3a/N\nWQIwS6w8zVrvoY2DoCa4j489I8BySxo69K22HqrAtQKBgQDpEs+x50rYs+MnYQ27\n4smIj9BbM9vvxkCGsYuxwKt0W40thcWQGB1eIXC0LhXMU6O6QDYdF2faswLaRKXV\n4+XRhr4LODThS7ojDa0/DsEU9/2OTGq1rvWBf+SyD9H3XOteXkYbYgEOvhDi9CNu\nl7X+77BxJxC2hLItIAfHPeGjtwKBgQDb0vKLPMDM2bOjvxI+2j8I2cho8denUQmr\nWtClbeaxTM7GC95pTUiDghohCeeTf4kx+9xqYI/By0QfCXrVLbNbYiLXFrBGVilz\nvyW6lN6ZkQ0VFKZfro+lwmpy+2f9o3Q+YtQdY2xMeXNok7SFpKVzRsB0CWBA+PEC\n7XaaouixFQKBgQCIxjRB50RB9RaZVlgT6RtxW0vfKYiopcPaBzi+IB29k7g+faEZ\nVT1urtsPsXezR2Xud54J5mFYsvI6mkxjP3DvS04dEWfeymy6A12mgocGQh12sxtv\n8PM7goz3fVcu/UVWRKaJjTKnrxwDw1dDoB36NDhrvowNP8O7vW8zGfpe8wKBgQDN\n2bWtc7/sVPVnIpd4ajHbHO4ScF6NXVLbtxhpwgflAlMjnJuzKl78X4oOZFMKicS1\nHPCkYTZduPZaxirTlI8/xR9xIdsCks8Qh/BRz/TAA9gnZIYEVdhI1k2OzSTtnPJP\nNYcC2kbhOl47kQ3clHknARtZzinnzfcL0cleN64FnQKBgE+ae+pvTuVgF9RZaFC8\nX7NaZSiOBWUWErr01kRg4V/h72/A4FhnKBKQU6nRQ7ZNbKMUFOg7FDsihFiTdIPb\nkAHhDryGRjHt0NYxDKKJEX5/6RL4Quoplv9C4RTIY9exAh+b4vgEgxCNM11F9Nru\nDvia+nBs9sXHr3Z6wkkb/V6y\n-----END PRIVATE KEY-----\n',
            client_email: 'firebase-adminsdk-38dxw@application-56bde.iam.gserviceaccount.com',
            client_id: '106527154188541880313',
            auth_uri: 'https://accounts.google.com/o/oauth2/auth',
            token_uri: 'https://oauth2.googleapis.com/token',
            auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
            client_x509_cert_url: 'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-38dxw%40application-56bde.iam.gserviceaccount.com',
            universe_domain: 'googleapis.com',
        });
        if (serviceAccountKey) {
            const serviceAccount = JSON.parse(serviceAccountKey);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                projectId: serviceAccount.project_id,
            });
        }
        else {
            admin.initializeApp();
        }
        this.firestore = admin.firestore();
        this.auth = admin.auth();
    }
    getFirestore() {
        return this.firestore;
    }
    getAuth() {
        return this.auth;
    }
    async createUser(email, password, displayName) {
        return this.auth.createUser({
            email,
            password,
            displayName,
        });
    }
    async verifyIdToken(idToken) {
        return this.auth.verifyIdToken(idToken);
    }
    async deleteUser(uid) {
        return this.auth.deleteUser(uid);
    }
};
exports.FirebaseService = FirebaseService;
exports.FirebaseService = FirebaseService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], FirebaseService);
//# sourceMappingURL=firebase.service.js.map