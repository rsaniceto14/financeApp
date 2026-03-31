import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { JwtPayload } from 'src/auth/types/jwt-payload';
import { AuthGuard } from '@nestjs/passport';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Audit } from 'src/audit/decorators/audit.decorators';
import { QueryTransactionsDto } from './dto/query-transactions.dto';

@Controller('transactions')
export class TransactionController {
    constructor(private service: TransactionService) { }

    @UseGuards(AuthGuard('jwt'))
    @Audit({ action: 'TRANSACTION_CREATED' })
    @Post()
    create(
        @CurrentUser() user: JwtPayload,
        @Body() dto: CreateTransactionDto,
    ) {
        return this.service.create(user, dto)
    }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    findAll(
        @CurrentUser() user: JwtPayload,
        @Query() query: QueryTransactionsDto,
    ) {
        return this.service.findAll(user, query)
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('summary')
    getSummary(
        @CurrentUser() user: JwtPayload,
        @Query() query: QueryTransactionsDto,
    ) {
        return this.service.getSummary(user, query)
    }
}
