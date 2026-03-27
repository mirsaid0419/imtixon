import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/core/database/prisma.service';

@Injectable()
export class TokenGuard implements CanActivate {
  constructor(
    private config: ConfigService,
    private jwt: JwtService,
    private prisma: PrismaService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const req = context.switchToHttp().getRequest();
      let token = req.headers.authorization;

      if (!token && req.query.token) {
        token = `Bearer ${req.query.token}`;
      }

      if (!token || !token.startsWith('Bearer ')) {
        throw new UnauthorizedException('Token mavjud emas yoki buzilgan');
      }
      const payload = await this.jwt.verifyAsync(token.split(' ')[1], {
        secret: this.config.get('JWT_SECRET'),
      });

      // Ma'lumotlar bazasidan userning oxirgi holatini (isActive) tekshiramiz
      const user = await this.prisma.user.findUnique({
        where: { id: payload.id },
        select: {
          id: true,
          fullName: true,
          role: true,
          image: true,
          isDeleted: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('Foydalanuvchi topilmadi');
      }

      if (user.isDeleted) {
        throw new UnauthorizedException("Foydalanuvchi o'chirilgan");
      }

      req['user'] = user;
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Token mavjud emas yoki buzilgan');
    }
  }
}
