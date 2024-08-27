import { Test, TestingModule } from '@nestjs/testing';
import { BrowserServiceService } from './browser-service.service';

describe('BrowserServiceService', () => {
  let service: BrowserServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BrowserServiceService],
    }).compile();

    service = module.get<BrowserServiceService>(BrowserServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
