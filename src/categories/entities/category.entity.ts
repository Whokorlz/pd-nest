import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Ticket } from '../../tickets/entities/ticket.entity'; 

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  name: string; // e.g., 'Hardware Incident', 'Software Incident'

  @Column({ nullable: true })
  description: string;

  // Relation: One Category can have many Tickets
  // This is set up but requires Ticket entity (defined later)
  @OneToMany(() => Ticket, (ticket) => ticket.category)
  tickets: Ticket[];
}