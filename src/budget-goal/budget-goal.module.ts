import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';
import { BudgetGoalService } from './budget-goal.service';
import { BudgetGoalController } from './budget-goal.controller';

@Module({
  imports: [PrismaModule, JwtModule],
  providers: [BudgetGoalService],
  controllers: [BudgetGoalController],
})

export class BudgetGoalModule {}
