"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationsService = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("../firebase/firebase.service");
const shared_1 = require("@vibe-apply/shared");
let ApplicationsService = class ApplicationsService {
    firebaseService;
    constructor(firebaseService) {
        this.firebaseService = firebaseService;
    }
    async create(userId, createApplicationDto) {
        const timestamp = new Date().toISOString();
        const status = createApplicationDto.status || shared_1.ApplicationStatus.AWAITING;
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
    async findAll() {
        const applicationsSnapshot = await this.firebaseService
            .getFirestore()
            .collection('applications')
            .orderBy('createdAt', 'desc')
            .get();
        return applicationsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
    }
    async findByUserId(userId) {
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
        };
    }
    async findOne(id) {
        const doc = await this.firebaseService
            .getFirestore()
            .collection('applications')
            .doc(id)
            .get();
        if (!doc.exists) {
            throw new common_1.NotFoundException('Application not found');
        }
        const data = doc.data();
        if (!data) {
            throw new common_1.NotFoundException('Application data not found');
        }
        return {
            id: doc.id,
            ...data,
        };
    }
    async update(id, updateApplicationDto) {
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
    async updateStatus(id, status) {
        return this.update(id, { status });
    }
    async remove(id) {
        await this.firebaseService
            .getFirestore()
            .collection('applications')
            .doc(id)
            .delete();
    }
};
exports.ApplicationsService = ApplicationsService;
exports.ApplicationsService = ApplicationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService])
], ApplicationsService);
//# sourceMappingURL=applications.service.js.map