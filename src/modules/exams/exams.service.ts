import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { CreateExamDto, UpdateExamDto, SubmitExamDto } from './dto/exam.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class ExamsService {
    constructor(private readonly prisma: PrismaService) { }

    async create(userId: number, role: UserRole, dto: CreateExamDto) {
        // Bo'lim (SectionLesson) orqali kursning mentorini tekshirish
        await this.validateSectionOwnership(dto.sectionLessonId, userId, role);

        return await this.prisma.exam.create({
            data: dto,
        });
    }

    async update(id: number, userId: number, role: UserRole, dto: UpdateExamDto) {
        const exam = await this.prisma.exam.findUnique({
            where: { id },
            include: { section: { include: { course: true } } }
        });

        if (!exam) throw new NotFoundException('Savol topilmadi');

        if (role !== UserRole.ADMIN && exam.section.course.mentorId !== userId) {
            throw new ForbiddenException("Siz ushbu savolni o'zgartira olmaysiz");
        }

        return await this.prisma.exam.update({
            where: { id },
            data: dto,
        });
    }

    async remove(id: number, userId: number, role: UserRole) {
        const exam = await this.prisma.exam.findUnique({
            where: { id },
            include: { section: { include: { course: true } } }
        });

        if (!exam) throw new NotFoundException('Savol topilmadi');

        if (role !== UserRole.ADMIN && exam.section.course.mentorId !== userId) {
            throw new ForbiddenException("Siz ushbu savolni o'chira olmaysiz");
        }

        return await this.prisma.exam.delete({ where: { id } });
    }

    async findAllBySection(sectionId: number, userId: number, role: UserRole) {
        const section = await this.prisma.sectionLesson.findUnique({
            where: { id: sectionId },
            include: { course: true }
        });

        if (!section) throw new NotFoundException('Bo\'lim topilmadi');

        // Talaba bo'lsa, kursga yozilganligini tekshirish
        if (role === UserRole.STUDENT) {
            const assignment = await this.prisma.assignedCourse.findUnique({
                where: { userId_courseId: { userId, courseId: section.courseId } }
            });
            if (!assignment) {
                throw new ForbiddenException("Imtihonlarni ko'rish uchun avval kursga ruxsat olishingiz kerak");
            }
        }

        const exams = await this.prisma.exam.findMany({
            where: { sectionLessonId: sectionId },
            orderBy: { createdAt: 'asc' },
        });

        // Agar talaba bo'lsa, to'g'ri javoblarni yashirish
        if (role === UserRole.STUDENT) {
            return exams.map(exam => {
                const { answer, ...rest } = exam;
                return rest;
            });
        }

        return exams;
    }

    async submitExam(userId: number, dto: SubmitExamDto) {
        const section = await this.prisma.sectionLesson.findUnique({
            where: { id: dto.sectionLessonId },
            include: { course: true, exams: true }
        });

        if (!section) throw new NotFoundException('Bo\'lim topilmadi');

        const assignment = await this.prisma.assignedCourse.findUnique({
            where: { userId_courseId: { userId, courseId: section.courseId } }
        });
        if (!assignment) throw new ForbiddenException("Ushbu imtihonni topshirish huquqiga ega emassiz");

        if (section.exams.length === 0) {
            throw new BadRequestException("Ushbu bo'limda hali imtihon savollari mavjud emas");
        }

        let corrects = 0;
        let wrongs = 0;

        const results = dto.answers.map(ans => {
            const examQuestion = section.exams.find(ex => ex.id === ans.examId);
            if (!examQuestion) throw new BadRequestException(`Savol topilmadi: ${ans.examId}`);

            const isCorrect = examQuestion.answer === ans.answer;
            if (isCorrect) corrects++;
            else wrongs++;

            return {
                userId,
                examId: ans.examId,
                answer: ans.answer,
                isCorrect,
                sectionLessonId: dto.sectionLessonId,
            };
        });

        // Barcha savollar topshirilganmi yoki yo'q - odatda hammasi shart deb hisoblaymiz yoki faqat yuborilganlarini baholaymiz.
        // MD bo'yicha imtihon natijasini saqlash:
        const totalQuestions = section.exams.length;
        const passed = (corrects / totalQuestions) * 100 >= 70; // 70% o'tish balli

        // 1. Javoblarni saqlash (Topshiriq-savollar bo'yicha)
        await this.prisma.studentExamQuestion.deleteMany({
            where: { userId, sectionLessonId: dto.sectionLessonId }
        });
        await this.prisma.studentExamQuestion.createMany({
            data: results,
        });

        // 2. Umumlashgan natijani saqlash
        return await this.prisma.examResult.upsert({
            where: {
                // Bizda resultda unique key yo'q, lekin biz shuni qo'shishimiz yoki id orqali yangilashimiz mumkin.
                // Hozircha oddiy create yoki maxsus check qilamiz:
                id: (await this.prisma.examResult.findFirst({
                    where: { userId, sectionLessonId: dto.sectionLessonId }
                }))?.id || 0,
            },
            update: { passed, corrects, wrongs },
            create: { userId, sectionLessonId: dto.sectionLessonId, passed, corrects, wrongs }
        });
    }

    async getResult(userId: number, sectionLessonId: number) {
        return await this.prisma.examResult.findFirst({
            where: { userId, sectionLessonId },
            include: { section: true }
        });
    }

    private async validateSectionOwnership(sectionId: number, userId: number, role: UserRole) {
        if (role === UserRole.ADMIN) return;
        const section = await this.prisma.sectionLesson.findUnique({
            where: { id: sectionId },
            include: { course: true }
        });
        if (!section) throw new NotFoundException('Bo\'lim topilmadi');
        if (section.course.mentorId !== userId) {
            throw new ForbiddenException("Siz ushbu bo'limga imtihon qo'sha olmaysiz");
        }
    }
}
