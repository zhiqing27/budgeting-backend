import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ExpenseService } from './expense.service';
@Controller('expense')
@UseGuards(JwtAuthGuard)
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}
  @Post('create')
  async createExpense(
    @Request() req,
    @Body()
    data: {
      categoryId: string;
      amount: string;
      record_date: string;
      description: string;
    },
  ) {
    const userId = req.user.id; // Access userId from the request object
    return this.expenseService.createExpense(
      userId,
      data.categoryId,
      data.amount,
      data.record_date,
      data.description,
    );
  }

  @Get('list')
  async getExpense(
    @Request() req,
    @Query('month') month: number,
    @Query('year') year: number,
    @Query('category') category: number,
  ) {
    const userId = req.user.id;

    let startDate = null;
    let endDate = null;

    if (month && year) {
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0);
    }

    return this.expenseService.getExpense(userId, startDate, endDate, category);
  }
  @Get(':id')
  async getSingleExpense(@Request() req, @Param('id') id: number) {
    const userId = req.user.id;
    return this.expenseService.getSingleExpense(id);
  }
  @Patch(':id')
  async updateExpenseReccord(
    @Request() req,
    @Param('id') id: number,
    @Body()
    data: {
      categoryId: string;
      amount: string;
      record_date: string;
      description: string;
    },
  ) {
    const userId = req.user.id;
    return this.expenseService.updateExpenseRecord(
      userId,
      id,
      data.categoryId,
      data.amount,
      data.record_date,
      data.description,
    );
  }
  @Delete(':id')
  async deleteExpenseRecord(@Request() req, @Param('id') id: number) {
    const userId = req.user.id;
    return this.expenseService.deleteExpenseRecord(userId, id);
  }
}
