import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';

@Injectable()
export class PurchasedCoursesService {
    constructor(private readonly prisma: PrismaService) { }

    async purchase(userId: number, dto: CreatePurchaseDto) {
        const { courseId, amount, paidVia } = dto;

        // 1. Kursni tekshirish
        const course = await this.prisma.course.findUnique({
            where: { id: courseId },
        });
        if (!course) throw new NotFoundException('Kurs topilmadi');
        if (course.isDeleted) throw new BadRequestException("Ushbu kurs o'chirilgan");
        if (!course.published) throw new BadRequestException('Bu kurs hali sotuvga chiqmagan');

        // 2. Allaqachon sotib olinganligini tekshirish
        const existing = await this.prisma.purchasedCourse.findUnique({
            where: {
                courseId_userId: {
                    courseId,
                    userId,
                },
            },
        });
        if (existing) throw new ConflictException('Bu kursni allaqachon sotib olgansiz');

        // 3. Narxni tekshirish (Ixtiyoriy: agar to'langan summa kurs narxidan kam bo'lsa rad etish)
        if (Number(amount) < Number(course.price)) {
            throw new BadRequestException("To'lov summasi dars narxidan kam bo'lishi mumkin emas");
        }

        // 4. Sotib olishni rasmiylashtirish
        return await this.prisma.$transaction(async (tx) => {
            // a. Xaridni saqlash
            const purchase = await tx.purchasedCourse.create({
                data: {
                    courseId,
                    userId,
                    amount,
                    paidVia,
                },
                include: { course: true },
            });

            // b. Avtomatik ravishda biriktirish (agar AssignedCourse'da bo'lsa ham, bo'lmasa ham access berish)
            const existingAssignment = await tx.assignedCourse.findUnique({
                where: { userId_courseId: { userId, courseId } },
            });

            if (!existingAssignment) {
                await tx.assignedCourse.create({
                    data: { userId, courseId },
                });
            }

            return purchase;
        });
    }

    async getMyPurchases(userId: number) {
        return await this.prisma.purchasedCourse.findMany({
            where: { userId },
            include: {
                course: {
                    include: {
                        category: true,
                        mentor: {
                            select: { id: true, fullName: true, image: true }
                        }
                    }
                },
            },
        });
    }

    async getUserPurchases(userId: number) {
        return await this.prisma.purchasedCourse.findMany({
            where: { userId },
            include: {
                user: { select: { id: true, fullName: true, phone: true } },
                course: true,
            },
            orderBy: { purchasedAt: 'desc' },
        });
    }
}
