import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TicketStatus } from '../entities/ticket.entity';

export class UpdateStatusDto {
  @ApiProperty({ 
    description: 'New status for the ticket. Must follow the sequence logic.', 
    enum: TicketStatus,
    example: TicketStatus.IN_PROGRESS 
  })
  @IsNotEmpty()
  @IsEnum(TicketStatus, { message: 'Invalid ticket status provided.' })
  status: TicketStatus;
}
