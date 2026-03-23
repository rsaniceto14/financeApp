import { IsDateString, IsEnum, isIn, IsInt, isInt, IsNumber, IsOptional, IsString, IsUUID, Min } from "class-validator";
import { TransactionType } from "@prisma/client";
import { Type } from "class-transformer";

export class CreateTransactionDto {
    
    @IsString()
    description: string

    @IsNumber()
    amount: number

    @IsEnum(TransactionType)
    type: TransactionType

    @IsDateString()
    occurredAt: string

    @IsOptional()
    @IsUUID()
    accountId?: string

    @IsOptional()
    @IsUUID()
    creditCardId?: string

    @IsOptional()
    @IsUUID()
    invoiceId?: string


}