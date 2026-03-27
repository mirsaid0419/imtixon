import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCourseCategoryDto } from './dto/create-course-category.dto';
import { UpdateCourseCategoryDto } from './dto/update-course-category.dto';
import { PrismaService } from 'src/core/database/prisma.service';

@Injectable()
export class CourseCategoryService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createCourseCategoryDto: CreateCourseCategoryDto) {
    const name = createCourseCategoryDto.name.trim().toUpperCase();
    const existCategory = await this.prisma.courseCategory.findUnique({
      where: { name },
    });
    if (existCategory) {
      throw new ConflictException('Category already created');
    }
    return {
      success: true,
      data: await this.prisma.courseCategory.create({
        data: { ...createCourseCategoryDto, name },
      }),
    };
  }

  async findAll(isDeleted: boolean = false) {
    return {
      success: true,
      data: await this.prisma.courseCategory.findMany({ where: { isDeleted } }),
    };
  }

  async findOne(id: number) {
    const existCourseCategory = await this.prisma.courseCategory.findUnique({
      where: { id },
    });
    if (!existCourseCategory) {
      throw new NotFoundException('Category not found');
    }
    return {
      success: true,
      data: existCourseCategory,
    };
  }

  async update(id: number, updateCourseCategoryDto: UpdateCourseCategoryDto) {
    const name = updateCourseCategoryDto.name.trim().toUpperCase();
    const existCourseCategory = await this.prisma.courseCategory.findUnique({
      where: { id },
    });
    if (!existCourseCategory) {
      throw new NotFoundException('Category not found');
    }
    return {
      success: true,
      data: await this.prisma.courseCategory.update({
        where: { id },
        data: { ...updateCourseCategoryDto, name },
      }),
    };
  }

  async remove(id: number) {
    const existCourseCategory = await this.prisma.courseCategory.findUnique({
      where: { id },
    });
    if (!existCourseCategory) {
      throw new NotFoundException('Category not found');
    }
    await this.prisma.courseCategory.update({
        where: { id },
        data: { isDeleted: true },
      })
    return {
      success: true,
      message:"Category success deleted"
    };
  }
}
