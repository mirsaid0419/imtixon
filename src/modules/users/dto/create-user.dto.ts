import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  Matches,
} from 'class-validator';
import { UserRole } from '@prisma/client'; // Prisma generatsiya qilgan enum
import { ApiOperation, ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @IsString({ message: "To'liq ism matn shaklida bo'lishi kerak" })
  @IsNotEmpty({ message: "To'liq ism kiritilishi shart" })
  fullName: string;

  @IsNotEmpty({ message: 'Telefon raqami kiritilishi shart' })
  @IsString({ message: "Telefon raqami matn ko'rinishida bo'lishi kerak" })
  @Matches(
    /^(\+?998)?\s?(90|91|93|94|95|97|98|99|33|88|20)\s?\d{3}\s?\d{2}\s?\d{2}$/,
    {
      message:
        "Telefon raqami noto'g'ri shaklda. Namuna: +99895 111 11 11 yoki 95 111 11 11",
    },
  )
  phone: string;

  @IsString()
  @MinLength(6, { message: "Parol kamida 6 ta belgidan iborat bo'lishi kerak" })
  @IsNotEmpty({ message: 'Parol kiritilishi shart' })
  password: string;

  @IsEnum(UserRole, { message: "Noto'g'ri foydalanuvchi roli tanlandi" })
  @IsOptional() // Standart qiymat STUDENT bo'lgani uchun ixtiyoriy
  role?: UserRole;
}

export class FindAllUsersDto {
  @ApiProperty({
    required: false,
    default: 'false',
    description:
      "O'chirilgan foydalanuvchilarni ham ko'rish uchun 'true' yuboring",
  })
  @IsOptional() // BU ENG MUHIMI: ValidationPipe buni ko'rib, xato bermaydi
  @IsString()
  isDeleted?: string = 'false';
}