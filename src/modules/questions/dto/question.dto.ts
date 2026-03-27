import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateQuestionDto {
    @ApiProperty({ example: 1, description: "Kurs ID raqami" })
    @Type(() => Number)
    @IsInt()
    @IsNotEmpty()
    courseId: number;

    @ApiProperty({ example: "Ushbu bo'limdagi mavzuga tushunmadim, tushuntirib yubora olasizmi?", description: "Savol matni" })
    @IsString()
    @IsNotEmpty()
    text: string;

    @ApiProperty({ type: 'string', format: 'binary', description: "Savolga ilovadagi fayl", required: false })
    file?: any;
}

export class CreateAnswerDto {
    @ApiProperty({ example: 1, description: "Savol ID raqami" })
    @Type(() => Number)
    @IsInt()
    @IsNotEmpty()
    questionId: number;

    @ApiProperty({ example: "Mana bu qo'llanmani ko'rib chiqing...", description: "Javob matni" })
    @IsString()
    @IsNotEmpty()
    text: string;

    @ApiProperty({ type: 'string', format: 'binary', description: "Javobga ilovadagi fayl", required: false })
    file?: any;
}
