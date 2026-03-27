import {
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  Min,
  MinLength,
} from 'class-validator';
import { ApiPropertyOptional, ApiProperty, PartialType } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { CourseLevel } from '@prisma/client';
import { CreateCourseDto } from './create-course.dto';

export class UpdateCourseByAuthorDto {
  @ApiPropertyOptional({ example: 'NestJS Full Course' })
  @IsOptional()
  @IsString()
  @MinLength(5)
  @Transform(({ value }) => (value?.trim() === '' ? undefined : value))
  name?: string;

  @ApiPropertyOptional({ example: 'Kurs haqida batafsil...' })
  @IsOptional()
  @IsString()
  @MinLength(20)
  @Transform(({ value }) => (value?.trim() === '' ? undefined : value))
  about?: string;

  @ApiPropertyOptional({ example: 99.99 })
  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value === null ? undefined : value,
  )
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ enum: CourseLevel })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsEnum(CourseLevel)
  level?: CourseLevel;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Transform(({ value }) => {
    if (
      value === '' ||
      value === null ||
      value === undefined ||
      value === 'undefined'
    ) {
      return undefined;
    }
    return value;
  })
  @Type(() => Number)
  @IsNumber()
  categoryId?: number;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Kurs muqovasi (rasm)',
  })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  banner?: any;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Kurs intro videosi',
  })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  introVideo?: any;
}
export class UpdateCourseByAdminDto extends UpdateCourseByAuthorDto {
  @ApiPropertyOptional({ example: 1, description: 'Mentor ID-si' })
  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value === 'undefined' || value === null ? undefined : value,
  )
  @Type(() => Number)
  @IsNumber()
  mentorId?: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Kursni nashr qilish (Admin uchun)',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value === '' ? undefined : value;
  })
  published?: boolean;
}
