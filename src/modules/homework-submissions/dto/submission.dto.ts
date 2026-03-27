import { IsInt, IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { HomeworkSubStatus } from '@prisma/client';

export class CreateSubmissionDto {
    @ApiProperty({ example: 1, description: "Vazifa ID raqami (Homework ID)" })
    @Type(() => Number)
    @IsInt()
    @IsNotEmpty()
    homeworkId: number;

    @ApiProperty({ example: "Vazifa javobi...", description: "Javob matni (Majburiy)" })
    @IsString()
    @IsNotEmpty()
    text: string;

    @ApiProperty({ type: 'string', format: 'binary', description: "Javob fayli (Ixtiyoriy)", required: false })
    @IsOptional()
    file?: any;
}

export class ReviewSubmissionDto {
    @ApiProperty({ enum: HomeworkSubStatus, example: HomeworkSubStatus.APPROVED })
    @IsEnum(HomeworkSubStatus)
    @IsNotEmpty()
    status: HomeworkSubStatus;

    @ApiProperty({ example: "Vazifa yaxshi bajarilgan.", description: "Mentor izohi yoki rad etish sababi", required: false })
    @IsString()
    @IsOptional()
    reason?: string;
}
