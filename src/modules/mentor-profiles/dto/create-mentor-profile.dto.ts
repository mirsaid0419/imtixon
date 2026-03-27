import {
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMentorProfileDto {
  @ApiProperty({
    example: 'Men 5 yillik tajribaga ega Full-stack dasturchiman.',
  })
  @IsString()
  @IsNotEmpty()
  about: string;

  @ApiProperty({ example: 'Senior Software Engineer' })
  @IsString()
  @IsNotEmpty()
  job: string;

  @ApiProperty({ example: 5, description: 'Yillar hisobida tajriba' })
  @IsInt()
  @Min(0)
  experience: number;

  @ApiPropertyOptional({ example: 'https://t.me/username' })
  @IsOptional()
  @IsString() // Ijtimoiy tarmoqlar uchun doim ham URL bo'lmasligi mumkin (masalan, faqat username)
  telegram?: string;

  @ApiPropertyOptional({ example: 'https://instagram.com/username' })
  @IsOptional()
  @IsUrl()
  instagram?: string;

  @ApiPropertyOptional({ example: 'https://linkedin.com/in/username' })
  @IsOptional()
  @IsUrl()
  linkedin?: string;

  @ApiPropertyOptional({ example: 'https://github.com/username' })
  @IsOptional()
  @IsUrl()
  github?: string;

  @ApiPropertyOptional({ example: 'https://facebook.com/username' })
  @IsOptional()
  @IsUrl()
  facebook?: string;

  @ApiPropertyOptional({ example: 'https://mywebsite.com' })
  @IsOptional()
  @IsUrl()
  website?: string;
}
