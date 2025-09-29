import { FirebaseService } from '../firebase/firebase.service';
import { LeaderRecommendation, CreateRecommendationDto, UpdateRecommendationDto, RecommendationStatus } from '@vibe-apply/shared';
export declare class RecommendationsService {
    private firebaseService;
    constructor(firebaseService: FirebaseService);
    create(leaderId: string, createRecommendationDto: CreateRecommendationDto): Promise<LeaderRecommendation>;
    findAll(): Promise<LeaderRecommendation[]>;
    findByLeaderId(leaderId: string): Promise<LeaderRecommendation[]>;
    findOne(id: string): Promise<LeaderRecommendation>;
    update(id: string, updateRecommendationDto: UpdateRecommendationDto): Promise<LeaderRecommendation>;
    updateStatus(id: string, status: RecommendationStatus): Promise<LeaderRecommendation>;
    remove(id: string): Promise<void>;
}
