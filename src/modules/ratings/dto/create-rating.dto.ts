import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRatingDto {
    @ApiProperty({ example: 5, minimum: 1, maximum: 5, description: 'Reyting balli (1-5)' })
    @IsInt()
    @Min(1)
    @Max(5)
    @IsNotEmpty()
    rate: number;

    @ApiProperty({ example: 'Juda yaxshi dars ekan!', description: 'Izoh' })
    @IsString()
    @IsNotEmpty()
    comment: string;

    @ApiProperty({ example: 1, description: 'Kurs ID raqami' })
    @IsInt()
    @IsNotEmpty()
    courseId: number;
}

export class UpdateRatingDto {
    @ApiProperty({ example: 4, minimum: 1, maximum: 5, required: false })
    @IsInt()
    @Min(1)
    @Max(5)
    @IsOptional()
    rate?: number;

    @ApiProperty({ example: 'Yaxshi, lekin baʼzi joylari tushunarsiz.', required: false })
    @IsString()
    @IsOptional()
    comment?: string;
}
