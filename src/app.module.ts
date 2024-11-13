import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ExpenseModule } from './expense/expense.module';
import { IncomeModule } from './income/income.module';
import { CategoryModule } from './category/category.module';
import { ConfigModule } from '@nestjs/config';
import { BudgetService } from './budget/budget.service';
import { BudgetModule } from './budget/budget.module';
import { BudgetController } from './budget/budget.controller';
import { ReportService } from './report/report.service';
import { ReportModule } from './report/report.module';
import { BudgetAlertModule } from './budget-alert/budget-alert.module';
import { EmailModule } from './email/email.module';
import { ScheduleModule } from '@nestjs/schedule';
import { BudgetGoalService } from './budget-goal/budget-goal.service';
import { BudgetGoalController } from './budget-goal/budget-goal.controller';
import { BudgetGoalModule } from './budget-goal/budget-goal.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(), 
    PrismaModule,
    AuthModule,
    ExpenseModule,
    IncomeModule,
    CategoryModule,
    BudgetModule,
    ReportModule,
    BudgetAlertModule,
    EmailModule,
    BudgetGoalModule,
  ],
  controllers: [AppController, BudgetController, BudgetGoalController],
  providers: [AppService, BudgetService, ReportService, BudgetGoalService],
})
export class AppModule {}
