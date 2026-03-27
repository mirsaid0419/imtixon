import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMentorProfileDto } from './dto/create-mentor-profile.dto';
import { UpdateMentorProfileDto } from './dto/update-mentor-profile.dto';
import { PrismaService } from 'src/core/database/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class MentorProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, dto: CreateMentorProfileDto) {
    const existingProfile = await this.prisma.mentorProfile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      throw new ConflictException('Sizda allaqachon mentor profili mavjud');
    }

    return {
      success: true,
      data: await this.prisma.mentorProfile.create({
        data: {
          ...dto,
          userId: userId,
        },
      }),
    };
  }

  async findAll(isDeleted: boolean) {
    return {
      success: true,
      data: await this.prisma.mentorProfile.findMany({
        where: { user: { isDeleted } },
      }),
    };
  }

  // async findOne(userId: number) {
  //   const existProfile = await this.prisma.mentorProfile.findFirst({
  //     where: { userId },
  //   });
  //   if (!existProfile) {
  //     throw new NotFoundException('Profile not found');
  //   }
  //   return {
  //     success: true,
  //     data: await this.prisma.mentorProfile.findFirst({ where: { userId } }),
  //   };
  // }

  async findOneByUserId(userId: number) {
    const existProfile = await this.prisma.mentorProfile.findFirst({
      where: { userId },
    });
    if (!existProfile) {
      throw new NotFoundException('Profile not found');
    }
    return {
      success: true,
      data: await this.prisma.mentorProfile.findFirst({ where: { userId } }),
    };
  }

  async update(userId: number, updateMentorProfileDto: UpdateMentorProfileDto) {
    const existProfile = await this.prisma.mentorProfile.findFirst({
      where: { userId: userId },
    });
    if (!existProfile) {
      throw new NotFoundException('Profile not found');
    }
    return {
      success: true,
      data: await this.prisma.mentorProfile.update({
        where: { userId: userId },
        data: updateMentorProfileDto,
      }),
    };
  }

  async softDelete(userId: number) {
    const User = await this.prisma.mentorProfile.findUnique({
      where: { userId: userId },
      select: { user: true },
    });
    console.log(User);
    const allowedRoles: UserRole[] = [UserRole.ASSISTANT, UserRole.MENTOR];
    if (!User || !allowedRoles.includes(User.user.role)) {
      throw new NotFoundException('Mentor topilmadi');
    }

    return this.prisma.user.update({
      where: { id:userId },
      data: { isDeleted: true },
    });
  }
}
