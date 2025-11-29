import { Module } from '@nestjs/common';
import { RecommendationsController } from './recommendations.controller';
import { RecommendationsService } from './recommendations.service';
import { FirebaseModule } from '../firebase/firebase.module';
import { RecommendationCommentsModule } from '../recommendation-comments/recommendation-comments.module';

@Module({
  imports: [FirebaseModule, RecommendationCommentsModule],
  controllers: [RecommendationsController],
  providers: [RecommendationsService],
})
export class RecommendationsModule {}
