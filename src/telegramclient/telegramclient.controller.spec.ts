import { Test, TestingModule } from '@nestjs/testing';
import { TelegramclientController } from './telegramclient.controller';

describe('TelegramclientController', () => {
  let controller: TelegramclientController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TelegramclientController],
    }).compile();

    controller = module.get<TelegramclientController>(TelegramclientController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
