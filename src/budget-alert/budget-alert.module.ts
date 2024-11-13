import { Module } from '@nestjs/common';
import { BudgetAlertService } from './budget-alert.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [PrismaModule, EmailModule],
  providers: [BudgetAlertService],
})
export class BudgetAlertModule {}
