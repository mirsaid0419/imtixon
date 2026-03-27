import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    UseGuards,
    Req,
    UseInterceptors,
    UploadedFile,
    ParseIntPipe,
    Patch,
} from '@nestjs/common';
import { LessonFilesService } from './lesson-files.service';
import { CreateLessonFileDto, UpdateLessonFileDto } from './dto/create-lesson-file.dto';
import { TokenGuard } from 'src/common/guards/token.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role';
import { UserRole } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Lesson Files (Darsga tegishli ilova fayllar)')
@Controller('lesson-files')
@UseGuards(TokenGuard, RoleGuard)
@ApiBearerAuth('token')
export class LessonFilesController {
    constructor(
        private readonly lessonFilesService: LessonFilesService,
        private readonly cloudinary: CloudinaryService,
    ) { }

    @ApiOperation({ summary: "Darsga yangi fayl ilova qilish (Admin yoki MENTOR)" })
    @Roles(UserRole.ADMIN, UserRole.MENTOR)
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('file'))
    @Post()
    async create(
        @Req() req,
        @Body() dto: CreateLessonFileDto,
        @UploadedFile() file: Express.Multer.File,
    ) {
        // Faylni Cloudinary'ga yuklash
        const uploadResult = await this.cloudinary.uploadFile(file, 'lessons/files');
        return this.lessonFilesService.create(req.user.id, req.user.role, dto, {
            url: uploadResult.url,
            publicId: uploadResult.publicId,
        });
    }

    @ApiOperation({ summary: "Darsga tegishli barcha fayllarni olish" })
    @Get('lesson/:lessonId')
    @Roles(UserRole.ADMIN, UserRole.MENTOR, UserRole.STUDENT)
    findAllByLesson(
        @Req() req,
        @Param('lessonId', ParseIntPipe) lessonId: number,
    ) {
        return this.lessonFilesService.findAllByLesson(lessonId, req.user.id, req.user.role);
    }

    @ApiOperation({ summary: "Dars faylini yangilash (Admin yoki MENTOR)" })
    @Roles(UserRole.ADMIN, UserRole.MENTOR)
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('file'))
    @Patch(':id')
    async update(
        @Req() req,
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateLessonFileDto,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        let fileData;
        if (file) {
            const uploadResult = await this.cloudinary.uploadFile(file, 'lessons/files');
            fileData = { url: uploadResult.url, publicId: uploadResult.publicId };
        }
        return this.lessonFilesService.update(id, req.user.id, req.user.role, dto, fileData);
    }

    @ApiOperation({ summary: "Faylni ilovadan o'chirib tashlash (Admin yoki MENTOR)" })
    @Roles(UserRole.ADMIN, UserRole.MENTOR)
    @Delete(':id')
    remove(
        @Req() req,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.lessonFilesService.remove(id, req.user.id, req.user.role);
    }
}
