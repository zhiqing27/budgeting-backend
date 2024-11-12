import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async createCategory(userId: number, name: string) {
    const lowercaseName = name.toLowerCase();

    // Check if a category with the same name already exists for the user
    const existingCategory = await this.prisma.category.findFirst({
      where: {
        userId,
        name: lowercaseName,
      },
    });

    if (existingCategory) {
      // Throw an error if the category already exists for this user
      throw new ConflictException('Category with this name already exists for this user');
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
    const numericCategoryId = typeof categoryId === 'string' ? parseInt(categoryId, 10) : categoryId;

    return this.prisma.category.findFirst({
        where: {
          id: numericCategoryId,  
          userId: userId,  
        },
      });
  }
  async updateCategory(userId: number, categoryId: number, newName: string) {
    const numericCategoryId = typeof categoryId === 'string' ? parseInt(categoryId, 10) : categoryId;

    return this.prisma.category.update({
      where: {
        id: numericCategoryId,
        userId: userId
      },
      data: {
        name: newName,
      },
    });
  }
  async deleteCategory(userId: number, categoryId: number) {
    const numericCategoryId = typeof categoryId === 'string' ? parseInt(categoryId, 10) : categoryId;

    return this.prisma.category.delete({
      where: {
        id: numericCategoryId,
        userId: userId
      },
    });
  }
}
