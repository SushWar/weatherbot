import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseService } from 'src/database/database.service';

@Module({
  imports:[ConfigModule],
  controllers: [AdminController],
  providers: [AdminService, DatabaseService]
})
export class AdminModule {}
