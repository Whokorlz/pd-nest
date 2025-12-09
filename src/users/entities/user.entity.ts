import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, BeforeUpdate } from 'typeorm';
import * as bcrypt from 'bcrypt';

// Define the available roles for the User entity
export enum UserRole {
  ADMIN = 'Administrador',
  TECHNICIAN = 'Técnico',
  CLIENT = 'Cliente',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ unique: true, length: 100 })
  email: string;

  // Store hashed password
  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CLIENT, // Default role is Client
  })
  role: UserRole;

  // Hook to hash the password before saving a new user
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && this.password.length < 60) { // Check if password is not already hashed
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  // Method to check password validity
  async comparePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}