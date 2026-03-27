import {
    Injectable,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { CreateUserAnswerDto } from './dto/student-answer.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class StudentExamQuestionsService {
    constructor(private readonly prisma: PrismaService) { }

    async submitAnswer(userId: number, dto: CreateUserAnswerDto) {
        // 1. Savolni topish
        const exam = await this.prisma.exam.findUnique({
            where: { id: dto.examId },
            include: { section: { include: { course: true } } }
        });

        if (!exam) throw new NotFoundException('Imtihon savoli topilmadi');

        // 2. Kursga yozilganligini tekshirish
        const assignment = await this.prisma.assignedCourse.findUnique({
            where: { userId_courseId: { userId, courseId: exam.section.courseId } }
        });
        if (!assignment) throw new ForbiddenException("Siz ushbu imtihonni topshira olmaysiz");

        // 3. To'g'riligini tekshirish
        const isCorrect = exam.answer === dto.answer;

        // 4. Javobni saqlash (Upsert: agar oldin topshirgan bo'lsa yangilash)
        const existing = await this.prisma.studentExamQuestion.findFirst({
            where: { userId, examId: dto.examId }
        });

        if (existing) {
            return await this.prisma.studentExamQuestion.update({
                where: { id: existing.id },
                data: {
                    answer: dto.answer,
                    isCorrect,
                },
            });
        }

        return await this.prisma.studentExamQuestion.create({
            data: {
                userId,
                examId: dto.examId,
                answer: dto.answer,
                isCorrect,
                sectionLessonId: dto.sectionLessonId,
            },
        });
    }

    async getAnswersBySection(userId: number, sectionLessonId: number) {
        return await this.prisma.studentExamQuestion.findMany({
            where: { userId, sectionLessonId },
            include: { exam: true },
            orderBy: { createdAt: 'asc' },
        });
    }

    async findAllBySection(sectionLessonId: number, userId: number, role: UserRole) {
        const section = await this.prisma.sectionLesson.findUnique({
            where: { id: sectionLessonId },
            include: { course: true }
        });

        if (!section) throw new NotFoundException('Bo\'lim topilmadi');

        // Faqat Mentor yoki Admin barcha talabalar javoblarini ko'ra oladi
        if (role !== UserRole.ADMIN && section.course.mentorId !== userId) {
            throw new ForbiddenException("Siz ushbu bo'lim javoblarini ko'ra olmaysiz");
        }

        return await this.prisma.studentExamQuestion.findMany({
            where: { sectionLessonId },
            include: { user: { select: { fullName: true } }, exam: true },
            orderBy: { createdAt: 'desc' },
        });
    }
}
