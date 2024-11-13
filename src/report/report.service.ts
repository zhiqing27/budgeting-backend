import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { formatToTwoDecimalPlaces, parseToNumericId } from 'helper';

@Injectable()
export class ReportService {
  constructor(private readonly prisma: PrismaService) {}

  async getCategorySummary(
    userId: number,
    startDate: Date,
    endDate: Date,
    categoryId: number,
  ) {
    const categories = await this.prisma.category.findMany({
      where: {
        userId,
        ...(categoryId ? { id: categoryId } : {}),
      },
      select: {
        id: true,
        name: true,
        budgets: {
          where: {
            recordDate: {
              gte: startDate,
              lte: endDate,
            },
          },
          select: {
            amount: true,
          },
        },
        expenses: {
          where: {
            recordDate: {
              gte: startDate,
              lte: endDate,
            },
          },
          select: {
            amount: true,
          },
        },
      },
    });

    const categorySummary = categories.map((category) => {
      const totalBudget = category.budgets.reduce(
        (sum, budget) => sum + budget.amount,
        0,
      );
      const totalSpent = category.expenses.reduce(
        (sum, expense) => sum + expense.amount,
        0,
      );
      const remainingBudget = totalBudget - totalSpent;

      return {
        categoryId: category.id,
        categoryName: category.name,
        totalSpent,
        budgetAmount: totalBudget,
        remainingBudget,
      };
    });

    return categorySummary;
  }
  async getFinancialSummary(userId: number, startDate: Date, endDate: Date) {
    const categories = await this.prisma.category.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        budgets: {
          where: {
            recordDate: {
              gte: startDate,
              lte: endDate,
            },
          },
          select: {
            amount: true,
          },
        },
        expenses: {
          where: {
            recordDate: {
              gte: startDate,
              lte: endDate,
            },
          },
          select: {
            amount: true,
          },
        },
      },
    });

    const incomes = await this.prisma.income.findMany({
      where: {
        userId,
        recordDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        amount: true,
      },
    });
    const budgetGoals = await this.prisma.budgetGoal.findMany({
      where: { userId },
      select: {
        id: true,
        type: true,
        targetAmount: true,
        progress: true,
        isComplete: true,
        logs: {
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
          select: {
            amount: true,
            createdAt: true,
          },
        },
      },
    });

    const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);

    const categorySummary = categories.map((category) => {
      const totalBudget = category.budgets.reduce(
        (sum, budget) => sum + budget.amount,
        0,
      );
      const totalSpent = category.expenses.reduce(
        (sum, expense) => sum + expense.amount,
        0,
      );
      const remainingBudget = totalBudget - totalSpent;

      return {
        categoryId: category.id,
        categoryName: category.name,
        totalSpent,
        budgetAmount: totalBudget,
        remainingBudget,
      };
    });
    const totalSumBudget = categorySummary.reduce(
      (sum, category) => sum + category.budgetAmount,
      0,
    );
    const totalExpenses = categorySummary.reduce(
      (sum, category) => sum + category.totalSpent,
      0,
    );
    const netBalance = totalIncome - totalExpenses;

    return {
      income: formatToTwoDecimalPlaces(totalIncome),
      totalExpenses: formatToTwoDecimalPlaces(totalExpenses),
      netBalance: formatToTwoDecimalPlaces(netBalance),
      totalSumBudgetOfAllCategories: formatToTwoDecimalPlaces(totalSumBudget),
      categories: categorySummary,
      budgetGoals: budgetGoals,
    };
  }

  async getBudgetVsActualReport(
    userId: number,
    startDate: Date,
    endDate: Date,
  ) {
    const budgets = await this.prisma.budget.findMany({
      where: {
        userId,
        recordDate: {
          gte: startDate,
          lt: endDate,
        },
      },
      include: { category: true },
    });
    const expenses = await this.prisma.expense.groupBy({
      by: ['categoryId'],
      _sum: {
        amount: true,
      },
      where: {
        userId,
        recordDate: {
          gte: startDate,
          lt: endDate,
        },
      },
    });

    const expenseMap = {};
    expenses.forEach((exp) => {
      expenseMap[exp.categoryId] = exp._sum.amount;
    });

    const report = budgets.map((budget) => ({
      category: budget.category ? budget.category.name : 'Unknown',
      budgeted: formatToTwoDecimalPlaces(budget.amount),
      actual: formatToTwoDecimalPlaces(expenseMap[budget.categoryId] || 0),
      leftOver: budget.amount - (expenseMap[budget.categoryId] || 0),
    }));

    return report;
  }
  async getIncomeExpenseTrends(
    userId: number,
    startDate: Date,
    endDate: Date,
    year: string,
  ) {
    const incomes = await this.prisma.income.groupBy({
      by: ['recordDate'],
      _sum: {
        amount: true,
      },
      where: {
        userId,
        recordDate: {
          gte: startDate,
          lt: endDate,
        },
      },
      orderBy: {
        recordDate: 'asc',
      },
    });
    const expenses = await this.prisma.expense.groupBy({
      by: ['recordDate'],
      _sum: {
        amount: true,
      },
      where: {
        userId,
        recordDate: {
          gte: startDate,
          lt: endDate,
        },
      },
      orderBy: {
        recordDate: 'asc',
      },
    });

    const incomeTrends = {};
    incomes.forEach((income) => {
      const month = `${income.recordDate.getFullYear()}-${income.recordDate.getMonth() + 1}`;
      if (!incomeTrends[month]) {
        incomeTrends[month] = 0;
      }
      incomeTrends[month] += income._sum.amount;
    });
    const expenseTrends = {};
    expenses.forEach((expense) => {
      const month = `${expense.recordDate.getFullYear()}-${expense.recordDate.getMonth() + 1}`;
      if (!expenseTrends[month]) {
        expenseTrends[month] = 0;
      }
      expenseTrends[month] += expense._sum.amount;
    });

    const trends = Array.from({ length: 12 }, (_, index) => {
      const month = index + 1;
      return {
        year,
        month: month.toString(),
        income: parseFloat((incomeTrends[`${year}-${month}`] || 0).toFixed(2)),
        expense: parseFloat(
          (expenseTrends[`${year}-${month}`] || 0).toFixed(2),
        ),
      };
    });
    return trends;
  }
}
