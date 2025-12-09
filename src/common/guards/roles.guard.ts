import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../users/entities/user.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { JwtPayload } from '../../auth/strategies/jwt.strategy'; // Asegúrate de que esta ruta sea correcta

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  /**
   * Determines if the current user has the necessary role to access the route.
   */
  canActivate(context: ExecutionContext): boolean {
    // 1. Get required roles from the route metadata (set by @Roles() decorator)
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    // 2. Get the user payload from the request object (attached by JwtStrategy)
    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload; 

    if (!user) {
        // This usually means JwtAuthGuard failed or wasn't run first
        throw new ForbiddenException('You must be logged in to access this route.');
    }

    // 3. Check if the user's role is included in the required roles array
    const hasRole = requiredRoles.some((role) => user.role === role);

    if (!hasRole) {
        // Throw 403 Forbidden if the user's role does not match requirements
        throw new ForbiddenException('Insufficient permissions. Required role(s): ' + requiredRoles.join(', '));
    }
    
    return true;
  }
}