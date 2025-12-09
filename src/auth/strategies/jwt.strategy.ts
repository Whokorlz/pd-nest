import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '../../users/entities/user.entity';

// Define the payload structure expected from the JWT token
export interface JwtPayload {
  email: string;
  sub: number; // User ID
  role: UserRole; // User role
}

export interface RequestUserPayload {
  userId: number;
  email: string;
  role: UserRole;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extract token from 'Bearer <token>' header
      ignoreExpiration: false, // Ensure token expiration is respected
      secretOrKey: configService.get<string>('JWT_SECRET')!, // Use the secret key
    });
  }

  /**
   * This method is called after the token is validated (signature and expiration).
   * It transforms the JWT payload into the object available in the request (req.user).
   */
  async validate(payload: JwtPayload) {
    // Return essential user data to be attached to the request object
    return { 
      userId: payload.sub, 
      email: payload.email, 
      role: payload.role 
    };
  }
}