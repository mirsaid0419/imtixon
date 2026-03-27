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
    UseInterceptors,
    UploadedFile,
    ParseIntPipe,
} from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { CreateLessonDto, UpdateLessonDto } from './dto/create-lesson.dto';
import { TokenGuard } from 'src/common/guards/token.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role';
import { UserRole } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Lessons')
@Controller('lessons')
@UseGuards(TokenGuard, RoleGuard)
@ApiBearerAuth('token')
export class LessonsController {
    constructor(
        private readonly lessonsService: LessonsService,
        private readonly cloudinary: CloudinaryService,
    ) { }

    @ApiOperation({ summary: "Yangi dars qo'shish (Admin yoki MENTOR)" })
    @Roles(UserRole.ADMIN, UserRole.MENTOR)
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('video'))
    @Post()
    async create(
        @Req() req,
        @Body() dto: CreateLessonDto,
        @UploadedFile() video: Express.Multer.File,
    ) {
        const uploadResult = await this.cloudinary.uploadFile(video, 'lessons/videos');
        return this.lessonsService.create(req.user.id, req.user.role, dto, {
            url: uploadResult.url,
            publicId: uploadResult.publicId,
        });
    }

    @ApiOperation({ summary: "Dars ma'lumotlarini olish (Sotib olgan talabalar uchun)" })
    @Get(':id')
    @Roles(UserRole.ADMIN, UserRole.MENTOR, UserRole.STUDENT)
    findOne(@Req() req, @Param('id', ParseIntPipe) id: number) {
        return this.lessonsService.findOne(id, req.user.id, req.user.role);
    }

    @ApiOperation({ summary: "Kursdagi barcha darslarni olish" })
    @Get('course/:courseId')
    @Roles(UserRole.ADMIN, UserRole.MENTOR, UserRole.STUDENT)
    findByCourse(@Req() req, @Param('courseId', ParseIntPipe) courseId: number) {
        return this.lessonsService.findByCourse(courseId, req.user.id, req.user.role);
    }

    @ApiOperation({ summary: "Darsni tahrirlash (Admin yoki MENTOR)" })
    @Roles(UserRole.ADMIN, UserRole.MENTOR)
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('video'))
    @Patch(':id')
    async update(
        @Req() req,
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateLessonDto,
        @UploadedFile() video?: Express.Multer.File,
    ) {
        let videoData;
        if (video) {
            const uploadResult = await this.cloudinary.uploadFile(video, 'lessons/videos');
            videoData = { url: uploadResult.url, publicId: uploadResult.publicId };
        }
        return this.lessonsService.update(id, req.user.id, req.user.role, dto, videoData);
    }

    @ApiOperation({ summary: "Darsni o'chirish (Admin yoki MENTOR)" })
    @Roles(UserRole.ADMIN, UserRole.MENTOR)
    @Delete(':id')
    remove(@Req() req, @Param('id', ParseIntPipe) id: number) {
        return this.lessonsService.remove(id, req.user.id, req.user.role);
    }

    @ApiOperation({ summary: "Darsni ko'rilgan deb belgilash" })
    @Post('view/:id')
    @Roles(UserRole.STUDENT)
    markAsViewed(@Req() req, @Param('id', ParseIntPipe) id: number) {
        return this.lessonsService.markAsViewed(req.user.id, id);
    }
}
