import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const { user } = request;
    const { method, url } = request;

    if (!user) {
      this.logger.warn(`Unauthorized access attempt: No user found for ${method} ${url}`);
      return false;
    }

    const hasPermission = requiredRoles.includes(user.role);

    if (!hasPermission) {
      this.logger.warn(
        `Access denied: User ${user.email} (${user.role}) attempted to access ${method} ${url}. Required roles: ${requiredRoles.join(', ')}`
      );
    } else {
      this.logger.log(
        `Access granted: User ${user.email} (${user.role}) accessed ${method} ${url}`
      );
    }

    return hasPermission;
  }
} 