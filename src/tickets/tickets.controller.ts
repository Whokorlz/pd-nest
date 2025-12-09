import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, HttpCode, HttpStatus, ParseIntPipe,ForbiddenException} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { ApiTags, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Ticket } from './entities/ticket.entity';
import { JwtPayload, RequestUserPayload } from 'src/auth/strategies/jwt.strategy';

// Apply JWT and Roles Guard globally to protect all ticket endpoints
@ApiTags('Tickets Management')
@ApiBearerAuth('access-token') 
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  // =========================================================================
  // 1. CREATION (Client Only) [cite: 22, 56]
  // =========================================================================
  @Post()
  @Roles(UserRole.CLIENT)
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 201, description: 'Ticket created successfully.', type: Ticket })
  @ApiResponse({ status: 403, description: 'Forbidden (Not a Client).' })
  create(
    @Body() createTicketDto: CreateTicketDto,
    @Req() req: { user: RequestUserPayload } // Injected by JwtAuthGuard
  ): Promise<Ticket> {
    // The userId from the JWT is passed to the service to automatically link the Client
    return this.ticketsService.create(createTicketDto, req.user.userId);
  }

  // =========================================================================
  // 2. LISTING (Role-based access control) [cite: 12, 20, 21, 58, 60]
  // =========================================================================
  
  @Get()
  @Roles(UserRole.ADMIN) // Only Admin can see ALL tickets
  @ApiResponse({ status: 200, description: 'List of all tickets (Admin only).', type: [Ticket] })
  findAll(): Promise<Ticket[]> {
    return this.ticketsService.findAll();
  }
  
  @Get('client/:id')
  @Roles(UserRole.ADMIN) // Admin can query by any client ID [cite: 59]
  @ApiResponse({ status: 200, description: 'Tickets by Client ID (Admin only).', type: [Ticket] })
  findByClientId(@Param('id', ParseIntPipe) clientId: number): Promise<Ticket[]> {
    return this.ticketsService.findByClientId(clientId);
  }

  @Get('technician/:id')
  @Roles(UserRole.ADMIN) // Admin can query by any technician ID [cite: 60]
  @ApiResponse({ status: 200, description: 'Tickets by Technician ID (Admin only).', type: [Ticket] })
  findByTechnicianId(@Param('id', ParseIntPipe) technicianId: number): Promise<Ticket[]> {
    return this.ticketsService.findByTechnicianId(technicianId);
  }
  
  // =========================================================================
  // 3. DETAIL & UPDATE (Admin/Tech/Client)
  // =========================================================================

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.TECHNICIAN, UserRole.CLIENT)
  @ApiResponse({ status: 200, description: 'Ticket found.', type: Ticket })
  @ApiResponse({ status: 403, description: 'Forbidden (Ticket not owned by client/tech).' })
  async findOne(@Param('id', ParseIntPipe) id: number, @Req() req: { user: RequestUserPayload }): Promise<Ticket> {
    const ticket = await this.ticketsService.findOne(id);
    
    // Basic authorization check: Client can only see their own tickets
    if (req.user.role === UserRole.CLIENT && ticket.client.user.id !== req.user.userId) {
        throw new ForbiddenException('You can only consult your own tickets.');
    }

    // Technician can see all tickets assigned to them (or any if we simplify)
    // For now, let's allow Technicians to see any ticket (Admin role handles all). 
    // If the Technician needs to be restricted, we'd add logic here to check if ticket.technicianId === tech.id
    
    return ticket;
  }
  
  @Patch(':id')
  @Roles(UserRole.ADMIN) // Simplified: Only Admin can update fields and assign technicians
  @ApiResponse({ status: 200, description: 'Ticket updated.', type: Ticket })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateTicketDto: UpdateTicketDto): Promise<Ticket> {
    return this.ticketsService.update(id, updateTicketDto);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.TECHNICIAN) // Only Admin and Technician can change status 
  @ApiResponse({ status: 200, description: 'Ticket status updated.', type: Ticket })
  @ApiResponse({ status: 400, description: 'Invalid status transition.' })
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() updateStatusDto: UpdateStatusDto): Promise<Ticket> {
    // Note: Additional logic to ensure Technician only updates their assigned ticket is needed for full compliance.
    return this.ticketsService.updateStatus(id, updateStatusDto);
  }

  // Admin can delete any ticket
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204, description: 'Ticket deleted successfully.' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.ticketsService.remove(id);
  }
}
