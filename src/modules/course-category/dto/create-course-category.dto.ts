import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCourseCategoryDto {
  @ApiProperty({
    example: 'Grafik Dizayn',
    description: 'Kategoriya nomi kamida 3 ta belgidan iborat bo‘lishi kerak'
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;
}

export class FindAllCategoryeDto {
  @ApiProperty({
    required: false,
    default: 'false',
    description:
      "O'chirilgan categorylarni ham ko'rish uchun 'true' yuboring",
  })
  @IsOptional() // BU ENG MUHIMI: ValidationPipe buni ko'rib, xato bermaydi
  @IsString()
  isDeleted?: string = 'false';
}