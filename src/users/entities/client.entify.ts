import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, nullable: true })
  company: string;

  @Column({ length: 100, unique: true })
  contactEmail: string; 

  // Link to the main User entity
  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  // Relation: One Client can create many Tickets
  @OneToMany(() => Ticket, (ticket) => ticket.client)
  tickets: Ticket[];
}