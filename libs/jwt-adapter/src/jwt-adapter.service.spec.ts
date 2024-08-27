import { Test, TestingModule } from '@nestjs/testing';
import { JwtAdapterService } from './jwt-adapter.service';

describe('JwtAdapterService', () => {
  let service: JwtAdapterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtAdapterService],
    }).compile();

    service = module.get<JwtAdapterService>(JwtAdapterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
