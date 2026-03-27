import {
    Injectable,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class ExamResultsService {
    constructor(private readonly prisma: PrismaService) { }

    async getMyResultBySection(userId: number, sectionLessonId: number) {
        const result = await this.prisma.examResult.findFirst({
            where: { userId, sectionLessonId },
            include: { section: true }
        });

        if (!result) throw new NotFoundException('Ushbu bo\'lim bo\'yicha imtihon natijangiz topilmadi');

        return result;
    }

    async findAllBySection(sectionLessonId: number, userId: number, role: UserRole) {
        const section = await this.prisma.sectionLesson.findUnique({
            where: { id: sectionLessonId },
            include: { course: true }
        });

        if (!section) throw new NotFoundException('Bo\'lim topilmadi');

        // Faqat Mentor yoki Admin barcha talabalar natijalarini ko'ra oladi
        if (role !== UserRole.ADMIN && section.course.mentorId !== userId) {
            throw new ForbiddenException("Siz ushbu bo'lim natijalarini ko'ra olmaysiz");
        }

        return await this.prisma.examResult.findMany({
            where: { sectionLessonId },
            include: { user: { select: { fullName: true, phone: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getCourseProgress(userId: number, courseId: number) {
        // Kursga tegishli barcha bo'limlarni olish
        const sections = await this.prisma.sectionLesson.findMany({
            where: { courseId }
        });

        const sectionIds = sections.map(s => s.id);

        // Shu bo'limlar bo'yicha talabaning natijalarini olish
        const results = await this.prisma.examResult.findMany({
            where: { userId, sectionLessonId: { in: sectionIds } },
            include: { section: { select: { name: true } } }
        });

        return {
            totalSections: sections.length,
            completedSections: results.length,
            passedSections: results.filter(r => r.passed).length,
            results,
        };
    }
}
