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
import { RatingsService } from './ratings.service';
import { CreateRatingDto, UpdateRatingDto } from './dto/create-rating.dto';
import { TokenGuard } from 'src/common/guards/token.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role';
import { UserRole } from '@prisma/client';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Kurs reytinglari')
@Controller('ratings')
@UseGuards(TokenGuard, RoleGuard)
@ApiBearerAuth('token')
export class RatingsController {
    constructor(private readonly ratingsService: RatingsService) { }

    @ApiOperation({ summary: "Kursga reyting qoldirish (Faqat kurs talabasi)" })
    @Post()
    @Roles(UserRole.STUDENT)
    create(@Req() req, @Body() dto: CreateRatingDto) {
        return this.ratingsService.create(req.user.id, dto);
    }

    @ApiOperation({ summary: "O'zining reytingini tahrirlash (kurs ID bo'yicha)" })
    @Patch('course/:courseId')
    @Roles(UserRole.STUDENT)
    update(
        @Req() req,
        @Param('courseId', ParseIntPipe) courseId: number,
        @Body() dto: UpdateRatingDto,
    ) {
        return this.ratingsService.update(courseId, req.user.id, dto);
    }

    @ApiOperation({ summary: "Student o'z reytingini o'chirish (kurs ID bo'yicha)" })
    @Delete('course/:courseId')
    @Roles(UserRole.STUDENT)
    removeByStudent(@Req() req, @Param('courseId', ParseIntPipe) courseId: number) {
        return this.ratingsService.removeByStudent(courseId, req.user.id);
    }

    @ApiOperation({ summary: "Admin talaba reytingini o'chirish (userId va courseId bo'yicha)" })
    @Delete('admin/:userId/:courseId')
    @Roles(UserRole.ADMIN)
    removeByAdmin(
        @Param('userId', ParseIntPipe) userId: number,
        @Param('courseId', ParseIntPipe) courseId: number,
    ) {
        return this.ratingsService.removeByAdmin(userId, courseId);
    }

    @ApiOperation({ summary: "Kurs uchun barcha reytinglarni olish (Ommaviy)" })
    @Get('course/:courseId')
    @Roles(UserRole.STUDENT, UserRole.MENTOR, UserRole.ADMIN)
    getCourseRatings(@Param('courseId', ParseIntPipe) courseId: number) {
        return this.ratingsService.getCourseRatings(courseId);
    }

    @ApiOperation({ summary: "Talabaning ma'lum bir kursga qo'ygan reytingini ko'rish" })
    @Get('my/course/:courseId')
    @Roles(UserRole.STUDENT)
    getMyCourseRating(@Req() req, @Param('courseId', ParseIntPipe) courseId: number) {
        return this.ratingsService.getStudentCourseRating(req.user.id, courseId);
    }

    @ApiOperation({ summary: "Admin uchun: Studentning ma'lum bir kursga qo'ygan reytingini ko'rish" })
    @Get('student/:studentId/course/:courseId')
    @Roles(UserRole.ADMIN)
    getStudentCourseRatingAdmin(
        @Param('studentId', ParseIntPipe) studentId: number,
        @Param('courseId', ParseIntPipe) courseId: number,
    ) {
        return this.ratingsService.getStudentCourseRating(studentId, courseId);
    }

    @ApiOperation({ summary: "Admin uchun: Studentning barcha qoldirgan reytinglarini ko'rish" })
    @Get('student/:studentId/all')
    @Roles(UserRole.ADMIN)
    getStudentAllRatingsAdmin(@Param('studentId', ParseIntPipe) studentId: number) {
        return this.ratingsService.getStudentRatings(studentId);
    }
}
