import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';
import { BudgetService } from './budget.service';
import { BudgetController } from './budget.controller';

@Module({
  imports: [PrismaModule, JwtModule],
  providers: [BudgetService],
  controllers: [BudgetController]
})
export class BudgetModule {}
