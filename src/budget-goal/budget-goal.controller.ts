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
import { BudgetGoalService } from './budget-goal.service';

@Controller('budget-goal')
@UseGuards(JwtAuthGuard)
export class BudgetGoalController {
  constructor(private readonly budgetGoalService: BudgetGoalService) {}
  @Post('create')
  async createBudgetGoal(
    @Request() req,
    @Body() data: { targetAmount: string; type: string; targetDate?: string },
  ) {
    const userId = req.user.id;

    return this.budgetGoalService.createGoal(
      userId,
      data.targetAmount,
      data.type,
      data.targetDate,
    );
  }

  @Patch(':id/progress')
  async updateGoalProgress(
    @Param('id') id: number,
    @Body('amount') amount: string,
  ) {
    return this.budgetGoalService.updateGoalProgress(id, amount);
  }
  @Get('user-goals')
  async getUserGoals(  @Request() req) {
    const userId = req.user.id;

    return this.budgetGoalService.getUserGoals(userId);
  }
}
