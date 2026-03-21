import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { AddMemberDto } from './dto/add-member.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuditService } from 'src/audit/audit.service';
import { Role } from '@prisma/client';
import { JwtPayload } from 'src/auth/types/jwt-payload';
import { InviteMemberDto } from './dto/invite-member.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class OrganizationService {

    constructor(
        private prisma: PrismaService,
        private auditService: AuditService,
    ) { }


    async addMember(currentUser: any, dto: AddMemberDto) {

        if (dto.role === Role.OWNER && currentUser.role !== Role.OWNER) {
            throw new ForbiddenException('Only Owner can assign OWNER role')
        }

        const existingMembership = await this.prisma.membership.findFirst({
            where: {
                userId: currentUser.sub,
                organizationId: currentUser.orgId
            }
        })

        if (existingMembership) {
            throw new BadRequestException('User is already a member of this organization')
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

    async inviteMember(user: JwtPayload, dto: InviteMemberDto) {

        if (dto.role === Role.OWNER && user.role !== Role.OWNER) {
            throw new ForbiddenException('Only Owner can invite another OWNER')
        }

        const token = randomBytes(32).toString('hex');

        const expiresAt = new Date()
        expiresAt.setHours(expiresAt.getHours() + 48)

        return this.prisma.invitation.create({
            data: {
                email: dto.email,
                role: dto.role,
                token,
                organizationId: user.orgId,
                invitedById: user.sub,
                expiresAt
            }
        })


    }

    async acceptInvite(token: string) {
        const invitation = await this.prisma.invitation.findUnique({
            where: { token }
        })
        if (!invitation) {
            throw new NotFoundException('Invitation not found')
        }

        if (invitation.accepted) {
            throw new BadRequestException('Invitation already used')
        }

        if (invitation.expiresAt < new Date()) {
            throw new BadRequestException('Invitation expired')
        }

        let user = await this.prisma.user.findUnique({
            where: { email: invitation.email }
        })

        if (!user) {
            user = await this.prisma.user.create({
                data: { email: invitation.email }
            })
        }

        if (invitation.accepted) {
            return { message: 'Invitation already accepted' }
        }
        await this.prisma.$transaction(async (tx) => {


            try {
                await this.prisma.membership.create({
                    data: {
                        userId: user.id,
                        organizationId: invitation.organizationId,
                        role: invitation.role
                    },
                })

            } catch (error: any) {
                if (error.code !== 'P2002') {
                    throw error
                }

            }

            await tx.invitation.update({
                where: { id: invitation.id },
                data: { accepted: true }
            })
        })

        return { message: 'Invitation accepted' }
    }



}
