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
  
  async getExpense(userId: number, startDate?: Date, endDate?: Date) {
    const whereClause = {
      userId: userId,
      recordDate: {
        gte: startDate || undefined,
        lte: endDate || undefined,
      },
    };

    return this.prisma.expense.findMany({
      where: whereClause,
    });
  }

}
