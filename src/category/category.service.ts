import { Injectable, ConflictException, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { isValidString, parseToNumericId } from 'helper';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async createCategory(userId: number, name: string) {
    const lowercaseName = name.toLowerCase();
    if (!isValidString(name)) {
      throw new HttpException(
        'Category Name is required',
        HttpStatus.BAD_REQUEST,
      );

    }
    
    // Check if a category with the same name already exists for the user
    const existingCategory = await this.prisma.category.findFirst({
      where: {
        userId,
        name: lowercaseName,
      },
    });

    if (existingCategory) {
      throw new HttpException(
        'Category with this name already exists for this user',
        HttpStatus.BAD_REQUEST,
      );

    }

    // Create the category if it doesn't exist
    return this.prisma.category.create({
      data: {
        name: name,
        userId,
      },
    });
  }

   // Get all categories for a user
   async getCategoriesByUserId(userId: number) {
    return this.prisma.category.findMany({
      where: { userId }, // Filter categories by user ID
    });
  }
   // Get a single category by its ID and userId (optional)
   async getCategoryById(userId: number, categoryId: number) {
    const numericCategoryId = parseToNumericId(categoryId)
    return this.prisma.category.findFirst({
        where: {
          id: numericCategoryId,  
        },
      });
  }
  async updateCategory(userId: number, categoryId: number, newName: string) {
    const numericCategoryId = parseToNumericId(categoryId)
    if (!isValidString(newName)|| !categoryId) {
      throw new Error('Category Name or category id is required');
    }
    return this.prisma.category.update({
      where: {
        id: numericCategoryId,
      },
      data: {
        name: newName,
      },
    });
  }

  async deleteCategory(userId: number, categoryId: number) {
    const numericCategoryId = parseToNumericId(categoryId)
    if (!categoryId) {
      throw new Error('Category id needed');
    }
    return this.prisma.category.delete({
      where: {
        id: numericCategoryId,
        userId: userId
      },
    });
  }
}
