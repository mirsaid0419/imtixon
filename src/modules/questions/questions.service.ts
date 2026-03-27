import {
    Injectable,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { CreateQuestionDto, CreateAnswerDto } from './dto/question.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class QuestionsService {
    constructor(private readonly prisma: PrismaService) { }

    async createQuestion(userId: number, dto: CreateQuestionDto, fileData?: { url: string; publicId: string }) {
        // Savol berishdan oldin kursga yozilganligini tekshirish (ixtiyoriy, lekin student bo'lsa mantiqan to'g'ri)
        const course = await this.prisma.course.findUnique({ where: { id: dto.courseId } });
        if (!course) throw new NotFoundException('Kurs topilmadi');

        return await this.prisma.question.create({
            data: {
                userId,
                courseId: dto.courseId,
                text: dto.text,
                file: fileData?.url,
                publicId: fileData?.publicId,
            },
        });
    }

    async createAnswer(userId: number, role: UserRole, dto: CreateAnswerDto, fileData?: { url: string; publicId: string }) {
        const question = await this.prisma.question.findUnique({
            where: { id: dto.questionId },
            include: { course: true }
        });

        if (!question) throw new NotFoundException('Savol topilmadi');

        // Savolga javob berish faqat Admin, Mentor (kurs egasi) yoki Assistant uchun
        if (role !== UserRole.ADMIN && role !== UserRole.ASSISTANT && question.course.mentorId !== userId) {
            throw new ForbiddenException("Siz ushbu savolga javob bera olmaysiz");
        }

        // Agar javob allaqachon mavjud bo'lsa - tahrirlash (yoki xatolik)
        return await this.prisma.questionAnswer.upsert({
            where: { questionId: dto.questionId },
            update: {
                text: dto.text,
                file: fileData?.url,
                publicId: fileData?.publicId,
            },
            create: {
                questionId: dto.questionId,
                userId,
                text: dto.text,
                file: fileData?.url,
                publicId: fileData?.publicId,
            },
        });
    }

    async findAllByCourse(courseId: number, userId: number, role: UserRole) {
        // Talaba bo'lsa, kursga yozilganligini tekshirish foydali
        const questions = await this.prisma.question.findMany({
            where: { courseId },
            include: {
                user: { select: { fullName: true, image: true } },
                answer: { include: { user: { select: { fullName: true, role: true } } } }
            },
            orderBy: { createdAt: 'desc' },
        });

        return questions;
    }

    async markAsRead(id: number, userId: number, role: UserRole) {
        const question = await this.prisma.question.findUnique({
            where: { id },
            include: { course: true }
        });

        if (!question) throw new NotFoundException('Savol topilmadi');

        if (role !== UserRole.ADMIN && role !== UserRole.ASSISTANT && question.course.mentorId !== userId) {
            throw new ForbiddenException("Siz ushbu amalni bajara olmaysiz");
        }

        return await this.prisma.question.update({
            where: { id },
            data: {
                read: true,
                readAt: new Date(),
            },
        });
    }
}
