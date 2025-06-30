import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { LayoutsController } from './layouts.controller';
import { AdminLayoutsController } from './layouts.controller';
import { LayoutsService } from './layouts.service';
import { MenuConfigController } from './menu-config.controller';
import { MenuConfigService } from './menu-config.service';
import { SiteConfigController } from './site-config.controller';
import { SiteConfigService } from './site-config.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [
    AdminController, 
    LayoutsController, 
    AdminLayoutsController,
    MenuConfigController,
    SiteConfigController
  ],
  providers: [
    AdminService, 
    LayoutsService,
    MenuConfigService,
    SiteConfigService
  ],
  exports: [
    AdminService, 
    LayoutsService,
    MenuConfigService,
    SiteConfigService
  ],
})
export class AdminModule {} 