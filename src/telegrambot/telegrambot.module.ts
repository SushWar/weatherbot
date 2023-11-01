import { Module } from '@nestjs/common';
import { TelegrambotService } from './telegrambot.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseService } from 'src/database/database.service';

@Module({
  imports:[ConfigModule],
  providers: [TelegrambotService, DatabaseService]
})
export class TelegrambotModule {}
