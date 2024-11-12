import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { parseToNumericId } from 'helper';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class IncomeService {
  constructor(private prisma: PrismaService) {}
  async createIncome(
    userId: number,
    description: string,
    amount: string,
    record_date: string,
  ) {
    if (!amount || isNaN(parseFloat(amount))) {
      throw new Error('Invalid or missing amount value');
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
    const floatAmount = parseFloat(amount);
    const transactionDate = record_date + 'T00:00:00.000Z';
    return this.prisma.income.create({
      data: {
        description: description,
        userId,
        amount: floatAmount,
        recordDate: transactionDate,
      },
    });
  }

  async getIncome(userId: number, startDate?: Date, endDate?: Date) {
    const whereClause = {
      userId: userId,
      recordDate: {
        gte: startDate || undefined,
        lte: endDate || undefined,
      },
    };

    return this.prisma.income.findMany({
      where: whereClause,
    });
  }

  async getSingleIncome(id: number) {
    const numericId = parseToNumericId(id);
    return this.prisma.income.findFirst({
      where: {
        id: numericId,
      },
    });
  }

  async updateIncomeRecord(
    userId: number,
    id: number,
    description: string,
    amount: string,
    record_date: string,
  ) {
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

    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!datePattern.test(record_date)) {
      throw new HttpException(
        'Invalid record date format. Expected YYYY-MM-DD',
        HttpStatus.BAD_REQUEST,
      );
    }
    const incomeRecord = await this.prisma.income.findFirst({
      where: {
        id: numericId,
        userId: userId,
      },
    });

    if (!incomeRecord) {
      throw new HttpException('Income record not found', HttpStatus.NOT_FOUND);
    }
    const transactionDate = record_date + 'T00:00:00.000Z';

    return this.prisma.income.update({
      where: {
        id: numericId,
      },
      data: {
        description: description,
        amount: floatAmount,
        recordDate: transactionDate,
      },
    });
  }

  async deleteIncomeRecord(userId: number, id: number) {
    const numericId = parseToNumericId(id);
    if (!numericId) {
      throw new Error('id needed');
    }
    return this.prisma.income.delete({
      where: {
        id: numericId,
        userId: userId,
      },
    });
  }
}
