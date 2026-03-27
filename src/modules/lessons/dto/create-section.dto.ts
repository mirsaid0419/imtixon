import { IsInt, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSectionDto {
    @ApiProperty({ example: 'Kirish', description: "Bo'lim nomi" })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 1, description: 'Kurs ID' })
    @IsInt()
    @IsNotEmpty()
    courseId: number;
}
