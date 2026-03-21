import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { appendFile } from 'fs';
import { ValidationPipe } from '@nestjs/common';
import { AuditService } from './audit/audit.service';
import { AuditInterceptor } from './audit/interceptors/audit.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const reflector = app.get(Reflector);
  const auditService = app.get(AuditService);

  app.useGlobalInterceptors(new AuditInterceptor(reflector, auditService));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  await app.listen(process.env.PORT ?? 3000);


}

bootstrap();
