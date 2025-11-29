import { Module } from '@nestjs/common';
import { RecommendationCommentsService } from './recommendation-comments.service';
import { RecommendationCommentsController } from './recommendation-comments.controller';
import { FirebaseModule } from '../firebase/firebase.module';

@Module({
  imports: [FirebaseModule],
  controllers: [RecommendationCommentsController],
  providers: [RecommendationCommentsService],
  exports: [RecommendationCommentsService],
})
export class RecommendationCommentsModule {}

