import {
    Injectable,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { CreateLessonDto, UpdateLessonDto } from './dto/create-lesson.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class LessonsService {
    constructor(private readonly prisma: PrismaService) { }

    async create(
        currentUserId: number,
        currentUserRole: UserRole,
        dto: CreateLessonDto,
        videoData: { url: string; publicId: string },
    ) {
        // Kursni ayni sectioni ayni mentorga tegishli ekanligini tekshiramiz
        await this.sectionMentorgaTegishlimi(dto.sectionId, currentUserId, currentUserRole);

        return await this.prisma.lesson.create({
            data: {
                name: dto.name,
                about: dto.about,
                sectionId: dto.sectionId,
                video: videoData.url,
                publicId: videoData.publicId,
            },
        });
    }

    async findByCourse(courseId: number, userId: number, role: UserRole) {

        if (role === UserRole.STUDENT) {
            const assignment = await this.prisma.assignedCourse.findUnique({
                where: { userId_courseId: { userId, courseId } }
            });
            if (!assignment) {
                throw new ForbiddenException("Siz ushbu kursga obuna bo'lmagansiz");
            }

            const purchased = await this.prisma.purchasedCourse.findUnique({
                where: { courseId_userId: { courseId, userId } },
            });
            if (!purchased) {
                throw new ForbiddenException("Siz ushbu kursni sotib olmagansiz");
            }
        }

        if (role === UserRole.MENTOR) {
            const course = await this.prisma.course.findUnique({
                where: { id: courseId },
            });
            if (!course) {
                throw new ForbiddenException("Kurs topilmadi");
            }
            if (course.mentorId !== userId) {
                throw new ForbiddenException("Siz ushbu kurs darslarini ko'rish huquqiga ega emassiz");
            }
        }

        const sections = await this.prisma.sectionLesson.findMany({
            where: { courseId },
            include: {
                lessons: {
                    select: {
                        id: true,
                        name: true,
                        about: true,
                        video: true,
                        views: role === UserRole.STUDENT ? {
                            where: { userId },
                            select: { view: true }
                        } : false,
                        _count: { select: { views: true } }
                    },
                    orderBy: { id: 'asc' }
                }
            },
            orderBy: { id: 'asc' }
        });

        return {
            success: true,
            data: sections
        };
    }

    async findOne(id: number, userId: number, role: UserRole) {
        const lesson = await this.prisma.lesson.findUnique({
            where: { id },
            include: {
                section: { include: { course: true } },
                files: true,
                _count: { select: { views: true } }
            },
        });

        if (!lesson) throw new NotFoundException('Dars topilmadi');

        if (role === UserRole.STUDENT) {
            const assignment = await this.prisma.assignedCourse.findUnique({
                where: { userId_courseId: { userId, courseId: lesson.section.courseId } }
            });
            if (!assignment) {
                throw new ForbiddenException("Siz ushbu kurs darslarini ko'rish huquqiga ega emassiz");
            }

            const allCourseLessons = await this.prisma.lesson.findMany({
                where: { section: { courseId: lesson.section.courseId } },
                include: { section: true },
                orderBy: [{ section: { id: 'asc' } }, { id: 'asc' }]
            });

            const currentIndex = allCourseLessons.findIndex(l => l.id === id);

            if (currentIndex > 0) {
                const previousLesson = allCourseLessons[currentIndex - 1];
                const view = await this.prisma.lessonView.findUnique({
                    where: { lessonId_userId: { lessonId: previousLesson.id, userId } }
                });


                if (!view || !view.view) {
                    const lastActivity = await this.prisma.lastActivity.findUnique({
                        where: { userId_courseId: { userId, courseId: lesson.section.courseId } },
                        include: { lesson: true, section: true }
                    });
                    throw new ForbiddenException({
                        message: "Siz darslar ketma-ketligini buzdingiz. Avvalgi darsni ko'rib bo'ling.",
                        lastActivity
                    });
                }
            }

            // Oxirgi faoliyatni yangilash
            await this.prisma.lastActivity.upsert({
                where: { userId_courseId: { userId, courseId: lesson.section.courseId } },
                update: { sectionId: lesson.sectionId, lessonId: id },
                create: { userId, courseId: lesson.section.courseId, sectionId: lesson.sectionId, lessonId: id }
            });
        }

        return lesson;
    }

    async update(
        id: number,
        currentUserId: number,
        currentUserRole: UserRole,
        dto: UpdateLessonDto,
        videoData?: { url: string; publicId: string },
    ) {
        const lesson = await this.prisma.lesson.findUnique({
            where: { id },
            include: { section: true },
        });
        if (!lesson) throw new NotFoundException('Dars topilmadi');

        await this.sectionMentorgaTegishlimi(lesson.sectionId, currentUserId, currentUserRole);

        return await this.prisma.lesson.update({
            where: { id },
            data: {
                name: dto.name ?? lesson.name,
                about: dto.about ?? lesson.about,
                video: videoData?.url ?? lesson.video,
                publicId: videoData?.publicId ?? lesson.publicId,
            },
        });
    }

    async remove(id: number, currentUserId: number, currentUserRole: UserRole) {
        const lesson = await this.prisma.lesson.findUnique({
            where: { id },
            include: { section: true },
        });
        if (!lesson) throw new NotFoundException('Dars topilmadi');

        await this.sectionMentorgaTegishlimi(lesson.sectionId, currentUserId, currentUserRole);

        return await this.prisma.lesson.delete({ where: { id } });
    }

    async markAsViewed(userId: number, lessonId: number) {
        return await this.prisma.lessonView.upsert({
            where: {
                lessonId_userId: {
                    lessonId,
                    userId,
                },
            },
            update: { view: true },
            create: {
                lessonId,
                userId,
                view: true,
            },
        });
    }

    private async sectionMentorgaTegishlimi(sectionId: number, userId: number, role: UserRole) {
        if (role === UserRole.ADMIN) return;

        const section = await this.prisma.sectionLesson.findUnique({
            where: { id: Number(sectionId) },
            include: { course: true },
        });

        if (!section) throw new NotFoundException("Bo'lim topilmadi");

        if (section.course.mentorId !== userId) {
            throw new ForbiddenException("Siz ushbu bo'limga dars qo'sha olmaysiz");
        }
    }
}
