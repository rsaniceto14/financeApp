import { TransactionType } from "@prisma/client";
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator";
import { Type } from "class-transformer";

export class QueryTransactionsDto {
    @IsOptional()
    @IsEnum(TransactionType)
    type?: TransactionType

    @IsOptional()
    @IsDateString()
    from?: string

    @IsOptional()
    @IsDateString()
    to?: string

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page: number = 1

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit: number = 10  
}