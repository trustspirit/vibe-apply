import { RecommendationsService } from './recommendations.service';
import type { CreateRecommendationDto, UpdateRecommendationDto, LeaderRecommendation, RecommendationStatus, JwtPayload } from '@vibe-apply/shared';
export declare class RecommendationsController {
    private readonly recommendationsService;
    constructor(recommendationsService: RecommendationsService);
    create(user: JwtPayload, recommendation: CreateRecommendationDto): Promise<LeaderRecommendation>;
    findAll(): Promise<LeaderRecommendation[]>;
    findMyRecommendations(user: JwtPayload): Promise<LeaderRecommendation[]>;
    findByLeaderId(leaderId: string): Promise<LeaderRecommendation[]>;
    findOne(id: string): Promise<LeaderRecommendation>;
    update(id: string, updateRecommendationDto: UpdateRecommendationDto): Promise<LeaderRecommendation>;
    updateStatus(id: string, body: {
        status: RecommendationStatus;
    }): Promise<LeaderRecommendation>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
