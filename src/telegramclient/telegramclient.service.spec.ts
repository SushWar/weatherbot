import { Test, TestingModule } from '@nestjs/testing';
import { TelegramclientService } from './telegramclient.service';

describe('TelegramclientService', () => {
  let service: TelegramclientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TelegramclientService],
    }).compile();

    service = module.get<TelegramclientService>(TelegramclientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
