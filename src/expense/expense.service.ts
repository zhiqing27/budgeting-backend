import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { isValidString, parseToNumericId } from 'helper';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ExpenseService {
  constructor(private prisma: PrismaService) {}
  async createExpense(
    userId: number,
    categoryId: string,
    amount: string,
    record_date: string,
    description: string,
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
    return this.prisma.expense.create({
      data: {
        description: description,
        userId,
        categoryId: numcategoryId,
        amount: floatAmount,
        recordDate: transactionDate,
      },
    });
  }

  async getExpense(userId: number, startDate?: Date, endDate?: Date, category?: number) {
    const numcategoryId = parseToNumericId(category);
    const whereClause = {
      userId: userId,
      categoryId: numcategoryId,
      recordDate: {
        gte: startDate || undefined,
        lte: endDate || undefined,
      },
    };

    return this.prisma.expense.findMany({
      where: whereClause,
    });
  }

  async getSingleExpense(id: number) {
    const numericId = parseToNumericId(id);
    return this.prisma.expense.findFirst({
      where: {
        id: numericId,
      },
    });
  }
  
  async updateExpenseRecord(
    userId: number,
    id: number,
    categoryId: string,
    amount: string,
    record_date: string,
    description: string,
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

    const expenseRecord = await this.prisma.expense.findFirst({
      where: {
        id: numericId,
        userId: userId,
      },
    });

    if (!expenseRecord) {
      throw new HttpException('Expense record not found', HttpStatus.NOT_FOUND);
    }
    const transactionDate = record_date + 'T00:00:00.000Z';

    return this.prisma.expense.update({
      where: {
        id: numericId,
      },
      data: {
        description: description,
        amount: floatAmount,
        recordDate: transactionDate,
        categoryId: numcategoryId,
      },
    });
  }
  async deleteExpenseRecord(userId: number, id: number) {
    const numericId = parseToNumericId(id);
    if (!numericId) {
      throw new Error('id needed');
    }
    return this.prisma.expense.delete({
      where: {
        id: numericId,
        userId: userId,
      },
    });
  }
}
