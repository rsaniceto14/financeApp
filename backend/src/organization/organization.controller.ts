import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { AddMemberDto } from './dto/add-member.dto';
import { Role } from '@prisma/client';
import { OrganizationService } from './organization.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { JwtPayload } from 'src/auth/types/jwt-payload';
import { InviteMemberDto } from './dto/invite-member.dto';
import { Audit } from 'src/audit/decorators/audit.decorators';

@Controller('organization')
export class OrganizationController {

    constructor(private readonly organizationService: OrganizationService) { }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.OWNER, Role.ADMIN)

    @Post('members')
    addMember(@CurrentUser() user: JwtPayload, @Body() dto: AddMemberDto) {
        return this.organizationService.addMember(user, dto);
    }

    @Audit({ action: 'INVITATION_SENT' })
    @Post('invite')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.OWNER, Role.ADMIN)
    inviteMember(
        @CurrentUser() user: JwtPayload,
        @Body() dto: InviteMemberDto,
    ) {
        return this.organizationService.inviteMember(user, dto)
    }

    @Audit({ action: 'INVITATION_ACCEPTED' })
    @Post('accept-invite/:token')
    acceptInvite(@Param('token') token: string) {
        return this.organizationService.acceptInvite(token)
    }

}
