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
exports.RecommendationsService = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("../firebase/firebase.service");
const shared_1 = require("@vibe-apply/shared");
let RecommendationsService = class RecommendationsService {
    firebaseService;
    constructor(firebaseService) {
        this.firebaseService = firebaseService;
    }
    async create(leaderId, createRecommendationDto) {
        const timestamp = new Date().toISOString();
        const status = createRecommendationDto.status || shared_1.RecommendationStatus.DRAFT;
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
    async findAll() {
        const recommendationsSnapshot = await this.firebaseService
            .getFirestore()
            .collection('recommendations')
            .orderBy('createdAt', 'desc')
            .get();
        return recommendationsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
    }
    async findByLeaderId(leaderId) {
        const recommendationsSnapshot = await this.firebaseService
            .getFirestore()
            .collection('recommendations')
            .where('leaderId', '==', leaderId)
            .orderBy('createdAt', 'desc')
            .get();
        return recommendationsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
    }
    async findOne(id) {
        const doc = await this.firebaseService
            .getFirestore()
            .collection('recommendations')
            .doc(id)
            .get();
        if (!doc.exists) {
            throw new common_1.NotFoundException('Recommendation not found');
        }
        const data = doc.data();
        if (!data) {
            throw new common_1.NotFoundException('Recommendation data not found');
        }
        return {
            id: doc.id,
            ...data,
        };
    }
    async update(id, updateRecommendationDto) {
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
    async updateStatus(id, status) {
        return this.update(id, { status });
    }
    async remove(id) {
        await this.firebaseService
            .getFirestore()
            .collection('recommendations')
            .doc(id)
            .delete();
    }
};
exports.RecommendationsService = RecommendationsService;
exports.RecommendationsService = RecommendationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService])
], RecommendationsService);
//# sourceMappingURL=recommendations.service.js.map