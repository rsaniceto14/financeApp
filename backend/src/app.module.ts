import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './auth/auth.module';
import { OrganizationModule } from './organization/organization.module';
import { AuditService } from './audit/audit.service';
import { AuditModule } from './audit/audit.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    UserModule,
    AuthModule,
    OrganizationModule,
    AuditModule,
  ],
  controllers: [AppController],
  providers: [AppService, AuditService],
})
export class AppModule { }
