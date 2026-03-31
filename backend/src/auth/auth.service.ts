import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';


@Injectable()
export class AuthService {

    constructor(private prisma: PrismaService, private jwtService: JwtService) { }

    async register(dto: RegisterDto) {

        console.log(process.env.JWT_SECRET);
        
        const userExists = await this.prisma.user.findUnique({
            where: { email: dto.email }
        })

        if (userExists) { throw new ConflictException("User already exists") }

        const hashedPassword = await bcrypt.hash(dto.password, 10)

        const result = await this.prisma.$transaction(async (tx) => {

            const user = await tx.user.create({
                data: {
                    email: dto.email,
                    password: hashedPassword,

                }
            })
            //transaction
            const organization = await tx.organization.create({
                data: {
                    name: `${user.email}'s Organization`,
                }
            })

            const membership = await tx.membership.create({
                data: {
                    userId: user.id,
                    organizationId: organization.id,
                    role: 'OWNER',
                }
            })

            return {
                user, organization
            }
        })
        //jwt
        const payload = {
            sub: result.user.id,
            email: result.user.email,
            orgId: result.organization.id,
            role: 'OWNER',
        }

        const accessToken = this.jwtService.sign(payload)
        const refreshToken = this.jwtService.sign(payload, {
            expiresIn: '7d',
        })

        const hashedRefresh = await bcrypt.hash(refreshToken, 10)

        await this.prisma.user.update({
            where: { id: result.user.id },
            data: { refreshToken: hashedRefresh }
        })

        return {
            accessToken,
            refreshToken,
        }
    }

    async login(email: string, password: string) {

        const user = await this.prisma.user.findUnique({
            where: { email },
            include: {
                memberships: true,
            },
        })

        if (!user || !user.password) {
            throw new UnauthorizedException('Invalid credentials')
        }

        const passwordValid = await bcrypt.compare(password, user.password)

        if (!passwordValid) throw new UnauthorizedException('Invalid credentials')

        if (user.memberships.length === 0 || !user.memberships) {
            throw new UnauthorizedException("User has no organization")
        }

        const membership = user.memberships[0]

        const payload = {
            sub: user.id,
            email: user.email,
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
