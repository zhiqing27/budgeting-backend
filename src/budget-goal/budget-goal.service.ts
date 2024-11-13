import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { parseToNumericId } from 'helper';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BudgetGoalService {
  constructor(private prisma: PrismaService) {}

  async createGoal(
    userId: number,
    targetAmount: string,
    type: string,
    targetDate: string,
  ) {
    if (!targetAmount || isNaN(parseFloat(targetAmount))) {
      throw new Error('Invalid or missing amount value');
    }
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (targetDate && !datePattern.test(targetDate)) {
      throw new HttpException(
        'Invalid targetDate date format. Expected format: YYYY-MM-DD',
        HttpStatus.BAD_REQUEST,
      );
    }
    const transactionDate = targetDate ? targetDate + 'T00:00:00.000Z' : null;
    const floatAmount = parseFloat(targetAmount);

    const goal = await this.prisma.budgetGoal.create({
      data: {
        userId,
        type,
        targetAmount: floatAmount,
        progress: 0,
        targetDate: transactionDate,
        isComplete: false,
      },
    });
    return goal;
  }

  async updateGoalProgress(goalId: number, amount: string) {
    if (!amount || isNaN(parseFloat(amount))) {
      throw new HttpException(
        'Invalid or missing amount value',
        HttpStatus.BAD_REQUEST,
      );
    }
    const floatAmount = parseFloat(amount);

    const goal = await this.prisma.budgetGoal.findUnique({
      where: { id: parseToNumericId(goalId) },
    });
    if (!goal) {
      throw new HttpException('No goal found', HttpStatus.BAD_REQUEST);
    }
    if (goal.isComplete) {
        throw new HttpException(
          'This goal is already complete. Please create a new goal to continue tracking progress.',
          HttpStatus.BAD_REQUEST,
        );
      }
    const updatedProgress = goal.progress + floatAmount;
    const isComplete = updatedProgress >= goal.targetAmount;

    try {
      await this.prisma.$transaction([
        this.prisma.budgetGoalLog.create({
          data: {
            goalId: parseToNumericId(goalId),
            amount: floatAmount,
          },
        }),

        this.prisma.budgetGoal.update({
          where: { id: parseToNumericId(goalId) },
          data: {
            progress: updatedProgress,
            isComplete,
          },
        }),
      ]);
      return true;
    } catch (error) {
      throw new HttpException(
        'Failed to update progress and log entry. Transaction rolled back.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getUserGoals(userId: number) {
    const goals = await this.prisma.budgetGoal.findMany({
      where: { userId },
      include: {
        logs: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return goals.map((goal) => ({
      ...goal,
      progressPercentage:
        goal.targetAmount > 0 ? (goal.progress / goal.targetAmount) * 100 : 0,
    }));
  }
}
