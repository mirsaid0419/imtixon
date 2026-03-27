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
import { HomeworkSubmissionsService } from './homework-submissions.service';
import { CreateSubmissionDto, ReviewSubmissionDto } from './dto/submission.dto';
import { TokenGuard } from 'src/common/guards/token.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role';
import { UserRole } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Homework Submissions (Talaba topshiriqlari)')
@Controller('homework-submissions')
@UseGuards(TokenGuard, RoleGuard)
@ApiBearerAuth('token')
export class HomeworkSubmissionsController {
    constructor(
        private readonly submissionsService: HomeworkSubmissionsService,
        private readonly cloudinary: CloudinaryService,
    ) { }

    @ApiOperation({ summary: "Talaba tomonidan bajarilgan vazifani topshirish (STUDENT)" })
    @Roles(UserRole.STUDENT)
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('file'))
    @Post('submit')
    async submit(
        @Req() req,
        @Body() dto: CreateSubmissionDto,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        let fileData;
        if (file) {
            // Faylni Cloudinary'ga yuklash
            const uploadResult = await this.cloudinary.uploadFile(file, 'homework/submissions');
            fileData = { url: uploadResult.url, publicId: uploadResult.publicId };
        }
        return this.submissionsService.submit(req.user.id, dto, fileData);
    }

    @ApiOperation({ summary: "Topshirilgan vazifani baholash va izoh qoldirish (Admin yoki MENTOR)" })
    @Roles(UserRole.ADMIN, UserRole.MENTOR, UserRole.ASSISTANT)
    @Patch('review/:id')
    review(
        @Req() req,
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: ReviewSubmissionDto,
    ) {
        return this.submissionsService.review(id, req.user.id, req.user.role, dto);
    }

    @ApiOperation({ summary: "Talaba o'zining berilgan homework uchun yuborgan javobini ko'rishi" })
    @Get('my/:homeworkId')
    @Roles(UserRole.STUDENT)
    findMySubmissions(
        @Req() req,
        @Param('homeworkId', ParseIntPipe) homeworkId: number,
    ) {
        return this.submissionsService.findMySubmissions(req.user.id, homeworkId);
    }

    @ApiOperation({ summary: "Mentor barcha talabalar topshiriqlarini (javoblarini) ko'rishi" })
    @Get('all/:homeworkId')
    @Roles(UserRole.ADMIN, UserRole.MENTOR)
    findAllSubmissions(
        @Req() req,
        @Param('homeworkId', ParseIntPipe) homeworkId: number,
    ) {
        return this.submissionsService.findAllSubmissions(req.user.id, req.user.role, homeworkId);
    }
}
