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
import { BudgetService } from './budget.service';

@Controller('budget')
@UseGuards(JwtAuthGuard)
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}
  @Post('create')
  async createBudget(
    @Request() req,
    @Body() data: { categoryId: string; amount: string; record_date: string,budget_alert: boolean },
  ) {
    const userId = req.user.id; // Access userId from the request object
    return this.budgetService.createBudget(
      userId,
      data.categoryId,
      data.amount,
      data.record_date,
      data.budget_alert
    );
  }
  @Get('list')
  async getBudget(
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

    return this.budgetService.getBudget(userId, startDate, endDate, category);
  }
  @Get(':id')
  async getSingleBudget(@Request() req, @Param('id') id: number) {
    const userId = req.user.id;
    return this.budgetService.getSingleBudget(id);
  }
  @Patch(':id')
  async updateBudgetRecord(
    @Request() req,
    @Param('id') id: number,
    @Body()
    data: {
      categoryId: string;
      amount: string;
      record_date: string;
    },
  ) {
    const userId = req.user.id;
    return this.budgetService.updateBudgetRecord(
      userId,
      id,
      data.categoryId,
      data.amount,
      data.record_date,
    );
  }
    @Delete(':id')
    async deleteBudgetRecord(@Request() req, @Param('id') id: number) {
      const userId = req.user.id;
      return this.budgetService.deleteBudgetRecord(userId, id);
    }
}
