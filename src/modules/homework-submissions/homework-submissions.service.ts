import {
    Injectable,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { CreateSubmissionDto, ReviewSubmissionDto } from './dto/submission.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class HomeworkSubmissionsService {
    constructor(private readonly prisma: PrismaService) { }

    async submit(userId: number, dto: CreateSubmissionDto, fileData?: { url: string; publicId: string }) {
        const homework = await this.prisma.homework.findUnique({
            where: { id: dto.homeworkId },
            include: { lesson: { include: { section: true } } }
        });

        if (!homework) throw new NotFoundException('Vazifa topilmadi');

        const assignment = await this.prisma.assignedCourse.findUnique({
            where: { userId_courseId: { userId, courseId: homework.lesson.section.courseId } }
        });
        if (!assignment) throw new ForbiddenException("Ushbu kurs uchun vazifa topshira olmaysiz");

        const viewed = await this.prisma.lessonView.findUnique({
            where: { lessonId_userId: { lessonId: homework.lessonId, userId } }
        });
        if (!viewed || !viewed.view) {
            throw new ForbiddenException("Vazifa topshirish uchun avval darsni ko'rib bo'ling");
        }

        return await this.prisma.homeworkSubmission.create({
            data: {
                homeworkId: dto.homeworkId,
                userId,
                text: dto.text,
                file: fileData?.url,
                publicId: fileData?.publicId,
            },
        });
    }

    async review(id: number, userId: number, role: UserRole, dto: ReviewSubmissionDto) {
        const submission = await this.prisma.homeworkSubmission.findUnique({
            where: { id },
            include: { homework: { include: { lesson: { include: { section: { include: { course: true } } } } } } }
        });

        if (!submission) throw new NotFoundException('Topshiriq topilmadi');

        const mentorId = submission.homework.lesson.section.course.mentorId;
        if (role !== UserRole.ADMIN && mentorId !== userId) {
            throw new ForbiddenException("Siz ushbu topshiriqni baholay olmaysiz");
        }

        return await this.prisma.homeworkSubmission.update({
            where: { id },
            data: {
                status: dto.status,
                reason: dto.reason,
            },
        });
    }

    async findMySubmissions(userId: number, homeworkId: number) {
        return await this.prisma.homeworkSubmission.findMany({
            where: { userId, homeworkId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findAllSubmissions(userId: number, role: UserRole, homeworkId: number) {
        const homework = await this.prisma.homework.findUnique({
            where: { id: homeworkId },
            include: { lesson: { include: { section: { include: { course: true } } } } }
        });
        if (!homework) throw new NotFoundException('Vazifa topilmadi');

        if (role !== UserRole.ADMIN && homework.lesson.section.course.mentorId !== userId) {
            throw new ForbiddenException("Faqat mentor yoki admin barcha topshiriqlarni ko'ra oladi");
        }

        return await this.prisma.homeworkSubmission.findMany({
            where: { homeworkId },
            include: { user: { select: { fullName: true, phone: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
}
