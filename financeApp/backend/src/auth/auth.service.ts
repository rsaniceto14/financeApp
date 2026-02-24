import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AuthService {

    constructor(private prisma: PrismaService, private jwtService: JwtService) { }

    async login(email: string, password: string) {

        const user = await this.prisma.user.findUnique({
            where: { email },
            include: {
                memberships: true,
            },
        })

        if (!user) throw new UnauthorizedException()

        const passwordValid = await bcrypt.compare(password, user.password)

        if (!passwordValid) throw new UnauthorizedException()

        const membership = user.memberships[0]

        const payload = {
            sub: user.id,
            orgId: membership.organizationId,
            role: membership.role
        }

        const accessToken = this.jwtService.sign(payload)

        const refreshToken = this.jwtService.sign(payload, {
            expiresIn: '7d',
        })

        const hashedRefresh = await bcrypt.hash(refreshToken, 10)

        await this.prisma.user.update({
            where: { id: user.id },
            data: { refreshToken: hashedRefresh }
        })

        return {
            accessToken,
            refreshToken,
        }

    }
}
