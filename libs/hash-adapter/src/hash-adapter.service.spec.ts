import { Test, TestingModule } from '@nestjs/testing';
import { HashAdapterService } from './hash-adapter.service';

describe('HashAdapterService', () => {
  let service: HashAdapterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HashAdapterService],
    }).compile();

    service = module.get<HashAdapterService>(HashAdapterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
