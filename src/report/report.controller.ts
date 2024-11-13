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
import { ReportService } from './report.service';
import { parseToNumericId } from 'helper';
@Controller('report')
@UseGuards(JwtAuthGuard)
export class ReportController {
  constructor(private readonly reportService: ReportService) {}
  @Get('category-summary')
  async getCategorySummary(
    @Request() req,
    @Query('month') month: string,
    @Query('year') year: string,
    @Query('categoryId') categoryId?: string,
  ) {
    const userId = req.user.id;
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
    const numcategoryId = parseToNumericId(categoryId);
    return this.reportService.getCategorySummary(
      userId,
      new Date(startDate),
      new Date(endDate),
      categoryId ? numcategoryId : undefined,
    );
  }
  @Get('financial-summary')
  async getFinancialSummary(
    @Request() req,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    const userId = req.user.id;
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);

    return this.reportService.getFinancialSummary(
      userId,
      new Date(startDate),
      new Date(endDate),
    );
  }
}
