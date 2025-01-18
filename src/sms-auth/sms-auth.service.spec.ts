import { Test, TestingModule } from '@nestjs/testing';
import { SmsAuthService } from './sms-auth.service';

describe('SmsAuthService', () => {
  let service: SmsAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SmsAuthService],
    }).compile();

    service = module.get<SmsAuthService>(SmsAuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
