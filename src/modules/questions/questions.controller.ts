import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    UseGuards,
    Req,
    UseInterceptors,
    UploadedFile,
    ParseIntPipe,
} from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto, CreateAnswerDto } from './dto/question.dto';
import { TokenGuard } from 'src/common/guards/token.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role';
import { UserRole } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Questions & Forum (Savol-javoblar)')
@Controller('questions')
@UseGuards(TokenGuard, RoleGuard)
@ApiBearerAuth('token')
export class QuestionsController {
    constructor(
        private readonly questionsService: QuestionsService,
        private readonly cloudinary: CloudinaryService,
    ) { }

    @ApiOperation({ summary: "Talaba tomonidan kurs yuzasidan savol berish" })
    @Roles(UserRole.STUDENT, UserRole.MENTOR, UserRole.ADMIN)
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('file'))
    @Post()
    async createQuestion(
        @Req() req,
        @Body() dto: CreateQuestionDto,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        let fileData;
        if (file) {
            const uploadResult = await this.cloudinary.uploadFile(file, 'forum/questions');
            fileData = { url: uploadResult.url, publicId: uploadResult.publicId };
        }
        return this.questionsService.createQuestion(req.user.id, dto, fileData);
    }

    @ApiOperation({ summary: "Mentor yoki Admin tomonidan savolga javob qaytarish" })
    @Roles(UserRole.ADMIN, UserRole.MENTOR, UserRole.ASSISTANT)
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('file'))
    @Post('answer')
    async createAnswer(
        @Req() req,
        @Body() dto: CreateAnswerDto,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        let fileData;
        if (file) {
            const uploadResult = await this.cloudinary.uploadFile(file, 'forum/answers');
            fileData = { url: uploadResult.url, publicId: uploadResult.publicId };
        }
        return this.questionsService.createAnswer(req.user.id, req.user.role, dto, fileData);
    }

    @ApiOperation({ summary: "Kursga tegishli barcha forumdagi savollarni olish" })
    @Get('course/:courseId')
    @Roles(UserRole.ADMIN, UserRole.MENTOR, UserRole.ASSISTANT, UserRole.STUDENT)
    findAllByCourse(
        @Req() req,
        @Param('courseId', ParseIntPipe) courseId: number,
    ) {
        return this.questionsService.findAllByCourse(courseId, req.user.id, req.user.role);
    }

    @ApiOperation({ summary: "Savolni o'qilgan sifatida belgilash (Admin/Mentor/Assistant)" })
    @Roles(UserRole.ADMIN, UserRole.MENTOR, UserRole.ASSISTANT)
    @Patch('read/:id')
    markAsRead(
        @Req() req,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.questionsService.markAsRead(id, req.user.id, req.user.role);
    }
}
