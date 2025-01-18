import { Test, TestingModule } from '@nestjs/testing';
import { SmsAuthController } from './sms-auth.controller';

describe('SmsAuthController', () => {
  let controller: SmsAuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SmsAuthController],
    }).compile();

    controller = module.get<SmsAuthController>(SmsAuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
