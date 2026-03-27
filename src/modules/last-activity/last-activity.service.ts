import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { UpdateLastActivityDto } from './dto/last-activity.dto';

@Injectable()
export class LastActivityService {
  constructor(private readonly prisma: PrismaService) {}

  async updateActivity(userId: number, dto: UpdateLastActivityDto) {
    return await this.prisma.lastActivity.upsert({
      where: {
        userId_courseId: {
          userId,
          courseId: dto.courseId!,
        },
      },
      update: {
        sectionId: dto.sectionId,
        lessonId: dto.lessonId,
        url: dto.url,
      },
      create: {
        userId,
        courseId: dto.courseId!,
        sectionId: dto.sectionId!,
        lessonId: dto.lessonId,
        url: dto.url,
      },
    });
  }

  async getLastActivity(userId: number, courseId: number) {
    return await this.prisma.lastActivity.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      include: {
        course: { select: { name: true } },
        section: { select: { name: true } },
        lesson: { select: { name: true } },
      },
    });
  }
}
