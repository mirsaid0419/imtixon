import {
    Controller,
    Get,
    Param,
    UseGuards,
    Req,
    ParseIntPipe,
} from '@nestjs/common';
import { ExamResultsService } from './exam-results.service';
import { TokenGuard } from 'src/common/guards/token.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role';
import { UserRole } from '@prisma/client';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Exam Results (Imtihon yakuniy natijalari)')
@Controller('exam-results')
@UseGuards(TokenGuard, RoleGuard)
@ApiBearerAuth('token')
export class ExamResultsController {
    constructor(private readonly resultsService: ExamResultsService) { }

    @ApiOperation({ summary: "Talaba o'zining bo'limdagi yakuniy imtihon natijasini ko'rishi" })
    @Roles(UserRole.STUDENT, UserRole.MENTOR, UserRole.ADMIN)
    @Get('my/:sectionLessonId')
    getMyResult(
        @Req() req,
        @Param('sectionLessonId', ParseIntPipe) sectionLessonId: number,
    ) {
        return this.resultsService.getMyResultBySection(req.user.id, sectionLessonId);
    }

    @ApiOperation({ summary: "Mentor bo'limdagi barcha talabalar natijalarini ko'rishi" })
    @Roles(UserRole.ADMIN, UserRole.MENTOR)
    @Get('all/:sectionLessonId')
    findAllBySection(
        @Req() req,
        @Param('sectionLessonId', ParseIntPipe) sectionLessonId: number,
    ) {
        return this.resultsService.findAllBySection(sectionLessonId, req.user.id, req.user.role);
    }

    @ApiOperation({ summary: "Talabaning kurs bo'yicha umumiy o'zlashtirishini (progress) ko'rishi" })
    @Roles(UserRole.STUDENT, UserRole.MENTOR, UserRole.ADMIN)
    @Get('course-progress/:courseId')
    getCourseProgress(
        @Req() req,
        @Param('courseId', ParseIntPipe) courseId: number,
    ) {
        // Agar mentor bo'lsa, kimnidir progressini ko'rishimiz kerak bo'lishi mumkin (lekin bu yerda hozircha o'zi uchun)
        return this.resultsService.getCourseProgress(req.user.id, courseId);
    }
}
