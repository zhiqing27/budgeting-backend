import { Test, TestingModule } from '@nestjs/testing';
import { BudgetGoalController } from './budget-goal.controller';

describe('BudgetGoalController', () => {
  let controller: BudgetGoalController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BudgetGoalController],
    }).compile();

    controller = module.get<BudgetGoalController>(BudgetGoalController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
