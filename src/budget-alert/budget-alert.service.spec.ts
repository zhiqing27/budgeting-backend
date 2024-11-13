import { Test, TestingModule } from '@nestjs/testing';
import { BudgetAlertService } from './budget-alert.service';

describe('BudgetAlertService', () => {
  let service: BudgetAlertService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BudgetAlertService],
    }).compile();

    service = module.get<BudgetAlertService>(BudgetAlertService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
