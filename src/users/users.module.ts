import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { Technician } from './entities/Technician.entify'
import { Client } from './entities/client.entify'

@Module({
  imports: [TypeOrmModule.forFeature([User, Technician, Client])], // Register User entity with TypeORM
  providers: [UsersService],
  controllers: [UsersController],
  exports: [TypeOrmModule, UsersService], // Export to be used by AuthModule
})
export class UsersModule {}
