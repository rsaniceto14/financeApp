import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RolesGuard } from './guards/roles.guard';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
imports: [
    UserModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],        
      inject: [ConfigService],        
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),  
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy, RolesGuard],
  controllers: [AuthController]
})

export class AuthModule { }
