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
  Logger,
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
  private readonly logger = new Logger(RecommendationsController.name);

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
    this.logger.debug(
      `findAll called for user: ${user.sub}, role: ${user.role}`,
    );

    const userData = await this.recommendationsService.getUserData(user.sub);
    this.logger.debug(
      `User data: stake=${userData.stake}, ward=${userData.ward}`,
    );

    if (user.role === UserRole.STAKE_PRESIDENT && !userData.stake) {
      this.logger.warn(
        `Stake president ${user.sub} has no stake data, returning empty array`,
      );
      return [];
    }

    const result = await this.recommendationsService.findAll(
      user.role || undefined,
      userData.ward,
      userData.stake,
    );

    this.logger.debug(`Returning ${result.length} recommendations`);
    return result;
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
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRole.ADMIN,
    UserRole.SESSION_LEADER,
    UserRole.STAKE_PRESIDENT,
    UserRole.BISHOP,
  )
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<LeaderRecommendation> {
    return this.recommendationsService.findOne(id, user.role || undefined);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BISHOP, UserRole.STAKE_PRESIDENT)
  async update(
    @Param('id') id: string,
    @Body() updateRecommendationDto: UpdateRecommendationDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<LeaderRecommendation> {
    return this.recommendationsService.update(
      id,
      updateRecommendationDto,
      user.role || undefined,
    );
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
