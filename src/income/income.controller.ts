import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { IncomeService } from './income.service';

@Controller('income')
@UseGuards(JwtAuthGuard)
export class IncomeController {
  constructor(private readonly incomeService: IncomeService) {}
  @Post('create')
  async createIncome(
    @Request() req,
    @Body() data: { description: string; amount: string; record_date: string },
  ) {
    const userId = req.user.id; // Access userId from the request object
    return this.incomeService.createIncome(
      userId,
      data.description,
      data.amount,
      data.record_date,
    );
  }

  @Get('list')
  async getIncome(
    @Request() req,
    @Query('month') month: number,
    @Query('year') year: number,
  ) {
    const userId = req.user.id;

    let startDate = null;
    let endDate = null;

    if (month && year) {
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0);
    }

    return this.incomeService.getIncome(userId, startDate, endDate);
  }
  @Get(':id')
  async getSingleIncome(@Request() req, @Param('id') id: number) {
    const userId = req.user.id;
    return this.incomeService.getSingleIncome(id);
  }
  @Patch(':id')
  async updateIncomeRecord(
    @Request() req,
    @Param('id') id: number,
    @Body() data: { description: string; amount: string; record_date: string },
  ) {
    const userId = req.user.id;
    return this.incomeService.updateIncomeRecord(userId, id, data.description, data.amount, data.record_date);
  }
  @Delete(':id')
  async deleteIncomeRecord(@Request() req, @Param('id') id: number) {
    const userId = req.user.id;
    return this.incomeService.deleteIncomeRecord(userId, id);
  }
}
