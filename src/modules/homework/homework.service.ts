import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { CreateHomeworkDto, UpdateHomeworkDto } from './dto/homework.dto';
import { UserRole } from '@prisma/client';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class HomeworkService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly cloudinary: CloudinaryService,
    ) { }

    // --- HOMEWORK (Dars vazifasi) ---

    async createHomework(userId: number, role: UserRole, dto: CreateHomeworkDto, fileData?: { url: string; publicId: string }) {
        const lesson = await this.prisma.lesson.findUnique({
            where: { id: dto.lessonId },
            include: { section: { include: { course: true } }, homework: true }
        });

        if (!lesson) throw new NotFoundException('Dars topilmadi');
        if (lesson.homework) throw new ConflictException('Ushbu dars uchun vazifa allaqachon yaratilgan');

        // Faqat Admin yoki Kurs mentori vazifa qo'sha oladi
        if (role !== UserRole.ADMIN && lesson.section.course.mentorId !== userId) {
            throw new ForbiddenException("Siz ushbu darsga vazifa qo'sha olmaysiz");
        }

        return await this.prisma.homework.create({
            data: {
                task: dto.task,
                lessonId: dto.lessonId,
                file: fileData?.url,
                publicId: fileData?.publicId,
            },
        });
    }

    async updateHomework(id: number, userId: number, role: UserRole, dto: UpdateHomeworkDto, fileData?: { url: string; publicId: string }) {
        const homework = await this.prisma.homework.findUnique({
            where: { id },
            include: { lesson: { include: { section: { include: { course: true } } } } }
        });

        if (!homework) throw new NotFoundException('Vazifa topilmadi');

        if (role !== UserRole.ADMIN && homework.lesson.section.course.mentorId !== userId) {
            throw new ForbiddenException("Siz ushbu vazifani o'zgartira olmaysiz");
        }

        const data: any = {};
        if (dto.task && dto.task.trim() !== '') data.task = dto.task;

        if (fileData) {
            if (homework.publicId) await this.cloudinary.deleteFile(homework.publicId);
            data.file = fileData.url;
            data.publicId = fileData.publicId;
        }

        return await this.prisma.homework.update({
            where: { id },
            data,
        });
    }

    async removeHomework(id: number, userId: number, role: UserRole) {
        const homework = await this.prisma.homework.findUnique({
            where: { id },
            include: { lesson: { include: { section: { include: { course: true } } } } }
        });

        if (!homework) throw new NotFoundException('Vazifa topilmadi');

        if (role !== UserRole.ADMIN && homework.lesson.section.course.mentorId !== userId) {
            throw new ForbiddenException("Siz ushbu vazifani o'chira olmaysiz");
        }

        if (homework.publicId) await this.cloudinary.deleteFile(homework.publicId);

        return await this.prisma.homework.delete({ where: { id } });
    }

    async findHomeworkByLesson(lessonId: number) {
        const homework = await this.prisma.homework.findUnique({
            where: { lessonId },
        });
        if (!homework) throw new NotFoundException("Dars uchun vazifa topilmadi");
        return homework;
    }
}
