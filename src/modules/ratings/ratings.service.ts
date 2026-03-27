import {
    Injectable,
    NotFoundException,
    ConflictException,
    ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { CreateRatingDto, UpdateRatingDto } from './dto/create-rating.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class RatingsService {
    constructor(private readonly prisma: PrismaService) { }

    async create(userId: number, dto: CreateRatingDto) {
        const { courseId, rate, comment } = dto;

        // 1. Kursni tekshirish
        const course = await this.prisma.course.findUnique({
            where: { id: courseId },
        });
        if (!course) throw new NotFoundException('Kurs topilmadi');

        // 2. Bir marta reyting qoldirganligini tekshirish
        const existing = await this.prisma.rating.findUnique({
            where: {
                courseId_userId: {
                    courseId,
                    userId,
                },
            },
        });
        if (existing) throw new ConflictException('Siz ushbu kursga allaqachon reyting qoldirgansiz');

        // 3. Ixtiyoriy: Kursga yozilganligini tekshirish (faqat kursni olganlar reyting qoldira oladi)
        const isEnrolled = await this.prisma.assignedCourse.findUnique({
            where: { userId_courseId: { userId, courseId } },
        });

        // Yoki sotib olganligini tekshirish
        const isPurchased = await this.prisma.purchasedCourse.findUnique({
            where: { courseId_userId: { courseId, userId } }
        });

        if (!isEnrolled && !isPurchased) {
            throw new ForbiddenException("Faqat ushbu kurs talabalari reyting qoldirishi mumkin");
        }

        return await this.prisma.rating.create({
            data: {
                courseId,
                userId,
                rate,
                comment,
            },
            include: {
                user: {
                    select: { fullName: true, image: true }
                }
            }
        });
    }

    async update(courseId: number, userId: number, dto: UpdateRatingDto) {
        const rating = await this.prisma.rating.findUnique({
            where: { courseId_userId: { courseId, userId } },
        });
        if (!rating) throw new NotFoundException('Siz ushbu kursga reyting qoldirmagansiz');

        return await this.prisma.rating.update({
            where: { courseId_userId: { courseId, userId } },
            data: {
                rate: dto.rate ?? rating.rate,
                comment: dto.comment ?? rating.comment,
            },
        });
    }

    async removeByStudent(courseId: number, userId: number) {
        const rating = await this.prisma.rating.findUnique({
            where: { courseId_userId: { courseId, userId } },
        });
        if (!rating) throw new NotFoundException('Siz ushbu kursga reyting qoldirmagansiz');

        return await this.prisma.rating.delete({
            where: { courseId_userId: { courseId, userId } },
        });
    }

    async removeByAdmin(userId: number, courseId: number) {
        const rating = await this.prisma.rating.findUnique({
            where: { courseId_userId: { courseId, userId } },
        });
        if (!rating) throw new NotFoundException('Ushbu talaba mazkur kursga reyting qoldirmagan');

        return await this.prisma.rating.delete({
            where: { courseId_userId: { courseId, userId } },
        });
    }

    async getCourseRatings(courseId: number) {
        const ratings = await this.prisma.rating.findMany({
            where: { courseId },
            include: {
                user: {
                    select: { fullName: true, image: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        const averageRate = ratings.length > 0
            ? ratings.reduce((sum, r) => sum + r.rate, 0) / ratings.length
            : 0;

        return {
            ratings,
            averageRate: Number(averageRate.toFixed(1)),
            totalCount: ratings.length,
        };
    }

    async getStudentCourseRating(userId: number, courseId: number) {
        const rating = await this.prisma.rating.findUnique({
            where: {
                courseId_userId: {
                    courseId,
                    userId,
                },
            },
            include: {
                course: {
                    select: { id: true, name: true, banner: true }
                }
            },
        });

        if (!rating) throw new NotFoundException('Siz mazkur kursga reyting qoldirmagansiz');
        return rating;
    }

    async getStudentRatings(userId: number) {
        return await this.prisma.rating.findMany({
            where: { userId },
            include: {
                course: {
                    select: { id: true, name: true, banner: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
}
