import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { PrismaService } from 'src/core/database/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/create-auth.dto';
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) { }
  async register(
    createUserDto: CreateUserDto,
    uploadResult: { url: string; publicId: string },
  ) {
    // Raqamdan hamma narsani olib tashlab, faqat raqamlarni qoldiramiz
    const cleanPhone = createUserDto.phone.replace(/\D/g, '');

    // Agar foydalanuvchi 998 siz yozgan bo'lsa, uni qo'shib qo'yamiz
    const finalPhone =
      cleanPhone.length === 9 ? `998${cleanPhone}` : cleanPhone;

    const existPhone = await this.prisma.user.findFirst({
      where: { phone: finalPhone },
    });
    if (existPhone) {
      throw new ConflictException('Phone number already found');
    }
    const data = await this.prisma.user.create({
      data: {
        ...createUserDto,
        image: uploadResult?.url || null,
        publicId: uploadResult?.publicId || null,
        password: await bcrypt.hash(createUserDto.password, 10),
        phone: finalPhone,
      },
      select: {
        id: true,
        fullName: true,
        image: true,
        role: true,
        publicId: true,
      },
    });
    return { success: true, token: await this.jwtService.signAsync(data) };
  }

  async login(loginDto: LoginDto) {
    // Raqamdan hamma narsani olib tashlab, faqat raqamlarni qoldiramiz
    const cleanPhone = loginDto.phone.replace(/\D/g, '');

    // Agar foydalanuvchi 998 siz yozgan bo'lsa, uni qo'shib qo'yamiz
    const finalPhone =
      cleanPhone.length === 9 ? `998${cleanPhone}` : cleanPhone;

    let existUser = await this.prisma.user.findFirst({
      where: { phone: finalPhone },
      select: {
        id: true,
        fullName: true,
        image: true,
        role: true,
        publicId: true,
        password: true,
      },
    });
    if (!existUser) {
      throw new NotFoundException('Phone number or password error');
    }
    if (await bcrypt.compare(loginDto.password, existUser.password)) {
      const { password, publicId, ...returningData } = existUser;
      return {
        success: true,
        token: await this.jwtService.signAsync(returningData),
      };
    } else {
      throw new NotFoundException('Phone number or password error');
    }
  }
}
