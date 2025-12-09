import { PartialType } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsPositive } from 'class-validator';
import { CreateTicketDto } from './create-ticket.dto';
import { TicketPriority } from '../entities/ticket.entity';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTicketDto extends PartialType(CreateTicketDto) {
  @ApiProperty({ description: 'Optional ID of the Technician to assign the ticket to.', required: false, example: 5 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  technicianId?: number;

  @ApiProperty({ 
    description: 'Priority level (Admin/Tech can set)', 
    enum: TicketPriority, 
    required: false,
    example: TicketPriority.HIGH
  })
  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  // Note: Status update is handled by a separate endpoint for business logic control
}