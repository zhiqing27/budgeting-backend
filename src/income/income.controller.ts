import { Controller, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('income')
@UseGuards(JwtAuthGuard)  
export class IncomeController {}
