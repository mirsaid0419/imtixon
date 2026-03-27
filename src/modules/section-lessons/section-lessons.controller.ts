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
import { SectionLessonsService } from './section-lessons.service';
import { CreateSectionLessonDto, UpdateSectionLessonDto } from './dto/create-section-lesson.dto';
import { TokenGuard } from 'src/common/guards/token.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role';
import { UserRole } from '@prisma/client';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags("Section Lessons (Kurs Bo'limlari)")
@Controller('section-lessons')
@UseGuards(TokenGuard, RoleGuard)
@ApiBearerAuth('token')
export class SectionLessonsController {
    constructor(private readonly service: SectionLessonsService) { }

    @ApiOperation({ summary: "Kurs uchun yangi bo'lim yaratish (Admin yoki MENTOR)" })
    @Post()
    @Roles(UserRole.ADMIN, UserRole.MENTOR)
    create(@Req() req, @Body() dto: CreateSectionLessonDto) {
        return this.service.create(req.user.id, req.user.role, dto);
    }

    @ApiOperation({ summary: "Kursning barcha bo'limlarini olish" })
    @Get('course/:courseId')
    @Roles(UserRole.ADMIN, UserRole.MENTOR, UserRole.STUDENT)
    findAllByCourse(@Req() req, @Param('courseId', ParseIntPipe) courseId: number) {
        return this.service.findAllByCourse(courseId, req.user.id, req.user.role);
    }

    @ApiOperation({ summary: "Bo'lim nomini tahrirlash (Admin yoki MENTOR)" })
    @Patch(':id')
    @Roles(UserRole.ADMIN, UserRole.MENTOR)
    update(
        @Req() req,
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateSectionLessonDto,
    ) {
        return this.service.update(id, req.user.id, req.user.role, dto);
    }

    @ApiOperation({ summary: "Bo'limni o'chirib tashlash (Admin yoki MENTOR)" })
    @Delete(':id')
    @Roles(UserRole.ADMIN, UserRole.MENTOR)
    remove(@Req() req, @Param('id', ParseIntPipe) id: number) {
        return this.service.remove(id, req.user.id, req.user.role);
    }
}
