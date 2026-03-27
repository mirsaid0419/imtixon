import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateLessonDto {
    @ApiProperty({ example: 'Dars nomi', description: 'Dars nomi' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'Dars haqida qisqacha maʼlumot', description: 'Dars tavsifi' })
    @IsString()
    @IsNotEmpty()
    about: string;

    @ApiProperty({ example: 1, description: "Bo'lim ID raqami" })
    @Type(() => Number)
    @IsInt()
    @IsNotEmpty()
    sectionId: number;

    @ApiProperty({ type: 'string', format: 'binary', description: 'Dars videosi (Video fayl)' })
    video: any;
}

export class UpdateLessonDto {
    @ApiProperty({ example: 'Yangi dars nomi', required: false })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty({ example: 'Yangi dars tavsifi', required: false })
    @IsString()
    @IsOptional()
    about?: string;

    @ApiProperty({ type: 'string', format: 'binary', description: 'Yangi video fayl', required: false })
    @IsOptional()
    video?: any;
}
