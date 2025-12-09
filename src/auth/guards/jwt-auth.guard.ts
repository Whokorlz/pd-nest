import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Custom guard that relies on the 'jwt' Passport strategy.
 * This automatically handles extracting the JWT from the header, validating its signature,
 * and calling the JwtStrategy's validate method.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // NestJS handles the logic automatically when extending AuthGuard('jwt')
}