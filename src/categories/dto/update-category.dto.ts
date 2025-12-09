import { PartialType } from '@nestjs/swagger';
import { CreateCategoryDto } from './create-category.dto';

// Inherits all properties from CreateCategoryDto, making them optional
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}