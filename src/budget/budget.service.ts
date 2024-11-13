import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { isValidString, parseToNumericId } from 'helper';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BudgetService {
  constructor(private prisma: PrismaService) {}
  async createBudget(
    userId: number,
    categoryId: string,
    amount: string,
    record_date: string,
    budgetAlert: boolean
  ) {
    if (!amount || isNaN(parseFloat(amount))) {
      throw new Error('Invalid or missing amount value');
    }
    if (!isValidString(categoryId)) {
      throw new Error('Invalid or missing category');
    }

    if (!record_date) {
      throw new HttpException(
        'Record date is required',
        HttpStatus.BAD_REQUEST,
      );
    }
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;

    // Validate the transaction_date format
    if (!datePattern.test(record_date)) {
      throw new HttpException(
        'Invalid record date format. Expected format: YYYY-MM-DD',
        HttpStatus.BAD_REQUEST,
      );
    }
    const numcategoryId = parseToNumericId(categoryId);
    const floatAmount = parseFloat(amount);
    const transactionDate = record_date + 'T00:00:00.000Z';
    return this.prisma.budget.create({
      data: {
        categoryId: numcategoryId,
        userId,
        amount: floatAmount,
        recordDate: transactionDate,
        budgetAlert: budgetAlert, 
      },
    });
  }
  async getBudget(
    userId: number,
    startDate?: Date,
    endDate?: Date,
    category?: number,
  ) {
    const numcategoryId = parseToNumericId(category);
    const whereClause = {
      userId: userId,
      categoryId: numcategoryId,
      recordDate: {
        gte: startDate || undefined,
        lte: endDate || undefined,
      },
    };

    return this.prisma.budget.findMany({
      where: whereClause,
    });
  }
  async getSingleBudget(id: number) {
    const numericId = parseToNumericId(id);
    return this.prisma.budget.findFirst({
      where: {
        id: numericId,
      },
    });
  }
  async updateBudgetRecord(
    userId: number,
    id: number,
    categoryId: string,
    amount: string,
    record_date: string,
  ) {
    if (!amount || isNaN(parseFloat(amount))) {
      throw new Error('Invalid or missing amount value');
    }
    const numericId = parseToNumericId(id);
    if (isNaN(numericId)) {
      throw new HttpException('Invalid ID provided', HttpStatus.BAD_REQUEST);
    }
    const floatAmount = parseFloat(amount);
    if (isNaN(floatAmount) || floatAmount <= 0) {
      throw new HttpException(
        'Invalid or missing amount',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!isValidString(categoryId)) {
      throw new Error('Invalid or missing category');
    }
    const numcategoryId = parseToNumericId(categoryId);
    const categoryRecord = await this.prisma.category.findFirst({
      where: {
        id: numcategoryId,
        userId: userId,
      },
    });

    if (!categoryRecord) {
      throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
    }
    if (!record_date) {
      throw new HttpException(
        'Record date is required',
        HttpStatus.BAD_REQUEST,
      );
    }
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;

    // Validate the transaction_date format
    if (!datePattern.test(record_date)) {
      throw new HttpException(
        'Invalid record date format. Expected format: YYYY-MM-DD',
        HttpStatus.BAD_REQUEST,
      );
    }

    const BudgetRecord = await this.prisma.budget.findFirst({
      where: {
        id: numericId,
        userId: userId,
      },
    });

    if (!BudgetRecord) {
      throw new HttpException('Budget record not found', HttpStatus.NOT_FOUND);
    }
    const transactionDate = record_date + 'T00:00:00.000Z';

    return this.prisma.budget.update({
      where: {
        id: numericId,
      },
      data: {
        amount: floatAmount,
        recordDate: transactionDate,
        categoryId: numcategoryId,
      },
    });
  }
  async deleteBudgetRecord(userId: number, id: number) {
    const numericId = parseToNumericId(id);
    if (!numericId) {
      throw new Error('id needed');
    }
    return this.prisma.budget.delete({
      where: {
        id: numericId,
        userId: userId,
      },
    });
  }
}
