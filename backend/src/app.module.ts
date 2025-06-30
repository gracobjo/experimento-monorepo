import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CasesModule } from './cases/cases.module';
import { DocumentsModule } from './documents/documents.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { TasksModule } from './tasks/tasks.module';
import { ReportsModule } from './reports/reports.module';
import { AdminModule } from './admin/admin.module';
import { ChatModule } from './chat/chat.module';
import { PrismaModule } from './prisma/prisma.module';
import { ParametrosModule } from './parametros/parametros.module';
import { InvoicesModule } from './invoices/invoices.module';
import { ProvisionFondosModule } from './provision-fondos/provision-fondos.module';
import { ContactModule } from './contact/contact.module';
import { TeleassistanceModule } from './teleassistance/teleassistance.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CasesModule,
    DocumentsModule,
    AppointmentsModule,
    TasksModule,
    ReportsModule,
    AdminModule,
    ChatModule,
    ParametrosModule,
    InvoicesModule,
    ProvisionFondosModule,
    ContactModule,
    TeleassistanceModule,
  ],
})
export class AppModule {} 