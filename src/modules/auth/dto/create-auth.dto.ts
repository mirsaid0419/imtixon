import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty()
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
  
  @ApiProperty()
  @IsString()
  @MinLength(6, { message: "Parol kamida 6 ta belgidan iborat bo'lishi kerak" })
  @IsNotEmpty({ message: 'Parol kiritilishi shart' })
  password: string;
}
