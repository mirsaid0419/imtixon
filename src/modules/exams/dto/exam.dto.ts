import { IsInt, IsNotEmpty, IsString, IsEnum, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ExamAnswer } from '@prisma/client';

export class CreateExamDto {
    @ApiProperty({ example: "Node.js nima?" })
    @IsString()
    @IsNotEmpty()
    question: string;

    @ApiProperty({ example: "JavaScript runtime" })
    @IsString()
    @IsNotEmpty()
    variantA: string;

    @ApiProperty({ example: "Dasturlash tili" })
    @IsString()
    @IsNotEmpty()
    variantB: string;

    @ApiProperty({ example: "Ma'lumotlar bazasi" })
    @IsString()
    @IsNotEmpty()
    variantC: string;

    @ApiProperty({ example: "Framework" })
    @IsString()
    @IsNotEmpty()
    variantD: string;

    @ApiProperty({ enum: ExamAnswer, example: ExamAnswer.variantA })
    @IsEnum(ExamAnswer)
    @IsNotEmpty()
    answer: ExamAnswer;

    @ApiProperty({ example: 1 })
    @IsInt()
    @IsNotEmpty()
    sectionLessonId: number;
}

export class UpdateExamDto {
    @ApiProperty( { example: "Node.js nima?" })
    @IsString()
    @IsOptional()
    question?: string;

    @ApiProperty({ example: "JavaScript runtime" })
    @IsString()
    @IsOptional()
    variantA?: string;

    @ApiProperty({ example: "Dasturlash tili" })
    @IsString()
    @IsOptional()
    variantB?: string;

    @ApiProperty({ example: "Ma'lumotlar bazasi" })
    @IsString()
    @IsOptional()
    variantC?: string;

    @ApiProperty({ example: "Framework" })
    @IsString()
    @IsOptional()
    variantD?: string;

    @ApiProperty({ enum: ExamAnswer, example: ExamAnswer.variantA })
    @IsOptional()
    answer?: ExamAnswer;
}

export class UserAnswerDto {
    @ApiProperty({ example: 1 })
    @IsInt()
    @IsNotEmpty()
    examId: number;

    @ApiProperty({ enum: ExamAnswer, example: ExamAnswer.variantA })
    @IsEnum(ExamAnswer)
    @IsNotEmpty()
    answer: ExamAnswer;
}

export class SubmitExamDto {
    @ApiProperty({ example: 1 })
    @IsInt()
    @IsNotEmpty()
    sectionLessonId: number;

    @ApiProperty({ type: [UserAnswerDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UserAnswerDto)
    answers: UserAnswerDto[];
}
