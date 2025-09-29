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
import { ApplicationsService } from './applications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@vibe-apply/shared';
import type {
  CreateApplicationDto,
  UpdateApplicationDto,
  Application,
  ApplicationStatus,
  JwtPayload,
} from '@vibe-apply/shared';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() application: CreateApplicationDto,
  ): Promise<Application> {
    return this.applicationsService.create(user.sub, application);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.LEADER)
  async findAll(): Promise<Application[]> {
    return this.applicationsService.findAll();
  }

  @Get('my-application')
  @UseGuards(JwtAuthGuard)
  async findMyApplication(
    @CurrentUser() user: JwtPayload,
  ): Promise<Application | null> {
    return this.applicationsService.findByUserId(user.sub);
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.LEADER)
  async findByUserId(
    @Param('userId') userId: string,
  ): Promise<Application | null> {
    return this.applicationsService.findByUserId(userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string): Promise<Application> {
    return this.applicationsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateApplicationDto: UpdateApplicationDto,
  ): Promise<Application> {
    return this.applicationsService.update(id, updateApplicationDto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.LEADER)
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: ApplicationStatus },
  ): Promise<Application> {
    return this.applicationsService.updateStatus(id, body.status);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.applicationsService.remove(id);
    return { message: 'Application deleted successfully' };
  }
}
