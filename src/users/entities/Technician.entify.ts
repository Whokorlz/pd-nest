import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';

@Entity('technicians')
export class Technician {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, nullable: true })
  specialty: string; 

  @Column({ default: true })
  availability: boolean;

  // Link to the main User entity
  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  // Relation: One Technician can be assigned many Tickets
  @OneToMany(() => Ticket, (ticket) => ticket.technician)
  assignedTickets: Ticket[];
}