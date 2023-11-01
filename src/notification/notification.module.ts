import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationService } from './notification.service';
import { DatabaseService } from 'src/database/database.service';

@Module({
    imports:[ConfigModule],
    providers: [NotificationService]
})

export class NotificationModule {}
