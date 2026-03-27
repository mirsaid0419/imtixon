import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    UseGuards,
    Req,
    ParseIntPipe,
} from '@nestjs/common';
import { StudentExamQuestionsService } from './student-exam-questions.service';
import { CreateUserAnswerDto } from './dto/student-answer.dto';
import { TokenGuard } from 'src/common/guards/token.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role';
import { UserRole } from '@prisma/client';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Student Exam Questions (Talabaning har bir savol javobi)')
@Controller('student-exam-questions')
@UseGuards(TokenGuard, RoleGuard)
@ApiBearerAuth('token')
export class StudentExamQuestionsController {
    constructor(private readonly questionsService: StudentExamQuestionsService) { }

    @ApiOperation({ summary: "Talaba tomonidan bajarilgan imtihon savoliga javob yuborish (STUDENT)" })
    @Roles(UserRole.STUDENT)
    @Post('submit')
    submitAnswer(@Req() req, @Body() dto: CreateUserAnswerDto) {
        return this.questionsService.submitAnswer(req.user.id, dto);
    }

    @ApiOperation({ summary: "Talaba o'zining bo'limdagi savollarga bergan javoblarini ko'rishi" })
    @Roles(UserRole.STUDENT)
    @Get('my/:sectionLessonId')
    getMyAnswers(
        @Req() req,
        @Param('sectionLessonId', ParseIntPipe) sectionLessonId: number,
    ) {
        return this.questionsService.getAnswersBySection(req.user.id, sectionLessonId);
    }

    @ApiOperation({ summary: "Mentor bo'limdagi barcha talabalar javoblarini (questions bo'yicha) ko'rishi" })
    @Roles(UserRole.ADMIN, UserRole.MENTOR)
    @Get('all/:sectionLessonId')
    findAllBySection(
        @Req() req,
        @Param('sectionLessonId', ParseIntPipe) sectionLessonId: number,
    ) {
        return this.questionsService.findAllBySection(sectionLessonId, req.user.id, req.user.role);
    }
}
