// src/tickets/entities/ticket.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { Client } from '../../users/entities/client.entify';
import { Technician } from '../../users/entities/Technician.entify';

export enum TicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  title: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: TicketStatus,
    default: TicketStatus.OPEN
  })
  status: TicketStatus;

  @Column({
    type: 'enum',
    enum: TicketPriority,
    default: TicketPriority.MEDIUM
  })
  priority: TicketPriority;

  // --- Relationships (Many-to-One) ---


  @ManyToOne(() => Category, category => category.tickets)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @ManyToOne(() => Client, client => client.tickets)
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @ManyToOne(() => Technician, technician => technician.assignedTickets, { nullable: true })
  @JoinColumn({ name: 'technician_id' })
  technician: Technician;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}