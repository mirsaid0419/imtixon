import { IsInt, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ExamAnswer } from '@prisma/client';

export class CreateUserAnswerDto {
    @ApiProperty({ example: 1, description: "Savol ID raqami" })
    @IsInt()
    @IsNotEmpty()
    examId: number;

    @ApiProperty({ enum: ExamAnswer, example: ExamAnswer.variantA })
    @IsEnum(ExamAnswer)
    @IsNotEmpty()
    answer: ExamAnswer;

    @ApiProperty({ example: 1, description: "Bo'lim ID raqami" })
    @IsInt()
    @IsNotEmpty()
    sectionLessonId: number;
}
