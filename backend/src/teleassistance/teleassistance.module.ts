import { Module } from '@nestjs/common';
import { TeleassistanceController } from './teleassistance.controller';
import { TeleassistanceService } from './teleassistance.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TeleassistanceController],
  providers: [TeleassistanceService],
  exports: [TeleassistanceService],
})
export class TeleassistanceModule {} 