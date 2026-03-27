import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    UseGuards,
    Req,
    ParseIntPipe,
} from '@nestjs/common';
import { AssignedCoursesService } from './assigned-courses.service';
import { AssignCourseDto } from './dto/assign-course.dto';
import { TokenGuard } from 'src/common/guards/token.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role';
import { UserRole } from '@prisma/client';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Assigned Courses (Kursga yozilish)')
@Controller('assigned-courses')
@UseGuards(TokenGuard, RoleGuard)
@ApiBearerAuth("token")
export class AssignedCoursesController {
    constructor(private readonly assignedCoursesService: AssignedCoursesService) { }

    @ApiOperation({ summary: "Student kursga yozilishi" })
    @Post('assign')
    @Roles(UserRole.STUDENT)
    assignCourse(@Req() req: any, @Body() dto: AssignCourseDto) {
        return this.assignedCoursesService.assign(req.user.id, dto);
    }


    @ApiOperation({ summary: "Talabaning o'ziga biriktirilgan kurslarini ko'rish" })
    @Get('my')
    @Roles(UserRole.STUDENT)
    getMyAssignments(@Req() req: any) {
        return this.assignedCoursesService.getMyAssignments(req.user.id);
    }

    @ApiOperation({ summary: "Talabaga biriktirilgan barcha kurslarni ko'rish (Faqat Admin)" })
    @Get('all/:userId')
    @Roles(UserRole.ADMIN)
    getUserAssignments(@Param('userId', ParseIntPipe) userId: number) {
        return this.assignedCoursesService.getUserAssignments(userId);
    }

    @ApiOperation({ summary: "Student o'zining yozilgan kursini o'chirishi " })
    @Delete('unassign/:courseId')
    @Roles(UserRole.STUDENT)
    unassignCourse(
        @Req() req: any,
        @Param('courseId', ParseIntPipe) courseId: number,
    ) {
        return this.assignedCoursesService.unassign(
            req.user.id,
            courseId,
            req.user.role,
            req.user.id,
        );
    }

    @ApiOperation({ summary: "Student yozilgan kursni admin tomonidan o'chirish" })
    @Delete('unassign-admin/:userId/:courseId')
    @Roles(UserRole.ADMIN)
    unassignAdmin(
        @Req() req: any,
        @Param('userId', ParseIntPipe) userId: number,
        @Param('courseId', ParseIntPipe) courseId: number,
    ) {
        return this.assignedCoursesService.unassign(
            userId,
            courseId,
            req.user.role,
            req.user.id,
        );
    }
}
