import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FirebaseModule } from './firebase/firebase.module';
import { AuthModule } from './auth/auth.module';
import { ApplicationsModule } from './applications/applications.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { MemosModule } from './memos/memos.module';
import { RecommendationCommentsModule } from './recommendation-comments/recommendation-comments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    FirebaseModule,
    AuthModule,
    ApplicationsModule,
    RecommendationsModule,
    MemosModule,
    RecommendationCommentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
