import {
    Injectable,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { CreateLessonFileDto, UpdateLessonFileDto } from './dto/create-lesson-file.dto';
import { UserRole } from '@prisma/client';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class LessonFilesService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly cloudinary: CloudinaryService,
    ) { }

    async create(
        userId: number,
        role: UserRole,
        dto: CreateLessonFileDto,
        fileData: { url: string; publicId: string },
    ) {
        const lesson = await this.prisma.lesson.findUnique({
            where: { id: dto.lessonId },
            include: { section: { include: { course: true } } }
        });

        if (!lesson) throw new NotFoundException('Dars topilmadi');

        if (role !== UserRole.ADMIN && lesson.section.course.mentorId !== userId) {
            throw new ForbiddenException("Siz ushbu darsga fayl ilova qila olmaysiz");
        }

        return await this.prisma.lessonFile.create({
            data: {
                file: fileData.url,
                publicId: fileData.publicId,
                note: dto.note,
                lessonId: dto.lessonId,
            },
        });
    }

    async remove(id: number, userId: number, role: UserRole) {
        const lessonFile = await this.prisma.lessonFile.findUnique({
            where: { id },
            include: { lesson: { include: { section: { include: { course: true } } } } }
        });

        if (!lessonFile) throw new NotFoundException('Fayl topilmadi');

        if (role !== UserRole.ADMIN && lessonFile.lesson.section.course.mentorId !== userId) {
            throw new ForbiddenException("Siz ushbu faylni o'chira olmaysiz");
        }

        return await this.prisma.lessonFile.delete({ where: { id } });
    }

    async update(
        id: number,
        userId: number,
        role: UserRole,
        dto: UpdateLessonFileDto,
        fileData?: { url: string; publicId: string },
    ) {
        const lessonFile = await this.prisma.lessonFile.findUnique({
            where: { id },
            include: { lesson: { include: { section: { include: { course: true } } } } }
        });

        if (!lessonFile) throw new NotFoundException('Fayl topilmadi');

        if (role !== UserRole.ADMIN && lessonFile.lesson.section.course.mentorId !== userId) {
            throw new ForbiddenException("Siz ushbu faylni o'zgartira olmaysiz");
        }

        const data: any = {};

        if (fileData) {
            if (lessonFile.publicId) {
                await this.cloudinary.deleteFile(lessonFile.publicId);
            }
            data.file = fileData.url;
            data.publicId = fileData.publicId;
        }

        if (dto.note && dto.note.trim() !== '') {
            data.note = dto.note;
        }

        return await this.prisma.lessonFile.update({
            where: { id },
            data,
        });
    }

    async findAllByLesson(lessonId: number, userId: number, role: UserRole) {
        const lesson = await this.prisma.lesson.findUnique({
            where: { id: lessonId },
            include: { section: { include: { course: true } } }
        });

        if (!lesson) throw new NotFoundException('Dars topilmadi');

        if (role === UserRole.MENTOR && lesson.section.course.mentorId !== userId) {
            throw new ForbiddenException("Siz ushbu darsning mentori emassiz");
        }

        if (role === UserRole.STUDENT) {
            const assignment = await this.prisma.assignedCourse.findUnique({
                where: { userId_courseId: { userId, courseId: lesson.section.courseId } }
            });
            if (!assignment) {
                throw new ForbiddenException("Fayllarni ko'rish uchun avval kursga ruxsat olishingiz kerak");
            }
        }

        return await this.prisma.lessonFile.findMany({
            where: { lessonId },
            orderBy: { createdAt: 'desc' },
        });
    }
}
