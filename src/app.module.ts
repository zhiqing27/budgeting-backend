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


@Module({
  imports: [  ConfigModule.forRoot({ isGlobal: true }), PrismaModule, AuthModule, ExpenseModule, IncomeModule, CategoryModule, BudgetModule, ReportModule],
  controllers: [AppController, BudgetController],
  providers: [AppService, BudgetService, ReportService],
})
export class AppModule {}
