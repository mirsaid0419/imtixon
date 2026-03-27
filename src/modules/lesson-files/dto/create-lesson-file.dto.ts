import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateLessonFileDto {
    @ApiProperty({ example: 1, description: 'Dars ID raqami' })
    @Type(() => Number)
    @IsInt()
    @IsNotEmpty()
    lessonId: number;

    @ApiProperty({ example: "Ushbu dars uchun foydali qo'llanma", required: false })
    @IsString()
    @IsOptional()
    note?: string;

    @ApiProperty({ type: 'string', format: 'binary', description: "Ilova fayl (PDF, DOCX, ZIP va h.k.)" })
    file: any;
}

export class UpdateLessonFileDto {
    @ApiProperty({ example: "Yangilangan izoh", required: false })
    @IsString()
    @IsOptional()
    note?: string;

    @ApiProperty({ type: 'string', format: 'binary', description: "Yangi ilova fayl", required: false })
    @IsOptional()
    file?: any;
}
