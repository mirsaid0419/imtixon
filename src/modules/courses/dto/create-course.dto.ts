import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CourseLevel } from '@prisma/client';

export class CreateCourseDto {
  @ApiProperty({ example: 'NestJS Full Course' })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  name: string;

  @ApiProperty({ example: 'Bu kursda NestJS arxitekturasini o‘rganasiz.' })
  @IsString()
  @IsNotEmpty()
  @MinLength(20)
  about: string;

  @ApiProperty({ example: 99.99, description: 'Kurs narxi' })
  @Type(() => Number) // String kelgan taqdirda Number'ga o'giradi
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ enum: CourseLevel, example: CourseLevel.BEGINNER })
  @IsEnum(CourseLevel)
  level: CourseLevel;

  @ApiProperty({ example: 1, description: 'Kategoriya ID-si' })
  @Type(() => Number)
  @IsNumber()
  categoryId: number;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Kurs muqovasi (rasm)',
  })
  banner?: any; // Fayl yuklash uchun

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Kurs intro videosi',
  })
  introVideo?: any; // Fayl yuklash uchun
}

export class FindAllCourseDto {
  @ApiProperty({
    required: false,
    default: 'false',
    description: "O'chirilgan courselarni ham ko'rish uchun 'true' yuboring",
  })
  @IsOptional() // BU ENG MUHIMI: ValidationPipe buni ko'rib, xato bermaydi
  @IsString()
  isDeleted?: string = 'false';
}
export class PublishedUpdate {
  @ApiProperty({
    required: false,
    default: 'false',
    description: "Courseni public qilish uchun 'true' yuboring",
  })
  @IsString()
  published: string = 'false';
}