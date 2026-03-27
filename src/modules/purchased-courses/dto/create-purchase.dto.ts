import { IsEnum, IsInt, IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaidVia } from '@prisma/client';

export class CreatePurchaseDto {
    @ApiProperty({ example: 1, description: 'Kurs ID raqami' })
    @IsInt()
    @IsNotEmpty()
    courseId: number;

    @ApiProperty({ example: 450000, description: "To'langan summa" })
    @IsNumber()
    @IsNotEmpty()
    amount: number;

    @ApiProperty({ enum: PaidVia, example: PaidVia.CLICK, description: "To'lov turi" })
    @IsEnum(PaidVia)
    @IsNotEmpty()
    paidVia: PaidVia;
}
