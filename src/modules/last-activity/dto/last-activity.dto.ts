import { IsInt, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateLastActivityDto {
    @ApiProperty({ example: 1, required: false })
    @IsInt()
    @IsOptional()
    courseId?: number;

    @ApiProperty({ example: 1, required: false })
    @IsInt()
    @IsOptional()
    sectionId?: number;

    @ApiProperty({ example: 1, required: false })
    @IsInt()
    @IsOptional()
    lessonId?: number;

    @ApiProperty({ example: "/courses/1/lessons/5", required: false })
    @IsString()
    @IsOptional()
    url?: string;
}
