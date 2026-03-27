import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCourseDto, FindAllCourseDto } from './dto/create-course.dto';
import {
  UpdateCourseByAdminDto,
  UpdateCourseByAuthorDto,
} from './dto/update-course.dto';
import { PrismaService } from 'src/core/database/prisma.service';

interface Files {
  bannerUrl?: string | null;
  bannerPublicId?: string | null;
  introVideo?: string | null;
  videoPublicId?: string | null;
}
@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) { }

  async create(mentorId: number, payload: CreateCourseDto, files: Files) {
    return {
      success: true,
      data: await this.prisma.course.create({
        data: {
          ...payload,
          mentorId,
          banner: files.bannerUrl ?? null,
          bannerPublicId: files.bannerPublicId ?? null,
          introVideo: files.introVideo ?? null,
          videoPublicId: files.videoPublicId ?? null,
        },
      }),
    };
  }

  async findAll(isDeleted: boolean, published?: boolean) {
    return {
      success: true,
      data: await this.prisma.course.findMany({
        where: {
          isDeleted,
          ...(published !== undefined ? { published } : {}),
        },
      }),
    };
  }

  async findOne(id: number) {
    const existCourse = await this.prisma.course.findUnique({
      where: { id },
    });
    if (!existCourse) {
      throw new NotFoundException('Course not found');
    }
    return {
      success: true,
      data: existCourse,
    };
  }

  async updateCourseByAdmin(
    id: number,
    updateCourseDto: UpdateCourseByAdminDto,
    files: Files,
  ) {
    const existCourse = await this.prisma.course.findUnique({
      where: { id },
    });
    if (!existCourse) {
      throw new NotFoundException('Course not found');
    }
    const { banner, introVideo, ...updateData } = updateCourseDto;

    return {
      success: true,
      data: await this.prisma.course.update({
        where: { id },
        data: {
          ...updateData,
          banner: files.bannerUrl ?? existCourse.banner,
          bannerPublicId: files.bannerPublicId ?? existCourse.bannerPublicId,
          introVideo: files.introVideo ?? existCourse.introVideo,
          videoPublicId: files.videoPublicId ?? existCourse.videoPublicId,
        },
      }),
    };
  }

  // async updateCourseByAuthor(
  //   mentorId: number,
  //   id: number,
  //   payload: UpdateCourseByAuthorDto,
  //   files: Files,
  // ) {
  //   const existCourse = await this.prisma.course.findUnique({
  //     where: { id },
  //   });
  //   if (!existCourse) {
  //     throw new NotFoundException('Course not found');
  //   }
  //   const { banner, introVideo, ...updateData } = payload;

  //   return {
  //     success: true,
  //     data: await this.prisma.course.update({
  //       where: { id },
  //       data: {
  //         ...updateData,
  //         mentorId,
  //         banner: files.bannerUrl ?? existCourse.banner,
  //         bannerPublicId: files.bannerPublicId ?? existCourse.bannerPublicId,
  //         introVideo: files.introVideo ?? existCourse.introVideo,
  //         videoPublicId: files.videoPublicId ?? existCourse.videoPublicId,
  //       },
  //     }),
  //   };
  // }
  
  async remove(id: number) {
    const existCourse = await this.prisma.course.findUnique({
      where: { id },
    });
    if (!existCourse) {
      throw new NotFoundException('Course not found');
    }
    await this.prisma.course.update({
      where: { id },
      data: { isDeleted: true },
    });
    return { success: true, message: 'Course success deleted' };
  }

  async publishedUpdate(id: number) {
    const existCourse = await this.prisma.course.findUnique({
      where: { id },
    });
    if (!existCourse) {
      throw new NotFoundException('Course not found');
    }
    await this.prisma.course.update({
      where: { id },
      data: { published: true },
    });
    return { success: true, message: 'Course is ready for purchasing' };
  }
}
