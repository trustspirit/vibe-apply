import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  UseGuards,
} from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  UserRole,
  type CreateRecommendationDto,
  type UpdateRecommendationDto,
  type LeaderRecommendation,
  type RecommendationStatus,
  type JwtPayload,
} from '@vibe-apply/shared';

@Controller('recommendations')
export class RecommendationsController {
  constructor(
    private readonly recommendationsService: RecommendationsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BISHOP, UserRole.STAKE_PRESIDENT)
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() recommendation: CreateRecommendationDto,
  ): Promise<LeaderRecommendation> {
    return this.recommendationsService.create(user.sub, recommendation);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRole.ADMIN,
    UserRole.SESSION_LEADER,
    UserRole.STAKE_PRESIDENT,
    UserRole.BISHOP,
  )
  async findAll(
    @CurrentUser() user: JwtPayload,
  ): Promise<LeaderRecommendation[]> {
    const userDetails = await this.recommendationsService['firebaseService']
      .getFirestore()
      .collection('users')
      .doc(user.sub)
      .get();
    const userData = userDetails.data() as Record<string, unknown> | undefined;

    return this.recommendationsService.findAll(
      user.role || undefined,
      userData?.ward as string | undefined,
      userData?.stake as string | undefined,
    );
  }

  @Get('my-recommendations')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BISHOP, UserRole.STAKE_PRESIDENT)
  async findMyRecommendations(
    @CurrentUser() user: JwtPayload,
  ): Promise<LeaderRecommendation[]> {
    return this.recommendationsService.findByLeaderId(user.sub);
  }

  @Get('leader/:leaderId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findByLeaderId(
    @Param('leaderId') leaderId: string,
  ): Promise<LeaderRecommendation[]> {
    return this.recommendationsService.findByLeaderId(leaderId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string): Promise<LeaderRecommendation> {
    return this.recommendationsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BISHOP, UserRole.STAKE_PRESIDENT)
  async update(
    @Param('id') id: string,
    @Body() updateRecommendationDto: UpdateRecommendationDto,
  ): Promise<LeaderRecommendation> {
    return this.recommendationsService.update(id, updateRecommendationDto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SESSION_LEADER)
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: RecommendationStatus },
  ): Promise<LeaderRecommendation> {
    return this.recommendationsService.updateStatus(id, body.status);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BISHOP, UserRole.STAKE_PRESIDENT)
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.recommendationsService.remove(id);
    return { message: 'Recommendation deleted successfully' };
  }
}
