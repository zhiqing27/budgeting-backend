import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ExpenseModule } from './expense/expense.module';
import { IncomeModule } from './income/income.module';
import { CategoryModule } from './category/category.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [  ConfigModule.forRoot({ isGlobal: true }), PrismaModule, AuthModule, ExpenseModule, IncomeModule, CategoryModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
