import { Module } from '@nestjs/common';
import { ParametrosService } from './parametros.service';
import { ParametrosController } from './parametros.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ParametrosService],
  controllers: [ParametrosController],
  exports: [ParametrosService],
})
export class ParametrosModule {} 