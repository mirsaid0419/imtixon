import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateProfileDto, UpdateUserByAdminDto } from './dto/update-user.dto';
import { PrismaService } from 'src/core/database/prisma.service';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) { }
  async findAll(isDeleted: boolean) {
    return {
      success: true,
      data: await this.prisma.user.findMany({
        where: { isDeleted: isDeleted ? undefined : false },
        select: {
          id: true,
          fullName: true,
          phone: true,
          role: true,
          image: true,
          isDeleted: true,
        },
      }),
    };
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        mentorProfile: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`ID: ${id} bo'lgan foydalanuvchi topilmadi`);
    }

    const { password, ...result } = user;
    return result;
  }

  async updateProfile(id: number, dto: UpdateProfileDto) {
    // Multipart'dan kelgan bo'sh stringlarni tozalash
    Object.keys(dto).forEach((key) => {
      if (dto[key] === '') {
        dto[key] = undefined;
      }
    });

    const updateData: any = { ...dto };

    if (dto.password) {
      updateData.password = await bcrypt.hash(dto.password, 10);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    const { password, ...result } = updatedUser;
    return result;
  }

  async updateUserByAdmin(id: number, dto: UpdateUserByAdminDto) {
    // Multipart'dan kelgan bo'sh stringlarni tozalash
    Object.keys(dto).forEach((key) => {
      if (dto[key] === '') {
        dto[key] = undefined;
      }
    });

    if (dto.phone) {
      const cleanPhone = dto.phone.replace(/\D/g, '');
      dto.phone = cleanPhone.length === 9 ? `998${cleanPhone}` : cleanPhone;
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: dto,
    });

    const { password, ...result } = updatedUser;
    return result;
  }

  async softDelete(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('Foydalanuvchi topilmadi');
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        isDeleted: true,
      },
    });
  }
}
