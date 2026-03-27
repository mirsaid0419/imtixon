import {
    Injectable,
    NotFoundException,
    ConflictException,
    ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { AssignCourseDto } from './dto/assign-course.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class AssignedCoursesService {
    constructor(private readonly prisma: PrismaService) { }

    async assign(userId: number, dto: AssignCourseDto) {
        const { courseId } = dto;

        // 1. Kurs mavjudligini tekshirish
        const course = await this.prisma.course.findUnique({
            where: { id: courseId },
        });

        if (!course) {
            throw new NotFoundException(`ID: ${courseId} bo'lgan kurs topilmadi`);
        }

        if (course.isDeleted) {
            throw new NotFoundException(`ID: ${courseId} bo'lgan kurs o'chirilgan`);
        }

        // 2. Takroriy biriktirishni tekshirish
        const existing = await this.prisma.assignedCourse.findUnique({
            where: {
                userId_courseId: {
                    userId,
                    courseId,
                },
            },
        });

        if (existing) {
            throw new ConflictException('Ushbu kurs foydalanuvchiga allaqachon biriktirilgan');
        }
        return await this.prisma.assignedCourse.create({
            data: {
                userId,
                courseId,
            },
            include: {
                course: true,
            },
        });
    }

    async unassign(userId: number, courseId: number, currentUserRole: UserRole, currentUserId: number) {
        const assignment = await this.prisma.assignedCourse.findUnique({
            where: {
                userId_courseId: {
                    userId,
                    courseId,
                },
            },
        });

        if (!assignment) {
            throw new NotFoundException('Ushbu biriktirish topilmadi');
        }

        if (currentUserRole !== UserRole.ADMIN && assignment.userId !== currentUserId) {
            throw new ForbiddenException("Sizda ushbu amalni bajarish uchun ruxsat yo'q");
        }

        return await this.prisma.assignedCourse.delete({
            where: {
                userId_courseId: {
                    userId,
                    courseId,
                },
            },
        });
    }

    async getMyAssignments(userId: number) {
        return await this.prisma.assignedCourse.findMany({
            where: { userId },
            include: {
                course: {
                    include: {
                        category: true,
                        mentor: {
                            select: {
                                id: true,
                                fullName: true,
                                image: true
                            }
                        }
                    }
                },
            },
        });
    }

    async getUserAssignments(userId: number) {
        return await this.prisma.assignedCourse.findMany({
            where: { userId },
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        phone: true
                    }
                },
                course: true,
            },
        });
    }
}
