import { Test, TestingModule } from '@nestjs/testing';
import { BudgetGoalService } from './budget-goal.service';

describe('BudgetGoalService', () => {
  let service: BudgetGoalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BudgetGoalService],
    }).compile();

    service = module.get<BudgetGoalService>(BudgetGoalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
