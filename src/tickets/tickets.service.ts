import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket, TicketStatus } from './entities/ticket.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { Client } from '../users/entities/client.entify';
import { Category } from '../categories/entities/category.entity';
import { UserRole } from '../users/entities/user.entity';
import { Technician } from '../users/entities/Technician.entify';

@Injectable()
export class TicketsService {
    constructor(
        @InjectRepository(Ticket)
        private ticketRepository: Repository<Ticket>,
        @InjectRepository(Client)
        private clientRepository: Repository<Client>, // For linking the creator
        @InjectRepository(Category)
        private categoryRepository: Repository<Category>, // For category validation
        @InjectRepository(Technician)
        private technicianRepository: Repository<Technician>, // For technician validation
    ) { }

    /**
     * Sequence order of status changes.
     */
    private readonly statusSequence: Record<TicketStatus, TicketStatus[]> = {
        [TicketStatus.OPEN]: [TicketStatus.IN_PROGRESS],
        [TicketStatus.IN_PROGRESS]: [TicketStatus.RESOLVED],
        [TicketStatus.RESOLVED]: [TicketStatus.CLOSED],
        [TicketStatus.CLOSED]: [], // Cannot change after closed
    };

    /**
     * Creates a new ticket, automatically linking it to the creating client.
     * @param createTicketDto The data for the new ticket.
     * @param userId The ID of the authenticated User (must be a Client).
     */
    async create(createTicketDto: CreateTicketDto, userId: number): Promise<Ticket> {
        // 1. Find the Client profile associated with the User ID
        const client = await this.clientRepository.findOne({ where: { user: { id: userId } } });
        if (!client) {
            throw new ForbiddenException('User is not registered as a Client and cannot create tickets.');
        }

        // 2. Validate Category existence 
        const category = await this.categoryRepository.findOne({ where: { id: createTicketDto.categoryId } });
        if (!category) {
            throw new NotFoundException(`Category with ID ${createTicketDto.categoryId} not found.`);
        }

        // 3. Create the ticket entity
        const newTicket = this.ticketRepository.create({
            ...createTicketDto,
            client: { id: client.id }, // Set the client ID automatically
            status: TicketStatus.OPEN, // Default status
        });

        return this.ticketRepository.save(newTicket);
    }

    /**
     * Finds all tickets (used by Admin)[cite: 20].
     */
    findAll(): Promise<Ticket[]> {
        return this.ticketRepository.find({ relations: ['client', 'technician', 'category'] });
    }

    /**
     * Finds a single ticket by ID (used by all roles).
     */
    async findOne(id: number): Promise<Ticket> {
        const ticket = await this.ticketRepository.findOne({ where: { id }, relations: ['client', 'technician', 'category'] });
        if (!ticket) {
            throw new NotFoundException(`Ticket with ID ${id} not found.`);
        }
        return ticket;
    }

    /**
     * Finds tickets created by a specific client[cite: 12].
     */
    async findByClientId(clientId: number): Promise<Ticket[]> {
        return this.ticketRepository.find({ where: { client: { id: clientId } }, relations: ['category', 'technician'] });
    }

    /**
     * Finds tickets assigned to a specific technician[cite: 12].
     */
    async findByTechnicianId(technicianId: number): Promise<Ticket[]> {
        return this.ticketRepository.find({ where: { id: technicianId }, relations: ['category', 'client'] });
    }

    /**
     * Updates ticket details (Admin/Tech logic handled in Controller).
     */
    async update(id: number, updateTicketDto: UpdateTicketDto): Promise<Ticket> {
        const ticket = await this.findOne(id);

        // Validate Technician ID if present
        if (updateTicketDto.technicianId) {
            const technician = await this.technicianRepository.findOne({ where: { id: updateTicketDto.technicianId } });
            if (!technician) {
                throw new NotFoundException(`Technician with ID ${updateTicketDto.technicianId} not found.`);
            }
        }

        // Merge and save
        this.ticketRepository.merge(ticket, updateTicketDto);
        return this.ticketRepository.save(ticket);
    }


    /**
     * Updates the status of a ticket with sequential validation.
     * @param id The ticket ID.
     * @param updateStatusDto The new status.
     */
    async updateStatus(id: number, updateStatusDto: UpdateStatusDto): Promise<Ticket> {
        const ticket = await this.findOne(id);
        const newStatus = updateStatusDto.status;
        const currentStatus = ticket.status;

        // Check if the new status is a valid next step in the sequence
        const allowedNextStatuses = this.statusSequence[currentStatus];

        if (!allowedNextStatuses || !allowedNextStatuses.includes(newStatus)) {
            throw new BadRequestException(
                `Cannot change status from "${currentStatus}" to "${newStatus}". Allowed next status: ${allowedNextStatuses.join(', ')}`
            );
        }

        ticket.status = newStatus;
        return this.ticketRepository.save(ticket);
    }

    // remove ticket
    async remove(id: number): Promise<void> {
        const result = await this.ticketRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Ticket with ID ${id} not found`);
        }
    }
}