// src/budget-alert/budget-alert.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { formatToTwoDecimalPlaces } from 'helper';
import { EmailService } from 'src/email/email.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BudgetAlertService {

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}


  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleBudgetAlerts() {
    console.log('Running budget alert cron job.');

    try {
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth(); 
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 1);

      const budgets = await this.prisma.budget.findMany({
        where: {
          recordDate: {
            gte: startDate,
            lt: endDate,
          },
          budgetAlert: true,
          remind_at: {
            equals: null, 
          },
        },
        include: {
          user: true,
          category: true,
        },
      });

      if (budgets.length === 0) {
        console.log('No budgets to process. Exiting cron job.');
        return;
      }

      const categoryIds = budgets.map((budget) => budget.categoryId);

   
      const expenseAggregates = await this.prisma.expense.groupBy({
        by: ['categoryId'],
        where: {
          userId: { in: budgets.map((budget) => budget.userId) },
          categoryId: { in: categoryIds },
          recordDate: {
            gte: startDate,
            lt: endDate,
          },
        },
        _sum: {
          amount: true,
        },
      });

      const expenseMap = new Map<number, number>();
      expenseAggregates.forEach((aggregate) => {
        expenseMap.set(aggregate.categoryId, aggregate._sum.amount || 0);
      });
      const exceededBudgetsByUser: { [key: string]: any[] } = {};


      for (const budget of budgets) {
        const totalExpenses = formatToTwoDecimalPlaces(expenseMap.get(budget.categoryId) || 0);
        const netBalance = formatToTwoDecimalPlaces(budget.amount - totalExpenses);
      
        console.log(
          `User: ${budget.user.email}, Category: ${budget.category.name}, Total Expenses: $${totalExpenses}, Budgeted Amount: $${formatToTwoDecimalPlaces(budget.amount)}, Net Balance: $${netBalance}`
        );
      
        if (totalExpenses > budget.amount) {
          
          if (!exceededBudgetsByUser[budget.user.email]) {
            exceededBudgetsByUser[budget.user.email] = [];
          }
          exceededBudgetsByUser[budget.user.email].push({
            category: budget.category.name,
            totalExpenses,
            budgetedAmount: formatToTwoDecimalPlaces(budget.amount),
          });
          const now = new Date();
          await this.prisma.budget.update({
            where: { id: budget.id },
            data: { remind_at: now },
          });
      
          console.log(
            `Budget exceeded for user ${budget.user.email} in category ${budget.category.name}. Added to alert list.`
          );
        } else {
            console.log(
            `Budget not exceeded for user ${budget.user.email} in category ${budget.category.name}. No action taken.`
          );
        }
      }
      
     
      for (const [userEmail, exceededCategories] of Object.entries(exceededBudgetsByUser)) {
        if (exceededCategories.length > 0) {
          console.log(`Sending budget exceeded alert for user ${userEmail} with multiple categories.`);
      
     
          await this.emailService.sendBudgetExceededAlert(
            userEmail,
            exceededCategories
          );
      
          console.log(
            `Budget exceeded alert sent for user ${userEmail} with categories: ${exceededCategories.map(cat => cat.category).join(', ')}.`
          );
        }
      }

      console.log('Budget alert cron job completed.');
    } catch (error) {
        console.error('Error running budget alert cron job', error.stack);
    }
  }
}
