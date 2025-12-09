import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ApiTags, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Category } from './entities/category.entity';

@ApiTags('Categories (Admin Only CRUD)')
@ApiBearerAuth('access-token') 
@UseGuards(JwtAuthGuard, RolesGuard) // Protect all routes
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  // --- CRUD METHODS ---

  @Post()
  @Roles(UserRole.ADMIN) // Only Admin can create
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 201, description: 'Category created successfully.', type: Category })
  create(@Body() createCategoryDto: CreateCategoryDto): Promise<Category> {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.CLIENT, UserRole.TECHNICIAN) // Read access for all roles [cite: 53, 54]
  @ApiResponse({ status: 200, description: 'List of all categories.', type: [Category] })
  findAll(): Promise<Category[]> {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.CLIENT, UserRole.TECHNICIAN) // Read access for all roles
  @ApiResponse({ status: 200, description: 'Category found.', type: Category })
  findOne(@Param('id') id: string): Promise<Category> {
    return this.categoriesService.findOne(+id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN) // Only Admin can update
  @ApiResponse({ status: 200, description: 'Category updated successfully.', type: Category })
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    return this.categoriesService.update(+id, updateCategoryDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN) // Only Admin can delete
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204, description: 'Category deleted successfully.' })
  remove(@Param('id') id: string): Promise<void> {
    return this.categoriesService.remove(+id);
  }
}