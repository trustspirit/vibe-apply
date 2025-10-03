import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole, LeaderStatus } from '@vibe-apply/shared';

interface RequestUser {
  id: string;
  email: string;
  role: UserRole;
  leaderStatus?: LeaderStatus;
}

interface RequestWithUser extends Request {
  user: RequestUser;
}

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      'roles',
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    const hasAccess = requiredRoles.some((role) => {
      if (role === UserRole.ADMIN && user?.role === UserRole.ADMIN) {
        return true;
      }

      if (role === UserRole.SESSION_LEADER) {
        if (
          user?.role === UserRole.SESSION_LEADER &&
          user?.leaderStatus === LeaderStatus.APPROVED
        ) {
          return true;
        }
      }

      if (role === UserRole.STAKE_PRESIDENT) {
        if (
          user?.role === UserRole.STAKE_PRESIDENT &&
          user?.leaderStatus === LeaderStatus.APPROVED
        ) {
          return true;
        }
      }

      if (role === UserRole.BISHOP) {
        if (
          user?.role === UserRole.BISHOP &&
          user?.leaderStatus === LeaderStatus.APPROVED
        ) {
          return true;
        }
      }

      if (role === UserRole.APPLICANT && user?.role === UserRole.APPLICANT) {
        return true;
      }

      return false;
    });

    this.logger.debug(`Access granted: ${hasAccess}`);

    return hasAccess;
  }
}
