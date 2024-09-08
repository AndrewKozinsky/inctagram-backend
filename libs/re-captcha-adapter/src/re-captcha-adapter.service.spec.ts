import { Test, TestingModule } from '@nestjs/testing';
import { ReCaptchaAdapterService } from './re-captcha-adapter.service';

describe('ReCaptchaAdapterService', () => {
  let service: ReCaptchaAdapterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReCaptchaAdapterService],
    }).compile();

    service = module.get<ReCaptchaAdapterService>(ReCaptchaAdapterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
