import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TelegramclientModule } from './telegramclient/telegramclient.module';
import { ConfigModule } from '@nestjs/config';
import { AdminModule } from './admin/admin.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [ConfigModule.forRoot(),ScheduleModule.forRoot(), TelegramclientModule, AdminModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
