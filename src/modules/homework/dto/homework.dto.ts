import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateHomeworkDto {
    @ApiProperty({ example: "Ushbu dars bo'yicha amaliy topshiriqni bajaring.", description: "Vazifa matni" })
    @IsString()
    @IsNotEmpty()
    task: string;

    @ApiProperty({ example: 1, description: "Dars ID raqami" })
    @Type(() => Number)
    @IsInt()
    @IsNotEmpty()
    lessonId: number;

    @ApiProperty({ type: 'string', format: 'binary', description: "Vazifa fayli (ixtiyoriy)", required: false })
    file?: any;
}

export class UpdateHomeworkDto {
    @ApiProperty({ example: "Yangilangan vazifa matni", required: false })
    @IsString()
    @IsOptional()
    task?: string;

    @ApiProperty({ type: 'string', format: 'binary', description: "Yangi vazifa fayli", required: false })
    @IsOptional()
    file?: any;
}
