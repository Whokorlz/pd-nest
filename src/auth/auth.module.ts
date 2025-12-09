import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    PassportModule,
// Configure JWT Module to use the secret key from .env
   JwtModule.registerAsync({
      imports: [ConfigModule],
      useClass: async (configService: ConfigService) => {
        // Obtenemos los valores y hacemos el chequeo de seguridad
        const secret = configService.get<string>('JWT_SECRET');
        const expiresIn = configService.get<string>('JWT_EXPIRATION_TIME');

        if (!secret) {
          throw new Error('JWT_SECRET environment variable is not defined.');
        }

        if (!expiresIn) {
          throw new Error('JWT_EXPIRATION_TIME environment variable is not defined.');
        }

        // Aquí es donde simplificamos el retorno forzando el tipo conocido:
        return {
          secret: secret,
          signOptions: {
            // El tipo esperado para expiresIn incluye StringValue (que se usa para '3600s')
            expiresIn: expiresIn, 
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}