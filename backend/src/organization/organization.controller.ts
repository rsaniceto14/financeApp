import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { AddMemberDto } from './dto/add-member.dto';
import { Role } from '@prisma/client';
import { OrganizationService } from './organization.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { JwtPayload } from 'src/auth/types/jwt-payload';

@Controller('organization')
export class OrganizationController {

    constructor(private readonly organizationService: OrganizationService) {}

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.OWNER, Role.ADMIN)
@Post('members')
addMember(@CurrentUser() user: JwtPayload, @Body() dto: AddMemberDto){
    return this.organizationService.addMember(user, dto);
}

}
