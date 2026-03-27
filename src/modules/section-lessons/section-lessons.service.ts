import {
    Injectable,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { CreateSectionLessonDto, UpdateSectionLessonDto } from './dto/create-section-lesson.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class SectionLessonsService {
    constructor(private readonly prisma: PrismaService) { }

    async create(userId: number, role: UserRole, dto: CreateSectionLessonDto) {
        const { courseId, name } = dto;

        const course = await this.prisma.course.findUnique({
            where: { id: courseId },
        });
        if (!course) throw new NotFoundException('Kurs topilmadi');

        if (role !== UserRole.ADMIN && course.mentorId !== userId) {
            throw new ForbiddenException("Siz ushbu kursga bo'lim qo'sha olmaysiz");
        }

        return await this.prisma.sectionLesson.create({
            data: {
                name,
                courseId,
            },
        });
    }

    async findAllByCourse(courseId: number, userId: number, role: UserRole) {

        const course = await this.prisma.course.findUnique({
            where: { id: courseId },
        });
        if (!course) throw new NotFoundException('Kurs topilmadi');

        if (role === UserRole.MENTOR && course.mentorId !== userId) {
            throw new ForbiddenException("Siz ushbu kursning mentori emassiz");
        }

        if (role === UserRole.STUDENT) {
            const purchased = await this.prisma.purchasedCourse.findUnique({
                where: { courseId_userId: { courseId, userId } },
            });
            if (!purchased) {
                throw new ForbiddenException("Siz ushbu kursni sotib olmagansiz");
            }
        }

        const sections = await this.prisma.sectionLesson.findMany({
            where: { courseId },
            orderBy: { id: 'asc' },
        });
        return sections;
    }

    async update(id: number, userId: number, role: UserRole, dto: UpdateSectionLessonDto) {
        const section = await this.prisma.sectionLesson.findUnique({
            where: { id },
            include: { course: true },
        });
        if (!section) throw new NotFoundException("Bo'lim topilmadi");

        if (role !== UserRole.ADMIN && section.course.mentorId !== userId) {
            throw new ForbiddenException("Siz ushbu bo'limni o'zgartira olmaysiz");
        }

        return await this.prisma.sectionLesson.update({
            where: { id },
            data: { name: dto.name },
        });
    }

    async remove(id: number, userId: number, role: UserRole) {
        const section = await this.prisma.sectionLesson.findUnique({
            where: { id },
            include: { course: true },
        });
        if (!section) throw new NotFoundException("Bo'lim topilmadi");

        if (role !== UserRole.ADMIN && section.course.mentorId !== userId) {
            throw new ForbiddenException("Siz ushbu bo'limni o'chira olmaysiz");
        }

        return await this.prisma.sectionLesson.delete({ where: { id } });
    }
}
