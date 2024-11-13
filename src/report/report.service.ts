import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { parseToNumericId } from 'helper';

@Injectable()
export class ReportService {
  constructor(private readonly prisma: PrismaService) {}

  async getCategorySummary(userId: number, startDate: Date, endDate: Date,categoryId: number ) {
  
  
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
  
    const categorySummary = categories.map(category => {
      const totalBudget = category.budgets.reduce((sum, budget) => sum + budget.amount, 0);
      const totalSpent = category.expenses.reduce((sum, expense) => sum + expense.amount, 0);
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
  

    const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
  
     const categorySummary = categories.map(category => {
      const totalBudget = category.budgets.reduce((sum, budget) => sum + budget.amount, 0);
      const totalSpent = category.expenses.reduce((sum, expense) => sum + expense.amount, 0);
      const remainingBudget = totalBudget - totalSpent;
    
      return {
        categoryId: category.id,
        categoryName: category.name,
        totalSpent,
        budgetAmount: totalBudget,
        remainingBudget,
      };
    });
  

    const totalExpenses = categorySummary.reduce((sum, category) => sum + category.totalSpent, 0);
    const netIncome = totalIncome - totalExpenses;

    return {
      income: totalIncome,
      totalExpenses,
      netIncome,
      categories: categorySummary,
    };
  }
  
}
