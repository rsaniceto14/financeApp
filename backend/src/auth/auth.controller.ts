import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
    constructor(private service: AuthService) { }

    @Post('register')
    @HttpCode(201)
    async register(@Body() dto: RegisterDto) {
        return this.service.register(dto)
    }

    @Post('login')
    @HttpCode(200)
    async login(@Body() dto: LoginDto) {
        return this.service.login(dto.email, dto.password)
    }
}
