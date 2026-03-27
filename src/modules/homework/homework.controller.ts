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
import { HomeworkService } from './homework.service';
import { CreateHomeworkDto, UpdateHomeworkDto } from './dto/homework.dto';
import { TokenGuard } from 'src/common/guards/token.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role';
import { UserRole } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Homework (Vazifalar)')
@Controller('homework')
@UseGuards(TokenGuard, RoleGuard)
@ApiBearerAuth('token')
export class HomeworkController {
    constructor(
        private readonly homeworkService: HomeworkService,
        private readonly cloudinary: CloudinaryService,
    ) { }

    @ApiOperation({ summary: "Dars uchun yangi vazifa yaratish (Admin yoki kurs mentori)" })
    @Roles(UserRole.ADMIN, UserRole.MENTOR)
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('file'))
    @Post()
    async create(
        @Req() req,
        @Body() dto: CreateHomeworkDto,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        let fileData;
        if (file) {
            const uploadResult = await this.cloudinary.uploadFile(file, 'homework/tasks');
            fileData = { url: uploadResult.url, publicId: uploadResult.publicId };
        }
        return this.homeworkService.createHomework(req.user.id, req.user.role, dto, fileData);
    }

    @ApiOperation({ summary: "Vazifani tahrirlash (Admin yoki kurs mentori)" })
    @Roles(UserRole.ADMIN, UserRole.MENTOR)
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('file'))
    @Patch(':id')
    async update(
        @Req() req,
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateHomeworkDto,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        let fileData;
        if (file) {
            const uploadResult = await this.cloudinary.uploadFile(file, 'homework/tasks');
            fileData = { url: uploadResult.url, publicId: uploadResult.publicId };
        }
        return this.homeworkService.updateHomework(id, req.user.id, req.user.role, dto, fileData);
    }

    @ApiOperation({ summary: "Vazifani o'chirish (Admin yoki kurs mentori)" })
    @Roles(UserRole.ADMIN, UserRole.MENTOR)
    @Delete(':id')
    remove(@Req() req, @Param('id', ParseIntPipe) id: number) {
        return this.homeworkService.removeHomework(id, req.user.id, req.user.role);
    }

    @ApiOperation({ summary: "Darsga tegishli vazifani ko'rish(sotib olgan talaba, admin yoki kurs mentori)" })
    @Get('lesson/:lessonId')
    @Roles(UserRole.ADMIN, UserRole.MENTOR, UserRole.STUDENT)
    findByLesson(@Req() req, @Param('lessonId', ParseIntPipe) lessonId: number) {
        return this.homeworkService.findHomeworkByLesson(lessonId, req.user.id, req.user.role);
    }
}
