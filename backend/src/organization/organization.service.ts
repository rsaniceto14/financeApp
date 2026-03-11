import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { AddMemberDto } from './dto/add-member.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class OrganizationService {

    constructor(private prisma: PrismaService) { }


    async addMember(currentUser: any, dto: AddMemberDto) {

        if(dto.role === Role.OWNER && currentUser.role !== Role.OWNER) {
            throw new ForbiddenException ('Only Owner can assign OWNER role')
        }

        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        })

        if (!user) {
            throw new NotFoundException('User not found')

        }

        return this.prisma.membership.create({
            data: {
                userId: user.id,
                organizationId: currentUser.orgId,
                role: dto.role,
            },
        })
    }

}
