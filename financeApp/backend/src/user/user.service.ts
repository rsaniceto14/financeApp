import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt'

@Injectable()
export class UserService {

    constructor(private prisma: PrismaService) {}

    async create(data: CreateUserDto) {
        const userExists = await this.prisma.user.findUnique({
            where: {email: data.email},
        })

        if(userExists) {
            throw new ConflictException('Email already exists')
        }

        const hashedPassword = await bcrypt.hash(data.password, 10)

        return this.prisma.$transaction(async (tx) => {
            const user = await tx.user.create ({
                data: {
                    email: data.email,
                    password: hashedPassword,
                },
            })

            const organization = await tx.organization.create ({
                data: {
                    name: `${user.email}'s Workspace`,
                }
            })

            await tx.membership.create ({
                data: {
                    userId: user.id,
                    organizationId: organization.id,
                    role: 'OWNER',
                },
            })

            return {
             id: user.id,
             email: user.email,
             organizationId: organization.id,
            }

        })


    }
}
