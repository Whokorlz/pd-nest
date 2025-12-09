import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService, // Inject JwtService
  ) {}

  /**
   * Registers a new user (default role: Client).
   */
  async register(registerDto: RegisterDto): Promise<Partial<User>> {
    const { name, email, password } = registerDto;

    const existingUser = await this.usersRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('User with this email already exists.');
    }

    const user = this.usersRepository.create({
      name,
      email,
      password, 
      role: UserRole.CLIENT // Default role
    });

    await this.usersRepository.save(user);

    const { password: _, ...result } = user;
    return result;
  }

  /**
   * Validates user credentials for login.
   * @returns User entity if credentials are valid, null otherwise.
   */
  async validateUser(email: string, pass: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({ where: { email } });

    if (user && (await user.comparePassword(pass))) {
      // If validation is successful, return the user object without the hash
      const { password, ...result } = user;
      return result as User;
    }
    return null;
  }

  /**
   * Generates a JWT token upon successful login.
   */
  async login(user: User) {
    // Payload for the JWT token
    const payload = { 
        email: user.email, 
        sub: user.id,
        role: user.role // Include role in the token for Guards
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    };
  }
}