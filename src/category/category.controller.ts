import { Controller, Post, Body, UseGuards, Request, Get, Patch, Param, Delete } from '@nestjs/common';
import { CategoryService } from './category.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('categories')
@UseGuards(JwtAuthGuard)  
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post('create')
  async createCategory(@Request() req, @Body() data: { name: string }) {
    const userId = req.user.id;  // Access userId from the request object
    return this.categoryService.createCategory(userId, data.name);
  }

  // Get all categories for the user
  @Get('list')
  async getCategories(@Request() req) {
    const userId = req.user.id;
    return this.categoryService.getCategoriesByUserId(userId);
  }

  // Get a single category by category ID
  @Get(':categoryId')
  async getCategory(@Request() req, @Param('categoryId') categoryId: number) {
    const userId = req.user.id;
    return this.categoryService.getCategoryById(userId, categoryId);
  }

  // Update a category by its ID
  @Patch(':categoryId')
  async updateCategory(
    @Request() req,
    @Param('categoryId') categoryId: number,
    @Body() data: { name: string },
  ) {
    const userId = req.user.id;
    return this.categoryService.updateCategory(userId, categoryId, data.name);
  }

  // Delete a category by its ID
  @Delete(':categoryId')
  async deleteCategory(@Request() req, @Param('categoryId') categoryId: number) {
    const userId = req.user.id;
    return this.categoryService.deleteCategory(userId, categoryId);
  }
}