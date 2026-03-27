import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) { }
  canActivate(context: ExecutionContext): boolean {
    // const Roles: string[] = this.reflector.get('roles', context.getHandler());
    const Roles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!Roles) {
      return true;
    }

    const req = context.switchToHttp().getRequest();
    const user = req.user;

    if (!user) {
      throw new ForbiddenException('Foydalanuvchi aniqlanmadi');
    }

    if (user.isDeleted) {
      throw new ForbiddenException("Hisobingiz o'chirilgan yoki faol emas.");
    }

    // Foydalanuvchi roli ruxsat etilgan rollar ichida bormi?
    if (Roles.includes(user.role)) {
      return true;
    }

    throw new ForbiddenException('Sizda bunday huquq mavjud emas');
  }
}
