import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { RecommendationCommentsService } from './recommendation-comments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@vibe-apply/shared';
import type {
  CreateRecommendationCommentDto,
  UpdateRecommendationCommentDto,
  RecommendationComment,
  JwtPayload,
} from '@vibe-apply/shared';

@Controller('recommendation-comments')
export class RecommendationCommentsController {
  constructor(
    private readonly recommendationCommentsService: RecommendationCommentsService,
  ) {}

  @Post('recommendation/:recommendationId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BISHOP, UserRole.STAKE_PRESIDENT)
  async createForRecommendation(
    @Param('recommendationId') recommendationId: string,
    @CurrentUser() user: JwtPayload,
    @Body() createCommentDto: CreateRecommendationCommentDto,
  ): Promise<RecommendationComment> {
    return this.recommendationCommentsService.create(
      recommendationId,
      undefined,
      user.sub,
      user.name,
      user.role!,
      createCommentDto,
    );
  }

  @Post('application/:applicationId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BISHOP, UserRole.STAKE_PRESIDENT)
  async createForApplication(
    @Param('applicationId') applicationId: string,
    @CurrentUser() user: JwtPayload,
    @Body() createCommentDto: CreateRecommendationCommentDto,
  ): Promise<RecommendationComment> {
    return this.recommendationCommentsService.create(
      undefined,
      applicationId,
      user.sub,
      user.name,
      user.role!,
      createCommentDto,
    );
  }

  @Get('recommendation/:recommendationId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRole.ADMIN,
    UserRole.SESSION_LEADER,
    UserRole.STAKE_PRESIDENT,
    UserRole.BISHOP,
  )
  async findByRecommendationId(
    @Param('recommendationId') recommendationId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<RecommendationComment[]> {
    return this.recommendationCommentsService.findByRecommendationId(
      recommendationId,
      user.role!,
    );
  }

  @Get('application/:applicationId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRole.ADMIN,
    UserRole.SESSION_LEADER,
    UserRole.STAKE_PRESIDENT,
    UserRole.BISHOP,
  )
  async findByApplicationId(
    @Param('applicationId') applicationId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<RecommendationComment[]> {
    return this.recommendationCommentsService.findByApplicationId(
      applicationId,
      user.role!,
    );
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BISHOP, UserRole.STAKE_PRESIDENT)
  async update(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() updateCommentDto: UpdateRecommendationCommentDto,
  ): Promise<RecommendationComment> {
    return this.recommendationCommentsService.update(
      id,
      user.sub,
      updateCommentDto,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BISHOP, UserRole.STAKE_PRESIDENT)
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ message: string }> {
    await this.recommendationCommentsService.remove(id, user.sub);
    return { message: 'Comment deleted successfully' };
  }
}

