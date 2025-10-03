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
import { MemosService } from './memos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@vibe-apply/shared';
import type {
  CreateMemoDto,
  UpdateMemoDto,
  ApplicationMemo,
  JwtPayload,
} from '@vibe-apply/shared';

@Controller('memos')
export class MemosController {
  constructor(private readonly memosService: MemosService) {}

  @Post('application/:applicationId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BISHOP, UserRole.STAKE_PRESIDENT)
  async create(
    @Param('applicationId') applicationId: string,
    @CurrentUser() user: JwtPayload,
    @Body() createMemoDto: CreateMemoDto,
  ): Promise<ApplicationMemo> {
    return this.memosService.create(
      applicationId,
      user.sub,
      user.name,
      user.role!,
      createMemoDto,
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
  ): Promise<ApplicationMemo[]> {
    return this.memosService.findByApplicationId(applicationId, user.role!);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BISHOP, UserRole.STAKE_PRESIDENT)
  async update(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() updateMemoDto: UpdateMemoDto,
  ): Promise<ApplicationMemo> {
    return this.memosService.update(id, user.sub, updateMemoDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BISHOP, UserRole.STAKE_PRESIDENT)
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ message: string }> {
    await this.memosService.remove(id, user.sub);
    return { message: 'Memo deleted successfully' };
  }
}
