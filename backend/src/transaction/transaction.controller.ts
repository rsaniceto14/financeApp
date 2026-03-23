import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { JwtPayload } from 'src/auth/types/jwt-payload';
import { AuthGuard } from '@nestjs/passport';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Audit } from 'src/audit/decorators/audit.decorators';

@Controller('transaction')
export class TransactionController {
    constructor(private service: TransactionService) { }

    @UseGuards(AuthGuard('jwt'))
    @Audit({action: 'TRANSACTION_CREATED'})
    @Post()
    create(
        @CurrentUser() user: JwtPayload,
        @Body() dto: CreateTransactionDto,
) {
    return this.service.create(user, dto)
}
}
