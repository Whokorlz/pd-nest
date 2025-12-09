import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../users/entities/user.entity'; // Importa UserRole

// Key used to store roles metadata in the route handler
export const ROLES_KEY = 'roles';

/**
 * Custom decorator to assign required roles to a route.
 * @param roles An array of UserRole required to access the route.
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);