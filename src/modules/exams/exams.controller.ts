import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Req,
    ParseIntPipe,
} from '@nestjs/common';
import { ExamsService } from './exams.service';
import { CreateExamDto, UpdateExamDto, SubmitExamDto } from './dto/exam.dto';
import { TokenGuard } from 'src/common/guards/token.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role';
import { UserRole } from '@prisma/client';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Exams (Imtihonlar)')
@Controller('exams')
@UseGuards(TokenGuard, RoleGuard)
@ApiBearerAuth('token')
export class ExamsController {
    constructor(private readonly examsService: ExamsService) { }

    @ApiOperation({ summary: "Bo'lim uchun yangi imtihon savolini yaratish (Admin yoki MENTOR)" })
    @Roles(UserRole.ADMIN, UserRole.MENTOR)
    @Post()
    create(@Req() req, @Body() dto: CreateExamDto) {
        return this.examsService.create(req.user.id, req.user.role, dto);
    }

    @ApiOperation({ summary: "Bo'lim savolini tahrirlash (Admin yoki MENTOR)" })
    @Roles(UserRole.ADMIN, UserRole.MENTOR)
    @Patch(':examId')
    update(
        @Req() req,
        @Param('examId', ParseIntPipe) examId: number,
        @Body() dto: UpdateExamDto,
    ) {
        return this.examsService.update(examId, req.user.id, req.user.role, dto);
    }

    @ApiOperation({ summary: "Bo'lim savolini o'chirish (Admin yoki MENTOR)" })
    @Roles(UserRole.ADMIN, UserRole.MENTOR)
    @Delete(':examId')
    remove(@Req() req, @Param('examId', ParseIntPipe) examId: number) {
        return this.examsService.remove(examId, req.user.id, req.user.role);
    }

    @ApiOperation({ summary: "Bo'lim uchun barcha imtihonlarni olish" })
    @Get('section/:sectionId')
    @Roles(UserRole.ADMIN, UserRole.MENTOR, UserRole.STUDENT)
    findAllBySection(
        @Req() req,
        @Param('sectionId', ParseIntPipe) sectionId: number,
    ) {
        return this.examsService.findAllBySection(sectionId, req.user.id, req.user.role);
    }

    @ApiOperation({ summary: "Imtihon topshirish (STUDENT)" })
    @Roles(UserRole.STUDENT)
    @Post('submit')
    submitExam(
        @Req() req,
        @Body() dto: SubmitExamDto,
    ) {
        return this.examsService.submitExam(req.user.id, dto);
    }

    @ApiOperation({ summary: "Imtihon natijasini ko'rish (Student)" })
    @Get('result/:sectionId')
    @Roles(UserRole.ADMIN, UserRole.MENTOR, UserRole.STUDENT)
    getResult(
        @Req() req,
        @Param('sectionId', ParseIntPipe) sectionId: number,
    ) {
        return this.examsService.getResult(req.user.id, sectionId);
    }
}
