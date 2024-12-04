import { Test, TestingModule } from '@nestjs/testing';
import { UtilityAppController } from './utility_app.controller';
import { UtilityAppService } from './utility_app.service';

describe('UtilityAppController', () => {
  let utilityAppController: UtilityAppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [UtilityAppController],
      providers: [UtilityAppService],
    }).compile();

    utilityAppController = app.get<UtilityAppController>(UtilityAppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(utilityAppController.getHello()).toBe('Hello World!');
    });
  });
});
