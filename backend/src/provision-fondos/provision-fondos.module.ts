import { Module } from '@nestjs/common';
import { ProvisionFondosController } from './provision-fondos.controller';
import { ProvisionFondosService } from './provision-fondos.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ProvisionFondosController],
  providers: [ProvisionFondosService],
  exports: [ProvisionFondosService],
})
export class ProvisionFondosModule {} 