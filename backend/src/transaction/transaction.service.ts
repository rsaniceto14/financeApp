import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtPayload } from 'src/auth/types/jwt-payload';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Decimal } from '@prisma/client/runtime/client';
import { QueryTransactionsDto } from './dto/query-transactions.dto';
import { metadata } from 'reflect-metadata/no-conflict';

@Injectable()
export class TransactionService {

    constructor(private prisma: PrismaService) { }

    async create(user: JwtPayload, dto: CreateTransactionDto) {

        const sources = [
            dto.accountId,
            dto.creditCardId,
            dto.invoiceId
        ].filter(Boolean)

        if (sources.length !== 1) {
            throw new BadRequestException('Transaction must belong to exactly one source')
        }

        return this.prisma.transaction.create({
            data: {
                description: dto.description,
                amount: new Decimal(dto.amount),
                type: dto.type,
                occurredAt: new Date(dto.occurredAt),
                userId: user.sub,
                organizationId: user.orgId,
                accountId: dto.accountId,
                creditCardId: dto.creditCardId,
                invoiceId: dto.invoiceId


            }
        })
    }

    async findAll(user: JwtPayload, query: QueryTransactionsDto) {
        const { page, limit, type, from, to } = query
        const skip = (page - 1) * limit

        const where: any = {
            organizationId: user.orgId,
        }

        if (type) where.type = type

        if (from || to) {
            where.occurredAt = {}
            if (from) where.occurredAt.gte = new Date(from)
            if (to) where.occurredAt.lte = new Date(to)
        }

        const [data, total] = await this.prisma.$transaction([
            this.prisma.transaction.findMany({
                where,
                skip,
                take: limit,
                orderBy: { occurredAt: 'desc' },
                include: {
                    account: true,
                    creditCard: true,
                },
            }),
            this.prisma.transaction.count({ where })
        ])
        return {
            data,
            metadata: {
                total,
                page,
                lastPage: Math.ceil(total / limit)
            }
        }

    }

    async getSummary(user: any, query: any) {
        const { from, to } = query;

        const where: any = {
            organizationId: user.orgId,
        }


        if (from || to) {
            where.occurredAt = {}
            if (from) where.occurredAt.gte = new Date(from)
            if (to) where.occurredAt.lte = new Date(to)
        }

        const transaction = await this.prisma.transaction.findMany({
            where,
            select: {
                amount: true,
                type: true,
            },
        })

        let income = 0
        let expense = 0

        for (const t of transaction) {
            const value = Number(t.amount)

            if (t.type === 'INCOME') income += value
            if (t.type === 'EXPENSE') expense += value
        }
        return {
            income,
            expense,
            balance: income - expense
        }
    }

}
