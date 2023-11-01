import { Module } from '@nestjs/common';
import { TelegramclientService } from './telegramclient.service';
import { TelegramclientController } from './telegramclient.controller';
import { ConfigModule } from '@nestjs/config';
import { DatabaseService } from 'src/database/database.service';
import { TelegrambotService } from 'src/telegrambot/telegrambot.service';

@Module({
  imports:[ConfigModule],
  controllers: [TelegramclientController],
  providers: [TelegramclientService, DatabaseService, TelegrambotService]
})
export class TelegramclientModule {}
