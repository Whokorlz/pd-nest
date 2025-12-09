import { IsNotEmpty, IsString, MaxLength, IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTicketDto {
  @ApiProperty({ description: 'Title or short summary of the support request.', example: 'Login failed on production server' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(150)
  title: string;

  @ApiProperty({ description: 'Detailed description of the issue or request.' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ description: 'ID of the related Category (e.g., Hardware, Software).', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  categoryId: number;
}