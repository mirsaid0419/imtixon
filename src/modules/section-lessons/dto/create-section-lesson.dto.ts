import { IsInt, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSectionLessonDto {
    @ApiProperty({ example: 'Kirish', description: "Bo'lim nomi" })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 1, description: 'Kurs ID raqami' })
    @IsInt()
    @IsNotEmpty()
    courseId: number;
}

export class UpdateSectionLessonDto {
    @ApiProperty({ example: 'Yangi boʻlim nomi', description: "Yangilangan bo'lim nomi" })
    @IsString()
    @IsNotEmpty()
    name: string;
}
